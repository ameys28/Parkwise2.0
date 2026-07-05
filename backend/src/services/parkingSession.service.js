import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizePlate } from '../utils/normalize.js';

const getOrCreateVehicle = async (numberPlate, userId) => {
  const plate = normalizePlate(numberPlate);
  let vehicle = await prisma.vehicle.findUnique({ where: { numberPlate: plate } });

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        numberPlate: plate,
        guest: true,
        ownerId: userId || null,
      },
    });
  }

  return vehicle;
};

export const recordParkingEvent = async ({ numberPlate, action, notes }, userId) => {
  const plate = normalizePlate(numberPlate);
  if (!plate) {
    throw new ApiError(400, 'numberPlate is required');
  }

  const vehicle = await getOrCreateVehicle(plate, userId);

  return prisma.$transaction(async (tx) => {
    let session = null;

    if (action === 'Entry') {
      // Check for active booking
      const activeBooking = await tx.booking.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: 'BOOKED',
        },
      });

      let slotId = null;
      let bookingId = null;

      if (activeBooking) {
        slotId = activeBooking.slotId;
        bookingId = activeBooking.id;

        // Update booking status to COMPLETED
        await tx.booking.update({
          where: { id: activeBooking.id },
          data: { status: 'COMPLETED' },
        });

        // Update slot status to OCCUPIED
        await tx.parkingSlot.update({
          where: { id: activeBooking.slotId },
          data: { status: 'OCCUPIED' },
        });
      } else {
        // Find first available slot
        const availableSlot = await tx.parkingSlot.findFirst({
          where: { status: 'AVAILABLE', isActive: true },
          orderBy: { slotNumber: 'asc' },
        });

        if (!availableSlot) {
          throw new ApiError(409, 'No available parking slots');
        }

        slotId = availableSlot.id;

        // Update slot status to OCCUPIED
        await tx.parkingSlot.update({
          where: { id: availableSlot.id },
          data: { status: 'OCCUPIED' },
        });
      }

      session = await tx.parkingSession.create({
        data: {
          vehicleId: vehicle.id,
          actorId: userId || null,
          status: 'ACTIVE',
          slotId,
          bookingId,
        },
      });
    } else {
      session = await tx.parkingSession.findFirst({
        where: { vehicleId: vehicle.id, status: 'ACTIVE' },
        orderBy: { entryTime: 'desc' },
      });

      if (session) {
        session = await tx.parkingSession.update({
          where: { id: session.id },
          data: {
            status: 'CLOSED',
            exitTime: new Date(),
          },
        });

        if (session.slotId) {
          // Free up the slot
          await tx.parkingSlot.update({
            where: { id: session.slotId },
            data: { status: 'AVAILABLE' },
          });
        }
      }
    }

    const log = await tx.parkingLog.create({
      data: {
        vehicleId: vehicle.id,
        sessionId: session?.id || null,
        action: action === 'Entry' ? 'ENTRY' : 'EXIT',
        notes: notes || null,
      },
      include: {
        vehicle: true,
        session: {
          include: {
            slot: true,
          },
        },
      },
    });

    return log;
  });
};

export const listLogs = async () =>
  prisma.parkingLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: {
      vehicle: true,
      session: true,
    },
  });

export const getOccupancySummary = async () => {
  const occupancy = await prisma.parkingSession.count({
    where: { status: 'ACTIVE' },
  });

  return {
    occupancy,
    totalSpots: env.totalSpots,
    availableSpots: Math.max(env.totalSpots - occupancy, 0),
  };
};
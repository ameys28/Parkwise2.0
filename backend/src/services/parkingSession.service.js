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
      session = await tx.parkingSession.create({
        data: {
          vehicleId: vehicle.id,
          actorId: userId || null,
          status: 'ACTIVE',
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
        session: true,
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
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const listBookings = async ({ user }) => {
  const where = user.role === 'ADMIN' ? {} : { userId: user.id };

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, fullName: true } },
      vehicle: true,
      slot: true,
    },
  });
};

export const createBooking = async ({ user, vehicleId, slotId, slotNumber, userId, startTime, endTime }) => {
  const targetUserId = user.role === 'ADMIN' ? (userId || user.id) : user.id;

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, ownerId: true },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (user.role !== 'ADMIN' && vehicle.ownerId !== user.id) {
      throw new ApiError(403, 'You can only book slots for your own vehicles');
    }

    const slot = slotId
      ? await tx.parkingSlot.findUnique({ where: { id: slotId } })
      : await tx.parkingSlot.findUnique({ where: { slotNumber: String(slotNumber || '').trim().toUpperCase() } });
    if (!slot) {
      throw new ApiError(404, 'Parking slot not found');
    }

    if (slot.status !== 'AVAILABLE') {
      throw new ApiError(409, 'Parking slot is not available');
    }

    await tx.parkingSlot.update({
      where: { id: slot.id },
      data: { status: 'RESERVED' },
    });

    return tx.booking.create({
      data: {
        userId: targetUserId,
        vehicleId,
        slotId: slot.id,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        status: 'BOOKED',
      },
    });
  });
};

export const cancelBooking = async (bookingId, user) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (user.role !== 'ADMIN' && booking.userId !== user.id) {
    throw new ApiError(403, 'You cannot modify this booking');
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });

  await prisma.parkingSlot.update({
    where: { id: booking.slotId },
    data: { status: 'AVAILABLE' },
  });

  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      vehicle: true,
      slot: true,
    },
  });
};
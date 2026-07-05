import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizePlate } from '../utils/normalize.js';

export const listVehicles = async ({ ownerId, user }) => {
  const where = user.role === 'ADMIN'
    ? (ownerId ? { ownerId } : {})
    : { ownerId: user.id };

  return prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, username: true, fullName: true, role: true },
      },
    },
  });
};

export const createVehicle = async ({ numberPlate, ownerId, guest }, user) => {
  const plate = normalizePlate(numberPlate);
  const resolvedOwnerId = user.role === 'ADMIN'
    ? (ownerId || null)
    : user.id;

  if (!plate) {
    throw new ApiError(400, 'numberPlate is required');
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      numberPlate: plate,
      ownerId: resolvedOwnerId,
      guest: Boolean(guest),
    },
  });

  return vehicle;
};

export const deleteVehicle = async (vehicleId, user) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  if (user.role !== 'ADMIN' && vehicle.ownerId !== user.id) {
    throw new ApiError(403, 'You cannot delete this vehicle');
  }

  return prisma.vehicle.delete({ where: { id: vehicleId } });
};
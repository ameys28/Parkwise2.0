import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const DEFAULT_SLOT_COUNT = Number(process.env.TOTAL_SPOTS || 20);

const buildDefaultSlots = () =>
  Array.from({ length: DEFAULT_SLOT_COUNT }, (_, index) => ({
    slotNumber: `P-${String(index + 1).padStart(2, '0')}`,
    level: index < Math.ceil(DEFAULT_SLOT_COUNT / 2) ? 'L1' : 'L2',
    status: 'AVAILABLE',
  }));

const ensureSeedSlots = async () => {
  const existingCount = await prisma.parkingSlot.count();
  if (existingCount > 0) {
    return;
  }

  await prisma.parkingSlot.createMany({
    data: buildDefaultSlots(),
    skipDuplicates: true,
  });
};

export const listSlots = async () =>
  {
    await ensureSeedSlots();

    return prisma.parkingSlot.findMany({
    orderBy: { slotNumber: 'asc' },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  };

export const createSlot = async ({ slotNumber, level, status }) => {
  if (!slotNumber) {
    throw new ApiError(400, 'slotNumber is required');
  }

  return prisma.parkingSlot.create({
    data: {
      slotNumber,
      level: level || null,
      status: status || 'AVAILABLE',
    },
  });
};

export const updateSlot = async (slotId, data) =>
  prisma.parkingSlot.update({
    where: { id: slotId },
    data,
  });
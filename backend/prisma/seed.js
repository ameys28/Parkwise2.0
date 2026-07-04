import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const totalSpots = Number(process.env.TOTAL_SPOTS || 20);
const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

async function main() {
  const [adminHash, residentHash, securityHash] = await Promise.all([
    bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', rounds),
    bcrypt.hash(process.env.SEED_RESIDENT_PASSWORD || 'Resident@12345', rounds),
    bcrypt.hash(process.env.SEED_SECURITY_PASSWORD || 'Security@12345', rounds),
  ]);

  const admin = await prisma.user.upsert({
    where: { username: process.env.SEED_ADMIN_USERNAME || 'admin' },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      username: process.env.SEED_ADMIN_USERNAME || 'admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      fullName: 'ParkWise Admin',
    },
  });

  const resident = await prisma.user.upsert({
    where: { username: process.env.SEED_RESIDENT_USERNAME || 'resident' },
    update: { passwordHash: residentHash, role: 'USER' },
    create: {
      username: process.env.SEED_RESIDENT_USERNAME || 'resident',
      passwordHash: residentHash,
      role: 'USER',
      fullName: 'ParkWise Resident',
    },
  });

  await prisma.user.upsert({
    where: { username: process.env.SEED_SECURITY_USERNAME || 'security' },
    update: { passwordHash: securityHash, role: 'ADMIN' },
    create: {
      username: process.env.SEED_SECURITY_USERNAME || 'security',
      passwordHash: securityHash,
      role: 'ADMIN',
      fullName: 'ParkWise Security',
    },
  });

  const slots = Array.from({ length: totalSpots }, (_, index) => ({
    slotNumber: `P-${String(index + 1).padStart(2, '0')}`,
    level: index < Math.ceil(totalSpots / 2) ? 'L1' : 'L2',
  }));

  for (const slot of slots) {
    await prisma.parkingSlot.upsert({
      where: { slotNumber: slot.slotNumber },
      update: { level: slot.level, isActive: true },
      create: slot,
    });
  }

  const vehicle = await prisma.vehicle.upsert({
    where: { numberPlate: 'ABC123' },
    update: { ownerId: resident.id, guest: false },
    create: {
      numberPlate: 'ABC123',
      ownerId: resident.id,
      guest: false,
    },
  });

  const firstSlot = await prisma.parkingSlot.findFirst({ where: { slotNumber: 'P-01' } });

  if (firstSlot) {
    await prisma.booking.upsert({
      where: { id: 'seed-booking-1' },
      update: {},
      create: {
        id: 'seed-booking-1',
        userId: resident.id,
        vehicleId: vehicle.id,
        slotId: firstSlot.id,
        status: 'BOOKED',
      },
    });
  }

  console.log(`Seeded ParkWise with ${totalSpots} slots, sample users, and a demo booking.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
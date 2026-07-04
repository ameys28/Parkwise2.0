import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

const totalSpots = Number(process.env.TOTAL_SPOTS || 20);
const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

const seedUsers = async () => {
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

  return { admin, resident };
};

const seedSlots = async () => {
  const existingCount = await prisma.parkingSlot.count();
  if (existingCount > 0) {
    return;
  }

  const slots = Array.from({ length: totalSpots }, (_, index) => ({
    slotNumber: `P-${String(index + 1).padStart(2, '0')}`,
    level: index < Math.ceil(totalSpots / 2) ? 'L1' : 'L2',
    status: 'AVAILABLE',
  }));

  await prisma.parkingSlot.createMany({
    data: slots,
    skipDuplicates: true,
  });
};

export const bootstrapDemoData = async () => {
  await seedUsers();
  await seedSlots();
};
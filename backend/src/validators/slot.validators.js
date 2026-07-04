import { z } from 'zod';

export const slotSchema = z.object({
  slotNumber: z.string().trim().min(1).max(20),
  level: z.string().trim().max(20).optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE']).optional(),
});

export const slotUpdateSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE']),
  isActive: z.boolean().optional(),
});
import { z } from 'zod';

export const vehicleSchema = z.object({
  numberPlate: z.string().trim().min(2).max(20),
  ownerId: z.string().trim().nullable().optional(),
  guest: z.boolean().optional().default(false),
});
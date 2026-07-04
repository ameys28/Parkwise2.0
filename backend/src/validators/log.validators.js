import { z } from 'zod';

export const logSchema = z.object({
  numberPlate: z.string().trim().min(2).max(20),
  action: z.enum(['Entry', 'Exit']),
  notes: z.string().trim().max(250).optional(),
});
import { z } from 'zod';

export const bookingSchema = z.object({
  vehicleId: z.string().trim().min(1),
  slotId: z.string().trim().min(1).optional(),
  slotNumber: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine((data) => Boolean(data.slotId || data.slotNumber), {
  message: 'slotId or slotNumber is required',
  path: ['slotId'],
});
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', details: err.flatten() });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with the same unique value already exists.' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ message: 'Requested resource was not found.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    message,
    details: err.details,
  });
};
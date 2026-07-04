import { asyncHandler } from '../utils/asyncHandler.js';
import { getOccupancySummary } from '../services/parkingSession.service.js';

export const getOccupancy = asyncHandler(async (_req, res) => {
  const summary = await getOccupancySummary();
  res.status(200).json(summary);
});
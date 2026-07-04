import { asyncHandler } from '../utils/asyncHandler.js';
import { createSlot, listSlots, updateSlot } from '../services/slot.service.js';

export const getSlots = asyncHandler(async (_req, res) => {
  const slots = await listSlots();
  res.status(200).json(slots);
});

export const postSlot = asyncHandler(async (req, res) => {
  const slot = await createSlot(req.body);
  res.status(201).json(slot);
});

export const patchSlot = asyncHandler(async (req, res) => {
  const slot = await updateSlot(req.params.slotId, req.body);
  res.status(200).json(slot);
});
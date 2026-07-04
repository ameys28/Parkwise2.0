import { asyncHandler } from '../utils/asyncHandler.js';
import { createVehicle, listVehicles } from '../services/vehicle.service.js';

export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await listVehicles({ ownerId: req.query.ownerId, user: req.user });
  res.status(200).json(vehicles);
});

export const postVehicle = asyncHandler(async (req, res) => {
  const vehicle = await createVehicle(req.body, req.user);
  res.status(201).json(vehicle);
});
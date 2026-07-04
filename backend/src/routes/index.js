import { Router } from 'express';
import authRoutes from './auth.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import logRoutes from './log.routes.js';
import occupancyRoutes from './occupancy.routes.js';
import slotRoutes from './slot.routes.js';
import bookingRoutes from './booking.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/logs', logRoutes);
router.use('/occupancy', occupancyRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);

export default router;
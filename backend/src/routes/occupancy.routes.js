import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getOccupancy } from '../controllers/occupancy.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getOccupancy);

export default router;
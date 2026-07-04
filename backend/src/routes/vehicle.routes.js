import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { vehicleSchema } from '../validators/vehicle.validators.js';
import { getVehicles, postVehicle } from '../controllers/vehicle.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getVehicles);
router.post('/', validate(vehicleSchema), postVehicle);

export default router;
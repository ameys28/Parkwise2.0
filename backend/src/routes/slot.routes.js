import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { slotSchema, slotUpdateSchema } from '../validators/slot.validators.js';
import { getSlots, patchSlot, postSlot } from '../controllers/slot.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getSlots);
router.post('/', authorize('ADMIN'), validate(slotSchema), postSlot);
router.patch('/:slotId', authorize('ADMIN'), validate(slotUpdateSchema), patchSlot);

export default router;
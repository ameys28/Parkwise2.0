import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { logSchema } from '../validators/log.validators.js';
import { getLogs, postLog } from '../controllers/log.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getLogs);
router.post('/', validate(logSchema), postLog);

export default router;
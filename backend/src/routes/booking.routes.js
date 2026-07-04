import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { bookingSchema } from '../validators/booking.validators.js';
import { cancelBookingById, getBookings, postBooking } from '../controllers/booking.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getBookings);
router.post('/', validate(bookingSchema), postBooking);
router.patch('/:bookingId/cancel', cancelBookingById);

export default router;
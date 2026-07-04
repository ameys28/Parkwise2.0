import { asyncHandler } from '../utils/asyncHandler.js';
import { cancelBooking, createBooking, listBookings } from '../services/booking.service.js';

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await listBookings({ user: req.user });
  res.status(200).json(bookings);
});

export const postBooking = asyncHandler(async (req, res) => {
  const booking = await createBooking({ ...req.body, user: req.user });
  res.status(201).json(booking);
});

export const cancelBookingById = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.params.bookingId, req.user);
  res.status(200).json(booking);
});
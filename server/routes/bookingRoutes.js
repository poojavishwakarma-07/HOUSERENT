const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getBookings)
  .post(protect, authorize('tenant'), createBooking);

router.route('/:id').put(protect, authorize('owner', 'admin'), updateBookingStatus);

module.exports = router;

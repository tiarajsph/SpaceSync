// ===== bookingRoutes.js (Updated) =====
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Public reads
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/', authorize('admin'), bookingController.getAllBookings);

// Club leads can book
router.post('/book', authorize('club_lead', 'admin'), bookingController.bookRoom);

// Cancel own bookings or admin cancels any
router.delete('/:bookingId', bookingController.cancelBooking);

// Class reps mark rooms free
router.post('/mark-free', 
  authorize('verified_rep', 'admin'), 
  bookingController.markRoomFree
);

module.exports = router;
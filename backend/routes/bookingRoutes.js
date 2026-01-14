const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.delete('/:id', bookingController.deleteBooking);
router.post('/book', bookingController.bookRoom);


module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const bookingCtl = require('../controllers/bookingController');

// User routes (protected)
router.post('/', auth, authorize('user','admin'), bookingCtl.createBooking); // users & admins can create
router.get('/', auth, bookingCtl.getBookings);
router.put('/:id', auth, authorize('user','admin'), bookingCtl.updateBooking); // update (owner only enforced in controller)
router.delete('/:id', auth, authorize('user','admin'), bookingCtl.cancelBooking); // users cancel own; admins use delete

// Admin-only routes
router.patch('/:id/approve', auth, authorize('admin'), bookingCtl.approveBooking);
router.patch('/:id/reject', auth, authorize('admin'), bookingCtl.rejectBooking);
router.delete('/:id', auth, authorize('admin'), bookingCtl.deleteBooking); // admin delete

module.exports = router;

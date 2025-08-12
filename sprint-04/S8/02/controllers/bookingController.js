const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.createBooking = async (req, res) => {
  try {
    const { serviceName, requestedAt, notes } = req.body;
    if (!serviceName || !requestedAt) return res.status(400).json({ message: 'Missing fields' });

    const booking = await Booking.create({
      serviceName,
      requestedAt: new Date(requestedAt),
      user: req.user.id,
      notes
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const all = await Booking.find().populate('user', 'username email').sort({ requestedAt: -1 });
      return res.json(all);
    } else {
      const mine = await Booking.find({ user: req.user.id }).sort({ requestedAt: -1 });
      return res.json(mine);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // only owner can update and only if pending
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not owner' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Cannot update after approval/rejection' });

    const { serviceName, requestedAt, notes } = req.body;
    if (serviceName) booking.serviceName = serviceName;
    if (requestedAt) booking.requestedAt = new Date(requestedAt);
    if (notes) booking.notes = notes;

    await booking.save();
    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // users can cancel their own pending bookings
    if (req.user.role === 'user') {
      if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not owner' });
      if (booking.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel after approval/rejection' });
      booking.status = 'cancelled';
      await booking.save();
      return res.json({ message: 'Booking cancelled', booking });
    }

    // admins can delete? but this endpoint is for users; admins use admin endpoints below
    return res.status(403).json({ message: 'Admins should use admin endpoints' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin actions
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'approved';
    await booking.save();
    res.json({ message: 'Booking approved', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'rejected';
    await booking.save();
    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

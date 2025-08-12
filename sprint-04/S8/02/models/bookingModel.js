const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  requestedAt: { type: Date, required: true }, // requested date/time
  status: { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

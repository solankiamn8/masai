const mongoose = require('mongoose');

const attendeeSubSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
  status: { type: String, enum: ['booked', 'attended', 'cancelled'], default: 'booked' },
  feedback: String,
  attendedAt: Date
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  topic: { type: String, required: true },
  startTime: { type: Date, required: true },
  durationMinutes: Number,
  notes: String,
  attendees: [attendeeSubSchema],
  isActive: { type: Boolean, default: true },     // soft delete for sessions
  isArchived: { type: Boolean, default: false },  // archive flag
  createdAt: { type: Date, default: Date.now }
});

// Index to quickly find upcoming active sessions
sessionSchema.index({ mentorId: 1, startTime: 1, isActive: 1, isArchived: 1 });

module.exports = mongoose.model('Session', sessionSchema);

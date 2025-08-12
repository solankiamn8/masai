const mongoose = require('mongoose');

const blackSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true },
  type: { type: String, enum: ['access','refresh'], required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BlacklistedToken', blackSchema);

const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free','premium','pro'] },
  startAt: Date,
  expiresAt: Date,
  amount: Number
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subSchema);

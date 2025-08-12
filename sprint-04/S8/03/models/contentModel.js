const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: String,
  body: String,
  type: { type: String, enum: ['free','premium'], default: 'free' }, // access level
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);

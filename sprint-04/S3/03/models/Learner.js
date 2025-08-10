const mongoose = require('mongoose');

const learnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Learner', learnerSchema);

const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, default: 'available' }, // available | borrowed | reserved
  borrowerName: String,
  borrowDate: Date,
  dueDate: Date,
  returnDate: Date,
  overdueFees: { type: Number, default: 0 }
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;

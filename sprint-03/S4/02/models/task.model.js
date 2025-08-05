const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  priority: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completionDate: { type: Date },
  dueDate: { type: Date }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

const Task = require('../models/task.model');

// POST /tasks - Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const newTask = new Task({ title, description, priority, dueDate });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /tasks - Retrieve tasks (optional filter)
const getTasks = async (req, res) => {
  const filter = {};
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.status === 'completed') filter.isCompleted = true;
  if (req.query.status === 'pending') filter.isCompleted = false;

  try {
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /tasks/:id - Update task
const updateTask = async (req, res) => {
  try {
    const updateData = {};
    const { title, description, priority, isCompleted } = req.body;

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      updateData.priority = priority;
    }

    if (isCompleted === true) {
      updateData.isCompleted = true;
      updateData.completionDate = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /tasks - Bulk delete by priority
const deleteTasks = async (req, res) => {
  const { priority } = req.query;
  if (!priority) {
    return res.status(400).json({ error: 'Priority filter is required for deletion' });
  }

  try {
    const result = await Task.deleteMany({ priority });
    res.json({ message: `${result.deletedCount} task(s) deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTasks
};

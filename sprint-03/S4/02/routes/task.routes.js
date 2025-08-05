const express = require('express');
const router = express.Router();
const { validateTask } = require('../middleware/task.middleware');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTasks
} = require('../controllers/task.controller');

// POST - Create with validation
router.post('/tasks', validateTask, createTask);

// GET - Retrieve tasks with optional filter
router.get('/tasks', getTasks);

// PATCH - Update with validation
router.patch('/tasks/:id', validateTask, updateTask);

// DELETE - Bulk delete by priority
router.delete('/tasks', deleteTasks);

module.exports = router;

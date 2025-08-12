const express = require('express');
const Note = require('../models/noteModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = new Note({ title, content, createdBy: req.user.id });
    await note.save();
    res.status(201).json({ message: "✅ Note created", note });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// Get User's Notes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// Update Note (only if owner)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ message: "❌ Note not found" });

    note.title = req.body.title ?? note.title;
    note.content = req.body.content ?? note.content;
    await note.save();

    res.json({ message: "✅ Note updated", note });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// Delete Note (only if owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ message: "❌ Note not found" });

    res.json({ message: "✅ Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

module.exports = router;

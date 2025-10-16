const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add address to a user
router.post('/users/:userId/address', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get summary
router.get('/users/summary', async (req, res) => {
  try {
    const users = await User.find();
    const totalUsers = users.length;
    const totalAddresses = users.reduce((acc, user) => acc + user.addresses.length, 0);
    const userSummary = users.map(u => ({
      name: u.name,
      addressCount: u.addresses.length
    }));
    res.json({ totalUsers, totalAddresses, userSummary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID with addresses
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// BONUS: Delete an address by index
router.delete('/users/:userId/address/:index', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = parseInt(req.params.index);
    if (index < 0 || index >= user.addresses.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    user.addresses.splice(index, 1);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

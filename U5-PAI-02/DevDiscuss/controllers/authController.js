const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.create({ username, email, password, role });
    const token = signToken(user._id);
    res.status(201).json({
      message: 'User registered',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(400).json({ message: 'Login failed', error: err.message });
  }
};

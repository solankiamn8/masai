require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const connectDB = require('./config/db');
require('./config/passport');

const app = express();

// Connect to DB
connectDB();

// Middlewares
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub Login Route
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token as response (in real apps, redirect with token in query)
    res.json({ message: '✅ Login successful', token });
  }
);

// Failure route
app.get('/login-failed', (req, res) => {
  res.status(401).json({ message: '❌ GitHub login failed' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

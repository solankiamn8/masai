const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: role === 'admin' ? 'admin' : 'user' });

    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refresh token server-side for revocation
    const decodedRefresh = jwt.decode(refreshToken);
    const expiresAt = new Date(decodedRefresh.exp * 1000);
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token provided' });

    // verify stored token exists
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });

    // verify token signature
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // remove token if invalid/expired
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    // replace old refresh token
    await RefreshToken.deleteOne({ token: refreshToken });
    const newDecoded = jwt.decode(newRefresh);
    await RefreshToken.create({ user: user._id, token: newRefresh, expiresAt: new Date(newDecoded.exp * 1000) });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// optional: logout (revoke refresh token)
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

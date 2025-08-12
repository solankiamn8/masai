const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const signAccess = (user) => jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
const signRefresh = (user) => jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });

exports.signup = async (req,res) => {
  try {
    const { username, email, password } = req.body;
    if (!username||!email||!password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email in use' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.login = async (req,res) => {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    // return tokens (optionally persist refresh somewhere or blacklist on logout)
    res.json({ accessToken, refreshToken });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.logout = async (req,res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    // blacklist provided tokens (client should send them)
    const toSave = [];
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      const exp = decoded?.exp ? new Date(decoded.exp*1000) : new Date(Date.now()+15*60*1000);
      toSave.push({ token: accessToken, type: 'access', expiresAt: exp });
    }
    if (refreshToken) {
      const decodedR = jwt.decode(refreshToken);
      const expR = decodedR?.exp ? new Date(decodedR.exp*1000) : new Date(Date.now()+7*24*3600*1000);
      toSave.push({ token: refreshToken, type: 'refresh', expiresAt: expR });
    }
    if (toSave.length) await BlacklistedToken.insertMany(toSave);
    return res.json({ message: 'Logged out (tokens blacklisted)' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.refresh = async (req,res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });

    // check blacklist
    const found = await BlacklistedToken.findOne({ token: refreshToken, type: 'refresh' });
    if (found) return res.status(401).json({ message: 'Refresh token blacklisted' });

    // verify
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAccess = signAccess(user);
    const newRefresh = signRefresh(user);

    // blacklist old refresh token (prevent reuse)
    await BlacklistedToken.create({ token: refreshToken, type: 'refresh', expiresAt: new Date(payload.exp*1000) });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

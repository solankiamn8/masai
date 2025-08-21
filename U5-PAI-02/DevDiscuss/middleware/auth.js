const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token user' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid/Expired token', error: err.message });
  }
};

const moderatorMiddleware = (req, res, next) => {
  if (req.user?.role !== 'Moderator') {
    return res.status(403).json({ message: 'Moderator role required' });
  }
  next();
};

module.exports = { authMiddleware, moderatorMiddleware };

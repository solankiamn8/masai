const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('./checkBlacklist');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    // check blacklist
    if (await isBlacklisted(token, 'access')) {
      return res.status(401).json({ message: 'Token blacklisted' });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;

const BlacklistedToken = require('../models/BlacklistedToken');

const isBlacklisted = async (token, type) => {
  if (!token) return false;
  const found = await BlacklistedToken.findOne({ token, type });
  return !!found;
};

module.exports = { isBlacklisted };

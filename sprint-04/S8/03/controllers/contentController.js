const Content = require('../models/Content');
const User = require('../models/User');

// Create content (admin)
exports.create = async (req,res) => {
  try {
    const { title, body, type } = req.body;
    const content = await Content.create({ title, body, type, createdBy: req.user.id });
    res.status(201).json(content);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Delete content (admin)
exports.remove = async (req,res) => {
  try {
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get free content - everyone
exports.getFree = async (req,res) => {
  try {
    const list = await Content.find({ type: 'free' });
    res.json(list);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get premium content - only premium/pro
exports.getPremium = async (req,res) => {
  try {
    // Determine user's subscription fresh (auto-downgrade if expired)
    const user = await User.findById(req.user.id);
    const sub = user.subscription || { plan: 'free' };
    if (sub.expiresAt && new Date() > new Date(sub.expiresAt)) {
      user.subscription = { plan: 'free' };
      await user.save();
      return res.status(403).json({ message: 'Subscription expired. Please renew to access premium content.' });
    }
    if (!['premium','pro'].includes(sub.plan)) return res.status(403).json({ message: 'Premium subscription required' });
    const list = await Content.find({ type: 'premium' });
    res.json(list);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const User = require('../models/User');
const Subscription = require('../models/Subscription'); // optional log

// helper: compute expiry 30 days from now
const expiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
};

exports.subscribe = async (req,res) => {
  try {
    const { plan } = req.body; // 'premium' or 'pro'
    if (!['premium','pro'].includes(plan)) return res.status(400).json({ message: 'Invalid plan' });

    // update user subscription
    const start = new Date();
    const expiresAt = expiryDate();
    const user = await User.findByIdAndUpdate(req.user.id, {
      subscription: { plan, startAt: start, expiresAt }
    }, { new: true });

    // optional subscription log
    await Subscription.create({ user: user._id, plan, startAt: start, expiresAt });

    res.json({ message: 'Subscribed', subscription: user.subscription });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.status = async (req,res) => {
  try {
    const user = await User.findById(req.user.id);
    const sub = user.subscription || { plan: 'free' };
    // if expired, auto-downgrade here:
    if (sub.expiresAt && new Date() > new Date(sub.expiresAt)) {
      // downgrade
      user.subscription = { plan: 'free' };
      await user.save();
      return res.json({ plan: 'free', message: 'Subscription expired & downgraded to free' });
    }
    res.json({ plan: sub.plan || 'free', startAt: sub.startAt, expiresAt: sub.expiresAt });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.renew = async (req,res) => {
  try {
    const { months } = req.body; // optional extension param; default 30 days
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // if already premium/pro and not expired, extend expiresAt; else start new 30-day from now
    const now = new Date();
    const base = user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > now ? new Date(user.subscription.expiresAt) : now;
    const addDays = (months ? months*30 : 30);
    const newExpires = new Date(base.getTime() + addDays*24*3600*1000);

    user.subscription = { plan: user.subscription?.plan || 'premium', startAt: user.subscription?.startAt || now, expiresAt: newExpires };
    await user.save();

    res.json({ message: 'Subscription renewed', subscription: user.subscription });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.cancel = async (req,res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.subscription = { plan: 'free' };
    await user.save();
    res.json({ message: 'Subscription canceled & downgraded to free' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

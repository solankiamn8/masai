const User = require("../models/User");

// Route 1: Add new user
exports.addUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Route 2: Add profile
exports.addProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { profileName, url } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles.push({ profileName, url });
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Route 3: Get users (+ optional filter)
exports.getUsers = async (req, res, next) => {
  try {
    const { profile } = req.query;
    let users;

    if (profile) {
      users = await User.find({ "profiles.profileName": profile });
    } else {
      users = await User.find();
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Route 4: Search by name + profile
exports.searchUserProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.query;
    const user = await User.findOne({ name });

    if (!user) return res.status(404).json({ message: "User not found" });

    const matchedProfile = user.profiles.find(p => p.profileName === profile);

    if (matchedProfile) {
      res.json({ user, profile: matchedProfile });
    } else {
      res.json({ message: "User found, but profile not found", user });
    }
  } catch (err) {
    next(err);
  }
};

// Route 5: Update profile URL
exports.updateProfile = async (req, res, next) => {
  try {
    const { userId, profileName } = req.params;
    const { url } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = user.profiles.find(p => p.profileName === profileName);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.url = url;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Route 6: Delete a profile
exports.deleteProfile = async (req, res, next) => {
  try {
    const { userId, profileName } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles = user.profiles.filter(p => p.profileName !== profileName);
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

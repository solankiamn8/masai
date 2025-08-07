const User = require("../models/User");
const Profile = require("../models/Profile");

// Add a new user
exports.addUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Add a profile for a user
exports.addProfile = async (req, res, next) => {
  try {
    const { user } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) return res.status(404).json({ message: "User not found" });

    const existingProfile = await Profile.findOne({ user });
    if (existingProfile) return res.status(400).json({ message: "Profile already exists for this user" });

    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

// Get all profiles with user info populated
exports.getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find().populate("user", "name email");
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  bio: String,
  socialMediaLinks: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // ensures one-to-one
  }
});

module.exports = mongoose.model("Profile", profileSchema);

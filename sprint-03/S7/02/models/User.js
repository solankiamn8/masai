const mongoose = require("mongoose");
const validator = require("validator");

const profileSchema = new mongoose.Schema({
  profileName: {
    type: String,
    enum: ["fb", "twitter", "github", "instagram"],
    required: [true, "Profile name is required"]
  },
  url: {
    type: String,
    required: [true, "Profile URL is required"],
    validate: {
      validator: (v) => validator.isURL(v),
      message: "Invalid URL format"
    }
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    validate: {
      validator: (v) => validator.isEmail(v),
      message: "Invalid email format"
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  profiles: [profileSchema]
});

const User = mongoose.model("User", userSchema);
module.exports = User;

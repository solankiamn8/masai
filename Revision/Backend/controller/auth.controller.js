const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "Email is already registered" });
    }
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({ message: "Hashing Failed" });
      }
      const user = new UserModel({
        name,
        email,
        password: hashedPassword,
        role,
      });
      await user.save();
      res.status(201).send({ message: "Registration Done" });
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Invalid Credentials" });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || isMatch) {
        return res.status(400).send({ message: "Invalid Credentials" });
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.send({ message: "Login success", token });
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { register, login };

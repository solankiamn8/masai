const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const { authRouter } = require("./routes/auth.routes");
dotenv.config();

const app = express();

app.use(express.json()); // built in middleware to parse JSON bodies

app.get("/", (req, res) => {
  res.send({ message: "API is Live" });
});

connectDB();

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is up and running");
});

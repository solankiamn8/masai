const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
app.use(express.json());

// Routes
app.use("/", userRoutes);

// Error handler
app.use(errorHandler);

// Connect DB & start server
connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

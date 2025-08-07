const express = require("express");
const connectDB = require("./config/db");
const vehicleRoutes = require("./routes/vehicle.routes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/", vehicleRoutes);
app.use(errorHandler);

connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

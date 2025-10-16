const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const rentalRoutes = require("./routes/rental.routes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();
app.use(express.json());

app.use("/", rentalRoutes);
app.use(errorHandler);

connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

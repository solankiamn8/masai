const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const libraryRoutes = require("./routes/library.routes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();
app.use(express.json());

app.use("/", libraryRoutes);
app.use(errorHandler);

connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

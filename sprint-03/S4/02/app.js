const express = require('express');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/task.routes');

const app = express();
app.use(express.json());

// Connect to DB
connectDB();

// Use routes
app.use('/', taskRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

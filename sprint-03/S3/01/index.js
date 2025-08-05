const express = require('express');
const rateLimit = require('express-rate-limit');
const apiRouter = require('./routes/api');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Rate limiter only for /api/limited
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many requests, please try again later." },
});

// Apply router
app.use('/api', apiRouter(limiter));

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

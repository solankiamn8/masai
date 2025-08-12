require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

connectDB();
const app = express();
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// basic health
app.get('/', (req, res) => res.send('Service Booking API'));

// global error / 404 could be added
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const contentRoutes = require('./routes/contentRoutes');

// maybe require jobs/subscriptionExpiryJob to start cron
// require('./jobs/subscriptionExpiryJob');

connectDB();
const app = express();
app.use(express.json());

// public free content could be accessible without auth, so route placed before auth middlewares
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/content', contentRoutes);

app.get('/', (req,res) => res.send('Subscription App API'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

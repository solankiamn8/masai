require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const mentorRoutes = require('./routes/mentorRoutes');
const learnerRoutes = require('./routes/learnerRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
app.use(express.json());

app.use('/mentors', mentorRoutes);
app.use('/learners', learnerRoutes);
app.use('/sessions', sessionRoutes);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, () => console.log(`Server running on ${port}`)))
  .catch(err => console.error('DB connection error', err));

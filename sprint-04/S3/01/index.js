require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

const app = express();
app.use(express.json());

app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);
app.use('/', enrollmentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error(err));

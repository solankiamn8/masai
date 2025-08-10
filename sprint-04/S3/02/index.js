require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

const app = express();
app.use(express.json());

app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/consultations', consultationRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error(err));

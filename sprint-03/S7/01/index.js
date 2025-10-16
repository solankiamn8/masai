const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/user-address-system')
  .then(() => {
    app.listen(8080, () => {
      console.log('Server running on port 8080');
    });
  })
  .catch(err => console.log(err));

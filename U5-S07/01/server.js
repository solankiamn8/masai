const express = require('express');
const app = express();
const PORT = 3000;

// Route: GET /home
app.get('/home', (req, res) => {
  res.status(200).send('<h1>Welcome to Home Page</h1>');
});

// Route: GET /aboutus
app.get('/aboutus', (req, res) => {
  res.status(200).json({ message: 'Welcome to About Us' });
});

// Route: GET /contactus
app.get('/contactus', (req, res) => {
  const contact = {
    email: 'dummy@example.com',
    phone: '+91-1234567890',
    address: '123 Main Street, City, Country'
  };
  res.status(200).json(contact);
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

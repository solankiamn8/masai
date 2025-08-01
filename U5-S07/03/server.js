const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = './db.json';

// Helper: Read Data
const readDishes = () => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data).dishes;
};

// Helper: Write Data
const writeDishes = (dishes) => {
  fs.writeFileSync(DB_PATH, JSON.stringify({ dishes }, null, 2));
};

// POST /dishes → Add a new dish
app.post('/dishes', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Missing dish details' });
  }
  const dishes = readDishes();
  const id = dishes.length > 0 ? dishes[dishes.length - 1].id + 1 : 1;
  const newDish = { id, name, price, category };
  dishes.push(newDish);
  writeDishes(dishes);
  res.status(201).json(newDish);
});

// GET /dishes → Get all dishes
app.get('/dishes', (req, res) => {
  const dishes = readDishes();
  res.status(200).json(dishes);
});

// GET /dishes/:id → Get dish by ID
app.get('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dishes = readDishes();
  const dish = dishes.find(d => d.id === id);
  if (dish) {
    res.status(200).json(dish);
  } else {
    res.status(404).json({ error: 'Dish not found' });
  }
});

// PUT /dishes/:id → Update dish by ID
app.put('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, category } = req.body;
  const dishes = readDishes();
  const index = dishes.findIndex(d => d.id === id);
  if (index !== -1) {
    dishes[index] = { id, name, price, category };
    writeDishes(dishes);
    res.status(200).json(dishes[index]);
  } else {
    res.status(404).json({ error: 'Dish not found' });
  }
});

// DELETE /dishes/:id → Delete dish by ID
app.delete('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let dishes = readDishes();
  const dish = dishes.find(d => d.id === id);
  if (dish) {
    dishes = dishes.filter(d => d.id !== id);
    writeDishes(dishes);
    res.status(200).json({ message: 'Dish deleted successfully' });
  } else {
    res.status(404).json({ error: 'Dish not found' });
  }
});

// GET /dishes/get?name= → Search dishes by name (partial match)
app.get('/dishes/get', (req, res) => {
  const searchName = req.query.name?.toLowerCase();
  if (!searchName) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }
  const dishes = readDishes();
  const filtered = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchName)
  );
  if (filtered.length > 0) {
    res.status(200).json(filtered);
  } else {
    res.status(404).json({ message: 'No dishes found' });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: '404 Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

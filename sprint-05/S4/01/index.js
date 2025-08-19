const express = require("express");
const Redis = require("ioredis");

const app = express();
const redis = new Redis(); // default localhost:6379

app.use(express.json());

// Simulated "database"
let items = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Phone" },
];

const CACHE_KEY = "items:all";

// GET /items
app.get("/items", async (req, res) => {
  try {
    const cachedData = await redis.get(CACHE_KEY);

    if (cachedData) {
      console.log("✅ Cache Hit");
      return res.json(JSON.parse(cachedData));
    }

    console.log("❌ Cache Miss - fetching from DB");
    await redis.set(CACHE_KEY, JSON.stringify(items), "EX", 60); // TTL = 60s
    return res.json(items);
  } catch (err) {
    console.error("Redis Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /items
app.post("/items", async (req, res) => {
  const newItem = { id: Date.now(), name: req.body.name };
  items.push(newItem);

  await redis.del(CACHE_KEY); // Invalidate cache
  console.log("🗑 Cache invalidated after POST");

  res.status(201).json(newItem);
});

// PUT /items/:id
app.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  let item = items.find((i) => i.id == id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.name = name;

  await redis.del(CACHE_KEY);
  console.log("🗑 Cache invalidated after PUT");

  res.json(item);
});

// DELETE /items/:id
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;

  const index = items.findIndex((i) => i.id == id);
  if (index === -1) return res.status(404).json({ error: "Item not found" });

  const deletedItem = items.splice(index, 1);

  await redis.del(CACHE_KEY);
  console.log("🗑 Cache invalidated after DELETE");

  res.json(deletedItem);
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});


import express from "express";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

/** -----------------------
 * Redis Client
 * ---------------------- */
const redis = new Redis(); // defaults to localhost:6379

/** -----------------------
 * Simulated In-Memory DB
 * ---------------------- */
// users: [{ id, username, passwordHash }]
const users = [];
// booksDB: Map<userId, Array<{id, title, author}>>
const booksDB = new Map();

/** -----------------------
 * Config / Helpers
 * ---------------------- */
const JWT_SECRET = "replace-this-with-env-secret-for-production";
const CACHE_TTL_SECONDS = 60;

// Redis key helpers
const cacheKeyBooks = (userId) => `cache:user:${userId}:books`;
const bulkQueueKey = (userId) => `bulk:user:${userId}:queue`;
const bulkUsersSet = () => `bulk:pending:users`;

// auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ensure user has books array
function ensureUserBooks(userId) {
  if (!booksDB.has(userId)) booksDB.set(userId, []);
  return booksDB.get(userId);
}

// cache invalidation
async function invalidateBooksCache(userId) {
  await redis.del(cacheKeyBooks(userId));
  console.log(`🗑 Cache invalidated for user ${userId}`);
}

/** -----------------------
 * Auth Routes
 * ---------------------- */
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    if (users.find((u) => u.username === username)) {
      return res.status(409).json({ error: "username already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), username, passwordHash };
    users.push(user);
    // init user books
    ensureUserBooks(user.id);
    res.status(201).json({ message: "Signup successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/** -----------------------
 * Books CRUD (Cached per user)
 * ---------------------- */
// GET /books (cached)
app.get("/books", auth, async (req, res) => {
  const userId = req.user.id;
  const key = cacheKeyBooks(userId);

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache Hit for user ${userId}`);
      return res.json(JSON.parse(cached));
    }

    console.log(`❌ Cache Miss for user ${userId} - fetching from DB`);
    const books = ensureUserBooks(userId);
    await redis.set(key, JSON.stringify(books), "EX", CACHE_TTL_SECONDS);
    return res.json(books);
  } catch (err) {
    console.error("Redis error:", err);
    // fallback to DB
    return res.json(ensureUserBooks(userId));
  }
});

// POST /books
app.post("/books", auth, async (req, res) => {
  const userId = req.user.id;
  const { title, author } = req.body || {};
  if (!title || !author) return res.status(400).json({ error: "title and author required" });

  const books = ensureUserBooks(userId);
  const book = { id: uuidv4(), title, author };
  books.push(book);

  await invalidateBooksCache(userId);
  res.status(201).json(book);
});

// PUT /books/:id
app.put("/books/:id", auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, author } = req.body || {};

  const books = ensureUserBooks(userId);
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "Book not found" });

  if (title) books[idx].title = title;
  if (author) books[idx].author = author;

  await invalidateBooksCache(userId);
  res.json(books[idx]);
});

// DELETE /books/:id
app.delete("/books/:id", auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const books = ensureUserBooks(userId);
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "Book not found" });

  const [deleted] = books.splice(idx, 1);
  await invalidateBooksCache(userId);
  res.json(deleted);
});

/** -----------------------
 * Bulk Insertion (Queue in Redis)
 * ---------------------- */
// POST /books/bulk
app.post("/books/bulk", auth, async (req, res) => {
  const userId = req.user.id;
  const { books } = req.body || {};
  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: "books must be a non-empty array" });
  }
  // basic validation of each entry
  for (const b of books) {
    if (!b || typeof b.title !== "string" || typeof b.author !== "string") {
      return res.status(400).json({ error: "each book requires title and author (strings)" });
    }
  }

  try {
    // Push the whole payload as one queue item (could also push per book)
    await redis.rpush(bulkQueueKey(userId), JSON.stringify(books));
    // Track that this user has pending work
    await redis.sadd(bulkUsersSet(), userId);
    console.log(`📦 Queued ${books.length} books for user ${userId}`);
    res.json({ message: "Books will be added later." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to queue bulk books" });
  }
});

/** -----------------------
 * Cron Job (every 2 minutes)
 * ---------------------- */
cron.schedule("*/2 * * * *", async () => {
  console.log("⏱️ Cron: Checking pending bulk insert queues...");
  try {
    const usersPending = await redis.smembers(bulkUsersSet());
    if (!usersPending || usersPending.length === 0) {
      console.log("⏱️ Cron: No users pending.");
      return;
    }

    for (const userId of usersPending) {
      const qKey = bulkQueueKey(userId);
      // Drain the queue (LRANGE then LTRIM), each item is a JSON array
      const items = await redis.lrange(qKey, 0, -1);
      if (!items || items.length === 0) {
        // nothing to process; remove user from set
        await redis.srem(bulkUsersSet(), userId);
        continue;
      }

      // Flatten all queued arrays of books
      const booksToInsert = [];
      for (const payload of items) {
        try {
          const arr = JSON.parse(payload);
          if (Array.isArray(arr)) {
            for (const b of arr) {
              booksToInsert.push(b);
            }
          }
        } catch {
          // skip malformed entries
        }
      }

      if (booksToInsert.length === 0) {
        // Clear queue and user marker
        await redis.del(qKey);
        await redis.srem(bulkUsersSet(), userId);
        continue;
      }

      // Insert into DB
      const books = ensureUserBooks(userId);
      for (const b of booksToInsert) {
        books.push({ id: uuidv4(), title: b.title, author: b.author });
      }

      // Clear queue and remove user from pending set
      await redis.del(qKey);
      await redis.srem(bulkUsersSet(), userId);

      // Invalidate user cache
      await invalidateBooksCache(userId);

      console.log(
        `✅ Cron: Inserted ${booksToInsert.length} books for user ${userId}. Queue cleared.`
      );
    }
  } catch (e) {
    // Do not crash the app on cron failure
    console.error("⛔ Cron error:", e);
  }
});

/** -----------------------
 * Server
 * ---------------------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

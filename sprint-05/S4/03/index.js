import express from "express";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

/** -----------------------
 * Redis Client
 * ---------------------- */
const redis = new Redis(); // defaults localhost:6379

/** -----------------------
 * Simulated In-Memory DB
 * ---------------------- */
// users: [{ id, username, email, passwordHash }]
const users = [];
// Map<userId, Array<{id, title, author}>>
const booksDB = new Map();

/** -----------------------
 * Config / Helpers
 * ---------------------- */
const JWT_SECRET = "replace-this-with-env-secret-for-production";
const CACHE_TTL_SECONDS = 60;

// Redis keys
const cacheKeyBooks = (userId) => `cache:user:${userId}:books`;
const bulkQueueKey = (userId) => `bulk:user:${userId}:queue`;
const bulkUsersSet = () => `bulk:pending:users`;

const statusKey = (userId) => `status:user:${userId}`;
const statusUsersSet = () => `status:pending:users`;

const lockKey = (name) => `lock:${name}`;
const LOCK_TTL_SEC = 60; // 1 minute safety lock

async function acquireLock(name, ttlSec = LOCK_TTL_SEC) {
  const key = lockKey(name);
  const ok = await redis.set(key, "1", "NX", "EX", ttlSec);
  return ok === "OK";
}

async function releaseLock(name) {
  await redis.del(lockKey(name));
}

// auth
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function ensureUserBooks(userId) {
  if (!booksDB.has(userId)) booksDB.set(userId, []);
  return booksDB.get(userId);
}

async function invalidateBooksCache(userId) {
  await redis.del(cacheKeyBooks(userId));
  console.log(`🗑 Cache invalidated for user ${userId}`);
}

function findUserById(id) {
  return users.find((u) => u.id === id);
}

/** -----------------------
 * Email (Nodemailer) Setup
 * ---------------------- */
let transporter;
async function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
  }

  // Dev fallback: Ethereal test account (preview URL in logs)
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
}

/** -----------------------
 * PDF Generation
 * ---------------------- */
function generateReportPdfBuffer({ userId, successCount, failureCount, processedAt }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Books Bulk Insertion Report", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`User ID: ${userId}`);
    doc.text(`Processed At: ${new Date(processedAt).toISOString()}`);
    doc.text(`Success Count: ${successCount}`);
    doc.text(`Failure Count: ${failureCount}`);
    doc.moveDown();

    doc.text(
      "This report summarizes the results of your recent bulk books insertion request. " +
      "If any failures are listed, please verify your payload formatting (title and author as strings)."
    );

    doc.end();
  });
}

/** -----------------------
 * Auth Routes
 * ---------------------- */
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body || {};
    if (!username || !password || !email) {
      return res.status(400).json({ error: "username, password, and email are required" });
    }
    if (users.find((u) => u.username === username)) {
      return res.status(409).json({ error: "username already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), username, email, passwordHash };
    users.push(user);
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
 * Books CRUD (Cached)
 * ---------------------- */
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
    res.json(books);
  } catch (err) {
    console.error("Redis error:", err);
    res.json(ensureUserBooks(userId));
  }
});

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
 * Bulk Insertion (Queue)
 * ---------------------- */
app.post("/books/bulk", auth, async (req, res) => {
  const userId = req.user.id;
  const { books } = req.body || {};
  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: "books must be a non-empty array" });
  }
  for (const b of books) {
    if (!b || typeof b.title !== "string" || typeof b.author !== "string") {
      return res.status(400).json({ error: "each book requires title and author (strings)" });
    }
  }
  try {
    await redis.rpush(bulkQueueKey(userId), JSON.stringify(books));
    await redis.sadd(bulkUsersSet(), userId);
    console.log(`📦 Queued ${books.length} books for user ${userId}`);
    res.json({ message: "Books will be added later." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to queue bulk books" });
  }
});

/** -----------------------
//  * Cron 1: Bulk Insert (*/
//  * Writes status to Redis per user after processing
//  * ---------------------- */
cron.schedule("*/2 * * * *", async () => {
  const LOCK_NAME = "bulk";
  if (!(await acquireLock(LOCK_NAME))) {
    console.log("⏱️ Cron(bulk): another instance running, skipping.");
    return;
  }
  console.log("⏱️ Cron(bulk): Checking pending queues...");
  try {
    const usersPending = await redis.smembers(bulkUsersSet());
    if (!usersPending?.length) {
      console.log("⏱️ Cron(bulk): No users pending.");
      return;
    }

    for (const userId of usersPending) {
      const qKey = bulkQueueKey(userId);
      const items = await redis.lrange(qKey, 0, -1);
      if (!items?.length) {
        await redis.srem(bulkUsersSet(), userId);
        continue;
      }

      let successCount = 0;
      let failureCount = 0;
      const toInsert = [];
      for (const payload of items) {
        try {
          const arr = JSON.parse(payload);
          if (Array.isArray(arr)) {
            for (const b of arr) {
              if (b && typeof b.title === "string" && typeof b.author === "string") {
                toInsert.push(b);
              } else {
                failureCount++;
              }
            }
          }
        } catch {
          failureCount++;
        }
      }

      const books = ensureUserBooks(userId);
      for (const b of toInsert) {
        try {
          books.push({ id: uuidv4(), title: b.title, author: b.author });
          successCount++;
        } catch {
          failureCount++;
        }
      }

      // clear queue + remove from pending
      await redis.del(qKey);
      await redis.srem(bulkUsersSet(), userId);

      // invalidate cache
      await invalidateBooksCache(userId);

      // write status record (per-user)
      const status = {
        userId,
        successCount,
        failureCount,
        processedAt: Date.now(),
      };
      await redis.set(statusKey(userId), JSON.stringify(status));
      await redis.sadd(statusUsersSet(), userId);

      console.log(
        `✅ Cron(bulk): user ${userId} — inserted ${successCount}, failed ${failureCount}. Status saved.`
      );
    }
  } catch (e) {
    console.error("⛔ Cron(bulk) error:", e);
  } finally {
    await releaseLock(LOCK_NAME);
  }
});

/** -----------------------
 * Cron 2: Report & Email (every 5 minutes)
 * Reads status, generates PDF, emails, then deletes status
 * ---------------------- */
cron.schedule("*/5 * * * *", async () => {
  const LOCK_NAME = "report";
  if (!(await acquireLock(LOCK_NAME))) {
    console.log("⏱️ Cron(report): another instance running, skipping.");
    return;
  }
  console.log("⏱️ Cron(report): Checking pending status records...");
  try {
    const pendingUsers = await redis.smembers(statusUsersSet());
    if (!pendingUsers?.length) {
      console.log("⏱️ Cron(report): No pending statuses.");
      return;
    }

    const tx = await getTransporter();

    for (const userId of pendingUsers) {
      const sKey = statusKey(userId);
      const raw = await redis.get(sKey);
      if (!raw) {
        await redis.srem(statusUsersSet(), userId);
        continue;
      }

      let status;
      try {
        status = JSON.parse(raw);
      } catch {
        console.warn(`⚠️ Cron(report): invalid status JSON for user ${userId}, dropping`);
        await redis.del(sKey);
        await redis.srem(statusUsersSet(), userId);
        continue;
      }

      const user = findUserById(userId);
      if (!user || !user.email) {
        console.warn(`⚠️ Cron(report): user ${userId} not found or missing email, dropping status`);
        await redis.del(sKey);
        await redis.srem(statusUsersSet(), userId);
        continue;
      }

      // build PDF
      const pdfBuffer = await generateReportPdfBuffer(status);

      // send email
      const fromEmail = process.env.FROM_EMAIL || "Books App <no-reply@booksapp.local>";
      const info = await tx.sendMail({
        from: fromEmail,
        to: user.email,
        subject: "Your Bulk Books Insertion Report",
        text:
          `Hello ${user.username},\n\n` +
          `Please find attached the summary of your recent bulk books insertion.\n` +
          `Success: ${status.successCount}\n` +
          `Failures: ${status.failureCount}\n` +
          `Processed At: ${new Date(status.processedAt).toISOString()}\n\n` +
          `Thanks,\nBooks App`,
        attachments: [
          {
            filename: `bulk-report-${userId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      // For Ethereal preview (dev)
      if (nodemailer.getTestMessageUrl && info) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log(`✉️  Report email preview URL: ${preview}`);
      }

      // delete status after success
      await redis.del(sKey);
      await redis.srem(statusUsersSet(), userId);
      console.log(`📨 Cron(report): Sent report & cleared status for user ${userId}`);
    }
  } catch (e) {
    console.error("⛔ Cron(report) error:", e);
  } finally {
    await releaseLock(LOCK_NAME);
  }
});

/** -----------------------
 * Server
 * ---------------------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

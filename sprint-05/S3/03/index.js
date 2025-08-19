/**
 * Dish Booking System (in-memory demo)
 *
 * - Roles: admin | user | chef
 * - Signup/Login (JWT)
 * - Admin: CRUD dishes
 * - User: create orders (auto-assign chef), list own orders
 * - Chef: view assigned orders, update order status
 * - Forgot-password & reset-password via email (nodemailer)
 * - Swagger UI at /api-docs
 *
 * NOTE: This demo uses in-memory storage (arrays & Maps). Replace with a DB for production.
 */

import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(express.json());

/* --------------------------
   Config
   -------------------------- */
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_replace_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "4h";
const FROM_EMAIL = process.env.FROM_EMAIL || '"Dish App" <no-reply@dishapp.local>';
const RESET_TTL_SECONDS = 15 * 60; // 15 minutes

/* --------------------------
   In-memory "DB"
   -------------------------- */
const users = []; // { id, name, email, passwordHash, role }
const dishes = []; // { id, name, description, price }
const orders = []; // { id, userId, dishId, status, chefId, createdAt, updatedAt }
const resetTokens = new Map(); // token -> { userId, expiresAt }

/* --------------------------
   Seed admin and chefs
   -------------------------- */
function seedUsers() {
  if (users.length) return;
  const adminPass = bcrypt.hashSync("admin123", 10);
  users.push({ id: "u-admin", name: "Admin", email: "admin@dishapp.local", passwordHash: adminPass, role: "admin" });

  const chefPass = bcrypt.hashSync("chef123", 10);
  users.push({ id: "u-chef1", name: "Chef One", email: "chef1@dishapp.local", passwordHash: chefPass, role: "chef" });
  users.push({ id: "u-chef2", name: "Chef Two", email: "chef2@dishapp.local", passwordHash: chefPass, role: "chef" });

  const userPass = bcrypt.hashSync("user123", 10);
  users.push({ id: "u-user1", name: "User One", email: "user1@dishapp.local", passwordHash: userPass, role: "user" });
}
seedUsers();

/* --------------------------
   Helpers
   -------------------------- */
function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
function findUserById(id) {
  return users.find((u) => u.id === id);
}
function generateJwt(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/* --------------------------
   Mailer (Ethereal fallback)
   -------------------------- */
let transporterPromise = null;
async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporterPromise = Promise.resolve(nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    }));
    return transporterPromise;
  }
  transporterPromise = (async () => {
    const testAcct = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAcct.smtp.host, port: testAcct.smtp.port, secure: testAcct.smtp.secure,
      auth: { user: testAcct.user, pass: testAcct.pass }
    });
  })();
  return transporterPromise;
}

/* --------------------------
   Auth middlewares
   -------------------------- */
function authMiddleware(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = findUserById(payload.id);
    if (!req.user) return res.status(401).json({ error: "Invalid token user" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
function roleGuard(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

/* --------------------------
   Rate limiter (for forgot)
   -------------------------- */
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false,
  message: "Too many requests. Try again later."
});

/* --------------------------
   Auth Routes
   -------------------------- */

/**
 * POST /auth/signup
 * body: { name, email, password, role? } - role allowed only when admin creates new user in production
 */
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });
    if (findUserByEmail(email)) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), name, email: email.toLowerCase(), passwordHash: hash, role: "user" };
    users.push(newUser);
    res.status(201).json({ message: "User created", userId: newUser.id });
  } catch (e) {
    console.error(e); res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email & password required" });
    const user = findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateJwt(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

/* --------------------------
   Forgot password & reset
   -------------------------- */
app.post("/auth/forgot-password", forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email required" });
    const user = findUserByEmail(email);
    // Always respond generically to avoid enumeration
    const generic = { message: "If that email exists, a reset link will be sent." };
    if (!user) return res.json(generic);

    const token = uuidv4();
    const expiresAt = Date.now() + RESET_TTL_SECONDS * 1000;
    resetTokens.set(token, { userId: user.id, expiresAt });

    const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${token}`;
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: FROM_EMAIL, to: user.email, subject: "Reset your password",
        text: `Reset your password: ${resetUrl} (expires in 15 minutes)`,
        html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
      });
      if (nodemailer.getTestMessageUrl && info) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log("Preview URL:", preview);
      }
    } catch (e) {
      console.error("Email send failed:", e);
    }

    res.json(generic);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.post("/auth/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "token and password required" });
    const entry = resetTokens.get(token);
    if (!entry) return res.status(400).json({ error: "Invalid or expired token" });
    if (Date.now() > entry.expiresAt) { resetTokens.delete(token); return res.status(400).json({ error: "Invalid or expired token" }); }
    const user = findUserById(entry.userId);
    if (!user) { resetTokens.delete(token); return res.status(400).json({ error: "Invalid token (user missing)" }); }
    user.passwordHash = await bcrypt.hash(password, 10);
    resetTokens.delete(token);
    res.json({ message: "Password reset successfully" });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

/* --------------------------
   Dishes (Admin-only CRUD)
   -------------------------- */
app.post("/dishes", authMiddleware, roleGuard("admin"), (req, res) => {
  const { name, description, price } = req.body || {};
  if (!name || !price) return res.status(400).json({ error: "name and price required" });
  const dish = { id: uuidv4(), name, description: description || "", price: Number(price) };
  dishes.push(dish);
  res.status(201).json(dish);
});

app.get("/dishes", authMiddleware, (req, res) => {
  res.json(dishes);
});

app.get("/dishes/:id", authMiddleware, (req, res) => {
  const d = dishes.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Dish not found" });
  res.json(d);
});

app.put("/dishes/:id", authMiddleware, roleGuard("admin"), (req, res) => {
  const d = dishes.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Dish not found" });
  const { name, description, price } = req.body || {};
  if (name) d.name = name;
  if (description) d.description = description;
  if (price !== undefined) d.price = Number(price);
  res.json(d);
});

app.delete("/dishes/:id", authMiddleware, roleGuard("admin"), (req, res) => {
  const idx = dishes.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Dish not found" });
  const [removed] = dishes.splice(idx, 1);
  res.json(removed);
});

/* --------------------------
   Orders
   - Users can create orders (auto-assign a random chef)
   - Users can list own orders
   - Admin can list all orders
   - Chefs can list orders assigned to them and update status
   -------------------------- */

const ORDER_STATUSES = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

function pickRandomChef() {
  const chefList = users.filter((u) => u.role === "chef");
  if (!chefList.length) return null;
  return chefList[Math.floor(Math.random() * chefList.length)].id;
}

app.post("/orders", authMiddleware, roleGuard("user"), (req, res) => {
  const { dishId } = req.body || {};
  if (!dishId) return res.status(400).json({ error: "dishId required" });
  const dish = dishes.find((d) => d.id === dishId);
  if (!dish) return res.status(404).json({ error: "Dish not found" });

  const chefId = pickRandomChef();
  const newOrder = { id: uuidv4(), userId: req.user.id, dishId, status: "Order Received", chefId, createdAt: Date.now(), updatedAt: Date.now() };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get("/orders", authMiddleware, (req, res) => {
  if (req.user.role === "admin") return res.json(orders);
  if (req.user.role === "chef") return res.json(orders.filter((o) => o.chefId === req.user.id));
  return res.json(orders.filter((o) => o.userId === req.user.id));
});

/**
 * Chef updates order status.
 * Allowed transitions: Order Received -> Preparing -> Out for Delivery -> Delivered
 */
app.put("/orders/:id/status", authMiddleware, roleGuard("chef"), (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "status required" });
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.chefId !== req.user.id) return res.status(403).json({ error: "Not your order" });

  // optional: enforce sequential transition
  const fromIdx = ORDER_STATUSES.indexOf(order.status);
  const toIdx = ORDER_STATUSES.indexOf(status);
  if (toIdx < fromIdx) return res.status(400).json({ error: "Cannot move backwards" });
  // allow only forward by 1 or to same
  if (toIdx - fromIdx > 1) return res.status(400).json({ error: "Can only advance one step at a time" });

  order.status = status; order.updatedAt = Date.now();
  res.json(order);
});

/* --------------------------
   Swagger (OpenAPI) Setup
   -------------------------- */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Dish Booking API", version: "1.0.0", description: "Demo Dish Booking System with roles" },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: [], // we will provide a small manual doc below
};
const specs = swaggerJsdoc(swaggerOptions);
const swaggerDoc = {
  ...specs,
  paths: {
    "/auth/signup": {
      post: {
        summary: "Signup",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: {type:"string"}, email:{type:"string"}, password:{type:"string"} }, required:["name","email","password"] } } } },
        responses: { "201": { description: "Created" } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email:{type:"string"}, password:{type:"string"} }, required:["email","password"] } } } },
        responses: { "200": { description: "OK" } }
      }
    },
    "/dishes": {
      get: { summary: "List dishes (auth required)" },
      post: { summary: "Create dish (admin only)" }
    },
    "/orders": {
      post: { summary: "Create order (user only)" },
      get: { summary: "List orders (role-specific)" }
    },
    "/orders/{id}/status": {
      put: { summary: "Chef updates status (chef only)" }
    },
    "/auth/forgot-password": { post: { summary: "Request password reset" } },
    "/auth/reset-password/{token}": { post: { summary: "Reset password using token" } }
  }
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

/* --------------------------
   Health
   -------------------------- */
app.get("/", (req, res) => res.send("Dish Booking System running"));

/* --------------------------
   Start server
   -------------------------- */
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

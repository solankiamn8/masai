/**
 * Simple Auth + Password Reset Demo
 *
 * - Signup: POST /signup { name, email, password }
 * - Login:  POST /login  { email, password } -> { token }
 * - Forgot: POST /forgot-password { email } -> responds generically
 *      - Generates a one-time reset token, stores in server memory with expiry, emails link
 * - Reset:  POST /reset-password/:token { password } -> verifies token & updates password
 *
 * Notes:
 * - Uses in-memory Maps for users and tokens (replace with DB in production)
 * - Uses nodemailer with Ethereal fallback for dev email testing
 * - Rate-limited forgot-password route
 */

import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

/* ------------------------------
   Configuration
   ------------------------------ */
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_replace_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const RESET_TTL = parseInt(process.env.RESET_TOKEN_TTL || "900", 10); // seconds
const FROM_EMAIL = process.env.FROM_EMAIL || '"No Reply" <no-reply@example.com>';

/* ------------------------------
   In-memory "database"
   ------------------------------ */
// usersByEmail: email -> { id, name, email, passwordHash }
const usersByEmail = new Map();
// usersById: id -> same object (optional convenience)
const usersById = new Map();

// resetTokens: token -> { userId, expiresAt (ms), used: bool }
const resetTokens = new Map();

/* ------------------------------
   Helpers
   ------------------------------ */
function createJwt(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function safeUserForResponse(user) {
  return { id: user.id, name: user.name, email: user.email };
}

/* ------------------------------
   Nodemailer transport (Ethereal fallback)
   ------------------------------ */
let transporterPromise = null;
async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    );
    return transporterPromise;
  }
  // Ethereal dev account
  transporterPromise = (async () => {
    const testAcct = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAcct.smtp.host,
      port: testAcct.smtp.port,
      secure: testAcct.smtp.secure,
      auth: { user: testAcct.user, pass: testAcct.pass },
    });
  })();
  return transporterPromise;
}

/* ------------------------------
   Rate limiter for forgot-password
   ------------------------------ */
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many password reset requests from this IP, please try again later (15m).",
});

/* ------------------------------
   Routes
   ------------------------------ */

/**
 * Signup
 * POST /signup
 * body: { name, email, password }
 */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password required" });
    }
    const emailLower = String(email).toLowerCase();
    if (usersByEmail.has(emailLower)) {
      return res.status(409).json({ error: "Email already in use" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const user = { id, name, email: emailLower, passwordHash };
    usersByEmail.set(emailLower, user);
    usersById.set(id, user);
    return res.status(201).json({ message: "Signup successful", user: safeUserForResponse(user) });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Login
 * POST /login
 * body: { email, password }
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const emailLower = String(email).toLowerCase();
    const user = usersByEmail.get(emailLower);
    // Do not reveal which part failed
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = createJwt(user);
    return res.json({ token, user: safeUserForResponse(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Forgot Password
 * POST /forgot-password
 * body: { email }
 *
 * Response is generic (do not reveal whether email exists).
 * If email exists:
 *  - create reset token (UUID), store with expiry in resetTokens
 *  - send email with reset link: /reset-password/<token>
 */
app.post("/forgot-password", forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email required" });

    const emailLower = String(email).toLowerCase();
    const user = usersByEmail.get(emailLower);

    // Always respond with generic message to avoid account enumeration
    const genericResponse = {
      message:
        "If that email is registered, you will receive a password reset link shortly (if not, no action was taken).",
    };

    if (!user) {
      // don't reveal; just return generic message
      return res.json(genericResponse);
    }

    // create token
    const token = uuidv4();
    const expiresAt = Date.now() + RESET_TTL * 1000;
    resetTokens.set(token, { userId: user.id, expiresAt, used: false });

    // build reset URL (client typically would handle UI)
    // For demo we provide an example reset route
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${token}`;

    // send email
    try {
      const transporter = await getTransporter();
      const mail = {
        from: FROM_EMAIL,
        to: user.email,
        subject: "Password reset request",
        text:
          `You requested a password reset. Click or open the link below to reset your password. The link expires in ${Math.round(
            RESET_TTL / 60
          )} minutes.\n\n` + `${resetUrl}\n\nIf you didn't request this, ignore this email.`,
        html:
          `<p>You requested a password reset. Click the link below to reset your password.</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>Link expires in ${Math.round(RESET_TTL / 60)} minutes.</p>`,
      };

      const info = await transporter.sendMail(mail);
      // If using Ethereal, print preview URL
      if (nodemailer.getTestMessageUrl && info) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log("Preview URL:", preview);
      }
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // We still respond generic — but keep the token so user can use link if email actually sent.
    }

    return res.json(genericResponse);
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Reset Password
 * POST /reset-password/:token
 * body: { password }
 *
 * Verifies token exists, not expired, not used -> update password, mark token used.
 */
app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "token and new password required" });

    const entry = resetTokens.get(token);
    if (!entry) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
    if (entry.used) {
      return res.status(400).json({ error: "Token already used" });
    }
    if (Date.now() > entry.expiresAt) {
      // cleanup
      resetTokens.delete(token);
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = usersById.get(entry.userId);
    if (!user) {
      // shouldn't happen, but be safe
      resetTokens.delete(token);
      return res.status(400).json({ error: "Invalid token (user not found)" });
    }

    // update password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;

    // invalidate token
    entry.used = true;
    resetTokens.set(token, entry);
    resetTokens.delete(token);

    // Optionally: Invalidate other sessions/tokens — depends on token blacklist / session strategy.
    // For demo we simply return success.
    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------
   Optional: Protected route example
   Add Authorization header: Bearer <token>
   ------------------------------ */
function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  const token = hdr.slice(7);
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = usersById.get(data.id);
    if (!req.user) return res.status(401).json({ error: "Invalid token user" });
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: safeUserForResponse(req.user) });
});

/* ------------------------------
   Simple cleanup job (runs in-memory)
   Periodically remove expired reset tokens to prevent memory leak.
   ------------------------------ */
setInterval(() => {
  const now = Date.now();
  for (const [t, entry] of resetTokens.entries()) {
    if (entry.expiresAt < now || entry.used) resetTokens.delete(t);
  }
}, 60 * 1000); // run every minute

/* ------------------------------
   Start server
   ------------------------------ */
app.listen(PORT, () => {
  console.log(`Auth server running at http://localhost:${PORT}`);
  console.log("Reset token TTL (seconds):", RESET_TTL);
});

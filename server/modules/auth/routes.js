const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const { UniqueConstraintError } = require("sequelize");
const {
  createUser,
  findUserByEmail,
} = require("../../repositories/userRepository");
const { requireAuth } = require("../../middleware/requireAuth");
const {
  AUTH_MESSAGES,
  getCredentialsFromRequest,
  hasValidCredentials,
} = require("../../validators/authValidator");
const { serializeUser } = require("../../utils/serializeUser");
const {
  clearSessionCookie,
  destroySession,
  signInUser,
} = require("../../services/sessionService");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/register", authLimiter, async (req, res) => {
  const { email, password } = getCredentialsFromRequest(req);

  if (!email || !password) {
    return res.status(400).json({ error: AUTH_MESSAGES.missingFields });
  }

  if (!hasValidCredentials(email, password)) {
    return res.status(400).json({ error: AUTH_MESSAGES.invalidFormat });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash });
    signInUser(req, user);

    return res.status(201).json({ success: true, user: serializeUser(user) });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ error: AUTH_MESSAGES.emailAlreadyExists });
    }

    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = getCredentialsFromRequest(req);

  if (!email || !password) {
    return res.status(400).json({ error: AUTH_MESSAGES.missingFields });
  }

  if (!hasValidCredentials(email, password)) {
    return res.status(400).json({ error: AUTH_MESSAGES.invalidFormat });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: AUTH_MESSAGES.invalidCredentials });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: AUTH_MESSAGES.invalidCredentials });
    }

    signInUser(req, user);

    return res.json({ success: true, user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

router.post("/logout", async (req, res) => {
  try {
    await destroySession(req);
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

module.exports = router;

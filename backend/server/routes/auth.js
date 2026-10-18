// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

function setAuthCookie(res, user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { username, email, password } = parsed.data;

  const exists = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
  if (exists) return res.status(409).json({ error: 'Username or email already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, passwordHash, displayName: username });
  setAuthCookie(res, user);
  res.status(201).json({ id: user.id, username: user.username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: String(username).toLowerCase() }).select('+passwordHash');
  const ok = user?.passwordHash && await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  setAuthCookie(res, user);
  res.json({ id: user.id, username: user.username });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.sendStatus(204);
});

module.exports = router;

const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => {
    setAuthCookie(res, req.user);
    res.redirect(process.env.CLIENT_URL);
  });
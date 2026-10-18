// routes/profile.js
const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

router.get('/me', requireAuth, async (req, res) => {
  res.json(await User.findById(req.userId));
});

router.patch('/me', requireAuth, async (req, res) => {
  const { displayName, bio, avatarUrl, username } = req.body;
  const updates = Object.fromEntries(
    Object.entries({ displayName, bio, avatarUrl, username }).filter(([, v]) => v !== undefined)
  );
  try {
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 400).json({ error: 'Could not update profile' });
  }
});

// Public profile (never expose email)
router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('username displayName bio avatarUrl createdAt');
  if (!user) return res.sendStatus(404);
  res.json(user);
});

module.exports = router;
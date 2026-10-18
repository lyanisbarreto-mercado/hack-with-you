// routes/profile.js
const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

// Only a verified token can choose the identity used for profile access.
router.use('/me', requireAuth, async (req, res, next) => {
  const auth0Id = req.auth.payload.sub;
  if (typeof auth0Id !== 'string' || !auth0Id) {
    return res.status(401).json({ error: 'Token has no user identity' });
  }
  try {
    req.profile = await User.findOneAndUpdate(
      { auth0Id },
      { $setOnInsert: { auth0Id } },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (err) {
    // Concurrent first requests may both try to create the same profile.
    if (err.code !== 11000) throw err;
    req.profile = await User.findOne({ auth0Id });
    if (!req.profile) throw err;
  }
  req.userId = req.profile.id;
  next();
});

router.get('/me', async (req, res) => {
  res.json(req.profile);
});

router.patch('/me', async (req, res) => {
  const { displayName, bio, avatarUrl, username } = req.body || {};
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
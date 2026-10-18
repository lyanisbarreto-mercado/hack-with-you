const router = require("express").Router();
const checkJwt = require("../middleware/auth");
const User = require("../models/User");
const publicFields =
  "username displayName bio avatarUrl commitment technology industry createdAt";
const tagLimits = { commitment: 2, technology: 11, industry: 3 };

async function ensureProfile(auth0Id) {
  try {
    return await User.findOneAndUpdate(
      { auth0Id },
      { $setOnInsert: { auth0Id } },
      { new: true, upsert: true, runValidators: true },
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
    const user = await User.findOne({ auth0Id });
    if (!user) throw err;
    return user;
  }
}
// Directory and public profiles contain only fields intended for other members.
router.get("/", async (req, res) => {
  const users = await User.find({ username: { $type: "string", $ne: "" } })
    .select(publicFields)
    .sort({ createdAt: -1 });
  res.json(users);
});
router.get("/me", checkJwt, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (typeof req.auth.payload.sub !== "string" || !req.auth.payload.sub)
    return res.status(401).json({ error: "Token has no user identity" });
  res.json(await ensureProfile(req.auth.payload.sub));
});
router.patch("/me", checkJwt, async (req, res) => {
  res.set("Cache-Control", "no-store");
  const auth0Id = req.auth.payload.sub;
  if (typeof auth0Id !== "string" || !auth0Id)
    return res.status(401).json({ error: "Token has no user identity" });
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    return res.status(400).json({ error: "Invalid profile" });
  const updates = {};
  for (const field of ["displayName", "bio", "avatarUrl", "username"]) {
    if (req.body[field] === undefined) continue;
    if (typeof req.body[field] !== "string")
      return res.status(400).json({ error: `Invalid ${field}` });
    updates[field] = req.body[field];
  }
  for (const [field, max] of Object.entries(tagLimits)) {
    if (req.body[field] === undefined) continue;
    if (
      !Array.isArray(req.body[field]) ||
      req.body[field].length > max ||
      req.body[field].some((tag) => typeof tag !== "string")
    )
      return res.status(400).json({ error: `Invalid ${field} tags` });
    updates[field] = [...new Set(req.body[field])];
  }
  if (updates.username?.trim().toLowerCase() === "me")
    return res.status(400).json({ error: 'Choose a username other than "me"' });
  try {
    await ensureProfile(auth0Id);
    const user = await User.findOneAndUpdate(
      { auth0Id },
      { $set: updates },
      { new: true, runValidators: true },
    );
    res.json(user);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "That username is already in use" });
    if (err.name === "ValidationError" || err.name === "CastError")
      return res
        .status(400)
        .json({ error: "Check your profile fields and selected tags" });
    throw err;
  }
});
router.get("/:username", async (req, res) => {
  const user = await User.findOne({
    username: req.params.username.toLowerCase(),
  }).select(publicFields);
  if (!user) return res.status(404).json({ error: "Profile not found" });
  res.json(user);
});
module.exports = router;

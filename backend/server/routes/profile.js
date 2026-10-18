const router = require("express").Router();
const checkJwt = require("../middleware/auth");
const User = require("../models/User");
const {
  publicProfileFields: publicFields,
  toProfileView,
} = require("../lib/profileView");
const mongoose = require("mongoose");
const People = require("../lib/peopleRepository");
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
  const [users, people] = await Promise.all([
    User.find({
      $or: [
        { username: { $type: "string", $ne: "" } },
        { first_name: { $type: "string", $ne: "" } },
        { last_name: { $type: "string", $ne: "" } },
      ],
    })
      .select(publicFields)
      .sort({ createdAt: -1 })
      .lean(),
    People.listPeople(),
  ]);
  res.json([
    ...users.map((user) => toProfileView(user)),
    ...people.map((person) => toProfileView(person, "people")),
  ]);
});
router.get("/me", checkJwt, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (typeof req.auth.payload.sub !== "string" || !req.auth.payload.sub)
    return res.status(401).json({ error: "Token has no user identity" });
  res.json(toProfileView(await ensureProfile(req.auth.payload.sub)));
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
    res.json(toProfileView(user));
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
router.get("/:identifier", async (req, res) => {
  const identifier = req.params.identifier;
  if (identifier.startsWith("~people.")) {
    const id = identifier.slice("~people.".length);
    if (!mongoose.isObjectIdOrHexString(id))
      return res.status(404).json({ error: "Profile not found" });
    const person = await People.findPerson(id);
    if (!person) return res.status(404).json({ error: "Profile not found" });
    return res.json(toProfileView(person, "people"));
  }
  // Imported members have no username. The ~ prefix cannot collide with valid usernames.
  const query = identifier.startsWith("~")
    ? mongoose.isObjectIdOrHexString(identifier.slice(1))
      ? { _id: identifier.slice(1) }
      : null
    : { username: identifier.toLowerCase() };
  if (!query) return res.status(404).json({ error: "Profile not found" });
  const user = await User.findOne(query).select(publicFields).lean();
  if (!user) return res.status(404).json({ error: "Profile not found" });
  res.json(toProfileView(user));
});
module.exports = router;

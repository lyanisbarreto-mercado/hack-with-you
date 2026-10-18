const router = require("express").Router();
const checkJwt = require("../middleware/auth");
const Note = require("../models/Note");

router.use(checkJwt);
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (typeof req.auth.payload.sub !== "string" || !req.auth.payload.sub)
    return res.status(401).json({ error: "Token has no user identity" });
  next();
});
router.get("/", async (req, res) => {
  const note = await Note.findOne({ auth0Id: req.auth.payload.sub }).select(
    "content updatedAt -_id",
  );
  res.json(note || { content: "", updatedAt: null });
});
router.put("/", async (req, res) => {
  if (typeof req.body?.content !== "string" || req.body.content.length > 20000)
    return res
      .status(400)
      .json({ error: "Notes must be text of at most 20,000 characters" });
  const auth0Id = req.auth.payload.sub;
  let note;
  try {
    note = await Note.findOneAndUpdate(
      { auth0Id },
      { $set: { content: req.body.content } },
      { upsert: true, new: true, runValidators: true },
    ).select("content updatedAt -_id");
  } catch (err) {
    if (err.code !== 11000) throw err;
    note = await Note.findOneAndUpdate(
      { auth0Id },
      { $set: { content: req.body.content } },
      { new: true, runValidators: true },
    ).select("content updatedAt -_id");
  }
  res.json(note);
});
module.exports = router;

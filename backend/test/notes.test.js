const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
// Route tests inject a verified identity; auth.test.js separately checks the real JWT guard.
const authPath = require.resolve("../server/middleware/auth");
require.cache[authPath] = {
  id: authPath,
  filename: authPath,
  loaded: true,
  exports: (req, res, next) => {
    req.auth = { payload: { sub: req.get("x-test-sub") } };
    next();
  },
};
const Note = require("../server/models/Note");
const User = require("../server/models/User");
const records = new Map();
Note.findOne = (query) => ({
  select: async () => records.get(query.auth0Id) || null,
});
Note.findOneAndUpdate = (query, update) => ({
  select: async () => {
    const note = {
      content: update.$set.content,
      updatedAt: "2026-10-18T00:00:00Z",
    };
    records.set(query.auth0Id, note);
    return note;
  },
});
let server, base;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/notes", require("../server/routes/notes"));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/notes`;
});
after(() => new Promise((resolve) => server.close(resolve)));
const request = (owner, body) =>
  fetch(base, {
    method: body === undefined ? "GET" : "PUT",
    headers: { "x-test-sub": owner, "content-type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
test("a personal note persists for its owner and cannot be read or overwritten by another identity", async () => {
  let response = await request("auth0|alice", {
    content: "Private Alice draft",
    auth0Id: "auth0|bob",
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).content, "Private Alice draft");
  response = await request("auth0|bob");
  assert.equal((await response.json()).content, "");
  await request("auth0|bob", { content: "Bob draft", auth0Id: "auth0|alice" });
  response = await request("auth0|alice");
  assert.equal((await response.json()).content, "Private Alice draft");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("notes reject oversized and non-text content", async () => {
  for (const content of ["x".repeat(20001), { $gt: "" }, null, 42]) {
    assert.equal((await request("auth0|alice", { content })).status, 400);
  }
});
test("profile schema rejects unsupported tags and unsafe avatar URLs", async () => {
  await assert.rejects(
    new User({ auth0Id: "auth0|alice", technology: ["Unknown"] }).validate(),
  );
  await assert.rejects(
    new User({
      auth0Id: "auth0|alice",
      avatarUrl: "javascript:alert(1)",
    }).validate(),
  );
  await new User({
    auth0Id: "auth0|alice",
    username: "alice",
    commitment: ["Casual"],
    technology: ["Python"],
    industry: ["Cyber Security"],
  }).validate();
});

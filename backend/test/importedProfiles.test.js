const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const User = require("../server/models/User");
const People = require("../server/lib/peopleRepository");
// Only public routes are exercised; authenticated route tests use the real guard elsewhere.
process.env.AUTH0_ISSUER_BASE_URL = "https://test-tenant.auth0.com/";
process.env.AUTH0_AUDIENCE = "https://test-api";
const person = {
  _id: "507f1f77bcf86cd799439011",
  first_name: "Test",
  last_name: "Person",
  coding_languages: "Python",
  learning_interest: "Web Development",
  competitive: true,
  email: "private@example.com",
  notes: "secret",
};
User.find = () => ({
  select: () => ({ sort: () => ({ lean: async () => [] }) }),
});
People.listPeople = async () => [person];
People.findPerson = async (id) => (id === person._id ? person : null);
let server, base;
before(async () => {
  const app = express();
  app.use("/api/profile", require("../server/routes/profile"));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/profile`;
});
after(() => new Promise((resolve) => server.close(resolve)));
test("members imported without usernames appear in the directory and open by stable ID", async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const members = await response.json();
  assert.equal(members.length, 1);
  assert.equal(members[0].displayName, "Test Person");
  const profile = await fetch(`${base}/${members[0].profileKey}`);
  assert.equal(profile.status, 200);
  assert.deepEqual(await profile.json(), members[0]);
  assert.equal(members[0].email, undefined);
  assert.equal(members[0].notes, undefined);
});
test("malformed and unknown imported IDs return 404", async () => {
  for (const key of ["~people.invalid", "~people.507f1f77bcf86cd799439012"]) {
    assert.equal((await fetch(`${base}/${key}`)).status, 404);
  }
});

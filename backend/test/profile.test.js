const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const authPath = require.resolve('../server/middleware/auth');
// Route ownership uses injected identities; auth.test.js checks the real JWT guard.
require.cache[authPath] = { id: authPath, filename: authPath, loaded: true, exports: (req, res, next) => { req.auth = { payload: { sub: req.get('x-test-sub') } }; next(); } };
const User = require('../server/models/User');
const profiles = new Map();
User.findOneAndUpdate = async (query, update) => {
  assert.equal(typeof query.auth0Id, 'string');
  const existing = profiles.get(query.auth0Id) || { auth0Id: query.auth0Id };
  const changes = update.$set || update.$setOnInsert || {};
  const user = { ...existing, ...changes };
  profiles.set(query.auth0Id, user); return user;
};
let server, base;
before(async () => {
  const app = express(); app.use(express.json()); app.use('/api/profile', require('../server/routes/profile'));
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/profile/me`;
});
after(() => new Promise(resolve => server.close(resolve)));
const patch = (owner, body) => fetch(base, { method: 'PATCH', headers: { 'x-test-sub': owner, 'content-type': 'application/json' }, body: JSON.stringify(body) });
test('profile edits cannot select another owner or change private identity fields', async () => {
  await patch('auth0|bob', { username: 'bob', displayName: 'Bob' });
  const response = await patch('auth0|alice', { auth0Id: 'auth0|bob', _id: 'bob', username: 'alice', displayName: 'Alice', commitment: ['Casual'], technology: ['Python'], industry: ['Cyber Security'] });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.auth0Id, 'auth0|alice');
  assert.equal(result._id, undefined);
  assert.equal(profiles.get('auth0|bob').displayName, 'Bob');
});
test('profile input rejects tag operators, non-string fields, and reserved usernames', async () => {
  for (const body of [{ technology: { $gt: '' } }, { bio: { $gt: '' } }, { username: 'ME' }, { username: ' me ' }, { commitment: ['Casual', 'Competitive', 'Extra'] }]) {
    assert.equal((await patch('auth0|alice', body)).status, 400);
  }
});

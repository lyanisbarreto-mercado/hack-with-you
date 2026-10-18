const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.AUTH0_ISSUER_BASE_URL = 'https://test-tenant.auth0.com/';
process.env.AUTH0_AUDIENCE = 'https://test-api';
process.env.CLIENT_URL = 'http://localhost:5173';
const { createApp } = require('../server/index');
let server;
let base;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server ? new Promise(resolve => server.close(resolve)) : undefined);

test('health endpoint is public and allows the configured frontend origin', async () => {
  const response = await fetch(`${base}/api/health`, { headers: { Origin: process.env.CLIENT_URL } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal(response.headers.get('access-control-allow-origin'), process.env.CLIENT_URL);
});
for (const route of ['/api/notes', '/api/profile/me']) {
  test(`${route} rejects missing and malformed tokens before database access`, async () => {
    for (const headers of [{}, { Authorization: 'Bearer invalid-token' }]) {
      const response = await fetch(`${base}${route}`, { headers });
      assert.equal(response.status, 401);
      assert.equal(typeof (await response.json()).error, 'string');
    }
  });
}
test('startup rejects missing Auth0 configuration', () => {
  const audience = process.env.AUTH0_AUDIENCE;
  delete process.env.AUTH0_AUDIENCE;
  try {
    assert.throws(createApp, /Missing required environment variable: AUTH0_AUDIENCE/);
  } finally {
    process.env.AUTH0_AUDIENCE = audience;
  }
});

test('notes cannot be written without a valid access token', async () => {
  for (const authorization of [undefined, 'Bearer invalid-token']) {
    const response = await fetch(`${base}/api/notes`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) }, body: JSON.stringify({ content: 'private' }) });
    assert.equal(response.status, 401);
  }
});

test('profile updates require a valid access token', async () => {
  const response = await fetch(`${base}/api/profile/me`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'Untrusted request' }),
  });
  assert.equal(response.status, 401);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.AUTH0_ISSUER_BASE_URL = 'https://test-tenant.auth0.com/';
process.env.AUTH0_AUDIENCE = 'https://test-api';
process.env.CLIENT_URL = 'https://hackwithyou.netlify.app';
const db = require('../src/config/db');
let failConnection = false;
db.connectDB = async () => { if (failConnection) throw new Error('Database unavailable'); };
const { handler } = require('../../netlify/functions/api');
function event(path, method = 'GET') {
  return { path, httpMethod: method, headers: { host: 'hackwithyou.netlify.app' }, queryStringParameters: null, body: null, isBase64Encoded: false };
}
test('Netlify serves health through public rewrites and direct function paths', async () => {
  for (const path of ['/api/health', '/.netlify/functions/api/health', '/.netlify/functions/api/api/health']) {
    const context = {};
    const response = await handler(event(path), context);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
    assert.equal(context.callbackWaitsForEmptyEventLoop, false);
  }
});
test('Netlify adapter retains authentication on notes and profile writes', async () => {
  assert.equal((await handler(event('/api/notes'))).statusCode, 401);
  assert.equal((await handler(event('/api/profile/me', 'PATCH'))).statusCode, 401);
});
test('database failures produce a safe retriable response', async () => {
  failConnection = true;
  try {
    const response = await handler(event('/api/health'));
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.includes('Database unavailable'), false);
  } finally { failConnection = false; }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { functionDiagnostics } = require('../src/config/functionDiagnostics');
const configured = { AUTH0_AUDIENCE: 'example-api', AUTH0_ISSUER_BASE_URL: 'https://tenant.example/', CLIENT_URL: 'https://site.example', MONGODB_URI: 'mongodb://user:secret@host/test' };
test('function logs distinguish missing runtime settings from database failures', () => {
  const missing = functionDiagnostics(new Error('Sensitive error'), 'configuration', {});
  assert.equal(missing.code, 'RUNTIME_CONFIGURATION_MISSING');
  assert.ok(missing.missingVariables.includes('AUTH0_AUDIENCE'));
  assert.equal(functionDiagnostics({ name: 'MongooseServerSelectionError' }, 'database', configured).code, 'DATABASE_SERVER_UNREACHABLE');
  assert.equal(functionDiagnostics({ code: 18 }, 'database', configured).code, 'DATABASE_AUTHENTICATION_FAILED');
  assert.equal(functionDiagnostics({ code: 13 }, 'database', configured).code, 'DATABASE_PERMISSION_DENIED');
});
test('diagnostic output never contains raw errors or credential values', () => {
  const diagnostic = JSON.stringify(functionDiagnostics({ message: configured.MONGODB_URI, stack: 'secret stack', code: 'arbitrary secret code' }, 'database', configured));
  assert.equal(diagnostic.includes('secret'), false);
  assert.equal(diagnostic.includes('mongodb://'), false);
});

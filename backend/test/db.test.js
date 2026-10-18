const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const originalConnect = mongoose.connect;
const originalUri = process.env.MONGO_URI;
const originalAlias = process.env.MONGODB_URI;
afterEach(() => {
  mongoose.connect = originalConnect;
  for (const [name, value] of [['MONGO_URI', originalUri], ['MONGODB_URI', originalAlias]]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
test('database connection accepts either supported environment variable', async () => {
  delete process.env.MONGO_URI;
  delete process.env.MONGODB_URI;
  let received;
  mongoose.connect = async uri => { received = uri; return 'connected'; };
  process.env.MONGODB_URI = 'mongodb://127.0.0.1/test-alias';
  assert.equal(await connectDB(), 'connected');
  assert.equal(received, process.env.MONGODB_URI);
  process.env.MONGO_URI = 'mongodb://127.0.0.1/test-primary';
  await connectDB();
  assert.equal(received, process.env.MONGO_URI);
});
test('missing database configuration fails before attempting a connection', async () => {
  delete process.env.MONGO_URI;
  delete process.env.MONGODB_URI;
  mongoose.connect = () => { assert.fail('Should not attempt a connection'); };
  await assert.rejects(connectDB(), /Missing required environment variable/);
});
test('database failure propagates so the API does not start without MongoDB', async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1/test';
  const failure = new Error('Connection failed');
  mongoose.connect = async () => { throw failure; };
  await assert.rejects(connectDB(), error => error === failure);
});

test('concurrent function invocations share a connection attempt', async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1/test';
  let count = 0;
  let finish;
  mongoose.connect = () => { count += 1; return new Promise(resolve => { finish = resolve; }); };
  const first = connectDB();
  const second = connectDB();
  assert.equal(count, 1);
  finish('connected');
  assert.deepEqual(await Promise.all([first, second]), ['connected', 'connected']);
});
test('failed connections can be retried on the next function invocation', async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1/test';
  mongoose.connect = async () => { throw new Error('temporary failure'); };
  await assert.rejects(connectDB(), /temporary failure/);
  mongoose.connect = async () => 'reconnected';
  assert.equal(await connectDB(), 'reconnected');
});

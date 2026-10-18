const serverless = require('serverless-http');
const { createApp } = require('../../backend/src/server');
const { connectDB } = require('../../backend/src/config/db');
const { functionDiagnostics } = require('../../backend/src/config/functionDiagnostics');

let appHandler;
exports.handler = async (event, context = {}) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let stage = 'configuration';
  try {
    if (!process.env.CLIENT_URL && process.env.URL) process.env.CLIENT_URL = process.env.URL;
    if (!appHandler) appHandler = serverless(createApp());
    stage = 'database';
    await connectDB();
    stage = 'request';
    // Support both the public /api rewrite and direct function invocation.
    const prefix = '/.netlify/functions/api';
    let path = event.path || '/';
    if (path === prefix || path.startsWith(`${prefix}/`)) path = path.slice(prefix.length) || '/';
    if (path !== '/api' && !path.startsWith('/api/')) path = `/api${path === '/' ? '' : path}`;
    return await appHandler({ ...event, path }, context);
  } catch (error) {
    console.error('API invocation failed', JSON.stringify(functionDiagnostics(error, stage)));
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'The API is temporarily unavailable. Please try again shortly.' }),
    };
  }
};

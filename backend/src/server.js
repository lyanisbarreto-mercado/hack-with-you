const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env'), quiet: true });

const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

function createApp() {
  for (const name of ['AUTH0_ISSUER_BASE_URL', 'AUTH0_AUDIENCE', 'CLIENT_URL']) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL.split(',').map(origin => origin.trim()).filter(Boolean) }));
  app.use(express.json({ limit: '128kb' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/notes', require('../server/routes/notes'));
  app.use('/api/profile', require('../server/routes/profile'));
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
  });
  return app;
}

async function start() {
  const app = createApp();
  await connectDB();
  const port = process.env.PORT || 5001;
  return app.listen(port, () => console.log(`API listening on port ${port}`));
}

if (require.main === module) {
  start().catch(() => {
    console.error('API startup failed. Check configuration, MongoDB connectivity, and port availability.');
    process.exitCode = 1;
  });
}

module.exports = { createApp, start };

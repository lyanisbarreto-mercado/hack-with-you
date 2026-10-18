const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

function createApp() {
  for (const name of ['AUTH0_ISSUER_BASE_URL', 'AUTH0_AUDIENCE', 'CLIENT_URL']) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL.split(',') }));
  app.use(express.json({ limit: '128kb' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/notes', require('./routes/notes'));
  app.use('/api/profile', require('./routes/profile'));
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
  });
  return app;
}

async function start() {
  const app = createApp();
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing required environment variable: MONGO_URI or MONGODB_URI');
  await mongoose.connect(mongoUri);
  const port = process.env.PORT || 5001;
  return app.listen(port, () => console.log(`API listening on port ${port}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('API startup failed:', err.message);
    process.exitCode = 1;
  });
}

module.exports = { createApp, start };
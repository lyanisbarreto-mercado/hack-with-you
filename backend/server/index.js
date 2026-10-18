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
  const requireAuth = require('./middleware/auth');
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL }));
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/notes', requireAuth, (req, res) => res.json({ message: 'confirm' }));
  app.use('/api/profile', require('./routes/profile'));
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
  });
  return app;
}

async function start() {
  const app = createApp();
  if (!process.env.MONGO_URI) throw new Error('Missing required environment variable: MONGO_URI');
  await mongoose.connect(process.env.MONGO_URI);
  const port = process.env.PORT || 5001;
  return app.listen(port, () => console.log(`API listening on port ${port}`));
}

if (require.main === module) {
  start().catch(() => {
    console.error('API startup failed. Check Auth0 configuration and MongoDB connectivity.');
    process.exitCode = 1;
  });
}
module.exports = { createApp, start };

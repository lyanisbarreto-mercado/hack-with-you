const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGO_URI or MONGODB_URI');
  }
  // Let startup handle connection failures; never log the connection string.
  return mongoose.connect(mongoUri);
}

module.exports = { connectDB };

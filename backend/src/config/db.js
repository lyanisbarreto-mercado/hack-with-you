const mongoose = require('mongoose');
let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing required environment variable: MONGO_URI or MONGODB_URI');
  // Reuse a warm function's connection and share concurrent connection attempts.
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5,
    }).finally(() => { connectionPromise = undefined; });
  }
  return connectionPromise;
}
module.exports = { connectDB };

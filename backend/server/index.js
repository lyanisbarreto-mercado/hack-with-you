// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('./config/passport');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(() =>
  app.listen(PORT, () => console.log(`API on :${PORT}`)));
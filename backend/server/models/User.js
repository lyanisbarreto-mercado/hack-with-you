// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:     { type: String, unique: true, sparse: true, trim: true, lowercase: true, minlength: 3 },
  email:        { type: String, unique: true, sparse: true, lowercase: true },
  passwordHash: { type: String, select: false },   // never returned by default
  googleId:     { type: String, unique: true, sparse: true },
  displayName:  String,
  bio:          { type: String, maxlength: 500 },
  avatarUrl:    String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
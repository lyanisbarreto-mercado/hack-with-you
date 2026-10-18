// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id:     { type: String, required: true, unique: true },
  username:    { type: String, unique: true, sparse: true, trim: true, lowercase: true,
                 minlength: 3, maxlength: 30, match: /^[a-z0-9_]+$/ },
  displayName: { type: String, maxlength: 60 },
  bio:         { type: String, maxlength: 500 },
  avatarUrl:   { type: String, maxlength: 2048, validate: { validator: value => !value || /^https?:\/\//i.test(value), message: 'Avatar must use an HTTP or HTTPS URL' } },
  commitment: [{ type: String, enum: ['Competitive', 'Casual'] }],
  technology: [{ type: String, enum: ['HTML', 'CSS', 'JavaScript', 'Java', 'React', 'React Native', 'C+', 'Python', 'Ruby', 'SQL', 'Hardware'] }],
  industry: [{ type: String, enum: ['Web Development', 'Cyber Security', 'Computer Science'] }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
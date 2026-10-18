const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  content: { type: String, default: '', maxlength: 20000 },
}, { timestamps: true });
module.exports = mongoose.model('Note', noteSchema);

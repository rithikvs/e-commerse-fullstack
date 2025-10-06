const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Admin', adminSchema);
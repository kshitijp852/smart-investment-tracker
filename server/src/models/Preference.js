
const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  duration: Number,
  riskLevel: String,
  goalType: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preference', PreferenceSchema);

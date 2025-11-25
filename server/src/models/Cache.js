
const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Object },
  ttl: { type: Date } // optional expiry
});

module.exports = mongoose.model('Cache', CacheSchema);

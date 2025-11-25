
const mongoose = require('mongoose');

const FinancialDataSchema = new mongoose.Schema({
  type: { type: String, enum: ['stock','mutual_fund','fd'], required: true },
  symbol: { type: String, required: true },
  name: { type: String },
  meta: { type: Object },
  lastUpdated: { type: Date, default: Date.now },
  // Store simplified historical price series for backtesting (array of {date, close})
  priceHistory: [{ date: Date, close: Number }]
});

FinancialDataSchema.index({ type: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('FinancialData', FinancialDataSchema);

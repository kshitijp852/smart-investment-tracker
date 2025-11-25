const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    symbol: { type: String, required: true },
    type: { type: String, enum: ['stock','mutual_fund','fd'], required: true },
    amountAllocated: { type: Number, required: true },
    expectedReturn: { type: Number }
  }],
  totalAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);

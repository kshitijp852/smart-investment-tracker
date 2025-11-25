
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FinancialData = require('../models/FinancialData');
const Portfolio = require('../models/Portfolio');

// Save a portfolio (protected)
router.post('/save', auth, async (req, res) => {
  try {
    const { items } = req.body; // [{ symbol, type, amount }]
    const enriched = [];
    let totalAmount = 0;
    
    for (const it of items){
      const fd = await FinancialData.findOne({ symbol: it.symbol, type: it.type });
      const expectedReturn = fd ? estimateCAGR(fd.priceHistory) : 0.08;
      enriched.push({ 
        symbol: it.symbol, 
        type: it.type, 
        amountAllocated: it.amount, 
        expectedReturn 
      });
      totalAmount += it.amount;
    }
    
    // Save to database
    const portfolio = new Portfolio({
      userId: req.user.id,
      items: enriched,
      totalAmount
    });
    await portfolio.save();
    
    res.json({ saved: true, portfolio: portfolio });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get user's portfolios
router.get('/list', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ portfolios });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function estimateCAGR(history){
  if (!history || history.length<2) return 0;
  const start = history[0].close;
  const end = history[history.length-1].close;
  const years = (new Date(history[history.length-1].date).getTime() - new Date(history[0].date).getTime())/(1000*60*60*24*365);
  if (years<=0) return 0;
  return Math.pow(end/start, 1/years)-1;
}

module.exports = router;


const express = require('express');
const router = express.Router();
const Cache = require('../models/Cache');
const { fetchAndCache } = require('../services/alphaVantage');
const FinancialData = require('../models/FinancialData');

// GET /api/alpha/fetch?symbol=TCS&force=true
router.get('/fetch', async (req, res) => {
  try {
    const { symbol, force } = req.query;
    if (!symbol) return res.status(400).json({ message: 'symbol required' });
    const cacheKey = `alpha_${symbol}`;
    if (!force){
      const cached = await FinancialData.findOne({ symbol }).lean();
      if (cached && ((new Date() - new Date(cached.lastUpdated)) < 1000*60*60*24*7)) {
        return res.json({ cached: true, data: cached });
      }
    }
    const doc = await fetchAndCache(symbol, 'stock');
    res.json({ cached: false, data: doc });
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
});

module.exports = router;

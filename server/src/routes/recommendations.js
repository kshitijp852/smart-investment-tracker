
const express = require('express');
const router = express.Router();
const FinancialData = require('../models/FinancialData');
const { cagr, sharpeLike } = require('../utils/analytics');

// Generate recommendations based on simple scoring of CAGR and Sharpe-like
router.post('/generate', async (req, res) => {
  try {
    const { amount=100000, duration=3, riskLevel='medium' } = req.body;
    // Fetch candidate instruments (mock: return all and compute score)
    const items = await FinancialData.find().limit(100).lean();
    const scored = items.map(it => {
      const scoreCAGR = cagr(it.priceHistory || []) || 0;
      const scoreSharpe = sharpeLike(it.priceHistory || []) || 0;
      // Liquidity proxy: mutual funds and stocks higher than FDs
      const liquidity = (it.type === 'fd') ? 0.2 : 1.0;
      // Compose a score with weights (tunable)
      const score = (scoreCAGR * 0.6) + (scoreSharpe * 0.3) + (liquidity * 0.1);
      return { symbol: it.symbol, name: it.name, type: it.type, expectedReturn: scoreCAGR, score, risk: (scoreSharpe<0.2?'high':'medium') };
    });
    // Filter and sort based on riskLevel requested (simple)
    let filtered = scored;
    if (riskLevel === 'low') filtered = scored.filter(s => s.risk !== 'high');
    if (riskLevel === 'high') filtered = scored; // allow all
    filtered = filtered.sort((a,b)=>b.score-a.score).slice(0,10);
    res.json({ generatedAt: new Date(), input: { amount, duration, riskLevel }, recommendations: filtered });
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
});

module.exports = router;

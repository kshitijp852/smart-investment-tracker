
const express = require('express');
const router = express.Router();
const FinancialData = require('../models/FinancialData');
const mfapi = require('../services/mfapi');

// Enhanced endpoint to seed Indian mutual funds only
router.get('/mock-seed', async (req, res) => {
  try {
    const instruments = [
      // Large Cap Equity Funds (High Growth, High Risk) - 8 funds
      { type: 'mutual_fund', symbol: 'AXIS_BLUECHIP', name: 'Axis Bluechip Fund', baseReturn: 0.14, volatility: 0.18, category: 'large_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'MIRAE_LARGECAP', name: 'Mirae Asset Large Cap Fund', baseReturn: 0.135, volatility: 0.17, category: 'large_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'ICICI_BLUECHIP', name: 'ICICI Prudential Bluechip Fund', baseReturn: 0.13, volatility: 0.16, category: 'large_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'SBI_BLUECHIP', name: 'SBI Bluechip Fund', baseReturn: 0.125, volatility: 0.16, category: 'large_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'NIPPON_LARGECAP', name: 'Nippon India Large Cap Fund', baseReturn: 0.128, volatility: 0.17, category: 'large_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'KOTAK_BLUECHIP', name: 'Kotak Bluechip Fund', baseReturn: 0.122, volatility: 0.15, category: 'large_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'ADITYA_FRONTLINE', name: 'Aditya Birla SL Frontline Equity Fund', baseReturn: 0.118, volatility: 0.16, category: 'large_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'TATA_LARGECAP', name: 'Tata Large Cap Fund', baseReturn: 0.115, volatility: 0.15, category: 'large_cap', riskCategory: 'medium' },
      
      // Mid Cap Funds (Very High Growth, Very High Risk) - 6 funds
      { type: 'mutual_fund', symbol: 'AXIS_MIDCAP', name: 'Axis Midcap Fund', baseReturn: 0.16, volatility: 0.22, category: 'mid_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'KOTAK_EMERGING', name: 'Kotak Emerging Equity Fund', baseReturn: 0.155, volatility: 0.21, category: 'mid_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'DSP_MIDCAP', name: 'DSP Midcap Fund', baseReturn: 0.15, volatility: 0.20, category: 'mid_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'HDFC_MIDCAP', name: 'HDFC Mid-Cap Opportunities Fund', baseReturn: 0.148, volatility: 0.21, category: 'mid_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'NIPPON_GROWTH', name: 'Nippon India Growth Fund', baseReturn: 0.145, volatility: 0.20, category: 'mid_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'EDELWEISS_MIDCAP', name: 'Edelweiss Mid Cap Fund', baseReturn: 0.142, volatility: 0.19, category: 'mid_cap', riskCategory: 'high' },
      
      // Small Cap Funds (Highest Growth, Highest Risk) - 4 funds
      { type: 'mutual_fund', symbol: 'AXIS_SMALLCAP', name: 'Axis Small Cap Fund', baseReturn: 0.18, volatility: 0.25, category: 'small_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'SBI_SMALLCAP', name: 'SBI Small Cap Fund', baseReturn: 0.175, volatility: 0.24, category: 'small_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'HDFC_SMALLCAP', name: 'HDFC Small Cap Fund', baseReturn: 0.17, volatility: 0.23, category: 'small_cap', riskCategory: 'high' },
      { type: 'mutual_fund', symbol: 'NIPPON_SMALLCAP', name: 'Nippon India Small Cap Fund', baseReturn: 0.165, volatility: 0.22, category: 'small_cap', riskCategory: 'high' },
      
      // Flexi Cap / Multi Cap Funds (Balanced Growth) - 6 funds
      { type: 'mutual_fund', symbol: 'PARAG_FLEXI', name: 'Parag Parikh Flexi Cap Fund', baseReturn: 0.145, volatility: 0.15, category: 'flexi_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'CANARA_FLEXI', name: 'Canara Robeco Flexi Cap Fund', baseReturn: 0.13, volatility: 0.14, category: 'flexi_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'HDFC_FLEXI', name: 'HDFC Flexi Cap Fund', baseReturn: 0.125, volatility: 0.14, category: 'flexi_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'UTI_FLEXI', name: 'UTI Flexi Cap Fund', baseReturn: 0.128, volatility: 0.15, category: 'flexi_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'KOTAK_FLEXI', name: 'Kotak Flexi Cap Fund', baseReturn: 0.122, volatility: 0.14, category: 'flexi_cap', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'JM_MULTICAP', name: 'JM Multicap Fund', baseReturn: 0.118, volatility: 0.13, category: 'flexi_cap', riskCategory: 'medium' },
      
      // Balanced / Hybrid Funds (Moderate Risk) - 6 funds
      { type: 'mutual_fund', symbol: 'HDFC_BALANCED', name: 'HDFC Balanced Advantage Fund', baseReturn: 0.11, volatility: 0.11, category: 'balanced', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'ICICI_BALANCED', name: 'ICICI Prudential Balanced Advantage Fund', baseReturn: 0.105, volatility: 0.10, category: 'balanced', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'ADITYA_BALANCED', name: 'Aditya Birla SL Balanced Advantage Fund', baseReturn: 0.10, volatility: 0.10, category: 'balanced', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'KOTAK_BALANCED', name: 'Kotak Balanced Advantage Fund', baseReturn: 0.108, volatility: 0.11, category: 'balanced', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'NIPPON_BALANCED', name: 'Nippon India Balanced Advantage Fund', baseReturn: 0.103, volatility: 0.10, category: 'balanced', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'EDELWEISS_BALANCED', name: 'Edelweiss Balanced Advantage Fund', baseReturn: 0.098, volatility: 0.09, category: 'balanced', riskCategory: 'low' },
      
      // Debt / Bond Funds (Low Risk, Stable Returns) - 6 funds
      { type: 'mutual_fund', symbol: 'HDFC_CORP_BOND', name: 'HDFC Corporate Bond Fund', baseReturn: 0.075, volatility: 0.04, category: 'debt', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'ICICI_CORP_BOND', name: 'ICICI Prudential Corporate Bond Fund', baseReturn: 0.073, volatility: 0.04, category: 'debt', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'AXIS_CORP_DEBT', name: 'Axis Corporate Debt Fund', baseReturn: 0.072, volatility: 0.03, category: 'debt', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'SBI_CORP_BOND', name: 'SBI Corporate Bond Fund', baseReturn: 0.074, volatility: 0.04, category: 'debt', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'KOTAK_BOND', name: 'Kotak Bond Fund', baseReturn: 0.071, volatility: 0.03, category: 'debt', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'ADITYA_CORP_BOND', name: 'Aditya Birla SL Corporate Bond Fund', baseReturn: 0.070, volatility: 0.03, category: 'debt', riskCategory: 'low' },
      
      // Liquid / Ultra Short Duration (Very Low Risk) - 5 funds
      { type: 'mutual_fund', symbol: 'HDFC_LIQUID', name: 'HDFC Liquid Fund', baseReturn: 0.065, volatility: 0.02, category: 'liquid', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'ICICI_LIQUID', name: 'ICICI Prudential Liquid Fund', baseReturn: 0.063, volatility: 0.02, category: 'liquid', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'AXIS_LIQUID', name: 'Axis Liquid Fund', baseReturn: 0.062, volatility: 0.02, category: 'liquid', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'SBI_LIQUID', name: 'SBI Liquid Fund', baseReturn: 0.064, volatility: 0.02, category: 'liquid', riskCategory: 'low' },
      { type: 'mutual_fund', symbol: 'KOTAK_LIQUID', name: 'Kotak Liquid Fund', baseReturn: 0.061, volatility: 0.02, category: 'liquid', riskCategory: 'low' },
      
      // Index Funds (Low Cost, Market Returns) - 6 funds
      { type: 'mutual_fund', symbol: 'HDFC_NIFTY50', name: 'HDFC Index Fund - Nifty 50 Plan', baseReturn: 0.12, volatility: 0.15, category: 'index', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'ICICI_NIFTY50', name: 'ICICI Prudential Nifty 50 Index Fund', baseReturn: 0.118, volatility: 0.15, category: 'index', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'UTI_NIFTY', name: 'UTI Nifty Index Fund', baseReturn: 0.115, volatility: 0.14, category: 'index', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'SBI_NIFTY', name: 'SBI Nifty Index Fund', baseReturn: 0.117, volatility: 0.15, category: 'index', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'NIPPON_NIFTY', name: 'Nippon India Index Fund - Nifty 50 Plan', baseReturn: 0.116, volatility: 0.14, category: 'index', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'AXIS_NIFTY', name: 'Axis Nifty 50 Index Fund', baseReturn: 0.119, volatility: 0.15, category: 'index', riskCategory: 'medium' },
      
      // ELSS / Tax Saver Funds (Tax Benefits + Growth) - 4 funds
      { type: 'mutual_fund', symbol: 'AXIS_ELSS', name: 'Axis Long Term Equity Fund', baseReturn: 0.138, volatility: 0.17, category: 'elss', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'MIRAE_ELSS', name: 'Mirae Asset Tax Saver Fund', baseReturn: 0.135, volatility: 0.16, category: 'elss', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'HDFC_ELSS', name: 'HDFC Tax Saver Fund', baseReturn: 0.128, volatility: 0.16, category: 'elss', riskCategory: 'medium' },
      { type: 'mutual_fund', symbol: 'DSP_ELSS', name: 'DSP Tax Saver Fund', baseReturn: 0.125, volatility: 0.15, category: 'elss', riskCategory: 'medium' },
    ];

    const start = new Date();
    start.setFullYear(start.getFullYear()-5);
    
    let count = 0;
    for (const inst of instruments) {
      const priceHistory = [];
      let price = 100;
      
      for (let i=0; i<60; i++) {
        // Generate realistic price movement based on baseReturn and volatility
        const monthlyReturn = inst.baseReturn / 12;
        const monthlyVol = inst.volatility / Math.sqrt(12);
        const randomShock = (Math.random() - 0.5) * 2 * monthlyVol;
        const trend = Math.sin(i/12) * 0.01; // Seasonal trend
        
        price *= (1 + monthlyReturn + randomShock + trend);
        
        const d = new Date(start);
        d.setMonth(start.getMonth() + i);
        priceHistory.push({ date: d, close: Number(price.toFixed(2)) });
      }
      
      await FinancialData.updateOne(
        { type: inst.type, symbol: inst.symbol },
        {
          type: inst.type,
          symbol: inst.symbol,
          name: inst.name,
          meta: { category: inst.category },
          priceHistory: priceHistory,
          lastUpdated: new Date()
        },
        { upsert: true }
      );
      count++;
    }
    
    res.json({ ok: true, instrumentsSeeded: count, message: `Seeded ${count} diverse instruments` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/list', async (req, res) => {
  try {
    const items = await FinancialData.find().limit(50).lean();
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ============================================
// CACHE MANAGEMENT ENDPOINTS
// ============================================

// Get cache statistics
router.get('/cache/stats', (req, res) => {
  try {
    const stats = mfapi.getCacheStats();
    res.json({
      ok: true,
      cache: stats,
      message: `Cache contains ${stats.size} entries with ${stats.ttlHours}h TTL`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear cache
router.post('/cache/clear', (req, res) => {
  try {
    mfapi.clearCache();
    res.json({
      ok: true,
      message: 'Cache cleared successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Quick sync - essential funds only (fast)
router.post('/mfapi/quick-sync', async (req, res) => {
  try {
    const { forceRefresh = false } = req.body;
    
    const result = await mfapi.quickSync(forceRefresh);
    
    res.json({
      ok: true,
      ...result,
      message: `Quick sync: ${result.synced} funds (${result.fromCache} from cache, ${result.failed} failed)`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Full sync - all funds (slower)
router.post('/mfapi/sync', async (req, res) => {
  try {
    const { forceRefresh = false, batchSize = 10 } = req.body;
    
    const result = await mfapi.syncPopularFunds(forceRefresh, batchSize);
    
    res.json({
      ok: true,
      ...result,
      message: `Synced ${result.synced} funds (${result.fromCache} from cache, ${result.failed} failed)`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch single fund NAV
router.get('/mfapi/nav/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { useCache = 'true' } = req.query;
    
    const data = await mfapi.fetchLatestNAV(schemeCode, useCache === 'true');
    
    if (!data) {
      return res.status(404).json({ message: 'Fund not found' });
    }
    
    res.json({
      ok: true,
      data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search funds
router.get('/mfapi/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 3) {
      return res.status(400).json({ message: 'Query must be at least 3 characters' });
    }
    
    const results = await mfapi.searchFunds(q);
    
    res.json({
      ok: true,
      count: results.length,
      results: results.slice(0, 20) // Limit to 20 results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

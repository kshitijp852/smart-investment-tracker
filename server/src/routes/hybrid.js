const express = require('express');
const router = express.Router();
const {
  getCuratedFundsWithLatestNAV,
  syncCuratedFundsWithNAV,
  getFundWithLatestNAV,
  searchAllFunds,
  getFundBySchemeCode
} = require('../services/hybridFundService');

/**
 * GET /api/hybrid/funds
 * Get all curated funds with latest NAV prices
 */
router.get('/funds', async (req, res) => {
  try {
    const funds = await getCuratedFundsWithLatestNAV();
    
    res.json({
      success: true,
      count: funds.length,
      data: funds
    });
  } catch (error) {
    console.error('Error fetching hybrid funds:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching funds',
      error: error.message
    });
  }
});

/**
 * GET /api/hybrid/fund/:id
 * Get specific fund with latest NAV
 */
router.get('/fund/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fund = await getFundWithLatestNAV(id);
    
    res.json({
      success: true,
      data: fund
    });
  } catch (error) {
    console.error('Error fetching fund:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fund',
      error: error.message
    });
  }
});

/**
 * GET /api/hybrid/scheme/:schemeCode
 * Get fund by scheme code (from either source)
 */
router.get('/scheme/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const fund = await getFundBySchemeCode(schemeCode);
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }
    
    res.json({
      success: true,
      data: fund
    });
  } catch (error) {
    console.error('Error fetching fund by scheme code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fund',
      error: error.message
    });
  }
});

/**
 * GET /api/hybrid/search
 * Search across all funds (curated + NAV database)
 * Query params: q, category, limit, includeNonCurated
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 50, includeNonCurated = 'true' } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const results = await searchAllFunds(q, {
      limit: parseInt(limit),
      category,
      includeNonCurated: includeNonCurated === 'true'
    });
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching funds:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching funds',
      error: error.message
    });
  }
});

/**
 * POST /api/hybrid/sync
 * Sync curated funds with latest NAV data
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await syncCuratedFundsWithNAV();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error syncing funds:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing funds',
      error: error.message
    });
  }
});

/**
 * GET /api/hybrid/stats
 * Get hybrid system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const FinancialData = require('../models/FinancialData');
    const NAV = require('../models/NAV');
    
    const curatedCount = await FinancialData.countDocuments({ type: 'mutual_fund' });
    const navCount = await NAV.distinct('schemeCode');
    const totalAvailable = navCount.length;
    
    // Count how many curated funds have NAV data
    const curatedFunds = await FinancialData.find({ type: 'mutual_fund' }).lean();
    let curatedWithNAV = 0;
    
    for (const fund of curatedFunds) {
      const hasNAV = await NAV.findOne({
        $or: [
          { schemeCode: fund.symbol },
          { schemeCode: fund.meta?.schemeCode }
        ]
      });
      if (hasNAV) curatedWithNAV++;
    }
    
    res.json({
      success: true,
      data: {
        curatedFunds: curatedCount,
        curatedWithRealTimeNAV: curatedWithNAV,
        totalFundsAvailable: totalAvailable,
        coveragePercentage: ((curatedWithNAV / curatedCount) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

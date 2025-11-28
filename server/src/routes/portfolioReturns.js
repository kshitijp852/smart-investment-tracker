const express = require('express');
const router = express.Router();
const {
  calculatePortfolioReturns,
  calculatePeriodReturns
} = require('../services/portfolioReturnsService');

/**
 * POST /api/portfolio/returns
 * Calculate returns for a portfolio
 * Body: { holdings: [{schemeCode, units, investmentDate}] }
 */
router.post('/returns', async (req, res) => {
  try {
    const { holdings } = req.body;
    
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Holdings array is required'
      });
    }
    
    // Validate holdings
    for (const holding of holdings) {
      if (!holding.schemeCode || !holding.units || !holding.investmentDate) {
        return res.status(400).json({
          success: false,
          message: 'Each holding must have schemeCode, units, and investmentDate'
        });
      }
    }
    
    const result = await calculatePortfolioReturns(holdings);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating portfolio returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating portfolio returns',
      error: error.message
    });
  }
});

/**
 * GET /api/portfolio/returns/:schemeCode
 * Get period-wise returns for a scheme
 */
router.get('/returns/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    
    const result = await calculatePeriodReturns(schemeCode);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating period returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating period returns',
      error: error.message
    });
  }
});

module.exports = router;

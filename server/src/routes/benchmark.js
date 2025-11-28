const express = require('express');
const router = express.Router();
const {
  compareWithBenchmark,
  generatePerformanceChartData,
  comparePortfolioWithBenchmark,
  BENCHMARK_MAP
} = require('../services/benchmarkService');

/**
 * POST /api/benchmark/compare
 * Compare basket performance with blended benchmark
 */
router.post('/compare', async (req, res) => {
  try {
    const { basket, duration, initialInvestment } = req.body;

    if (!basket || !Array.isArray(basket) || basket.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid basket data. Please provide an array of funds.' 
      });
    }

    // Perform benchmark comparison
    const comparison = await compareWithBenchmark(basket, duration || 3);

    // Generate chart data
    const chartData = generatePerformanceChartData(
      comparison.basketReturn,
      comparison.benchmarkReturn,
      duration || 3,
      initialInvestment || 100000
    );

    res.json({
      success: true,
      comparison: comparison,
      chartData: chartData,
      summary: {
        outperformedPeriods: Object.values(comparison.beatsBenchmark).filter(v => v).length,
        totalPeriods: Object.keys(comparison.beatsBenchmark).length
      }
    });

  } catch (error) {
    console.error('Benchmark comparison error:', error);
    res.status(500).json({ 
      message: 'Error comparing with benchmark',
      error: error.message 
    });
  }
});

/**
 * GET /api/benchmark/indices
 * Get list of all benchmark indices
 */
router.get('/indices', (req, res) => {
  try {
    const indices = Object.entries(BENCHMARK_MAP).map(([category, index]) => ({
      category: category,
      benchmarkIndex: index
    }));

    res.json({
      success: true,
      indices: indices,
      uniqueIndices: [...new Set(Object.values(BENCHMARK_MAP))]
    });
  } catch (error) {
    console.error('Error fetching indices:', error);
    res.status(500).json({ 
      message: 'Error fetching benchmark indices',
      error: error.message 
    });
  }
});

module.exports = router;


/**
 * POST /api/benchmark/blended
 * Calculate blended benchmark for a portfolio using real NAV data
 * Body: { holdings: [{schemeCode, units, investmentDate}] }
 */
router.post('/blended', async (req, res) => {
  try {
    const { holdings } = req.body;

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Holdings array is required'
      });
    }

    const result = await comparePortfolioWithBenchmark(holdings);

    res.json(result);
  } catch (error) {
    console.error('Blended benchmark calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating blended benchmark',
      error: error.message
    });
  }
});

const express = require('express');
const router = express.Router();
const NAV = require('../models/NAV');
const { syncNAVData, getNAVStats } = require('../services/amfiService');
const navSyncJob = require('../jobs/navSyncJob');

/**
 * GET /api/nav/latest/:schemeCode
 * Get latest NAV for a specific scheme
 */
router.get('/latest/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    
    const nav = await NAV.getLatestNAV(schemeCode);
    
    if (!nav) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        schemeCode: nav.schemeCode,
        schemeName: nav.schemeName,
        category: nav.category,
        nav: nav.nav,
        repurchasePrice: nav.repurchasePrice,
        salePrice: nav.salePrice,
        date: nav.date
      }
    });
  } catch (error) {
    console.error('Error fetching latest NAV:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NAV data',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/history/:schemeCode
 * Get NAV history for a specific scheme
 * Query params: startDate, endDate, limit
 */
router.get('/history/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;
    
    const history = await NAV.getNAVHistory(schemeCode, startDate, endDate);
    
    if (history.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No NAV history found for this scheme'
      });
    }
    
    // Apply limit
    const limitedHistory = history.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        schemeCode,
        schemeName: history[0].schemeName,
        category: history[0].category,
        count: limitedHistory.length,
        history: limitedHistory.map(nav => ({
          nav: nav.nav,
          repurchasePrice: nav.repurchasePrice,
          salePrice: nav.salePrice,
          date: nav.date
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching NAV history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NAV history',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/search
 * Search schemes by name or code
 * Query params: q (search query), category, limit
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 50 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const query = {
      $or: [
        { schemeName: { $regex: q, $options: 'i' } },
        { schemeCode: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Get latest NAV for each matching scheme
    const results = await NAV.aggregate([
      { $match: query },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$schemeCode',
          schemeName: { $first: '$schemeName' },
          category: { $first: '$category' },
          nav: { $first: '$nav' },
          date: { $first: '$date' }
        }
      },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          schemeCode: '$_id',
          schemeName: 1,
          category: 1,
          nav: 1,
          date: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching schemes:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching schemes',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/schemes
 * Get all schemes with latest NAV
 * Query params: category, limit, offset
 */
router.get('/schemes', async (req, res) => {
  try {
    const { category, limit = 100, offset = 0 } = req.query;
    
    let schemes = await NAV.getAllSchemes();
    
    // Filter by category if provided
    if (category) {
      schemes = schemes.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Apply pagination
    const total = schemes.length;
    const paginatedSchemes = schemes.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      total,
      count: paginatedSchemes.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      data: paginatedSchemes
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schemes',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/categories
 * Get all available categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await NAV.distinct('category');
    
    // Get count for each category
    const categoryCounts = await NAV.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      },
      { $sort: { category: 1 } }
    ]);
    
    res.json({
      success: true,
      count: categories.length,
      data: categoryCounts
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/stats
 * Get NAV database statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getNAVStats();
    
    res.json({
      success: true,
      data: stats
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

/**
 * POST /api/nav/sync
 * Manually trigger NAV data sync
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await navSyncJob.runSync();
    
    res.json({
      success: result.success !== false,
      data: result
    });
  } catch (error) {
    console.error('Error syncing NAV data:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing NAV data',
      error: error.message
    });
  }
});

/**
 * GET /api/nav/sync/status
 * Get sync job status
 */
router.get('/sync/status', (req, res) => {
  try {
    const status = navSyncJob.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sync status',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { syncPopularFunds, fetchLatestNAV, searchFunds } = require('../services/mfapi');

// Sync popular funds from MFApi
router.get('/sync', async (req, res) => {
  try {
    const result = await syncPopularFunds();
    res.json({
      success: true,
      message: `Synced ${result.synced} funds from MFApi`,
      synced: result.synced,
      failed: result.failed
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch specific fund by scheme code
router.get('/fund/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const data = await fetchLatestNAV(code);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search funds by name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }
    const results = await searchFunds(q);
    res.json({ results: results.slice(0, 20) }); // Limit to 20 results
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

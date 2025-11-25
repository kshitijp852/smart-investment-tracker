
const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');

// Simple CRUD for preferences - no auth middleware included (add later)
router.post('/', async (req, res) => {
  try {
    const pref = new Preference(req.body);
    await pref.save();
    res.json(pref);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:userId', async (req, res) => {
  try {
    const prefs = await Preference.find({ userId: req.params.userId });
    res.json(prefs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query, run, db } = require('../db');

// 1. Get All Settings
router.get('/', (req, res) => {
  try {
    const rows = query('SELECT * FROM system_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return res.json({ settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 2. Update Settings
router.put('/', (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    for (const [key, value] of Object.entries(settings)) {
      upsertStmt.run(key, String(value));
    }

    return res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;

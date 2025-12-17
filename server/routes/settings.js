const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.query('SELECT * FROM settings');
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get single setting
router.get('/:key', async (req, res) => {
  try {
    const settings = await db.query('SELECT * FROM settings WHERE key = ?', [req.params.key]);
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: settings[0].key, value: settings[0].value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update setting
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    await db.run(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [req.params.key, value]
    );

    const updated = await db.query('SELECT * FROM settings WHERE key = ?', [req.params.key]);
    res.json({ key: updated[0].key, value: updated[0].value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;


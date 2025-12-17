const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaigns = await db.query('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaigns[0]);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const { account_name, campaign_name, launch_date, last_scaled_date, notification_interval_days } = req.body;
    
    if (!account_name || !campaign_name || !launch_date) {
      return res.status(400).json({ error: 'Missing required fields: account_name, campaign_name, launch_date' });
    }

    const result = await db.run(
      `INSERT INTO campaigns (account_name, campaign_name, launch_date, last_scaled_date, notification_interval_days, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [account_name, campaign_name, launch_date, last_scaled_date || null, notification_interval_days || 7]
    );

    const newCampaign = await db.query('SELECT * FROM campaigns WHERE id = ?', [result.id]);
    res.status(201).json(newCampaign[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { account_name, campaign_name, launch_date, last_scaled_date, notification_interval_days } = req.body;
    
    await db.run(
      `UPDATE campaigns 
       SET account_name = ?, campaign_name = ?, launch_date = ?, last_scaled_date = ?, 
           notification_interval_days = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [account_name, campaign_name, launch_date, last_scaled_date || null, notification_interval_days || 7, req.params.id]
    );

    const updatedCampaign = await db.query('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (updatedCampaign.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(updatedCampaign[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaigns ready for scaling
router.get('/ready-for-scaling/check', async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT * FROM campaigns 
      WHERE last_scaled_date IS NOT NULL
      AND date(last_scaled_date, '+' || notification_interval_days || ' days') <= date('now')
      ORDER BY account_name, campaign_name
    `);
    res.json(campaigns);
  } catch (error) {
    console.error('Error checking campaigns ready for scaling:', error);
    res.status(500).json({ error: 'Failed to check campaigns' });
  }
});

module.exports = router;


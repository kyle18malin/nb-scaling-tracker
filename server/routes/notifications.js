const express = require('express');
const router = express.Router();
const db = require('../database');
const googleSheets = require('../services/googleSheets');

// Send notification for a specific campaign
router.post('/send/:campaignId', async (req, res) => {
  try {
    const campaigns = await db.query('SELECT * FROM campaigns WHERE id = ?', [req.params.campaignId]);
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaigns[0];
    
    // Log the notification to database (always)
    await db.run(
      'INSERT INTO notifications_log (campaign_id, account_name, campaign_name) VALUES (?, ?, ?)',
      [campaign.id, campaign.account_name, campaign.campaign_name]
    );

    // Try to send to Google Sheets if configured (optional)
    let googleSheetsResult = null;
    try {
      googleSheetsResult = await googleSheets.sendNotification(campaign.account_name, campaign.campaign_name);
    } catch (error) {
      // Google Sheets is optional - just log the error but don't fail
      console.log('Google Sheets notification skipped (optional):', error.message);
    }

    res.json({ 
      success: true, 
      message: 'Notification logged successfully', 
      logged: true,
      googleSheets: googleSheetsResult ? { sent: true } : { sent: false, note: 'Google Sheets not configured or unavailable' }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Send notifications for all campaigns ready for scaling
router.post('/send-all-ready', async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT * FROM campaigns 
      WHERE last_scaled_date IS NOT NULL
      AND date(last_scaled_date, '+' || notification_interval_days || ' days') <= date('now')
      ORDER BY account_name, campaign_name
    `);

    const results = [];
    for (const campaign of campaigns) {
      try {
        // Always log to database
        await db.run(
          'INSERT INTO notifications_log (campaign_id, account_name, campaign_name) VALUES (?, ?, ?)',
          [campaign.id, campaign.account_name, campaign.campaign_name]
        );

        // Try Google Sheets (optional)
        let googleSheetsSent = false;
        try {
          await googleSheets.sendNotification(campaign.account_name, campaign.campaign_name);
          googleSheetsSent = true;
        } catch (error) {
          console.log(`Google Sheets notification skipped for ${campaign.campaign_name}:`, error.message);
        }

        results.push({ 
          campaign: campaign.campaign_name, 
          success: true, 
          logged: true,
          googleSheets: googleSheetsSent 
        });
      } catch (error) {
        results.push({ campaign: campaign.campaign_name, success: false, error: error.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications', details: error.message });
  }
});

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const history = await db.query(`
      SELECT n.*, c.campaign_name, c.account_name 
      FROM notifications_log n
      LEFT JOIN campaigns c ON n.campaign_id = c.id
      ORDER BY n.sent_at DESC
      LIMIT 100
    `);
    res.json(history);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

module.exports = router;


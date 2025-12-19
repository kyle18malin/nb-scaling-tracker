const cron = require('node-cron');
const db = require('./database');
const googleSheets = require('./services/googleSheets');

let cronJob = null;

const checkAndSendNotifications = async () => {
  try {
    console.log('Checking for campaigns ready for scaling...');
    
    const campaigns = await db.query(`
      SELECT * FROM campaigns 
      WHERE status = 'active'
      AND last_scaled_date IS NOT NULL
      AND date(last_scaled_date, '+' || notification_interval_days || ' days') <= date('now')
      ORDER BY account_name, campaign_name
    `);

    if (campaigns.length === 0) {
      console.log('No campaigns ready for scaling');
      return;
    }

    console.log(`Found ${campaigns.length} campaign(s) ready for scaling`);

    for (const campaign of campaigns) {
      try {
        // Always log to database
        await db.run(
          'INSERT INTO notifications_log (campaign_id, account_name, campaign_name) VALUES (?, ?, ?)',
          [campaign.id, campaign.account_name, campaign.campaign_name]
        );
        console.log(`Notification logged for: ${campaign.account_name} - ${campaign.campaign_name}`);
        
        // Try Google Sheets (optional)
        try {
          await googleSheets.sendNotification(campaign.account_name, campaign.campaign_name);
          console.log(`  → Also sent to Google Sheets`);
        } catch (error) {
          console.log(`  → Google Sheets skipped (not configured or unavailable)`);
        }
      } catch (error) {
        console.error(`Error processing notification for ${campaign.campaign_name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
};

const start = () => {
  // Run every day at 9 AM
  cronJob = cron.schedule('0 9 * * *', checkAndSendNotifications, {
    scheduled: true,
    timezone: 'America/New_York'
  });
  console.log('Cron job started: Checking for scaling notifications daily at 9 AM');
};

const stop = () => {
  if (cronJob) {
    cronJob.stop();
    console.log('Cron job stopped');
  }
};

module.exports = {
  start,
  stop,
  checkAndSendNotifications
};


const { google } = require('googleapis');
const db = require('../database');

let auth = null;
let sheets = null;

const initializeAuth = async () => {
  try {
    const settings = await db.query('SELECT * FROM settings WHERE key IN (?, ?, ?)', [
      'google_client_id',
      'google_client_secret',
      'google_refresh_token'
    ]);

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    if (!settingsObj.google_client_id || !settingsObj.google_client_secret || !settingsObj.google_refresh_token) {
      throw new Error('Google Sheets credentials not configured. Please set up in settings.');
    }

    const oauth2Client = new google.auth.OAuth2(
      settingsObj.google_client_id,
      settingsObj.google_client_secret,
      process.env.GOOGLE_SHEETS_REDIRECT_URI || 'http://localhost:5000/auth/callback'
    );

    oauth2Client.setCredentials({
      refresh_token: settingsObj.google_refresh_token
    });

    auth = oauth2Client;
    sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    return true;
  } catch (error) {
    console.error('Error initializing Google Sheets auth:', error);
    throw error;
  }
};

const getSheetId = async () => {
  const settings = await db.query('SELECT * FROM settings WHERE key = ?', ['google_sheet_id']);
  if (settings.length === 0 || !settings[0].value) {
    throw new Error('Google Sheet ID not configured. Please set it in settings.');
  }
  return settings[0].value;
};

const sendNotification = async (accountName, campaignName) => {
  try {
    if (!auth || !sheets) {
      await initializeAuth();
    }

    const sheetId = await getSheetId();
    const timestamp = new Date().toISOString();

    // Append row to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1:C1', // Will auto-expand
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[timestamp, accountName, campaignName]]
      }
    });

    // If first row, add headers
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:C1'
    });

    if (!sheetData.data.values || sheetData.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'A1:C1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['Timestamp', 'Account Name', 'Campaign Name'], [timestamp, accountName, campaignName]]
        }
      });
    }

    return { success: true, updatedCells: response.data.updates?.updatedCells || 0 };
  } catch (error) {
    console.error('Error sending notification to Google Sheets:', error);
    throw error;
  }
};

module.exports = {
  initializeAuth,
  sendNotification
};


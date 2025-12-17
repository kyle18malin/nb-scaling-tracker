/**
 * Helper script to get Google OAuth refresh token
 * 
 * Usage:
 * 1. Set your CLIENT_ID and CLIENT_SECRET in this file
 * 2. Run: node scripts/get-refresh-token.js
 * 3. Follow the instructions to authorize and get your refresh token
 */

const { google } = require('googleapis');
const readline = require('readline');

// Replace these with your OAuth credentials
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:5000/auth/callback';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAccessToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oauth2Client.setCredentials(token);
      console.log('\nToken retrieved successfully!');
      console.log('\nRefresh Token:', token.refresh_token);
      console.log('\nSave this refresh token in your settings.');
      callback(token);
    });
  });
}

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
  console.error('Please set CLIENT_ID and CLIENT_SECRET in this script first!');
  process.exit(1);
}

getAccessToken(oauth2Client, () => {
  console.log('Done!');
});


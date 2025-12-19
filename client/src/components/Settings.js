import React, { useState, useEffect } from 'react';
import './Settings.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const Settings = () => {
  const [settings, setSettings] = useState({
    google_sheet_id: '',
    google_client_id: '',
    google_client_secret: '',
    google_refresh_token: '',
    default_notification_interval_days: 7
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'default_notification_interval_days' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async (key) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${API_BASE}/settings/${key}`, { value: settings[key] });
      setMessage({ type: 'success', text: 'Setting saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save setting' });
      console.error('Error saving setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const promises = Object.keys(settings).map(key =>
        axios.put(`${API_BASE}/settings/${key}`, { value: settings[key] })
      );
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'All settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save settings' });
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings">
        <h2>Settings</h2>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-section">
          <h3>Google Sheets Configuration (Optional)</h3>
          <p className="section-description">
            <strong>Note:</strong> All notifications are automatically tracked in the app's database and visible in the "Notification History" tab. Google Sheets integration is optional - if configured, notifications will also be sent to your Google Sheet. If not configured, notifications will still be logged in the app.
          </p>
          <p className="section-description">
            To enable Google Sheets integration, you'll need to:
          </p>
          <ol className="setup-instructions">
            <li>Create a Google Cloud Project and enable Google Sheets API</li>
            <li>Create OAuth 2.0 credentials (Client ID and Client Secret)</li>
            <li>Get a refresh token using the OAuth flow</li>
            <li>Enter your Google Sheet ID (from the sheet URL)</li>
          </ol>

          <div className="setting-item">
            <label htmlFor="google_sheet_id">Google Sheet ID (Optional)</label>
            <input
              type="text"
              id="google_sheet_id"
              name="google_sheet_id"
              value={settings.google_sheet_id}
              onChange={handleChange}
              placeholder="Enter Google Sheet ID from URL"
            />
            <small>The Sheet ID is in the URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit</small>
            <button onClick={() => handleSave('google_sheet_id')} disabled={loading} className="save-btn">
              Save
            </button>
          </div>

          <div className="setting-item">
            <label htmlFor="google_client_id">Google Client ID</label>
            <input
              type="text"
              id="google_client_id"
              name="google_client_id"
              value={settings.google_client_id}
              onChange={handleChange}
              placeholder="Enter Google OAuth Client ID"
            />
            <button onClick={() => handleSave('google_client_id')} disabled={loading} className="save-btn">
              Save
            </button>
          </div>

          <div className="setting-item">
            <label htmlFor="google_client_secret">Google Client Secret</label>
            <input
              type="password"
              id="google_client_secret"
              name="google_client_secret"
              value={settings.google_client_secret}
              onChange={handleChange}
              placeholder="Enter Google OAuth Client Secret"
            />
            <button onClick={() => handleSave('google_client_secret')} disabled={loading} className="save-btn">
              Save
            </button>
          </div>

          <div className="setting-item">
            <label htmlFor="google_refresh_token">Google Refresh Token</label>
            <input
              type="password"
              id="google_refresh_token"
              name="google_refresh_token"
              value={settings.google_refresh_token}
              onChange={handleChange}
              placeholder="Enter Google OAuth Refresh Token"
            />
            <button onClick={() => handleSave('google_refresh_token')} disabled={loading} className="save-btn">
              Save
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Default Notification Settings</h3>
          <div className="setting-item">
            <label htmlFor="default_notification_interval_days">Default Notification Interval (Days)</label>
            <input
              type="number"
              id="default_notification_interval_days"
              name="default_notification_interval_days"
              value={settings.default_notification_interval_days}
              onChange={handleChange}
              min="1"
            />
            <small>Default interval for new campaigns (can be customized per campaign)</small>
            <button onClick={() => handleSave('default_notification_interval_days')} disabled={loading} className="save-btn">
              Save
            </button>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSaveAll} disabled={loading} className="save-all-btn">
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;


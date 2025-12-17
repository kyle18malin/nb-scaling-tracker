import React, { useState, useEffect } from 'react';
import './CampaignForm.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const CampaignForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    account_name: '',
    campaign_name: '',
    launch_date: '',
    last_scaled_date: '',
    notification_interval_days: 7
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (campaign) {
      setFormData({
        account_name: campaign.account_name || '',
        campaign_name: campaign.campaign_name || '',
        launch_date: campaign.launch_date ? campaign.launch_date.split('T')[0] : '',
        last_scaled_date: campaign.last_scaled_date ? campaign.last_scaled_date.split('T')[0] : '',
        notification_interval_days: campaign.notification_interval_days || 7
      });
    }
  }, [campaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notification_interval_days' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (campaign) {
        await axios.put(`${API_BASE}/campaigns/${campaign.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/campaigns`, formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save campaign');
      console.error('Error saving campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-form-container">
      <div className="campaign-form">
        <h2>{campaign ? 'Edit Campaign' : 'Add New Campaign'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="account_name">Account Name *</label>
            <input
              type="text"
              id="account_name"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              required
              placeholder="Enter account name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="campaign_name">Campaign Name *</label>
            <input
              type="text"
              id="campaign_name"
              name="campaign_name"
              value={formData.campaign_name}
              onChange={handleChange}
              required
              placeholder="Enter campaign name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="launch_date">Launch Date *</label>
            <input
              type="date"
              id="launch_date"
              name="launch_date"
              value={formData.launch_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_scaled_date">Last Scaled Date</label>
            <input
              type="date"
              id="last_scaled_date"
              name="last_scaled_date"
              value={formData.last_scaled_date}
              onChange={handleChange}
            />
            <small>Leave empty if not scaled yet</small>
          </div>

          <div className="form-group">
            <label htmlFor="notification_interval_days">Notification Interval (Days) *</label>
            <input
              type="number"
              id="notification_interval_days"
              name="notification_interval_days"
              value={formData.notification_interval_days}
              onChange={handleChange}
              min="1"
              required
            />
            <small>How many days after last scale to send notification</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (campaign ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;


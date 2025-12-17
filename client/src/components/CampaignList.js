import React from 'react';
import './CampaignList.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const CampaignList = ({ campaigns, readyForScaling, onEdit, onDelete, onRefresh }) => {
  const isReadyForScaling = (campaignId) => {
    return readyForScaling.some(c => c.id === campaignId);
  };

  const calculateDaysSinceLastScale = (lastScaledDate) => {
    if (!lastScaledDate) return null;
    const lastScaled = new Date(lastScaledDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastScaled);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDaysUntilNextScale = (campaign) => {
    if (!campaign.last_scaled_date) return null;
    const lastScaled = new Date(campaign.last_scaled_date);
    const intervalDays = campaign.notification_interval_days || 7;
    const nextScaleDate = new Date(lastScaled);
    nextScaleDate.setDate(nextScaleDate.getDate() + intervalDays);
    const now = new Date();
    const diffTime = nextScaleDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSendNotification = async (campaignId) => {
    try {
      await axios.post(`${API_BASE}/notifications/send/${campaignId}`);
      alert('Notification sent successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleMarkAsScaled = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      await axios.put(`${API_BASE}/campaigns/${campaignId}`, {
        ...campaign,
        last_scaled_date: today
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign');
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="empty-state">
        <p>No campaigns yet. Add your first campaign to get started!</p>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      <div className="campaign-list-header">
        <h2>Campaigns ({campaigns.length})</h2>
        <button onClick={onRefresh} className="refresh-btn">Refresh</button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map(campaign => {
          const ready = isReadyForScaling(campaign.id);
          const daysSince = calculateDaysSinceLastScale(campaign.last_scaled_date);
          const daysUntil = calculateDaysUntilNextScale(campaign);

          return (
            <div key={campaign.id} className={`campaign-card ${ready ? 'ready-for-scaling' : ''}`}>
              {ready && <div className="ready-badge">Ready for Scaling</div>}
              
              <div className="campaign-header">
                <h3>{campaign.campaign_name}</h3>
                <div className="campaign-actions">
                  <button onClick={() => onEdit(campaign)} className="edit-btn">Edit</button>
                  <button onClick={() => onDelete(campaign.id)} className="delete-btn">Delete</button>
                </div>
              </div>

              <div className="campaign-details">
                <div className="detail-row">
                  <span className="label">Account:</span>
                  <span className="value">{campaign.account_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Launch Date:</span>
                  <span className="value">{new Date(campaign.launch_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Scaled:</span>
                  <span className="value">
                    {campaign.last_scaled_date 
                      ? new Date(campaign.last_scaled_date).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
                {daysSince !== null && (
                  <div className="detail-row">
                    <span className="label">Days Since Last Scale:</span>
                    <span className="value">{daysSince}</span>
                  </div>
                )}
                {daysUntil !== null && (
                  <div className="detail-row">
                    <span className="label">Days Until Next Scale:</span>
                    <span className={`value ${daysUntil <= 0 ? 'overdue' : ''}`}>
                      {daysUntil <= 0 ? `Overdue by ${Math.abs(daysUntil)} days` : daysUntil}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Notification Interval:</span>
                  <span className="value">{campaign.notification_interval_days || 7} days</span>
                </div>
              </div>

              <div className="campaign-actions-footer">
                <button 
                  onClick={() => handleSendNotification(campaign.id)}
                  className="notification-btn"
                  disabled={!ready}
                >
                  Send Notification
                </button>
                <button 
                  onClick={() => handleMarkAsScaled(campaign.id)}
                  className="mark-scaled-btn"
                >
                  Mark as Scaled Today
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignList;


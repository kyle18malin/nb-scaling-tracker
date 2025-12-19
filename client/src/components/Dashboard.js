import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const Dashboard = ({ onNavigateToCampaigns }) => {
  const [readyForScaling, setReadyForScaling] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    upcoming: 0,
    neverScaled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all campaigns
      const allCampaigns = await axios.get(`${API_BASE}/campaigns`);
      
      // Get campaigns ready for scaling (only active)
      const readyResponse = await axios.get(`${API_BASE}/campaigns/ready-for-scaling/check`);
      const ready = readyResponse.data;
      
      // Calculate upcoming (ready in next 3 days) - only active campaigns
      const now = new Date();
      const upcomingCampaigns = allCampaigns.data.filter(campaign => {
        if (campaign.status !== 'active') return false;
        if (!campaign.last_scaled_date) return false;
        const lastScaled = new Date(campaign.last_scaled_date);
        const intervalDays = campaign.notification_interval_days || 7;
        const nextScaleDate = new Date(lastScaled);
        nextScaleDate.setDate(nextScaleDate.getDate() + intervalDays);
        const daysUntil = Math.ceil((nextScaleDate - now) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 3;
      });

      // Calculate stats (only active campaigns for scaling stats)
      const activeCampaigns = allCampaigns.data.filter(c => c.status === 'active');
      const neverScaled = activeCampaigns.filter(c => !c.last_scaled_date).length;

      setReadyForScaling(ready);
      setUpcoming(upcomingCampaigns);
      setStats({
        total: allCampaigns.data.length,
        ready: ready.length,
        upcoming: upcomingCampaigns.length,
        neverScaled,
        active: activeCampaigns.length,
        maintenance: allCampaigns.data.filter(c => c.status === 'maintenance').length,
        loser: allCampaigns.data.filter(c => c.status === 'loser').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAllNotifications = async () => {
    try {
      await axios.post(`${API_BASE}/notifications/send-all-ready`);
      alert('All notifications logged successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications: ' + (error.response?.data?.error || error.message));
    }
  };

  const calculateDaysOverdue = (campaign) => {
    if (!campaign.last_scaled_date) return null;
    const lastScaled = new Date(campaign.last_scaled_date);
    const intervalDays = campaign.notification_interval_days || 7;
    const nextScaleDate = new Date(lastScaled);
    nextScaleDate.setDate(nextScaleDate.getDate() + intervalDays);
    const now = new Date();
    const diffTime = now - nextScaleDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysUntil = (campaign) => {
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

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Scaling Dashboard</h2>
        <button onClick={fetchDashboardData} className="refresh-btn">Refresh</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Campaigns</div>
        </div>
        <div className="stat-card ready">
          <div className="stat-value">{stats.ready}</div>
          <div className="stat-label">Ready for Scaling</div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming (Next 3 Days)</div>
        </div>
        <div className="stat-card never-scaled">
          <div className="stat-value">{stats.neverScaled}</div>
          <div className="stat-label">Never Scaled</div>
        </div>
      </div>

      {/* Ready for Scaling Section */}
      {readyForScaling.length > 0 ? (
        <div className="dashboard-section ready-section">
          <div className="section-header">
            <h3>🚨 Campaigns Ready for Scaling ({readyForScaling.length})</h3>
            <button onClick={handleSendAllNotifications} className="send-all-btn">
              Log All Notifications
            </button>
          </div>
          <div className="campaigns-list">
            {readyForScaling.map(campaign => {
              const daysOverdue = calculateDaysOverdue(campaign);
              return (
                <div key={campaign.id} className="dashboard-campaign-card urgent">
                  <div className="campaign-info">
                    <div className="campaign-name-row">
                      <strong>{campaign.campaign_name}</strong>
                      <span className="badge overdue">Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="campaign-details">
                      <span className="account-name">{campaign.account_name}</span>
                      <span className="separator">•</span>
                      <span>Last scaled: {new Date(campaign.last_scaled_date).toLocaleDateString()}</span>
                      <span className="separator">•</span>
                      <span>Interval: {campaign.notification_interval_days || 7} days</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigateToCampaigns(campaign.id)} 
                    className="view-campaign-btn"
                  >
                    View Campaign
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="dashboard-section ready-section empty">
          <div className="section-header">
            <h3>✅ No Campaigns Ready for Scaling</h3>
          </div>
          <p className="empty-message">All campaigns are up to date!</p>
        </div>
      )}

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <div className="dashboard-section upcoming-section">
          <div className="section-header">
            <h3>📅 Upcoming Scaling (Next 3 Days)</h3>
          </div>
          <div className="campaigns-list">
            {upcoming.map(campaign => {
              const daysUntil = calculateDaysUntil(campaign);
              return (
                <div key={campaign.id} className="dashboard-campaign-card upcoming">
                  <div className="campaign-info">
                    <div className="campaign-name-row">
                      <strong>{campaign.campaign_name}</strong>
                      <span className="badge upcoming-badge">In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="campaign-details">
                      <span className="account-name">{campaign.account_name}</span>
                      <span className="separator">•</span>
                      <span>Last scaled: {new Date(campaign.last_scaled_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigateToCampaigns(campaign.id)} 
                    className="view-campaign-btn"
                  >
                    View Campaign
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button onClick={() => onNavigateToCampaigns()} className="action-btn">
            View All Campaigns
          </button>
          <button onClick={() => onNavigateToCampaigns('add')} className="action-btn">
            Add New Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


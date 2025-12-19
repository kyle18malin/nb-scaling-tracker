import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import CampaignList from './components/CampaignList';
import CampaignForm from './components/CampaignForm';
import Settings from './components/Settings';
import NotificationHistory from './components/NotificationHistory';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [readyForScaling, setReadyForScaling] = useState([]);

  useEffect(() => {
    fetchCampaigns();
    checkReadyForScaling();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const checkReadyForScaling = async () => {
    try {
      const response = await axios.get(`${API_BASE}/campaigns/ready-for-scaling/check`);
      setReadyForScaling(response.data);
    } catch (error) {
      console.error('Error checking ready for scaling:', error);
    }
  };

  const handleCampaignSaved = () => {
    fetchCampaigns();
    checkReadyForScaling();
    setEditingCampaign(null);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setActiveTab('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await axios.delete(`${API_BASE}/campaigns/${id}`);
        fetchCampaigns();
        checkReadyForScaling();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
      }
    }
  };

  const handleSendNotifications = async () => {
    try {
      await axios.post(`${API_BASE}/notifications/send-all-ready`);
      alert('Notifications sent successfully!');
      checkReadyForScaling();
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Newsbreak Campaign Scaling Tracker</h1>
      </header>

      <nav className="App-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'campaigns' ? 'active' : ''} 
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button 
          className={activeTab === 'form' ? 'active' : ''} 
          onClick={() => {
            setEditingCampaign(null);
            setActiveTab('form');
          }}
        >
          {editingCampaign ? 'Edit Campaign' : 'Add Campaign'}
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          Notification History
        </button>
      </nav>

      {readyForScaling.length > 0 && activeTab !== 'dashboard' && (
        <div className="alert-banner">
          <strong>{readyForScaling.length} campaign(s) ready for scaling!</strong>
          <button onClick={() => setActiveTab('dashboard')} className="send-notifications-btn">
            View Dashboard
          </button>
        </div>
      )}

      <main className="App-main">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigateToCampaigns={(campaignId) => {
              if (campaignId === 'add') {
                setEditingCampaign(null);
                setActiveTab('form');
              } else if (campaignId) {
                const campaign = campaigns.find(c => c.id === campaignId);
                if (campaign) {
                  setEditingCampaign(campaign);
                  setActiveTab('campaigns');
                } else {
                  setActiveTab('campaigns');
                }
              } else {
                setActiveTab('campaigns');
              }
            }}
          />
        )}
        {activeTab === 'campaigns' && (
          <CampaignList 
            campaigns={campaigns}
            readyForScaling={readyForScaling}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={fetchCampaigns}
          />
        )}
        {activeTab === 'form' && (
          <CampaignForm 
            campaign={editingCampaign}
            onSave={handleCampaignSaved}
            onCancel={() => {
              setEditingCampaign(null);
              setActiveTab('campaigns');
            }}
          />
        )}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'history' && <NotificationHistory />}
      </main>
    </div>
  );
}

export default App;


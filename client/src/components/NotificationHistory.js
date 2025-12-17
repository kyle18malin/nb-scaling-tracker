import React, { useState, useEffect } from 'react';
import './NotificationHistory.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const NotificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-history">
        <div className="loading">Loading notification history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="notification-history">
        <div className="empty-state">
          <p>No notification history yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-history">
      <div className="history-header">
        <h2>Notification History</h2>
        <button onClick={fetchHistory} className="refresh-btn">Refresh</button>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Sent At</th>
              <th>Account Name</th>
              <th>Campaign Name</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.sent_at).toLocaleString()}</td>
                <td>{item.account_name}</td>
                <td>{item.campaign_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationHistory;


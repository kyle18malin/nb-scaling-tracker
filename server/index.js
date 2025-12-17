require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const campaignsRouter = require('./routes/campaigns');
const settingsRouter = require('./routes/settings');
const notificationsRouter = require('./routes/notifications');
const cronJobs = require('./cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and start server
db.init()
  .then(() => {
    // Routes
    app.use('/api/campaigns', campaignsRouter);
    app.use('/api/settings', settingsRouter);
    app.use('/api/notifications', notificationsRouter);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Serve static files from React app in production
    if (process.env.NODE_ENV === 'production') {
      const clientBuildPath = path.join(__dirname, '../client/build');
      app.use(express.static(clientBuildPath));
      
      // Serve React app for all non-API routes
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    }

    // Start cron jobs
    cronJobs.start();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });


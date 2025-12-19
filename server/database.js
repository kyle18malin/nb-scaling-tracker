const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database.db');

let db = null;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      
      // Create tables
      db.serialize(() => {
        // Campaigns table
        db.run(`CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_name TEXT NOT NULL,
          campaign_name TEXT NOT NULL,
          launch_date TEXT NOT NULL,
          last_scaled_date TEXT,
          notification_interval_days INTEGER DEFAULT 7,
          status TEXT DEFAULT 'active',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Add status column to existing campaigns if it doesn't exist
        db.run(`ALTER TABLE campaigns ADD COLUMN status TEXT DEFAULT 'active'`, (err) => {
          // Ignore error if column already exists
        });

        // Settings table for global notification preferences
        db.run(`CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Notifications log table
        db.run(`CREATE TABLE IF NOT EXISTS notifications_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER,
          account_name TEXT NOT NULL,
          campaign_name TEXT NOT NULL,
          sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        )`);

        // Insert default settings
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
          ('google_sheet_id', ''),
          ('default_notification_interval_days', '7')
        `, (err) => {
          if (err) {
            console.error('Error inserting default settings:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return db;
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  init,
  getDb,
  query,
  run
};


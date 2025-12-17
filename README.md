# Newsbreak Campaign Scaling Tracker

A web application to track Newsbreak ad campaigns, monitor when they were launched and last scaled, and automatically send notifications to Google Sheets when it's time to scale again.

## Features

- ✅ **Campaign Management**: Add, edit, and delete campaigns with account name, campaign name, launch date, and last scaled date
- ✅ **Customizable Notification Intervals**: Set different notification intervals for each campaign (default: 7 days)
- ✅ **Google Sheets Integration**: Automatically send notifications to Google Sheets with account name and campaign name
- ✅ **Automatic Notifications**: Daily cron job checks for campaigns ready for scaling and sends notifications
- ✅ **Manual Notifications**: Send notifications manually for specific campaigns or all ready campaigns
- ✅ **Notification History**: View a log of all sent notifications
- ✅ **Visual Indicators**: Campaigns ready for scaling are highlighted with visual badges
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Project with Google Sheets API enabled
- Google OAuth 2.0 credentials

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd NB_ScalingTracker
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GOOGLE_SHEETS_REDIRECT_URI=http://localhost:5000/auth/callback
   ```

## Google Sheets API Setup

To enable Google Sheets notifications, you need to set up OAuth 2.0 credentials:

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Sheets API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5000/auth/callback`
   - Save your Client ID and Client Secret

4. **Get a Refresh Token:**
   You'll need to obtain a refresh token using the OAuth flow. You can use tools like:
   - [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Or use a script to generate it

5. **Get Your Google Sheet ID:**
   - Open your Google Sheet
   - The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy the `[SHEET_ID]` part

6. **Configure in the App:**
   - Start the application
   - Go to the "Settings" tab
   - Enter your Google Sheet ID, Client ID, Client Secret, and Refresh Token
   - Save the settings

## Running the Application

### Development Mode (with hot reload)

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

## Usage

### Adding a Campaign

1. Click on the "Add Campaign" tab
2. Fill in the required fields:
   - **Account Name**: The account associated with the campaign
   - **Campaign Name**: Name of the campaign
   - **Launch Date**: When the campaign was launched
   - **Last Scaled Date**: When the campaign was last scaled (optional)
   - **Notification Interval**: Days after last scale to send notification (default: 7)
3. Click "Create"

### Managing Campaigns

- **View Campaigns**: All campaigns are displayed on the main "Campaigns" tab
- **Edit Campaign**: Click the "Edit" button on any campaign card
- **Delete Campaign**: Click the "Delete" button (with confirmation)
- **Mark as Scaled**: Click "Mark as Scaled Today" to update the last scaled date
- **Send Notification**: Click "Send Notification" for campaigns ready for scaling

### Automatic Notifications

The application runs a daily cron job at 9 AM (Eastern Time) that:
- Checks all campaigns for scaling readiness
- Sends notifications to Google Sheets for campaigns that have passed their notification interval
- Logs all sent notifications

### Manual Notifications

- **Single Campaign**: Click "Send Notification" on a campaign card
- **All Ready Campaigns**: Click the "Send Notifications to Google Sheet" button in the alert banner

### Settings

Configure:
- Google Sheets credentials (Sheet ID, Client ID, Client Secret, Refresh Token)
- Default notification interval for new campaigns

## Project Structure

```
NB_ScalingTracker/
├── server/
│   ├── index.js              # Main server file
│   ├── database.js           # SQLite database setup
│   ├── cron.js               # Scheduled notification jobs
│   ├── routes/
│   │   ├── campaigns.js      # Campaign CRUD endpoints
│   │   ├── settings.js       # Settings endpoints
│   │   └── notifications.js  # Notification endpoints
│   └── services/
│       └── googleSheets.js   # Google Sheets integration
├── client/
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   └── components/
│   │       ├── CampaignList.js
│   │       ├── CampaignForm.js
│   │       ├── Settings.js
│   │       └── NotificationHistory.js
│   └── public/
└── database.db                # SQLite database (created automatically)
```

## API Endpoints

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/ready-for-scaling/check` - Get campaigns ready for scaling

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get single setting
- `PUT /api/settings/:key` - Update setting

### Notifications
- `POST /api/notifications/send/:campaignId` - Send notification for specific campaign
- `POST /api/notifications/send-all-ready` - Send notifications for all ready campaigns
- `GET /api/notifications/history` - Get notification history

## Database Schema

### campaigns
- `id` (INTEGER PRIMARY KEY)
- `account_name` (TEXT)
- `campaign_name` (TEXT)
- `launch_date` (TEXT)
- `last_scaled_date` (TEXT)
- `notification_interval_days` (INTEGER)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### settings
- `id` (INTEGER PRIMARY KEY)
- `key` (TEXT UNIQUE)
- `value` (TEXT)
- `updated_at` (TEXT)

### notifications_log
- `id` (INTEGER PRIMARY KEY)
- `campaign_id` (INTEGER)
- `account_name` (TEXT)
- `campaign_name` (TEXT)
- `sent_at` (TEXT)

## Troubleshooting

### Google Sheets Not Working
- Verify your credentials are correct in Settings
- Check that the Google Sheet ID is correct
- Ensure the Google Sheets API is enabled in your Google Cloud Project
- Verify your refresh token is valid and not expired

### Database Issues
- Delete `database.db` to reset the database (this will delete all data)
- Check file permissions in the project directory

### Port Already in Use
- Change the `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

## Hosting & Deployment

This application can be hosted on various platforms. Here are the best **cheap/free** options with **easy Git-based deployments**:

### 🚀 Recommended: Railway (Easiest & Free Tier Available)

**Cost:** Free tier available, then $5/month  
**Deployment:** Automatic from Git push  
**Best for:** Quick setup, zero configuration

1. **Sign up at [Railway.app](https://railway.app)** (free tier available)
2. **Create a new project** and connect your GitHub/GitLab repository
3. **Add environment variables** in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT` (auto-set by Railway)
   - `GOOGLE_SHEETS_REDIRECT_URI` (use your Railway URL + `/auth/callback`)
   - Any other env vars you need
4. **Deploy:** Railway automatically detects the `railway.json` config and deploys
5. **Updates:** Just push to your Git repository - Railway auto-deploys!

**Note:** Update your Google OAuth redirect URI in Google Cloud Console to match your Railway URL.

---

### 🎨 Render (Great Free Tier)

**Cost:** Free tier available, then $7/month  
**Deployment:** Automatic from Git push  
**Best for:** Reliable free hosting

1. **Sign up at [Render.com](https://render.com)** (free tier available)
2. **Create a new Web Service** and connect your repository
3. **Configure:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `Node`
4. **Add environment variables** in Render dashboard
5. **Add a Disk** (for SQLite database persistence):
   - Name: `database`
   - Mount Path: `/opt/render/project/src`
   - Size: 1GB
6. **Deploy:** Render uses the `render.yaml` config automatically
7. **Updates:** Push to Git - Render auto-deploys!

---

### ✈️ Fly.io (Good Free Tier)

**Cost:** Free tier available (3 shared VMs)  
**Deployment:** Via Fly CLI or GitHub Actions  
**Best for:** Global edge deployment

1. **Install Fly CLI:** `curl -L https://fly.io/install.sh | sh`
2. **Sign up:** `fly auth signup`
3. **Deploy:** `fly launch` (uses `fly.toml` config)
4. **Set secrets:** `fly secrets set KEY=value`
5. **Updates:** `fly deploy` or set up GitHub Actions

---

### 🐳 Docker Deployment (Any Platform)

The app includes a `Dockerfile` for containerized deployment:

**Build:**
```bash
docker build -t nb-scaling-tracker .
```

**Run:**
```bash
docker run -p 8080:8080 --env-file .env nb-scaling-tracker
```

Works on:
- **DigitalOcean App Platform** ($5/month)
- **AWS ECS/Fargate**
- **Google Cloud Run** (pay-per-use, very cheap)
- **Azure Container Instances**
- Any Docker-compatible platform

---

### 🔄 Easy Updates (Git-Based Deployment)

All recommended platforms support **automatic deployments** from Git:

1. **Push to GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Platform automatically:**
   - Detects the push
   - Builds the application
   - Deploys the new version
   - Restarts the service

**No manual deployment needed!** Just push code and it updates automatically.

---

### 📝 Environment Variables for Production

Make sure to set these in your hosting platform:

```env
NODE_ENV=production
PORT=8080  # (or auto-set by platform)
GOOGLE_SHEETS_REDIRECT_URI=https://your-app-url.com/auth/callback
```

**Important:** Update your Google OAuth redirect URI in Google Cloud Console to match your production URL!

---

### 💾 Database Persistence

**SQLite Database:** The `database.db` file needs to persist between deployments.

- **Railway:** Automatically persists files in the project directory
- **Render:** Use a Disk (configured in `render.yaml`)
- **Fly.io:** Use a volume: `fly volumes create data`
- **Docker:** Mount a volume for `/app/database.db`

---

### 🔧 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure all environment variables
- [ ] Update Google OAuth redirect URI
- [ ] Test Google Sheets integration
- [ ] Verify cron jobs are running (check logs)
- [ ] Set up database persistence (if needed)
- [ ] Configure custom domain (optional)

---

## License

MIT

## Support

For issues or questions, please check the code comments or create an issue in the repository.


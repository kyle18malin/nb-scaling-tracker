# Deployment Guide

Quick reference for deploying the Newsbreak Campaign Scaling Tracker.

## Quick Start: Railway (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects and deploys!

3. **Set Environment Variables:**
   - In Railway dashboard, go to Variables tab
   - Add:
     ```
     NODE_ENV=production
     GOOGLE_SHEETS_REDIRECT_URI=https://YOUR_APP.railway.app/auth/callback
     ```

4. **Update Google OAuth:**
   - Go to Google Cloud Console
   - Update OAuth redirect URI to: `https://YOUR_APP.railway.app/auth/callback`

5. **Done!** Your app is live. Push to GitHub to update automatically.

---

## Quick Start: Render

1. **Push code to GitHub** (same as above)

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render auto-detects `render.yaml` config

3. **Add Disk for Database:**
   - In Render dashboard → Settings → Disks
   - Add disk: Name `database`, Mount `/opt/render/project/src`, Size 1GB

4. **Set Environment Variables** (same as Railway)

5. **Update Google OAuth** (same as Railway)

---

## Environment Variables

Required for all platforms:

```env
NODE_ENV=production
GOOGLE_SHEETS_REDIRECT_URI=https://your-app-url.com/auth/callback
```

Optional (can be set in app Settings UI):
- Google Sheet ID
- Google Client ID
- Google Client Secret  
- Google Refresh Token

---

## Updating the App

**All platforms support automatic deployments:**

1. Make your changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your update"
   git push
   ```
3. Platform automatically builds and deploys (usually takes 2-5 minutes)

**That's it!** No manual deployment steps needed.

---

## Platform Comparison

| Platform | Free Tier | Cost After | Ease | Best For |
|----------|-----------|------------|------|----------|
| **Railway** | ✅ Yes | $5/mo | ⭐⭐⭐⭐⭐ | Easiest setup |
| **Render** | ✅ Yes | $7/mo | ⭐⭐⭐⭐ | Reliable free tier |
| **Fly.io** | ✅ Yes | Pay-as-you-go | ⭐⭐⭐ | Global edge |
| **DigitalOcean** | ❌ No | $5/mo | ⭐⭐⭐⭐ | Simple pricing |

---

## Troubleshooting

### App won't start
- Check environment variables are set
- Check build logs in platform dashboard
- Verify `NODE_ENV=production` is set

### Database resets on deploy
- Ensure persistent storage is configured (Disk/Volume)
- Check database path is in persistent directory

### Google Sheets not working
- Verify redirect URI matches production URL
- Check all Google credentials are set correctly
- Test in Settings page

### Cron jobs not running
- Check platform supports background processes
- Some platforms require paid tier for cron
- Consider using external cron service (cron-job.org)

---

## Need Help?

Check the main README.md for detailed setup instructions.


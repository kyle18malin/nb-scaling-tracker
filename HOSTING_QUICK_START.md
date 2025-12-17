# 🚀 Quick Hosting Guide

## Best Options (Ranked by Ease)

### 1. Railway ⭐ RECOMMENDED
**Why:** Easiest setup, free tier, auto-deploys from Git

**Steps:**
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add env vars: `NODE_ENV=production`
4. Done! Updates automatically on every Git push.

**Cost:** Free tier → $5/month after

---

### 2. Render
**Why:** Great free tier, reliable

**Steps:**
1. Push code to GitHub  
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo (auto-detects `render.yaml`)
4. Add Disk for database (Settings → Disks)
5. Add env vars
6. Done!

**Cost:** Free tier → $7/month after

---

### 3. Fly.io
**Why:** Global edge, good free tier

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly launch` (uses `fly.toml`)
3. Set secrets: `fly secrets set KEY=value`
4. Done!

**Cost:** Free tier (3 VMs) → Pay-as-you-go

---

## How Updates Work

**All platforms:** Just push to Git!

```bash
git add .
git commit -m "Update"
git push
```

Platform automatically:
- ✅ Detects the push
- ✅ Builds your app
- ✅ Deploys new version
- ✅ Restarts service

**No manual steps needed!**

---

## Required Environment Variables

Set these in your platform's dashboard:

```env
NODE_ENV=production
GOOGLE_SHEETS_REDIRECT_URI=https://your-app-url.com/auth/callback
```

**Important:** Update Google OAuth redirect URI in Google Cloud Console!

---

## Database Persistence

- **Railway:** Auto-persists (no config needed)
- **Render:** Add Disk (configured in `render.yaml`)
- **Fly.io:** Use volume: `fly volumes create data`

---

## Need Help?

See `DEPLOYMENT.md` for detailed instructions or `README.md` for full documentation.


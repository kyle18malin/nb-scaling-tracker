# 🚂 Quick Railway Deployment Checklist

## ✅ Step 1: Code is on GitHub
- [x] Repository created: https://github.com/kyle18malin/nb-scaling-tracker.git
- [x] Code pushed successfully

## 📋 Next Steps:

### 1. Sign up for Railway
- Go to: https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Deploy
- Click "New Project" → "Deploy from GitHub repo"
- Select `nb-scaling-tracker`
- Wait for build (2-5 minutes)

### 3. Get Your URL
- Project → Service → Settings → Domains
- Copy your Railway URL (e.g., `https://nb-scaling-tracker-production-xxxx.up.railway.app`)

### 4. Set Environment Variables
In Railway → Variables tab, add:
```
NODE_ENV = production
GOOGLE_SHEETS_REDIRECT_URI = https://YOUR_RAILWAY_URL/auth/callback
```

### 5. Update Google OAuth
- Google Cloud Console → Credentials
- Add redirect URI: `https://YOUR_RAILWAY_URL/auth/callback`

### 6. Test!
- Visit your Railway URL
- Configure Google Sheets in Settings
- Add a test campaign

---

**That's it!** Your app will be live and auto-updates on every `git push` 🎉


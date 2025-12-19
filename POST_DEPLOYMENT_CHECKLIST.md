# ✅ Post-Deployment Checklist

## Your app is live! Follow these steps:

### 1. Get Your Railway URL
- Railway Dashboard → Project → Service → Settings → Domains
- Copy your URL: `https://YOUR_APP.up.railway.app`

### 2. Set Environment Variables
In Railway → Variables tab, add:
- `NODE_ENV = production`
- `GOOGLE_SHEETS_REDIRECT_URI = https://YOUR_APP.up.railway.app/auth/callback`

### 3. Update Google OAuth
- Google Cloud Console → Credentials → Your OAuth Client
- Add redirect URI: `https://YOUR_APP.up.railway.app/auth/callback`

### 4. Configure App
- Visit your Railway URL
- Go to Settings tab
- Enter Google Sheets credentials
- Save settings

### 5. Test
- Add a test campaign
- Send a notification
- Check your Google Sheet

---

**Done!** Your app auto-updates on every `git push` 🎉


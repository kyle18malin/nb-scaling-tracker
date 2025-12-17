# 🚂 Railway Deployment - Step by Step Guide

Follow these steps to deploy your app to Railway.

## Step 1: Create GitHub Repository

1. **Go to GitHub:**
   - Visit [github.com](https://github.com) and sign in
   - Click the "+" icon in the top right → "New repository"

2. **Create the repository:**
   - Repository name: `nb-scaling-tracker` (or any name you prefer)
   - Description: "Newsbreak Campaign Scaling Tracker"
   - Choose **Public** or **Private** (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Copy the repository URL:**
   - GitHub will show you commands, copy the URL (looks like: `https://github.com/YOUR_USERNAME/nb-scaling-tracker.git`)

---

## Step 2: Push Code to GitHub

Run these commands in your terminal (replace with your actual GitHub URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/nb-scaling-tracker.git
git branch -M main
git push -u origin main
```

**Note:** You'll need to authenticate with GitHub (use a personal access token if prompted)

---

## Step 3: Sign Up for Railway

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Click "Start a New Project" or "Login"

2. **Sign up:**
   - Click "Login with GitHub"
   - Authorize Railway to access your GitHub account
   - Complete the signup process

---

## Step 4: Deploy on Railway

1. **Create New Project:**
   - In Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - You'll see a list of your repositories
   - Click on `nb-scaling-tracker` (or whatever you named it)

2. **Railway will automatically:**
   - Detect your project
   - Start building (this takes 2-5 minutes)
   - Deploy your app

3. **Wait for deployment:**
   - Watch the build logs in Railway dashboard
   - You'll see it installing dependencies and building
   - When it says "Deployed", you're ready for the next step!

---

## Step 5: Get Your App URL

1. **Find your app URL:**
   - In Railway dashboard, click on your project
   - Click on the service (usually named after your repo)
   - Go to the "Settings" tab
   - Scroll down to "Domains"
   - You'll see a URL like: `https://nb-scaling-tracker-production.up.railway.app`
   - **Copy this URL** - you'll need it!

2. **Or generate a custom domain:**
   - In the same "Domains" section
   - Click "Generate Domain" to get a cleaner URL
   - Copy the generated URL

---

## Step 6: Configure Environment Variables

1. **In Railway dashboard:**
   - Go to your project → Service → "Variables" tab
   - Click "New Variable"

2. **Add these variables:**
   
   **Required:**
   ```
   NODE_ENV = production
   ```
   
   **For Google Sheets (you'll set these in the app UI later, but you can add the redirect URI now):**
   ```
   GOOGLE_SHEETS_REDIRECT_URI = https://YOUR_RAILWAY_URL/auth/callback
   ```
   (Replace `YOUR_RAILWAY_URL` with the URL from Step 5)

3. **Save:**
   - Railway will automatically redeploy when you add variables

---

## Step 7: Update Google OAuth Settings

1. **Go to Google Cloud Console:**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project
   - Go to "APIs & Services" → "Credentials"

2. **Edit your OAuth 2.0 Client:**
   - Click on your OAuth client ID
   - Under "Authorized redirect URIs", click "Add URI"
   - Add: `https://YOUR_RAILWAY_URL/auth/callback`
   - (Use the URL from Step 5)
   - Click "Save"

---

## Step 8: Test Your App

1. **Visit your Railway URL:**
   - Open the URL from Step 5 in your browser
   - You should see your app!

2. **Configure Google Sheets:**
   - Go to the "Settings" tab in your app
   - Enter your Google Sheet ID
   - Enter your Google Client ID, Client Secret, and Refresh Token
   - Save settings

3. **Test:**
   - Add a test campaign
   - Try sending a notification
   - Check your Google Sheet to see if it worked!

---

## Step 9: Future Updates (Super Easy!)

Whenever you make changes:

1. **Make your changes locally**

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your update description"
   git push
   ```

3. **Railway automatically:**
   - Detects the push
   - Builds your app
   - Deploys the new version
   - Restarts the service

**That's it!** No manual deployment needed. Just push to GitHub and Railway handles the rest.

---

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Make sure all dependencies are in `package.json`
- Verify `NODE_ENV=production` is set

### App Won't Start
- Check the deployment logs
- Verify environment variables are set correctly
- Make sure the port is set (Railway auto-sets `PORT`)

### Google Sheets Not Working
- Verify redirect URI matches your Railway URL exactly
- Check all Google credentials are correct in Settings
- Make sure Google Sheets API is enabled

### Database Issues
- Railway persists files automatically, but if you redeploy from scratch, you'll lose data
- Consider backing up `database.db` periodically
- Or upgrade to a persistent database service later

---

## Need Help?

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check the main README.md for app-specific help

---

## Quick Reference

**Your Railway URL:** `https://YOUR_APP.up.railway.app`

**Required Env Vars:**
- `NODE_ENV=production`
- `GOOGLE_SHEETS_REDIRECT_URI=https://YOUR_APP.up.railway.app/auth/callback`

**Update Command:**
```bash
git push
```


# Deploy to Netlify - Complete Beginner Guide

## What You'll Deploy

- **Client (React)** → Netlify (Free)
- **Server (Node.js)** → Render (Free)
- **Database** → MongoDB Atlas (Free)

Total cost: **$0/month** 🎉

---

## Part 1: Deploy Client to Netlify (5 minutes)

### Step 1: Create Netlify Account
1. Go to https://www.netlify.com/
2. Click "Sign up" (use GitHub account - easier!)
3. Authorize Netlify to access your GitHub

### Step 2: Push Your Code to GitHub
```bash
# In your project root
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Deploy on Netlify

**Option A: Drag & Drop (Easiest)**
1. Build your app locally:
   ```bash
   cd client
   npm run build
   ```

2. Go to https://app.netlify.com/drop
3. Drag the `client/dist` folder onto the page
4. Done! Your site is live at `https://random-name.netlify.app`

**Option B: Connect GitHub (Recommended)**
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
6. Click "Deploy site"
7. Wait 2-3 minutes
8. Your site is live! 🎉

### Step 4: Add Environment Variable
1. In Netlify dashboard, go to "Site settings"
2. Click "Environment variables"
3. Add variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-server-url.com` (we'll get this in Part 2)
4. Click "Save"
5. Trigger redeploy: "Deploys" → "Trigger deploy" → "Deploy site"

---

## Part 2: Deploy Server to Render (10 minutes)

### Step 1: Create Render Account
1. Go to https://render.com/
2. Click "Get Started" (use GitHub account)
3. Authorize Render

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `smart-investment-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Click "Create Web Service"

### Step 3: Add Environment Variables
In Render dashboard, go to "Environment":
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-uri-from-part-3
JWT_SECRET=your-super-secret-random-string-change-this
ML_SERVICE_URL=http://localhost:8000
```

### Step 4: Get Your Server URL
- After deployment, you'll get: `https://smart-investment-api.onrender.com`
- Copy this URL

### Step 5: Update Netlify
1. Go back to Netlify
2. Update `REACT_APP_API_URL` to your Render URL
3. Redeploy

---

## Part 3: Setup MongoDB Atlas (5 minutes)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up (use Google account)

### Step 2: Create Cluster
1. Choose "Free" tier (M0)
2. Select region closest to you
3. Click "Create Cluster"
4. Wait 3-5 minutes

### Step 3: Create Database User
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `admin`
5. Password: Generate secure password (save it!)
6. User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Allow Network Access
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/smart-investment?retryWrites=true&w=majority`

### Step 6: Update Render
1. Go back to Render dashboard
2. Update `MONGODB_URI` environment variable
3. Click "Save Changes"
4. Service will auto-redeploy

---

## Part 4: Seed Database (2 minutes)

After everything is deployed:

```bash
# Seed with mock data (instant)
curl -X GET https://your-server-url.onrender.com/api/data/mock-seed

# Or sync with live MFApi data (takes 60 seconds)
curl -X POST https://your-server-url.onrender.com/api/data/mfapi/quick-sync
```

---

## Part 5: Test Your Live App! 🎉

1. Open your Netlify URL: `https://your-app.netlify.app`
2. Register a new account
3. Enter investment amount and risk preference
4. Get recommendations!

---

## Troubleshooting

### Client shows "Cannot connect to server"
- Check `REACT_APP_API_URL` in Netlify environment variables
- Make sure it points to your Render URL
- Redeploy Netlify site

### Server shows "Cannot connect to database"
- Check `MONGODB_URI` in Render environment variables
- Verify MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Check database user credentials

### Server is slow on first request
- Render free tier sleeps after 15 minutes of inactivity
- First request wakes it up (takes 30-60 seconds)
- Subsequent requests are fast

---

## Custom Domain (Optional)

### On Netlify:
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `myapp.com`)
4. Follow DNS configuration instructions
5. Free SSL certificate included!

---

## Automatic Deployments

Both Netlify and Render auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Netlify and Render automatically deploy! 🚀
```

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Netlify | Free | $0 |
| Render | Free | $0 |
| MongoDB Atlas | Free (M0) | $0 |
| **Total** | | **$0/month** |

**Limits:**
- Netlify: 100GB bandwidth/month
- Render: 750 hours/month (enough for 1 service 24/7)
- MongoDB: 512MB storage

---

## Production Checklist

After deployment:

- [ ] Test registration/login
- [ ] Test investment recommendations
- [ ] Verify all 3 bucket options show
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Set up daily MFApi sync (optional)
- [ ] Add Google Analytics (optional)
- [ ] Share with friends! 🎉

---

## Need Help?

**Netlify Issues:**
- Check build logs: Netlify Dashboard → Deploys → Click on deploy
- Common fix: Clear cache and redeploy

**Render Issues:**
- Check logs: Render Dashboard → Logs tab
- Common fix: Restart service

**MongoDB Issues:**
- Check connection string format
- Verify IP whitelist includes 0.0.0.0/0
- Test connection with MongoDB Compass

---

## Summary

1. **Netlify** (Client): Drag & drop `client/dist` folder
2. **Render** (Server): Connect GitHub, set environment variables
3. **MongoDB Atlas** (Database): Create cluster, get connection string
4. **Seed Data**: Run curl command to populate database
5. **Done!** Your app is live! 🚀

**Total time: 20-30 minutes**

Your app will be live at:
- Client: `https://your-app.netlify.app`
- Server: `https://your-api.onrender.com`

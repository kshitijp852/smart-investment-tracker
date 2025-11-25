# Deploy Server to Render - Step by Step

## Your Netlify URL
✅ https://smart-investment-tracker.netlify.app

---

## Step 3: Deploy Server to Render

### 1. Create Render Account (2 min)
- Go to: https://render.com/
- Click "Get Started"
- Sign up with GitHub (recommended)
- Authorize Render to access your repositories

### 2. Create Web Service (3 min)
- Click "New +" (top right)
- Select "Web Service"
- Connect your GitHub repository: `smart-investment-complete-allsteps`
- Click "Connect"

### 3. Configure Service (2 min)
Fill in these settings:

**Name**: `smart-investment-api`

**Root Directory**: `server`

**Environment**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Plan**: Select **Free** (important!)

### 4. Add Environment Variables (3 min)
Click "Advanced" → Add these environment variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-random-string-change-this-to-something-random
MONGODB_URI=we-will-add-this-in-step-4
ML_SERVICE_URL=http://localhost:8000
```

**For JWT_SECRET**, use something random like:
```
JWT_SECRET=kj3h4k5j6h7k8j9h0k1j2h3k4j5h6k7j8h9k0
```

**Leave MONGODB_URI empty for now** - we'll add it in Step 4

### 5. Deploy!
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- You'll get a URL like: `https://smart-investment-api.onrender.com`

### 6. Copy Your Server URL
Once deployed, copy your Render URL. You'll need it!

Example: `https://smart-investment-api-xxxx.onrender.com`

---

## What to Expect

✅ Build logs will show npm install
✅ Service will start
✅ You'll see "Service is live" 
✅ First deploy takes 3-5 minutes

## Common Issues

**Build fails?**
- Check that Root Directory is set to `server`
- Verify Build Command is `npm install`

**Service won't start?**
- Check Start Command is `npm start`
- Verify environment variables are set

---

## Next Step

After your server is deployed, come back and we'll:
1. Set up MongoDB (5 min)
2. Connect everything together (2 min)
3. Test your live app! 🎉

**Let me know when your Render service is deployed!**

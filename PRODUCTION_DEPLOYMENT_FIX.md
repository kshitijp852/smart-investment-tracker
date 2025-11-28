# Production Deployment Fix Guide

## 🔴 Problem

Netlify UI loads but doesn't show buckets because the frontend is trying to connect to `localhost:5001` instead of your Render backend.

## ✅ Solution Applied

Updated `client/src/App.jsx` to use environment variables for API URLs instead of hardcoded localhost.

## 🚀 Deployment Steps

### Step 1: Set Environment Variable in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add a new variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
   
   Example: `https://smart-investment-api.onrender.com/api`

### Step 2: Rebuild and Deploy

#### Option A: Trigger Redeploy in Netlify
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

#### Option B: Push to Git (if connected)
```bash
git add .
git commit -m "Fix: Use environment variables for API URLs"
git push origin main
```

Netlify will automatically rebuild.

### Step 3: Verify Render Backend

Make sure your Render backend is running and has data:

```bash
# Check if backend is live
curl https://your-backend-url.onrender.com/api/health

# Check if data exists
curl https://your-backend-url.onrender.com/api/hybrid/stats

# Check if NAV sync is working
curl https://your-backend-url.onrender.com/api/nav/stats
```

### Step 4: Seed Data on Render (if needed)

If your Render backend has no data:

```bash
# Trigger NAV sync
curl -X POST https://your-backend-url.onrender.com/api/nav/sync

# Load mock data (if needed)
curl https://your-backend-url.onrender.com/api/data/mock-seed
```

## 🔧 Environment Variables Needed

### Netlify (Frontend)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### Render (Backend)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_investment
PORT=5001
NODE_ENV=production
ENABLE_NAV_SYNC=true
```

## 📊 Verification Checklist

After deployment, verify:

- [ ] Netlify site loads
- [ ] Can see fund statistics (57 curated, 14,113 total)
- [ ] Can generate portfolio recommendations
- [ ] Buckets display correctly
- [ ] No console errors about CORS or network
- [ ] Backend health check passes

## 🐛 Troubleshooting

### Issue 1: CORS Errors
**Symptom**: Console shows "CORS policy" errors

**Solution**: Update Render backend CORS settings in `server/src/app.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-site.netlify.app'
  ]
}));
```

### Issue 2: No Data in Production
**Symptom**: "No mutual funds available" message

**Solution**: Seed data on Render:
```bash
# Option 1: Trigger NAV sync
curl -X POST https://your-backend-url.onrender.com/api/nav/sync

# Option 2: Load mock data
curl https://your-backend-url.onrender.com/api/data/mock-seed
```

### Issue 3: Environment Variable Not Working
**Symptom**: Still connecting to localhost

**Solution**:
1. Verify environment variable is set in Netlify
2. Clear cache and redeploy
3. Check browser console for actual API URL being used

### Issue 4: Backend Not Responding
**Symptom**: Network timeout errors

**Solution**:
1. Check Render logs for errors
2. Verify MongoDB connection string
3. Ensure Render service is running (not sleeping)
4. Check if free tier has usage limits

## 🔍 Debug Commands

### Check Frontend API Configuration
Open browser console on Netlify site:
```javascript
// Should show your Render URL, not localhost
console.log(process.env.REACT_APP_API_URL);
```

### Check Backend Health
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Hybrid stats
curl https://your-backend-url.onrender.com/api/hybrid/stats

# NAV stats
curl https://your-backend-url.onrender.com/api/nav/stats
```

### Check MongoDB Connection
In Render logs, look for:
```
✓ MongoDB connected successfully
```

## 📝 Quick Fix Script

Create a file `fix-production.sh`:

```bash
#!/bin/bash

echo "🔧 Production Deployment Fix"
echo "=============================="
echo ""

# Get backend URL
read -p "Enter your Render backend URL (e.g., https://your-app.onrender.com): " BACKEND_URL

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo ""
echo "Setting up environment variables..."
echo ""
echo "1. Go to Netlify Dashboard"
echo "2. Site Settings → Environment Variables"
echo "3. Add: REACT_APP_API_URL = ${BACKEND_URL}/api"
echo ""
echo "4. Trigger redeploy: Deploys → Trigger deploy → Clear cache and deploy"
echo ""

# Test backend
echo "Testing backend..."
curl -s "${BACKEND_URL}/api/health" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is reachable"
else
    echo "❌ Backend is not reachable - check Render deployment"
fi

echo ""
echo "Testing data availability..."
curl -s "${BACKEND_URL}/api/hybrid/stats" | grep -q "curatedFunds"
if [ $? -eq 0 ]; then
    echo "✅ Data is available"
else
    echo "⚠️  No data found - run: curl -X POST ${BACKEND_URL}/api/nav/sync"
fi

echo ""
echo "=============================="
echo "Next steps:"
echo "1. Set REACT_APP_API_URL in Netlify"
echo "2. Redeploy Netlify site"
echo "3. Test at your Netlify URL"
echo ""
```

## 🎯 Expected Result

After fixing:

1. **Netlify UI loads** ✅
2. **Shows stats**: "57 Curated Funds" and "14,113 Total Funds Available" ✅
3. **Generate recommendations works** ✅
4. **Buckets display correctly** ✅
5. **No console errors** ✅

## 📚 Related Files

- `client/src/App.jsx` - Updated to use environment variables
- `client/src/services/api.js` - Already uses environment variables
- `client/netlify.toml` - Netlify configuration
- `server/src/app.js` - Backend CORS configuration

## 🔗 Useful Links

- **Netlify Environment Variables**: https://docs.netlify.com/environment-variables/overview/
- **Render Environment Variables**: https://render.com/docs/environment-variables
- **MongoDB Atlas**: https://cloud.mongodb.com/

## ✅ Final Checklist

Before going live:

- [ ] Environment variable set in Netlify
- [ ] Netlify site redeployed
- [ ] Backend is running on Render
- [ ] MongoDB is connected
- [ ] NAV data is synced (14,113 funds)
- [ ] Curated funds are loaded (57 funds)
- [ ] CORS is configured for Netlify domain
- [ ] Test portfolio generation works
- [ ] Test all major features

---

**Status**: Ready to deploy  
**Last Updated**: November 28, 2024  
**Issue**: Fixed - API URLs now use environment variables

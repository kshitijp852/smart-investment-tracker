# Quick Deployment Checklist

## 🚀 Fix "Buckets Not Showing" Issue

### The Problem
Your Netlify frontend is trying to connect to `localhost:5001` instead of your Render backend.

### The Fix (3 Steps)

#### Step 1: Set Environment Variable in Netlify
1. Go to https://app.netlify.com
2. Select your site
3. **Site settings** → **Environment variables** → **Add a variable**
4. Add:
   ```
   Key: REACT_APP_API_URL
   Value: https://YOUR-RENDER-URL.onrender.com/api
   ```
   (Replace `YOUR-RENDER-URL` with your actual Render backend URL)

#### Step 2: Redeploy Netlify
1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Clear cache and deploy site**
4. Wait for build to complete (~2 minutes)

#### Step 3: Verify It Works
1. Open your Netlify URL
2. You should see: "57 Curated Funds" and "14,113 Total Funds Available"
3. Try generating a portfolio
4. Buckets should now display!

---

## 🔧 If Backend Has No Data

If you see "No mutual funds available":

```bash
# Replace with your actual Render URL
curl -X POST https://YOUR-RENDER-URL.onrender.com/api/nav/sync
```

This will sync 14,113 funds from AMFI (~2 minutes).

---

## ✅ Quick Test

After deployment, test these URLs:

```bash
# Replace YOUR-RENDER-URL with your actual URL

# 1. Health check
curl https://YOUR-RENDER-URL.onrender.com/api/health

# 2. Check data
curl https://YOUR-RENDER-URL.onrender.com/api/hybrid/stats

# 3. Check NAV sync
curl https://YOUR-RENDER-URL.onrender.com/api/nav/stats
```

Expected response for stats:
```json
{
  "curatedFunds": 57,
  "totalFundsAvailable": 14113,
  "curatedWithRealTimeNAV": 36
}
```

---

## 🐛 Still Not Working?

### Check 1: Is environment variable set?
- Go to Netlify → Site settings → Environment variables
- Verify `REACT_APP_API_URL` is there
- Make sure it ends with `/api`

### Check 2: Did you redeploy?
- Environment variables only apply after rebuild
- Must click "Clear cache and deploy site"

### Check 3: Is backend running?
- Go to your Render dashboard
- Check if service is "Live" (not sleeping)
- Check logs for errors

### Check 4: CORS issue?
If you see CORS errors in browser console, update `server/src/app.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app'  // Add your Netlify URL
  ]
}));
```

Then redeploy Render backend.

---

## 📊 What You Should See

After successful deployment:

✅ **Homepage loads**  
✅ **Shows**: "📊 57 Curated Funds for Recommendations"  
✅ **Shows**: "✨ 14,113 Total Funds Available"  
✅ **Shows**: "🔄 36 with Real-time NAV"  
✅ **Generate recommendations works**  
✅ **Buckets display with funds**  
✅ **No console errors**  

---

## 🎯 Summary

**What was fixed**: Changed hardcoded `localhost:5001` to use environment variable  
**What you need to do**: Set `REACT_APP_API_URL` in Netlify and redeploy  
**Time required**: ~5 minutes  

---

**Need help?** Check `PRODUCTION_DEPLOYMENT_FIX.md` for detailed troubleshooting.

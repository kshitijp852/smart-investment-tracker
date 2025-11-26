# Data Switching Guide - Mock ↔ Real Data

## 🎯 Quick Commands

### Switch to Real MFApi Data
```bash
curl -X POST https://smart-investment-tracker.onrender.com/api/data/mfapi/quick-sync
```
⏱️ Takes: 40-60 seconds
📊 Result: 20 real mutual funds with live NAV data

### Switch Back to Mock Data
```bash
curl -X GET https://smart-investment-tracker.onrender.com/api/data/mock-seed
```
⏱️ Takes: 1-2 seconds
📊 Result: 51 simulated mutual funds

---

## 📋 Comparison

| Feature | Mock Data | Real Data (MFApi) |
|---------|-----------|-------------------|
| **Speed** | Instant (1-2 sec) | Slow first time (40-60 sec) |
| **Funds** | 51 diverse funds | 20 top funds |
| **Prices** | Simulated | Real NAV |
| **Updates** | Static | Daily (after market close) |
| **Reliability** | 100% | Depends on MFApi |
| **Best For** | Demos, testing | Production, real users |

---

## 🔄 Switching Workflow

### Scenario 1: Demo to Investors
```bash
# Before demo - use mock data (fast, reliable)
curl -X GET https://smart-investment-tracker.onrender.com/api/data/mock-seed

# Show the app
# Everything works instantly!
```

### Scenario 2: Real Users
```bash
# For production - use real data
curl -X POST https://smart-investment-tracker.onrender.com/api/data/mfapi/quick-sync

# Set up daily sync (optional)
# Add to cron: 0 16 * * * (4 PM IST daily)
```

### Scenario 3: Testing New Features
```bash
# Switch to mock for fast iteration
curl -X GET https://smart-investment-tracker.onrender.com/api/data/mock-seed

# Test your features
# No API delays!

# Switch back when done
curl -X POST https://smart-investment-tracker.onrender.com/api/data/mfapi/quick-sync
```

---

## 🎮 Local Development

### Use Mock Data (Recommended)
```bash
# Start server
cd server && npm run dev

# In another terminal
curl -X GET http://localhost:5001/api/data/mock-seed
```

### Use Real Data (Optional)
```bash
# Start server
cd server && npm run dev

# In another terminal
curl -X POST http://localhost:5001/api/data/mfapi/quick-sync
```

---

## 🚀 Production Setup

### Option A: Always Mock (Safest)
- No API dependencies
- Always fast
- Perfect for MVP
- Add disclaimer: "Simulated data"

### Option B: Always Real (Best for users)
- Real prices
- Daily sync via cron
- Fallback to mock if API fails

### Option C: Hybrid (Recommended)
- Start with mock
- Switch to real when needed
- Keep both options available

---

## 📊 Current Status Check

```bash
# Check what data you have
curl https://smart-investment-tracker.onrender.com/api/data/list | jq 'length'

# Check if it's mock or real
curl https://smart-investment-tracker.onrender.com/api/data/list | jq '.[0] | {name: .name, symbol: .symbol}'

# Mock data symbols: AXIS_BLUECHIP, ICICI_BLUECHIP, etc.
# Real data symbols: MF_119551, MF_122639, etc.
```

---

## ⚠️ Important Notes

### Data Persistence
- Both mock and real data go to the **same database**
- Switching **replaces** the data
- No data loss - can always re-seed

### API Limits
- MFApi: ~30 requests/minute
- Quick sync: 20 funds = safe
- Full sync: 51 funds = takes longer

### Caching
- Real data cached for 24 hours
- Mock data doesn't need caching
- Cache cleared on switch

---

## 🎯 Recommended Approach

**For Your Current Stage:**

1. **Keep mock data** for now
2. **Test with real data** occasionally
3. **Switch to real** when launching to users
4. **Keep mock** as backup

**Commands to remember:**
```bash
# Mock (fast, reliable)
curl -X GET https://smart-investment-tracker.onrender.com/api/data/mock-seed

# Real (live, accurate)
curl -X POST https://smart-investment-tracker.onrender.com/api/data/mfapi/quick-sync
```

---

## 🔧 Troubleshooting

### Real Data Not Loading?
```bash
# Check MFApi status
curl https://api.mfapi.in/mf/119551

# Check cache
curl https://smart-investment-tracker.onrender.com/api/data/cache/stats

# Clear cache and retry
curl -X POST https://smart-investment-tracker.onrender.com/api/data/cache/clear
curl -X POST https://smart-investment-tracker.onrender.com/api/data/mfapi/quick-sync
```

### Want to Go Back to Mock?
```bash
# Just re-seed mock data
curl -X GET https://smart-investment-tracker.onrender.com/api/data/mock-seed
```

---

## 📝 Summary

✅ **Easy switching** - One command each way
✅ **No data loss** - Can always re-seed
✅ **Flexible** - Use what works best
✅ **Production ready** - Both options work

**You're in control!** Switch anytime based on your needs. 🚀

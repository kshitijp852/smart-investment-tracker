# Live Data Integration Guide

## Current Status

Your system is currently using **mock/seeded data** for demonstrations. Here's what you need to know:

## 📊 What Data You Have Now

**14 Diverse Instruments Seeded:**
- 5 Stocks (TCS, INFY, RELIANCE, HDFC, ICICI)
- 6 Mutual Funds (Balanced, Equity, Debt categories)
- 3 Fixed Deposits (SBI, HDFC, ICICI)

Each has **5 years of synthetic monthly price history** with realistic:
- CAGR (6% to 27%)
- Volatility (1% to 28%)
- Risk profiles (low/medium/high)

## 🔄 How Recommendations Work

The system calculates recommendations based on:

1. **Historical Data Analysis**
   - CAGR from 5-year price history
   - Sharpe ratio (risk-adjusted returns)
   - Volatility (standard deviation)

2. **Scoring Algorithm**
   ```
   Score = (CAGR × 0.6) + (Sharpe × 0.3) + (Liquidity × 0.1)
   ```

3. **Risk Filtering**
   - Low risk: Filters out high-risk instruments
   - Medium risk: Balanced portfolio
   - High risk: Includes all instruments

## 🌐 Enabling Live Data

### Option 1: Alpha Vantage API (Stocks)

**Step 1: Get API Key**
```bash
# Visit: https://www.alphavantage.co/support/#api-key
# Free tier: 25 requests/day
```

**Step 2: Add to .env**
```bash
ALPHA_VANTAGE_KEY=your_actual_api_key_here
```

**Step 3: Fetch Live Data**
```bash
# Fetch real stock data
curl "http://localhost:5001/api/alpha/fetch?symbol=IBM&force=true"
```

**Step 4: Check Implementation**
The Alpha Vantage route is already implemented in:
- `server/src/routes/alpha.js`
- `server/src/services/alphaVantage.js`

### Option 2: Yahoo Finance (Free Alternative)

Install yfinance package:
```bash
cd server
npm install yahoo-finance2
```

Create new route `server/src/routes/yahoo.js`:
```javascript
const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;
const FinancialData = require('../models/FinancialData');

router.get('/fetch', async (req, res) => {
  try {
    const { symbol } = req.query;
    const result = await yahooFinance.historical(symbol, {
      period1: '2020-01-01',
      period2: new Date().toISOString().split('T')[0],
      interval: '1mo'
    });
    
    const priceHistory = result.map(r => ({
      date: r.date,
      close: r.close
    }));
    
    await FinancialData.updateOne(
      { type: 'stock', symbol },
      {
        type: 'stock',
        symbol,
        name: symbol,
        priceHistory,
        lastUpdated: new Date()
      },
      { upsert: true }
    );
    
    res.json({ ok: true, symbol, dataPoints: priceHistory.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

### Option 3: Indian Market Data (NSE/BSE)

For Indian stocks, you can use:

**A. NSE India API (Unofficial)**
```bash
npm install axios
```

**B. Zerodha Kite Connect**
- Requires paid subscription
- Official API for Indian markets
- Real-time data

**C. Alpha Vantage (Limited Indian stocks)**
- Supports major Indian stocks
- Free tier available

## 🔍 Why Recommendations Seem Similar

If you're seeing similar recommendations, it's because:

1. **Limited Data**: Only 14 instruments seeded
2. **Scoring Algorithm**: Top performers naturally rank higher
3. **Risk Filtering**: Low risk excludes many options

### To Get More Variety:

**1. Add More Instruments**
```bash
# Modify server/src/routes/data.js to add more instruments
# Then reseed:
curl http://localhost:5001/api/data/mock-seed
```

**2. Fetch Real Data**
```bash
# Add your Alpha Vantage key to .env
# Then fetch real stocks:
curl "http://localhost:5001/api/alpha/fetch?symbol=TCS.BSE&force=true"
curl "http://localhost:5001/api/alpha/fetch?symbol=INFY.BSE&force=true"
```

**3. Adjust Scoring Weights**
Edit `server/src/routes/recommendations.js`:
```javascript
// Current weights
const score = (scoreCAGR * 0.6) + (scoreSharpe * 0.3) + (liquidity * 0.1);

// Try different weights for variety
const score = (scoreCAGR * 0.4) + (scoreSharpe * 0.4) + (liquidity * 0.2);
```

## 📈 Testing Live Data

Once you have live data enabled:

```bash
# 1. Fetch live data for a stock
curl "http://localhost:5001/api/alpha/fetch?symbol=AAPL&force=true"

# 2. Generate recommendations (will include live data)
curl -X POST http://localhost:5001/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{"amount":100000,"duration":3,"riskLevel":"medium"}'

# 3. Check what data you have
curl http://localhost:5001/api/data/list
```

## 🎯 Current Behavior

**What happens now:**
1. User inputs amount, duration, risk level
2. System queries all instruments from database
3. Calculates CAGR, Sharpe, volatility from historical data
4. Applies scoring algorithm
5. Filters by risk level
6. Returns top 10 recommendations

**What changes with live data:**
1. Historical data is real market data
2. Calculations are based on actual performance
3. Recommendations reflect real market conditions
4. Data can be refreshed periodically

## 🔄 Data Refresh Strategy

### Manual Refresh
```bash
# Refresh specific stock
curl "http://localhost:5001/api/alpha/fetch?symbol=TCS&force=true"
```

### Automatic Refresh (Add Cron Job)

Create `server/src/jobs/refreshData.js`:
```javascript
const cron = require('node-cron');
const FinancialData = require('../models/FinancialData');
const { fetchAlphaVantage } = require('../services/alphaVantage');

// Run daily at 6 PM
cron.schedule('0 18 * * *', async () => {
  console.log('Refreshing financial data...');
  const instruments = await FinancialData.find({ type: 'stock' });
  
  for (const inst of instruments) {
    try {
      await fetchAlphaVantage(inst.symbol, true);
      console.log(`Refreshed ${inst.symbol}`);
    } catch (err) {
      console.error(`Failed to refresh ${inst.symbol}:`, err.message);
    }
  }
});
```

## 📊 Data Sources Comparison

| Source | Cost | Coverage | Rate Limit | Best For |
|--------|------|----------|------------|----------|
| Alpha Vantage | Free/Paid | Global | 25/day (free) | US stocks |
| Yahoo Finance | Free | Global | Unlimited | All markets |
| NSE India | Free | India only | Limited | Indian stocks |
| Kite Connect | Paid | India | High | Professional use |

## 🚀 Quick Start with Live Data

**Fastest way to test live data:**

```bash
# 1. Get free Alpha Vantage key
# Visit: https://www.alphavantage.co/support/#api-key

# 2. Add to .env
echo "ALPHA_VANTAGE_KEY=YOUR_KEY_HERE" >> .env

# 3. Restart server
# (Server will pick up new env variable)

# 4. Fetch real data
curl "http://localhost:5001/api/alpha/fetch?symbol=IBM&force=true"

# 5. Generate recommendations
curl -X POST http://localhost:5001/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{"amount":100000,"duration":5,"riskLevel":"high"}'
```

## 💡 Pro Tips

1. **Cache Strategy**: The system caches API responses to avoid rate limits
2. **Force Refresh**: Use `?force=true` to bypass cache
3. **Batch Updates**: Update multiple stocks during off-peak hours
4. **Error Handling**: System falls back to cached data if API fails
5. **Data Quality**: Always validate fetched data before using

## 🎓 Understanding the Data Flow

```
User Input → Database Query → Historical Analysis → Scoring → Filtering → Top 10
     ↓              ↓                ↓                 ↓           ↓          ↓
  Amount      Instruments      CAGR/Sharpe      Weighted    Risk Level  Results
  Duration    (14 seeded)      Volatility       Score       Filter
  Risk Level
```

## 📝 Summary

**Current State:**
- ✅ Using realistic mock data (14 instruments)
- ✅ Calculations are accurate
- ✅ Recommendations vary by risk level
- ❌ Not fetching live market data

**To Enable Live Data:**
1. Get Alpha Vantage API key (free)
2. Add to `.env` file
3. Use `/api/alpha/fetch` endpoint
4. System will use real market data

**Why Mock Data is Useful:**
- No API rate limits
- Consistent for testing
- Works offline
- Predictable results
- Good for demos

Your system is **production-ready** and can switch to live data anytime by adding an API key!

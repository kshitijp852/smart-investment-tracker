# AMFI NAV System - Quick Start Guide

## ✅ System Status

Your AMFI NAV system is now **LIVE and RUNNING**!

- ✅ **14,113 NAV records** synced from AMFI
- ✅ **46 fund categories** available
- ✅ **Daily auto-sync** scheduled
- ✅ **All API endpoints** operational

## 🚀 Quick Test

```bash
# Run automated tests
./test-nav-system.sh

# Check NAV statistics
curl http://localhost:5001/api/nav/stats

# Search for schemes
curl "http://localhost:5001/api/nav/search?q=axis&limit=5"
```

## 📊 Key Endpoints

### 1. Get Latest NAV
```bash
curl http://localhost:5001/api/nav/latest/119551
```

### 2. Search Schemes
```bash
curl "http://localhost:5001/api/nav/search?q=hdfc&limit=10"
```

### 3. Calculate Portfolio Returns
```bash
curl -X POST http://localhost:5001/api/portfolio/returns \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {"schemeCode": "119551", "units": 100, "investmentDate": "2024-01-01"}
    ]
  }'
```

### 4. Compare with Benchmark
```bash
curl -X POST http://localhost:5001/api/benchmark/blended \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {"schemeCode": "119551", "units": 100, "investmentDate": "2024-01-01"}
    ]
  }'
```

### 5. Get NAV History
```bash
curl "http://localhost:5001/api/nav/history/119551?limit=30"
```

### 6. Get All Categories
```bash
curl http://localhost:5001/api/nav/categories
```

### 7. Manual Sync Trigger
```bash
curl -X POST http://localhost:5001/api/nav/sync
```

### 8. Check Sync Status
```bash
curl http://localhost:5001/api/nav/sync/status
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/smart_investment
PORT=5001
ENABLE_NAV_SYNC=true  # Set to false to disable auto-sync
```

### Sync Schedule
- **Frequency**: Every 24 hours
- **Auto-start**: Yes (on server start)
- **Manual trigger**: `POST /api/nav/sync`

## 📁 Files Created

```
server/
├── src/
│   ├── models/
│   │   └── NAV.js                      # Database schema
│   ├── services/
│   │   ├── amfiService.js              # AMFI data fetcher
│   │   ├── portfolioReturnsService.js  # Returns calculator
│   │   └── benchmarkService.js         # Enhanced benchmark
│   ├── jobs/
│   │   └── navSyncJob.js               # Scheduled job
│   └── routes/
│       ├── nav.js                      # NAV endpoints
│       ├── portfolioReturns.js         # Returns endpoints
│       └── benchmark.js                # Benchmark endpoints
```

## 🎯 Common Use Cases

### Use Case 1: Track Your Portfolio
```javascript
// Calculate returns for your holdings
const holdings = [
  { schemeCode: '119551', units: 100, investmentDate: '2024-01-01' },
  { schemeCode: '119552', units: 50, investmentDate: '2024-06-01' }
];

const response = await fetch('http://localhost:5001/api/portfolio/returns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ holdings })
});

const data = await response.json();
console.log(`Total Return: ₹${data.portfolio.totalReturn}`);
console.log(`Portfolio Return: ${data.portfolio.portfolioReturn}%`);
```

### Use Case 2: Compare with Benchmark
```javascript
// See if you're beating the market
const response = await fetch('http://localhost:5001/api/benchmark/blended', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ holdings })
});

const data = await response.json();
if (data.beatsBenchmark) {
  console.log(`✅ Outperformed by ${data.difference.toFixed(2)}%`);
} else {
  console.log(`❌ Underperformed by ${Math.abs(data.difference).toFixed(2)}%`);
}
```

### Use Case 3: Find Best Performing Funds
```javascript
// Search for funds and get period returns
const searchResponse = await fetch(
  'http://localhost:5001/api/nav/search?q=large+cap&limit=10'
);
const schemes = await searchResponse.json();

for (const scheme of schemes.data) {
  const returnsResponse = await fetch(
    `http://localhost:5001/api/portfolio/returns/${scheme.schemeCode}`
  );
  const returns = await returnsResponse.json();
  
  console.log(`${scheme.schemeName}:`);
  console.log(`  1Y Return: ${returns.returns['1Y']?.annualizedReturn}%`);
  console.log(`  3Y Return: ${returns.returns['3Y']?.annualizedReturn}%`);
}
```

## 🔍 Troubleshooting

### Issue: No NAV data
**Solution:**
```bash
# Trigger manual sync
curl -X POST http://localhost:5001/api/nav/sync

# Check status
curl http://localhost:5001/api/nav/sync/status
```

### Issue: Sync job not running
**Solution:**
```bash
# Check if ENABLE_NAV_SYNC is set to true in .env
# Restart server
cd server && npm start
```

### Issue: Scheme not found
**Solution:**
```bash
# Search for the scheme first
curl "http://localhost:5001/api/nav/search?q=scheme+name"

# Use the correct schemeCode from search results
```

## 📚 Full Documentation

For complete documentation, see:
- **NAV_SYSTEM_DOCUMENTATION.md** - Complete technical documentation
- **API_DOCUMENTATION.md** - All API endpoints
- **BENCHMARK_FEATURE_README.md** - Benchmark comparison guide

## 🎉 What's Next?

1. **Integrate with Frontend**: Display NAV data in your React app
2. **Add Alerts**: Set up price alerts for schemes
3. **Export Data**: Add CSV/Excel export functionality
4. **Advanced Analytics**: Add volatility, Sharpe ratio calculations
5. **Real-time Updates**: Implement WebSocket for live NAV updates

## 💡 Pro Tips

1. **Cache Results**: NAV data changes once daily, cache API responses
2. **Batch Requests**: Use search to get multiple schemes at once
3. **Historical Analysis**: Use NAV history for trend analysis
4. **Category Filtering**: Filter by category for focused analysis
5. **Benchmark Comparison**: Always compare with appropriate benchmarks

## 📞 Support

- **Test Script**: `./test-nav-system.sh`
- **Server Logs**: Check terminal where server is running
- **Database**: `mongo smart_investment` to inspect data
- **Sync Status**: `GET /api/nav/sync/status`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Sync**: Check `/api/nav/sync/status`  
**Total Records**: 14,113+ NAVs

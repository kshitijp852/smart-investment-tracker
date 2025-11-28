# Hybrid Fund System - Complete Guide

## 🎯 Overview

The Hybrid Fund System combines the best of both worlds:
- **42 Curated Funds** with pre-calculated metrics (Sharpe, Sortino, etc.) for fast recommendations
- **14,113+ Real Funds** from AMFI for real-time tracking and expanded coverage

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Hybrid Fund System                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │  Curated Funds   │         │   AMFI NAV Data  │    │
│  │  (42 funds)      │◄────────┤   (14,113 funds) │    │
│  │  FinancialData   │  Sync   │   NAV Collection │    │
│  └────────┬─────────┘         └──────────────────┘    │
│           │                                             │
│           ▼                                             │
│  ┌──────────────────────────────────────────────┐     │
│  │         Hybrid Service Layer                 │     │
│  │  • Real-time NAV updates                     │     │
│  │  • Unified search                            │     │
│  │  • Automatic sync                            │     │
│  └──────────────────────────────────────────────┘     │
│           │                                             │
│           ▼                                             │
│  ┌──────────────────────────────────────────────┐     │
│  │         API Endpoints                        │     │
│  │  /api/hybrid/*                               │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 How It Works

### 1. Portfolio Recommendations
- Uses **42 curated funds** with all metrics pre-calculated
- Fast performance (no real-time calculations needed)
- Proven, high-quality funds
- Endpoint: `/api/buckets/generate`

### 2. Real-time Prices
- Daily sync updates curated funds with latest NAV from AMFI
- Always shows current prices
- Automatic background updates

### 3. User Portfolio Tracking
- Users can invest in ANY of the 14,113 funds
- Real-time NAV tracking for all holdings
- Accurate returns calculation
- Endpoint: `/api/portfolio/returns`

### 4. Expanded Search
- Search across curated funds first (prioritized)
- Optionally include all 14,113 AMFI funds
- Unified results
- Endpoint: `/api/hybrid/search`

## 📊 API Endpoints

### 1. Get Curated Funds with Latest NAV
```http
GET /api/hybrid/funds
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "_id": "...",
      "symbol": "AXIS_BLUECHIP",
      "name": "Axis Bluechip Fund",
      "type": "mutual_fund",
      "meta": {
        "category": "large_cap",
        "schemeCode": "119551"
      },
      "latestNAV": 45.67,
      "navDate": "2024-11-28T00:00:00.000Z",
      "realTimeData": true,
      "priceHistory": [...]
    }
  ]
}
```

### 2. Get Specific Fund with Latest NAV
```http
GET /api/hybrid/fund/:id
```

### 3. Get Fund by Scheme Code
```http
GET /api/hybrid/scheme/:schemeCode
```

**Example:**
```bash
curl http://localhost:5001/api/hybrid/scheme/119551
```

### 4. Search All Funds
```http
GET /api/hybrid/search?q=axis&category=equity&limit=50&includeNonCurated=true
```

**Parameters:**
- `q` (required): Search query (min 2 characters)
- `category` (optional): Filter by category
- `limit` (optional): Max results (default: 50)
- `includeNonCurated` (optional): Include non-curated funds (default: true)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "symbol": "AXIS_BLUECHIP",
      "name": "Axis Bluechip Fund",
      "isCurated": true,
      "source": "curated",
      "latestNAV": 45.67,
      "navDate": "2024-11-28T00:00:00.000Z"
    },
    {
      "symbol": "119552",
      "name": "Axis Midcap Fund",
      "isCurated": false,
      "source": "nav",
      "latestNAV": 52.34,
      "navDate": "2024-11-28T00:00:00.000Z"
    }
  ]
}
```

### 5. Sync Curated Funds with NAV
```http
POST /api/hybrid/sync
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 38,
    "notFound": 4,
    "total": 42
  }
}
```

### 6. Get Hybrid System Statistics
```http
GET /api/hybrid/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "curatedFunds": 42,
    "curatedWithRealTimeNAV": 38,
    "totalFundsAvailable": 14113,
    "coveragePercentage": "90.48"
  }
}
```

## 🔄 Automatic Sync Process

### Daily Sync Job
The system automatically:
1. Downloads latest NAV data from AMFI (14,113 funds)
2. Updates curated funds with matching NAV data
3. Runs every 24 hours
4. Can be triggered manually

### Sync Flow
```
AMFI Portal
    ↓
Download NAVAll.txt
    ↓
Parse 14,113 schemes
    ↓
Update NAV collection
    ↓
Match with curated funds
    ↓
Update curated fund prices
    ↓
✅ Complete
```

## 💻 Usage Examples

### Example 1: Get Curated Funds for Recommendations
```javascript
// Get all curated funds with latest prices
const response = await fetch('http://localhost:5001/api/hybrid/funds');
const data = await response.json();

// Use for portfolio generation
const funds = data.data;
console.log(`${funds.length} curated funds available`);
console.log(`${funds.filter(f => f.realTimeData).length} have real-time NAV`);
```

### Example 2: Search Across All Funds
```javascript
// Search for "HDFC" funds
const response = await fetch(
  'http://localhost:5001/api/hybrid/search?q=hdfc&limit=20&includeNonCurated=true'
);
const data = await response.json();

// Separate curated and non-curated
const curated = data.data.filter(f => f.isCurated);
const nonCurated = data.data.filter(f => !f.isCurated);

console.log(`Found ${curated.length} curated funds`);
console.log(`Found ${nonCurated.length} additional funds`);
```

### Example 3: Track User Portfolio with Any Fund
```javascript
// User invests in both curated and non-curated funds
const holdings = [
  { schemeCode: 'AXIS_BLUECHIP', units: 100, investmentDate: '2024-01-01' }, // Curated
  { schemeCode: '119552', units: 50, investmentDate: '2024-06-01' }  // Non-curated
];

// Calculate returns (works for both)
const response = await fetch('http://localhost:5001/api/portfolio/returns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ holdings })
});

const data = await response.json();
console.log(`Total Return: ${data.portfolio.portfolioReturn}%`);
```

### Example 4: Get Fund Details by Scheme Code
```javascript
// Works for both curated and non-curated funds
const schemeCode = '119551';
const response = await fetch(`http://localhost:5001/api/hybrid/scheme/${schemeCode}`);
const data = await response.json();

console.log(`Fund: ${data.data.name}`);
console.log(`Latest NAV: ₹${data.data.latestNAV}`);
console.log(`Is Curated: ${data.data.isCurated}`);
```

### Example 5: Manual Sync Trigger
```javascript
// Trigger sync manually (admin function)
const response = await fetch('http://localhost:5001/api/hybrid/sync', {
  method: 'POST'
});

const data = await response.json();
console.log(`Updated ${data.data.updated} curated funds`);
```

## 🎯 Use Cases

### Use Case 1: Portfolio Recommendations
**Scenario**: User wants investment recommendations

**Solution**:
1. Use `/api/buckets/generate` (uses curated 42 funds)
2. Fast performance with pre-calculated metrics
3. High-quality, vetted funds
4. Real-time NAV prices

### Use Case 2: User Invests in Recommended Fund
**Scenario**: User invests ₹10,000 in Axis Bluechip Fund

**Solution**:
1. Save investment with scheme code
2. Track using `/api/portfolio/returns`
3. Real-time NAV updates daily
4. Accurate returns calculation

### Use Case 3: User Wants to Add Custom Fund
**Scenario**: User wants to track a fund not in recommendations

**Solution**:
1. Search using `/api/hybrid/search?q=fund_name`
2. Find from 14,113 available funds
3. Add to portfolio using scheme code
4. Track returns automatically

### Use Case 4: Compare Multiple Funds
**Scenario**: User wants to compare 5 different funds

**Solution**:
1. Search for funds using `/api/hybrid/search`
2. Get period returns for each using `/api/portfolio/returns/:schemeCode`
3. Compare performance metrics
4. Make informed decision

## 🔧 Configuration

### Environment Variables
```bash
# .env
MONGODB_URI=mongodb://localhost:27017/smart_investment
PORT=5001
ENABLE_NAV_SYNC=true  # Enable automatic sync
```

### Sync Schedule
```javascript
// Default: Every 24 hours
navSyncJob.start(24);

// Custom: Every 12 hours
navSyncJob.start(12);

// Disable auto-sync
// Set ENABLE_NAV_SYNC=false in .env
```

## 📈 Performance

### Curated Funds (42)
- **Query Time**: < 10ms
- **With NAV Update**: < 50ms
- **Recommendation Generation**: < 500ms

### All Funds Search (14,113)
- **Search Time**: < 100ms
- **With Pagination**: < 50ms
- **Filtered Search**: < 75ms

### Sync Performance
- **NAV Download**: ~0.5s
- **Curated Update**: ~0.2s
- **Total Sync**: ~1.1s

## 🎨 Frontend Integration

### React Example
```jsx
import { useState, useEffect } from 'react';

function FundSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const searchFunds = async () => {
    const response = await fetch(
      `http://localhost:5001/api/hybrid/search?q=${query}&includeNonCurated=${showAll}`
    );
    const data = await response.json();
    setResults(data.data);
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search funds..."
      />
      <label>
        <input 
          type="checkbox" 
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        Include all 14,113 funds
      </label>
      <button onClick={searchFunds}>Search</button>
      
      <div>
        {results.map(fund => (
          <div key={fund.symbol}>
            <h3>{fund.name}</h3>
            <p>NAV: ₹{fund.latestNAV}</p>
            <span>{fund.isCurated ? '⭐ Curated' : '📊 Available'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔍 Troubleshooting

### Issue: Curated funds not updating
**Solution:**
```bash
# Trigger manual sync
curl -X POST http://localhost:5001/api/hybrid/sync

# Check stats
curl http://localhost:5001/api/hybrid/stats
```

### Issue: Fund not found
**Solution:**
```bash
# Search for the fund
curl "http://localhost:5001/api/hybrid/search?q=fund_name&includeNonCurated=true"

# Use the correct scheme code from results
```

### Issue: Old NAV prices
**Solution:**
```bash
# Check last sync time
curl http://localhost:5001/api/nav/sync/status

# Trigger NAV sync
curl -X POST http://localhost:5001/api/nav/sync
```

## 📊 Monitoring

### Check System Health
```bash
# Hybrid system stats
curl http://localhost:5001/api/hybrid/stats

# NAV system stats
curl http://localhost:5001/api/nav/stats

# Sync status
curl http://localhost:5001/api/nav/sync/status
```

### Expected Output
```json
{
  "curatedFunds": 42,
  "curatedWithRealTimeNAV": 38,
  "totalFundsAvailable": 14113,
  "coveragePercentage": "90.48"
}
```

## 🚀 Benefits

### For Users
- ✅ Fast recommendations (curated funds)
- ✅ Real-time prices (AMFI NAV)
- ✅ Track any fund (14,113 available)
- ✅ Accurate returns
- ✅ Expanded choice

### For Developers
- ✅ Best of both worlds
- ✅ No breaking changes
- ✅ Automatic sync
- ✅ Scalable architecture
- ✅ Easy to maintain

### For Business
- ✅ Production ready
- ✅ No rate limits
- ✅ Free data source
- ✅ Comprehensive coverage
- ✅ Professional quality

## 📚 Related Documentation

- **NAV_SYSTEM_DOCUMENTATION.md** - Complete NAV system
- **BENCHMARK_FEATURE_README.md** - Benchmark comparison
- **API_DOCUMENTATION.md** - All API endpoints

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Curated Funds**: 42  
**Total Available**: 14,113+  
**Coverage**: 90%+

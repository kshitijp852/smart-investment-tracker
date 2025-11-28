# AMFI NAV Data System - Complete Documentation

## Overview

Production-ready backend system for fetching, storing, and analyzing mutual fund NAV (Net Asset Value) data from AMFI (Association of Mutual Funds in India). The system provides real-time NAV data, historical tracking, portfolio returns calculation, and blended benchmark comparison.

## Features

### 1. **Automated Daily NAV Sync**
- Downloads NAV data from AMFI daily
- Parses 10,000+ mutual fund schemes
- Updates MongoDB with latest NAVs
- No rate limits (AMFI public data)

### 2. **NAV Data Management**
- Store complete NAV history
- Track scheme details and categories
- Efficient querying with indexed fields
- Bulk update operations

### 3. **Portfolio Returns Calculation**
- Calculate absolute and percentage returns
- Annualized returns (CAGR)
- Period-wise returns (1M, 3M, 6M, 1Y, 3Y, 5Y)
- XIRR calculation support

### 4. **Blended Benchmark Comparison**
- Category-based benchmark mapping
- Weighted benchmark calculation
- Portfolio vs benchmark comparison
- Real NAV data integration

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AMFI NAV System                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌──────────────┐               │
│  │  AMFI Source │─────▶│  NAV Sync    │               │
│  │  (NAVAll.txt)│      │  Job (Daily) │               │
│  └──────────────┘      └──────┬───────┘               │
│                               │                         │
│                               ▼                         │
│                        ┌──────────────┐                │
│                        │   MongoDB    │                │
│                        │  NAV History │                │
│                        └──────┬───────┘                │
│                               │                         │
│         ┌─────────────────────┼─────────────────────┐  │
│         │                     │                     │  │
│         ▼                     ▼                     ▼  │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  │  NAV APIs   │      │  Portfolio  │      │  Benchmark  │
│  │  /nav/*     │      │  Returns    │      │  Comparison │
│  └─────────────┘      └─────────────┘      └─────────────┘
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### NAV Collection

```javascript
{
  schemeCode: String,        // Unique scheme identifier
  schemeName: String,        // Full scheme name
  category: String,          // Fund category
  nav: Number,               // Net Asset Value
  repurchasePrice: Number,   // Buy-back price (optional)
  salePrice: Number,         // Sale price (optional)
  date: Date,                // NAV date
  createdAt: Date,           // Record creation timestamp
  updatedAt: Date            // Last update timestamp
}

// Indexes:
// - schemeCode (ascending)
// - date (descending)
// - category (ascending)
// - Compound: (schemeCode, date)
```

## API Endpoints

### NAV Endpoints

#### 1. Get Latest NAV
```http
GET /api/nav/latest/:schemeCode
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schemeCode": "119551",
    "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
    "category": "Equity Scheme - Large Cap Fund",
    "nav": 45.67,
    "repurchasePrice": null,
    "salePrice": null,
    "date": "2024-11-28T00:00:00.000Z"
  }
}
```

#### 2. Get NAV History
```http
GET /api/nav/history/:schemeCode?startDate=2024-01-01&endDate=2024-11-28&limit=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schemeCode": "119551",
    "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
    "category": "Equity Scheme - Large Cap Fund",
    "count": 100,
    "history": [
      {
        "nav": 45.67,
        "repurchasePrice": null,
        "salePrice": null,
        "date": "2024-11-28T00:00:00.000Z"
      }
    ]
  }
}
```

#### 3. Search Schemes
```http
GET /api/nav/search?q=axis&category=equity&limit=50
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "schemeCode": "119551",
      "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
      "category": "Equity Scheme - Large Cap Fund",
      "nav": 45.67,
      "date": "2024-11-28T00:00:00.000Z"
    }
  ]
}
```

#### 4. Get All Schemes
```http
GET /api/nav/schemes?category=equity&limit=100&offset=0
```

#### 5. Get Categories
```http
GET /api/nav/categories
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "category": "Equity Scheme - Large Cap Fund",
      "count": 1250
    }
  ]
}
```

#### 6. Get Statistics
```http
GET /api/nav/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 125000,
    "uniqueSchemes": 10500,
    "categories": 25,
    "latestDate": "2024-11-28T00:00:00.000Z"
  }
}
```

#### 7. Manual Sync Trigger
```http
POST /api/nav/sync
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "inserted": 10500,
    "updated": 0,
    "skipped": 0,
    "total": 10500,
    "duration": 45.23
  }
}
```

#### 8. Get Sync Status
```http
GET /api/nav/sync/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": false,
    "lastRun": "2024-11-28T06:00:00.000Z",
    "lastResult": {
      "success": true,
      "inserted": 10500,
      "updated": 0,
      "total": 10500
    },
    "isScheduled": true
  }
}
```

### Portfolio Returns Endpoints

#### 1. Calculate Portfolio Returns
```http
POST /api/portfolio/returns
Content-Type: application/json

{
  "holdings": [
    {
      "schemeCode": "119551",
      "units": 100,
      "investmentDate": "2024-01-01"
    },
    {
      "schemeCode": "119552",
      "units": 50,
      "investmentDate": "2024-06-01"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "totalInvested": 150000,
    "totalCurrentValue": 175000,
    "totalReturn": 25000,
    "portfolioReturn": 16.67
  },
  "holdings": [
    {
      "schemeCode": "119551",
      "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
      "category": "Equity Scheme - Large Cap Fund",
      "units": 100,
      "investmentDate": "2024-01-01T00:00:00.000Z",
      "investmentNAV": 40.50,
      "currentDate": "2024-11-28T00:00:00.000Z",
      "currentNAV": 45.67,
      "investedAmount": 4050,
      "currentValue": 4567,
      "absoluteReturn": 517,
      "percentageReturn": 12.77,
      "annualizedReturn": 14.23,
      "days": 332
    }
  ]
}
```

#### 2. Get Period Returns
```http
GET /api/portfolio/returns/:schemeCode
```

**Response:**
```json
{
  "success": true,
  "schemeCode": "119551",
  "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
  "category": "Equity Scheme - Large Cap Fund",
  "returns": {
    "1M": {
      "absoluteReturn": 2.5,
      "annualizedReturn": 33.5,
      "startDate": "2024-10-28T00:00:00.000Z",
      "startNAV": 44.56,
      "endDate": "2024-11-28T00:00:00.000Z",
      "endNAV": 45.67
    },
    "3M": { ... },
    "6M": { ... },
    "1Y": { ... },
    "3Y": { ... },
    "5Y": { ... }
  }
}
```

### Benchmark Endpoints

#### 1. Blended Benchmark Comparison
```http
POST /api/benchmark/blended
Content-Type: application/json

{
  "holdings": [
    {
      "schemeCode": "119551",
      "units": 100,
      "investmentDate": "2024-01-01"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "portfolioReturn": 15.5,
  "benchmarkReturn": 13.2,
  "difference": 2.3,
  "beatsBenchmark": true,
  "holdings": {
    "119551": {
      "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
      "category": "Equity Scheme - Large Cap Fund",
      "return": 15.5,
      "investedAmount": 4050,
      "currentValue": 4678
    }
  },
  "benchmarkComponents": [
    {
      "category": "Equity Scheme - Large Cap Fund",
      "benchmarkIndex": "NIFTY 50 TRI",
      "weight": 4050
    }
  ]
}
```

## Usage Examples

### 1. Initial Setup and Sync

```javascript
// Trigger initial NAV sync
const response = await fetch('http://localhost:5001/api/nav/sync', {
  method: 'POST'
});

const result = await response.json();
console.log(`Synced ${result.data.total} NAV records`);
```

### 2. Search for Schemes

```javascript
// Search for Axis funds
const response = await fetch('http://localhost:5001/api/nav/search?q=axis&limit=10');
const data = await response.json();

data.data.forEach(scheme => {
  console.log(`${scheme.schemeName}: ₹${scheme.nav}`);
});
```

### 3. Get Latest NAV

```javascript
// Get latest NAV for a scheme
const schemeCode = '119551';
const response = await fetch(`http://localhost:5001/api/nav/latest/${schemeCode}`);
const data = await response.json();

console.log(`Latest NAV: ₹${data.data.nav} on ${data.data.date}`);
```

### 4. Calculate Portfolio Returns

```javascript
// Calculate returns for your portfolio
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
console.log(`Portfolio Return: ${data.portfolio.portfolioReturn.toFixed(2)}%`);
console.log(`Total Gain: ₹${data.portfolio.totalReturn.toFixed(2)}`);
```

### 5. Compare with Benchmark

```javascript
// Compare portfolio with blended benchmark
const response = await fetch('http://localhost:5001/api/benchmark/blended', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ holdings })
});

const data = await response.json();

if (data.beatsBenchmark) {
  console.log(`✅ Outperformed benchmark by ${data.difference.toFixed(2)}%`);
} else {
  console.log(`❌ Underperformed benchmark by ${Math.abs(data.difference).toFixed(2)}%`);
}
```

## Scheduled Job Configuration

### Default Configuration
- **Frequency**: Every 24 hours
- **Start Time**: Immediately on server start
- **Auto-retry**: No (manual trigger available)

### Environment Variables

```bash
# Disable automatic NAV sync
ENABLE_NAV_SYNC=false

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/smart_investment
```

### Manual Job Control

```javascript
const navSyncJob = require('./jobs/navSyncJob');

// Start job (runs every 24 hours)
navSyncJob.start(24);

// Run immediately
await navSyncJob.runSync();

// Stop job
navSyncJob.stop();

// Get status
const status = navSyncJob.getStatus();
console.log(status);
```

## Performance Optimization

### 1. Database Indexes
```javascript
// Compound indexes for efficient queries
db.navs.createIndex({ schemeCode: 1, date: -1 });
db.navs.createIndex({ category: 1, date: -1 });
```

### 2. Bulk Operations
- Uses `bulkWrite()` for batch updates
- Processes 100 records per batch
- Upsert strategy (insert or update)

### 3. Caching Strategy
- Benchmark data cached for 24 hours
- Latest NAV queries optimized with indexes
- Aggregation pipelines for statistics

## Error Handling

### Network Errors
```javascript
try {
  await syncNAVData();
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Cannot connect to AMFI server');
  }
}
```

### Data Validation
- Skips invalid records during parsing
- Validates date formats
- Handles missing optional fields

### Database Errors
- Graceful fallback on connection issues
- Transaction support for critical operations
- Automatic retry for transient failures

## Testing

### Test NAV Sync
```bash
# Trigger manual sync
curl -X POST http://localhost:5001/api/nav/sync

# Check sync status
curl http://localhost:5001/api/nav/sync/status
```

### Test NAV Queries
```bash
# Get latest NAV
curl http://localhost:5001/api/nav/latest/119551

# Search schemes
curl "http://localhost:5001/api/nav/search?q=axis&limit=5"

# Get statistics
curl http://localhost:5001/api/nav/stats
```

### Test Portfolio Returns
```bash
curl -X POST http://localhost:5001/api/portfolio/returns \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {"schemeCode": "119551", "units": 100, "investmentDate": "2024-01-01"}
    ]
  }'
```

## Production Deployment

### 1. Environment Setup
```bash
# .env file
MONGODB_URI=mongodb://production-server:27017/smart_investment
PORT=5001
ENABLE_NAV_SYNC=true
NODE_ENV=production
```

### 2. Process Management
```bash
# Using PM2
pm2 start src/app.js --name "nav-system"
pm2 logs nav-system
pm2 restart nav-system
```

### 3. Monitoring
- Monitor sync job status via `/api/nav/sync/status`
- Set up alerts for failed syncs
- Track database size and performance
- Monitor API response times

### 4. Backup Strategy
```bash
# Daily MongoDB backup
mongodump --db smart_investment --collection navs --out /backup/$(date +%Y%m%d)
```

## Troubleshooting

### Issue: Sync Job Not Running
**Solution:**
```javascript
// Check job status
const status = navSyncJob.getStatus();
console.log(status);

// Restart job
navSyncJob.stop();
navSyncJob.start(24);
```

### Issue: No NAV Data Found
**Solution:**
```bash
# Trigger manual sync
curl -X POST http://localhost:5001/api/nav/sync

# Check database
mongo smart_investment --eval "db.navs.count()"
```

### Issue: Slow Queries
**Solution:**
```javascript
// Ensure indexes are created
db.navs.getIndexes();

// Create missing indexes
db.navs.createIndex({ schemeCode: 1, date: -1 });
```

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live NAV updates
2. **Advanced Analytics**: Volatility, Sharpe ratio, rolling returns
3. **Alerts**: Price alerts, performance notifications
4. **Export**: CSV/Excel export for NAV history
5. **Comparison**: Compare multiple schemes side-by-side
6. **Predictions**: ML-based NAV predictions

## Files Created

```
server/
├── src/
│   ├── models/
│   │   └── NAV.js                          # NAV database schema
│   ├── services/
│   │   ├── amfiService.js                  # AMFI data fetcher & parser
│   │   ├── portfolioReturnsService.js      # Returns calculator
│   │   └── benchmarkService.js             # Enhanced with NAV data
│   ├── jobs/
│   │   └── navSyncJob.js                   # Scheduled sync job
│   ├── routes/
│   │   ├── nav.js                          # NAV API endpoints
│   │   ├── portfolioReturns.js             # Portfolio returns API
│   │   └── benchmark.js                    # Enhanced benchmark API
│   └── app.js                              # Updated with new routes
└── NAV_SYSTEM_DOCUMENTATION.md             # This file
```

## Support

For issues or questions:
1. Check sync job status: `GET /api/nav/sync/status`
2. Review server logs for errors
3. Verify MongoDB connection
4. Test AMFI URL accessibility

## License

Part of the Smart Investment Recommendation System.

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 28, 2024

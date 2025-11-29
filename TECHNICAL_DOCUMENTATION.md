# Smart Investment Tracker - Complete Technical Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Modules](#core-modules)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Key Features](#key-features)
9. [Deployment](#deployment)
10. [Workflows](#workflows)

---

## 1. System Overview

**Smart Investment Tracker** is an AI-powered investment recommendation platform that helps users create diversified mutual fund portfolios based on their investment goals, risk appetite, and time horizon.

### Key Capabilities
- **Portfolio Generation**: Creates 3 diversified portfolio strategies (Conservative, Balanced, Aggressive)
- **Real-time NAV Data**: Integrates 14,113 AMFI mutual funds with daily NAV updates
- **Benchmark Comparison**: Compares portfolio performance against market indices (Nifty 50, Sensex, Nifty 500)
- **Advanced Analytics**: Uses 10+ financial metrics (Sharpe, Sortino, Treynor ratios, Alpha, Beta, etc.)
- **Hybrid System**: Combines curated funds with real-time market data
- **User Management**: Authentication, portfolio saving, and preferences

### System Architecture Type
- **Frontend**: Single Page Application (SPA) - React
- **Backend**: RESTful API - Node.js/Express
- **Database**: MongoDB (NoSQL)
- **Deployment**: Netlify (Frontend) + Render (Backend)
- **Data Sources**: AMFI India, MFAPI

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                  (https://smart-investment-tracker.netlify.app)  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND SERVER (Render)                     │
│              (https://smart-investment-tracker.onrender.com)     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express.js API Layer                   │  │
│  │  - CORS enabled                                           │  │
│  │  - JWT authentication                                     │  │
│  │  - 14 API route modules                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │                   Business Logic Layer                    │  │
│  │  - Portfolio Generation Engine                            │  │
│  │  - Advanced Analytics Calculator                          │  │
│  │  - Benchmark Comparison Service                           │  │
│  │  - Hybrid Fund Service                                    │  │
│  │  - NAV Sync Job (Daily)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │                    Data Access Layer                      │  │
│  │  - Mongoose ODM                                           │  │
│  │  - 6 Data Models                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   MongoDB      │  │  AMFI India     │  │    MFAPI       │
│   (Database)   │  │  (NAV Data)     │  │  (Fund Data)   │
│  - Users       │  │  - 14,113 funds │  │  - Historical  │
│  - Portfolios  │  │  - Daily sync   │  │  - Real-time   │
│  - NAV Cache   │  │                 │  │                │
│  - Preferences │  │                 │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### Component Breakdown

#### Frontend (Client)
- **Framework**: React 18.2.0
- **Build Tool**: Webpack 5
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Styling**: Custom CSS with modern gradients and animations

#### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.0) + bcryptjs 2.4.3
- **HTTP Client**: Axios 1.4.0 (for external APIs)

---

## 3. Technology Stack

### Frontend Stack
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.4.0",
  "webpack": "^5.88.0",
  "babel": "^7.22.0"
}
```

### Backend Stack
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "axios": "^1.4.0"
}
```

### External Services
- **AMFI India**: Daily NAV data for 14,113 mutual funds
- **MFAPI**: Historical mutual fund data
- **MongoDB Atlas**: Cloud database hosting
- **Netlify**: Frontend hosting with CDN
- **Render**: Backend hosting with auto-deploy

---

## 4. Core Modules

### 4.1 Backend Modules

#### Routes (14 modules)

| Route | Purpose | Key Endpoints |
|-------|---------|---------------|
| `/api/auth` | User authentication | POST /register, /login |
| `/api/preferences` | User preferences | GET, POST /preferences |
| `/api/recommendations` | Investment recommendations | POST /generate |
| `/api/buckets` | Portfolio bucket generation | POST /generate |
| `/api/buckets-multi` | Multiple bucket strategies | POST /generate |
| `/api/data` | Financial data management | GET /list, /mock-seed |
| `/api/alpha` | Alpha Vantage integration | GET /stock/:symbol |
| `/api/portfolio` | Portfolio management | GET, POST, DELETE |
| `/api/portfolioReturns` | Portfolio returns calculation | POST /calculate |
| `/api/mfapi` | MFAPI integration | GET /fund/:schemeCode |
| `/api/benchmark` | Benchmark comparison | GET /compare, /indices |
| `/api/nav` | NAV data access | GET /fund/:schemeCode, /search |
| `/api/hybrid` | Hybrid fund system | GET /funds, /stats |
| `/api/health` | Health check | GET / |

#### Services (6 modules)

**1. alphaVantage.js**
- Integrates with Alpha Vantage API for stock data
- Provides real-time stock quotes and historical data

**2. amfiService.js**
- Fetches daily NAV data from AMFI India
- Parses 14,113 mutual fund records
- Updates MongoDB NAV collection
- Handles data transformation and validation

**3. benchmarkService.js**
- Compares portfolio against market indices
- Calculates relative performance metrics
- Generates comparison charts data
- Supports Nifty 50, Sensex, Nifty 500

**4. hybridFundService.js**
- Combines curated funds with real-time NAV
- Enriches fund data with live market prices
- Provides coverage statistics
- Manages fund selection logic

**5. mfapi.js**
- Integrates with MFAPI for historical fund data
- Fetches NAV history and fund details
- Caches responses for performance

**6. portfolioReturnsService.js**
- Calculates actual portfolio returns
- Computes CAGR, absolute returns
- Handles multiple time periods
- Aggregates fund-level returns

#### Models (6 schemas)

**1. User.js**
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  createdAt: Date
}
```

**2. Portfolio.js**
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    symbol: String,
    type: String (stock/mutual_fund/fd),
    amount: Number,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**3. FinancialData.js**
```javascript
{
  symbol: String (unique, required),
  name: String,
  type: String (stock/mutual_fund/fd),
  currentPrice: Number,
  expectedReturn: Number,
  riskCategory: String (low/medium/high),
  meta: {
    category: String,
    aum: Number,
    expenseRatio: Number,
    exitLoad: Number,
    minInvestment: Number
  },
  metrics: {
    sharpeRatio: Number,
    sortinoRatio: Number,
    treynorRatio: Number,
    alpha: Number,
    beta: Number,
    standardDeviation: Number,
    informationRatio: Number,
    expenseRatio: Number,
    turnoverRatio: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**4. NAV.js**
```javascript
{
  schemeCode: String (unique, indexed),
  schemeName: String,
  nav: Number,
  date: Date,
  schemeType: String,
  schemeCategory: String,
  isin: String,
  lastUpdated: Date
}
```

**5. Preference.js**
```javascript
{
  userId: ObjectId (ref: User),
  riskTolerance: String,
  investmentHorizon: Number,
  preferredSectors: [String],
  excludedSectors: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**6. Cache.js**
```javascript
{
  key: String (unique),
  value: Mixed,
  expiresAt: Date,
  createdAt: Date
}
```

#### Jobs

**navSyncJob.js**
- Scheduled job that runs every 24 hours
- Fetches latest NAV data from AMFI
- Updates MongoDB NAV collection
- Logs sync statistics
- Can be disabled via environment variable

#### Utilities

**advancedAnalytics.js**
- Calculates 10+ financial metrics
- Implements scoring algorithms
- Provides risk-adjusted return calculations
- Generates fund rankings

### 4.2 Frontend Modules

#### Pages (2 components)

**1. Login.jsx**
- User authentication form
- JWT token management
- Error handling
- Redirects to main app on success

**2. Register.jsx**
- New user registration
- Password validation
- Email uniqueness check
- Auto-login after registration

#### Components (2 components)

**1. BenchmarkComparison.jsx**
- Displays portfolio vs benchmark performance
- Shows relative returns
- Renders comparison charts
- Highlights outperformance/underperformance

**2. Disclaimer.jsx**
- Legal disclaimer banner
- Investment risk warnings
- Compliance information

#### Main App (App.jsx)
- Main application container
- Routing logic (Home, Login, Register)
- Portfolio generation UI
- Results display
- User authentication state
- API integration

---

## 5. Data Flow

### 5.1 Portfolio Generation Flow

```
User Input (Amount, Duration, Risk)
         │
         ▼
Frontend validates input
         │
         ▼
POST /api/buckets/generate
         │
         ▼
Backend receives request
         │
         ▼
Query FinancialData collection
  - Filter by type: mutual_fund
  - Filter by risk category
         │
         ▼
Apply Advanced Analytics
  - Calculate 10+ metrics
  - Score each fund (0-100)
  - Rank funds by score
         │
         ▼
Generate 3 Portfolio Strategies
  ┌──────────┼──────────┐
  │          │          │
  ▼          ▼          ▼
Conservative Balanced Aggressive
(Low risk)  (Medium)  (High risk)
  │          │          │
  └──────────┼──────────┘
         │
         ▼
For each strategy:
  - Select top funds
  - Allocate amounts
  - Calculate projections
  - Compute diversification
         │
         ▼
Fetch Benchmark Data
  - Get index returns
  - Compare portfolio
  - Calculate alpha
         │
         ▼
Return 3 portfolio options
         │
         ▼
Frontend displays results
  - Strategy tabs
  - Fund cards
  - Benchmark charts
  - Metrics breakdown
```

### 5.2 NAV Sync Flow

```
Scheduled Job (Every 24 hours)
         │
         ▼
Fetch AMFI data
  URL: https://www.amfiindia.com/spages/NAVAll.txt
         │
         ▼
Parse text file
  - Split by lines
  - Extract scheme details
  - Parse NAV values
  - Convert dates
         │
         ▼
Transform data
  - Clean scheme names
  - Validate NAV numbers
  - Format dates
  - Extract categories
         │
         ▼
Bulk upsert to MongoDB
  - Update existing records
  - Insert new funds
  - Update timestamps
         │
         ▼
Log statistics
  - Total funds processed
  - New funds added
  - Updated records
  - Errors encountered
```

### 5.3 Hybrid Fund System Flow

```
Request: GET /api/hybrid/funds
         │
         ▼
Fetch curated funds
  Source: FinancialData collection
  Filter: type = mutual_fund
         │
         ▼
For each fund:
  - Extract scheme code
  - Query NAV collection
  - Match by scheme code
         │
         ▼
Enrich fund data
  - Add real-time NAV
  - Update current price
  - Add last updated time
  - Preserve all metrics
         │
         ▼
Calculate statistics
  - Total curated funds
  - Funds with real-time NAV
  - Coverage percentage
  - Category breakdown
         │
         ▼
Return enriched funds + stats
```

### 5.4 Benchmark Comparison Flow

```
Portfolio data (funds + allocations)
         │
         ▼
Calculate portfolio metrics
  - Weighted average return
  - Total expected return
  - Risk-adjusted metrics
         │
         ▼
Fetch benchmark indices
  - Nifty 50: 12% annual
  - Sensex: 11.5% annual
  - Nifty 500: 13% annual
         │
         ▼
Compare portfolio vs each index
  - Calculate relative return
  - Compute alpha
  - Determine outperformance
         │
         ▼
Generate chart data
  - Portfolio growth curve
  - Index growth curves
  - Comparison points
         │
         ▼
Return comparison results
  - Best/worst performing index
  - Relative returns
  - Chart data
  - Performance summary
```

---

## 6. API Endpoints

### 6.1 Authentication APIs

**POST /api/auth/register**
```javascript
Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**POST /api/auth/login**
```javascript
Request:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 6.2 Portfolio Generation APIs

**POST /api/buckets/generate**
```javascript
Request:
{
  "amount": 100000,
  "duration": 3,
  "riskLevel": "medium"
}

Response:
{
  "totalOptions": 3,
  "bucketOptions": [
    {
      "label": "Conservative Strategy",
      "strategy": {
        "name": "Conservative Growth",
        "description": "Low-risk portfolio...",
        "icon": "🛡️",
        "tag": "Safe & Steady"
      },
      "bucket": [
        {
          "symbol": "FUND001",
          "name": "HDFC Balanced Advantage Fund",
          "category": "hybrid",
          "allocation": 30000,
          "percentage": 30,
          "expectedReturn": 0.10,
          "projectedValue": 39930,
          "projectedGain": 9930,
          "riskCategory": "low",
          "finalScore": 85.5,
          "metrics": { ... },
          "scoreBreakdown": { ... }
        }
        // ... more funds
      ],
      "summary": {
        "totalInvestment": 100000,
        "totalProjectedValue": 133100,
        "totalGain": 33100,
        "annualizedReturn": 10.0
      },
      "diversification": {
        "fundCount": 8,
        "categoryCount": 4
      },
      "benchmarkComparison": {
        "portfolio": { return: 10.0, value: 133100 },
        "nifty50": { return: 12.0, value: 140493 },
        "sensex": { return: 11.5, value: 137851 },
        "nifty500": { return: 13.0, value: 143960 }
      },
      "isRecommended": true
    }
    // ... 2 more strategies
  ]
}
```

### 6.3 NAV APIs

**GET /api/nav/fund/:schemeCode**
```javascript
Response:
{
  "schemeCode": "119551",
  "schemeName": "Aditya Birla Sun Life Liquid Fund",
  "nav": 345.67,
  "date": "2025-11-28T00:00:00.000Z",
  "schemeType": "Open Ended Schemes",
  "schemeCategory": "Liquid Fund",
  "lastUpdated": "2025-11-29T06:00:00.000Z"
}
```

**GET /api/nav/search?query=hdfc**
```javascript
Response:
{
  "results": [
    {
      "schemeCode": "119551",
      "schemeName": "HDFC Liquid Fund",
      "nav": 4567.89,
      "schemeCategory": "Liquid Fund"
    }
    // ... more results
  ],
  "total": 45
}
```

### 6.4 Hybrid System APIs

**GET /api/hybrid/funds**
```javascript
Response:
{
  "funds": [
    {
      "symbol": "FUND001",
      "name": "HDFC Balanced Advantage Fund",
      "type": "mutual_fund",
      "currentPrice": 345.67,
      "expectedReturn": 0.12,
      "riskCategory": "medium",
      "realTimeNAV": {
        "nav": 345.67,
        "date": "2025-11-28",
        "lastUpdated": "2025-11-29T06:00:00.000Z"
      },
      "metrics": { ... },
      "meta": { ... }
    }
    // ... more funds
  ],
  "stats": {
    "curatedFunds": 50,
    "curatedWithRealTimeNAV": 48,
    "totalFundsAvailable": 14113,
    "coveragePercentage": 96.0
  }
}
```

**GET /api/hybrid/stats**
```javascript
Response:
{
  "data": {
    "curatedFunds": 50,
    "curatedWithRealTimeNAV": 48,
    "totalFundsAvailable": 14113,
    "coveragePercentage": 96.0,
    "lastSyncTime": "2025-11-29T06:00:00.000Z"
  }
}
```

### 6.5 Benchmark APIs

**POST /api/benchmark/compare**
```javascript
Request:
{
  "portfolio": {
    "funds": [
      { "symbol": "FUND001", "allocation": 50000, "expectedReturn": 0.12 },
      { "symbol": "FUND002", "allocation": 50000, "expectedReturn": 0.10 }
    ],
    "duration": 3
  }
}

Response:
{
  "portfolio": {
    "weightedReturn": 11.0,
    "projectedValue": 136763,
    "totalGain": 36763
  },
  "benchmarks": {
    "nifty50": {
      "return": 12.0,
      "projectedValue": 140493,
      "relativeReturn": -1.0,
      "outperformance": false
    },
    "sensex": { ... },
    "nifty500": { ... }
  },
  "bestBenchmark": "nifty50",
  "worstBenchmark": "sensex",
  "chartData": [ ... ]
}
```

### 6.6 Data Management APIs

**GET /api/data/list**
```javascript
Response:
[
  {
    "symbol": "FUND001",
    "name": "HDFC Balanced Advantage Fund",
    "type": "mutual_fund",
    "currentPrice": 345.67,
    "expectedReturn": 0.12,
    "riskCategory": "medium",
    "meta": { ... },
    "metrics": { ... }
  }
  // ... more instruments
]
```

**GET /api/data/mock-seed**
```javascript
Response:
{
  "message": "Mock data seeded successfully",
  "instrumentsSeeded": 50,
  "breakdown": {
    "mutual_funds": 50,
    "stocks": 0,
    "fds": 0
  }
}
```

### 6.7 Portfolio Management APIs

**POST /api/portfolio/save**
```javascript
Request:
{
  "items": [
    { "symbol": "FUND001", "type": "mutual_fund", "amount": 50000 },
    { "symbol": "FUND002", "type": "mutual_fund", "amount": 50000 }
  ]
}

Response:
{
  "message": "Portfolio saved successfully",
  "portfolio": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [ ... ],
    "createdAt": "2025-11-29T06:00:00.000Z"
  }
}
```

**GET /api/portfolio**
```javascript
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "portfolios": [
    {
      "id": "507f1f77bcf86cd799439011",
      "items": [ ... ],
      "createdAt": "2025-11-29T06:00:00.000Z",
      "updatedAt": "2025-11-29T06:00:00.000Z"
    }
  ]
}
```

---

## 7. Database Schema

### Collections Overview

| Collection | Documents | Purpose | Indexes |
|------------|-----------|---------|---------|
| users | ~100s | User accounts | email (unique) |
| portfolios | ~1000s | Saved portfolios | userId |
| financialdata | ~50 | Curated funds | symbol (unique) |
| navs | ~14,113 | Real-time NAV | schemeCode (unique) |
| preferences | ~100s | User preferences | userId (unique) |
| caches | ~100s | API response cache | key (unique), expiresAt |

### Relationships

```
User (1) ──────── (N) Portfolio
  │
  │
  └──────────────── (1) Preference

FinancialData (N) ──────── (1) NAV
  (matched by schemeCode)

Portfolio (N) ──────── (N) FinancialData
  (via items.symbol)
```

---

## 8. Key Features

### 8.1 Advanced Scoring System

The system uses a sophisticated multi-factor scoring algorithm:

**Score Components (Total: 100 points)**


1. **Risk-Adjusted Returns (45 points)**
   - Sharpe Ratio (15 pts): Return per unit of risk
   - Sortino Ratio (15 pts): Downside risk-adjusted return
   - Treynor Ratio (15 pts): Return per unit of systematic risk

2. **Stability Metrics (25 points)**
   - Standard Deviation (15 pts): Volatility measure
   - Beta (10 pts): Market correlation

3. **Manager Skill (20 points)**
   - Alpha (10 pts): Excess return over benchmark
   - Information Ratio (10 pts): Consistency of outperformance

4. **Cost Efficiency (10 points)**
   - Expense Ratio (5 pts): Annual fees
   - Turnover Ratio (5 pts): Trading frequency

**Calculation Example:**
```javascript
// Risk-Adjusted Score (45%)
riskAdjustedScore = (
  normalize(sharpeRatio, 0, 3) * 0.15 +
  normalize(sortinoRatio, 0, 4) * 0.15 +
  normalize(treynorRatio, 0, 0.2) * 0.15
) * 100;

// Stability Score (25%)
stabilityScore = (
  (1 - normalize(standardDeviation, 0, 0.3)) * 0.15 +
  normalize(beta, 0, 1.5) * 0.10
) * 100;

// Manager Skill Score (20%)
managerSkillScore = (
  normalize(alpha, -0.05, 0.15) * 0.10 +
  normalize(informationRatio, -1, 2) * 0.10
) * 100;

// Cost Efficiency Score (10%)
costEfficiencyScore = (
  (1 - normalize(expenseRatio, 0, 0.03)) * 0.05 +
  (1 - normalize(turnoverRatio, 0, 2)) * 0.05
) * 100;

// Final Score
finalScore = riskAdjustedScore + stabilityScore + 
             managerSkillScore + costEfficiencyScore;
```

### 8.2 Portfolio Diversification

**Strategy-Based Allocation:**

| Strategy | Risk Profile | Allocation Logic | Expected Return |
|----------|--------------|------------------|-----------------|
| Conservative | Low risk | 60% debt, 40% equity | 8-10% p.a. |
| Balanced | Medium risk | 50% debt, 50% equity | 10-12% p.a. |
| Aggressive | High risk | 20% debt, 80% equity | 12-15% p.a. |

**Diversification Rules:**
- Minimum 6 funds per portfolio
- Maximum 12 funds per portfolio
- At least 3 different categories
- No single fund > 25% allocation
- Category-wise limits based on risk

### 8.3 Real-time NAV Integration

**Data Source:** AMFI India (Association of Mutual Funds in India)

**Update Frequency:** Daily at 6:00 AM IST

**Coverage:**
- Total funds: 14,113
- Scheme types: Open-ended, Close-ended, Interval
- Categories: Equity, Debt, Hybrid, Solution Oriented, Other

**Data Format:**
```
Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
119551;INF209K01YM7;-;Aditya Birla Sun Life Liquid Fund;345.6789;28-Nov-2025
```

### 8.4 Benchmark Comparison

**Supported Indices:**

| Index | Historical Return | Volatility | Use Case |
|-------|-------------------|------------|----------|
| Nifty 50 | 12% p.a. | Medium | Large-cap benchmark |
| Sensex | 11.5% p.a. | Medium | Market benchmark |
| Nifty 500 | 13% p.a. | Medium-High | Broad market |

**Comparison Metrics:**
- Absolute return difference
- Risk-adjusted return (Sharpe comparison)
- Alpha generation
- Tracking error
- Information ratio

### 8.5 Caching System

**Cache Strategy:**
- API responses cached for 24 hours
- NAV data cached until next sync
- Fund details cached for 1 hour
- Benchmark data cached for 7 days

**Implementation:**
```javascript
// Cache model with TTL
{
  key: "mfapi_fund_119551",
  value: { /* fund data */ },
  expiresAt: Date.now() + 24*60*60*1000,
  createdAt: Date.now()
}

// Auto-cleanup on query
Cache.deleteMany({ expiresAt: { $lt: new Date() } });
```

---

## 9. Deployment

### 9.1 Frontend Deployment (Netlify)

**Build Configuration:**
```yaml
# netlify.toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  REACT_APP_API_URL = "https://smart-investment-tracker.onrender.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Build Process:**
1. Install dependencies: `npm install`
2. Build React app: `webpack --mode production`
3. Output to `dist/` folder
4. Deploy to Netlify CDN
5. Enable HTTPS automatically

**Environment Variables:**
- `REACT_APP_API_URL`: Backend API URL

**URL:** https://smart-investment-tracker.netlify.app

### 9.2 Backend Deployment (Render)

**Service Configuration:**
```yaml
# render.yaml (implicit)
services:
  - type: web
    name: smart-investment-tracker
    env: node
    region: singapore
    plan: free
    buildCommand: npm install
    startCommand: npm start
    rootDir: server
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false  # Set in dashboard
      - key: JWT_SECRET
        sync: false  # Set in dashboard
      - key: ENABLE_NAV_SYNC
        value: true
```

**Deployment Process:**
1. Push to GitHub main branch
2. Render auto-detects changes
3. Runs `npm install` in server/
4. Starts with `npm start`
5. Health check on `/api/health`
6. Goes live in ~2-3 minutes

**Environment Variables:**
- `NODE_ENV`: production
- `PORT`: 5000
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ENABLE_NAV_SYNC`: Enable/disable daily NAV sync

**URL:** https://smart-investment-tracker.onrender.com

**Free Tier Limitations:**
- Spins down after 15 minutes of inactivity
- Takes 50+ seconds to wake up
- 750 hours/month free
- Automatic SSL

### 9.3 Database (MongoDB Atlas)

**Cluster Configuration:**
- Tier: M0 (Free)
- Region: AWS Singapore
- Storage: 512 MB
- RAM: Shared
- Connections: 500 max

**Connection String:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_investment?retryWrites=true&w=majority
```

**Security:**
- IP Whitelist: 0.0.0.0/0 (allow all for Render)
- Database user with read/write permissions
- Network encryption enabled

---

## 10. Workflows

### 10.1 User Registration & Login Flow

```
1. User visits app
   ↓
2. Clicks "Register"
   ↓
3. Fills form (email, password, name)
   ↓
4. Frontend validates input
   ↓
5. POST /api/auth/register
   ↓
6. Backend validates email uniqueness
   ↓
7. Hash password with bcrypt
   ↓
8. Save user to MongoDB
   ↓
9. Generate JWT token
   ↓
10. Return token + user data
   ↓
11. Frontend stores token in localStorage
   ↓
12. Redirect to main app
   ↓
13. User is logged in
```

### 10.2 Portfolio Generation Workflow

```
1. User enters investment details
   - Amount: ₹100,000
   - Duration: 3 years
   - Risk: Medium
   ↓
2. Clicks "Get Recommendations"
   ↓
3. Frontend validates inputs
   ↓
4. POST /api/buckets/generate
   ↓
5. Backend queries FinancialData
   - Filter: type = mutual_fund
   - Filter: riskCategory matches user risk
   ↓
6. Calculate advanced metrics for each fund
   - Sharpe, Sortino, Treynor ratios
   - Alpha, Beta, Standard Deviation
   - Information Ratio, Expense Ratio
   ↓
7. Score each fund (0-100)
   - Risk-adjusted: 45%
   - Stability: 25%
   - Manager skill: 20%
   - Cost efficiency: 10%
   ↓
8. Rank funds by score
   ↓
9. Generate 3 strategies:
   
   Conservative:
   - Select top 8 low-risk funds
   - Allocate: 60% debt, 40% equity
   - Expected return: 8-10%
   
   Balanced:
   - Select top 10 medium-risk funds
   - Allocate: 50% debt, 50% equity
   - Expected return: 10-12%
   
   Aggressive:
   - Select top 12 high-risk funds
   - Allocate: 20% debt, 80% equity
   - Expected return: 12-15%
   ↓
10. For each strategy:
    - Calculate total investment
    - Project future value
    - Compute expected gain
    - Calculate annualized return
    ↓
11. Fetch benchmark data
    - Nifty 50: 12% p.a.
    - Sensex: 11.5% p.a.
    - Nifty 500: 13% p.a.
    ↓
12. Compare portfolio vs benchmarks
    - Calculate relative returns
    - Determine outperformance
    - Generate chart data
    ↓
13. Return 3 portfolio options
    ↓
14. Frontend displays results
    - Strategy tabs
    - Summary cards
    - Fund cards with metrics
    - Benchmark comparison charts
    ↓
15. User reviews options
    ↓
16. User selects preferred strategy
    ↓
17. User clicks "Save Portfolio"
    ↓
18. POST /api/portfolio/save
    ↓
19. Backend saves to MongoDB
    ↓
20. Success message displayed
```

### 10.3 Daily NAV Sync Workflow

```
Server starts
   ↓
Check ENABLE_NAV_SYNC env var
   ↓
If enabled:
   ↓
Start navSyncJob
   ↓
Schedule: Every 24 hours at 6:00 AM IST
   ↓
Job triggers:
   ↓
1. Fetch AMFI data
   URL: https://www.amfiindia.com/spages/NAVAll.txt
   ↓
2. Parse text file
   - Split by newlines
   - Skip header lines
   - Extract fields by semicolon
   ↓
3. Transform each record:
   {
     schemeCode: "119551",
     schemeName: "Aditya Birla Sun Life Liquid Fund",
     nav: 345.6789,
     date: "2025-11-28",
     schemeType: "Open Ended Schemes",
     schemeCategory: "Liquid Fund",
     isin: "INF209K01YM7",
     lastUpdated: new Date()
   }
   ↓
4. Bulk upsert to MongoDB
   - Match by schemeCode
   - Update if exists
   - Insert if new
   ↓
5. Log statistics:
   - Total processed: 14,113
   - New funds: 25
   - Updated: 14,088
   - Errors: 0
   ↓
6. Wait 24 hours
   ↓
7. Repeat
```

### 10.4 Hybrid Fund Enrichment Workflow

```
Request: GET /api/hybrid/funds
   ↓
1. Query FinancialData collection
   Filter: type = mutual_fund
   Result: 50 curated funds
   ↓
2. For each fund:
   ↓
   Extract schemeCode from symbol
   (e.g., "FUND001" → "119551")
   ↓
   Query NAV collection
   Match: schemeCode = "119551"
   ↓
   If found:
     - Add realTimeNAV object
     - Update currentPrice with NAV
     - Add lastUpdated timestamp
   ↓
   If not found:
     - Keep original data
     - Mark as "no real-time data"
   ↓
3. Count statistics:
   - curatedFunds: 50
   - curatedWithRealTimeNAV: 48
   - totalFundsAvailable: 14,113
   - coveragePercentage: 96%
   ↓
4. Return enriched funds + stats
   ↓
5. Frontend displays:
   - Fund cards with live NAV
   - Coverage badges
   - Last updated time
```

### 10.5 Benchmark Comparison Workflow

```
Portfolio generated
   ↓
Extract portfolio metrics:
   - Total funds: 10
   - Total investment: ₹100,000
   - Weighted avg return: 11%
   - Duration: 3 years
   ↓
Calculate portfolio projection:
   FV = PV × (1 + r)^n
   FV = 100,000 × (1.11)^3
   FV = ₹136,763
   Gain = ₹36,763
   ↓
Fetch benchmark returns:
   - Nifty 50: 12% p.a.
   - Sensex: 11.5% p.a.
   - Nifty 500: 13% p.a.
   ↓
Calculate benchmark projections:
   
   Nifty 50:
   FV = 100,000 × (1.12)^3 = ₹140,493
   Relative = 11% - 12% = -1%
   Outperformance = No
   
   Sensex:
   FV = 100,000 × (1.115)^3 = ₹137,851
   Relative = 11% - 11.5% = -0.5%
   Outperformance = No
   
   Nifty 500:
   FV = 100,000 × (1.13)^3 = ₹143,960
   Relative = 11% - 13% = -2%
   Outperformance = No
   ↓
Generate chart data:
   Year 0: Portfolio=100k, Nifty50=100k, Sensex=100k, Nifty500=100k
   Year 1: Portfolio=111k, Nifty50=112k, Sensex=111.5k, Nifty500=113k
   Year 2: Portfolio=123k, Nifty50=125k, Sensex=124k, Nifty500=128k
   Year 3: Portfolio=137k, Nifty50=140k, Sensex=138k, Nifty500=144k
   ↓
Determine best/worst:
   Best: Nifty 500 (13%)
   Worst: Sensex (11.5%)
   ↓
Return comparison data
   ↓
Frontend renders:
   - Comparison table
   - Growth chart
   - Performance badges
   - Relative return indicators
```

---

## 11. Security Considerations

### 11.1 Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Token stored in localStorage (client-side)
- Protected routes require valid token

### 11.2 API Security
- CORS enabled for specific origins
- Rate limiting (future enhancement)
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose

### 11.3 Data Privacy
- User passwords never stored in plain text
- JWT secrets stored in environment variables
- MongoDB credentials not in code
- HTTPS enforced on all deployments

---

## 12. Performance Optimizations

### 12.1 Caching
- API responses cached for 24 hours
- NAV data cached until next sync
- Reduces external API calls by 90%

### 12.2 Database Indexing
- Unique indexes on email, symbol, schemeCode
- Compound indexes on userId + createdAt
- Query performance: <50ms average

### 12.3 Frontend Optimization
- Webpack production build with minification
- Code splitting (future enhancement)
- Lazy loading of components (future)
- CSS optimization

### 12.4 Backend Optimization
- Bulk operations for NAV sync
- Efficient MongoDB queries
- Connection pooling
- Async/await for non-blocking I/O

---

## 13. Future Enhancements

### 13.1 Planned Features
- Real-time portfolio tracking
- SIP calculator
- Tax optimization suggestions
- Goal-based planning
- Mobile app (React Native)
- Email notifications
- Portfolio rebalancing alerts

### 13.2 Technical Improvements
- Redis caching layer
- GraphQL API
- WebSocket for real-time updates
- Microservices architecture
- Kubernetes deployment
- CI/CD pipeline
- Automated testing (Jest, Cypress)

---

## 14. Troubleshooting

### Common Issues

**1. Render service spinning down**
- Cause: Free tier limitation
- Solution: First request takes 50s to wake up
- Alternative: Upgrade to paid plan

**2. MongoDB connection timeout**
- Cause: IP not whitelisted
- Solution: Add 0.0.0.0/0 to Atlas whitelist

**3. CORS errors**
- Cause: Frontend URL not in CORS config
- Solution: Update CORS settings in server

**4. NAV sync not running**
- Cause: ENABLE_NAV_SYNC = false
- Solution: Set environment variable to true

**5. Portfolio generation returns empty**
- Cause: No funds in database
- Solution: Run /api/data/mock-seed

---

## 15. Monitoring & Logs

### Health Check
```bash
curl https://smart-investment-tracker.onrender.com/api/health
```

Expected response:
```json
{
  "uptime": 1234.56,
  "timestamp": 1732851234567,
  "status": "OK",
  "database": "connected"
}
```

### Server Logs
- View in Render dashboard
- Filter by log level
- Search by keyword
- Download logs for analysis

### Key Metrics to Monitor
- API response time
- Database query time
- NAV sync success rate
- User registration rate
- Portfolio generation success rate

---

## 16. Contact & Support

**Developer:** Kshitij Patil
**Repository:** https://github.com/kshitijp852/smart-investment-tracker
**Live App:** https://smart-investment-tracker.netlify.app
**API:** https://smart-investment-tracker.onrender.com

---

**Document Version:** 1.0
**Last Updated:** November 29, 2025
**Status:** Production Ready ✅

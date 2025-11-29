# Smart Investment Recommendation System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Health Check

#### GET /health
Check system health and database connectivity.

**Response:**
```json
{
  "uptime": 123.45,
  "timestamp": 1700000000000,
  "status": "OK",
  "database": "connected"
}
```

---

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "age": 30,
  "income": 75000,
  "riskProfile": "medium"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

### Preferences

#### POST /preferences
Save user investment preferences. (Protected)

**Request Body:**
```json
{
  "amount": 100000,
  "duration": 3,
  "riskLevel": "medium",
  "goalType": "wealth_creation"
}
```

#### GET /preferences/:userId
Get user preferences. (Protected)

---

### Financial Data

#### GET /data/mock-seed
Seed database with sample financial data.

**Response:**
```json
{
  "message": "Seeded X instruments"
}
```

#### GET /data/list
List all financial instruments.

**Response:**
```json
{
  "data": [
    {
      "type": "stock",
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "priceHistory": [...]
    }
  ]
}
```

---

### Alpha Vantage Integration

#### GET /alpha/fetch?symbol=TCS&force=false
Fetch real-time stock data from Alpha Vantage API.

**Query Parameters:**
- `symbol` (required): Stock symbol
- `force` (optional): Force refresh cached data

**Response:**
```json
{
  "symbol": "TCS",
  "data": {...},
  "cached": false
}
```

---

### Recommendations

#### POST /recommendations/generate
Generate investment recommendations based on user inputs.

**Request Body:**
```json
{
  "amount": 100000,
  "duration": 3,
  "riskLevel": "medium"
}
```

**Response:**
```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "input": {
    "amount": 100000,
    "duration": 3,
    "riskLevel": "medium"
  },
  "recommendations": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "type": "stock",
      "expectedReturn": 0.15,
      "score": 0.85,
      "risk": "medium"
    }
  ]
}
```

**Scoring Algorithm:**
```
Score = (CAGR * 0.6) + (Sharpe Ratio * 0.3) + (Liquidity * 0.1)
```

---

### Portfolio

#### POST /portfolio/save
Save user portfolio. (Protected)

**Request Body:**
```json
{
  "items": [
    {
      "symbol": "TCS",
      "type": "stock",
      "amount": 50000
    },
    {
      "symbol": "HDFC_MF",
      "type": "mutual_fund",
      "amount": 30000
    }
  ]
}
```

**Response:**
```json
{
  "saved": true,
  "portfolio": {
    "userId": "user_id",
    "items": [...],
    "totalAmount": 80000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /portfolio/list
Get all portfolios for logged-in user. (Protected)

**Response:**
```json
{
  "portfolios": [
    {
      "userId": "user_id",
      "items": [...],
      "totalAmount": 80000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## ML Service API

### Base URL
```
http://localhost:8000
```

#### GET /
Health check for ML service.

**Response:**
```json
{
  "ok": true,
  "model_loaded": true
}
```

#### POST /predict
Predict investment risk category.

**Request Body:**
```json
{
  "features": [0.15, 0.25, 0.8]
}
```
Features: [CAGR, Volatility, Sharpe Ratio]

**Response:**
```json
{
  "prediction": [1]
}
```
Prediction: 0 = High Risk, 1 = Good Investment

---

### Fund Exploration

#### GET /funds/explore
Explore all available mutual funds with advanced filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `category` (string, optional) - Filter by fund category (e.g., "equity", "large cap", "debt")
- `search` (string, optional) - Search by scheme name
- `sortBy` (string, default: "score") - Sort field: "score", "return", "name", "nav"
- `sortOrder` (string, default: "desc") - Sort order: "asc" or "desc"
- `minReturn` (number, optional) - Minimum expected return percentage (not currently applied in aggregation)
- `maxReturn` (number, optional) - Maximum expected return percentage (not currently applied in aggregation)

**Example Requests:**
```bash
# Get first 20 funds
GET /api/funds/explore?page=1&limit=20

# Search for HDFC funds
GET /api/funds/explore?search=hdfc&limit=10

# Filter by category
GET /api/funds/explore?category=large%20cap&page=1

# Sort by NAV descending
GET /api/funds/explore?sortBy=nav&sortOrder=desc&limit=5

# Combined filters
GET /api/funds/explore?category=equity&search=sbi&sortBy=name&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "schemeCode": "119018",
      "schemeName": "HDFC Large Cap Fund - Growth Option - Direct Plan",
      "category": "Equity Scheme - Large Cap Fund",
      "currentNAV": 1282.041,
      "navDate": "2025-11-27T18:30:00.000Z",
      "expectedReturn": 11,
      "projectedValue5Y": 2160.31,
      "riskScore": 4,
      "score": 86
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 4674,
    "totalItems": 14022,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "category": "large cap",
    "minReturn": null,
    "maxReturn": null,
    "search": null
  },
  "sorting": {
    "sortBy": "nav",
    "sortOrder": "desc"
  }
}
```

**Fund Metrics:**
- `expectedReturn` - Expected annual return percentage based on category
- `projectedValue5Y` - Projected NAV value after 5 years
- `riskScore` - Risk rating from 1 (lowest) to 7 (highest)
- `score` - Overall fund score (0-100) based on NAV, returns, and recency

**Category-Based Expected Returns:**
- Liquid Funds: 5%
- Debt/Bond Funds: 7.5%
- Hybrid/Balanced Funds: 9.5%
- Large Cap Funds: 11%
- Flexi/Multi Cap Funds: 12%
- ELSS/Tax Saver Funds: 12%
- Mid Cap Funds: 13%
- Small Cap Funds: 15%
- Default: 10%

**Risk Score Mapping:**
- 1: Liquid Funds (Lowest Risk)
- 2: Debt/Bond Funds
- 3: Hybrid/Balanced Funds
- 4: Large Cap/Index Funds
- 5: Flexi/Multi Cap/ELSS Funds
- 6: Mid Cap Funds
- 7: Small Cap Funds (Highest Risk)

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting middleware.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

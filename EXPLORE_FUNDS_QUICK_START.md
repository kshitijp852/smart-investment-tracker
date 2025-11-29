# Explore Funds API - Quick Start

## What It Does
Browse and search through 14,000+ mutual funds with filtering, sorting, and pagination.

## Endpoint
```
GET /api/funds/explore
```

## Quick Examples

### 1. Get First 20 Funds
```bash
curl 'http://localhost:5001/api/funds/explore?page=1&limit=20'
```

### 2. Search for HDFC Funds
```bash
curl 'http://localhost:5001/api/funds/explore?search=hdfc'
```

### 3. Filter by Large Cap
```bash
curl 'http://localhost:5001/api/funds/explore?category=large%20cap'
```

### 4. Sort by NAV (Highest First)
```bash
curl 'http://localhost:5001/api/funds/explore?sortBy=nav&sortOrder=desc&limit=10'
```

### 5. Combined: Search SBI Equity Funds
```bash
curl 'http://localhost:5001/api/funds/explore?category=equity&search=sbi&sortBy=name'
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max: 100) |
| category | string | - | Filter by category |
| search | string | - | Search scheme name |
| sortBy | string | score | Sort field (score/return/name/nav) |
| sortOrder | string | desc | Sort order (asc/desc) |

## Response Fields

Each fund includes:
- **schemeCode**: Unique identifier
- **schemeName**: Fund name
- **category**: Fund category
- **currentNAV**: Latest NAV value
- **navDate**: NAV date
- **expectedReturn**: Expected annual return (%)
- **projectedValue5Y**: Projected value after 5 years
- **riskScore**: Risk rating (1-7, 1=lowest)
- **score**: Overall fund score (0-100)

## Test It
```bash
./test-explore-funds.sh
```

## Full Documentation
See `EXPLORE_FUNDS_FEATURE.md` for complete details.

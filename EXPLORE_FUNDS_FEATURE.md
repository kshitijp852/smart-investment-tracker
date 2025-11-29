# Explore All Funds Feature

## Overview
The Explore Funds API allows users to browse, search, filter, and sort through all available mutual funds in the database with advanced pagination support.

## Implementation Summary

### Files Created
1. **server/src/routes/explore-funds.js** - Main API route handler with filtering, sorting, and pagination logic

### Files Modified
1. **server/src/app.js** - Added route registration for `/api/funds/explore`
2. **API_DOCUMENTATION.md** - Added comprehensive documentation for the new endpoint

### Test Files
1. **test-explore-funds.sh** - Automated test script for various API scenarios

## Features

### ✅ Pagination
- Configurable page size (default: 20, max: 100)
- Page navigation with metadata (hasNextPage, hasPrevPage)
- Total count and page count

### ✅ Filtering
- **Category Filter**: Filter by fund category (equity, debt, large cap, etc.)
- **Search**: Search by scheme name (case-insensitive)
- **Exclusions**: Automatically excludes institutional, matured, and closed funds

### ✅ Sorting
- Sort by: score, return, name, or NAV
- Sort order: ascending or descending
- Default: Sort by score descending

### ✅ Computed Metrics
Each fund includes:
- **expectedReturn**: Category-based expected annual return (%)
- **projectedValue5Y**: Projected NAV after 5 years
- **riskScore**: Risk rating from 1 (lowest) to 7 (highest)
- **score**: Overall fund score (0-100)

### ✅ Latest NAV Only
Uses MongoDB aggregation to return only the most recent NAV for each fund, avoiding duplicates.

## API Endpoint

### GET /api/funds/explore

**Query Parameters:**
```
page        - Page number (default: 1)
limit       - Items per page (default: 20, max: 100)
category    - Filter by category (optional)
search      - Search by scheme name (optional)
sortBy      - Sort field: score, return, name, nav (default: score)
sortOrder   - Sort order: asc, desc (default: desc)
```

**Example Requests:**
```bash
# Basic pagination
GET /api/funds/explore?page=1&limit=20

# Search for HDFC funds
GET /api/funds/explore?search=hdfc

# Filter by large cap funds
GET /api/funds/explore?category=large%20cap

# Sort by NAV descending
GET /api/funds/explore?sortBy=nav&sortOrder=desc

# Combined: Search SBI equity funds, sort by name
GET /api/funds/explore?category=equity&search=sbi&sortBy=name&sortOrder=asc
```

## Response Structure

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
    "category": "all",
    "minReturn": null,
    "maxReturn": null,
    "search": null
  },
  "sorting": {
    "sortBy": "score",
    "sortOrder": "desc"
  }
}
```

## Expected Returns by Category

| Category | Expected Return |
|----------|----------------|
| Liquid Funds | 5% |
| Debt/Bond Funds | 7.5% |
| Hybrid/Balanced Funds | 9.5% |
| Large Cap Funds | 11% |
| Flexi/Multi Cap Funds | 12% |
| ELSS/Tax Saver Funds | 12% |
| Mid Cap Funds | 13% |
| Small Cap Funds | 15% |
| Default | 10% |

## Risk Score Mapping

| Risk Score | Category | Risk Level |
|-----------|----------|------------|
| 1 | Liquid Funds | Lowest |
| 2 | Debt/Bond Funds | Very Low |
| 3 | Hybrid/Balanced Funds | Low |
| 4 | Large Cap/Index Funds | Medium |
| 5 | Flexi/Multi Cap/ELSS | Medium-High |
| 6 | Mid Cap Funds | High |
| 7 | Small Cap Funds | Highest |

## Fund Score Calculation

The score (0-100) is calculated based on:
- **Base Score**: 50 points
- **NAV Maturity Bonus**: +10 for NAV > 100, +10 more for NAV > 500
- **Expected Return Bonus**: expectedReturn × 100
- **Recency Bonus**: +5 if NAV updated within last 7 days
- **Cap**: Maximum score is 100

## Testing

Run the test script:
```bash
./test-explore-funds.sh
```

This tests:
1. Basic pagination
2. Search functionality
3. Category filtering
4. Sorting by NAV
5. Sorting by name
6. Combined filters

## Performance Considerations

- Uses MongoDB aggregation pipeline for efficient queries
- Indexes on schemeCode, category, and date for fast lookups
- Returns only latest NAV per scheme to avoid duplicates
- Pagination limits maximum results per page to 100

## Future Enhancements

Potential improvements:
1. Apply minReturn/maxReturn filters in aggregation pipeline (currently post-processing)
2. Add more sorting options (by risk score, projected value)
3. Add date range filtering for NAV data
4. Cache popular queries
5. Add fund comparison endpoint
6. Include historical performance metrics

## Integration with Frontend

Frontend can use this API to build:
- Fund explorer page with search and filters
- Fund comparison tool
- Category-wise fund listings
- Top performers dashboard
- Custom fund screener

## No Impact On

This feature does NOT affect:
- Existing basket generation logic
- Portfolio APIs
- Benchmark comparison
- NAV sync jobs
- Database schema
- Authentication flow

## Status

✅ **IMPLEMENTED AND TESTED**
- API endpoint working
- Pagination functional
- Filtering operational
- Sorting working
- Documentation complete
- Test script created

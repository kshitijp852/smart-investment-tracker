# Explore Funds UI - User Guide

## How to Access

1. **Open your browser** and go to: `http://localhost:3000`

2. **Click "🔍 Explore Funds"** in the navigation bar

3. You'll see the Explore Funds page with all features!

## What You'll See

### 🔍 Search & Filter Bar
- **Search Box**: Type fund name (e.g., "HDFC", "SBI", "Axis")
- **Category Dropdown**: Filter by fund type
  - All Categories
  - Equity
  - Large Cap
  - Mid Cap
  - Small Cap
  - Debt
  - Hybrid
  - ELSS
  - Liquid
- **Sort Dropdown**: Sort funds by
  - Highest/Lowest Score
  - Highest/Lowest NAV
  - Highest/Lowest Return
  - Name (A-Z or Z-A)

### 📊 Fund Cards
Each fund displays:
- **Fund Name** and **Category**
- **Current NAV**: Latest Net Asset Value
- **Expected Return**: Annual return percentage
- **5Y Projection**: Projected value after 5 years
- **Fund Score**: Overall rating (0-100)
- **Risk Badge**: Color-coded risk level
  - 🟢 Green = Low Risk (Liquid, Debt)
  - 🟡 Yellow = Medium Risk (Large Cap, Hybrid)
  - 🟠 Orange = High Risk (Mid Cap)
  - 🔴 Red = Very High Risk (Small Cap)
- **NAV Date**: Last updated date

### 📄 Pagination
- Navigate through pages with Previous/Next buttons
- Shows current page and total pages
- 20 funds per page

## Example Searches

### Find HDFC Funds
1. Type "hdfc" in search box
2. Click "Search"
3. See all HDFC mutual funds

### Browse Large Cap Funds
1. Select "Large Cap" from category dropdown
2. Funds automatically filter

### Top Performing Funds
1. Select "Highest Return" from sort dropdown
2. See best performing funds first

### Low Risk Investments
1. Select "Liquid" or "Debt" from category
2. Browse safe, low-risk options

## Features

✅ **Real-time Data**: Shows latest NAV from database (14,000+ funds)
✅ **Smart Filtering**: Combine search + category + sorting
✅ **Responsive Design**: Works on desktop and mobile
✅ **Fast Loading**: Efficient pagination
✅ **Color-coded Risk**: Easy visual risk assessment

## Tips

💡 **Start Broad**: Begin with category filter, then narrow with search
💡 **Compare Scores**: Higher scores indicate better overall performance
💡 **Check Risk**: Match risk level to your investment goals
💡 **Recent NAV**: Look for recently updated funds (shown in date)

## Technical Details

- **API Endpoint**: `GET /api/funds/explore`
- **Data Source**: MongoDB NAV collection
- **Update Frequency**: Daily NAV sync
- **Total Funds**: 14,000+ mutual funds
- **Categories**: 10+ fund categories

## Troubleshooting

### No Funds Showing?
- Check if server is running: `http://localhost:5001`
- Verify NAV data is synced (happens automatically on server start)

### Search Not Working?
- Make sure you clicked "Search" button
- Try clearing search and starting over

### Slow Loading?
- Normal for first load (fetching from database)
- Subsequent pages load faster

## Next Steps

After exploring funds:
1. Note down interesting fund names
2. Go back to Home (🏠)
3. Generate recommendations
4. Compare with funds you explored

## Screenshots Location

The UI includes:
- Clean, modern card-based layout
- Gradient backgrounds for visual appeal
- Hover effects on cards
- Smooth transitions
- Mobile-responsive grid

## Browser Compatibility

✅ Chrome (recommended)
✅ Firefox
✅ Safari
✅ Edge

## Need Help?

- Check `EXPLORE_FUNDS_FEATURE.md` for technical details
- See `API_DOCUMENTATION.md` for API specs
- Run `./test-explore-funds.sh` to test backend

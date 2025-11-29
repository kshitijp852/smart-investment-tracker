# Dual Comparison Feature - Historical + Projected Returns

## Overview
Shows BOTH historical performance (proof) AND projected returns (forecast) to give users complete transparency.

## What's New

### 1. Data Type Indicator
- **Historical Data** badge (green) - Real NAV-based returns
- **Projected Returns** badge (blue) - Expected future returns

### 2. Dual Display
When historical data is available:
- **Primary**: Historical actual returns (what really happened)
- **Secondary**: Projected future returns (what's expected)

When historical data is NOT available:
- **Primary**: Projected returns with clear indicator
- Shows it's a forecast, not historical proof

### 3. Visual Distinction
- Historical returns marked with "actual" label
- Projected returns in separate blue section
- Clear badges to show data type

## Example Display

### Scenario 1: Historical Data Available (36 mapped funds)
```
📊 Performance Comparison ✓ Historical Data

Period | Your Basket | Benchmark | Difference
1Y     | 12.5% actual| 12.0%     | +0.5% ✓
3Y     | 11.2% actual| 10.5%     | +0.7% ✓
5Y     | 10.8% actual| 10.0%     | +0.8% ✓

📈 Projected Future Returns
1Y: 15.0% expected
3Y: 14.5% expected
5Y: 14.0% expected
```

### Scenario 2: No Historical Data (unmapped funds)
```
📊 Performance Comparison ⚡ Projected Returns

Period | Your Basket | Benchmark | Difference
1Y     | 15.0%      | 12.0%     | +3.0% ✓
3Y     | 14.5%      | 10.5%     | +4.0% ✓
5Y     | 14.0%      | 10.0%     | +4.0% ✓

Note: Based on expected returns, not historical data
```

## Benefits

### For Users
- ✅ **Transparency** - Know if it's real or projected
- ✅ **Proof** - See actual historical performance
- ✅ **Forecast** - Understand future expectations
- ✅ **Honesty** - No misleading claims

### For Credibility
- ✅ **Professional** - Industry-standard approach
- ✅ **Trustworthy** - Clear about data sources
- ✅ **Compliant** - Meets disclosure standards
- ✅ **Defensible** - Can prove claims with data

## Technical Implementation

### Backend Changes
1. Always fetch both historical and projected returns
2. Set `dataType` field ('historical' or 'projected')
3. Include `projectedReturn` when historical data exists
4. Fallback gracefully when data unavailable

### Frontend Changes
1. Show data type badge
2. Display historical returns as primary
3. Show projected returns in separate section
4. Add visual indicators for data type

### CSS Additions
- Data type badges (green/blue)
- Projected comparison section
- Hover effects
- Responsive design

## Files Modified
- `server/src/routes/buckets-multi.js` - Dual data fetching
- `client/src/components/BenchmarkComparison.jsx` - Dual display
- `client/src/styles.css` - New styles

## Testing Checklist
- [ ] Historical data shows with green badge
- [ ] Projected data shows with blue badge
- [ ] Both sections display when historical available
- [ ] Only projected shows when historical unavailable
- [ ] Tooltips work on hover
- [ ] Responsive on mobile
- [ ] Data accuracy verified

## Status
✅ Implemented
⏳ Testing on localhost
🚀 Ready to push after confirmation

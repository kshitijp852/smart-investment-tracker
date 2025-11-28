#!/bin/bash

echo "🔍 Production Environment Check"
echo "=================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get Render URL from user
read -p "Enter your Render backend URL (e.g., https://your-app.onrender.com): " RENDER_URL

# Remove trailing slash if present
RENDER_URL=${RENDER_URL%/}

echo ""
echo -e "${BLUE}Testing: ${RENDER_URL}${NC}"
echo ""

# Test 1: Health Check
echo "Test 1: Backend Health Check..."
HEALTH=$(curl -s -w "\n%{http_code}" "${RENDER_URL}/api/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH" | tail -n1)
RESPONSE=$(echo "$HEALTH" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend is LIVE and responding${NC}"
else
    echo -e "${RED}✗ Backend is not responding (HTTP $HTTP_CODE)${NC}"
    echo "  Check Render dashboard to see if service is running"
    exit 1
fi
echo ""

# Test 2: MongoDB Connection
echo "Test 2: MongoDB Connection..."
if echo "$RESPONSE" | grep -q "connected"; then
    echo -e "${GREEN}✓ MongoDB is connected${NC}"
else
    echo -e "${YELLOW}⚠ Cannot verify MongoDB connection from health check${NC}"
fi
echo ""

# Test 3: Hybrid System Stats
echo "Test 3: Checking Hybrid System..."
HYBRID_STATS=$(curl -s "${RENDER_URL}/api/hybrid/stats")

if echo "$HYBRID_STATS" | grep -q "curatedFunds"; then
    echo -e "${GREEN}✓ Hybrid system is working${NC}"
    
    CURATED=$(echo "$HYBRID_STATS" | grep -o '"curatedFunds":[0-9]*' | grep -o '[0-9]*')
    TOTAL=$(echo "$HYBRID_STATS" | grep -o '"totalFundsAvailable":[0-9]*' | grep -o '[0-9]*')
    WITH_NAV=$(echo "$HYBRID_STATS" | grep -o '"curatedWithRealTimeNAV":[0-9]*' | grep -o '[0-9]*')
    
    echo "  📊 Curated Funds: $CURATED"
    echo "  ✨ Total Available: $TOTAL"
    echo "  🔄 With Real-time NAV: $WITH_NAV"
else
    echo -e "${RED}✗ Hybrid system not responding${NC}"
fi
echo ""

# Test 4: NAV Data
echo "Test 4: Checking NAV Data..."
NAV_STATS=$(curl -s "${RENDER_URL}/api/nav/stats")

if echo "$NAV_STATS" | grep -q "totalRecords"; then
    echo -e "${GREEN}✓ NAV data is available${NC}"
    
    TOTAL_RECORDS=$(echo "$NAV_STATS" | grep -o '"totalRecords":[0-9]*' | grep -o '[0-9]*')
    UNIQUE_SCHEMES=$(echo "$NAV_STATS" | grep -o '"uniqueSchemes":[0-9]*' | grep -o '[0-9]*')
    
    echo "  📈 Total NAV Records: $TOTAL_RECORDS"
    echo "  🎯 Unique Schemes: $UNIQUE_SCHEMES"
    
    if [ "$TOTAL_RECORDS" -lt 1000 ]; then
        echo -e "${YELLOW}  ⚠ Low NAV data - consider running sync${NC}"
    fi
else
    echo -e "${RED}✗ NAV data not available${NC}"
    echo "  Run: curl -X POST ${RENDER_URL}/api/nav/sync"
fi
echo ""

# Test 5: NAV Sync Status
echo "Test 5: Checking NAV Sync Job..."
SYNC_STATUS=$(curl -s "${RENDER_URL}/api/nav/sync/status")

if echo "$SYNC_STATUS" | grep -q "lastRun"; then
    echo -e "${GREEN}✓ NAV sync job is configured${NC}"
    
    IS_SCHEDULED=$(echo "$SYNC_STATUS" | grep -o '"isScheduled":[a-z]*' | grep -o '[a-z]*')
    echo "  🕐 Auto-sync enabled: $IS_SCHEDULED"
    
    if echo "$SYNC_STATUS" | grep -q "lastRun"; then
        echo "  ✓ Last sync completed"
    fi
else
    echo -e "${YELLOW}⚠ Cannot verify sync status${NC}"
fi
echo ""

# Test 6: Portfolio Generation
echo "Test 6: Testing Portfolio Generation..."
PORTFOLIO=$(curl -s -X POST "${RENDER_URL}/api/buckets/generate" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100000, "duration": 3, "riskLevel": "medium"}')

if echo "$PORTFOLIO" | grep -q "bucketOptions"; then
    echo -e "${GREEN}✓ Portfolio generation is working${NC}"
    
    FUND_COUNT=$(echo "$PORTFOLIO" | grep -o '"fundCount":[0-9]*' | head -1 | grep -o '[0-9]*')
    if [ ! -z "$FUND_COUNT" ]; then
        echo "  💼 Generated portfolio with $FUND_COUNT funds"
    fi
else
    echo -e "${RED}✗ Portfolio generation failed${NC}"
    echo "  This is the main feature - needs investigation"
fi
echo ""

# Test 7: Benchmark System
echo "Test 7: Testing Benchmark System..."
BENCHMARK=$(curl -s "${RENDER_URL}/api/benchmark/indices")

if echo "$BENCHMARK" | grep -q "NIFTY"; then
    echo -e "${GREEN}✓ Benchmark system is working${NC}"
else
    echo -e "${YELLOW}⚠ Benchmark system may have issues${NC}"
fi
echo ""

# Test 8: CORS Check
echo "Test 8: Checking CORS Configuration..."
echo "  Testing from Netlify domain..."
CORS_TEST=$(curl -s -H "Origin: https://smart-investment-tracker.netlify.app" \
    -H "Access-Control-Request-Method: POST" \
    -X OPTIONS "${RENDER_URL}/api/buckets/generate" \
    -w "\n%{http_code}" 2>/dev/null)

CORS_CODE=$(echo "$CORS_TEST" | tail -n1)
if [ "$CORS_CODE" = "200" ] || [ "$CORS_CODE" = "204" ]; then
    echo -e "${GREEN}✓ CORS is configured correctly${NC}"
else
    echo -e "${YELLOW}⚠ CORS may need configuration${NC}"
    echo "  Add your Netlify URL to CORS whitelist in server/src/app.js"
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 Summary${NC}"
echo ""

# Count checks
TOTAL_CHECKS=8
PASSED=0

[ "$HTTP_CODE" = "200" ] && ((PASSED++))
echo "$RESPONSE" | grep -q "connected" && ((PASSED++))
echo "$HYBRID_STATS" | grep -q "curatedFunds" && ((PASSED++))
echo "$NAV_STATS" | grep -q "totalRecords" && ((PASSED++))
echo "$SYNC_STATUS" | grep -q "lastRun" && ((PASSED++))
echo "$PORTFOLIO" | grep -q "bucketOptions" && ((PASSED++))
echo "$BENCHMARK" | grep -q "NIFTY" && ((PASSED++))
[ "$CORS_CODE" = "200" ] || [ "$CORS_CODE" = "204" ] && ((PASSED++))

echo "Checks Passed: $PASSED/$TOTAL_CHECKS"
echo ""

if [ $PASSED -ge 6 ]; then
    echo -e "${GREEN}✅ Your backend is READY for production!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Upload the client/dist folder to Netlify"
    echo "2. Share your Netlify URL with friends"
    echo "3. Monitor Render logs for any issues"
else
    echo -e "${YELLOW}⚠️  Some issues detected${NC}"
    echo ""
    echo "Recommendations:"
    [ "$TOTAL_RECORDS" -lt 1000 ] && echo "• Run NAV sync: curl -X POST ${RENDER_URL}/api/nav/sync"
    ! echo "$PORTFOLIO" | grep -q "bucketOptions" && echo "• Check Render logs for errors"
    echo "• Verify MongoDB connection string in Render environment variables"
fi

echo ""
echo "Render Dashboard: https://dashboard.render.com"
echo "MongoDB Atlas: https://cloud.mongodb.com"
echo ""

#!/bin/bash

echo "🧪 Testing AMFI NAV System"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5001/api"

# Test 1: Check NAV stats
echo "Test 1: Checking NAV statistics..."
STATS=$(curl -s "$BASE_URL/nav/stats")
if echo "$STATS" | grep -q "totalRecords"; then
    echo -e "${GREEN}✓ NAV stats endpoint working${NC}"
    echo "$STATS" | grep -o '"totalRecords":[0-9]*' | head -1
    echo "$STATS" | grep -o '"uniqueSchemes":[0-9]*' | head -1
else
    echo -e "${RED}✗ NAV stats failed${NC}"
fi
echo ""

# Test 2: Search for schemes
echo "Test 2: Searching for schemes..."
SEARCH=$(curl -s "$BASE_URL/nav/search?q=axis&limit=3")
if echo "$SEARCH" | grep -q "success"; then
    echo -e "${GREEN}✓ Search endpoint working${NC}"
    echo "$SEARCH" | grep -o '"count":[0-9]*' | head -1
else
    echo -e "${RED}✗ Search failed${NC}"
fi
echo ""

# Test 3: Get categories
echo "Test 3: Fetching categories..."
CATEGORIES=$(curl -s "$BASE_URL/nav/categories")
if echo "$CATEGORIES" | grep -q "category"; then
    echo -e "${GREEN}✓ Categories endpoint working${NC}"
    echo "$CATEGORIES" | grep -o '"count":[0-9]*' | head -1
else
    echo -e "${RED}✗ Categories failed${NC}"
fi
echo ""

# Test 4: Get latest NAV for a scheme
echo "Test 4: Getting latest NAV..."
LATEST=$(curl -s "$BASE_URL/nav/latest/119551")
if echo "$LATEST" | grep -q "nav"; then
    echo -e "${GREEN}✓ Latest NAV endpoint working${NC}"
    echo "$LATEST" | grep -o '"nav":[0-9.]*' | head -1
else
    echo -e "${RED}✗ Latest NAV failed${NC}"
fi
echo ""

# Test 5: Get NAV history
echo "Test 5: Getting NAV history..."
HISTORY=$(curl -s "$BASE_URL/nav/history/119551?limit=5")
if echo "$HISTORY" | grep -q "history"; then
    echo -e "${GREEN}✓ NAV history endpoint working${NC}"
    echo "$HISTORY" | grep -o '"count":[0-9]*' | head -1
else
    echo -e "${RED}✗ NAV history failed${NC}"
fi
echo ""

# Test 6: Get sync status
echo "Test 6: Checking sync job status..."
SYNC_STATUS=$(curl -s "$BASE_URL/nav/sync/status")
if echo "$SYNC_STATUS" | grep -q "lastRun"; then
    echo -e "${GREEN}✓ Sync status endpoint working${NC}"
    echo "$SYNC_STATUS" | grep -o '"isScheduled":[a-z]*' | head -1
else
    echo -e "${RED}✗ Sync status failed${NC}"
fi
echo ""

# Test 7: Calculate portfolio returns
echo "Test 7: Calculating portfolio returns..."
RETURNS=$(curl -s -X POST "$BASE_URL/portfolio/returns" \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {"schemeCode": "119551", "units": 100, "investmentDate": "2024-01-01"}
    ]
  }')
if echo "$RETURNS" | grep -q "portfolio"; then
    echo -e "${GREEN}✓ Portfolio returns endpoint working${NC}"
    echo "$RETURNS" | grep -o '"portfolioReturn":[0-9.-]*' | head -1
else
    echo -e "${RED}✗ Portfolio returns failed${NC}"
fi
echo ""

# Test 8: Get period returns
echo "Test 8: Getting period returns..."
PERIOD_RETURNS=$(curl -s "$BASE_URL/portfolio/returns/119551")
if echo "$PERIOD_RETURNS" | grep -q "returns"; then
    echo -e "${GREEN}✓ Period returns endpoint working${NC}"
    echo "$PERIOD_RETURNS" | grep -o '"1Y":{[^}]*}' | head -1 | head -c 50
else
    echo -e "${RED}✗ Period returns failed${NC}"
fi
echo ""

# Test 9: Blended benchmark comparison
echo "Test 9: Testing blended benchmark..."
BENCHMARK=$(curl -s -X POST "$BASE_URL/benchmark/blended" \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {"schemeCode": "119551", "units": 100, "investmentDate": "2024-01-01"}
    ]
  }')
if echo "$BENCHMARK" | grep -q "benchmarkReturn"; then
    echo -e "${GREEN}✓ Blended benchmark endpoint working${NC}"
    echo "$BENCHMARK" | grep -o '"beatsBenchmark":[a-z]*' | head -1
else
    echo -e "${RED}✗ Blended benchmark failed${NC}"
fi
echo ""

echo "=========================================="
echo -e "${YELLOW}📊 Test Summary${NC}"
echo "All NAV system endpoints have been tested."
echo ""
echo "Available Endpoints:"
echo "  • GET  /api/nav/stats"
echo "  • GET  /api/nav/search?q=<query>"
echo "  • GET  /api/nav/categories"
echo "  • GET  /api/nav/latest/:schemeCode"
echo "  • GET  /api/nav/history/:schemeCode"
echo "  • GET  /api/nav/schemes"
echo "  • POST /api/nav/sync"
echo "  • GET  /api/nav/sync/status"
echo "  • POST /api/portfolio/returns"
echo "  • GET  /api/portfolio/returns/:schemeCode"
echo "  • POST /api/benchmark/blended"
echo ""
echo "Documentation: NAV_SYSTEM_DOCUMENTATION.md"
echo ""

#!/bin/bash

echo "🧪 Testing Hybrid Fund System"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5001/api"

# Test 1: Get hybrid stats
echo "Test 1: Checking hybrid system statistics..."
STATS=$(curl -s "$BASE_URL/hybrid/stats")
if echo "$STATS" | grep -q "curatedFunds"; then
    echo -e "${GREEN}✓ Hybrid stats endpoint working${NC}"
    echo "$STATS" | grep -o '"curatedFunds":[0-9]*'
    echo "$STATS" | grep -o '"curatedWithRealTimeNAV":[0-9]*'
    echo "$STATS" | grep -o '"totalFundsAvailable":[0-9]*'
    echo "$STATS" | grep -o '"coveragePercentage":"[0-9.]*"'
else
    echo -e "${RED}✗ Hybrid stats failed${NC}"
fi
echo ""

# Test 2: Get curated funds with latest NAV
echo "Test 2: Getting curated funds with latest NAV..."
FUNDS=$(curl -s "$BASE_URL/hybrid/funds")
if echo "$FUNDS" | grep -q "latestNAV"; then
    echo -e "${GREEN}✓ Curated funds endpoint working${NC}"
    echo "$FUNDS" | grep -o '"count":[0-9]*' | head -1
    echo "$FUNDS" | grep -o '"realTimeData":true' | wc -l | xargs echo "Funds with real-time NAV:"
else
    echo -e "${RED}✗ Curated funds failed${NC}"
fi
echo ""

# Test 3: Search curated funds only
echo "Test 3: Searching curated funds only..."
SEARCH_CURATED=$(curl -s "$BASE_URL/hybrid/search?q=axis&includeNonCurated=false&limit=5")
if echo "$SEARCH_CURATED" | grep -q "isCurated"; then
    echo -e "${GREEN}✓ Curated-only search working${NC}"
    echo "$SEARCH_CURATED" | grep -o '"count":[0-9]*'
else
    echo -e "${RED}✗ Curated search failed${NC}"
fi
echo ""

# Test 4: Search all funds (curated + NAV)
echo "Test 4: Searching all funds (curated + NAV)..."
SEARCH_ALL=$(curl -s "$BASE_URL/hybrid/search?q=hdfc&includeNonCurated=true&limit=10")
if echo "$SEARCH_ALL" | grep -q "source"; then
    echo -e "${GREEN}✓ All funds search working${NC}"
    echo "$SEARCH_ALL" | grep -o '"count":[0-9]*'
    echo "$SEARCH_ALL" | grep -o '"isCurated":true' | wc -l | xargs echo "Curated results:"
    echo "$SEARCH_ALL" | grep -o '"isCurated":false' | wc -l | xargs echo "Non-curated results:"
else
    echo -e "${RED}✗ All funds search failed${NC}"
fi
echo ""

# Test 5: Get fund by scheme code
echo "Test 5: Getting fund by scheme code..."
SCHEME=$(curl -s "$BASE_URL/hybrid/scheme/119551")
if echo "$SCHEME" | grep -q "schemeName"; then
    echo -e "${GREEN}✓ Scheme lookup working${NC}"
    echo "$SCHEME" | grep -o '"isCurated":[a-z]*'
    echo "$SCHEME" | grep -o '"latestNAV":[0-9.]*' | head -1
else
    echo -e "${RED}✗ Scheme lookup failed${NC}"
fi
echo ""

# Test 6: Manual sync trigger
echo "Test 6: Testing manual sync..."
SYNC=$(curl -s -X POST "$BASE_URL/hybrid/sync")
if echo "$SYNC" | grep -q "updated"; then
    echo -e "${GREEN}✓ Manual sync working${NC}"
    echo "$SYNC" | grep -o '"updated":[0-9]*'
    echo "$SYNC" | grep -o '"notFound":[0-9]*'
else
    echo -e "${RED}✗ Manual sync failed${NC}"
fi
echo ""

echo "=========================================="
echo -e "${YELLOW}📊 Hybrid System Summary${NC}"
echo ""
echo "The hybrid system combines:"
echo "  • 42 curated funds (with metrics)"
echo "  • 14,113+ AMFI funds (real-time NAV)"
echo ""
echo "Key Features:"
echo "  ✓ Fast recommendations (curated)"
echo "  ✓ Real-time prices (AMFI)"
echo "  ✓ Track any fund (14,113+)"
echo "  ✓ Automatic daily sync"
echo "  ✓ Unified search"
echo ""
echo "Endpoints:"
echo "  • GET  /api/hybrid/funds"
echo "  • GET  /api/hybrid/fund/:id"
echo "  • GET  /api/hybrid/scheme/:schemeCode"
echo "  • GET  /api/hybrid/search"
echo "  • POST /api/hybrid/sync"
echo "  • GET  /api/hybrid/stats"
echo ""
echo "Documentation: HYBRID_SYSTEM_GUIDE.md"
echo ""

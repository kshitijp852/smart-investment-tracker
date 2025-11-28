#!/bin/bash

echo "🧪 Testing Blended Benchmark Index Feature"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "Test 1: Checking server status..."
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running${NC}"
    exit 1
fi
echo ""

# Test 2: Get benchmark indices list
echo "Test 2: Fetching benchmark indices..."
INDICES_RESPONSE=$(curl -s http://localhost:5001/api/benchmark/indices)
if echo "$INDICES_RESPONSE" | grep -q "NIFTY 50 TRI"; then
    echo -e "${GREEN}✓ Benchmark indices endpoint working${NC}"
    echo "Sample indices:"
    echo "$INDICES_RESPONSE" | grep -o '"benchmarkIndex":"[^"]*"' | head -3
else
    echo -e "${RED}✗ Failed to fetch benchmark indices${NC}"
fi
echo ""

# Test 3: Generate portfolio with benchmark comparison
echo "Test 3: Generating portfolio with benchmark comparison..."
PORTFOLIO_RESPONSE=$(curl -s -X POST http://localhost:5001/api/buckets/generate \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000, "duration": 3, "riskLevel": "medium"}')

if echo "$PORTFOLIO_RESPONSE" | grep -q "benchmarkComparison"; then
    echo -e "${GREEN}✓ Portfolio generated with benchmark comparison${NC}"
    
    # Extract some benchmark data
    echo ""
    echo "Benchmark Data Preview:"
    echo "$PORTFOLIO_RESPONSE" | grep -o '"benchmarkName":"[^"]*"' | head -1
    echo "$PORTFOLIO_RESPONSE" | grep -o '"beatsBenchmark":{[^}]*}' | head -1
else
    echo -e "${RED}✗ Benchmark comparison not found in response${NC}"
fi
echo ""

# Test 4: Test direct benchmark comparison endpoint
echo "Test 4: Testing direct benchmark comparison endpoint..."
COMPARISON_RESPONSE=$(curl -s -X POST http://localhost:5001/api/benchmark/compare \
  -H "Content-Type: application/json" \
  -d '{
    "basket": [
      {"category": "large_cap", "percentage": 40, "expectedReturn": 0.15},
      {"category": "mid_cap", "percentage": 30, "expectedReturn": 0.18},
      {"category": "debt", "percentage": 30, "expectedReturn": 0.07}
    ],
    "duration": 3,
    "initialInvestment": 100000
  }')

if echo "$COMPARISON_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Direct benchmark comparison endpoint working${NC}"
    echo ""
    echo "Comparison Result:"
    echo "$COMPARISON_RESPONSE" | grep -o '"outperformedPeriods":[0-9]*' | head -1
else
    echo -e "${RED}✗ Direct benchmark comparison failed${NC}"
fi
echo ""

# Test 5: Check frontend build
echo "Test 5: Checking frontend build..."
if [ -f "client/src/components/BenchmarkComparison.jsx" ]; then
    echo -e "${GREEN}✓ BenchmarkComparison component exists${NC}"
else
    echo -e "${RED}✗ BenchmarkComparison component not found${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${YELLOW}📊 Test Summary${NC}"
echo "All core benchmark features have been tested."
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Generate a portfolio recommendation"
echo "3. Scroll down to see the Benchmark Comparison section"
echo "4. Verify the visual components are rendering correctly"
echo ""
echo "Feature Components:"
echo "  • Performance Summary Card"
echo "  • Benchmark Composition"
echo "  • Performance Comparison Table"
echo "  • Growth Comparison Chart"
echo "  • Performance Badges"
echo ""

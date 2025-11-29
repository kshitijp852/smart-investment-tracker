#!/bin/bash

echo "🧪 Testing Explore Funds API"
echo "================================"
echo ""

BASE_URL="http://localhost:5001/api/funds/explore"

echo "1️⃣ Test: Basic pagination (first 3 funds)"
curl -s "${BASE_URL}?page=1&limit=3" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "2️⃣ Test: Search by name (HDFC funds)"
curl -s "${BASE_URL}?page=1&limit=3&search=hdfc" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "3️⃣ Test: Filter by category (Large Cap)"
curl -s "${BASE_URL}?page=1&limit=3&category=large%20cap" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "4️⃣ Test: Sort by NAV descending"
curl -s "${BASE_URL}?page=1&limit=3&sortBy=nav&sortOrder=desc" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "5️⃣ Test: Sort by name ascending"
curl -s "${BASE_URL}?page=1&limit=3&sortBy=name&sortOrder=asc" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "6️⃣ Test: Combined filters (Equity + Search)"
curl -s "${BASE_URL}?page=1&limit=3&category=equity&search=sbi" | python3 -m json.tool | head -40
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"

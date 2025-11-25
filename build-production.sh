#!/bin/bash

echo "======================================"
echo "Building for Production"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build client
echo -e "${BLUE}Step 1: Building React client...${NC}"
cd client
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Client built successfully${NC}"
else
    echo -e "${RED}✗ Client build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Build location${NC}"
echo "Client build: $(pwd)/dist"
echo ""

# Show build size
echo -e "${BLUE}Step 3: Build size${NC}"
du -sh dist
echo ""

# Optional: Copy to server public folder
echo -e "${BLUE}Step 4: Copy to server (optional)${NC}"
read -p "Copy build to server/public? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd ..
    mkdir -p server/public
    cp -r client/dist/* server/public/
    echo -e "${GREEN}✓ Files copied to server/public${NC}"
fi

echo ""
echo -e "${GREEN}======================================"
echo "Production Build Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy client/dist to Vercel/Netlify"
echo "2. Deploy server to Railway/Heroku"
echo "3. Set environment variables"
echo "4. Run: curl -X POST https://your-api.com/api/data/mfapi/quick-sync"
echo ""
echo "See PRODUCTION_BUILD.md for detailed instructions"

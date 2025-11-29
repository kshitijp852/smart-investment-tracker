#!/bin/bash

echo "🚀 Deploying Smart Investment Tracker to Netlify"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "❌ Error: client directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Step 1: Build the client
echo "📦 Step 1: Building client..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build"
    exit 1
fi

echo "📊 Build output:"
ls -lh dist/
echo ""

# Step 3: Instructions for deployment
echo "🎯 Next Steps:"
echo ""
echo "Option 1: Drag & Drop (Easiest)"
echo "  1. Go to: https://app.netlify.com/drop"
echo "  2. Drag the 'client/dist' folder onto the page"
echo "  3. Done! Your site will be live in 30 seconds"
echo ""
echo "Option 2: Netlify CLI (If installed)"
echo "  Run: netlify deploy --prod --dir=client/dist"
echo ""
echo "Option 3: GitHub Auto-Deploy (If connected)"
echo "  Your site should auto-deploy from the git push we just did!"
echo "  Check: https://app.netlify.com/"
echo ""

# Step 4: Open Netlify in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Opening Netlify dashboard..."
    open "https://app.netlify.com/"
fi

echo ""
echo "✨ Build complete! Ready to deploy!"
echo ""
echo "📁 Build location: client/dist"
echo "📦 Build size: $(du -sh dist | cut -f1)"
echo ""
echo "🎉 Your beautiful Explore Funds feature is ready to go live!"

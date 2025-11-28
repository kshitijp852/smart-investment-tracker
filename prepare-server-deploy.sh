#!/bin/bash

echo "📦 Preparing Server for Render Deployment"
echo "=========================================="
echo ""

# Create a clean deployment folder
rm -rf server-deploy
mkdir -p server-deploy

# Copy server files
echo "Copying server files..."
cp -r server/* server-deploy/

# Remove node_modules (Render will install fresh)
rm -rf server-deploy/node_modules

# Create a zip file
echo "Creating deployment package..."
cd server-deploy
zip -r ../server-deploy.zip . -x "*.DS_Store" -x "node_modules/*"
cd ..

# Cleanup
rm -rf server-deploy

echo ""
echo "✅ Deployment package ready: server-deploy.zip"
echo ""
echo "Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Select your backend service"
echo "3. Go to Manual Deploy"
echo "4. Upload server-deploy.zip"
echo "5. Wait for deployment to complete"
echo ""
echo "Or use Git if connected:"
echo "  git add ."
echo "  git commit -m 'Add benchmark and NAV features'"
echo "  git push origin main"
echo ""

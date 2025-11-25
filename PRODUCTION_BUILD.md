# Production Build Guide

## Quick Build

```bash
# 1. Build client
cd client
npm run build

# 2. Build is ready in client/dist/
# 3. Deploy to your hosting service
```

## Detailed Steps

### 1. Build Client (React)

```bash
cd client
npm run build
```

This creates optimized production files in `client/dist/`:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Ready to deploy

### 2. Environment Variables

Create `.env` files for production:

**Server (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db/smart-investment
JWT_SECRET=your-super-secret-key-change-this
ML_SERVICE_URL=http://ml-service:8000
```

**Client (.env.production)**
```env
REACT_APP_API_URL=https://your-api-domain.com
```

### 3. Deployment Options

#### Option A: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Your app is now running:
# - Client: http://localhost:3000
# - Server: http://localhost:5000
# - ML Service: http://localhost:8000
```

#### Option B: Traditional Hosting

**Client (Static Files)**
Deploy `client/dist/` to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Server (Node.js)**
Deploy to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

**ML Service (Python)**
Deploy to:
- AWS Lambda
- Google Cloud Run
- Heroku

### 4. Serve Client from Server (Single Domain)

```bash
# Install serve package
cd server
npm install express-static

# Update server/src/app.js
```

Add to `server/src/app.js`:
```javascript
const path = require('path');

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../client/dist')));

// All other routes return React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});
```

Then:
```bash
# Build client
cd client && npm run build

# Start server (serves both API and client)
cd ../server && npm start

# Everything on http://localhost:5000
```

## Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable CORS only for your domain
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Sanitize user inputs

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Use production MongoDB (Atlas)
- [ ] Enable database indexes

### Monitoring
- [ ] Set up error logging (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Monitor API performance
- [ ] Set up uptime monitoring

### Data
- [ ] Seed production database
- [ ] Set up daily MFApi sync cron job
- [ ] Configure backup strategy

## Quick Deploy Scripts

### Build Script
```bash
#!/bin/bash
# build-prod.sh

echo "Building for production..."

# Build client
cd client
npm run build
echo "✓ Client built"

# Copy to server public folder
mkdir -p ../server/public
cp -r dist/* ../server/public/
echo "✓ Files copied to server"

echo "✓ Production build complete!"
```

### Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "Deploying to production..."

# Build
./build-prod.sh

# Deploy (example for Heroku)
git add .
git commit -m "Production build"
git push heroku main

echo "✓ Deployed!"
```

## Hosting Recommendations

### Free Tier Options

**Client:**
- Vercel (Best for React)
- Netlify
- GitHub Pages

**Server:**
- Railway (500 hours/month free)
- Render (Free tier)
- Fly.io (Free tier)

**Database:**
- MongoDB Atlas (512MB free)

**ML Service:**
- Google Cloud Run (Free tier)
- AWS Lambda (1M requests free)

### Paid Options (Production Ready)

**All-in-One:**
- AWS (EC2 + RDS + S3)
- DigitalOcean App Platform
- Google Cloud Platform

**Estimated Cost:** $20-50/month for small scale

## Environment-Specific Builds

### Development
```bash
npm run dev
```

### Staging
```bash
NODE_ENV=staging npm start
```

### Production
```bash
NODE_ENV=production npm start
```

## Post-Deployment

### 1. Sync MFApi Data
```bash
curl -X POST https://your-api.com/api/data/mfapi/quick-sync
```

### 2. Test Endpoints
```bash
# Health check
curl https://your-api.com/api/health

# Get recommendations
curl "https://your-api.com/api/buckets/generate?amount=50000&risk=medium"
```

### 3. Set Up Cron Job
```bash
# Daily sync at 4 PM IST
0 16 * * * curl -X POST https://your-api.com/api/data/mfapi/sync
```

## Performance Optimization

### Client
```javascript
// Enable code splitting
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### Server
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Cache static assets
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API not connecting
- Check REACT_APP_API_URL in client
- Verify CORS settings in server
- Check network/firewall rules

### Database connection fails
- Verify MONGODB_URI
- Check IP whitelist in MongoDB Atlas
- Test connection string

## Summary

**Simplest Production Setup:**
1. Build client: `cd client && npm run build`
2. Deploy client to Vercel (free)
3. Deploy server to Railway (free)
4. Use MongoDB Atlas (free)
5. Done! 🚀

**Time to deploy:** 15-30 minutes

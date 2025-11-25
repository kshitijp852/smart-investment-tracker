# Complete Setup Guide - Smart Investment Recommendation System

This guide will walk you through setting up the entire project from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Docker & Docker Compose** (optional but recommended) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd smart-investment-system
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server Configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_investment
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# External API Keys
ALPHA_VANTAGE_KEY=get_your_free_key_from_alphavantage.co
```

**Getting Alpha Vantage API Key:**
1. Visit https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Copy the API key to your `.env` file

### 3. Docker Setup (Recommended)

This is the easiest way to get everything running:

```bash
# Build and start all services
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000
- MongoDB: localhost:27017

### 4. Manual Setup (Alternative)

If you prefer to run services individually:

#### 4.1 Start MongoDB

**Option A: Using Docker**
```bash
docker-compose up -d mongo
```

**Option B: Local MongoDB**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### 4.2 Backend Setup

```bash
cd server

# Install dependencies
npm install

# Run database seed script
npm run seed

# Start development server
npm run dev
```

The server should now be running on http://localhost:5000

**Verify backend:**
```bash
curl http://localhost:5000/api/health
```

#### 4.3 Frontend Setup

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The frontend should open automatically at http://localhost:3000

#### 4.4 ML Service Setup

Open another terminal:

```bash
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python train.py

# Start the FastAPI server
uvicorn app:app --reload --port 8000
```

The ML service should be running on http://localhost:8000

**Verify ML service:**
```bash
curl http://localhost:8000/
```

## 5. Testing the Application

### 5.1 Seed Sample Data

**Option A: Via API**
```bash
curl http://localhost:5000/api/data/mock-seed
```

**Option B: Via npm script**
```bash
cd server
npm run seed
```

### 5.2 Register a User

Open http://localhost:3000 in your browser:

1. Click "Register"
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Age: 30
   - Income: 75000
   - Risk Profile: medium
3. Click "Register"

### 5.3 Generate Recommendations

1. Click "Home"
2. Set your preferences:
   - Amount: 100000
   - Duration: 3 years
   - Risk: medium
3. Click "Generate Recommendations"
4. View the chart and list of recommendations

### 5.4 Save Portfolio

1. After generating recommendations, click "Login" if not already logged in
2. Click "Save top 3 as Portfolio"
3. Check browser console for saved portfolio data

## 6. API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "age": 30,
    "income": 75000,
    "riskProfile": "medium"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

Save the token from the response.

### Generate Recommendations
```bash
curl -X POST http://localhost:5000/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "duration": 3,
    "riskLevel": "medium"
  }'
```

### Save Portfolio (Protected)
```bash
curl -X POST http://localhost:5000/api/portfolio/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "items": [
      {"symbol": "TCS", "type": "stock", "amount": 50000},
      {"symbol": "INFY", "type": "stock", "amount": 30000}
    ]
  }'
```

### ML Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": [0.15, 0.25, 0.8]
  }'
```

## 7. Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: connect ECONNREFUSED"**

Solution:
```bash
# Check if MongoDB is running
docker-compose ps
# OR
mongosh

# Restart MongoDB
docker-compose restart mongo
```

### Port Already in Use

**Error: "Port 3000/5000/8000 is already in use"**

Solution:
```bash
# Find process using the port (macOS/Linux)
lsof -i :3000
lsof -i :5000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change the port in .env or package.json
```

### npm Install Fails

Solution:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Python Dependencies Issues

Solution:
```bash
# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# Try with specific Python version
python3.11 -m pip install -r requirements.txt
```

### Docker Build Fails

Solution:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs
```

## 8. Development Workflow

### Making Changes

**Backend changes:**
```bash
cd server
npm run dev  # Auto-reloads on file changes
```

**Frontend changes:**
```bash
cd client
npm start  # Hot reload enabled
```

**ML service changes:**
```bash
cd ml-service
uvicorn app:app --reload  # Auto-reloads on file changes
```

### Adding New Dependencies

**Backend:**
```bash
cd server
npm install <package-name>
```

**Frontend:**
```bash
cd client
npm install <package-name>
```

**ML Service:**
```bash
cd ml-service
pip install <package-name>
pip freeze > requirements.txt
```

## 9. Production Deployment

### Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
JWT_SECRET=use_a_very_strong_random_secret_here
MONGO_URI=mongodb://your-production-db-url
```

### Build for Production

```bash
# Build all Docker images
docker-compose build

# Start in production mode
docker-compose up -d

# Or build frontend separately
cd client
npm run build
```

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific domains
- [ ] Add rate limiting
- [ ] Enable MongoDB authentication
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Regular security updates

## 10. Next Steps

- [ ] Add comprehensive test coverage
- [ ] Implement real-time data updates
- [ ] Add more financial instruments
- [ ] Enhance ML model with more features
- [ ] Add user dashboard with analytics
- [ ] Implement email notifications
- [ ] Add data visualization improvements
- [ ] Set up monitoring and alerting

## Support

For issues and questions:
1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review the [README](./README.md)
3. Open an issue on GitHub

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)

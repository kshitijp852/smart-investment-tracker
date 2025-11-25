
# Smart Investment Recommendation System

**"Invest Smarter, Not Harder"**

A complete full-stack FinTech web application that provides intelligent investment recommendations using machine learning and financial analytics.

## 🏗 Architecture

- **Frontend**: React.js with Webpack
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose ORM
- **ML Service**: Python + FastAPI with scikit-learn
- **Deployment**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
smart-investment-system/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── Dockerfile
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # External APIs
│   │   ├── middleware/     # Auth & validation
│   │   └── utils/          # Analytics functions
│   └── Dockerfile
├── ml-service/             # FastAPI ML microservice
│   ├── app.py
│   ├── train.py
│   └── Dockerfile
├── docker-compose.yml
└── API_DOCUMENTATION.md
```

## ✨ Features

### Core Functionality
- ✅ User registration & JWT authentication
- ✅ Investment preference collection
- ✅ Real-time financial data fetching (Alpha Vantage integration)
- ✅ Intelligent recommendation engine with scoring algorithm
- ✅ Portfolio management & tracking
- ✅ ML-based risk prediction
- ✅ Interactive charts and visualizations

### Analytics Engine
- CAGR (Compound Annual Growth Rate) calculation
- Sharpe ratio computation
- Volatility analysis
- Liquidity scoring
- Multi-factor scoring model: `Score = (CAGR × 0.6) + (Sharpe × 0.3) + (Liquidity × 0.1)`

### Database Models
- **User**: Authentication and profile data
- **Preference**: Investment goals and risk tolerance
- **FinancialData**: Historical price data for stocks, mutual funds, FDs
- **Portfolio**: User investment allocations
- **Cache**: API response caching

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd smart-investment-system

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# ML Service: http://localhost:8000
```

### Option 2: Local Development

#### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+

#### 1. Start MongoDB
```bash
docker-compose up -d mongo
# OR install MongoDB locally
```

#### 2. Backend Setup
```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your configuration
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Seed Sample Data
```bash
# In server directory
npm run seed
# OR call GET http://localhost:5000/api/data/mock-seed
```

#### 4. Frontend Setup
```bash
cd client
npm install
npm start
# Client runs on http://localhost:3000
```

#### 5. ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
python train.py  # Train the model
uvicorn app:app --reload --port 8000
# ML service runs on http://localhost:8000
```

## 📊 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Recommendations**
- `POST /api/recommendations/generate` - Generate investment recommendations

**Portfolio**
- `POST /api/portfolio/save` - Save portfolio (protected)
- `GET /api/portfolio/list` - Get user portfolios (protected)

**Financial Data**
- `GET /api/data/mock-seed` - Seed sample data
- `GET /api/data/list` - List all instruments
- `GET /api/alpha/fetch?symbol=TCS` - Fetch real-time data

**ML Service**
- `POST http://localhost:8000/predict` - Predict investment risk

## 🧪 Testing

```bash
# Run tests (when implemented)
cd server && npm test
cd client && npm test

# Validate builds
docker-compose build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_investment
JWT_SECRET=your_strong_secret_here

# External APIs
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

### Alpha Vantage API Key
Get your free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

## 🤖 ML Model

The ML service uses a Random Forest classifier to predict investment risk categories based on:
- CAGR (Compound Annual Growth Rate)
- Volatility (Standard deviation of returns)
- Sharpe Ratio (Risk-adjusted returns)

Train the model:
```bash
cd ml-service
python train.py
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with auth middleware
- Environment variable configuration
- CORS enabled (configure for production)

## 📈 Recommendation Algorithm

The system ranks investments using a weighted scoring model:

1. **CAGR (60% weight)**: Historical growth rate
2. **Sharpe Ratio (30% weight)**: Risk-adjusted returns
3. **Liquidity (10% weight)**: Asset liquidity score

Filters applied based on user risk tolerance (low/medium/high).

## 🐳 Docker Services

- **mongo**: MongoDB database (port 27017)
- **server**: Node.js backend (port 5000)
- **client**: React frontend (port 3000)
- **ml-service**: FastAPI ML service (port 8000)

## 🛠 Development

```bash
# Server with hot reload
cd server && npm run dev

# Client with hot reload
cd client && npm start

# ML service with hot reload
cd ml-service && uvicorn app:app --reload
```

## 📝 Notes

- This is a production-ready boilerplate with demo data
- Replace mock data with real API integrations for production
- Add comprehensive test coverage before deploying
- Configure rate limiting and security headers for production
- Set up proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

#!/bin/bash

# Smart Investment Recommendation System - Quick Start Script
# This script automates the setup process

set -e

echo "🚀 Smart Investment Recommendation System - Quick Start"
echo "========================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys before continuing!"
    echo "   Get Alpha Vantage key from: https://www.alphavantage.co/support/#api-key"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker detected"
    echo ""
    echo "Choose setup method:"
    echo "1) Docker (Recommended - Everything in containers)"
    echo "2) Local (Run services locally)"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "🐳 Starting services with Docker..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        echo ""
        echo "✅ Services started successfully!"
        echo ""
        echo "📍 Access points:"
        echo "   Frontend:  http://localhost:3000"
        echo "   Backend:   http://localhost:5000"
        echo "   ML Service: http://localhost:8000"
        echo "   MongoDB:   localhost:27017"
        echo ""
        echo "🌱 Seeding sample data..."
        sleep 5
        curl -s http://localhost:5000/api/data/mock-seed > /dev/null && echo "✅ Sample data seeded!" || echo "⚠️  Seed failed - try manually"
        echo ""
        echo "🎉 Setup complete! Open http://localhost:3000 in your browser"
        echo ""
        echo "Useful commands:"
        echo "  docker-compose logs -f     # View logs"
        echo "  docker-compose ps          # Check status"
        echo "  docker-compose down        # Stop services"
        exit 0
    fi
fi

# Local setup
echo ""
echo "🔧 Setting up locally..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js $(node --version) detected"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi
echo "✅ Python $(python3 --version) detected"

# Check MongoDB
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI not detected. Make sure MongoDB is running."
    echo "   You can start it with: docker-compose up -d mongo"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "📦 Installing ML service dependencies..."
cd ml-service
python3 -m pip install -r requirements.txt
echo "🤖 Training ML model..."
python3 train.py
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd client && npm start"
echo ""
echo "Terminal 3 - ML Service:"
echo "  cd ml-service && uvicorn app:app --reload --port 8000"
echo ""
echo "Terminal 4 - Seed data:"
echo "  cd server && npm run seed"
echo ""
echo "Or use Docker: docker-compose up -d"

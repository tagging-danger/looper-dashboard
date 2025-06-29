#!/bin/bash

echo "🚀 Starting Financial Analytics Dashboard Project"
echo "================================================"

# Check if MongoDB is running
echo "📊 Checking MongoDB status..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running. Starting it..."
    sudo systemctl start mongod
    sleep 3
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB started successfully"
    else
        echo "❌ Failed to start MongoDB. Please start it manually."
        exit 1
    fi
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/financial_analytics
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
EOF
    echo "✅ Backend .env file created"
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start the application
echo "🎯 Starting the application..."
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Demo accounts:"
echo "  Admin:    admin@financial.com / admin123"
echo "  Analyst:  analyst@financial.com / analyst123"
echo "  Viewer:   viewer@financial.com / viewer123"
echo ""
echo "Press Ctrl+C to stop the application"
echo "================================================"

# Start both servers
npm run dev 
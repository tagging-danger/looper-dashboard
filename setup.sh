#!/bin/bash

echo "🚀 Setting up Financial Analytics Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB v4.4 or higher."
    echo "You can download it from: https://www.mongodb.com/try/download/community"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/financial_analytics
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Run the application: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📋 Demo accounts:"
echo "   Admin: admin@financial.com / admin123"
echo "   Analyst: analyst@financial.com / analyst123"
echo "   Viewer: viewer@financial.com / viewer123"
echo ""
echo "📚 For more information, see README.md" 
#!/bin/bash

# Setup environment variables for the backend
echo "🔧 Setting up environment variables for Looper Dashboard Backend"
echo ""

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📝 Overwriting existing .env file..."
    else
        echo "❌ Setup cancelled."
        exit 0
    fi
fi

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-this-in-production")

# Create .env file
cat > .env << EOF
# Environment Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/financial_analytics

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Environment variables set:"
echo "   - NODE_ENV: development"
echo "   - PORT: 5000"
echo "   - MONGODB_URI: mongodb://localhost:27017/financial_analytics"
echo "   - JWT_SECRET: [generated randomly]"
echo "   - JWT_EXPIRES_IN: 24h"
echo "   - CORS_ORIGIN: http://localhost:3000"
echo "   - RATE_LIMIT_WINDOW_MS: 900000 (15 minutes)"
echo "   - RATE_LIMIT_MAX_REQUESTS: 100"
echo ""
echo "🚀 You can now start your backend with: npm run dev"
echo ""
echo "💡 For production deployment, update these values in your Railway environment variables." 
#!/bin/bash

# Setup environment variables for the frontend
echo "🔧 Setting up environment variables for Looper Dashboard Frontend"
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

echo "🚀 Please enter your Railway backend URL (e.g., https://your-app.up.railway.app):"
read -r RAILWAY_URL

# Remove trailing slash if present
RAILWAY_URL=${RAILWAY_URL%/}

# Create .env file
cat > .env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=$RAILWAY_URL/api
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Environment variables set:"
echo "   - REACT_APP_API_URL: $RAILWAY_URL/api"
echo ""
echo "🚀 You can now start your frontend with: npm start"
echo ""
echo "💡 Make sure your Railway backend is deployed and accessible at: $RAILWAY_URL" 
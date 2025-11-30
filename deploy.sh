#!/bin/bash
# Production Deployment Script for Linux/Mac

echo "🚀 Starting Production Deployment..."
echo ""

# Step 1: Build Frontend
echo "📦 Building React frontend..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

# Step 2: Copy build to server
echo "📋 Copying build to server..."
mkdir -p server/public
cp -r client/build/* server/public/
echo "✅ Build copied successfully"

# Step 3: Set production environment
export NODE_ENV=production

# Step 4: Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env file not found!"
    echo "   Please create server/.env with your configuration"
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "To start the production server:"
echo "  cd server"
echo "  npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"


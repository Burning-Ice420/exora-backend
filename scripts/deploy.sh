#!/bin/bash

# WanderBlocks Backend Deployment Script
set -e

echo "🚀 Starting WanderBlocks Backend Deployment..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Stop existing processes
echo "🛑 Stopping existing processes..."
pm2 stop wanderblocks-api 2>/dev/null || true
pm2 delete wanderblocks-api 2>/dev/null || true

# Start the application
echo "▶️ Starting application..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📊 Monitor your application with: pm2 monit"
echo "📝 View logs with: pm2 logs"
echo "🔄 Restart with: pm2 restart wanderblocks-api"

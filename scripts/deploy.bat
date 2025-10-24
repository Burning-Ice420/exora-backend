@echo off
REM WanderBlocks Backend Deployment Script for Windows

echo 🚀 Starting WanderBlocks Backend Deployment...

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PM2 is not installed. Installing PM2...
    npm install -g pm2
)

REM Create logs directory
if not exist logs mkdir logs

REM Install dependencies
echo 📦 Installing dependencies...
npm ci --only=production

REM Stop existing processes
echo 🛑 Stopping existing processes...
pm2 stop wanderblocks-api 2>nul
pm2 delete wanderblocks-api 2>nul

REM Start the application
echo ▶️ Starting application...
pm2 start ecosystem.config.js --env production

REM Save PM2 configuration
pm2 save
pm2 startup

echo ✅ Deployment completed successfully!
echo 📊 Monitor your application with: pm2 monit
echo 📝 View logs with: pm2 logs
echo 🔄 Restart with: pm2 restart wanderblocks-api

pause

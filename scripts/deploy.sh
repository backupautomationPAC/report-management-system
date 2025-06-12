#!/bin/bash

# Production Deployment Script
echo "🚀 Deploying Report Management System..."

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

# Build frontend
echo "🔨 Building frontend..."
cd ../frontend
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "🌐 Deployment URLs:"
echo "   Frontend: https://your-app.vercel.app"
echo "   Backend:  https://your-api.railway.app"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Railway"
echo "2. Deploy frontend to Vercel"
echo "3. Configure environment variables"
echo "4. Run database migrations"

#!/bin/bash
# Development environment reset script

echo "🧹 Stopping and cleaning Docker environment..."
docker-compose down -v

echo "🚀 Building and starting services..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🎯 Services started. Data will be automatically loaded from init scripts."
echo ""
echo "📊 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080/api"
echo "   Grafana: http://localhost:3001"
echo ""
echo "✅ Development environment is ready!"

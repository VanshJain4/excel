#!/bin/bash

echo "🛑 Stopping Complete SKOPEO.AI System..."

# Stop Docker containers
echo "📄 Stopping LibreOffice Collabora..."
docker-compose -f docker-compose.simple.yml down

# Stop Node.js processes
echo "🔧 Stopping Auth Backend..."
pkill -f "auth-backend"

echo "📁 Stopping WOPI Server..."
pkill -f "gpt/server.js"

echo "🎨 Stopping React Frontend..."
pkill -f "auth-interface"

echo "✅ All services stopped successfully!"

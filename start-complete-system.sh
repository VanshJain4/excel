#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Complete SKOPEO.AI System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start LibreOffice Collabora
echo "📄 Starting LibreOffice Collabora..."
docker-compose -f docker-compose.simple.yml up -d

# Wait for Collabora to start
echo "⏳ Waiting for Collabora to start..."
sleep 15

# Start Auth Backend
echo "🔧 Starting Auth Backend..."
cd "$SCRIPT_DIR/auth-backend" && npm run dev &
AUTH_PID=$!

# Wait for auth backend
sleep 5

# Start WOPI Server
echo "📁 Starting WOPI Server..."
cd "$SCRIPT_DIR/gpt" && node server.js &
WOPI_PID=$!

# Wait for WOPI server
sleep 3

# Start React Frontend
echo "🎨 Starting React Frontend..."
cd "$SCRIPT_DIR/auth-interface" && npm start &
FRONTEND_PID=$!

# Wait for frontend
sleep 5

echo ""
echo "🎉 Complete SKOPEO.AI System is running!"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Auth Backend: http://localhost:5001"
echo "📁 WOPI Server: http://localhost:3002"
echo "📄 LibreOffice: http://localhost:9980"
echo ""
echo "💡 To stop all services, run: ./stop-complete-system.sh"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $AUTH_PID $WOPI_PID $FRONTEND_PID 2>/dev/null
    docker-compose -f docker-compose.simple.yml down
    echo "✅ All services stopped."
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Keep script running
echo "Press Ctrl+C to stop all services..."
wait

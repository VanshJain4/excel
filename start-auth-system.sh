#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting LibreOffice Auth System...${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to check if MongoDB is running
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MongoDB is not running. Starting MongoDB...${NC}"
        brew services start mongodb-community 2>/dev/null || {
            echo -e "${RED}❌ Failed to start MongoDB. Please install MongoDB first:${NC}"
            echo "   brew install mongodb-community"
            echo "   brew services start mongodb-community"
            return 1
        }
        sleep 3
        return 0
    fi
}

# Check ports
echo -e "${BLUE}📋 Checking ports...${NC}"
check_port 5001 || exit 1
check_port 3001 || exit 1

# Check MongoDB
echo -e "${BLUE}🗄️  Checking MongoDB...${NC}"
check_mongodb || exit 1

# Kill any existing processes
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
pkill -f "node.*auth-backend" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

# Start backend
echo -e "${BLUE}🔧 Starting Auth Backend...${NC}"
cd auth-backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo -e "${BLUE}🎨 Starting Auth Frontend...${NC}"
cd auth-interface
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Check if frontend is running
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}🎉 Auth System is running!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3001${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:5001${NC}"
echo -e "${BLUE}📊 Health Check: http://localhost:5001/api/health${NC}"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Register a new account or login with Google"
echo "3. Upload spreadsheet files"
echo "4. Open files in LibreOffice Calc"
echo ""
echo -e "${YELLOW}🔧 To set up Google OAuth:${NC}"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Enable Google+ API"
echo "4. Create OAuth 2.0 credentials"
echo "5. Add http://localhost:5001/api/auth/google/callback to authorized redirect URIs"
echo "6. Update auth-backend/.env with your credentials"
echo ""
echo -e "${YELLOW}🛑 To stop the system:${NC}"
echo "   Press Ctrl+C or run: ./stop-auth-system.sh"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping Auth System...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Auth System stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait

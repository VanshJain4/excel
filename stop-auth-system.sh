#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping LibreOffice Auth System...${NC}"

# Kill backend processes
echo -e "${BLUE}🔧 Stopping Auth Backend...${NC}"
pkill -f "node.*auth-backend" 2>/dev/null
pkill -f "nodemon.*server.js" 2>/dev/null

# Kill frontend processes
echo -e "${BLUE}🎨 Stopping Auth Frontend...${NC}"
pkill -f "react-scripts" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Wait a moment for processes to stop
sleep 2

# Check if processes are still running
if pgrep -f "auth-backend" > /dev/null; then
    echo -e "${RED}❌ Backend is still running${NC}"
else
    echo -e "${GREEN}✅ Backend stopped${NC}"
fi

if pgrep -f "react-scripts" > /dev/null; then
    echo -e "${RED}❌ Frontend is still running${NC}"
else
    echo -e "${GREEN}✅ Frontend stopped${NC}"
fi

echo -e "${GREEN}🎉 Auth System stopped successfully!${NC}"

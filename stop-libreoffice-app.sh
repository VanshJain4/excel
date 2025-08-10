#!/bin/bash

# LibreOffice Calc Web App Stop Script
# This script stops the WOPI server and Collabora container

echo "🛑 Stopping LibreOffice Calc Web App..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop WOPI server
print_status "Stopping WOPI server..."
pkill -f "node server.js" 2>/dev/null || true

# Stop and remove Collabora container
print_status "Stopping Collabora container..."
docker stop collabora 2>/dev/null || true
docker rm collabora 2>/dev/null || true

print_success "All services stopped!"
echo ""
echo "✅ WOPI Server: Stopped"
echo "✅ Collabora Container: Stopped and removed"
echo "" 
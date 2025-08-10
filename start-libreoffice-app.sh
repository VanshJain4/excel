#!/bin/bash

# LibreOffice Calc Web App Startup Script
# This script starts the WOPI server, Collabora container, and opens the web interface

set -e  # Exit on any error

echo "🚀 Starting LibreOffice Calc Web App..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "gpt/server.js" ]; then
    print_error "server.js not found! Please run this script from the project root directory."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running! Please start Docker first."
        exit 1
    fi
}

# Function to stop and remove existing Collabora container
cleanup_collabora() {
    if docker ps -a --format "table {{.Names}}" | grep -q "collabora"; then
        print_status "Stopping existing Collabora container..."
        docker stop collabora 2>/dev/null || true
        docker rm collabora 2>/dev/null || true
        sleep 2
    fi
}

# Function to start Collabora container
start_collabora() {
    print_status "Starting Collabora Online container..."
    
    docker run -d \
        --name collabora \
        -p 9980:9980 \
        -e "domain=localhost" \
        -e "username=admin" \
        -e "password=collabora_password" \
        -e "extra_params=--o:ssl.enable=false --o:ssl.termination=false --o:net.frame_ancestors=localhost:3000 --o:net.post_allow.host=host.docker.internal:3000 --o:wopi.host.allowlist=host.docker.internal:3000 --o:net.post_allow.allowlist=host.docker.internal:3000 --o:net.post_allow.allowlist=localhost:3000" \
        --cap-add MKNOD \
        collabora/code:latest
    
    print_success "Collabora container started!"
}

# Function to wait for Collabora to be ready
wait_for_collabora() {
    print_status "Waiting for Collabora to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:9980/hosting/capabilities >/dev/null 2>&1; then
            print_success "Collabora is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Collabora failed to start within 60 seconds"
    return 1
}

# Function to start WOPI server
start_wopi_server() {
    print_status "Starting WOPI server..."
    
    # Kill any existing process on port 3000
    kill_port 3000
    
    # Start the server in background
    cd gpt
    nohup node server.js > ../wopi-server.log 2>&1 &
    WOPI_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 3
    
    # Check if server is running
    if check_port 3000; then
        print_success "WOPI server started on port 3000 (PID: $WOPI_PID)"
    else
        print_error "Failed to start WOPI server"
        exit 1
    fi
}

# Function to open web interface
open_web_interface() {
    print_status "Opening web interface..."
    sleep 2
    
    if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
    else
        print_warning "Could not automatically open browser. Please visit: http://localhost:3000"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Current Status:"
    echo "=================="
    
    if check_port 3000; then
        echo -e "${GREEN}✅ WOPI Server:${NC} Running on http://localhost:3000"
    else
        echo -e "${RED}❌ WOPI Server:${NC} Not running"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "collabora"; then
        echo -e "${GREEN}✅ Collabora:${NC} Running on http://localhost:9980"
    else
        echo -e "${RED}❌ Collabora:${NC} Not running"
    fi
    
    echo ""
    echo "🌐 Web Interface: http://localhost:3000"
    echo "📁 Logs: wopi-server.log"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Cleaning up..."
    
    # Kill WOPI server
    if [ ! -z "$WOPI_PID" ]; then
        kill $WOPI_PID 2>/dev/null || true
    fi
    
    # Stop Collabora container
    docker stop collabora 2>/dev/null || true
    
    print_success "Cleanup complete!"
}

# Set up trap to cleanup on script exit
trap cleanup EXIT

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Cleanup existing containers
    cleanup_collabora
    
    # Start Collabora
    start_collabora
    
    # Wait for Collabora
    wait_for_collabora
    
    # Start WOPI server
    start_wopi_server
    
    # Open web interface
    open_web_interface
    
    # Show status
    show_status
    
    print_success "LibreOffice Calc Web App is ready!"
    echo ""
    echo "🎯 To use the app:"
    echo "   1. Click 'Open CSV in LibreOffice Calc' button"
    echo "   2. Edit your spreadsheet in the web interface"
    echo "   3. Changes are automatically saved"
    echo ""
    echo "🛑 To stop: Press Ctrl+C"
    echo ""
    
    # Keep script running
    while true; do
        sleep 10
        # Check if services are still running
        if ! check_port 3000; then
            print_error "WOPI server stopped unexpectedly"
            break
        fi
        if ! docker ps --format "table {{.Names}}" | grep -q "collabora"; then
            print_error "Collabora container stopped unexpectedly"
            break
        fi
    done
}

# Run main function
main 
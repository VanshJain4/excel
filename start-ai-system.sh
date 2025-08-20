#!/bin/bash

# AI-Enhanced LibreOffice Calc Web App Startup Script
# This script starts the complete system with AI services integration

set -e  # Exit on any error

echo "🚀 Starting AI-Enhanced LibreOffice Calc Web App..."
echo "=================================================="

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

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running! Please start Docker first."
        exit 1
    fi
}

# Check if required environment variables are set
check_env() {
    print_status "Checking environment variables..."
    
    if [ -z "$AI_SERVICES_URL" ]; then
        print_warning "AI_SERVICES_URL not set, using default: http://localhost:3003"
        export AI_SERVICES_URL="http://localhost:3003"
    fi
    
    if [ -z "$NLP_SERVICES_URL" ]; then
        print_warning "NLP_SERVICES_URL not set, using default: http://localhost:3004"
        export NLP_SERVICES_URL="http://localhost:3004"
    fi
    
    if [ -z "$AI_SERVICES_API_KEY" ]; then
        print_warning "AI_SERVICES_API_KEY not set, using default key"
        export AI_SERVICES_API_KEY="default-key"
    fi
    
    if [ -z "$NLP_SERVICES_API_KEY" ]; then
        print_warning "NLP_SERVICES_API_KEY not set, using default key"
        export NLP_SERVICES_API_KEY="default-key"
    fi
}

# Start AI services (if available)
start_ai_services() {
    print_status "Starting AI services..."
    
    # Check if AI services are available
    if [ -d "../ai-services" ]; then
        print_status "Found AI services repo, starting..."
        cd ../ai-services
        if [ -f "docker-compose.yml" ]; then
            docker-compose up -d
            print_success "AI services started"
        else
            print_warning "No docker-compose.yml found in AI services repo"
        fi
        cd ../excel
    else
        print_warning "AI services repo not found at ../ai-services"
        print_warning "Please ensure your AI services are running on port 3003"
    fi
    
    # Check if NLP services are available
    if [ -d "../nlp-services" ]; then
        print_status "Found NLP services repo, starting..."
        cd ../nlp-services
        if [ -f "docker-compose.yml" ]; then
            docker-compose up -d
            print_success "NLP services started"
        else
            print_warning "No docker-compose.yml found in NLP services repo"
        fi
        cd ../excel
    else
        print_warning "NLP services repo not found at ../nlp-services"
        print_warning "Please ensure your NLP services are running on port 3004"
    fi
}

# Wait for AI services to be ready
wait_for_ai_services() {
    print_status "Waiting for AI services to be ready..."
    
    # Wait for AI services
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$AI_SERVICES_URL/health" >/dev/null 2>&1; then
            print_success "AI services are ready!"
            break
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_warning "AI services not ready after 60 seconds, continuing anyway..."
    fi
    
    # Wait for NLP services
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$NLP_SERVICES_URL/health" >/dev/null 2>&1; then
            print_success "NLP services are ready!"
            break
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_warning "NLP services not ready after 60 seconds, continuing anyway..."
    fi
}

# Start the main application
start_main_app() {
    print_status "Starting main LibreOffice application..."
    
    # Use the existing startup script
    ./start-libreoffice-app.sh
}

# Main execution
main() {
    check_docker
    check_env
    start_ai_services
    wait_for_ai_services
    start_main_app
    
    print_success "AI-Enhanced LibreOffice Calc Web App is ready!"
    echo ""
    echo "🎯 Services Status:"
    echo "=================="
    echo "✅ LibreOffice Web App: http://localhost:3000"
    echo "✅ Collabora Online: http://localhost:9980"
    echo "✅ AI Services: $AI_SERVICES_URL"
    echo "✅ NLP Services: $NLP_SERVICES_URL"
    echo ""
    echo "🤖 AI Features Available:"
    echo "========================"
    echo "• Natural language to formula conversion"
    echo "• Data analysis and insights"
    echo "• Automated spreadsheet operations"
    echo "• Context-aware suggestions"
    echo ""
    echo "🛑 To stop: Press Ctrl+C"
    echo ""
}

# Run main function
main 
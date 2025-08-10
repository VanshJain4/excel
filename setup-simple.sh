#!/bin/bash

echo "🚀 Setting up LibreOffice Calc Web App (Simple Version)"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Start the services using the simple compose file
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.simple.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.simple.yml ps

echo ""
echo "🎉 Setup complete! Your LibreOffice Calc web app is ready."
echo ""
echo "📱 Access your applications:"
echo "   • Nextcloud: http://localhost:8080 (admin/admin_password)"
echo "   • Collabora Online: http://localhost:9980"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Log in to Nextcloud with admin/admin_password"
echo "   3. Go to Settings → Apps and install 'Collabora Online'"
echo "   4. Go to Settings → Collabora Online"
echo "   5. Enter Collabora Online server URL: http://localhost:9980"
echo "   6. Upload a spreadsheet file (.ods, .xlsx, .csv)"
echo "   7. Click on the file to open it in LibreOffice Calc"
echo ""
echo "🔧 To stop the services: docker-compose -f docker-compose.simple.yml down"
echo "🔧 To view logs: docker-compose -f docker-compose.simple.yml logs -f"
echo ""
echo "💡 This is the simple version without HTTPS. For production, use the full setup with NGINX." 
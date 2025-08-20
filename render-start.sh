#!/bin/bash

# Render-specific startup script for SKOPEO.AI
# This script is designed for Render deployment without Docker requirements

set -e

echo "🚀 Starting SKOPEO.AI on Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the React frontend
echo "🏗️ Building React frontend..."
cd auth-interface && npm run build && cd ..

# Start the production server
echo "🚀 Starting production server..."
node railway-server.js 
#!/bin/bash

echo "=========================================="
echo "STI College Cybersecurity Hub - Backend"
echo "=========================================="
echo ""

BACKEND_DIR="/home/noxzz/Documents/PR2-main/backend"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed. Make sure npm is installed."
        exit 1
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Dependencies ready"
echo ""
echo "🚀 Starting backend server..."
echo "📍 Server URL: http://localhost:5000"
echo "📊 Database: $BACKEND_DIR/cybersecurity_hub.db"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

npm start

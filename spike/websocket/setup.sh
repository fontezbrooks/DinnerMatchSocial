#!/bin/bash

# DinnerMatch WebSocket POC Setup Script
set -e

echo "🚀 Setting up DinnerMatch WebSocket POC..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Node.js 16+ is recommended."
fi

echo "✅ Node.js $(node -v) detected"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the spike/websocket directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
# DinnerMatch WebSocket POC Configuration
PORT=3001
NODE_ENV=development

# Optional: Set to enable debug logging
# DEBUG=socket.io:*

# Optional: Set custom server URL for testing
# SERVER_URL=http://localhost:3001
EOF
    echo "📝 Created .env file with default configuration"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the server:    npm start"
echo "   2. Open test client:    http://localhost:3001/client.html"
echo "   3. Run performance tests: npm test"
echo "   4. Run stress tests:    npm run stress"
echo ""
echo "📚 Documentation:"
echo "   - README.md for complete usage guide"
echo "   - Server API at http://localhost:3001/api/health"
echo "   - Metrics at http://localhost:3001/api/metrics"
echo ""
echo "🧪 Quick test:"
echo "   1. Run: npm start"
echo "   2. Open two browser tabs to: http://localhost:3001/client.html"
echo "   3. Create room in first tab, join with room ID in second tab"
echo "   4. Test swipe synchronization between tabs"
#!/bin/bash

# VivEye Deployment Script
echo "🚀 Deploying VivEye..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# VivEye Environment Variables
MONGODB_URI=mongodb://admin:password@mongodb:27017/viveye?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
EOF
    echo "✅ Created .env file. Please update the values as needed."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ VivEye is now running!"
    echo "🌐 Web Interface: http://localhost:5000"
    echo "📊 MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📱 To access from other devices:"
    echo "   - Find your computer's IP address"
    echo "   - Access via: http://YOUR_IP:5000"
    echo ""
    echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Failed to start services. Check logs with:"
    echo "   docker-compose -f docker-compose.prod.yml logs"
fi

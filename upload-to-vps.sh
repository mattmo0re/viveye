#!/bin/bash

# VivEye VPS Upload Script
# Usage: ./upload-to-vps.sh YOUR_VPS_IP

if [ -z "$1" ]; then
    echo "Usage: ./upload-to-vps.sh YOUR_VPS_IP"
    echo "Example: ./upload-to-vps.sh 45.76.123.456"
    exit 1
fi

VPS_IP=$1
echo "🚀 Uploading VivEye to VPS: $VPS_IP"

# Create clean copy for upload
echo "📁 Creating clean copy..."
rm -rf /tmp/viveye-upload
mkdir -p /tmp/viveye-upload

# Copy files (excluding node_modules and build files)
echo "📋 Copying files..."
cp -r client /tmp/viveye-upload/
cp -r server /tmp/viveye-upload/
cp -r droppers /tmp/viveye-upload/
cp -r tor-data /tmp/viveye-upload/
cp package.json /tmp/viveye-upload/
cp README.md /tmp/viveye-upload/
cp start-viveye.sh /tmp/viveye-upload/
cp deploy-cloud.sh /tmp/viveye-upload/
cp docker-compose.yml /tmp/viveye-upload/
cp Dockerfile* /tmp/viveye-upload/
cp nginx.conf /tmp/viveye-upload/

# Remove unnecessary files
echo "🧹 Cleaning up..."
rm -rf /tmp/viveye-upload/client/node_modules
rm -rf /tmp/viveye-upload/server/node_modules
rm -rf /tmp/viveye-upload/client/build
rm -rf /tmp/viveye-upload/logs

# Upload to VPS
echo "📤 Uploading to VPS..."
scp -r /tmp/viveye-upload/* root@$VPS_IP:/opt/viveye/

# Clean up
echo "🧹 Cleaning up local files..."
rm -rf /tmp/viveye-upload

echo "✅ Upload complete!"
echo ""
echo "Next steps:"
echo "1. SSH to your VPS: ssh root@$VPS_IP"
echo "2. Switch to viveye user: sudo su - viveye"
echo "3. Go to VivEye directory: cd /opt/viveye"
echo "4. Install dependencies: npm install"
echo "5. Install client dependencies: cd client && npm install && cd .."
echo "6. Build frontend: cd client && npm run build && cd .."
echo "7. Create environment file: nano .env.production"
echo "8. Start VivEye: pm2 start ecosystem.config.js"
echo ""
echo "Then access VivEye at: http://$VPS_IP"

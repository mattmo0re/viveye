#!/bin/bash

# VivEye Cloud Deployment Script for DL348p Server
# This script sets up VivEye for cloud deployment with SSL, domain, and security

set -e

echo "========================================"
echo "   VivEye Cloud Deployment Setup"
echo "   For DL348p Server (2TB/500GB RAM)"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
MONGODB_URI=""
JWT_SECRET=""
ADMIN_USERNAME=""
ADMIN_PASSWORD=""

# Get user input
echo -e "${BLUE}Enter your domain name (e.g., viveye.yourdomain.com):${NC}"
read -p "Domain: " DOMAIN

echo -e "${BLUE}Enter your email for SSL certificates:${NC}"
read -p "Email: " EMAIL

echo -e "${BLUE}Enter MongoDB Atlas connection string:${NC}"
read -p "MongoDB URI: " MONGODB_URI

echo -e "${BLUE}Enter JWT secret (generate a strong one):${NC}"
read -p "JWT Secret: " JWT_SECRET

echo -e "${BLUE}Enter admin username:${NC}"
read -p "Admin Username: " ADMIN_USERNAME

echo -e "${BLUE}Enter admin password:${NC}"
read -s -p "Admin Password: " ADMIN_PASSWORD
echo

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js (LTS version)
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
echo -e "${YELLOW}Installing PM2...${NC}"
sudo npm install -g pm2

# Create application directory
echo -e "${YELLOW}Setting up application directory...${NC}"
sudo mkdir -p /opt/viveye
sudo chown $USER:$USER /opt/viveye
cd /opt/viveye

# Clone or copy VivEye code
if [ -d "viveye" ]; then
    echo -e "${YELLOW}Updating existing VivEye installation...${NC}"
    cd viveye
    git pull
else
    echo -e "${YELLOW}Cloning VivEye repository...${NC}"
    git clone https://github.com/yourusername/viveye.git
    cd viveye
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd server && npm install --production
cd ../client && npm install --production && npm run build
cd ..

# Create production environment file
echo -e "${YELLOW}Creating production environment configuration...${NC}"
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
DOMAIN=${DOMAIN}
SSL_ENABLED=true
CORS_ORIGIN=https://${DOMAIN}
EOF

# Create PM2 ecosystem file
echo -e "${YELLOW}Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'viveye-server',
      script: './server/index.js',
      cwd: '/opt/viveye/viveye',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: '.env.production',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/viveye/server-error.log',
      out_file: '/var/log/viveye/server-out.log',
      log_file: '/var/log/viveye/server-combined.log',
      time: true
    },
    {
      name: 'viveye-agent-server',
      script: './server/agent-server.js',
      cwd: '/opt/viveye/viveye',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      env_file: '.env.production',
      instances: 1,
      max_memory_restart: '512M',
      error_file: '/var/log/viveye/agent-error.log',
      out_file: '/var/log/viveye/agent-out.log',
      log_file: '/var/log/viveye/agent-combined.log',
      time: true
    }
  ]
};
EOF

# Create log directory
sudo mkdir -p /var/log/viveye
sudo chown $USER:$USER /var/log/viveye

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/viveye << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        root /opt/viveye/viveye/client/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket for agents
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/viveye /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}Configuring fail2ban...${NC}"
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Get SSL certificate
echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
sudo certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# Start services
echo -e "${YELLOW}Starting services...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start VivEye with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Create update script
echo -e "${YELLOW}Creating update script...${NC}"
cat > update-viveye.sh << 'EOF'
#!/bin/bash
cd /opt/viveye/viveye
git pull
cd server && npm install --production
cd ../client && npm run build
cd ..
pm2 restart all
echo "VivEye updated successfully!"
EOF

chmod +x update-viveye.sh

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
cat > backup-viveye.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/viveye"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/viveye_$DATE.tar.gz /opt/viveye/viveye

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/log/viveye

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/viveye_$DATE.tar.gz"
EOF

chmod +x backup-viveye.sh

# Set up cron jobs
echo -e "${YELLOW}Setting up cron jobs...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/viveye/viveye/backup-viveye.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/viveye/viveye/update-viveye.sh") | crontab -

echo
echo -e "${GREEN}========================================"
echo "   VivEye Cloud Deployment Complete!"
echo "========================================"
echo
echo -e "${GREEN}Your VivEye instance is now running at:${NC}"
echo -e "${BLUE}https://${DOMAIN}${NC}"
echo
echo -e "${GREEN}Admin credentials:${NC}"
echo -e "Username: ${ADMIN_USERNAME}"
echo -e "Password: [hidden]"
echo
echo -e "${GREEN}Useful commands:${NC}"
echo -e "• Check status: ${YELLOW}pm2 status${NC}"
echo -e "• View logs: ${YELLOW}pm2 logs${NC}"
echo -e "• Restart: ${YELLOW}pm2 restart all${NC}"
echo -e "• Update: ${YELLOW}./update-viveye.sh${NC}"
echo -e "• Backup: ${YELLOW}./backup-viveye.sh${NC}"
echo
echo -e "${GREEN}Next steps:${NC}"
echo "1. Update your DNS to point ${DOMAIN} to this server's IP"
echo "2. Test the installation by visiting https://${DOMAIN}"
echo "3. Create your first agent using the dropper files"
echo "4. Configure your firewall rules as needed"
echo
echo -e "${GREEN}Security features enabled:${NC}"
echo "• SSL/TLS encryption"
echo "• Firewall (UFW) configured"
echo "• Fail2ban protection"
echo "• Security headers"
echo "• Rate limiting"
echo "• Automatic backups"
echo "• Process monitoring with PM2"
echo
echo -e "${GREEN}Deployment complete! 🚀${NC}"

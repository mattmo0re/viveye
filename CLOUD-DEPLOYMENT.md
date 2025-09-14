# VivEye Cloud Deployment Guide

This guide will help you deploy VivEye on your DL348p server (2TB storage, 500GB RAM) for cloud access from anywhere.

## 🚀 Quick Start Options

### Option 1: Automated Script (Recommended)
```bash
# Download and run the cloud deployment script
curl -fsSL https://raw.githubusercontent.com/yourusername/viveye/main/deploy-cloud.sh | bash
```

### Option 2: Docker Compose (Advanced)
```bash
# Clone the repository
git clone https://github.com/yourusername/viveye.git
cd viveye

# Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# Deploy with Docker
docker-compose -f docker-compose.cloud.yml up -d
```

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 8GB+ (you have 500GB - perfect!)
- **Storage**: 50GB+ (you have 2TB - excellent!)
- **CPU**: 2+ cores
- **Network**: Public IP address

### Domain Setup
1. **Purchase a domain** (e.g., from Namecheap, GoDaddy, Cloudflare)
2. **Point DNS** to your server's public IP
3. **SSL certificate** will be automatically configured

### Required Information
- Domain name (e.g., `viveye.yourdomain.com`)
- Email address (for SSL certificates)
- MongoDB Atlas connection string
- Strong JWT secret
- Admin credentials

## 🔧 Manual Setup Steps

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 3. SSL Certificate Setup
```bash
# Get SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com --email your@email.com --agree-tos
```

### 4. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/viveye.git
cd viveye

# Install dependencies
cd server && npm install --production
cd ../client && npm install --production && npm run build
cd ..

# Configure environment
cp .env.example .env.production
# Edit .env.production with your settings
```

## 🐳 Docker Deployment

### Environment Configuration
Create `.env.production`:
```bash
# Application
NODE_ENV=production
DOMAIN=viveye.yourdomain.com
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/viveye

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# SSL
SSL_ENABLED=true
CORS_ORIGIN=https://viveye.yourdomain.com

# Monitoring
GRAFANA_PASSWORD=your-grafana-password
MONGO_ROOT_USERNAME=mongoadmin
MONGO_ROOT_PASSWORD=your-mongo-password
```

### Deploy with Docker Compose
```bash
# Start all services
docker-compose -f docker-compose.cloud.yml up -d

# Check status
docker-compose -f docker-compose.cloud.yml ps

# View logs
docker-compose -f docker-compose.cloud.yml logs -f
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
- **Automatic**: Let's Encrypt certificates
- **Manual**: Upload your own certificates to `/etc/nginx/ssl/`
- **Security**: TLS 1.2+ only, modern cipher suites

### 2. Firewall Rules
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5000/tcp   # Block direct API access
sudo ufw deny 8080/tcp   # Block direct agent access
```

### 3. Fail2ban Protection
```bash
# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### 4. Process Monitoring
```bash
# Install PM2 for process management
sudo npm install -g pm2

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
- **PM2**: Process management and monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization

### 2. Log Management
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Centralized logging**: All services log to `/var/log/viveye/`
- **Log rotation**: Automatic cleanup of old logs

### 3. Health Checks
- **API Health**: `https://yourdomain.com/api/health`
- **Frontend Health**: `https://yourdomain.com/health`
- **Database Health**: MongoDB connection status

## 🔄 Backup & Maintenance

### 1. Automated Backups
```bash
# Backup script runs daily at 2 AM
0 2 * * * /opt/viveye/backup-viveye.sh

# Update script runs weekly on Sunday at 3 AM
0 3 * * 0 /opt/viveye/update-viveye.sh
```

### 2. Manual Operations
```bash
# Update VivEye
./update-viveye.sh

# Create backup
./backup-viveye.sh

# Restart services
pm2 restart all

# View logs
pm2 logs
```

## 🌐 Access Your Deployment

### 1. Web Interface
- **URL**: `https://yourdomain.com`
- **Login**: Use your admin credentials
- **Features**: Full VivEye dashboard

### 2. Agent Connection
- **WebSocket URL**: `wss://yourdomain.com/ws`
- **Update dropper files** with your domain
- **Test connection** from any computer

### 3. API Access
- **Base URL**: `https://yourdomain.com/api`
- **Authentication**: JWT tokens
- **Rate Limiting**: 10 requests/second

## 🚨 Troubleshooting

### Common Issues

#### 1. SSL Certificate Problems
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
```

#### 2. Service Not Starting
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs viveye-server

# Restart services
pm2 restart all
```

#### 3. Database Connection Issues
```bash
# Test MongoDB connection
mongo "your-mongodb-uri"

# Check environment variables
cat .env.production
```

#### 4. Firewall Issues
```bash
# Check UFW status
sudo ufw status

# Check open ports
sudo netstat -tlnp
```

### Log Locations
- **Application logs**: `/var/log/viveye/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`
- **PM2 logs**: `~/.pm2/logs/`

## 📈 Performance Optimization

### 1. Server Resources
- **Your DL348p**: 500GB RAM is excellent for high performance
- **Database**: Consider MongoDB Atlas for better performance
- **Caching**: Redis for session and data caching
- **CDN**: Use Cloudflare for static assets

### 2. Application Tuning
- **PM2 Clustering**: Multiple Node.js processes
- **Nginx Caching**: Static file caching
- **Gzip Compression**: Reduce bandwidth usage
- **Connection Pooling**: Database connection optimization

### 3. Monitoring
- **Resource Usage**: Monitor CPU, RAM, disk usage
- **Response Times**: Track API response times
- **Error Rates**: Monitor application errors
- **User Activity**: Track user sessions and commands

## 🔐 Security Best Practices

### 1. Regular Updates
- **System packages**: `sudo apt update && sudo apt upgrade`
- **Node.js**: Update to latest LTS version
- **Dependencies**: `npm audit` and `npm update`
- **SSL certificates**: Automatic renewal with certbot

### 2. Access Control
- **SSH Keys**: Use key-based authentication
- **Firewall**: Restrict access to necessary ports
- **Fail2ban**: Block suspicious IP addresses
- **Admin Credentials**: Use strong, unique passwords

### 3. Data Protection
- **Encryption**: All data encrypted in transit (HTTPS)
- **Backups**: Regular encrypted backups
- **Database**: Use MongoDB Atlas with encryption
- **Logs**: Secure log storage and rotation

## 🎯 Next Steps

1. **Test your deployment** by visiting `https://yourdomain.com`
2. **Create your first agent** using the updated dropper files
3. **Configure monitoring** dashboards in Grafana
4. **Set up alerts** for system health and security
5. **Document your setup** for team members

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the main README.md
- **Community**: Join our Discord server
- **Professional Support**: Contact for enterprise deployments

---

**Congratulations!** 🎉 Your VivEye instance is now running in the cloud and accessible from anywhere!

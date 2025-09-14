# VivEye Deployment Guide

This guide covers different ways to deploy and share VivEye with other computers and devices.

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### One-Command Deployment
```bash
# Clone the repository
git clone <your-repo-url>
cd viveye

# Deploy with one command
./deploy.sh
```

### Manual Docker Deployment
```bash
# 1. Create environment file
cp .env.example .env
# Edit .env with your settings

# 2. Build and start
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Access the application
# Web Interface: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

## 🌐 Web Application Deployment

### Option 1: Self-Hosted Server

#### Requirements
- VPS or dedicated server
- Domain name (optional)
- SSL certificate (recommended)

#### Steps
```bash
# 1. Install Node.js and MongoDB on server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb

# 2. Clone and setup
git clone <your-repo-url>
cd viveye
npm install

# 3. Build frontend
cd client && npm run build && cd ..

# 4. Set environment variables
export MONGODB_URI="mongodb://localhost:27017/viveye"
export JWT_SECRET="your-secret-key"
export NODE_ENV="production"

# 5. Start the application
npm start
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Cloud Platforms

#### Heroku
```bash
# 1. Install Heroku CLI
# 2. Create Heroku app
heroku create viveye-c2

# 3. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 4. Deploy
git push heroku main
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Select "Web Service"
3. Set build command: `cd client && npm run build`
4. Set run command: `cd server && npm start`
5. Add environment variables

#### Railway
1. Connect GitHub repository
2. Select "Deploy from GitHub"
3. Add environment variables
4. Deploy automatically

## 📱 Mobile Access

### Progressive Web App (PWA)
VivEye can be accessed on mobile devices through web browsers:

1. **Enable PWA features** (already configured)
2. **Access via mobile browser**: `http://YOUR_IP:5000`
3. **Add to home screen** for app-like experience

### Mobile-Specific Considerations
- **Touch-friendly interface** (already responsive)
- **Mobile-optimized commands** (simplified for touch)
- **Offline capabilities** (limited without agent connection)

## 🖥️ Desktop Applications

### Electron App
```bash
# 1. Install Electron
npm install --save-dev electron electron-builder

# 2. Create main process file
# 3. Update package.json scripts
# 4. Build for distribution
npm run build:electron
```

### Tauri App (Rust-based, smaller)
```bash
# 1. Install Tauri
npm install --save-dev @tauri-apps/cli

# 2. Initialize Tauri
npx tauri init

# 3. Configure and build
npm run tauri build
```

## 🔧 Agent Distribution

### Windows Agents
```bash
# 1. Create installer
# 2. Package with Node.js runtime
# 3. Create MSI installer
# 4. Distribute via USB/email
```

### Linux Agents
```bash
# 1. Create .deb package
# 2. Include in repository
# 3. Install via package manager
```

### Cross-Platform Agents
```bash
# 1. Use pkg to create binaries
npm install -g pkg
pkg agent.js --targets node18-win-x64,node18-linux-x64,node18-macos-x64

# 2. Distribute binaries
```

## 🌍 Sharing with Other Computers

### Local Network
1. **Find your IP address**: `ipconfig` (Windows) or `ifconfig` (Linux/macOS)
2. **Access from other devices**: `http://YOUR_IP:5000`
3. **Configure firewall** to allow port 5000

### Internet Access
1. **Port forwarding** on router (port 5000)
2. **Dynamic DNS** service (e.g., No-IP, DuckDNS)
3. **Cloud deployment** (recommended for production)

### Tor Network (Anonymous)
1. **Configure Tor** for anonymous access
2. **Share onion address** instead of IP
3. **Access via Tor browser**

## 🔒 Security Considerations

### Production Deployment
- **Use HTTPS** with SSL certificates
- **Strong passwords** and JWT secrets
- **Firewall configuration**
- **Regular updates**
- **Backup strategy**

### Network Security
- **VPN access** for remote teams
- **IP whitelisting** for sensitive deployments
- **Encrypted communication** between agents and server

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Backup
```bash
# Backup MongoDB
docker exec mongodb mongodump --out /backup

# Backup configuration
tar -czf viveye-backup.tar.gz tor-data/ logs/ .env
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check MongoDB URI
3. **Agent connection**: Verify network connectivity
4. **Permission errors**: Check file permissions

### Support
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Test network connectivity
- Check firewall settings

## 📋 Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Firewall configured
- [ ] SSL certificate installed (production)
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Documentation updated

## 🎯 Recommended Deployment Strategy

### For Development/Testing
- **Local Docker deployment**
- **Local network access**
- **MongoDB Atlas** for database

### For Production
- **Cloud platform** (DigitalOcean, AWS, etc.)
- **Custom domain** with SSL
- **MongoDB Atlas** or managed database
- **CDN** for static assets
- **Monitoring** and logging

### For Teams
- **VPN access** to deployment
- **User management** and authentication
- **Role-based access** control
- **Audit logging**

---

**Need help?** Check the troubleshooting section or create an issue in the repository.

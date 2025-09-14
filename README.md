# VivEye - Command & Control Platform

A modern, secure command and control platform built with React, Node.js, and MongoDB. VivEye provides a comprehensive solution for managing distributed agents, beacons, and command execution across networks.

## 🚀 Features

### Core Functionality
- **Agent Management**: Deploy, monitor, and control remote agents
- **Beacon System**: Manage beacon infrastructure for agent communication
- **Command Execution**: Send and track commands across distributed systems
- **Real-time Monitoring**: Live status updates and heartbeat monitoring
- **Secure Communication**: End-to-end encryption with Tor network support

### Security Features
- **Tor Integration**: Anonymous communication through Tor network
- **Role-based Access Control**: Admin, operator, and viewer roles
- **Encryption**: AES encryption for all communications
- **Authentication**: Secure login and session management

### User Interface
- **Modern Dark Theme**: Red-accented dark UI for professional appearance
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live status indicators and notifications
- **Intuitive Navigation**: Clean, organized interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Node.js Server │    │   MongoDB DB    │
│                 │◄──►│                 │◄──►│                 │
│  - Dashboard    │    │  - REST API     │    │  - Agents       │
│  - Beacons      │    │  - WebSocket    │    │  - Beacons      │
│  - Agents       │    │  - Auth         │    │  - Commands     │
│  - Commands     │    │  - Tor Proxy    │    │  - Users        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Joi** - Data validation

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Tor** - Anonymous networking
- **PM2** - Process management

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker (optional)
- Tor (for anonymous mode)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/mattmo0re/viveye.git
   cd viveye
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit configuration
   nano server/.env
   ```

4. **Start the application**
   ```bash
   # Start MongoDB
   mongod
   
   # Start the server
   cd server
   npm start
   
   # Start the client (in new terminal)
   cd client
   npm start
   ```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/viveye

# Tor Configuration
TOR_ENABLED=true
TOR_SOCKS_PORT=9050
TOR_CONTROL_PORT=9051

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
```

## 📖 Usage

### Agent Management
1. Navigate to the **Agents** page
2. Deploy agents to target systems
3. Monitor agent status and capabilities
4. Execute commands remotely

### Beacon Configuration
1. Go to the **Beacons** page
2. Create beacon infrastructure
3. Configure location and capabilities
4. Monitor beacon health and connectivity

### Command Execution
1. Access the **Commands** page
2. Select target agents or beacons
3. Create and execute commands
4. Monitor execution status and results

## 🔒 Security Considerations

- **Network Security**: Use Tor for anonymous communication
- **Access Control**: Implement proper role-based permissions
- **Data Encryption**: All sensitive data is encrypted
- **Audit Logging**: Track all system activities
- **Regular Updates**: Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational and authorized testing purposes only. Users are responsible for complying with all applicable laws and regulations. The authors are not responsible for any misuse of this software.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🗺️ Roadmap

- [ ] Advanced agent capabilities
- [ ] Mobile app support
- [ ] Enhanced reporting
- [ ] Plugin system
- [ ] Multi-tenant support
- [ ] Advanced analytics

---

**VivEye** - Secure Command & Control Platform
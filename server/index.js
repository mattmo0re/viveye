const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const torService = require('./config/tor');
const authRoutes = require('./routes/auth');
const beaconRoutes = require('./routes/beacons');
const agentRoutes = require('./routes/agents');
const commandRoutes = require('./routes/commands');
const { authenticateToken } = require('./middleware/auth');
const { handleAgentConnection } = require('./services/agentService');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO for Tor compatibility
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for Tor
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'] // Support both transports for Tor compatibility
  },
  // Tor-specific configuration
  allowEIO3: true, // Support older Engine.IO versions for better Tor compatibility
  pingTimeout: 60000, // Longer timeout for Tor
  pingInterval: 25000
});

// Connect to MongoDB if configured
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Tor compatibility
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for Tor
app.use(cors({
  origin: "*", // Allow all origins for Tor
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (more lenient for Tor)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, // Higher limit for Tor
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/beacons', authenticateToken, beaconRoutes);
app.use('/api/agents', authenticateToken, agentRoutes);
app.use('/api/commands', authenticateToken, commandRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    tor: {
      backend: torService.getBackendOnion(),
      frontend: torService.getFrontendOnion(),
      agent: torService.getAgentOnion(),
    },
    mongo: {
      enabled: Boolean(process.env.MONGODB_URI),
    },
  });
});

// Tor onion service info endpoint
app.get('/api/tor-info', (req, res) => {
  res.json({
    backend: torService.getBackendOnion(),
    frontend: torService.getFrontendOnion(),
    agent: torService.getAgentOnion()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('agent-register', (data) => {
    handleAgentConnection(socket, data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`VivEye server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Backend onion: ${torService.getBackendOnion() || 'Not available'}`);
  console.log(`Frontend onion: ${torService.getFrontendOnion() || 'Not available'}`);
  console.log(`Agent onion: ${torService.getAgentOnion() || 'Not available'}`);
});

// Refresh onion addresses every 30 seconds in case Tor restarts
setInterval(() => {
  torService.refreshOnionAddresses();
}, 30000);

// Serve frontend build (optional): if built files exist, serve them
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  // Fallback to index.html for non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).end();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

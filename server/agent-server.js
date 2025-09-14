const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/database');
const torService = require('./config/tor');
const { handleAgentConnection } = require('./services/agentService');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO for agent connections through Tor
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for Tor
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connect to MongoDB (clearnet)
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for Tor
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check for agent server
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'agent-server',
    timestamp: new Date().toISOString(),
    onion: torService.getAgentOnion()
  });
});

// Socket.IO connection handling for agents
io.on('connection', (socket) => {
  console.log('Agent connected:', socket.id);
  
  socket.on('agent-register', (data) => {
    handleAgentConnection(socket, data);
  });
  
  socket.on('disconnect', () => {
    console.log('Agent disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

const PORT = process.env.AGENT_PORT || 5001;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`VivEye agent server running on port ${PORT}`);
  console.log(`Agent onion: ${torService.getAgentOnion() || 'Not available'}`);
});

// Refresh onion addresses every 30 seconds
setInterval(() => {
  torService.refreshOnionAddresses();
}, 30000);
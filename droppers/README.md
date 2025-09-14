# VivEye Agent Droppers

This folder contains pre-made installer scripts that make it easy to deploy VivEye agents on target computers.

## What are Droppers?

Droppers are automated installation scripts that:
- Check if Node.js is installed
- Create the agent.js file automatically
- Install required dependencies
- Configure the agent with your server IP
- Start the agent immediately

## Available Droppers

### Windows
- **File**: `install-windows.bat`
- **Usage**: Double-click to run
- **Requirements**: Windows with Node.js installed

### Linux/macOS
- **File**: `install-linux.sh`
- **Usage**: Run `chmod +x install-linux.sh && ./install-linux.sh`
- **Requirements**: Linux/macOS with Node.js installed

## How to Use

1. **Download the appropriate dropper** for your target operating system
2. **Transfer it to the target computer** (via USB, email, network share, etc.)
3. **Run the dropper** - it will guide you through the setup process
4. **Enter your VivEye server IP** when prompted
5. **The agent will start automatically** and appear in your VivEye dashboard

## What the Droppers Do

### Automatic Setup
- ✅ Check Node.js installation
- ✅ Create agent.js file with proper code
- ✅ Install WebSocket dependency (`npm install ws`)
- ✅ Configure server IP address
- ✅ Start the agent immediately

### User Interaction
- Prompts for VivEye server IP address
- Asks if you want to run the agent immediately
- Provides clear instructions for manual execution if needed

## Manual Installation

If you prefer to set up agents manually, you can:

1. Copy the agent code from the VivEye dashboard
2. Create a file called `agent.js`
3. Install dependencies: `npm install ws`
4. Edit the server IP in the code
5. Run: `node agent.js`

## Troubleshooting

### "Node.js is not installed"
- **Windows**: Download from https://nodejs.org
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian)
- **macOS**: `brew install node`

### "Permission denied" (Linux/macOS)
- Make the script executable: `chmod +x install-linux.sh`

### "Cannot connect to server"
- Check that your VivEye server is running
- Verify the IP address is correct
- Ensure port 8080 is not blocked by firewall

## Security Notes

- These droppers are designed for legitimate penetration testing and security research
- Only use on systems you own or have explicit permission to test
- The agents connect back to your VivEye server - ensure proper network security
- Consider using Tor for anonymous communication in sensitive environments

## Customization

You can modify the droppers to:
- Add additional dependencies
- Include custom agent configurations
- Add persistence mechanisms
- Implement additional security features

## Support

For issues with the droppers or VivEye agents, please check:
1. The main VivEye documentation
2. The introduction guide in the VivEye dashboard
3. GitHub issues for the VivEye project

# VivEye Agent Client Example

This is an example agent client that demonstrates how to connect to the VivEye C&C system through Tor onion services.

## Features

- Connects to VivEye agent server via WebSocket
- Supports multiple command types
- Provides system information and performance metrics
- Handles command execution and result reporting
- Graceful shutdown handling

## Installation

```bash
cd agent-example
npm install
```

## Usage

### Basic Usage

```bash
node agent-client.js <beacon-id> <agent-id> [server-url]
```

### Examples

```bash
# Connect to local agent server
node agent-client.js BEACON_123 AGENT_456

# Connect to Tor onion service
node agent-client.js BEACON_123 AGENT_456 http://your-onion-address.onion

# Test with sample IDs
npm test
```

## Supported Commands

The example agent supports the following command types:

- **execute_command**: Execute shell commands
- **system_info**: Get system information
- **screenshot**: Take screenshots (simulated)
- **network_scan**: Scan network interfaces
- **process_list**: List running processes

## Configuration

### Environment Variables

You can set the following environment variables:

- `BEACON_ID`: Default beacon ID
- `AGENT_ID`: Default agent ID  
- `SERVER_URL`: Default server URL

### Example

```bash
export BEACON_ID=BEACON_123
export AGENT_ID=AGENT_456
export SERVER_URL=http://your-onion-address.onion
node agent-client.js
```

## Integration

To integrate this agent into your own application:

1. Copy the `VivEyeAgent` class
2. Implement the required command handlers
3. Add your own capabilities as needed
4. Handle authentication if required

## Security Notes

- This is an example implementation
- In production, add proper authentication
- Implement command validation
- Add encryption for sensitive data
- Use proper error handling

## Troubleshooting

### Connection Issues

1. Check if the server URL is correct
2. Verify the beacon ID exists in the system
3. Ensure the agent server is running
4. Check Tor connectivity if using onion services

### Command Execution

1. Verify the agent has the required capabilities
2. Check command syntax and permissions
3. Review server logs for errors

## License

MIT License - see the main project LICENSE file.
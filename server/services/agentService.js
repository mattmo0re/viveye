const Agent = require('../models/Agent');
const Beacon = require('../models/Beacon');
const Command = require('../models/Command');

const handleAgentConnection = async (socket, data) => {
  try {
    const { agentId, beaconId, systemInfo, capabilities } = data;

    // Find or create agent
    let agent = await Agent.findOne({ agentId });
    
    if (!agent) {
      // Create new agent
      const beacon = await Beacon.findOne({ beaconId });
      if (!beacon) {
        socket.emit('error', { message: 'Invalid beacon ID' });
        return;
      }

      agent = new Agent({
        agentId,
        beaconId: beacon._id,
        name: systemInfo?.hostname || `Agent ${agentId}`,
        systemInfo,
        capabilities: capabilities || [],
        status: 'online'
      });
    } else {
      // Update existing agent
      agent.status = 'online';
      agent.lastSeen = new Date();
      agent.systemInfo = { ...agent.systemInfo, ...systemInfo };
      if (capabilities) {
        agent.capabilities = capabilities;
      }
    }

    await agent.save();

    // Join agent to its room
    socket.join(`agent_${agentId}`);

    // Update beacon online status
    await Beacon.findByIdAndUpdate(agent.beaconId, {
      isOnline: true,
      lastSeen: new Date()
    });

    socket.emit('agent-registered', {
      message: 'Agent registered successfully',
      agentId: agent.agentId
    });

    console.log(`Agent ${agentId} connected and registered`);

    // Handle command execution
    socket.on('command-result', async (result) => {
      try {
        const { commandId, success, output, error, exitCode, executionTime, data } = result;

        const command = await Command.findOne({ commandId });
        if (!command) {
          console.error(`Command ${commandId} not found`);
          return;
        }

        command.status = success ? 'completed' : 'failed';
        command.completedAt = new Date();
        command.result = {
          success,
          output,
          error,
          exitCode,
          executionTime,
          data
        };

        await command.save();

        // Update agent's last command
        agent.lastCommand = command._id;
        agent.lastSeen = new Date();
        await agent.save();

        console.log(`Command ${commandId} ${success ? 'completed' : 'failed'}`);
      } catch (error) {
        console.error('Error handling command result:', error);
      }
    });

    // Handle heartbeat
    socket.on('heartbeat', async (data) => {
      try {
        const { performance } = data;
        
        agent.lastSeen = new Date();
        if (performance) {
          agent.performance = performance;
        }
        await agent.save();

        // Update beacon last seen
        await Beacon.findByIdAndUpdate(agent.beaconId, {
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error handling heartbeat:', error);
      }
    });

    // Handle agent status updates
    socket.on('status-update', async (data) => {
      try {
        const { status, performance } = data;
        
        if (status) {
          agent.status = status;
        }
        if (performance) {
          agent.performance = performance;
        }
        
        agent.lastSeen = new Date();
        await agent.save();
      } catch (error) {
        console.error('Error handling status update:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        agent.status = 'offline';
        agent.lastSeen = new Date();
        await agent.save();

        // Update beacon status
        const beacon = await Beacon.findById(agent.beaconId);
        if (beacon) {
          // Check if any agents are still online for this beacon
          const onlineAgents = await Agent.countDocuments({
            beaconId: agent.beaconId,
            status: 'online'
          });

          if (onlineAgents === 0) {
            beacon.isOnline = false;
            await beacon.save();
          }
        }

        console.log(`Agent ${agentId} disconnected`);
      } catch (error) {
        console.error('Error handling agent disconnect:', error);
      }
    });

  } catch (error) {
    console.error('Error handling agent connection:', error);
    socket.emit('error', { message: 'Failed to register agent' });
  }
};

module.exports = {
  handleAgentConnection
};
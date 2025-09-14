const express = require('express');
const Joi = require('joi');
const Agent = require('../models/Agent');
const Beacon = require('../models/Beacon');
const Command = require('../models/Command');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const agentSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  beaconId: Joi.string().required(),
  capabilities: Joi.array().items(
    Joi.string().valid('command_execution', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'system_info', 'process_monitor', 'network_monitor')
  ).default([]),
  tags: Joi.array().items(Joi.string()).default([])
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const { status, beaconId, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (beaconId) query.beaconId = beaconId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } }
      ];
    }

    const agents = await Agent.find(query)
      .populate('beaconId', 'name beaconId status')
      .sort({ lastSeen: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Agent.countDocuments(query);

    res.json({
      agents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('beaconId', 'name beaconId status location')
      .populate('lastCommand', 'commandId type status result');
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ agent });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new agent
router.post('/', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { error, value } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify beacon exists
    const beacon = await Beacon.findById(value.beaconId);
    if (!beacon) {
      return res.status(400).json({ error: 'Beacon not found' });
    }

    // Generate unique agent ID
    const agentId = `AGENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const agent = new Agent({
      ...value,
      agentId
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully',
      agent
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update agent
router.put('/:id', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { error, value } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify beacon exists if changing
    if (value.beaconId) {
      const beacon = await Beacon.findById(value.beaconId);
      if (!beacon) {
        return res.status(400).json({ error: 'Beacon not found' });
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('beaconId', 'name beaconId status');

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      message: 'Agent updated successfully',
      agent
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update agent status
router.patch('/:id/status', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'offline', 'busy', 'error', 'maintenance'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastSeen: new Date()
      },
      { new: true }
    ).populate('beaconId', 'name beaconId status');

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      message: 'Agent status updated successfully',
      agent
    });
  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle agent active status
router.patch('/:id/toggle', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent.isActive = !agent.isActive;
    await agent.save();

    res.json({
      message: `Agent ${agent.isActive ? 'activated' : 'deactivated'} successfully`,
      agent
    });
  } catch (error) {
    console.error('Toggle agent status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete agent
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Cancel any pending commands for this agent
    await Command.updateMany(
      { agentId: req.params.id, status: { $in: ['pending', 'executing'] } },
      { status: 'cancelled' }
    );

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agent commands
router.get('/:id/commands', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { agentId: req.params.id };
    if (status) query.status = status;

    const commands = await Command.find(query)
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
    console.error('Get agent commands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agent statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const totalCommands = await Command.countDocuments({ agentId: req.params.id });
    const completedCommands = await Command.countDocuments({ 
      agentId: req.params.id, 
      status: 'completed' 
    });
    const failedCommands = await Command.countDocuments({ 
      agentId: req.params.id, 
      status: 'failed' 
    });
    const recentCommands = await Command.countDocuments({
      agentId: req.params.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalCommands,
      completedCommands,
      failedCommands,
      recentCommands,
      successRate: totalCommands > 0 ? (completedCommands / totalCommands * 100).toFixed(2) : 0,
      uptime: agent.status === 'online' ? Date.now() - agent.lastSeen.getTime() : 0
    });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
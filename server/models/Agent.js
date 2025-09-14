const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  beaconId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beacon',
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy', 'error', 'maintenance'],
    default: 'offline'
  },
  capabilities: [{
    type: String,
    enum: ['command_execution', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'system_info', 'process_monitor', 'network_monitor']
  }],
  systemInfo: {
    os: String,
    version: String,
    architecture: String,
    hostname: String,
    ipAddress: String,
    macAddress: String,
    cpu: String,
    memory: String,
    diskSpace: String
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastCommand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Command'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  performance: {
    cpuUsage: Number,
    memoryUsage: Number,
    diskUsage: Number,
    networkLatency: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
agentSchema.index({ agentId: 1 });
agentSchema.index({ beaconId: 1 });
agentSchema.index({ status: 1 });
agentSchema.index({ isActive: 1 });
agentSchema.index({ lastSeen: 1 });

module.exports = mongoose.model('Agent', agentSchema);
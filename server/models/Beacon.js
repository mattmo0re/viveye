const mongoose = require('mongoose');

const beaconSchema = new mongoose.Schema({
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
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['command', 'relay', 'monitoring', 'emergency'],
    default: 'command'
  },
  capabilities: [{
    type: String,
    enum: ['command_execution', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'system_info']
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  heartbeatInterval: {
    type: Number,
    default: 30000, // 30 seconds
    min: 5000,
    max: 300000
  },
  encryptionKey: {
    type: String,
    required: true
  },
  metadata: {
    os: String,
    version: String,
    architecture: String,
    hostname: String,
    ipAddress: String
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
beaconSchema.index({ beaconId: 1 });
beaconSchema.index({ status: 1 });
beaconSchema.index({ isOnline: 1 });
beaconSchema.index({ lastSeen: 1 });

module.exports = mongoose.model('Beacon', beaconSchema);
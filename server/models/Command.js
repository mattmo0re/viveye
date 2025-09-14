const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  commandId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  beaconId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beacon',
    required: true
  },
  type: {
    type: String,
    enum: ['system_info', 'file_transfer', 'screenshot', 'keylog', 'network_scan', 'process_list', 'execute_command', 'download_file', 'upload_file', 'custom'],
    required: true
  },
  command: {
    type: String,
    required: true,
    maxlength: 10000
  },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'executing', 'completed', 'failed', 'cancelled', 'timeout'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  executedAt: Date,
  completedAt: Date,
  result: {
    success: Boolean,
    output: String,
    error: String,
    exitCode: Number,
    executionTime: Number, // in milliseconds
    data: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeout: {
    type: Number,
    default: 300000, // 5 minutes
    min: 1000,
    max: 3600000 // 1 hour
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for efficient queries
commandSchema.index({ commandId: 1 });
commandSchema.index({ agentId: 1 });
commandSchema.index({ status: 1 });
commandSchema.index({ priority: 1 });
commandSchema.index({ scheduledAt: 1 });
commandSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Command', commandSchema);
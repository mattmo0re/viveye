import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Wifi, 
  WifiOff,
  Settings,
  Trash2,
  Power,
  PowerOff,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [beaconFilter, setBeaconFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadAgents();
    loadBeacons();
  }, [searchTerm, statusFilter, beaconFilter]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (beaconFilter) params.beaconId = beaconFilter;
      
      const response = await api.getAgents(params);
      setAgents(response.agents);
    } catch (error) {
      toast.error('Failed to load agents');
      console.error('Agents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBeacons = async () => {
    try {
      const response = await api.getBeacons();
      setBeacons(response.beacons);
    } catch (error) {
      console.error('Beacons error:', error);
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      await api.createAgent(agentData);
      toast.success('Agent created successfully');
      setShowCreateModal(false);
      loadAgents();
    } catch (error) {
      toast.error(error.error || 'Failed to create agent');
    }
  };

  const handleToggleAgent = async (agentId) => {
    try {
      await api.toggleAgent(agentId);
      toast.success('Agent status toggled');
      loadAgents();
    } catch (error) {
      toast.error(error.error || 'Failed to toggle agent');
    }
  };

  const handleUpdateStatus = async (agentId, status) => {
    try {
      await api.updateAgentStatus(agentId, status);
      toast.success('Agent status updated');
      loadAgents();
    } catch (error) {
      toast.error(error.error || 'Failed to update status');
    }
  };

  const handleDeleteAgent = async () => {
    try {
      await api.deleteAgent(selectedAgent._id);
      toast.success('Agent deleted successfully');
      setShowDeleteModal(false);
      setSelectedAgent(null);
      loadAgents();
    } catch (error) {
      toast.error(error.error || 'Failed to delete agent');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnlineStatus = (status) => {
    return status === 'online' ? (
      <div className="flex items-center text-green-400">
        <Wifi className="h-4 w-4 mr-1" />
        Online
      </div>
    ) : (
      <div className="flex items-center text-red-400">
        <WifiOff className="h-4 w-4 mr-1" />
        Offline
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-dark-400">Manage your deployed agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={beaconFilter}
              onChange={(e) => setBeaconFilter(e.target.value)}
              className="input"
            >
              <option value="">All Beacons</option>
              {beacons.map(beacon => (
                <option key={beacon._id} value={beacon._id}>
                  {beacon.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-primary-400 mr-3" />
                <div>
                  <h3 className="font-medium text-white">{agent.name}</h3>
                  <p className="text-sm text-dark-400">{agent.agentId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAgent(agent._id)}
                  className={`p-1 rounded ${
                    agent.isActive 
                      ? 'text-green-400 hover:text-green-300' 
                      : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  {agent.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="text-dark-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Connection</span>
                {getOnlineStatus(agent.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Beacon</span>
                <span className="text-sm text-white">
                  {agent.beaconId?.name || 'Unknown'}
                </span>
              </div>

              {agent.systemInfo && (
                <div className="pt-3 border-t border-dark-700">
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-2">
                    <span>System Info</span>
                  </div>
                  <div className="space-y-1">
                    {agent.systemInfo.os && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">OS</span>
                        <span className="text-xs text-white">{agent.systemInfo.os}</span>
                      </div>
                    )}
                    {agent.systemInfo.hostname && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Host</span>
                        <span className="text-xs text-white">{agent.systemInfo.hostname}</span>
                      </div>
                    )}
                    {agent.systemInfo.ipAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">IP</span>
                        <span className="text-xs text-white">{agent.systemInfo.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {agent.performance && (
                <div className="pt-3 border-t border-dark-700">
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-2">
                    <span>Performance</span>
                  </div>
                  <div className="space-y-1">
                    {agent.performance.cpuUsage && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">CPU</span>
                        <span className="text-xs text-white">{agent.performance.cpuUsage}%</span>
                      </div>
                    )}
                    {agent.performance.memoryUsage && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Memory</span>
                        <span className="text-xs text-white">{agent.performance.memoryUsage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-dark-700">
                <div className="flex items-center justify-between text-xs text-dark-400">
                  <span>Last Seen</span>
                  <span>{new Date(agent.lastSeen).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No agents found</h3>
          <p className="text-dark-400 mb-4">Get started by creating your first agent.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Agent
          </button>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAgent}
          beacons={beacons}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Delete Agent</h3>
            <p className="text-dark-300 mb-6">
              Are you sure you want to delete "{selectedAgent.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Agent Modal Component
const CreateAgentModal = ({ onClose, onSubmit, beacons }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    beaconId: '',
    capabilities: [],
    tags: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCapabilityChange = (capability) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableCapabilities = [
    'command_execution',
    'file_transfer',
    'screenshot',
    'keylog',
    'network_scan',
    'system_info',
    'process_monitor',
    'network_monitor'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-white mb-4">Create New Agent</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Beacon
            </label>
            <select
              name="beaconId"
              value={formData.beaconId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Select a beacon</option>
              {beacons.map(beacon => (
                <option key={beacon._id} value={beacon._id}>
                  {beacon.name} ({beacon.beaconId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Capabilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCapabilities.map(capability => (
                <label key={capability} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.capabilities.includes(capability)}
                    onChange={() => handleCapabilityChange(capability)}
                    className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-dark-300">
                    {capability.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Agents;
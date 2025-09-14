import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Radio, 
  Wifi, 
  WifiOff,
  Settings,
  Trash2,
  Edit
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Beacons = () => {
  const [beacons, setBeacons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadBeacons();
  }, [searchTerm, statusFilter]);

  const loadBeacons = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.getBeacons(params);
      setBeacons(response.beacons);
    } catch (error) {
      toast.error('Failed to load beacons');
      console.error('Beacons error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBeacon = async (beaconData) => {
    try {
      await api.createBeacon(beaconData);
      toast.success('Beacon created successfully');
      setShowCreateModal(false);
      loadBeacons();
    } catch (error) {
      toast.error(error.error || 'Failed to create beacon');
    }
  };

  const handleUpdateStatus = async (beaconId, status) => {
    try {
      await api.updateBeaconStatus(beaconId, status);
      toast.success('Beacon status updated');
      loadBeacons();
    } catch (error) {
      toast.error(error.error || 'Failed to update status');
    }
  };

  const handleDeleteBeacon = async () => {
    try {
      await api.deleteBeacon(selectedBeacon._id);
      toast.success('Beacon deleted successfully');
      setShowDeleteModal(false);
      setSelectedBeacon(null);
      loadBeacons();
    } catch (error) {
      toast.error(error.error || 'Failed to delete beacon');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnlineStatus = (isOnline) => {
    return isOnline ? (
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
          <h1 className="text-2xl font-bold text-white">Beacons</h1>
          <p className="text-dark-400">Manage your beacon infrastructure</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beacon
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
                placeholder="Search beacons..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beacons Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Beacon ID</th>
                <th>Location</th>
                <th>Status</th>
                <th>Online</th>
                <th>Type</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {beacons.map((beacon) => (
                <tr key={beacon._id}>
                  <td>
                    <div className="flex items-center">
                      <Radio className="h-5 w-5 text-primary-400 mr-3" />
                      <div>
                        <div className="font-medium text-white">{beacon.name}</div>
                        <div className="text-sm text-dark-400">{beacon.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="text-xs bg-dark-700 px-2 py-1 rounded">
                      {beacon.beaconId}
                    </code>
                  </td>
                  <td>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-dark-400 mr-1" />
                      <span>
                        {beacon.location.latitude.toFixed(4)}, {beacon.location.longitude.toFixed(4)}
                      </span>
                    </div>
                    {beacon.location.address && (
                      <div className="text-xs text-dark-400 mt-1">
                        {beacon.location.address}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(beacon.status)}`}>
                      {beacon.status}
                    </span>
                  </td>
                  <td>
                    {getOnlineStatus(beacon.isOnline)}
                  </td>
                  <td>
                    <span className="text-sm text-dark-300 capitalize">
                      {beacon.type}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-dark-300">
                      {new Date(beacon.lastSeen).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBeacon(beacon)}
                        className="text-dark-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBeacon(beacon);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-400 hover:text-red-300"
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

      {/* Create Beacon Modal */}
      {showCreateModal && (
        <CreateBeaconModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBeacon}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBeacon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Delete Beacon</h3>
            <p className="text-dark-300 mb-6">
              Are you sure you want to delete "{selectedBeacon.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBeacon}
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

// Create Beacon Modal Component
const CreateBeaconModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    },
    type: 'command',
    capabilities: [],
    heartbeatInterval: 30000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      location: {
        ...formData.location,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-white mb-4">Create New Beacon</h3>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="location.longitude"
                value={formData.location.longitude}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Address
            </label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="command">Command</option>
              <option value="relay">Relay</option>
              <option value="monitoring">Monitoring</option>
              <option value="emergency">Emergency</option>
            </select>
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
              Create Beacon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Beacons;
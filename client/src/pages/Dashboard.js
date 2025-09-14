import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  Terminal, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import IntroductionGuide from '../components/IntroductionGuide';

const Dashboard = () => {
  const [stats, setStats] = useState({
    beacons: { total: 0, online: 0 },
    agents: { total: 0, online: 0 },
    commands: { total: 0, pending: 0, completed: 0, failed: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { connected } = useSocket();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load beacons
      const beaconsResponse = await api.getBeacons();
      const onlineBeacons = beaconsResponse.beacons.filter(b => b.isOnline).length;
      
      // Load agents
      const agentsResponse = await api.getAgents();
      const onlineAgents = agentsResponse.agents.filter(a => a.status === 'online').length;
      
      // Load commands
      const commandsResponse = await api.getCommands({ limit: 100 });
      const commandStats = {
        total: commandsResponse.commands.length,
        pending: commandsResponse.commands.filter(c => c.status === 'pending').length,
        completed: commandsResponse.commands.filter(c => c.status === 'completed').length,
        failed: commandsResponse.commands.filter(c => c.status === 'failed').length
      };
      
      // Load recent commands
      const recentCommands = commandsResponse.commands.slice(0, 5);

      setStats({
        beacons: { total: beaconsResponse.beacons.length, online: onlineBeacons },
        agents: { total: agentsResponse.agents.length, online: onlineAgents },
        commands: commandStats,
        recentActivity: recentCommands
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-silver-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show introduction guide if no data exists
  const hasData = stats.beacons.total > 0 || stats.agents.total > 0 || stats.commands.total > 0;
  
  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-silver-400">Command and Control Overview</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-silver-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Empty State with Introduction */}
        <div className="card text-center py-12">
          <BookOpen className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to VivEye!</h2>
          <p className="text-silver-400 mb-6 max-w-2xl mx-auto">
            You don't have any agents, beacons, or commands yet. Let's get you started with a comprehensive guide 
            to set up your Command & Control infrastructure.
          </p>
          <div className="text-sm text-silver-500">
            <p>• Deploy agents on target systems</p>
            <p>• Set up beacons for communication</p>
            <p>• Execute commands and manage your infrastructure</p>
          </div>
        </div>

        {/* Introduction Guide */}
        <IntroductionGuide />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-silver-400">Command and Control Overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-silver-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Beacons */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Radio className="h-8 w-8 text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-silver-400">Beacons</p>
              <p className="text-2xl font-bold text-white">
                {stats.beacons.online}/{stats.beacons.total}
              </p>
              <p className="text-xs text-silver-400">Online</p>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-silver-400">Agents</p>
              <p className="text-2xl font-bold text-white">
                {stats.agents.online}/{stats.agents.total}
              </p>
              <p className="text-xs text-silver-400">Online</p>
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Terminal className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-silver-400">Commands</p>
              <p className="text-2xl font-bold text-white">{stats.commands.total}</p>
              <p className="text-xs text-silver-400">Total</p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-silver-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.commands.total > 0 
                  ? Math.round((stats.commands.completed / stats.commands.total) * 100)
                  : 0
                }%
              </p>
              <p className="text-xs text-silver-400">Commands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Command Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-white mb-4">Command Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-sm text-silver-300">Pending</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.commands.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm text-silver-300">Completed</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.commands.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-silver-300">Failed</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.commands.failed}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((command, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`mr-3 ${getStatusColor(command.status)}`}>
                      {getStatusIcon(command.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{command.type}</p>
                      <p className="text-xs text-silver-400">
                        {command.agentId?.name || 'Unknown Agent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-silver-400">
                      {new Date(command.createdAt).toLocaleTimeString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      command.status === 'completed' ? 'bg-green-100 text-green-800' :
                      command.status === 'failed' ? 'bg-red-100 text-red-800' :
                      command.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {command.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-silver-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
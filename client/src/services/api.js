import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
      : null;
  }

  async getBaseURL() {
    if (this.baseURL) return this.baseURL;

    // 1) Prefer explicit env override
    const envUrl = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, '');
    if (envUrl) {
      this.baseURL = envUrl;
      return this.baseURL;
    }

    // 2) Try server-discovered onion address via same-origin
    try {
      const response = await axios.get('/api/tor-info');
      if (response?.data?.backend) {
        this.baseURL = `http://${response.data.backend}`;
        return this.baseURL;
      }
    } catch (error) {
      // ignore and fall through
    }

    // 3) Fallback to window origin (same-origin hosting)
    if (typeof window !== 'undefined' && window.location?.origin) {
      this.baseURL = window.location.origin;
      return this.baseURL;
    }

    // 4) Final fallback for local dev
    this.baseURL = 'http://localhost:5000';
    return this.baseURL;
  }

  async request(method, endpoint, data = null, config = {}) {
    try {
      const baseURL = await this.getBaseURL();
      const url = `${baseURL}${endpoint}`;
      
      const response = await axios({
        method,
        url,
        data,
        ...config
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('POST', '/api/auth/login', { email, password });
  }

  async register(username, email, password, role = 'operator') {
    return this.request('POST', '/api/auth/register', { username, email, password, role });
  }

  async getProfile() {
    return this.request('GET', '/api/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('PUT', '/api/auth/profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('PUT', '/api/auth/change-password', { currentPassword, newPassword });
  }

  // Beacon endpoints
  async getBeacons(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/api/beacons${queryString ? `?${queryString}` : ''}`);
  }

  async getBeacon(id) {
    return this.request('GET', `/api/beacons/${id}`);
  }

  async createBeacon(beaconData) {
    return this.request('POST', '/api/beacons', beaconData);
  }

  async updateBeacon(id, beaconData) {
    return this.request('PUT', `/api/beacons/${id}`, beaconData);
  }

  async updateBeaconStatus(id, status) {
    return this.request('PATCH', `/api/beacons/${id}/status`, { status });
  }

  async deleteBeacon(id) {
    return this.request('DELETE', `/api/beacons/${id}`);
  }

  async getBeaconStats(id) {
    return this.request('GET', `/api/beacons/${id}/stats`);
  }

  // Agent endpoints
  async getAgents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/api/agents${queryString ? `?${queryString}` : ''}`);
  }

  async getAgent(id) {
    return this.request('GET', `/api/agents/${id}`);
  }

  async createAgent(agentData) {
    return this.request('POST', '/api/agents', agentData);
  }

  async updateAgent(id, agentData) {
    return this.request('PUT', `/api/agents/${id}`, agentData);
  }

  async updateAgentStatus(id, status) {
    return this.request('PATCH', `/api/agents/${id}/status`, { status });
  }

  async toggleAgent(id) {
    return this.request('PATCH', `/api/agents/${id}/toggle`);
  }

  async deleteAgent(id) {
    return this.request('DELETE', `/api/agents/${id}`);
  }

  async getAgentCommands(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/api/agents/${id}/commands${queryString ? `?${queryString}` : ''}`);
  }

  async getAgentStats(id) {
    return this.request('GET', `/api/agents/${id}/stats`);
  }

  // Command endpoints
  async getCommands(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/api/commands${queryString ? `?${queryString}` : ''}`);
  }

  async getCommand(id) {
    return this.request('GET', `/api/commands/${id}`);
  }

  async createCommand(commandData) {
    return this.request('POST', '/api/commands', commandData);
  }

  async updateCommandStatus(id, status) {
    return this.request('PATCH', `/api/commands/${id}/status`, { status });
  }

  async cancelCommand(id) {
    return this.request('PATCH', `/api/commands/${id}/cancel`);
  }

  async retryCommand(id) {
    return this.request('POST', `/api/commands/${id}/retry`);
  }

  async deleteCommand(id) {
    return this.request('DELETE', `/api/commands/${id}`);
  }

  async getCommandStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/api/commands/stats/overview${queryString ? `?${queryString}` : ''}`);
  }

  // Health check
  async getHealth() {
    return this.request('GET', '/api/health');
  }

  // Tor info
  async getTorInfo() {
    return this.request('GET', '/api/tor-info');
  }
}

export default new ApiService();

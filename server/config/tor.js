const fs = require('fs');
const path = require('path');

class TorService {
  constructor() {
    this.backendOnion = null;
    this.frontendOnion = null;
    this.agentOnion = null;
    this.loadOnionAddresses();
  }

  loadOnionAddresses() {
    try {
      // 0) Local preview path (./tor-data)
      try {
        const baseLocal = path.join(process.cwd(), 'tor-data');
        const local = (sub) => path.join(baseLocal, sub, 'hostname');
        if (fs.existsSync(local('backend'))) this.backendOnion = fs.readFileSync(local('backend'), 'utf8').trim();
        if (fs.existsSync(local('frontend'))) this.frontendOnion = fs.readFileSync(local('frontend'), 'utf8').trim();
        if (fs.existsSync(local('agents'))) this.agentOnion = fs.readFileSync(local('agents'), 'utf8').trim();
      } catch (_) {}
      // 0) Local preview path (./tor-data)
      try {
        const baseLocal = path.join(process.cwd(), 'tor-data');
        const local = (sub) => path.join(baseLocal, sub, 'hostname');
        if (fs.existsSync(local('backend'))) this.backendOnion = fs.readFileSync(local('backend'), 'utf8').trim();
        if (fs.existsSync(local('frontend'))) this.frontendOnion = fs.readFileSync(local('frontend'), 'utf8').trim();
        if (fs.existsSync(local('agents'))) this.agentOnion = fs.readFileSync(local('agents'), 'utf8').trim();
      } catch (_) {}
      // 1) Env overrides (direct strings)
      if (process.env.TOR_BACKEND_ONION) this.backendOnion = process.env.TOR_BACKEND_ONION.trim();
      if (process.env.TOR_FRONTEND_ONION) this.frontendOnion = process.env.TOR_FRONTEND_ONION.trim();
      if (process.env.TOR_AGENT_ONION) this.agentOnion = process.env.TOR_AGENT_ONION.trim();

      // 2) Env overrides (paths to hostname files)
      const backendHostnamePathEnv = process.env.TOR_BACKEND_HOSTNAME_FILE;
      const frontendHostnamePathEnv = process.env.TOR_FRONTEND_HOSTNAME_FILE;
      const agentHostnamePathEnv = process.env.TOR_AGENT_HOSTNAME_FILE;

      if (!this.backendOnion && backendHostnamePathEnv && fs.existsSync(backendHostnamePathEnv)) {
        this.backendOnion = fs.readFileSync(backendHostnamePathEnv, 'utf8').trim();
      }
      if (!this.frontendOnion && frontendHostnamePathEnv && fs.existsSync(frontendHostnamePathEnv)) {
        this.frontendOnion = fs.readFileSync(frontendHostnamePathEnv, 'utf8').trim();
      }
      if (!this.agentOnion && agentHostnamePathEnv && fs.existsSync(agentHostnamePathEnv)) {
        this.agentOnion = fs.readFileSync(agentHostnamePathEnv, 'utf8').trim();
      }

      // 3) Default Docker paths
      if (!this.backendOnion) {
        const backendHostnamePath = path.join('/workspace/tor/backend/hostname');
        if (fs.existsSync(backendHostnamePath)) {
          this.backendOnion = fs.readFileSync(backendHostnamePath, 'utf8').trim();
        }
      }
      if (!this.frontendOnion) {
        const frontendHostnamePath = path.join('/workspace/tor/frontend/hostname');
        if (fs.existsSync(frontendHostnamePath)) {
          this.frontendOnion = fs.readFileSync(frontendHostnamePath, 'utf8').trim();
        }
      }
      if (!this.agentOnion) {
        const agentHostnamePath = path.join('/workspace/tor/agents/hostname');
        if (fs.existsSync(agentHostnamePath)) {
          this.agentOnion = fs.readFileSync(agentHostnamePath, 'utf8').trim();
        }
      }

      // 4) Optional system path for single hidden service setups
      if (!this.backendOnion) {
        const defaultSystemPath = '/var/lib/tor/redteam-dashboard/hostname';
        if (fs.existsSync(defaultSystemPath)) {
          this.backendOnion = fs.readFileSync(defaultSystemPath, 'utf8').trim();
        }
      }

      if (this.backendOnion) console.log(`Backend onion service: ${this.backendOnion}`);
      if (this.frontendOnion) console.log(`Frontend onion service: ${this.frontendOnion}`);
      if (this.agentOnion) console.log(`Agent onion service: ${this.agentOnion}`);
    } catch (error) {
      console.error('Error loading onion addresses:', error);
    }
  }

  getBackendOnion() {
    return this.backendOnion;
  }

  getFrontendOnion() {
    return this.frontendOnion;
  }

  getAgentOnion() {
    return this.agentOnion;
  }

  // Method to refresh onion addresses (useful if Tor restarts)
  refreshOnionAddresses() {
    this.loadOnionAddresses();
  }
}

module.exports = new TorService();

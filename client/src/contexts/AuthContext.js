import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Resolve backend base URL
  const getBackendUrl = async () => {
    // 1) Prefer explicit env override
    const envUrl = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, '');
    if (envUrl) return envUrl;

    // 2) Try server-provided onion info via same-origin
    try {
      const response = await axios.get('/api/tor-info');
      if (response?.data?.backend) {
        return `http://${response.data.backend}`;
      }
    } catch (_) {
      // ignore and fall through
    }

    // 3) Fallback to window origin (same-origin hosting)
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    // 4) Final fallback for local dev
    return 'http://localhost:5000';
  };

  const login = async (email, password) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password, role = 'operator') => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.post(`${backendUrl}/api/auth/register`, {
        username,
        email,
        password,
        role
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.put(`${backendUrl}/api/auth/profile`, profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const backendUrl = await getBackendUrl();
      await axios.put(`${backendUrl}/api/auth/change-password`, {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password change failed' 
      };
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const backendUrl = await getBackendUrl();
          const response = await axios.get(`${backendUrl}/api/auth/profile`);
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid, clear it
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getBackendUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

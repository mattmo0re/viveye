import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, getBackendUrl } = useAuth();

  useEffect(() => {
    if (user) {
      const initializeSocket = async () => {
        try {
          const backendUrl = await getBackendUrl();
          // Allow explicit WS override, else derive from backend URL
          const envWs = process.env.REACT_APP_WS_URL && process.env.REACT_APP_WS_URL.replace(/\/$/, '');
          const wsUrl = envWs || backendUrl.replace(/^http/, 'ws');

          const newSocket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            timeout: 60000,
            forceNew: true
          });

          newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
          });

          newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
          });

          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnected(false);
          });

          setSocket(newSocket);

          return () => {
            newSocket.close();
          };
        } catch (error) {
          console.error('Failed to initialize socket:', error);
        }
      };

      initializeSocket();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, getBackendUrl]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

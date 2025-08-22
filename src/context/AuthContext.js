// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('ema_admin_authenticated');
      const loginTime = localStorage.getItem('ema_admin_login_time');
      
      if (authenticated === 'true' && loginTime) {
        // Check if login is still valid (24 hours)
        const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ema_admin_authenticated', 'true');
    localStorage.setItem('ema_admin_login_time', Date.now().toString());
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ema_admin_authenticated');
    localStorage.removeItem('ema_admin_login_time');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
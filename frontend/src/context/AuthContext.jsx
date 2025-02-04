import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await authService.verifyAuthToken(token);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setError(err.message);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [oauthInFlight, setOauthInFlight] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const result = await authAPI.verifySession();
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return { success: false };
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false };
    }
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    (async () => {
      try {
        console.log('AuthContext: Initial auth check starting');
        // Don't check auth status if we're on profile page with session_id (OAuth redirect)
        const currentPath = window.location.pathname;
        const hasSessionId = !!authAPI.parseSessionIdFromUrl();
        
        console.log('AuthContext: Initial check', { currentPath, hasSessionId });
        
        if (currentPath === '/profile' && hasSessionId) {
          // Skip initial auth check - OAuth will handle authentication
          console.log('AuthContext: Skipping initial auth check - OAuth redirect detected');
          return;
        }
        
        // Normal auth status check for other cases
        await checkAuthStatus();
      } finally {
        console.log('AuthContext: Setting isInitializing to false');
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = async (sessionId) => {
    console.log('AuthContext: login() called with sessionId:', sessionId);
    try {
      const result = await authAPI.loginWithSocial(sessionId);
      console.log('AuthContext: login() result:', result);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        console.log('AuthContext: Authentication successful, user set');
        return { success: true };
      } else {
        console.error('AuthContext: Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const redirectToLogin = () => {
    authAPI.redirectToSocialLogin();
  };

  const value = {
    user,
    isAuthenticated,
    isInitializing,
    oauthInFlight,
    setOauthInFlight,
    login,
    logout,
    redirectToLogin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../lib/authApi';

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

  // App boot: load token → set isAuthenticated → finally isInitializing=false
  useEffect(() => {
    (async () => {
      try {
        const timestamp = performance.now();
        console.info('AuthContext: App boot started', { timestamp: Math.round(timestamp) });
        
        // Don't check auth status if we're on profile page with session_id (OAuth redirect)
        const currentPath = window.location.pathname;
        const hasSessionId = !!authAPI.parseSessionIdFromUrl();
        
        console.info('AuthContext: Boot check', { 
          currentPath, 
          hasSessionId,
          timestamp: Math.round(timestamp)
        });
        
        if (currentPath === '/profile' && hasSessionId) {
          // Skip initial auth check - OAuth will handle authentication
          console.info('AuthContext: Skipping boot auth check - OAuth redirect detected');
          return;
        }
        
        // Normal auth status check for other cases
        await checkAuthStatus();
        console.info('AuthContext: Boot auth check completed');
      } finally {
        const timestamp = performance.now();
        console.info('AuthContext: Setting isInitializing to false', { timestamp: Math.round(timestamp) });
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = async (sessionId) => {
    const timestamp = performance.now();
    console.info('AuthContext: login() called', { sessionId, timestamp: Math.round(timestamp) });
    
    try {
      const result = await authAPI.loginWithSocial(sessionId);
      console.info('AuthContext: login() result', { 
        success: result.success, 
        timestamp: Math.round(performance.now())
      });
      
      if (result.success) {
        // Await token persistence before setting authenticated
        if (authAPI.persistToken && result.token) {
          await authAPI.persistToken(result.token);
          console.info('AuthContext: Token persisted');
        }
        
        setUser(result.data.user);
        setIsAuthenticated(true);
        console.info('AuthContext: Authentication successful, user set');
        return { success: true, token: result.token };
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
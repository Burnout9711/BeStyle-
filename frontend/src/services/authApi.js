/**
 * Authentication API service for social media login
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Include cookies for session management
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get the current app URL for redirect after login
 */
export const getCurrentAppUrl = () => {
  return window.location.origin;
};

/**
 * Get the login URL with redirect parameter
 */
export const getLoginUrl = () => {
  const redirectUrl = `${getCurrentAppUrl()}/profile`;
  return `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

/**
 * Parse session ID from URL fragment
 * Expected format: /profile#session_id=60b77a6f-9458-4a4c-83d6-aa55a51af7c8
 */
export const parseSessionIdFromUrl = () => {
  const hash = window.location.hash;
  const match = hash.match(/session_id=([^&]+)/);
  return match ? match[1] : null;
};

/**
 * Login with social media using session ID from Emergent
 */
export const loginWithSocial = async (sessionId) => {
  try {
    const response = await authAPI.post('/api/auth/login', {
      session_id: sessionId
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Social login error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Login failed'
    };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    const response = await authAPI.get('/api/auth/profile');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get profile'
    };
  }
};

/**
 * Verify current session
 */
export const verifySession = async () => {
  try {
    const response = await authAPI.get('/api/auth/verify');
    
    return {
      success: response.data.valid,
      data: response.data
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      success: false,
      error: 'Session verification failed'
    };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const response = await authAPI.post('/api/auth/logout');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Logout failed'
    };
  }
};

/**
 * Redirect to social login
 */
export const redirectToSocialLogin = () => {
  window.location.href = getLoginUrl();
};

export default {
  loginWithSocial,
  getUserProfile,
  verifySession,
  logout,
  redirectToSocialLogin,
  getLoginUrl,
  parseSessionIdFromUrl
};
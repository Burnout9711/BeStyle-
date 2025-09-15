/**
 * Authentication API service for social media login
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE;

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
  console.log('Redirect URL in authContext:', redirectUrl);
  return `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

/**
 * Parse session ID from URL (supports both hash and query parameters)
 */
export const parseSessionIdFromUrl = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const qs = new URLSearchParams(window.location.search);
  console.log('Hash params:', Array.from(hash.entries()));
  console.log('Query string params:', Array.from(qs.entries()));
  return hash.get("session_id") || qs.get("session_id") || null;
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
 * Get detailed user profile
 */
export const getDetailedProfile = async () => {
  try {
    const response = await authAPI.get('/api/auth/profile/detailed');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get detailed profile error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get detailed profile'
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
  getDetailedProfile,
  verifySession,
  logout,
  redirectToSocialLogin,
  getLoginUrl,
  parseSessionIdFromUrl
};
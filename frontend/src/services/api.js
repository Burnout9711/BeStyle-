// API service for BeStyle.AI frontend
import axios from 'axios';

// Get backend URL from environment variables
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor to add any auth tokens or additional headers
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Quiz API methods
export const quizAPI = {
  // Get quiz questions structure
  getQuestions: async () => {
    const response = await api.get('/api/quiz/questions');
    return response.data;
  },

  // Start a new quiz session
  startSession: async () => {
    const response = await api.post('/api/quiz/start');
    return response.data;
  },

  // Submit a quiz step
  submitStep: async (sessionId, stepIndex, stepData) => {
    const response = await api.post('/api/quiz/submit-step', {
      session_id: sessionId,
      step_number: stepIndex,  // Backend expects step_number
      answers: stepData        // Backend expects answers
    });
    return response.data;
  },

  // Complete quiz and get recommendations
  completeQuiz: async (sessionId) => {
    const response = await api.post('/api/quiz/complete', {
      session_id: sessionId
    });
    return response.data;
  },

  // Get quiz results by session ID
  getResults: async (sessionId) => {
    const response = await api.get(`/api/quiz/results/${sessionId}`);
    return response.data;
  }
};

// Waitlist API methods
export const waitlistAPI = {
  // Subscribe to waitlist
  subscribe: async (email, instagram = '') => {
    const response = await api.post('/api/waitlist/subscribe', {
      email,
      instagram,
      source: 'waitlist_section'
    });
    return response.data;
  },

  // Get waitlist statistics
  getStats: async () => {
    const response = await api.get('/api/waitlist/stats');
    return response.data;
  },

  // Health check for waitlist service
  healthCheck: async () => {
    const response = await api.get('/api/waitlist/health');
    return response.data;
  }
};

// Health check API
export const healthAPI = {
  // General health check
  check: async () => {
    const response = await api.get('/api/health');
    return response.data;
  }
};

export default api;
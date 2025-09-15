// this file is made with respect to adding login/signup functionality
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8000",
  withCredentials: true, // send/receive cookies
});

// Optional interceptors for errors
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "Request failed";
    return Promise.reject(new Error(msg));
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
  getResults: async () => {
    const response = await api.get(`/api/quiz/results`, { withCredentials: true });
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

// Recommendation API methods
export const recommendationAPI = {
  // Get personalized recommendations based on user preferences
  getRecommendations: async (preferences = {}) => {
    const response = await api.post('/api/recommendations/generate', preferences);
    return response.data;
  },
  
  // Get user's saved outfit recommendations
  getUserOutfits: async () => {
    const response = await api.get('/api/recommendations/user-outfits');
    return response.data;
  },
  
  // Save an outfit as favorite
  saveOutfit: async (outfitId, sessionId = null) => {
    const response = await api.post('/api/recommendations/save-outfit', {
      outfit_id: outfitId,
      session_id: sessionId
    });
    return response.data;
  },
  
  // Remove outfit from favorites
  removeOutfit: async (outfitId) => {
    const response = await api.delete(`/api/recommendations/remove-outfit/${outfitId}`);
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
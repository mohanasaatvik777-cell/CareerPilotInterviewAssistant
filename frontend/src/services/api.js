import axios from 'axios';

// Use environment variable with HTTPS Render backend URL fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://careerpilotinterviewassistant.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto attach JWT bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interview_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data)
};

// Interview Sessions API
export const interviewAPI = {
  createSession: (data) => api.post('/interviews', data),
  getSessions: (params) => api.get('/interviews', { params }),
  getSession: (id) => api.get(`/interviews/${id}`),
  getSessionDetails: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (data) => api.post('/interviews/answers', data),
  generateFollowUp: (sessionId, questionId) => api.post(`/interviews/${sessionId}/follow-up`, { questionId }),
  completeSession: (id) => api.post(`/interviews/${id}/complete`),
  shareSession: (id, sharedWithEmail) => api.post(`/interviews/${id}/share`, { sharedWithEmail }),
  archiveSession: (id) => api.post(`/interviews/${id}/archive`),
  deleteSession: (id) => api.delete(`/interviews/${id}`),
  compareSessions: (id1, id2) => api.get(`/interviews/compare/${id1}/${id2}`)
};

// AI Helper API
export const aiAPI = {
  explainRole: (data) => api.post('/ai/explain-role', data),
  generatePrepCards: (data) => api.post('/ai/prep-cards', data),
  getPrepCards: () => api.get('/ai/prep-cards')
};

// Mentor API
export const mentorAPI = {
  getSharedSessions: () => api.get('/mentor/shared-sessions'),
  getSharedSessionByCode: (code) => api.get(`/mentor/shared-sessions/${code}`)
};

export default api;

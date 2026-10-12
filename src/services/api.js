import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (localStorage.getItem('foodbridge_token')) {
        localStorage.removeItem('foodbridge_token');
        localStorage.removeItem('foodbridge_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

// Organizations API
export const organizationsAPI = {
  getAll: (params) => api.get('/organizations', { params }),
  getById: (id) => api.get(`/organizations/${id}`),
  update: (id, data) => api.patch(`/organizations/${id}`, data),
  verify: (id, data) => api.patch(`/organizations/${id}/verify`, data)
};

// Donations API
export const donationsAPI = {
  create: (donationData) => api.post('/donations', donationData),
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  update: (id, data) => api.patch(`/donations/${id}`, data),
  cancel: (id, reason) => api.patch(`/donations/${id}/cancel`, { reason }),
  triggerMatching: (id, weights) => api.post(`/donations/${id}/match`, { weights })
};

// Matches API
export const matchesAPI = {
  getAll: (params) => api.get('/matches', { params }),
  respond: (id, action, declineReason) => api.post(`/matches/${id}/respond`, { action, declineReason })
};

// Pickups API
export const pickupsAPI = {
  create: (data) => api.post('/pickups', data),
  getAll: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  updateStatus: (id, status, note) => api.patch(`/pickups/${id}/status`, { status, note }),
  assignVolunteer: (id, volunteerId) => api.post(`/pickups/${id}/volunteer`, { volunteerId })
};

// Handover API
export const handoverAPI = {
  initiate: (pickupId) => api.post('/handovers/initiate', { pickupId }),
  verify: (pickupId, verificationCode) => api.post('/handovers/verify', { pickupId, verificationCode }),
  confirmDual: (id) => api.post(`/handovers/${id}/confirm`)
};

// Map & Geolocation API
export const mapAPI = {
  getLocations: (params) => api.get('/map/locations', { params }),
  getNearbyNGOs: (params) => api.get('/map/nearby-ngos', { params }),
  getRoute: (coords) => api.post('/map/route', coords)
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all')
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getDonations: () => api.get('/analytics/donations')
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  getDonations: (params) => api.get('/admin/donations', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.patch('/admin/settings', settings)
};

export default api;

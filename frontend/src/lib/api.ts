import axios from 'axios';

// Use absolute URL to connect to backend
const API_URL = 'http://localhost:9003/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get admin token first, then regular user token as fallback
    const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error, redirecting to login...');
      // Don't auto-logout from admin pages to avoid disruption
      if (!window.location.pathname.includes('/admin')) {
        localStorage.removeItem('user_token');
        // Only redirect if not on admin page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Field API
export const fieldAPI = {
  getAllFields: () => api.get('/fields'),
  getFieldById: (id: number) => api.get(`/fields/${id}`),
};

// Field Management API
export const fieldManagementAPI = {
  getFieldStatus: (fieldId: number, date: string) =>
    api.get('/field-management/status', { params: { fieldId, date } }),
  lockTimeSlot: (fieldId: number, data: any) =>
    api.post(`/field-management/${fieldId}/lock`, data),
  lockAllTimeSlots: (fieldId: number, data: any) =>
    api.post(`/field-management/${fieldId}/lock-all`, data),
};

// Booking API
export const bookingAPI = {
  getBookingById: (id: number) => api.get(`/bookings/${id}`),
  getBookingsByUser: (userId: number, params?: any) => api.get(`/bookings/user/${userId}`, { params }),
  getBookingsByField: (fieldId: number, params?: any) => api.get(`/bookings/field/${fieldId}`, { params }),
  createBooking: (data: any) => api.post('/bookings', data),
  updateBooking: (id: number, data: any) => api.put(`/bookings/${id}`, data),
};

// User API
export const userAPI = {
  login: (data: any) => api.post('/auth/login', data),
  adminLogin: (data: any) => api.post('/auth/admin/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/users/me'),
  getCurrentAdmin: () => api.get('/auth/admin/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getAllUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

// Removed product and finance APIs as part of simplification

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: (params?: any) => api.get('/dashboard/chart', { params }),
  getBookingTrend: () => api.get('/dashboard/chart/booking-trend'),
};

// Feedback API
export const feedbackAPI = {
  getAllFeedbacks: (params?: any) => api.get('/feedback', { params }),
  getFeedbackById: (id: number) => api.get(`/feedback/${id}`),
  createFeedback: (data: any) => api.post('/feedback', data),
  updateFeedback: (id: number, data: any) => api.patch(`/feedback/${id}/status`, data),
  deleteFeedback: (id: number) => api.delete(`/feedback/${id}`),
};

// Opponent API
export const opponentAPI = {
  getAllOpponents: () => api.get('/opponents'),
  getAvailableOpponents: () => api.get('/opponents/available'),
  getOpponentById: (id: number) => api.get(`/opponents/${id}`),
  createOpponent: (data: any) => api.post('/opponents', data),
  updateOpponent: (id: number, data: any) => api.put(`/opponents/${id}`, data),
  deleteOpponent: (id: number) => api.delete(`/opponents/${id}`),
};

export default api;

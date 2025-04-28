import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        // Save the new token
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Update the request header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
};

// Field API endpoints
export const fieldAPI = {
  getAllFields: (params) => api.get('/fields', { params }),
  getFieldById: (id) => api.get(`/fields/${id}`),
  checkAvailability: (params) => api.get('/fields/availability', { params }),
  createField: (fieldData) => api.post('/fields', fieldData),
  updateField: (id, fieldData) => api.put(`/fields/${id}`, fieldData),
  deleteField: (id) => api.delete(`/fields/${id}`),
};

// Booking API endpoints
export const bookingAPI = {
  getAllBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  getBookingsByUser: (userId, params) => api.get(`/bookings/user/${userId}`, { params }),
  getBookingsByField: (fieldId, params) => api.get(`/bookings/field/${fieldId}`, { params }),
  updatePaymentStatus: (id, paymentData) => api.patch(`/bookings/${id}/payment`, paymentData),
};

// Product API endpoints
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Feedback API endpoints
export const feedbackAPI = {
  getAllFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  getFeedbackByBooking: (bookingId) => api.get(`/feedback/booking/${bookingId}`),
  getFieldRating: (fieldId) => api.get(`/feedback/field/${fieldId}/rating`),
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

// Opponent API endpoints
export const opponentAPI = {
  getAllOpponents: (params) => api.get('/opponents', { params }),
  getOpponentById: (id) => api.get(`/opponents/${id}`),
  getOpponentByBooking: (bookingId) => api.get(`/opponents/booking/${bookingId}`),
  findAvailableOpponents: (params) => api.get('/opponents/available', { params }),
  createOpponent: (opponentData) => api.post('/opponents', opponentData),
  updateOpponent: (id, opponentData) => api.put(`/opponents/${id}`, opponentData),
  deleteOpponent: (id) => api.delete(`/opponents/${id}`),
  matchOpponents: (matchData) => api.post('/opponents/match', matchData),
};

export default api;
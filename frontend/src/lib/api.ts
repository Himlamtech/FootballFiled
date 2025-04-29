import axios from 'axios';

// Sử dụng đường dẫn tương đối để tận dụng proxy
const API_URL = '/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Field API
export const fieldAPI = {
  getAllFields: () => api.get('/fields'),
  getFieldById: (id: number) => api.get(`/fields/${id}`),
  createField: (data: any) => api.post('/fields', data),
  updateField: (id: number, data: any) => api.put(`/fields/${id}`, data),
  deleteField: (id: number) => api.delete(`/fields/${id}`),
};

// Booking API
export const bookingAPI = {
  getAllBookings: (params?: any) => api.get('/bookings', { params }),
  getBookingById: (id: number) => api.get(`/bookings/${id}`),
  getBookingsByUser: (userId: number, params?: any) => api.get(`/bookings/user/${userId}`, { params }),
  getBookingsByField: (fieldId: number, params?: any) => api.get(`/bookings/field/${fieldId}`, { params }),
  createBooking: (data: any) => api.post('/bookings', data),
  updateBooking: (id: number, data: any) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id: number) => api.delete(`/bookings/${id}`),
  updatePaymentStatus: (id: number, data: any) => api.patch(`/bookings/${id}/payment`, data),
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

// Product API
export const productAPI = {
  getAllProducts: (params?: any) => api.get('/products', { params }),
  getProductById: (id: number) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
};

export default api;

/**
 * API Service
 * 
 * This service provides methods for interacting with the backend API.
 * It handles authentication, error handling, and provides typed interfaces for API responses.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:9002/api';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Types for fields
export interface Field {
  fieldId: number;
  name: string;
  description: string;
  size: string;
  imageUrl: string;
  isActive: boolean;
}

// Types for time slots
export interface TimeSlot {
  timeSlotId: number;
  fieldId: number;
  startTime: string;
  endTime: string;
  weekdayPrice: number;
  weekendPrice: number;
  isActive: boolean;
}

export interface TimeSlotWithAvailability {
  id: number;
  start_time: string;
  end_time: string;
  price: number;
  available: boolean;
}

// Types for bookings
export interface Booking {
  bookingId: number;
  fieldId: number;
  timeSlotId: number;
  userId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
}

export interface BookingCreateRequest {
  fieldId: number;
  timeSlotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  totalPrice: number;
  status?: string;
  paymentMethod?: string;
  notes?: string;
}

// Types for opponents
export interface Opponent {
  id: number;
  booking_id: number;
  team_name: string;
  contact_phone: string;
  contact_email?: string;
  description?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  player_count?: number;
  status?: 'open' | 'matched' | 'closed';
}

export interface OpponentCreateRequest {
  booking_id: number;
  team_name: string;
  contact_phone: string;
  contact_email?: string;
  description?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  player_count?: number;
}

// Types for feedback
export interface Feedback {
  id: number;
  name: string;
  email: string;
  content: string;
  status: 'unread' | 'read' | 'responded';
}

export interface FeedbackCreateRequest {
  name: string;
  email: string;
  content: string;
}

// Create API service class
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    this.loadToken();
  }

  // Load token from localStorage
  private loadToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
    }
  }

  // Set token
  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token
  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.token;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.api(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication methods
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'post',
      url: '/auth/login',
      data: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  public logout(): void {
    this.clearToken();
  }

  // Field methods
  public async getFields(): Promise<Field[]> {
    const response = await this.request<ApiResponse<Field[]>>({
      method: 'get',
      url: '/fields',
    });
    
    return response.data || [];
  }

  public async getFieldById(id: number): Promise<Field> {
    const response = await this.request<ApiResponse<Field>>({
      method: 'get',
      url: `/fields/${id}`,
    });
    
    return response.data as Field;
  }

  // Time slot methods
  public async getTimeSlots(): Promise<TimeSlot[]> {
    const response = await this.request<TimeSlot[]>({
      method: 'get',
      url: '/timeslots/all',
    });
    
    return response;
  }

  public async getAvailableTimeSlots(fieldId: number, date: string): Promise<TimeSlotWithAvailability[]> {
    const response = await this.request<TimeSlotWithAvailability[]>({
      method: 'get',
      url: '/timeslots',
      params: { field_id: fieldId, date },
    });
    
    return response;
  }

  // Booking methods
  public async getBookings(): Promise<Booking[]> {
    const response = await this.request<ApiResponse<Booking[]>>({
      method: 'get',
      url: '/bookings',
    });
    
    return response.data || [];
  }

  public async getBookingById(id: number): Promise<Booking> {
    const response = await this.request<ApiResponse<Booking>>({
      method: 'get',
      url: `/bookings/${id}`,
    });
    
    return response.data as Booking;
  }

  public async createBooking(booking: BookingCreateRequest): Promise<Booking> {
    const response = await this.request<ApiResponse<Booking>>({
      method: 'post',
      url: '/bookings',
      data: booking,
    });
    
    return response.data as Booking;
  }

  public async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const response = await this.request<ApiResponse<Booking>>({
      method: 'patch',
      url: `/bookings/${id}/status`,
      data: { status },
    });
    
    return response.data as Booking;
  }

  // Opponent methods
  public async getOpponents(): Promise<Opponent[]> {
    const response = await this.request<Opponent[]>({
      method: 'get',
      url: '/opponents',
    });
    
    return response;
  }

  public async getOpponentById(id: number): Promise<Opponent> {
    const response = await this.request<Opponent>({
      method: 'get',
      url: `/opponents/${id}`,
    });
    
    return response;
  }

  public async createOpponent(opponent: OpponentCreateRequest): Promise<Opponent> {
    const response = await this.request<Opponent>({
      method: 'post',
      url: '/opponents',
      data: opponent,
    });
    
    return response;
  }

  public async updateOpponent(id: number, opponent: Partial<OpponentCreateRequest>): Promise<Opponent> {
    const response = await this.request<Opponent>({
      method: 'put',
      url: `/opponents/${id}`,
      data: opponent,
    });
    
    return response;
  }

  public async deleteOpponent(id: number): Promise<void> {
    await this.request<ApiResponse<null>>({
      method: 'delete',
      url: `/opponents/${id}`,
    });
  }

  // Feedback methods
  public async getFeedback(): Promise<Feedback[]> {
    const response = await this.request<ApiResponse<Feedback[]>>({
      method: 'get',
      url: '/feedback',
    });
    
    return response.data || [];
  }

  public async createFeedback(feedback: FeedbackCreateRequest): Promise<Feedback> {
    const response = await this.request<ApiResponse<Feedback>>({
      method: 'post',
      url: '/feedback',
      data: feedback,
    });
    
    return response.data as Feedback;
  }

  // Dashboard methods
  public async getDashboardStats(): Promise<any> {
    const response = await this.request<any>({
      method: 'get',
      url: '/dashboard/stats',
    });
    
    return response;
  }

  public async getBookingChartData(period: string): Promise<any> {
    const response = await this.request<any>({
      method: 'get',
      url: '/dashboard/booking-chart',
      params: { period },
    });
    
    return response;
  }

  public async getPopularFields(): Promise<any> {
    const response = await this.request<any>({
      method: 'get',
      url: '/dashboard/popular-fields',
    });
    
    return response;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

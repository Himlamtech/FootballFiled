import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

// Create auth context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  adminLogin: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Update state
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Update state
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Admin login function
  const adminLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authAPI.adminLogin(credentials);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Admin login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Admin login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    adminLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
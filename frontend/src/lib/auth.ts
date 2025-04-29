import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from './api';

// Define types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
  adminLogin: (credentials: { email: string; password: string }) => Promise<{ success: boolean; data?: any; message?: string }>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  adminLogin: async () => ({ success: false }),
});

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await userAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await userAPI.login(credentials);
      const { user, token } = response.data;

      // Save token
      localStorage.setItem('token', token);

      // Update state
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
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
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await userAPI.register(userData);
      const { user, token } = response.data;

      // Save token
      localStorage.setItem('token', token);

      // Update state
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
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
    localStorage.removeItem('token');
    setUser(null);
  };

  // Admin login function
  const adminLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await userAPI.login({
        ...credentials,
        isAdmin: true
      });

      if (response.data.user.role !== 'admin') {
        throw new Error('Not an admin account');
      }

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      return { success: true, data: response.data };
    } catch (error: any) {
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
  const value: AuthContextType = {
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
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
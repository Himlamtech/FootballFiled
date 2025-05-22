import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("admin_token") !== null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(
    localStorage.getItem("admin_token") !== null
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("admin_token")
  );

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Only admin login is supported
      const response = await axios.post('/api/auth/admin/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem("admin_token", response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    // Redirect to home page
    window.location.href = "/";
  };

  // Set axios default authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
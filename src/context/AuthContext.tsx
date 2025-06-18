import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'finance' | 'viewer';
  hospitalId: string;
  phone?: string;
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and get user info
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        apiClient.removeToken();
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // Token is invalid, remove it
      localStorage.removeItem('token');
      apiClient.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data.user) {
        console.log('Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        return true;
      } else {
        console.log('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await apiClient.register(userData);
      
      if (response.success && response.data.user) {
        console.log('Registration successful, setting user:', response.data.user);
        setUser(response.data.user);
        return true;
      } else {
        console.log('Registration failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
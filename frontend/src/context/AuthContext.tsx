'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse, LoginRequest, UserRole } from '@/types';
import { apiClient } from '@/utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  checkRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get<User>('/api/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      localStorage.removeItem('authToken');
    }
    setLoading(false);
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('authToken', token);
        setUser(user);
        toast.success('Login successful');
        return true;
      } else {
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const checkRole = (allowedRoles: UserRole[]): boolean => {
    return user ? allowedRoles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

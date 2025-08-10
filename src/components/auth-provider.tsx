"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, type LoginResponse } from '@/lib/api';
import { StorageService } from '@/lib/storage';

interface User {
  id: number;
  email: string;
  name: string;
  currency?: string;
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_reports?: boolean;
  budget_alerts?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getSessions: () => Promise<any[]>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  const clearAllTokens = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      setTokenRefreshTimer(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update stored tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('auth_token', accessToken); // Backward compatibility
        
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        // Update state
        setToken(accessToken);
        
        // Set up next refresh
        setupTokenRefresh();
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      // Clear tokens and redirect to login
      clearAllTokens();
      router.push('/auth');
      throw error;
    }
  };

  const setupTokenRefresh = () => {
    // Clear existing timer
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
    }
    
    // Set up automatic refresh 1 minute before expiry (14 minutes for 15-minute tokens)
    const refreshInterval = 14 * 60 * 1000; // 14 minutes in milliseconds
    
    const timer = setTimeout(async () => {
      try {
        await refreshToken();
      } catch (error) {
        // If refresh fails, logout user
        logout();
      }
    }, refreshInterval);
    
    setTokenRefreshTimer(timer);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check for new token format first, fallback to old format
        const accessToken = localStorage.getItem('access_token');
        const oldToken = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('auth_user');

        const currentToken = accessToken || oldToken;

        if (currentToken && storedUser) {
          setToken(currentToken);
          setUser(JSON.parse(storedUser));
          
          // Set up automatic token refresh if we have refresh token
          if (refreshToken && accessToken) {
            setupTokenRefresh();
          }
        }
      } catch (error) {
        // If initialization fails, clear any corrupted tokens
        clearAllTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    // Cleanup timer on unmount
    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        const { user: userData, token, accessToken, refreshToken } = response.data;
        
        // Handle both old and new token formats
        const currentToken = accessToken || token;
        
        // Store tokens in localStorage
        if (accessToken && refreshToken) {
          // New format with refresh tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          // Keep old format for backward compatibility
          localStorage.setItem('auth_token', accessToken);
        } else {
          // Old format fallback
          localStorage.setItem('auth_token', currentToken);
        }
        
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        // Update state
        setToken(currentToken);
        setUser(userData);
        
        // Set up automatic token refresh if we have refresh token
        if (refreshToken) {
          setupTokenRefresh();
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(name, email, password);
      
      // Debug: Log the response to see what the backend returns
      console.log('Register response:', response);

      if (response.success && response.data) {
        const { user: userData, token, accessToken, refreshToken } = response.data;
        
        // Handle both old and new token formats
        const currentToken = accessToken || token;
        
        // Store tokens in localStorage
        if (accessToken && refreshToken) {
          // New format with refresh tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          // Keep old format for backward compatibility
          localStorage.setItem('auth_token', accessToken);
        } else {
          // Old format fallback
          localStorage.setItem('auth_token', currentToken);
        }
        
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        // Update state
        setToken(currentToken);
        setUser(userData);
        
        // Set up automatic token refresh if we have refresh token
        if (refreshToken) {
          setupTokenRefresh();
        }
      } else {
        console.error('Registration failed - Invalid response:', response);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // If user was created but token generation failed, show specific message
      if (error instanceof Error && error.message.includes('Internal server error')) {
        throw new Error('¡Registro exitoso! Tu cuenta fue creada correctamente. Por favor, inicia sesión con tus credenciales.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate tokens
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear all tokens and state
      clearAllTokens();
      
      // Redirect to login page
      router.push('/auth');
    }
  };

  const getSessions = async () => {
    try {
      // TODO: Implement getSessions in apiClient
      // const response = await apiClient.getSessions();
      // return response.data?.sessions || [];
      return [];
    } catch (error) {
      return [];
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update localStorage to keep data in sync after saving to database
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshToken,
    getSessions,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

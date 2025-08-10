// API Client for Backend Communication
import { StorageService } from './storage';

const API_BASE_URL = 'https://finance-app-backend-drab.vercel.app/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
  // New fields for advanced auth
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TransactionStats {
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  notes?: string;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private getAuthHeaders(): Record<string, string> {
    const token = StorageService.getAccessToken();
    
    // Validar que el token existe y no está corrupto
    if (!token || token === 'undefined' || token === 'null' || token.length < 10) {
      return {};
    }
    
    return { 'Authorization': `Bearer ${token}` };
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.data?.token;
    
    if (newAccessToken) {
      StorageService.setTokens(newAccessToken, data.data?.refreshToken);
    }

    return newAccessToken;
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    
    this.failedQueue = [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle 401/403 Unauthorized - token might be expired
      if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/')) {
        const refreshToken = StorageService.getRefreshToken();
        
        if (refreshToken && !this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            // Retry original request with new token
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // Clear tokens and redirect to login
            StorageService.clearAuth();
            window.location.href = '/auth';
            throw new Error('Session expired. Please login again.');
          } finally {
            this.isRefreshing = false;
          }
        } else if (refreshToken && this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ 
              resolve: (token: string) => {
                this.request<T>(endpoint, {
                  ...options,
                  headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                  },
                }).then(resolve).catch(reject);
              }, 
              reject 
            });
          });
        } else {
          // No refresh token available, redirect to login
          StorageService.clearAuth();
          window.location.href = '/auth';
          throw new Error('Session expired. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo.');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        currency: 'USD',
        language: 'es'
      }),
    });
  }

  async refreshToken(): Promise<ApiResponse<any>> {
    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    const refreshToken = StorageService.getRefreshToken();
    try {
      return await this.request<any>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      // Always clear local storage, even if the request fails
      StorageService.clearAuth();
    }
  }

  // Transaction endpoints
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>('/transactions');
  }

  async addTransaction(transactionData: TransactionData): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(endpoint, options);
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request<{ transaction: Transaction }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllTransactions(): Promise<ApiResponse<any>> {
    return this.request<any>('/transactions/delete-all', {
      method: 'DELETE',
    });
  }

  async getTransactionStats(): Promise<ApiResponse<TransactionStats>> {
    return this.request<TransactionStats>('/transactions/stats');
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/categories');
  }

  async createCategory(category: { name: string; type: 'income' | 'expense' }): Promise<ApiResponse<any>> {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePreferences(preferencesData: { 
    currency?: string; 
    language?: string; 
    email_notifications?: boolean;
    push_notifications?: boolean;
    weekly_reports?: boolean;
    budget_alerts?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData),
    });
  }

  async deleteAllUserData(): Promise<ApiResponse<any>> {
    return this.request<any>('/user/delete-all', {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, LoginResponse, Transaction, TransactionStats };

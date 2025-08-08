// API Client for Backend Communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private getAuthHeaders(): HeadersInit {
    // Try new token format first, fallback to old format
    const accessToken = localStorage.getItem('access_token');
    const oldToken = localStorage.getItem('auth_token');
    const token = accessToken || oldToken;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        
        // Update stored tokens
        localStorage.setItem('access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        return accessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      throw error;
    }
  }

  private processQueue(error: any, token: string | null = null) {
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
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken && !this.isRefreshing) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve: (token: string) => {
                // Retry original request with new token
                this.request<T>(endpoint, {
                  ...options,
                  headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                  },
                }).then(resolve).catch(reject);
              }, reject });
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            // Retry original request with new token
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // Redirect to login or handle auth failure
            window.location.href = '/auth';
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        } else {
          // No refresh token, redirect to login
          window.location.href = '/auth';
          throw new Error('Authentication required');
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
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: LoginResponse['user'] }>> {
    return this.request<{ user: LoginResponse['user'] }>('/auth/profile');
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getSessions(): Promise<ApiResponse<{ sessions: any[] }>> {
    return this.request<{ sessions: any[] }>('/auth/sessions');
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
  }

  // Transaction endpoints
  async getTransactions(limit?: number, offset?: number): Promise<ApiResponse<{ transactions: Transaction[] }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ transactions: Transaction[] }>(`/transactions${query}`);
  }

  async createTransaction(transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
  }): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(
    id: number,
    transaction: Partial<{
      type: 'income' | 'expense';
      amount: number;
      category: string;
      description: string;
      date: string;
    }>
  ): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request<{ transaction: Transaction }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactionStats(): Promise<ApiResponse<{ stats: TransactionStats }>> {
    return this.request<{ stats: TransactionStats }>('/transactions/stats');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { Transaction, TransactionStats, LoginResponse, ApiResponse };

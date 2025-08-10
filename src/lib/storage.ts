// Centralized Storage Service
// Eliminates duplicate localStorage logic across the app

export class StorageService {
  // Token keys
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly AUTH_TOKEN_KEY = 'auth_token'; // Backward compatibility
  private static readonly AUTH_USER_KEY = 'auth_user';
  private static readonly CURRENCY_KEY = 'finance-app-currency';

  // Token Management
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) || localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getAuthUser(): any | null {
    const user = localStorage.getItem(this.AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.AUTH_TOKEN_KEY, accessToken); // Backward compatibility
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static setUser(user: any): void {
    localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
  }

  static clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.AUTH_USER_KEY);
  }

  static clearAll(): void {
    localStorage.clear();
  }

  // Currency Management
  static getCurrency(): any | null {
    const currency = localStorage.getItem(this.CURRENCY_KEY);
    return currency ? JSON.parse(currency) : null;
  }

  static setCurrency(currency: any): void {
    localStorage.setItem(this.CURRENCY_KEY, JSON.stringify(currency));
  }

  // Generic helpers
  static getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  static setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

// Export convenience functions for backward compatibility
export const {
  getAccessToken,
  getRefreshToken,
  getAuthUser,
  setTokens,
  setUser,
  clearAuth,
  clearAll,
  getCurrency,
  setCurrency
} = StorageService;

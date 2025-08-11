// Token Manager - Manejo automático de tokens JWT expirados
import { jwtDecode } from 'jwt-decode';
import { StorageService } from './storage';

interface JwtPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

export class TokenManager {
  private static instance: TokenManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 60000; // Verificar cada minuto
  private readonly REFRESH_THRESHOLD_MS = 300000; // Renovar 5 minutos antes de expirar

  private constructor() {
    this.startTokenCheck();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Verifica si un token JWT ha expirado
   */
  public isTokenExpired(token: string): boolean {
    if (!token || token === 'undefined' || token === 'null') {
      return true;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Token expirado si la fecha actual es mayor a la fecha de expiración
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return true;
    }
  }

  /**
   * Verifica si un token necesita ser renovado pronto
   */
  public shouldRefreshToken(token: string): boolean {
    if (!token || token === 'undefined' || token === 'null') {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
      
      // Renovar si queda menos del threshold configurado
      return timeUntilExpiry < this.REFRESH_THRESHOLD_MS && timeUntilExpiry > 0;
    } catch (error) {
      console.error('Error verificando si renovar token:', error);
      return false;
    }
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del token en milisegundos
   */
  public getTimeUntilExpiry(token: string): number {
    if (!token || token === 'undefined' || token === 'null') {
      return 0;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
      
      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      console.error('Error obteniendo tiempo de expiración:', error);
      return 0;
    }
  }

  /**
   * Inicia la verificación automática de tokens
   */
  private startTokenCheck(): void {
    if (typeof window === 'undefined') {
      return; // No ejecutar en el servidor
    }

    this.checkInterval = setInterval(() => {
      this.checkAndHandleTokens();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Verifica y maneja tokens expirados automáticamente
   */
  private checkAndHandleTokens(): void {
    const accessToken = StorageService.getAccessToken();
    const refreshToken = StorageService.getRefreshToken();

    if (!accessToken) {
      return;
    }

    // Si el access token ha expirado
    if (this.isTokenExpired(accessToken)) {
      console.log('Token de acceso expirado, limpiando datos...');
      this.handleExpiredToken();
      return;
    }

    // Si el access token necesita renovación y tenemos refresh token
    if (this.shouldRefreshToken(accessToken) && refreshToken && !this.isTokenExpired(refreshToken)) {
      console.log('Token necesita renovación, intentando refresh...');
      this.attemptTokenRefresh();
    }
  }

  /**
   * Maneja tokens expirados
   */
  private handleExpiredToken(): void {
    // Limpiar tokens del storage
    StorageService.clearAuth();

    // Mostrar mensaje al usuario
    if (typeof window !== 'undefined') {
      // Solo mostrar el mensaje si no estamos ya en la página de login
      if (!window.location.pathname.includes('/auth')) {
        alert('Tu sesión ha expirado. Serás redirigido al login.');
        window.location.href = '/auth';
      }
    }
  }

  /**
   * Intenta renovar el token usando el refresh token
   */
  private async attemptTokenRefresh(): Promise<void> {
    try {
      const refreshToken = StorageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch('https://finance-app-backend-drab.vercel.app/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Error renovando token: ${response.status}`);
      }

      const data = await response.json();
      const newAccessToken = data.data?.accessToken || data.data?.token;

      if (newAccessToken) {
        StorageService.setTokens(newAccessToken, data.data?.refreshToken || refreshToken);
        console.log('Token renovado exitosamente');
      } else {
        throw new Error('No se recibió nuevo token del servidor');
      }
    } catch (error) {
      console.error('Error renovando token:', error);
      this.handleExpiredToken();
    }
  }

  /**
   * Detiene la verificación automática de tokens
   */
  public stopTokenCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Verifica manualmente el estado de los tokens
   */
  public checkTokenStatus(): {
    hasAccessToken: boolean;
    accessTokenExpired: boolean;
    accessTokenNeedsRefresh: boolean;
    hasRefreshToken: boolean;
    refreshTokenExpired: boolean;
    timeUntilExpiry: number;
  } {
    const accessToken = StorageService.getAccessToken();
    const refreshToken = StorageService.getRefreshToken();

    return {
      hasAccessToken: !!accessToken,
      accessTokenExpired: accessToken ? this.isTokenExpired(accessToken) : true,
      accessTokenNeedsRefresh: accessToken ? this.shouldRefreshToken(accessToken) : false,
      hasRefreshToken: !!refreshToken,
      refreshTokenExpired: refreshToken ? this.isTokenExpired(refreshToken) : true,
      timeUntilExpiry: accessToken ? this.getTimeUntilExpiry(accessToken) : 0,
    };
  }
}

// Instancia singleton
export const tokenManager = TokenManager.getInstance();

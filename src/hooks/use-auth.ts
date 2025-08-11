// Hook personalizado para manejo de autenticación con Token Manager
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { tokenManager } from '@/lib/token-manager';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  tokenStatus: {
    hasAccessToken: boolean;
    accessTokenExpired: boolean;
    accessTokenNeedsRefresh: boolean;
    hasRefreshToken: boolean;
    refreshTokenExpired: boolean;
    timeUntilExpiry: number;
  };
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    tokenStatus: {
      hasAccessToken: false,
      accessTokenExpired: true,
      accessTokenNeedsRefresh: false,
      hasRefreshToken: false,
      refreshTokenExpired: true,
      timeUntilExpiry: 0,
    },
  });

  const checkAuthStatus = useCallback(() => {
    const accessToken = StorageService.getAccessToken();
    const user = StorageService.getAuthUser();
    const tokenStatus = tokenManager.checkTokenStatus();

    const isAuthenticated = !!(
      accessToken && 
      !tokenStatus.accessTokenExpired && 
      user
    );

    setAuthState({
      isAuthenticated,
      isLoading: false,
      user: isAuthenticated ? user : null,
      tokenStatus,
    });

    return isAuthenticated;
  }, []);

  const logout = useCallback(() => {
    StorageService.clearAuth();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      tokenStatus: {
        hasAccessToken: false,
        accessTokenExpired: true,
        accessTokenNeedsRefresh: false,
        hasRefreshToken: false,
        refreshTokenExpired: true,
        timeUntilExpiry: 0,
      },
    });
    router.push('/auth');
  }, [router]);

  const handleTokenExpiry = useCallback(() => {
    console.log('Token expirado detectado, cerrando sesión...');
    logout();
  }, [logout]);

  // Verificar estado de autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Verificar periódicamente el estado de los tokens
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenStatus = tokenManager.checkTokenStatus();
      
      if (authState.isAuthenticated && tokenStatus.accessTokenExpired) {
        handleTokenExpiry();
      } else {
        setAuthState(prev => ({
          ...prev,
          tokenStatus,
        }));
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, handleTokenExpiry]);

  // Escuchar cambios en el storage (para logout en otras pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        // Token fue eliminado en otra pestaña
        handleTokenExpiry();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleTokenExpiry]);

  return {
    ...authState,
    logout,
    checkAuthStatus,
    refreshTokenStatus: () => {
      const tokenStatus = tokenManager.checkTokenStatus();
      setAuthState(prev => ({ ...prev, tokenStatus }));
      return tokenStatus;
    },
  };
}

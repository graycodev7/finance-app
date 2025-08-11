// Componente de protección de rutas con manejo automático de tokens
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, tokenStatus } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || tokenStatus.accessTokenExpired) {
        // Redirigir al login si no está autenticado o el token expiró
        router.push('/auth');
      } else {
        setShowContent(true);
      }
    }
  }, [isAuthenticated, isLoading, tokenStatus.accessTokenExpired, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar fallback si no está autenticado
  if (!isAuthenticated || tokenStatus.accessTokenExpired) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Redirigiendo al login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Mostrar advertencia si el token necesita renovación pronto
  const timeUntilExpiryMinutes = Math.floor(tokenStatus.timeUntilExpiry / (1000 * 60));
  const showExpiryWarning = timeUntilExpiryMinutes > 0 && timeUntilExpiryMinutes <= 10;

  return (
    <>
      {showExpiryWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tu sesión expirará en {timeUntilExpiryMinutes} minuto{timeUntilExpiryMinutes !== 1 ? 's' : ''}. 
                Guarda tu trabajo para evitar perder datos.
              </p>
            </div>
          </div>
        </div>
      )}
      {showContent && children}
    </>
  );
}

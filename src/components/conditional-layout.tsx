"use client";

import { useAuth } from './auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppSidebar } from './app-sidebar';
import { Loader2 } from 'lucide-react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Public pages that don't require authentication
  const publicPages = ['/auth'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));

  // Protected pages that require authentication
  const protectedPages = ['/', '/settings', '/transactions', '/history'];
  const isProtectedPage = protectedPages.some(page => {
    if (page === '/') {
      // For root page, only match exactly
      return pathname === '/';
    }
    // For other pages, match exact or starts with
    return pathname === page || pathname.startsWith(page + '/');
  });

  // Handle redirections
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && isProtectedPage) {
        router.push('/auth');
      } else if (isAuthenticated && isPublicPage) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, isProtectedPage, isPublicPage, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users from protected pages
  if (!isAuthenticated && isProtectedPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting authenticated users from public pages (prevents flash)
  if (isAuthenticated && isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  // Public pages (auth pages) - show full-width layout only for unauthenticated users
  if (isPublicPage && !isAuthenticated) {
    return <main className="flex-1 overflow-auto">{children}</main>;
  }

  // Authenticated user on protected pages - show sidebar layout
  if (isAuthenticated && isProtectedPage) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  // Fallback for any other pages
  return <main className="flex-1 overflow-auto">{children}</main>;
}

"use client";

import { useAuth } from './auth-provider';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './app-sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Pages that should not show sidebar (even when authenticated)
  const noSidebarPages = ['/auth'];
  const shouldHideSidebar = noSidebarPages.includes(pathname);

  // If loading, show children without sidebar
  if (isLoading) {
    return <main className="flex-1 overflow-auto">{children}</main>;
  }

  // If not authenticated or on auth pages, show full-width layout
  if (!isAuthenticated || shouldHideSidebar) {
    return <main className="flex-1 overflow-auto">{children}</main>;
  }

  // Authenticated user on regular pages - show sidebar layout
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

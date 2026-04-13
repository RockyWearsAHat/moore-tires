import type { ReactNode } from 'react';
import { useDashboardAuth } from '../context/DashboardAuthContext';
import { LoginPage } from '../pages/Login';
import type { UserRole } from '@moore-tires/shared';

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, user must have one of these roles. */
  allowedRoles?: UserRole[];
}

/**
 * Zero-trust route guard.
 * - Shows loader while auth state initializes.
 * - Redirects unauthenticated users to the login page (inline, not a redirect).
 * - Rejects users whose role doesn't match allowedRoles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useDashboardAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
        <div className="card max-w-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold uppercase text-gray-100">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your role does not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

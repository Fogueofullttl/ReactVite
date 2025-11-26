import { ReactNode } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@shared/schema';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific roles
 *
 * @param children - The component to render if authorized
 * @param allowedRoles - Array of roles that can access this route (optional)
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  // Check if specific roles are required
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to appropriate dashboard
      if (user) {
        // Authenticated but wrong role
        return <Redirect to={getRoleBasedRedirect(user.role)} />;
      } else {
        // Not authenticated
        return <Redirect to="/login" />;
      }
    }
  }

  // User is authorized
  return <>{children}</>;
}

/**
 * Get the appropriate dashboard URL based on user role
 */
function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case 'owner':
      return '/owner/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'arbitro':
      return '/arbitro/dashboard';
    case 'jugador':
      return '/jugador/dashboard';
    case 'publico':
    default:
      return '/';
  }
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: UserRole | UserRole[]): boolean {
  const { user } = useAuth();

  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Hook to check if user is admin or owner
 */
export function useIsAdmin(): boolean {
  return useHasRole(['admin', 'owner']);
}

/**
 * Hook to check if user is owner
 */
export function useIsOwner(): boolean {
  return useHasRole('owner');
}

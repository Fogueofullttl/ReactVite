import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@shared/schema';

export interface AppUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  memberNumber?: string;
  birthYear?: number;
  rating?: number;
  photoURL?: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');

    // For now, we just mark as not loading
    // In a full implementation, you'd verify the token with the server
    // and restore the user state
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call server-side login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to sign in"
        };
      }

      // Create app user from response
      const appUser: AppUser = {
        id: data.user.uid,
        firebaseUid: data.user.firebaseUid,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        memberNumber: data.user.memberNumber,
        birthYear: data.user.birthYear,
        rating: data.user.rating,
        photoURL: data.user.photoURL,
      };

      setUser(appUser);

      // Store tokens in sessionStorage for session persistence
      if (data.idToken) {
        sessionStorage.setItem('authToken', data.idToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to sign in"
        };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear session storage
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');

      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        throw new AuthError(`Failed to sign out: ${error.message}`);
      }
      throw new AuthError("Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

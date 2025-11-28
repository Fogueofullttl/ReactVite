import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getUserProfile } from '@/lib/firebaseHelpers';
import type { User, UserRole } from '@shared/schema';

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
  firebaseUser: FirebaseUser | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await getUserProfile(fbUser.uid);

          if (userProfile) {
            const appUser: AppUser = {
              id: userProfile.uid,
              firebaseUid: fbUser.uid,
              email: userProfile.email,
              name: userProfile.displayName,
              role: userProfile.role,
              memberNumber: userProfile.memberNumber,
              birthYear: userProfile.birthYear,
              rating: userProfile.rating,
              photoURL: userProfile.photoURL,
            };

            setUser(appUser);
          } else {
            // Profile not found - user needs to complete registration
            setUser(null);
            throw new AuthError("User profile not found in database");
          }
        } catch (error) {
          setUser(null);
          throw error;
        }
      } else {
        // User not authenticated
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Get user profile from Firestore
      const userProfile = await getUserProfile(userCredential.user.uid);

      if (!userProfile) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: "User profile not found. Please contact support."
        };
      }

      const appUser: AppUser = {
        id: userProfile.uid,
        firebaseUid: userCredential.user.uid,
        email: userProfile.email,
        name: userProfile.displayName,
        role: userProfile.role,
        memberNumber: userProfile.memberNumber,
        birthYear: userProfile.birthYear,
        rating: userProfile.rating,
        photoURL: userProfile.photoURL,
      };

      setUser(appUser);
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
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
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
      firebaseUser,
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

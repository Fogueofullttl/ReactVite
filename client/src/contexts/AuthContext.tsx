import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/lib/firebaseHelpers';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'arbitro' | 'jugador' | 'publico';
  memberNumber?: string;
  birthYear?: number;
  rating?: number;
  photoURL?: string;
}

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listener para cambios en autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado, obtener perfil desde Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        if (userProfile) {
          const mockUser: MockUser = {
            id: userProfile.uid,
            email: userProfile.email,
            name: userProfile.displayName,
            role: userProfile.role,
            memberNumber: userProfile.memberNumber,
            birthYear: userProfile.birthYear,
            rating: userProfile.rating,
            photoURL: userProfile.photoURL,
          };
          
          setUser(mockUser);
          
          // Guardar en localStorage para compatibilidad con código existente
          localStorage.setItem('fptm_user', JSON.stringify(mockUser));
          localStorage.setItem('fptm_role', mockUser.role);
        } else {
          // Perfil no encontrado en Firestore
          console.error("Perfil de usuario no encontrado en Firestore");
          setUser(null);
          localStorage.removeItem('fptm_user');
          localStorage.removeItem('fptm_role');
        }
      } else {
        // Usuario no autenticado
        setUser(null);
        localStorage.removeItem('fptm_user');
        localStorage.removeItem('fptm_role');
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Obtener perfil desde Firestore
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      if (userProfile) {
        const mockUser: MockUser = {
          id: userProfile.uid,
          email: userProfile.email,
          name: userProfile.displayName,
          role: userProfile.role,
          memberNumber: userProfile.memberNumber,
          birthYear: userProfile.birthYear,
          rating: userProfile.rating,
          photoURL: userProfile.photoURL,
        };
        
        setUser(mockUser);
        localStorage.setItem('fptm_user', JSON.stringify(mockUser));
        localStorage.setItem('fptm_role', mockUser.role);
        
        return true;
      } else {
        console.error("Perfil de usuario no encontrado");
        return false;
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem('fptm_user');
      localStorage.removeItem('fptm_role');
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
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

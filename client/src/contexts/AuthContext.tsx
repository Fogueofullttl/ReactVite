import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'arbitro' | 'jugador' | 'publico';
  memberNumber?: string;
  birthYear?: number;
  rating?: number;
}

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, MockUser> = {
  "admin@fptm.pr": {
    id: "admin-001",
    email: "admin@fptm.pr",
    name: "Admin FPTM",
    role: "admin",
    memberNumber: "PRTTM-000001"
  },
  "arbitro@fptm.pr": {
    id: "arbitro-001",
    email: "arbitro@fptm.pr",
    name: "Carlos Arbitro",
    role: "arbitro",
    memberNumber: "PRTTM-000010"
  },
  "jugador@fptm.pr": {
    id: "user1",
    email: "jugador@fptm.pr",
    name: "Carlos Rivera",
    role: "jugador",
    memberNumber: "PRTTM-001234",
    birthYear: 1995,
    rating: 1850
  },
  "owner@fptm.pr": {
    id: "owner-001",
    email: "owner@fptm.pr",
    name: "Owner FPTM",
    role: "owner",
    memberNumber: "PRTTM-000000"
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('fptm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string, role: string): boolean => {
    const foundUser = mockUsers[email];
    
    if (foundUser && foundUser.role === role) {
      setUser(foundUser);
      localStorage.setItem('fptm_user', JSON.stringify(foundUser));
      localStorage.setItem('fptm_role', foundUser.role);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fptm_user');
    localStorage.removeItem('fptm_role');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
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

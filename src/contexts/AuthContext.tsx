import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockAuth, User } from '@/lib/mockAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, role: 'owner' | 'borrower', location: string) => Promise<{ error: string | null }>;
  logout: () => void;
  updatePoints: (points: number) => void;
  updateProfile: (name: string, location: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = mockAuth.getSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedUser, error } = await mockAuth.login(email, password);
    if (loggedUser) {
      setUser(loggedUser);
    }
    return { error };
  };

  const signup = async (email: string, password: string, name: string, role: 'owner' | 'borrower', location: string) => {
    const { user: newUser, error } = await mockAuth.signup(email, password, name, role, location);
    if (newUser) {
      setUser(newUser);
    }
    return { error };
  };

  const logout = () => {
    mockAuth.logout();
    setUser(null);
  };

  const updatePoints = (points: number) => {
    if (user) {
      mockAuth.updateUserPoints(user.id, points);
      setUser({ ...user, points });
    }
  };

  const updateProfile = (name: string, location: string) => {
    if (user) {
      mockAuth.updateUserProfile(user.id, name, location);
      setUser({ ...user, name, location });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updatePoints, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

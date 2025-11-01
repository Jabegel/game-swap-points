import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  location: string;
  points: number;
  role: 'owner' | 'borrower';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, role: 'owner' | 'borrower', location: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updatePoints: (points: number) => Promise<void>;
  updateProfile: (name: string, location: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (profileData && roleData) {
      setProfile({
        id: profileData.id,
        name: profileData.name,
        location: profileData.location,
        points: profileData.points,
        role: roleData.role as 'owner' | 'borrower',
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error?.message ?? null };
  };

  const signup = async (email: string, password: string, name: string, role: 'owner' | 'borrower', location: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role,
          location,
        },
      },
    });
    
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updatePoints = async (points: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ points })
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, points });
    }
  };

  const updateProfile = async (name: string, location: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ name, location })
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, name, location });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, signup, logout, updatePoints, updateProfile }}>
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

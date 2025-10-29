export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  role: 'owner' | 'borrower' | 'admin';
  location: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

const USERS_KEY = 'gameShare_users';
const SESSION_KEY = 'gameShare_session';

export const mockAuth = {
  signup: async (email: string, password: string, name: string, role: 'owner' | 'borrower', location: string): Promise<{ user: User | null; error: string | null }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return { user: null, error: 'Usuário já existe' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      points: 50,
      role,
      location,
      createdAt: new Date().toISOString()
    };

    users.push({ ...newUser, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session: AuthSession = {
      user: newUser,
      token: crypto.randomUUID()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { user: newUser, error: null };
  },

  login: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        return { user: null, error: 'Email ou senha incorretos' };
      }

      const { password: _, ...userWithoutPassword } = user;
      const session: AuthSession = {
        user: userWithoutPassword,
        token: crypto.randomUUID()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { user: userWithoutPassword, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: 'Erro ao fazer login. Tente novamente.' };
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): AuthSession | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  updateUserPoints: (userId: string, points: number) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].points = points;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const session = mockAuth.getSession();
      if (session && session.user.id === userId) {
        session.user.points = points;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
  },

  updateUserProfile: (userId: string, name: string, location: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].name = name;
      users[userIndex].location = location;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const session = mockAuth.getSession();
      if (session && session.user.id === userId) {
        session.user.name = name;
        session.user.location = location;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
  }
};

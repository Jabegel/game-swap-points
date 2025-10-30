export interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  ownerId: string;
  ownerName: string;
  status: 'available' | 'borrowed';
  imageUrl?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  gameId: string;
  gameName: string;
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  ownerName: string;
  cost: number;
  status: 'active' | 'returned';
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'loan' | 'return' | 'penalty' | 'signup_bonus';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Penalty {
  id: string;
  loanId: string;
  borrowerId: string;
  ownerId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

const GAMES_KEY = 'gameShare_games';
const LOANS_KEY = 'gameShare_loans';
const TRANSACTIONS_KEY = 'gameShare_transactions';
const PENALTIES_KEY = 'gameShare_penalties';

// Seed de jogos de exemplo
const seedGames = () => {
  const games = mockDb.getGames();
  if (games.length === 0) {
    const demoGames: Game[] = [
      {
        id: crypto.randomUUID(),
        name: 'Catan',
        description: 'Jogo de estratégia onde você constrói assentamentos e cidades em uma ilha.',
        category: 'Estratégia',
        cost: 5,
        ownerId: 'demo-user-1',
        ownerName: 'João Silva',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Ticket to Ride',
        description: 'Construa rotas de trem através da América do Norte neste jogo de estratégia.',
        category: 'Estratégia',
        cost: 4,
        ownerId: 'demo-user-2',
        ownerName: 'Maria Santos',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Pandemic',
        description: 'Jogo cooperativo onde a equipe trabalha junta para salvar a humanidade de doenças mortais.',
        category: 'Cooperativo',
        cost: 6,
        ownerId: 'demo-user-3',
        ownerName: 'Pedro Costa',
        status: 'borrowed',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: '7 Wonders',
        description: 'Construa uma das grandes civilizações do mundo antigo.',
        category: 'Estratégia',
        cost: 5,
        ownerId: 'demo-user-4',
        ownerName: 'Ana Lima',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Carcassonne',
        description: 'Construa a paisagem medieval da França com peças de território.',
        category: 'Estratégia',
        cost: 4,
        ownerId: 'demo-user-5',
        ownerName: 'Carlos Mendes',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Azul',
        description: 'Jogo de estratégia abstrato sobre azulejos decorativos portugueses.',
        category: 'Abstrato',
        cost: 5,
        ownerId: 'demo-user-6',
        ownerName: 'Juliana Rocha',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Splendor',
        description: 'Comerciante de pedras preciosas da Renascença em busca de prestígio.',
        category: 'Estratégia',
        cost: 3,
        ownerId: 'demo-user-7',
        ownerName: 'Rafael Souza',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Dixit',
        description: 'Jogo de imaginação e criatividade com belas ilustrações.',
        category: 'Party',
        cost: 4,
        ownerId: 'demo-user-8',
        ownerName: 'Beatriz Oliveira',
        status: 'available',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(GAMES_KEY, JSON.stringify(demoGames));
  }
};

// Seed de usuários demo no mockAuth
const seedDemoUsers = () => {
  const USERS_KEY = 'gameShare_users';
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (!users.find((u: any) => u.id === 'demo-user-1')) {
    const demoUsers = [
      { id: 'demo-user-1', email: 'joao@demo.com', password: 'demo123', name: 'João Silva', location: 'São Paulo, SP', points: 100, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-2', email: 'maria@demo.com', password: 'demo123', name: 'Maria Santos', location: 'Rio de Janeiro, RJ', points: 80, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-3', email: 'pedro@demo.com', password: 'demo123', name: 'Pedro Costa', location: 'Belo Horizonte, MG', points: 90, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-4', email: 'ana@demo.com', password: 'demo123', name: 'Ana Lima', location: 'Curitiba, PR', points: 75, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-5', email: 'carlos@demo.com', password: 'demo123', name: 'Carlos Mendes', location: 'Porto Alegre, RS', points: 85, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-6', email: 'juliana@demo.com', password: 'demo123', name: 'Juliana Rocha', location: 'Brasília, DF', points: 95, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-7', email: 'rafael@demo.com', password: 'demo123', name: 'Rafael Souza', location: 'Salvador, BA', points: 70, role: 'owner', createdAt: new Date().toISOString() },
      { id: 'demo-user-8', email: 'beatriz@demo.com', password: 'demo123', name: 'Beatriz Oliveira', location: 'Fortaleza, CE', points: 88, role: 'owner', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, ...demoUsers]));
  }
};

// Inicializar dados demo
export const initializeDemoData = () => {
  seedDemoUsers();
  seedGames();
};

export const mockDb = {
  // Games
  getGames: (): Game[] => {
    return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
  },

  addGame: (game: Omit<Game, 'id' | 'createdAt' | 'status'>): Game => {
    const games = mockDb.getGames();
    const newGame: Game = {
      ...game,
      id: crypto.randomUUID(),
      status: 'available',
      createdAt: new Date().toISOString()
    };
    games.push(newGame);
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    return newGame;
  },

  updateGameStatus: (gameId: string, status: 'available' | 'borrowed') => {
    const games = mockDb.getGames();
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex !== -1) {
      games[gameIndex].status = status;
      localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    }
  },

  // Loans
  getLoans: (): Loan[] => {
    return JSON.parse(localStorage.getItem(LOANS_KEY) || '[]');
  },

  createLoan: (loan: Omit<Loan, 'id' | 'borrowedAt' | 'status' | 'dueDate'>): Loan => {
    const loans = mockDb.getLoans();
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
    
    const newLoan: Loan = {
      ...loan,
      id: crypto.randomUUID(),
      status: 'active',
      borrowedAt: borrowDate.toISOString(),
      dueDate: dueDate.toISOString()
    };
    loans.push(newLoan);
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    return newLoan;
  },

  returnLoan: (loanId: string) => {
    const loans = mockDb.getLoans();
    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex !== -1) {
      loans[loanIndex].status = 'returned';
      loans[loanIndex].returnedAt = new Date().toISOString();
      localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    }
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  },

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = mockDb.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction;
  },

  // Penalties
  getPenalties: (): Penalty[] => {
    return JSON.parse(localStorage.getItem(PENALTIES_KEY) || '[]');
  },

  addPenalty: (penalty: Omit<Penalty, 'id' | 'createdAt'>): Penalty => {
    const penalties = mockDb.getPenalties();
    const newPenalty: Penalty = {
      ...penalty,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    penalties.push(newPenalty);
    localStorage.setItem(PENALTIES_KEY, JSON.stringify(penalties));
    return newPenalty;
  }
};

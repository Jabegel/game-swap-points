export interface Game {
  id: string;
  name: string;
  description: string;
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

  createLoan: (loan: Omit<Loan, 'id' | 'borrowedAt' | 'status'>): Loan => {
    const loans = mockDb.getLoans();
    const newLoan: Loan = {
      ...loan,
      id: crypto.randomUUID(),
      status: 'active',
      borrowedAt: new Date().toISOString()
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

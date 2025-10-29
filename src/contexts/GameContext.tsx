import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockDb, Game, Loan, Transaction, Penalty } from '@/lib/mockDb';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface GameContextType {
  games: Game[];
  loans: Loan[];
  transactions: Transaction[];
  penalties: Penalty[];
  addGame: (game: Omit<Game, 'id' | 'createdAt' | 'status' | 'ownerId' | 'ownerName' | 'imageUrl'>) => void;
  borrowGame: (gameId: string) => Promise<boolean>;
  returnGame: (loanId: string) => void;
  applyPenalty: (loanId: string, amount: number, reason: string) => void;
  refreshData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user, updatePoints } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);

  const refreshData = () => {
    setGames(mockDb.getGames());
    setLoans(mockDb.getLoans());
    setTransactions(mockDb.getTransactions());
    setPenalties(mockDb.getPenalties());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addGame = (gameData: Omit<Game, 'id' | 'createdAt' | 'status' | 'ownerId' | 'ownerName' | 'imageUrl'>) => {
    if (!user) return;
    
    const newGame = mockDb.addGame({
      ...gameData,
      ownerId: user.id,
      ownerName: user.name
    });
    
    refreshData();
    toast({
      title: 'Jogo cadastrado!',
      description: `${newGame.name} foi adicionado com sucesso.`
    });
  };

  const borrowGame = async (gameId: string): Promise<boolean> => {
    if (!user) return false;

    const game = games.find(g => g.id === gameId);
    if (!game || game.status === 'borrowed') {
      toast({
        title: 'Erro',
        description: 'Jogo não disponível.',
        variant: 'destructive'
      });
      return false;
    }

    if (user.points < game.cost) {
      toast({
        title: 'Pontos insuficientes',
        description: `Você precisa de ${game.cost} pontos para pegar este jogo emprestado.`,
        variant: 'destructive'
      });
      return false;
    }

    if (user.points < 0) {
      toast({
        title: 'Saldo negativo',
        description: 'Você está bloqueado. Regularize seu saldo antes de novos empréstimos.',
        variant: 'destructive'
      });
      return false;
    }

    // Create loan
    const newLoan = mockDb.createLoan({
      gameId: game.id,
      gameName: game.name,
      borrowerId: user.id,
      borrowerName: user.name,
      ownerId: game.ownerId,
      ownerName: game.ownerName,
      cost: game.cost
    });

    // Update game status
    mockDb.updateGameStatus(gameId, 'borrowed');

    // Create transactions
    mockDb.addTransaction({
      userId: user.id,
      type: 'loan',
      amount: -game.cost,
      description: `Empréstimo: ${game.name}`
    });

    mockDb.addTransaction({
      userId: game.ownerId,
      type: 'loan',
      amount: game.cost,
      description: `Empréstimo do seu jogo: ${game.name}`
    });

    // Update points
    updatePoints(user.points - game.cost);

    refreshData();
    
    toast({
      title: 'Empréstimo confirmado!',
      description: `Você pegou emprestado ${game.name} por ${game.cost} pontos.`
    });

    return true;
  };

  const returnGame = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    mockDb.returnLoan(loanId);
    mockDb.updateGameStatus(loan.gameId, 'available');

    refreshData();

    toast({
      title: 'Jogo devolvido',
      description: `${loan.gameName} foi devolvido com sucesso.`
    });
  };

  const applyPenalty = (loanId: string, amount: number, reason: string) => {
    if (!user) return;

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    mockDb.addPenalty({
      loanId,
      borrowerId: loan.borrowerId,
      ownerId: user.id,
      amount,
      reason
    });

    mockDb.addTransaction({
      userId: loan.borrowerId,
      type: 'penalty',
      amount: -amount,
      description: `Penalidade: ${reason}`
    });

    mockDb.addTransaction({
      userId: user.id,
      type: 'penalty',
      amount: amount,
      description: `Penalidade aplicada em ${loan.borrowerName}`
    });

    refreshData();

    toast({
      title: 'Penalidade aplicada',
      description: `Penalidade de ${amount} pontos aplicada.`
    });
  };

  return (
    <GameContext.Provider value={{ 
      games, 
      loans, 
      transactions, 
      penalties, 
      addGame, 
      borrowGame, 
      returnGame, 
      applyPenalty,
      refreshData 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};

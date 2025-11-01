import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Game {
  id: string;
  title: string;
  platform: string;
  category: string;
  condition: string;
  daily_value: number;
  status: 'available' | 'borrowed';
  owner_id: string;
  image_url: string | null;
  created_at: string;
  owner_name?: string;
}

export interface Loan {
  id: string;
  game_id: string;
  borrower_id: string;
  owner_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'active' | 'returned' | 'overdue';
  daily_cost: number;
  game_title?: string;
  borrower_name?: string;
  owner_name?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'penalty';
  amount: number;
  description: string;
  loan_id: string | null;
  created_at: string;
}

export interface Penalty {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

interface GameContextType {
  games: Game[];
  loans: Loan[];
  transactions: Transaction[];
  penalties: Penalty[];
  loading: boolean;
  addGame: (game: Omit<Game, 'id' | 'created_at' | 'status' | 'owner_id' | 'image_url'>) => Promise<void>;
  borrowGame: (gameId: string) => Promise<boolean>;
  returnGame: (loanId: string) => Promise<void>;
  applyPenalty: (loanId: string, amount: number, reason: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, updatePoints } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch games with owner profile
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          profiles!games_owner_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch loans with related data
      const { data: loansData } = await supabase
        .from('loans')
        .select(`
          *,
          games(title),
          borrower:profiles!loans_borrower_id_fkey(name),
          owner:profiles!loans_owner_id_fkey(name)
        `)
        .or(`borrower_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('borrowed_at', { ascending: false });

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch penalties
      const { data: penaltiesData } = await supabase
        .from('penalties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setGames((gamesData || []).map((g: any) => ({
        ...g,
        owner_name: g.profiles?.name
      })));

      setLoans((loansData || []).map((l: any) => ({
        ...l,
        game_title: l.games?.title,
        borrower_name: l.borrower?.name,
        owner_name: l.owner?.name
      })));

      setTransactions((transactionsData || []) as Transaction[]);
      setPenalties(penaltiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const addGame = async (gameData: Omit<Game, 'id' | 'created_at' | 'status' | 'owner_id' | 'image_url'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        title: gameData.title,
        platform: gameData.platform,
        category: gameData.category,
        condition: gameData.condition,
        daily_value: gameData.daily_value,
        owner_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o jogo.',
        variant: 'destructive'
      });
      return;
    }

    await refreshData();
    toast({
      title: 'Jogo cadastrado!',
      description: `${gameData.title} foi adicionado com sucesso.`
    });
  };

  const borrowGame = async (gameId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    const game = games.find(g => g.id === gameId);
    if (!game || game.status === 'borrowed') {
      toast({
        title: 'Erro',
        description: 'Jogo não disponível.',
        variant: 'destructive'
      });
      return false;
    }

    if (profile.points < game.daily_value) {
      toast({
        title: 'Pontos insuficientes',
        description: `Você precisa de ${game.daily_value} pontos para pegar este jogo emprestado.`,
        variant: 'destructive'
      });
      return false;
    }

    if (profile.points < 0) {
      toast({
        title: 'Saldo negativo',
        description: 'Você está bloqueado. Regularize seu saldo antes de novos empréstimos.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Create loan (7 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const { error: loanError } = await supabase
        .from('loans')
        .insert({
          game_id: gameId,
          borrower_id: user.id,
          owner_id: game.owner_id,
          due_date: dueDate.toISOString(),
          daily_cost: game.daily_value
        });

      if (loanError) throw loanError;

      // Update game status
      const { error: gameError } = await supabase
        .from('games')
        .update({ status: 'borrowed' })
        .eq('id', gameId);

      if (gameError) throw gameError;

      // Create transactions
      await supabase.from('transactions').insert([
        {
          user_id: user.id,
          type: 'spend',
          amount: -game.daily_value,
          description: `Empréstimo: ${game.title}`,
          loan_id: null
        },
        {
          user_id: game.owner_id,
          type: 'earn',
          amount: game.daily_value,
          description: `Empréstimo do seu jogo: ${game.title}`,
          loan_id: null
        }
      ]);

      // Update points
      await updatePoints(profile.points - game.daily_value);

      await refreshData();
      
      toast({
        title: 'Empréstimo confirmado!',
        description: `Você pegou emprestado ${game.title} por ${game.daily_value} pontos.`
      });

      return true;
    } catch (error) {
      console.error('Error borrowing game:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar o empréstimo.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const returnGame = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    try {
      // Update loan status
      await supabase
        .from('loans')
        .update({ 
          status: 'returned',
          returned_at: new Date().toISOString()
        })
        .eq('id', loanId);

      // Update game status
      await supabase
        .from('games')
        .update({ status: 'available' })
        .eq('id', loan.game_id);

      await refreshData();

      toast({
        title: 'Jogo devolvido',
        description: `${loan.game_title} foi devolvido com sucesso.`
      });
    } catch (error) {
      console.error('Error returning game:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível devolver o jogo.',
        variant: 'destructive'
      });
    }
  };

  const applyPenalty = async (loanId: string, amount: number, reason: string) => {
    if (!user) return;

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    try {
      // Add penalty
      await supabase
        .from('penalties')
        .insert({
          loan_id: loanId,
          user_id: loan.borrower_id,
          amount,
          reason
        });

      // Create transactions
      await supabase.from('transactions').insert([
        {
          user_id: loan.borrower_id,
          type: 'penalty',
          amount: -amount,
          description: `Penalidade: ${reason}`,
          loan_id: loanId
        },
        {
          user_id: user.id,
          type: 'earn',
          amount: amount,
          description: `Penalidade aplicada`,
          loan_id: loanId
        }
      ]);

      await refreshData();

      toast({
        title: 'Penalidade aplicada',
        description: `Penalidade de ${amount} pontos aplicada.`
      });
    } catch (error) {
      console.error('Error applying penalty:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aplicar a penalidade.',
        variant: 'destructive'
      });
    }
  };

  return (
    <GameContext.Provider value={{ 
      games, 
      loans, 
      transactions, 
      penalties,
      loading,
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

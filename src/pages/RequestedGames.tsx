import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, MapPin, User, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/contexts/GameContext";
import { supabase } from "@/integrations/supabase/client";

const RequestedGames = () => {
  const { user } = useAuth();
  const { loans, games } = useGames();
  const [requestedGames, setRequestedGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequestedGames = async () => {
      if (user && loans.length > 0) {
        // Get loans for current user
        const userLoans = loans.filter(loan => loan.borrower_id === user.id);
        
        // Match with games and get owner info
        const gamesWithDetails = await Promise.all(
          userLoans.map(async (loan) => {
            const game = games.find(g => g.id === loan.game_id);
            
            // Fetch owner profile
            let owner = null;
            if (game) {
              const { data: ownerData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', game.owner_id)
                .single();
              
              owner = ownerData;
            }
            
            return {
              ...loan,
              game,
              owner
            };
          })
        );
        
        setRequestedGames(gamesWithDetails);
      }
    };
    
    fetchRequestedGames();
  }, [user, loans, games]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">Você precisa estar logado para ver seus jogos solicitados.</p>
              <Link to="/login">
                <Button>Fazer Login</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meus Jogos Solicitados</h1>
          <p className="text-muted-foreground">
            Acompanhe os jogos que você solicitou e seu status
          </p>
        </div>

        {requestedGames.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum jogo solicitado</h3>
              <p className="text-muted-foreground mb-6">
                Explore nosso catálogo e solicite jogos para emprestar!
              </p>
              <Link to="/games">
                <Button variant="hero">
                  Ver Jogos Disponíveis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {requestedGames.map((item) => (
              <Card key={item.id} className="hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{item.game?.title}</CardTitle>
                      <Badge
                        className={
                          item.status === 'active'
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {item.status === 'active' ? 'Em andamento' : 'Devolvido'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-accent">
                      <Coins className="h-5 w-5" />
                      <span>{item.game?.daily_value} pts</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.owner && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Proprietário</h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{item.owner.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{item.owner.location || "Localização não informada"}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Detalhes do Empréstimo</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Solicitado em: {new Date(item.borrowed_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {item.returned_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Devolvido em: {new Date(item.returned_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestedGames;

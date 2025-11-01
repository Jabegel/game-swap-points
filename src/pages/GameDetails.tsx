import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, MapPin, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { games, borrowGame } = useGames();
  const [game, setGame] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      const foundGame = games.find(g => g.id === id);
      if (foundGame) {
        setGame(foundGame);
        
        // Fetch owner profile
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', foundGame.owner_id)
          .single();
        
        if (ownerData) {
          setOwner(ownerData);
        }
      }
    };
    
    fetchGameDetails();
  }, [id, games]);

  const handleBorrowRequest = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para solicitar jogos.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    if (!game) return;

    const success = await borrowGame(game.id);
    
    if (success) {
      toast({
        title: "Solicitação enviada!",
        description: "O jogo foi adicionado aos seus empréstimos."
      });
      navigate("/my-loans");
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <p className="text-center text-muted-foreground">Jogo não encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/games")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos jogos
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Game Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {game.image_url ? (
              <img
                src={game.image_url}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-9xl">🎲</span>
              </div>
            )}
            <Badge
              className={`absolute top-4 right-4 ${
                game.status === 'available'
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {game.status === 'available' ? "Disponível" : "Emprestado"}
            </Badge>
          </div>

          {/* Game Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
              <div className="flex items-center gap-2 text-2xl font-semibold text-accent">
                <Coins className="h-6 w-6" />
                <span>{game.daily_value} pontos</span>
              </div>
            </div>

            {/* Owner Information */}
            {owner && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Proprietário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>{owner.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{owner.location || "Localização não informada"}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            {game.status === 'available' && (
              <Button 
                onClick={handleBorrowRequest}
                className="w-full"
                size="lg"
                variant="hero"
              >
                Eu Quero Este Jogo
              </Button>
            )}

            {game.status === 'borrowed' && (
              <Button 
                disabled
                className="w-full"
                size="lg"
                variant="outline"
              >
                Jogo Indisponível
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetails;

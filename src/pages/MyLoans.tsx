import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";
import { Calendar, Coins, User, Package, CheckCircle } from "lucide-react";

const MyLoans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, games, returnGame } = useGames();

  if (!user) {
    navigate("/login");
    return null;
  }

  // Loans where user is the borrower
  const myBorrowedLoans = loans.filter(loan => loan.borrowerId === user.id);

  // Loans where user is the owner
  const myLentLoans = loans.filter(loan => loan.ownerId === user.id);

  const handleReturnGame = (loanId: string) => {
    returnGame(loanId);
    toast({
      title: "Jogo devolvido!",
      description: "O jogo foi marcado como devolvido."
    });
  };

  const LoanCard = ({ loan, isOwner }: { loan: any; isOwner: boolean }) => {
    const game = games.find(g => g.id === loan.gameId);
    const daysAgo = Math.floor(
      (Date.now() - new Date(loan.borrowedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{loan.gameName}</CardTitle>
              <CardDescription>
                {isOwner ? (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Emprestado para: {loan.borrowerName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Proprietário: {loan.ownerName}
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
              {loan.status === 'active' ? 'Ativo' : 'Devolvido'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span>Custo</span>
              </div>
              <p className="text-lg font-semibold">{loan.cost} pontos</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Emprestado há</span>
              </div>
              <p className="text-lg font-semibold">{daysAgo} dias</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data do empréstimo</p>
            <p className="font-medium">
              {new Date(loan.borrowedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {loan.returnedAt && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Data de devolução</p>
              <p className="font-medium">
                {new Date(loan.returnedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {loan.status === 'active' && (
            <Button
              onClick={() => handleReturnGame(loan.id)}
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Devolvido
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Empréstimos</h1>
            <p className="text-muted-foreground">
              Gerencie seus jogos emprestados e empréstimos ativos
            </p>
          </div>

          <Tabs defaultValue="borrowed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="borrowed">
                <Package className="h-4 w-4 mr-2" />
                Jogos que Peguei ({myBorrowedLoans.length})
              </TabsTrigger>
              <TabsTrigger value="lent">
                <User className="h-4 w-4 mr-2" />
                Jogos que Emprestei ({myLentLoans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="borrowed" className="space-y-4">
              {myBorrowedLoans.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você ainda não pegou nenhum jogo emprestado
                    </p>
                    <Button onClick={() => navigate("/games")}>
                      Explorar Jogos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myBorrowedLoans.map(loan => (
                  <LoanCard key={loan.id} loan={loan} isOwner={false} />
                ))
              )}
            </TabsContent>

            <TabsContent value="lent" className="space-y-4">
              {myLentLoans.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum dos seus jogos está emprestado no momento
                    </p>
                    <Button onClick={() => navigate("/games")} variant="outline">
                      Ver Meus Jogos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myLentLoans.map(loan => (
                  <LoanCard key={loan.id} loan={loan} isOwner={true} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyLoans;

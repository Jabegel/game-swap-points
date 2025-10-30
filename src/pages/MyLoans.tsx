import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";
import { Calendar, Coins, User, Package, CheckCircle, Plus } from "lucide-react";

const CATEGORIES = [
  'Estratégia',
  'Party',
  'Cooperativo',
  'Abstrato',
  'Familiar',
  'Eurogame',
  'Aventura',
  'Cartas',
  'Outro'
];

const MyLoans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, games, returnGame, addGame } = useGames();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost: ''
  });

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

  const handleAddGame = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do jogo é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Erro",
        description: "A categoria é obrigatória.",
        variant: "destructive"
      });
      return;
    }
    
    const cost = parseInt(formData.cost);
    if (!cost || cost < 1) {
      toast({
        title: "Erro",
        description: "O custo deve ser um número maior que 0.",
        variant: "destructive"
      });
      return;
    }

    addGame({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cost: cost
    });

    setFormData({ name: '', description: '', category: '', cost: '' });
    setIsDialogOpen(false);
  };

  const myGames = games.filter(game => game.ownerId === user?.id);

  const LoanCard = ({ loan, isOwner }: { loan: any; isOwner: boolean }) => {
    const game = games.find(g => g.id === loan.gameId);
    const daysAgo = Math.floor(
      (Date.now() - new Date(loan.borrowedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
    const isOverdue = dueDate && loan.status === 'active' && Date.now() > dueDate.getTime();
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

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

          {dueDate && loan.status === 'active' && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Prazo de devolução</p>
              <div className="flex items-center gap-2">
                <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {dueDate.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {isOverdue ? (
                  <Badge variant="destructive">Atrasado</Badge>
                ) : daysUntilDue !== null && daysUntilDue <= 3 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    {daysUntilDue} {daysUntilDue === 1 ? 'dia restante' : 'dias restantes'}
                  </Badge>
                )}
              </div>
            </div>
          )}

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
              {/* Add Game Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Novo Jogo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Jogo para Empréstimo</DialogTitle>
                    <DialogDescription>
                      Adicione um jogo da sua coleção para emprestar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Jogo *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Catan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Custo em Pontos *</Label>
                      <Input
                        id="cost"
                        type="number"
                        min="1"
                        placeholder="Ex: 5"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o jogo..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleAddGame} className="w-full">
                      Cadastrar Jogo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* My Games List */}
              <Card>
                <CardHeader>
                  <CardTitle>Meus Jogos Cadastrados</CardTitle>
                  <CardDescription>
                    {myGames.length} {myGames.length === 1 ? 'jogo cadastrado' : 'jogos cadastrados'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myGames.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Você ainda não cadastrou nenhum jogo
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myGames.map(game => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{game.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline">{game.category}</Badge>
                              <Badge variant={game.status === 'available' ? 'default' : 'secondary'}>
                                {game.status === 'available' ? 'Disponível' : 'Emprestado'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-accent font-semibold">
                            <Coins className="h-4 w-4" />
                            {game.cost}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Loans */}
              {myLentLoans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Empréstimos Ativos</CardTitle>
                    <CardDescription>
                      Jogos que você emprestou para outros usuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {myLentLoans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} isOwner={true} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyLoans;

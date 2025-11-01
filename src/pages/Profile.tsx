import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Coins, Mail, Calendar, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, logout } = useAuth();
  const { transactions } = useGames();
  const [name, setName] = useState(profile?.name || "");
  const [location, setLocation] = useState(profile?.location || "");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }

    updateProfile(name, location);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const userTransactions = transactions.filter(t => t.user_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="flex gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex gap-2 items-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Badge variant="secondary" className="text-sm">
                  {profile?.role === 'owner' ? 'Proprietário' : 'Emprestador'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Membro desde</Label>
                <div className="flex gap-2 items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Pontos</CardTitle>
              <CardDescription>Seus pontos disponíveis para empréstimos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-accent" />
                <span className="text-4xl font-bold">{profile?.points || 0}</span>
                <span className="text-muted-foreground">pontos</span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Suas últimas movimentações de pontos</CardDescription>
            </CardHeader>
            <CardContent>
              {userTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma transação ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {userTransactions.slice(-10).reverse().map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge
                        variant={transaction.amount > 0 ? "default" : "destructive"}
                        className="ml-4"
                      >
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} pontos
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

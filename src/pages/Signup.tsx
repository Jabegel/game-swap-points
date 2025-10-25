import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dices, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'owner' | 'borrower'>('borrower');
  const [loading, setLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem!",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signup(email, password, name, role);
    
    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Você ganhou 50 pontos de boas-vindas!"
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-2">
            <Dices className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se e ganhe{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-accent">
              <Coins className="h-4 w-4" />
              50 pontos
            </span>{" "}
            grátis!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Conta</Label>
              <Select value={role} onValueChange={(value: 'owner' | 'borrower') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrower">Tomador (Pegar jogos emprestados)</SelectItem>
                  <SelectItem value="owner">Proprietário (Emprestar jogos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;

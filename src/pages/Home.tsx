import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Dices, HandshakeIcon, Shield, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-games.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Board games" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <Dices className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Plataforma de Empréstimos</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Compartilhe Jogos de Tabuleiro com{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pontos
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empreste seus jogos, ganhe pontos e descubra novos títulos. Uma comunidade onde todos jogam mais!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="min-w-[200px]">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/games">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Ver Jogos
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50</div>
                <div className="text-sm text-muted-foreground">Pontos Iniciais</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">0%</div>
                <div className="text-sm text-muted-foreground">Taxa de Serviço</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">Grátis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistema simples e justo baseado em pontos para toda a comunidade
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sistema de Pontos</CardTitle>
                <CardDescription>
                  Comece com 50 pontos gratuitos. Use para pegar jogos emprestados e ganhe ao emprestar os seus.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-2">
                  <HandshakeIcon className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Empréstimos Fáceis</CardTitle>
                <CardDescription>
                  Busque jogos disponíveis, solicite empréstimo e combine a entrega. Tudo de forma simples e rápida.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Ganhe Emprestando</CardTitle>
                <CardDescription>
                  Cadastre seus jogos, defina o valor em pontos e ganhe toda vez que alguém pegar emprestado.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sistema Justo</CardTitle>
                <CardDescription>
                  Proprietários podem aplicar penalidades por danos, garantindo cuidado com os jogos emprestados.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-2">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Comunidade Ativa</CardTitle>
                <CardDescription>
                  Conecte-se com outros entusiastas de jogos de tabuleiro e expanda sua coleção sem gastar.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                  <Dices className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Jogue Mais</CardTitle>
                <CardDescription>
                  Acesse uma variedade de jogos sem precisar comprar todos. Experimente novos títulos sempre!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-3xl mx-auto text-center p-8 md:p-12 border-2 border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Pronto para Começar?
              </CardTitle>
              <CardDescription className="text-lg">
                Cadastre-se agora e receba 50 pontos grátis para começar a compartilhar jogos!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/signup">
                <Button variant="hero" size="lg" className="min-w-[250px]">
                  Criar Conta Grátis
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Sem taxas • Sem mensalidades • 100% gratuito
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 GameShare. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

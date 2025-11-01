import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, Dices, User, Menu, Gamepad2, Handshake } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-lg group-hover:shadow-glow transition-all duration-300">
            <Dices className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            GameShare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/games" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Gamepad2 className="h-4 w-4" />
                Jogos
              </Link>
              <Link to="/my-loans" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Handshake className="h-4 w-4" />
                Empréstimos
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
                <Coins className="h-5 w-5 text-accent" />
                <span className="font-semibold text-accent">{profile?.points || 0}</span>
              </div>
              <ThemeToggle />
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/games" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Gamepad2 className="h-4 w-4" />
                Jogos
              </Link>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero">Criar Conta</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 rounded-lg border border-accent/20 mb-4">
                    <Coins className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-accent">{profile?.points || 0} pontos</span>
                  </div>
                  <Link to="/games">
                    <Button variant="ghost" className="w-full justify-start">
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Jogos
                    </Button>
                  </Link>
                  <Link to="/my-loans">
                    <Button variant="ghost" className="w-full justify-start">
                      <Handshake className="h-4 w-4 mr-2" />
                      Empréstimos
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </Button>
                  </Link>
                  <div className="flex items-center justify-between w-full px-4 py-2">
                    <span className="text-sm font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                  <Button variant="outline" className="w-full" onClick={logout}>Sair</Button>
                </>
              ) : (
                <>
                  <Link to="/games">
                    <Button variant="ghost" className="w-full justify-start">
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Jogos
                    </Button>
                  </Link>
                  <div className="flex items-center justify-between w-full px-4 py-2">
                    <span className="text-sm font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="hero" className="w-full">Criar Conta</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;

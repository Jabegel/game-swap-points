import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, Dices, User, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  // TODO: Replace with actual auth state
  const isAuthenticated = false;
  const userPoints = 50;

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
          {isAuthenticated ? (
            <>
              <Link to="/games">
                <Button variant="ghost">Jogos</Button>
              </Link>
              <Link to="/my-games">
                <Button variant="ghost">Meus Jogos</Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost">Histórico</Button>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
                <Coins className="h-5 w-5 text-accent" />
                <span className="font-semibold text-accent">{userPoints}</span>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <>
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
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 rounded-lg border border-accent/20 mb-4">
                    <Coins className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-accent">{userPoints} pontos</span>
                  </div>
                  <Link to="/games">
                    <Button variant="ghost" className="w-full justify-start">Jogos</Button>
                  </Link>
                  <Link to="/my-games">
                    <Button variant="ghost" className="w-full justify-start">Meus Jogos</Button>
                  </Link>
                  <Link to="/history">
                    <Button variant="ghost" className="w-full justify-start">Histórico</Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full">Perfil</Button>
                  </Link>
                </>
              ) : (
                <>
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

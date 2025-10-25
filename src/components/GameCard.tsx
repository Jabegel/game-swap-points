import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, User } from "lucide-react";
import { Link } from "react-router-dom";

interface GameCardProps {
  id: string;
  title: string;
  image?: string;
  cost: number;
  owner: string;
  isAvailable: boolean;
}

const GameCard = ({ id, title, image, cost, owner, isAvailable }: GameCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 animate-fade-in">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <span className="text-4xl">🎲</span>
            </div>
          )}
          <Badge
            className={`absolute top-2 right-2 ${
              isAvailable
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isAvailable ? "Disponível" : "Emprestado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="h-4 w-4" />
          <span className="line-clamp-1">{owner}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent">
          <Coins className="h-5 w-5" />
          <span>{cost} pontos</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/games/${id}`} className="w-full">
          <Button variant={isAvailable ? "default" : "outline"} className="w-full" disabled={!isAvailable}>
            {isAvailable ? "Ver Detalhes" : "Indisponível"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default GameCard;

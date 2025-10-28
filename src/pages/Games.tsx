import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import GameCard from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useGames } from "@/contexts/GameContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Games = () => {
  const { games } = useGames();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "cost-asc") return a.cost - b.cost;
    if (sortBy === "cost-desc") return b.cost - a.cost;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Jogos Disponíveis</h1>
          <p className="text-muted-foreground">
            Encontre o jogo perfeito para seu próximo encontro
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar jogos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="cost-asc">Menor Custo</SelectItem>
              <SelectItem value="cost-desc">Maior Custo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Games Grid */}
        {sortedGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedGames.map((game) => (
              <GameCard 
                key={game.id} 
                id={game.id}
                title={game.name}
                image={game.imageUrl}
                cost={game.cost}
                owner={game.ownerName}
                isAvailable={game.status === 'available'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum jogo encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Games;

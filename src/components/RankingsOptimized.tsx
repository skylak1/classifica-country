
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { TopPlayersSection } from "./rankings/TopPlayersSection";
import { CompactPlayersSection } from "./rankings/CompactPlayersSection";
import { PlayersTable } from "./rankings/PlayersTable";

const ITEMS_PER_PAGE = 20;

export const RankingsOptimized = () => {
  const { players, loading } = usePlayers();
  const [searchTerm, setSearchTerm] = useState("");
  const [jumpToPosition, setJumpToPosition] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rankedPlayers, setRankedPlayers] = useState<(Player & { rank: number; trend: 'up' | 'down' | 'same' })[]>([]);

  useEffect(() => {
    const sorted = [...players]
      .sort((a, b) => b.points - a.points)
      .map((player, index) => {
        const currentRank = index + 1;
        let trend: 'up' | 'down' | 'same' = 'same';
        
        if (player.previous_rank) {
          if (currentRank < player.previous_rank) trend = 'up';
          else if (currentRank > player.previous_rank) trend = 'down';
        }

        return {
          ...player,
          rank: currentRank,
          trend
        };
      });
    
    setRankedPlayers(sorted);
  }, [players]);

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return rankedPlayers;
    
    return rankedPlayers.filter(player => 
      `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankedPlayers, searchTerm]);

  const topPlayers = filteredPlayers.slice(0, 3);
  const midTierPlayers = filteredPlayers.slice(3, 10);
  const remainingPlayers = filteredPlayers.slice(10);

  const totalPages = Math.ceil(remainingPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = remainingPlayers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleJumpToPosition = () => {
    const position = parseInt(jumpToPosition);
    if (position && position > 10 && position <= filteredPlayers.length) {
      const adjustedPosition = position - 10; // Sottrai i primi 10 giocatori
      const targetPage = Math.ceil(adjustedPosition / ITEMS_PER_PAGE);
      setCurrentPage(targetPage);
      setJumpToPosition("");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset alla prima pagina quando si cerca
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Classifica Country Club Alcamo</h2>
          <p className="text-primary/70">Classifica aggiornata in tempo reale</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (rankedPlayers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Classifica Country Club Alcamo</h2>
          <p className="text-primary/70">Classifica aggiornata in tempo reale</p>
        </div>
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Nessun giocatore registrato</h3>
            <p className="text-primary/70 text-center">
              Aggiungi dei giocatori nella sezione "Giocatori" per vedere la classifica.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Classifica Country Club Alcamo</h2>
        <p className="text-primary/70">Classifica aggiornata in tempo reale</p>
      </div>

      {/* Search and Navigation Controls */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 h-4 w-4" />
              <Input
                placeholder="Cerca giocatore per nome o nazionalità..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <Input
                type="number"
                placeholder="Posizione #"
                value={jumpToPosition}
                onChange={(e) => setJumpToPosition(e.target.value)}
                className="w-24"
                min="1"
                max={filteredPlayers.length}
              />
              <Button onClick={handleJumpToPosition} variant="outline" size="sm">
                Vai
              </Button>
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-primary/70 mt-2">
              Trovati {filteredPlayers.length} giocatori per "{searchTerm}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Players - Mantieni le card speciali */}
      {topPlayers.length > 0 && (
        <TopPlayersSection players={topPlayers} />
      )}

      {/* Positions 4-10 - Card compatte */}
      {midTierPlayers.length > 0 && (
        <CompactPlayersSection players={midTierPlayers} />
      )}

      {/* Positions 11+ - Tabella paginata */}
      {remainingPlayers.length > 0 && (
        <PlayersTable 
          players={paginatedPlayers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startingRank={11 + (currentPage - 1) * ITEMS_PER_PAGE}
        />
      )}

      {/* Statistics */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Statistiche Classifica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{filteredPlayers.length}</p>
              <p className="text-primary/70">{searchTerm ? 'Risultati Trovati' : 'Giocatori Totali'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {filteredPlayers.length > 0 ? Math.max(...filteredPlayers.map(p => p.points)).toLocaleString() : 0}
              </p>
              <p className="text-primary/70">Punti Leader</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {filteredPlayers.length > 0 ? Math.round(filteredPlayers.reduce((sum, p) => sum + p.points, 0) / filteredPlayers.length).toLocaleString() : 0}
              </p>
              <p className="text-primary/70">Media Punti</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { Player } from "@/hooks/usePlayers";

interface PlayersTableProps {
  players: (Player & { rank: number; trend: 'up' | 'down' | 'same' })[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startingRank: number;
  onPlayerClick?: (player: Player) => void;
}

export const PlayersTable = ({ 
  players, 
  currentPage, 
  totalPages, 
  onPageChange, 
  startingRank,
  onPlayerClick 
}: PlayersTableProps) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-primary" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'Italia': '🇮🇹',
      'Spagna': '🇪🇸',
      'Francia': '🇫🇷',
      'Germania': '🇩🇪',
      'Regno Unito': '🇬🇧',
      'Stati Uniti': '🇺🇸',
      'Argentina': '🇦🇷',
      'Brasile': '🇧🇷',
      'Australia': '🇦🇺',
      'Giappone': '🇯🇵'
    };
    return flags[nationality] || '🏳️';
  };

  if (players.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">📊 Posizioni {startingRank}+</h3>
        {totalPages > 1 && (
          <span className="text-sm text-primary/70">
            Pagina {currentPage} di {totalPages}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        {players.map((player, index) => (
          <Card 
            key={player.id} 
            className="border-primary/20 hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
            onClick={() => onPlayerClick?.(player)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                      <span className="text-sm font-bold text-primary">{startingRank + index}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-primary truncate">
                        {player.first_name} {player.last_name}
                      </h4>
                      <span className="text-sm">{getCountryFlag(player.nationality)}</span>
                      {getTrendIcon(player.trend)}
                    </div>
                    <p className="text-xs text-primary/60 truncate">{player.nationality}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-sm px-2 py-1 font-semibold">
                    {player.points.toLocaleString()}
                  </Badge>
                  {player.previous_rank && (
                    <p className="text-xs text-gray-500 mt-1">
                      Era #{player.previous_rank}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10 bg-muted/30 rounded-b-lg">
          <div className="text-sm text-primary/70">
            Mostrando {players.length} di {totalPages * 20} giocatori
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Successivo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

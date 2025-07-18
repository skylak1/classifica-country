
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
}

export const PlayersTable = ({ 
  players, 
  currentPage, 
  totalPages, 
  onPageChange, 
  startingRank 
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
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary flex items-center justify-between">
          <span>📊 Posizioni {startingRank}+</span>
          {totalPages > 1 && (
            <span className="text-sm font-normal text-primary/70">
              Pagina {currentPage} di {totalPages}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead className="w-16 text-center font-semibold">Pos.</TableHead>
                <TableHead className="font-semibold">Giocatore</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Nazionalità</TableHead>
                <TableHead className="text-center font-semibold">Trend</TableHead>
                <TableHead className="text-right font-semibold">Punti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow 
                  key={player.id} 
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="text-center font-semibold text-primary">
                    {startingRank + index}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">
                        {player.first_name} {player.last_name}
                      </span>
                      <span className="sm:hidden text-sm">
                        {getCountryFlag(player.nationality)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span>{getCountryFlag(player.nationality)}</span>
                      <span className="text-primary/70">{player.nationality}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getTrendIcon(player.trend)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                        {player.points.toLocaleString()}
                      </Badge>
                      {player.previous_rank && (
                        <span className="text-xs text-gray-500">
                          Era #{player.previous_rank}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10">
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
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Player } from "@/hooks/usePlayers";

interface CompactPlayersSectionProps {
  players: (Player & { rank: number; trend: 'up' | 'down' | 'same' })[];
}

export const CompactPlayersSection = ({ players }: CompactPlayersSectionProps) => {
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
    <Card className="ranking-card animate-scale-in">
      <CardHeader className="ranking-header pb-4">
        <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">🥇</span>
          <span>Posizioni 4-10</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-b-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-primary/8 via-primary/12 to-primary/8 border-none">
                <TableHead className="w-16 text-center font-bold text-primary/90">Pos.</TableHead>
                <TableHead className="font-bold text-primary/90">Giocatore</TableHead>
                <TableHead className="hidden sm:table-cell font-bold text-primary/90">Nazionalità</TableHead>
                <TableHead className="text-center font-bold text-primary/90">Trend</TableHead>
                <TableHead className="text-right font-bold text-primary/90">Punti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow 
                  key={player.id} 
                  className="player-row group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-center py-4">
                    <div className="rank-badge rounded-full w-8 h-8 flex items-center justify-center text-sm">
                      {player.rank}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {player.first_name} {player.last_name}
                      </span>
                      <span className="sm:hidden text-lg">
                        {getCountryFlag(player.nationality)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCountryFlag(player.nationality)}</span>
                      <span className="text-muted-foreground font-medium">{player.nationality}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="p-1 rounded-full bg-muted/50">
                        {getTrendIcon(player.trend)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Badge className="points-badge text-sm px-3 py-1">
                      {player.points.toLocaleString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


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
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary">🥇 Posizioni 4-10</CardTitle>
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
              {players.map((player) => (
                <TableRow 
                  key={player.id} 
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="text-center font-semibold text-primary">
                    {player.rank}
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
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
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

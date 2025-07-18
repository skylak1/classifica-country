
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-primary mb-3">🥇 Posizioni 4-10</h3>
      <div className="grid gap-2">
        {players.map((player) => (
          <Card key={player.id} className="border-primary/20 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                      <span className="text-sm font-bold text-primary">{player.rank}</span>
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
    </div>
  );
};

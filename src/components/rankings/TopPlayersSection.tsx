
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Player } from "@/hooks/usePlayers";

interface TopPlayersSectionProps {
  players: (Player & { rank: number; trend: 'up' | 'down' | 'same' })[];
  isSearching?: boolean;
  onPlayerClick?: (player: Player) => void;
}

export const TopPlayersSection = ({ players, isSearching = false, onPlayerClick }: TopPlayersSectionProps) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Award className="h-8 w-8 text-amber-600" />;
    return null;
  };

  const getRankDisplay = (rank: number) => {
    const icon = getRankIcon(rank);
    if (icon) {
      return (
        <div className="flex flex-col items-center gap-1">
          {icon}
          <span className="text-2xl font-black text-primary">{rank}</span>
        </div>
      );
    }
    
    return (
      <div className="text-4xl font-black text-primary bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center border-4 border-primary/20">
        {rank}
      </div>
    );
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-primary" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
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

  const getCardStyle = (rank: number) => {
    if (rank === 1) return "border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg";
    if (rank === 2) return "border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 shadow-md";
    if (rank === 3) return "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 shadow-md";
    return "border-primary/20 hover:shadow-lg transition-shadow";
  };

  return (
    <div className="space-y-4">
      {!isSearching && <h3 className="text-xl font-semibold text-primary mb-4">🏆 Top 3 Giocatori</h3>}
      {players.map((player) => (
        <Card 
          key={player.id} 
          className={`${getCardStyle(player.rank)} animate-fade-in cursor-pointer hover:scale-[1.02] transition-transform`}
          onClick={() => onPlayerClick?.(player)}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-shrink-0">
                  {getRankDisplay(player.rank)}
                </div>
                <div className="flex-1 sm:flex-initial">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-2xl font-bold text-primary break-words">
                      {player.first_name} {player.last_name}
                    </h3>
                    <span className="text-lg md:text-2xl">{getCountryFlag(player.nationality)}</span>
                    {getTrendIcon(player.trend)}
                  </div>
                  <p className="text-primary/70 text-sm md:text-lg">{player.nationality}</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right w-full sm:w-auto sm:flex-shrink-0">
                <Badge variant="secondary" className="bg-primary/10 text-primary text-lg md:text-xl px-3 md:px-4 py-1 md:py-2 font-bold">
                  {player.points.toLocaleString()} pts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

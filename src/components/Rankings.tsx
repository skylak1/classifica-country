
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { usePlayers, Player } from "@/hooks/usePlayers";

export const Rankings = () => {
  const { players, loading } = usePlayers();
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Classifica Country Club Alcamo</h2>
        <p className="text-primary/70">Classifica aggiornata in tempo reale</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rankedPlayers.length === 0 ? (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Nessun giocatore registrato</h3>
            <p className="text-primary/70 text-center">
              Aggiungi dei giocatori nella sezione "Giocatori" per vedere la classifica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rankedPlayers.map((player) => (
            <Card key={player.id} className={`${getCardStyle(player.rank)} animate-fade-in`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {getRankDisplay(player.rank)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-primary">
                        {player.first_name} {player.last_name}
                      </h3>
                      <span className="text-2xl">{getCountryFlag(player.nationality)}</span>
                      {getTrendIcon(player.trend)}
                    </div>
                    <p className="text-primary/70 text-lg">{player.nationality}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xl px-4 py-2 font-bold">
                      {player.points.toLocaleString()} pts
                    </Badge>
                    {player.previous_rank && (
                      <p className="text-sm text-gray-500 mt-2">
                        Era #{player.previous_rank}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rankedPlayers.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Statistiche Classifica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{rankedPlayers.length}</p>
                <p className="text-primary/70">Giocatori Totali</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.max(...rankedPlayers.map(p => p.points)).toLocaleString()}
                </p>
                <p className="text-primary/70">Punti Leader</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(rankedPlayers.reduce((sum, p) => sum + p.points, 0) / rankedPlayers.length).toLocaleString()}
                </p>
                <p className="text-primary/70">Media Punti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

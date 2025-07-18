
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate: string;
  points: number;
  previousRank?: number;
}

export const Rankings = () => {
  const [players] = useLocalStorage<Player[]>('tennis-players', []);
  const [rankedPlayers, setRankedPlayers] = useState<(Player & { rank: number; trend: 'up' | 'down' | 'same' })[]>([]);

  useEffect(() => {
    const sorted = [...players]
      .sort((a, b) => b.points - a.points)
      .map((player, index) => {
        const currentRank = index + 1;
        let trend: 'up' | 'down' | 'same' = 'same';
        
        if (player.previousRank) {
          if (currentRank < player.previousRank) trend = 'up';
          else if (currentRank > player.previousRank) trend = 'down';
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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-green-700">{rank}</span>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Classifica ATP</h2>
        <p className="text-green-600">Classifica aggiornata in tempo reale</p>
      </div>

      {rankedPlayers.length === 0 ? (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-green-300 mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Nessun giocatore registrato</h3>
            <p className="text-green-600 text-center">
              Aggiungi dei giocatori nella sezione "Giocatori" per vedere la classifica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rankedPlayers.map((player) => (
            <Card key={player.id} className="border-green-200 hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                    {getRankIcon(player.rank)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-green-800">
                        {player.firstName} {player.lastName}
                      </h3>
                      <span className="text-lg">{getCountryFlag(player.nationality)}</span>
                      {getTrendIcon(player.trend)}
                    </div>
                    <p className="text-green-600">{player.nationality}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-3 py-1">
                      {player.points.toLocaleString()} pts
                    </Badge>
                    {player.previousRank && (
                      <p className="text-sm text-gray-500 mt-1">
                        Era #{player.previousRank}
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
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Statistiche Classifica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{rankedPlayers.length}</p>
                <p className="text-green-600">Giocatori Totali</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  {Math.max(...rankedPlayers.map(p => p.points)).toLocaleString()}
                </p>
                <p className="text-green-600">Punti Leader</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  {Math.round(rankedPlayers.reduce((sum, p) => sum + p.points, 0) / rankedPlayers.length).toLocaleString()}
                </p>
                <p className="text-green-600">Media Punti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Player } from "@/hooks/usePlayers";
import { usePlayerStats, Match } from "@/hooks/usePlayerStats";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerStatsModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlayerStatsModal = ({ player, open, onOpenChange }: PlayerStatsModalProps) => {
  const { stats, matches, loading, error } = usePlayerStats(player?.id || null);

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

  const getOpponentName = (match: Match, playerId: string) => {
    // Per ora mostreremo solo gli ID, ma si potrebbe fare una query per ottenere i nomi
    return match.player1_id === playerId ? 
      `Giocatore ${match.player2_id.slice(-4)}` : 
      `Giocatore ${match.player1_id.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span>{getCountryFlag(player.nationality)}</span>
            <span>{player.first_name} {player.last_name}</span>
            <Badge variant="outline" className="text-lg">
              {player.points.toLocaleString()} pts
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            <p>Errore nel caricamento delle statistiche: {error}</p>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Statistiche generali */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Partite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Totali:</span>
                      <span className="font-bold">{stats.totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Vinte:</span>
                      <span className="font-bold text-green-600">{stats.matchesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Perse:</span>
                      <span className="font-bold text-red-600">{stats.matchesLost}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-primary">% Vittorie:</span>
                      <span className="font-bold text-primary">{stats.winPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Totali:</span>
                      <span className="font-bold">{stats.totalGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Vinti:</span>
                      <span className="font-bold text-green-600">{stats.gamesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Persi:</span>
                      <span className="font-bold text-red-600">{stats.gamesLost}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-primary">% Vittorie:</span>
                      <span className="font-bold text-primary">{stats.gameWinPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Set
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Totali:</span>
                      <span className="font-bold">{stats.totalSets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Vinti:</span>
                      <span className="font-bold text-green-600">{stats.setsWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Persi:</span>
                      <span className="font-bold text-red-600">{stats.setsLost}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-primary">% Vittorie:</span>
                      <span className="font-bold text-primary">{stats.setWinPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Storico partite recenti */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Partite Recenti ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nessuna partita giocata ancora
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {matches.slice(0, 10).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            match.winner_id === player.id ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">
                              vs {getOpponentName(match, player.id)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(match.match_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-medium">{match.score}</p>
                          <p className="text-xs text-muted-foreground">
                            {match.winner_id === player.id ? 'Vittoria' : 'Sconfitta'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
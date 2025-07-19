import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Player } from "@/hooks/usePlayers";
import { usePlayerStats, Match } from "@/hooks/usePlayerStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerStatsModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlayerStatsModal = ({ player, open, onOpenChange }: PlayerStatsModalProps) => {
  const { stats, matches, loading, error } = usePlayerStats(player?.id || null);
  const isMobile = useIsMobile();

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

  const getOpponentName = (match: Match) => {
    return match.opponent_name || 'Avversario sconosciuto';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (!player) return null;

  const PlayerHeader = () => (
    <div className="flex items-center gap-3 text-xl md:text-2xl">
      <span>{getCountryFlag(player.nationality)}</span>
      <span className="font-bold">{player.first_name} {player.last_name}</span>
      <Badge variant="outline" className="text-sm md:text-lg">
        {player.points.toLocaleString()} pts
      </Badge>
    </div>
  );

  const StatsContent = () => (
    <div className="space-y-4 md:space-y-6">
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 md:h-32 w-full" />
          <Skeleton className="h-24 md:h-32 w-full" />
          <Skeleton className="h-24 md:h-32 w-full" />
        </div>
      )}

      {error && (
        <div className="text-center py-6 md:py-8 text-red-500">
          <p className="text-sm md:text-base">Errore nel caricamento delle statistiche: {error}</p>
        </div>
      )}

      {stats && (
        <>
          {/* Statistiche generali - Stack verticalmente su mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Partite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="font-bold text-lg">{stats.totalMatches}</p>
                    <p className="text-xs text-muted-foreground">Totali</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                    <p className="font-bold text-lg text-green-600">{stats.matchesWon}</p>
                    <p className="text-xs text-green-600">Vinte</p>
                  </div>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded">
                  <p className="font-bold text-lg text-primary">{stats.winPercentage.toFixed(1)}%</p>
                  <p className="text-xs text-primary">% Vittorie</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Game
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="font-bold text-lg">{stats.totalGames}</p>
                    <p className="text-xs text-muted-foreground">Totali</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                    <p className="font-bold text-lg text-green-600">{stats.gamesWon}</p>
                    <p className="text-xs text-green-600">Vinti</p>
                  </div>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded">
                  <p className="font-bold text-lg text-primary">{stats.gameWinPercentage.toFixed(1)}%</p>
                  <p className="text-xs text-primary">% Vittorie</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Set
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="font-bold text-lg">{stats.totalSets}</p>
                    <p className="text-xs text-muted-foreground">Totali</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                    <p className="font-bold text-lg text-green-600">{stats.setsWon}</p>
                    <p className="text-xs text-green-600">Vinti</p>
                  </div>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded">
                  <p className="font-bold text-lg text-primary">{stats.setWinPercentage.toFixed(1)}%</p>
                  <p className="text-xs text-primary">% Vittorie</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Storico partite recenti */}
          <Card className="border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                Partite Recenti ({matches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm md:text-base">
                  Nessuna partita giocata ancora
                </p>
              ) : (
                <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
                  {matches.slice(0, 10).map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          match.winner_id === player.id ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm md:text-base truncate">
                            vs {getOpponentName(match)}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {formatDate(match.match_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-sm md:text-base font-medium">{match.score}</p>
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
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-4">
            <DrawerTitle>
              <PlayerHeader />
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <StatsContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <PlayerHeader />
          </DialogTitle>
        </DialogHeader>
        <StatsContent />
      </DialogContent>
    </Dialog>
  );
};
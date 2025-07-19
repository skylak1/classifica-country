import { useState, useEffect, useMemo } from "react";
import { Search, Trophy, Medal, Award, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayerStatsModal } from "./PlayerStatsModal";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { useBandSettings } from "@/hooks/useBandSettings";

export const BandRankings = () => {
  const { players, loading } = usePlayers();
  const { bandSettings, loading: bandLoading } = useBandSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const bandColors = useMemo(() => {
    const colors: {[key: number]: string} = {};
    bandSettings.forEach(band => {
      colors[band.band_number] = band.color;
    });
    return colors;
  }, [bandSettings]);

  const getBandIcon = (bandNumber: number) => {
    switch (bandNumber) {
      case 1: return Trophy;
      case 2: return Medal;
      case 3: return Award;
      case 4: return Star;
      default: return Star;
    }
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player =>
      `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  const playersByBand = useMemo(() => {
    const grouped: {[key: number]: Player[]} = { 1: [], 2: [], 3: [], 4: [] };
    filteredPlayers.forEach(player => {
      if (grouped[player.band_number]) {
        grouped[player.band_number].push(player);
      }
    });
    
    // Ordina per posizione nella fascia
    Object.keys(grouped).forEach(band => {
      grouped[parseInt(band)].sort((a, b) => a.position_in_band - b.position_in_band);
    });
    
    return grouped;
  }, [filteredPlayers]);

  const getCountryFlag = (nationality: string) => {
    const flags: {[key: string]: string} = {
      'IT': '🇮🇹', 'ES': '🇪🇸', 'FR': '🇫🇷', 'DE': '🇩🇪', 'GB': '🇬🇧',
      'US': '🇺🇸', 'AR': '🇦🇷', 'BR': '🇧🇷', 'AU': '🇦🇺', 'JP': '🇯🇵'
    };
    return flags[nationality] || '🏳️';
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsStatsModalOpen(true);
  };

  if (loading || bandLoading) {
    return <div className="text-center py-8">Caricamento classifiche...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Classifiche per Fasce</h1>
        <p className="text-muted-foreground">
          Sistema di classificazione a 4 fasce con posizioni specifiche
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cerca giocatori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map(bandNumber => {
          const playersInBand = playersByBand[bandNumber] || [];
          const bandSetting = bandSettings.find(b => b.band_number === bandNumber);
          const bandColor = bandColors[bandNumber] || '#6B7280';
          const IconComponent = getBandIcon(bandNumber);

          return (
            <Card key={bandNumber} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: bandColor }}
              />
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg"
                      style={{ backgroundColor: bandColor }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Fascia {bandNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {playersInBand.length}/{bandSetting?.max_players || 'N/A'} giocatori
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: bandColor,
                      color: bandColor
                    }}
                  >
                    {playersInBand.length} giocatori
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {playersInBand.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nessun giocatore in questa fascia
                  </div>
                ) : (
                  playersInBand.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary"
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ 
                            backgroundColor: `${bandColor}20`,
                            color: bandColor,
                            borderColor: bandColor
                          }}
                        >
                          {player.position_in_band}
                        </Badge>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback 
                            className="text-white font-semibold"
                            style={{ backgroundColor: bandColor }}
                          >
                            {player.first_name[0]}{player.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {player.first_name} {player.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {getCountryFlag(player.nationality)} {player.nationality}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Pos. {player.position_in_band}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PlayerStatsModal
        player={selectedPlayer}
        open={isStatsModalOpen}
        onOpenChange={setIsStatsModalOpen}
      />
    </div>
  );
};
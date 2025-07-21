import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown, Users, Crown } from "lucide-react";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { useBandSettings } from "@/hooks/useBandSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PositionManagement = () => {
  const { players, loading, refetch } = usePlayers();
  const { bandSettings } = useBandSettings();
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [newBand, setNewBand] = useState<number>(1);
  const [newPosition, setNewPosition] = useState<number>(1);

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'Italia': '🇮🇹', 'Spagna': '🇪🇸', 'Francia': '🇫🇷', 'Germania': '🇩🇪',
      'Regno Unito': '🇬🇧', 'Stati Uniti': '🇺🇸', 'Argentina': '🇦🇷', 
      'Brasile': '🇧🇷', 'Australia': '🇦🇺', 'Giappone': '🇯🇵'
    };
    return flags[nationality] || '🏳️';
  };

  const getBandColor = (bandNumber: number) => {
    const band = bandSettings.find(b => b.band_number === bandNumber);
    return band?.color || '#6B7280';
  };

  const movePlayer = async (playerId: string, newBandNumber: number, newPositionInBand: number) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      const oldBand = player.band_number;
      const oldPosition = player.position_in_band;

      // Se il giocatore si sposta nella stessa fascia
      if (oldBand === newBandNumber) {
        if (oldPosition === newPositionInBand) return; // Nessun cambio

        // Sposta gli altri giocatori manualmente
        if (oldPosition < newPositionInBand) {
          // Sposta verso il basso - gli altri salgono
          const { data: playersToShift } = await supabase
            .from('players')
            .select('id, position_in_band')
            .eq('band_number', newBandNumber)
            .gte('position_in_band', oldPosition + 1)
            .lte('position_in_band', newPositionInBand);

          if (playersToShift) {
            for (const player of playersToShift) {
              await supabase
                .from('players')
                .update({ position_in_band: player.position_in_band - 1 })
                .eq('id', player.id);
            }
          }
        } else {
          // Sposta verso l'alto - gli altri scendono
          const { data: playersToShift } = await supabase
            .from('players')
            .select('id, position_in_band')
            .eq('band_number', newBandNumber)
            .gte('position_in_band', newPositionInBand)
            .lte('position_in_band', oldPosition - 1);

          if (playersToShift) {
            for (const player of playersToShift) {
              await supabase
                .from('players')
                .update({ position_in_band: player.position_in_band + 1 })
                .eq('id', player.id);
            }
          }
        }
      } else {
        // Cambio di fascia
        // Riorganizza la fascia vecchia (sposta tutti in su)
        const { data: oldBandPlayers } = await supabase
          .from('players')
          .select('id, position_in_band')
          .eq('band_number', oldBand)
          .gt('position_in_band', oldPosition);

        if (oldBandPlayers) {
          for (const player of oldBandPlayers) {
            await supabase
              .from('players')
              .update({ position_in_band: player.position_in_band - 1 })
              .eq('id', player.id);
          }
        }

        // Fa spazio nella fascia nuova (sposta tutti in giù)
        const { data: newBandPlayers } = await supabase
          .from('players')
          .select('id, position_in_band')
          .eq('band_number', newBandNumber)
          .gte('position_in_band', newPositionInBand);

        if (newBandPlayers) {
          for (const player of newBandPlayers) {
            await supabase
              .from('players')
              .update({ position_in_band: player.position_in_band + 1 })
              .eq('id', player.id);
          }
        }
      }

      // Aggiorna il giocatore
      await supabase
        .from("players")
        .update({
          band_number: newBandNumber,
          position_in_band: newPositionInBand
        })
        .eq("id", playerId);

      await refetch();
      toast({
        title: "Successo",
        description: `Giocatore spostato in Fascia ${newBandNumber}, Posizione ${newPositionInBand}`
      });

    } catch (error) {
      console.error("Error moving player:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile spostare il giocatore"
      });
    }
  };

  const quickMove = async (playerId: string, direction: 'up' | 'down') => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const currentBand = player.band_number;
    const currentPosition = player.position_in_band;

    if (direction === 'up') {
      if (currentPosition > 1) {
        // Sposta in su nella stessa fascia
        await movePlayer(playerId, currentBand, currentPosition - 1);
      } else if (currentBand > 1) {
        // Sposta nella fascia superiore all'ultima posizione
        const upperBandPlayers = players.filter(p => p.band_number === currentBand - 1);
        const maxPosition = Math.max(...upperBandPlayers.map(p => p.position_in_band), 0) + 1;
        await movePlayer(playerId, currentBand - 1, maxPosition);
      }
    } else {
      const bandPlayers = players.filter(p => p.band_number === currentBand);
      const maxPositionInBand = Math.max(...bandPlayers.map(p => p.position_in_band));

      if (currentPosition < maxPositionInBand) {
        // Sposta in giù nella stessa fascia
        await movePlayer(playerId, currentBand, currentPosition + 1);
      } else if (currentBand < 4) {
        // Sposta nella fascia inferiore alla prima posizione
        await movePlayer(playerId, currentBand + 1, 1);
      }
    }
  };

  const selectedPlayerData = players.find(p => p.id === selectedPlayer);
  const selectedBandPlayers = players.filter(p => p.band_number === newBand);
  const maxPositionInNewBand = Math.max(...selectedBandPlayers.map(p => p.position_in_band), 0);

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Gestione Posizioni</h2>
        <p className="text-muted-foreground">
          Sposta manualmente i giocatori nelle fasce e posizioni
        </p>
      </div>

      {/* Spostamento Rapido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Spostamento Rapido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[1, 2, 3, 4].map(bandNumber => {
              const bandPlayers = players.filter(p => p.band_number === bandNumber);
              const bandColor = getBandColor(bandNumber);
              
              return (
                <div key={bandNumber} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: bandColor }}
                    />
                    <h4 className="font-semibold">Fascia {bandNumber}</h4>
                    <Badge variant="outline">{bandPlayers.length} giocatori</Badge>
                  </div>
                  
                  <div className="grid gap-2 pl-6">
                    {bandPlayers
                      .sort((a, b) => a.position_in_band - b.position_in_band)
                      .map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary"
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            >
                              {player.position_in_band}
                            </Badge>
                            <span>{getCountryFlag(player.nationality)}</span>
                            <span className="font-medium">
                              {player.first_name} {player.last_name}
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickMove(player.id, 'up')}
                              disabled={player.band_number === 1 && player.position_in_band === 1}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickMove(player.id, 'down')}
                              disabled={player.band_number === 4 && 
                                player.position_in_band === Math.max(...players.filter(p => p.band_number === 4).map(p => p.position_in_band))}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spostamento Preciso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Spostamento Preciso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Seleziona Giocatore</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli un giocatore..." />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {getCountryFlag(player.nationality)} {player.first_name} {player.last_name} 
                      (F{player.band_number}-P{player.position_in_band})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nuova Fascia</Label>
              <Select value={newBand.toString()} onValueChange={(value) => setNewBand(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(band => (
                    <SelectItem key={band} value={band.toString()}>
                      Fascia {band}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nuova Posizione</Label>
              <Select value={newPosition.toString()} onValueChange={(value) => setNewPosition(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxPositionInNewBand + 1 }, (_, i) => i + 1).map(pos => (
                    <SelectItem key={pos} value={pos.toString()}>
                      Posizione {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPlayerData && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Anteprima Spostamento:</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span>Da:</span>
                  <Badge variant="outline">
                    Fascia {selectedPlayerData.band_number} - Pos. {selectedPlayerData.position_in_band}
                  </Badge>
                </div>
                <span>→</span>
                <div className="flex items-center gap-2">
                  <span>A:</span>
                  <Badge variant="outline">
                    Fascia {newBand} - Pos. {newPosition}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => selectedPlayer && movePlayer(selectedPlayer, newBand, newPosition)}
            disabled={!selectedPlayer}
            className="w-full"
          >
            Sposta Giocatore
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Download, 
  Upload,
  Trash2,
  RefreshCw,
  Settings,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";
import { BandManagement } from "./BandManagement";
import { PositionManagement } from "./PositionManagement";

export const AdminDashboard = () => {
  const { players, loading: playersLoading, deleteAllPlayers, addPlayer, updatePlayer } = usePlayers();
  const { matches, loading: matchesLoading, deleteAllMatches, addMatch } = useMatches();

  const loading = playersLoading || matchesLoading;

  const stats = {
    totalPlayers: players.length,
    totalMatches: matches.length,
    activeBands: [...new Set(players.map(p => p.band_number))].length,
    averagePlayersPerBand: players.length > 0 ? Math.round(players.length / 4) : 0
  };

  const exportData = () => {
    const data = {
      players,
      matches,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tennis-ranking-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup completato",
      description: "I dati sono stati esportati con successo"
    });
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.players && data.matches) {
          // First clear all existing data
          await deleteAllPlayers();
          await deleteAllMatches();
          
          // Import players
          for (const player of data.players) {
            const { id, created_at, updated_at, ...playerData } = player;
            await addPlayer(playerData);
          }
          
          // Import matches
          for (const match of data.matches) {
            const { id, created_at, ...matchData } = match;
            await addMatch(matchData);
          }
          
          toast({
            title: "Importazione completata",
            description: "I dati sono stati importati con successo"
          });
        } else {
          throw new Error("Formato file non valido");
        }
      } catch (error) {
        toast({
          title: "Errore importazione",
          description: "File non valido o corrotto",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    // Reset input value to allow re-importing the same file
    event.target.value = '';
  };

  const resetAllData = async () => {
    if (confirm("Sei sicuro di voler cancellare tutti i dati? Questa operazione non può essere annullata.")) {
      try {
        await deleteAllPlayers();
        await deleteAllMatches();
        toast({
          title: "Dati cancellati",
          description: "Tutti i dati sono stati eliminati",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile cancellare tutti i dati",
          variant: "destructive"
        });
      }
    }
  };

  const recalculateRankings = async () => {
    try {
      // Riorganizza le posizioni nelle fasce
      const playersByBand = players.reduce((acc, player) => {
        if (!acc[player.band_number]) acc[player.band_number] = [];
        acc[player.band_number].push(player);
        return acc;
      }, {} as Record<number, Player[]>);
      
      // Riordina le posizioni in ogni fascia
      for (const bandNumber in playersByBand) {
        const bandPlayers = playersByBand[parseInt(bandNumber)];
        for (let i = 0; i < bandPlayers.length; i++) {
          const player = bandPlayers[i];
          if (player.position_in_band !== i + 1) {
            await updatePlayer(player.id, { position_in_band: i + 1 });
          }
        }
      }
      
      toast({
        title: "Posizioni riorganizzate",
        description: "Le posizioni nelle fasce sono state riordinate"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile riorganizzare le posizioni",
        variant: "destructive"
      });
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Giocatore non trovato';
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

  const topCountries = players.reduce((acc, player) => {
    acc[player.nationality] = (acc[player.nationality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentMatches = matches.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Dashboard Amministrativa</h2>
          <p className="text-primary/70">Gestisci e monitora tutto il sistema di ranking</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Giocatori Totali</p>
                <p className="text-2xl font-bold text-primary">{stats.totalPlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Partite Registrate</p>
                <p className="text-2xl font-bold text-primary">{stats.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Fasce Attive</p>
                <p className="text-2xl font-bold text-primary">{stats.activeBands}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Media per Fascia</p>
                <p className="text-2xl font-bold text-primary">{stats.averagePlayersPerBand}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="players">Giocatori</TabsTrigger>
          <TabsTrigger value="matches">Partite</TabsTrigger>
          <TabsTrigger value="bands">Fasce</TabsTrigger>
          <TabsTrigger value="positions">Posizioni</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Distribuzione per Nazionalità</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(topCountries)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getCountryFlag(country)}</span>
                          <span className="text-primary">{country}</span>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {count} giocatori
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Partite Recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMatches.length === 0 ? (
                    <p className="text-primary/70 text-center py-4">Nessuna partita registrata</p>
                  ) : (
                    recentMatches.map((match) => (
                      <div key={match.id} className="p-3 bg-primary/5 rounded-lg">
                        <div className="text-sm text-primary/70 mb-1">
                          {format(new Date(match.match_date), "dd/MM/yyyy")}
                        </div>
                        <div className="text-primary">
                          {getPlayerName(match.player1_id)} vs {getPlayerName(match.player2_id)}
                        </div>
                        <div className="text-sm text-primary/70">
                          Vincitore: {getPlayerName(match.winner_id)} (+{match.points_awarded} pts)
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Gestione Giocatori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.length === 0 ? (
                  <p className="text-primary/70 text-center py-8">Nessun giocatore registrato</p>
                ) : (
                  <div className="space-y-2">
                    {players.map((player) => (
                       <div key={player.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                         <div className="flex items-center gap-3">
                           <span className="text-xl">{getCountryFlag(player.nationality)}</span>
                           <div>
                             <div className="font-semibold text-primary">
                               {player.first_name} {player.last_name}
                             </div>
                              <div className="text-sm text-primary/70">
                                {player.nationality} • Fascia {player.band_number}
                              </div>
                           </div>
                         </div>
                         <Badge variant="secondary" className="bg-primary/10 text-primary">
                           {format(new Date(player.birth_date), "dd/MM/yyyy")}
                         </Badge>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Storico Partite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <p className="text-primary/70 text-center py-8">Nessuna partita registrata</p>
                ) : (
                  <div className="space-y-3">
                     {matches.slice().reverse().map((match) => (
                       <div key={match.id} className="p-4 border border-primary/20 rounded-lg">
                         <div className="flex items-center justify-between mb-2">
                           <div className="font-semibold text-primary">Partita</div>
                           <div className="text-sm text-primary/70">
                             {format(new Date(match.match_date), "PPP", { locale: it })}
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                           <div>
                             <span className="text-primary/70">Giocatori: </span>
                             <span className="text-primary">
                               {getPlayerName(match.player1_id)} vs {getPlayerName(match.player2_id)}
                             </span>
                           </div>
                           <div>
                             <span className="text-primary/70">Risultato: </span>
                             <span className="text-primary">{match.score}</span>
                           </div>
                           <div>
                             <span className="text-primary/70">Vincitore: </span>
                             <span className="text-primary">
                               {getPlayerName(match.winner_id)} (+{match.points_awarded} pts)
                             </span>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Gestione Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
                <div>
                  <h4 className="font-semibold text-primary">Riorganizza Posizioni</h4>
                  <p className="text-sm text-primary/70">Riordina le posizioni nelle fasce</p>
                </div>
                <Button onClick={recalculateRankings} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riorganizza
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-semibold text-red-800">Reset Completo</h4>
                  <p className="text-sm text-red-600">Elimina tutti i dati del sistema</p>
                </div>
                <Button onClick={resetAllData} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="p-4 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Backup e Ripristino</h4>
                <p className="text-sm text-primary/70 mb-4">
                  Esporta i dati per creare un backup o importa un backup precedente
                </p>
                <div className="flex gap-2">
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Esporta Backup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('import-file-settings')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importa Backup
                  </Button>
                  <input
                    id="import-file-settings"
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bands" className="space-y-6">
          <BandManagement />
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <PositionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

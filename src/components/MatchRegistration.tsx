import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Calendar as CalendarIcon2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { useMatches, Match } from "@/hooks/useMatches";
import { toast } from "@/hooks/use-toast";
export const MatchRegistration = () => {
  const {
    players,
    loading: playersLoading,
    refetch: refetchPlayers
  } = usePlayers();
  const {
    matches,
    loading: matchesLoading,
    addMatch
  } = useMatches();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    player1_id: '',
    player2_id: '',
    winner_id: '',
    score: '',
    match_date: ''
  });
  const resetForm = () => {
    setFormData({
      player1_id: '',
      player2_id: '',
      winner_id: '',
      score: '',
      match_date: ''
    });
    setShowForm(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.player1_id || !formData.player2_id || !formData.winner_id || !formData.score || !formData.match_date) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive"
      });
      return;
    }
    if (formData.player1_id === formData.player2_id) {
      toast({
        title: "Errore",
        description: "Seleziona due giocatori diversi",
        variant: "destructive"
      });
      return;
    }
    if (formData.winner_id !== formData.player1_id && formData.winner_id !== formData.player2_id) {
      toast({
        title: "Errore",
        description: "Il vincitore deve essere uno dei due giocatori",
        variant: "destructive"
      });
      return;
    }
    try {
      await addMatch({
        player1_id: formData.player1_id,
        player2_id: formData.player2_id,
        winner_id: formData.winner_id,
        score: formData.score,
        match_date: formData.match_date,
        points_awarded: 250
      });

      // Refresh players to update rankings
      await refetchPlayers();
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Giocatore non trovato';
  };
  const getCountryFlag = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return '🏳️';
    const flags: {
      [key: string]: string;
    } = {
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
    return flags[player.nationality] || '🏳️';
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Registrazione Partite</h2>
          <p className="text-primary/70">Registra i risultati e aggiorna automaticamente i punti ATP</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={players.length < 2}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Partita
        </Button>
      </div>

      {players.length < 2 && !playersLoading && <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              ⚠️ Aggiungi almeno 2 giocatori nella sezione "Giocatori" per registrare partite.
            </p>
          </CardContent>
        </Card>}

      {showForm && <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Registra Nuova Partita</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Giocatore 1</Label>
                  <Select value={formData.player1_id} onValueChange={value => setFormData({
                ...formData,
                player1_id: value
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona giocatore 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => <SelectItem key={player.id} value={player.id}>
                          {getCountryFlag(player.id)} {player.first_name} {player.last_name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giocatore 2</Label>
                  <Select value={formData.player2_id} onValueChange={value => setFormData({
                ...formData,
                player2_id: value
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona giocatore 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.filter(p => p.id !== formData.player1_id).map(player => <SelectItem key={player.id} value={player.id}>
                          {getCountryFlag(player.id)} {player.first_name} {player.last_name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Vincitore</Label>
                  <Select value={formData.winner_id} onValueChange={value => setFormData({
                ...formData,
                winner_id: value
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona vincitore" />
                    </SelectTrigger>
                    <SelectContent>
                      {[formData.player1_id, formData.player2_id].filter(Boolean).map(playerId => <SelectItem key={playerId} value={playerId}>
                          {getCountryFlag(playerId)} {getPlayerName(playerId)}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="score">Punteggio</Label>
                  <Input id="score" value={formData.score} onChange={e => setFormData({
                ...formData,
                score: e.target.value
              })} placeholder="es. 6-4, 6-2" />
                </div>
                <div>
                  <Label htmlFor="date">Data Partita</Label>
                  <Input id="date" type="date" value={formData.match_date} onChange={e => setFormData({
                ...formData,
                match_date: e.target.value
              })} max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  Registra Partita
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Storico Partite</h3>
        {matchesLoading ? <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div> : matches.length === 0 ? <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon2 className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Nessuna partita registrata</h3>
              <p className="text-primary/70 text-center">
                Registra la prima partita per iniziare a vedere lo storico.
              </p>
            </CardContent>
          </Card> : <div className="grid gap-4">
            {matches.slice().reverse().map(match => <Card key={match.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary/70">
                      {format(new Date(match.match_date), "PPP", {
                  locale: it
                })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {getCountryFlag(match.player1_id)}
                          <span className={match.winner_id === match.player1_id ? 'font-bold text-primary' : 'text-gray-600'}>
                            {getPlayerName(match.player1_id)}
                          </span>
                          {match.winner_id === match.player1_id && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                      <span className="text-lg font-mono bg-primary/10 px-2 py-1 rounded">
                        {match.score}
                      </span>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {getCountryFlag(match.player2_id)}
                          <span className={match.winner_id === match.player2_id ? 'font-bold text-primary' : 'text-gray-600'}>
                            {getPlayerName(match.player2_id)}
                          </span>
                          {match.winner_id === match.player2_id && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
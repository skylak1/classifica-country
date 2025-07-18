
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Calendar as CalendarIcon2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate: string;
  points: number;
  previousRank?: number;
}

interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  score: string;
  date: string;
  pointsAwarded: number;
}

export const MatchRegistration = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('tennis-players', []);
  const [matches, setMatches] = useLocalStorage<Match[]>('tennis-matches', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    player1Id: '',
    player2Id: '',
    winnerId: '',
    score: '',
    date: ''
  });

  const resetForm = () => {
    setFormData({
      player1Id: '',
      player2Id: '',
      winnerId: '',
      score: '',
      date: ''
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.player1Id || !formData.player2Id || !formData.winnerId || 
        !formData.score || !formData.date) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    if (formData.player1Id === formData.player2Id) {
      toast({
        title: "Errore",
        description: "Seleziona due giocatori diversi",
        variant: "destructive"
      });
      return;
    }

    if (formData.winnerId !== formData.player1Id && formData.winnerId !== formData.player2Id) {
      toast({
        title: "Errore",
        description: "Il vincitore deve essere uno dei due giocatori",
        variant: "destructive"
      });
      return;
    }

    // Punti fissi per semplicità
    const pointsAwarded = 250;

    const newMatch: Match = {
      id: Date.now().toString(),
      player1Id: formData.player1Id,
      player2Id: formData.player2Id,
      winnerId: formData.winnerId,
      score: formData.score,
      date: formData.date,
      pointsAwarded
    };

    setMatches([...matches, newMatch]);

    // Update winner's points
    setPlayers(players.map(player => {
      if (player.id === formData.winnerId) {
        return {
          ...player,
          previousRank: getCurrentRank(player.id),
          points: player.points + pointsAwarded
        };
      }
      return player;
    }));

    toast({
      title: "Successo",
      description: `Partita registrata! ${pointsAwarded} punti assegnati al vincitore.`
    });

    resetForm();
  };

  const getCurrentRank = (playerId: string) => {
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    return sortedPlayers.findIndex(p => p.id === playerId) + 1;
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Giocatore non trovato';
  };

  const getCountryFlag = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return '🏳️';
    
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
    return flags[player.nationality] || '🏳️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-green-800">Registrazione Partite</h2>
          <p className="text-green-600">Registra i risultati e aggiorna automaticamente i punti ATP</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
          disabled={players.length < 2}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Partita
        </Button>
      </div>

      {players.length < 2 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              ⚠️ Aggiungi almeno 2 giocatori nella sezione "Giocatori" per registrare partite.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Registra Nuova Partita</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Giocatore 1</Label>
                  <Select value={formData.player1Id} onValueChange={(value) => setFormData({...formData, player1Id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona giocatore 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {getCountryFlag(player.id)} {player.firstName} {player.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giocatore 2</Label>
                  <Select value={formData.player2Id} onValueChange={(value) => setFormData({...formData, player2Id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona giocatore 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.filter(p => p.id !== formData.player1Id).map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {getCountryFlag(player.id)} {player.firstName} {player.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Vincitore</Label>
                  <Select value={formData.winnerId} onValueChange={(value) => setFormData({...formData, winnerId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona vincitore" />
                    </SelectTrigger>
                    <SelectContent>
                      {[formData.player1Id, formData.player2Id].filter(Boolean).map((playerId) => (
                        <SelectItem key={playerId} value={playerId}>
                          {getCountryFlag(playerId)} {getPlayerName(playerId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="score">Punteggio</Label>
                  <Input
                    id="score"
                    value={formData.score}
                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                    placeholder="es. 6-4, 6-2"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data Partita</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Registra Partita
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-800">Storico Partite</h3>
        {matches.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon2 className="h-16 w-16 text-green-300 mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Nessuna partita registrata</h3>
              <p className="text-green-600 text-center">
                Registra la prima partita per iniziare a vedere lo storico.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {matches.slice().reverse().map((match) => (
              <Card key={match.id} className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600">
                      {format(new Date(match.date), "PPP", { locale: it })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {getCountryFlag(match.player1Id)}
                          <span className={match.winnerId === match.player1Id ? 'font-bold text-green-800' : 'text-gray-600'}>
                            {getPlayerName(match.player1Id)}
                          </span>
                          {match.winnerId === match.player1Id && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                      <span className="text-lg font-mono bg-green-100 px-2 py-1 rounded">
                        {match.score}
                      </span>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {getCountryFlag(match.player2Id)}
                          <span className={match.winnerId === match.player2Id ? 'font-bold text-green-800' : 'text-gray-600'}>
                            {getPlayerName(match.player2Id)}
                          </span>
                          {match.winnerId === match.player2Id && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{match.pointsAwarded} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

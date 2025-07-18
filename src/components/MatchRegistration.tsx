
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Trophy, Calendar as CalendarIcon2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  tournament: string;
  level: string;
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
    date: undefined as Date | undefined,
    tournament: '',
    level: ''
  });

  const tournamentLevels = [
    { value: 'grand-slam', label: 'Grand Slam', points: [2000, 1200, 720, 360, 180, 90, 45, 10] },
    { value: 'masters-1000', label: 'Masters 1000', points: [1000, 600, 360, 180, 90, 45, 25, 10] },
    { value: 'atp-500', label: 'ATP 500', points: [500, 300, 180, 90, 45, 20, 12, 6] },
    { value: 'atp-250', label: 'ATP 250', points: [250, 150, 90, 45, 20, 12, 6, 3] },
    { value: 'challenger', label: 'Challenger', points: [80, 48, 29, 15, 7, 3, 1, 0] },
    { value: 'futures', label: 'Futures', points: [18, 12, 6, 3, 1, 0, 0, 0] }
  ];

  const calculatePoints = (level: string, round: string) => {
    const levelData = tournamentLevels.find(t => t.value === level);
    if (!levelData) return 0;

    const roundIndex = {
      'winner': 0,
      'final': 1,
      'semifinal': 2,
      'quarterfinal': 3,
      'round-16': 4,
      'round-32': 5,
      'round-64': 6,
      'round-128': 7
    }[round] || 0;

    return levelData.points[roundIndex] || 0;
  };

  const resetForm = () => {
    setFormData({
      player1Id: '',
      player2Id: '',
      winnerId: '',
      score: '',
      date: undefined,
      tournament: '',
      level: ''
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.player1Id || !formData.player2Id || !formData.winnerId || 
        !formData.score || !formData.date || !formData.tournament || !formData.level) {
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

    // Determine round based on score patterns (simplified logic)
    let round = 'round-32'; // default
    if (formData.tournament.toLowerCase().includes('final')) round = 'final';
    else if (formData.tournament.toLowerCase().includes('semifinal')) round = 'semifinal';
    else if (formData.tournament.toLowerCase().includes('quarterfinal')) round = 'quarterfinal';

    const pointsAwarded = calculatePoints(formData.level, round);

    const newMatch: Match = {
      id: Date.now().toString(),
      player1Id: formData.player1Id,
      player2Id: formData.player2Id,
      winnerId: formData.winnerId,
      score: formData.score,
      date: format(formData.date, 'yyyy-MM-dd'),
      tournament: formData.tournament,
      level: formData.level,
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

  const getTournamentLevelBadge = (level: string) => {
    const levelData = tournamentLevels.find(t => t.value === level);
    const colors = {
      'grand-slam': 'bg-purple-100 text-purple-800',
      'masters-1000': 'bg-red-100 text-red-800',
      'atp-500': 'bg-blue-100 text-blue-800',
      'atp-250': 'bg-green-100 text-green-800',
      'challenger': 'bg-orange-100 text-orange-800',
      'futures': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {levelData?.label || level}
      </Badge>
    );
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Data Partita</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? (
                          format(formData.date, "PPP", { locale: it })
                        ) : (
                          <span>Seleziona data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({...formData, date})}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="tournament">Nome Torneo</Label>
                  <Input
                    id="tournament"
                    value={formData.tournament}
                    onChange={(e) => setFormData({...formData, tournament: e.target.value})}
                    placeholder="es. Roland Garros"
                  />
                </div>
                <div>
                  <Label>Livello Torneo</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona livello" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournamentLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label} (Max {level.points[0]} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <div className="flex items-center gap-2">
                      {getTournamentLevelBadge(match.level)}
                      <span className="font-semibold text-green-800">{match.tournament}</span>
                    </div>
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

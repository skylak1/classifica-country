
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Trash2, Edit2, UserPlus } from "lucide-react";
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

export const PlayerManagement = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('tennis-players', []);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: '',
    birthDate: undefined as Date | undefined
  });

  const nationalities = [
    'Italia', 'Spagna', 'Francia', 'Germania', 'Regno Unito', 
    'Stati Uniti', 'Argentina', 'Brasile', 'Australia', 'Giappone',
    'Svizzera', 'Austria', 'Belgio', 'Olanda', 'Repubblica Ceca',
    'Russia', 'Serbia', 'Croazia', 'Grecia', 'Polonia'
  ];

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      nationality: '',
      birthDate: undefined
    });
    setEditingPlayer(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.nationality || !formData.birthDate) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    const playerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationality: formData.nationality,
      birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
      points: editingPlayer?.points || 0
    };

    if (editingPlayer) {
      setPlayers(players.map(p => 
        p.id === editingPlayer.id 
          ? { ...playerData, id: editingPlayer.id, previousRank: editingPlayer.previousRank }
          : p
      ));
      toast({
        title: "Successo",
        description: "Giocatore modificato con successo"
      });
    } else {
      const newPlayer: Player = {
        ...playerData,
        id: Date.now().toString()
      };
      setPlayers([...players, newPlayer]);
      toast({
        title: "Successo",
        description: "Giocatore aggiunto con successo"
      });
    }

    resetForm();
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      nationality: player.nationality,
      birthDate: new Date(player.birthDate)
    });
    setShowForm(true);
  };

  const handleDelete = (playerId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo giocatore?")) {
      setPlayers(players.filter(p => p.id !== playerId));
      toast({
        title: "Successo",
        description: "Giocatore eliminato con successo"
      });
    }
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
      'Giappone': '🇯🇵',
      'Svizzera': '🇨🇭',
      'Austria': '🇦🇹',
      'Belgio': '🇧🇪',
      'Olanda': '🇳🇱',
      'Repubblica Ceca': '🇨🇿',
      'Russia': '🇷🇺',
      'Serbia': '🇷🇸',
      'Croazia': '🇭🇷',
      'Grecia': '🇬🇷',
      'Polonia': '🇵🇱'
    };
    return flags[nationality] || '🏳️';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-green-800">Gestione Giocatori</h2>
          <p className="text-green-600">Aggiungi e gestisci i giocatori del circuito</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuovo Giocatore
        </Button>
      </div>

      {showForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              {editingPlayer ? 'Modifica Giocatore' : 'Nuovo Giocatore'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Inserisci il nome"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Inserisci il cognome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nazionalità</Label>
                  <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona nazionalità" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((country) => (
                        <SelectItem key={country} value={country}>
                          {getCountryFlag(country)} {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data di Nascita</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birthDate ? (
                          format(formData.birthDate, "PPP", { locale: it })
                        ) : (
                          <span>Seleziona data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birthDate}
                        onSelect={(date) => setFormData({...formData, birthDate: date})}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1950-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingPlayer ? 'Salva Modifiche' : 'Aggiungi Giocatore'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {players.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-green-300 mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Nessun giocatore registrato</h3>
              <p className="text-green-600 text-center">
                Clicca su "Nuovo Giocatore" per iniziare ad aggiungere giocatori al sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Card key={player.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getCountryFlag(player.nationality)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">
                        {player.firstName} {player.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {player.nationality}
                        </Badge>
                        <span className="text-green-600">
                          {calculateAge(player.birthDate)} anni
                        </span>
                        <span className="text-green-600">•</span>
                        <span className="text-green-600">
                          {player.points.toLocaleString()} punti ATP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(player)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(player.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

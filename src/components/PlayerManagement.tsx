
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, UserPlus } from "lucide-react";
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

export const PlayerManagement = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('tennis-players', []);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: '',
    birthDate: ''
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
      birthDate: ''
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
      birthDate: formData.birthDate,
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
      birthDate: player.birthDate
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
          <h2 className="text-3xl font-bold text-primary">Gestione Giocatori</h2>
          <p className="text-primary/70">Aggiungi e gestisci i giocatori del circuito</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuovo Giocatore
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">
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
                  <Label htmlFor="birthDate">Data di Nascita</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    min="1950-01-01"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
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
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Nessun giocatore registrato</h3>
              <p className="text-primary/70 text-center">
                Clicca su "Nuovo Giocatore" per iniziare ad aggiungere giocatori al sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Card key={player.id} className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getCountryFlag(player.nationality)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {player.firstName} {player.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {player.nationality}
                        </Badge>
                        <span className="text-primary/70">
                          {calculateAge(player.birthDate)} anni
                        </span>
                        <span className="text-primary/70">•</span>
                        <span className="text-primary/70">
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

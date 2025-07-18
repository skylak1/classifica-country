import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Loader2 } from "lucide-react";
import { usePlayers, Player } from "@/hooks/usePlayers";
import { toast } from "@/hooks/use-toast";

export const PlayerManagement = () => {
  const { players, loading, addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nationality: '',
    birth_date: '',
    points: 0
  });

  const nationalities = [
    'Italia', 'Spagna', 'Francia', 'Germania', 'Regno Unito', 
    'Stati Uniti', 'Argentina', 'Brasile', 'Australia', 'Giappone'
  ];

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      nationality: '',
      birth_date: '',
      points: 0
    });
    setShowForm(false);
    setEditingPlayer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.nationality || !formData.birth_date) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingPlayer) {
        // Update existing player
        await updatePlayer(editingPlayer.id, formData);
      } else {
        // Add new player
        await addPlayer(formData);
      }
      resetForm();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      nationality: player.nationality,
      birth_date: player.birth_date,
      points: player.points
    });
    setShowForm(true);
  };

  const handleDelete = async (playerId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      try {
        await deletePlayer(playerId);
      } catch (error) {
        // Error handling is done in the hook
      }
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
      'Giappone': '🇯🇵'
    };
    return flags[nationality] || '🏳️';
  };

  const calculateAge = (birth_date: string) => {
    const today = new Date();
    const birth = new Date(birth_date);
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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
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
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Nome del giocatore"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Cognome del giocatore"
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
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Lista Giocatori</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : players.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Nessun giocatore registrato</h3>
              <p className="text-primary/70 text-center">
                Clicca su "Nuovo Giocatore" per iniziare ad aggiungere giocatori al sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {players.map((player) => (
              <Card key={player.id} className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getCountryFlag(player.nationality)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-primary">
                            {player.first_name} {player.last_name}
                          </h3>
                          <span className="text-xl">{getCountryFlag(player.nationality)}</span>
                        </div>
                        <p className="text-primary/70">{player.nationality}</p>
                        <p className="text-sm text-primary/60">
                          {calculateAge(player.birth_date)} anni • Nato il {new Date(player.birth_date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-lg px-3 py-1 font-bold">
                        {player.points.toLocaleString()} pts
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(player)}
                        >
                          <Edit className="h-4 w-4" />
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
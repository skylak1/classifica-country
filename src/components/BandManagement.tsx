import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Users } from "lucide-react";
import { useBandSettings, BandSetting } from "@/hooks/useBandSettings";

export const BandManagement = () => {
  const { bandSettings, loading, updateBandSetting } = useBandSettings();
  const [editingBand, setEditingBand] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{[key: string]: {color: string, max_players: number}}>({});

  const handleEdit = (band: BandSetting) => {
    setEditingBand(band.id);
    setTempValues({
      ...tempValues,
      [band.id]: {
        color: band.color,
        max_players: band.max_players
      }
    });
  };

  const handleSave = async (band: BandSetting) => {
    const values = tempValues[band.id];
    if (values) {
      await updateBandSetting(band.id, {
        color: values.color,
        max_players: values.max_players
      });
    }
    setEditingBand(null);
  };

  const handleCancel = () => {
    setEditingBand(null);
    setTempValues({});
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento impostazioni fasce...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Gestione Fasce</h2>
        <p className="text-muted-foreground">
          Configura i colori e il numero massimo di giocatori per ogni fascia
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bandSettings.map((band) => {
          const isEditing = editingBand === band.id;
          const currentValues = tempValues[band.id] || {
            color: band.color,
            max_players: band.max_players
          };

          return (
            <Card key={band.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: isEditing ? currentValues.color : band.color }}
                    />
                    {band.band_name}
                  </CardTitle>
                  <Badge variant="outline" style={{ 
                    borderColor: isEditing ? currentValues.color : band.color,
                    color: isEditing ? currentValues.color : band.color
                  }}>
                    Fascia {band.band_number}
                  </Badge>
                </div>
                <CardDescription>
                  Configurazione per la fascia {band.band_number}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`color-${band.id}`} className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Colore fascia
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id={`color-${band.id}`}
                        type="color"
                        value={currentValues.color}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [band.id]: { ...currentValues, color: e.target.value }
                        })}
                        className="w-16 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentValues.color}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [band.id]: { ...currentValues, color: e.target.value }
                        })}
                        placeholder="#8B5CF6"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded border">
                      <div 
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: band.color }}
                      />
                      <span className="font-mono text-sm">{band.color}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`max-players-${band.id}`} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Numero massimo giocatori
                  </Label>
                  {isEditing ? (
                    <Input
                      id={`max-players-${band.id}`}
                      type="number"
                      min="1"
                      max="50"
                      value={currentValues.max_players}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [band.id]: { ...currentValues, max_players: parseInt(e.target.value) || 0 }
                      })}
                    />
                  ) : (
                    <div className="p-2 rounded border bg-muted/50">
                      <span className="font-semibold">{band.max_players}</span> giocatori
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={() => handleSave(band)}
                        size="sm"
                        className="flex-1"
                      >
                        Salva
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Annulla
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleEdit(band)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Modifica
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
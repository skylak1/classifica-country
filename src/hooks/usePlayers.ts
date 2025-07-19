import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  birth_date: string;
  points: number;
  previous_rank?: number;
  band_number: number;
  position_in_band: number;
  created_at?: string;
  updated_at?: string;
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('band_number', { ascending: true })
        .order('position_in_band', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i giocatori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      toast({
        title: "Successo",
        description: "Giocatore aggiunto con successo"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il giocatore",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const { error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      toast({
        title: "Successo",
        description: "Giocatore aggiornato con successo"
      });
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il giocatore",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      toast({
        title: "Successo",
        description: "Giocatore eliminato con successo"
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il giocatore",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAllPlayers = async () => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .gte('created_at', '1970-01-01'); // This deletes all rows

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      toast({
        title: "Successo",
        description: "Tutti i giocatori sono stati eliminati"
      });
    } catch (error) {
      console.error('Error deleting all players:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare tutti i giocatori",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return {
    players,
    loading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    deleteAllPlayers,
    refetch: fetchPlayers
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  score: string;
  match_date: string;
  points_awarded: number;
  created_at?: string;
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le partite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMatch = async (matchData: Omit<Match, 'id' | 'created_at'>) => {
    try {
      // First insert the match
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single();

      if (matchError) throw matchError;

      // La registrazione della partita è completata
      // Non aggiorniamo più punti o rank automaticamente
      
      await fetchMatches();
      toast({
        title: "Successo",
        description: "Partita registrata con successo"
      });

      return newMatch;
    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Errore",
        description: "Impossibile registrare la partita",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAllMatches = async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .gte('created_at', '1970-01-01'); // This deletes all rows

      if (error) throw error;
      
      await fetchMatches(); // Refresh the list
      toast({
        title: "Successo",
        description: "Tutte le partite sono state eliminate"
      });
    } catch (error) {
      console.error('Error deleting all matches:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare tutte le partite",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    addMatch,
    deleteAllMatches,
    refetch: fetchMatches
  };
};
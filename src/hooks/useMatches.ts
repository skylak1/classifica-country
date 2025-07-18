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

      // Then update the winner's points and previous rank
      const { data: currentWinner, error: winnerFetchError } = await supabase
        .from('players')
        .select('points')
        .eq('id', matchData.winner_id)
        .single();

      if (winnerFetchError) throw winnerFetchError;

      // Get current rank before updating points
      const { data: allPlayers, error: playersError } = await supabase
        .from('players')
        .select('id, points')
        .order('points', { ascending: false });

      if (playersError) throw playersError;

      const currentRank = allPlayers.findIndex(p => p.id === matchData.winner_id) + 1;

      // Update winner's points and previous rank
      const { error: updateError } = await supabase
        .from('players')
        .update({
          points: currentWinner.points + matchData.points_awarded,
          previous_rank: currentRank
        })
        .eq('id', matchData.winner_id);

      if (updateError) throw updateError;

      await fetchMatches(); // Refresh the list
      toast({
        title: "Successo",
        description: `Partita registrata! ${matchData.points_awarded} punti assegnati al vincitore.`
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
        .neq('id', ''); // This deletes all rows

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
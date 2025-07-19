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

      // Calcola automaticamente la nuova posizione in classifica
      await updatePlayerPositions(matchData.winner_id, matchData.player1_id, matchData.player2_id);
      
      await fetchMatches();
      toast({
        title: "Successo",
        description: "Partita registrata e classifica aggiornata!"
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

  // Funzione per aggiornare le posizioni dei giocatori dopo una partita
  const updatePlayerPositions = async (winnerId: string, player1Id: string, player2Id: string) => {
    try {
      // Ottieni i dati dei giocatori
      const { data: players, error } = await supabase
        .from("players")
        .select("*")
        .in("id", [player1Id, player2Id]);

      if (error) throw error;

      const winner = players.find(p => p.id === winnerId);
      const loser = players.find(p => p.id !== winnerId);

      if (!winner || !loser) return;

      // Se sono nella stessa fascia
      if (winner.band_number === loser.band_number) {
        // Se il vincitore aveva una posizione peggiore (numero più alto)
        if (winner.position_in_band > loser.position_in_band) {
          const winnerNewPosition = loser.position_in_band;
          const loserNewPosition = winner.position_in_band;

          // Sposta tutti i giocatori tra le due posizioni
          await adjustPositionsBetween(
            winner.band_number, 
            winnerNewPosition, 
            loserNewPosition - 1, 
            1
          );

          // Aggiorna le posizioni dei due giocatori
          await supabase
            .from("players")
            .update({ position_in_band: winnerNewPosition })
            .eq("id", winnerId);

          await supabase
            .from("players")
            .update({ position_in_band: loserNewPosition })
            .eq("id", loser.id);
        }
      } 
      // Se il vincitore è in una fascia inferiore e sfida quello superiore
      else if (winner.band_number > loser.band_number && winner.position_in_band === 1) {
        // Il vincitore sale di fascia e prende l'ultimo posto
        const { data: upperBandPlayers } = await supabase
          .from("players")
          .select("position_in_band")
          .eq("band_number", loser.band_number)
          .order("position_in_band", { ascending: false })
          .limit(1);

        const maxPosition = upperBandPlayers?.[0]?.position_in_band || 0;

        // Sposta il vincitore nella fascia superiore
        await supabase
          .from("players")
          .update({ 
            band_number: loser.band_number, 
            position_in_band: maxPosition 
          })
          .eq("id", winnerId);

        // Sposta il perdente nella fascia inferiore
        await supabase
          .from("players")
          .update({ 
            band_number: winner.band_number, 
            position_in_band: 1 
          })
          .eq("id", loser.id);

        // Riorganizza le posizioni nella fascia del vincitore originale
        await reorganizeBandPositions(winner.band_number);
        
        // Riorganizza le posizioni nella fascia del perdente originale
        await reorganizeBandPositions(loser.band_number);
      }

    } catch (error) {
      console.error("Error updating player positions:", error);
    }
  };

  // Funzione per aggiustare le posizioni tra due punti
  const adjustPositionsBetween = async (bandNumber: number, startPos: number, endPos: number, shift: number) => {
    const { error } = await supabase.rpc('adjust_positions_between', {
      band_num: bandNumber,
      start_pos: startPos,
      end_pos: endPos,
      position_shift: shift
    });
    
    if (error) {
      // Fallback: aggiorna manualmente
      const { data: playersToUpdate } = await supabase
        .from("players")
        .select("id, position_in_band")
        .eq("band_number", bandNumber)
        .gte("position_in_band", startPos)
        .lte("position_in_band", endPos);

      if (playersToUpdate) {
        for (const player of playersToUpdate) {
          await supabase
            .from("players")
            .update({ position_in_band: player.position_in_band + shift })
            .eq("id", player.id);
        }
      }
    }
  };

  // Funzione per riorganizzare le posizioni in una fascia
  const reorganizeBandPositions = async (bandNumber: number) => {
    const { data: bandPlayers } = await supabase
      .from("players")
      .select("id")
      .eq("band_number", bandNumber)
      .order("position_in_band", { ascending: true });

    if (bandPlayers) {
      for (let i = 0; i < bandPlayers.length; i++) {
        await supabase
          .from("players")
          .update({ position_in_band: i + 1 })
          .eq("id", bandPlayers[i].id);
      }
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
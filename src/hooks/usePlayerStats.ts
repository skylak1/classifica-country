import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlayerStats {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winPercentage: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  gameWinPercentage: number;
  totalSets: number;
  setsWon: number;
  setsLost: number;
  setWinPercentage: number;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  score: string;
  match_date: string;
  points_awarded: number;
}

export const usePlayerStats = (playerId: string | null) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseScore = (score: string) => {
    // Parse scores like "6-4, 6-2" or "6-4 6-2" or "6-4,6-2"
    const sets = score.replace(/\s+/g, ' ').split(/[,\s]+/).filter(s => s.includes('-'));
    
    let player1Games = 0, player2Games = 0;
    let player1Sets = 0, player2Sets = 0;
    
    sets.forEach(set => {
      const [p1, p2] = set.split('-').map(Number);
      if (!isNaN(p1) && !isNaN(p2)) {
        player1Games += p1;
        player2Games += p2;
        if (p1 > p2) player1Sets++;
        else player2Sets++;
      }
    });
    
    return {
      player1Games,
      player2Games,
      player1Sets,
      player2Sets,
      totalSets: sets.length
    };
  };

  const calculateStats = (matches: Match[], playerId: string): PlayerStats => {
    let totalMatches = 0;
    let matchesWon = 0;
    let totalGames = 0;
    let gamesWon = 0;
    let totalSets = 0;
    let setsWon = 0;

    matches.forEach(match => {
      if (match.player1_id === playerId || match.player2_id === playerId) {
        totalMatches++;
        
        if (match.winner_id === playerId) {
          matchesWon++;
        }

        const scoreData = parseScore(match.score);
        totalSets += scoreData.totalSets;
        
        if (match.player1_id === playerId) {
          totalGames += scoreData.player1Games + scoreData.player2Games;
          gamesWon += scoreData.player1Games;
          setsWon += scoreData.player1Sets;
        } else {
          totalGames += scoreData.player1Games + scoreData.player2Games;
          gamesWon += scoreData.player2Games;
          setsWon += scoreData.player2Sets;
        }
      }
    });

    const matchesLost = totalMatches - matchesWon;
    const gamesLost = totalGames - gamesWon;
    const setsLost = totalSets - setsWon;

    return {
      totalMatches,
      matchesWon,
      matchesLost,
      winPercentage: totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0,
      totalGames,
      gamesWon,
      gamesLost,
      gameWinPercentage: totalGames > 0 ? (gamesWon / totalGames) * 100 : 0,
      totalSets,
      setsWon,
      setsLost,
      setWinPercentage: totalSets > 0 ? (setsWon / totalSets) * 100 : 0,
    };
  };

  useEffect(() => {
    if (!playerId) {
      setStats(null);
      setMatches([]);
      return;
    }

    const fetchPlayerStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
          .order('match_date', { ascending: false });

        if (error) throw error;

        const playerMatches = data || [];
        const playerStats = calculateStats(playerMatches, playerId);
        
        setMatches(playerMatches);
        setStats(playerStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore nel caricamento delle statistiche");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [playerId]);

  return { stats, matches, loading, error };
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BandSetting {
  id: string;
  band_number: number;
  band_name: string;
  color: string;
  max_players: number;
  created_at: string;
  updated_at: string;
}

export const useBandSettings = () => {
  const [bandSettings, setBandSettings] = useState<BandSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBandSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("band_settings")
        .select("*")
        .order("band_number");

      if (error) throw error;
      setBandSettings(data || []);
    } catch (error) {
      console.error("Error fetching band settings:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le impostazioni delle fasce"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBandSetting = async (id: string, updates: Partial<BandSetting>) => {
    try {
      const { error } = await supabase
        .from("band_settings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchBandSettings();
      toast({
        title: "Successo",
        description: "Impostazioni fascia aggiornate"
      });
    } catch (error) {
      console.error("Error updating band setting:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare le impostazioni della fascia"
      });
    }
  };

  useEffect(() => {
    fetchBandSettings();
  }, []);

  return {
    bandSettings,
    loading,
    updateBandSetting,
    refetch: fetchBandSettings
  };
};
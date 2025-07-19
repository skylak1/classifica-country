-- Crea tabella per la configurazione delle fasce
CREATE TABLE public.band_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  band_number INTEGER NOT NULL UNIQUE CHECK (band_number >= 1 AND band_number <= 4),
  band_name TEXT NOT NULL,
  color TEXT NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.band_settings ENABLE ROW LEVEL SECURITY;

-- Crea policy per visualizzazione e modifica
CREATE POLICY "Band settings are viewable by everyone" 
ON public.band_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Band settings can be updated by everyone" 
ON public.band_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Band settings can be inserted by everyone" 
ON public.band_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Band settings can be deleted by everyone" 
ON public.band_settings 
FOR DELETE 
USING (true);

-- Inserisci configurazioni default delle fasce
INSERT INTO public.band_settings (band_number, band_name, color, max_players) VALUES
(1, 'Fascia 1', '#8B5CF6', 8),  -- Purple
(2, 'Fascia 2', '#3B82F6', 12), -- Blue
(3, 'Fascia 3', '#10B981', 16), -- Green
(4, 'Fascia 4', '#F59E0B', 20); -- Orange

-- Aggiungi colonne ai giocatori per il sistema a fasce
ALTER TABLE public.players 
ADD COLUMN band_number INTEGER DEFAULT 4,
ADD COLUMN position_in_band INTEGER DEFAULT 1;

-- Aggiungi constraints
ALTER TABLE public.players 
ADD CONSTRAINT check_band_number CHECK (band_number >= 1 AND band_number <= 4),
ADD CONSTRAINT check_position_positive CHECK (position_in_band >= 1);

-- Crea indici per performance
CREATE INDEX idx_players_band_position ON public.players(band_number, position_in_band);

-- Trigger per aggiornare timestamp
CREATE TRIGGER update_band_settings_updated_at
BEFORE UPDATE ON public.band_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  birth_date DATE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  previous_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  score TEXT NOT NULL,
  match_date DATE NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_winner CHECK (winner_id = player1_id OR winner_id = player2_id),
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a tennis ranking system)
CREATE POLICY "Players are viewable by everyone" 
ON public.players 
FOR SELECT 
USING (true);

CREATE POLICY "Players can be inserted by everyone" 
ON public.players 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Players can be updated by everyone" 
ON public.players 
FOR UPDATE 
USING (true);

CREATE POLICY "Players can be deleted by everyone" 
ON public.players 
FOR DELETE 
USING (true);

CREATE POLICY "Matches are viewable by everyone" 
ON public.matches 
FOR SELECT 
USING (true);

CREATE POLICY "Matches can be inserted by everyone" 
ON public.matches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Matches can be updated by everyone" 
ON public.matches 
FOR UPDATE 
USING (true);

CREATE POLICY "Matches can be deleted by everyone" 
ON public.matches 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_players_points ON public.players(points DESC);
CREATE INDEX idx_matches_date ON public.matches(match_date DESC);
CREATE INDEX idx_matches_players ON public.matches(player1_id, player2_id);
CREATE INDEX idx_matches_winner ON public.matches(winner_id);
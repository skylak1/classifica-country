-- Rimuovi la colonna points dalla tabella players
ALTER TABLE public.players DROP COLUMN points;

-- Rimuovi anche previous_rank che non serve più
ALTER TABLE public.players DROP COLUMN previous_rank;
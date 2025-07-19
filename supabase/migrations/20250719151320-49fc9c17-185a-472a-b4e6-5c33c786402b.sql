-- Funzioni per gestire i movimenti automatici di posizione

-- Funzione per spostare posizioni in una fascia
CREATE OR REPLACE FUNCTION shift_positions_in_band(
  band_num INTEGER,
  start_pos INTEGER,
  end_pos INTEGER,
  shift_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE players 
  SET position_in_band = position_in_band + shift_amount
  WHERE band_number = band_num 
    AND position_in_band >= start_pos 
    AND position_in_band <= end_pos;
END;
$$ LANGUAGE plpgsql;

-- Funzione per riorganizzare una fascia dopo la rimozione di un giocatore
CREATE OR REPLACE FUNCTION reorganize_band_after_removal(
  band_num INTEGER,
  removed_position INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE players 
  SET position_in_band = position_in_band - 1
  WHERE band_number = band_num 
    AND position_in_band > removed_position;
END;
$$ LANGUAGE plpgsql;

-- Funzione per fare spazio in una fascia per un nuovo giocatore
CREATE OR REPLACE FUNCTION make_space_in_band(
  band_num INTEGER,
  insert_position INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE players 
  SET position_in_band = position_in_band + 1
  WHERE band_number = band_num 
    AND position_in_band >= insert_position;
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiustare posizioni tra due punti
CREATE OR REPLACE FUNCTION adjust_positions_between(
  band_num INTEGER,
  start_pos INTEGER,
  end_pos INTEGER,
  position_shift INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE players 
  SET position_in_band = position_in_band + position_shift
  WHERE band_number = band_num 
    AND position_in_band >= start_pos 
    AND position_in_band <= end_pos;
END;
$$ LANGUAGE plpgsql;
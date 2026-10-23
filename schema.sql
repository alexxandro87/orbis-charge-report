CREATE TABLE IF NOT EXISTS sessioni (
  inizio_utc  INTEGER NOT NULL,
  fine_utc    INTEGER NOT NULL,
  tag         TEXT NOT NULL,        -- tessera all'avvio (vuoto = avviata da app)
  tag_tipo    TEXT,                 -- rfid_tag / app / evsm / viaris
  cont_ini_wh INTEGER NOT NULL,
  cont_fin_wh INTEGER NOT NULL,
  energia_wh  INTEGER NOT NULL,
  PRIMARY KEY (inizio_utc, cont_ini_wh)
);
-- attiva = 0: the card is no longer on the charger, or is blocked/expired/invalid there (refused over OCPP)
CREATE TABLE IF NOT EXISTS tessere (tag TEXT PRIMARY KEY, nome TEXT, attiva INTEGER NOT NULL DEFAULT 1);
-- who held each card and when (reports use the holder at the time of each session)
CREATE TABLE IF NOT EXISTS tessere_nomi (tag TEXT NOT NULL, nome TEXT NOT NULL, dal INTEGER NOT NULL, al INTEGER, man INTEGER DEFAULT 0, PRIMARY KEY (tag, dal));
CREATE TABLE IF NOT EXISTS prezzi (
  anno INTEGER NOT NULL, mese INTEGER NOT NULL, eur_kwh REAL NOT NULL, iva REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (anno, mese)
);
CREATE TABLE IF NOT EXISTS meta (chiave TEXT PRIMARY KEY, valore TEXT);

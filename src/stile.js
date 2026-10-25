// Stile grafico globale del sito: colori dei temi (giorno / notte / automatico), link e pulsanti.
// Viene aggiunto in fondo a <head> di tutte le pagine (area riservata, login/registrazione, invito),
// quindi prevale sulle regole delle singole pagine. Per cambiare l'aspetto di tutto il sito si modifica solo questo file.
const GIORNO = "--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--btx:#fff;--esci:#c62828;--err:#b00020;--ok:#1a7f37";
const NOTTE = "--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--btx:#0b1220;--esci:#e5534b;--err:#ff7a8a;--ok:#4cc26a";

export const STILE = [
  // temi: "Auto" segue il sistema, "Giorno" e "Notte" forzano la scelta (attributo data-t su <html>)
  ":root{" + GIORNO + ";color-scheme:light dark}",
  "@media (prefers-color-scheme:dark){:root:not([data-t=light]){" + NOTTE + "}}",
  ":root[data-t=light]{" + GIORNO + ";color-scheme:light}",
  ":root[data-t=dark]{" + NOTTE + ";color-scheme:dark}",
  "body{background:var(--bg);color:var(--tx)}",
  "a{color:var(--acc)}",
  // pulsanti: tutti azzurri con lo stesso stile
  "button{cursor:pointer;background:var(--acc);border:1px solid var(--acc);color:var(--btx);border-radius:6px}",
  "button:not(:disabled):hover{filter:brightness(1.08)}",
  "button:disabled{opacity:.5;cursor:default}",
  // eccezioni: link in alto (lingua, tema, cambia password) e schede del menu
  "button.l{background:none;border-color:transparent;color:var(--acc)}",
  "nav button{background:none;color:var(--tx)}",
  ".tabs button{background:var(--bg);color:var(--tx);border-color:var(--line)}",
  ".tabs button.on{background:var(--acc);border-color:var(--acc);color:var(--btx)}",
  // pulsante Esci: rosso
  "#bEsci{background:var(--esci);border-color:var(--esci);color:#fff}",
].join("\n");

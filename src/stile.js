// Global stylesheet of the site: theme colours (day / night / auto), links and buttons.
// Appended at the end of <head> of every page (reserved area, sign-in/registration, invitation),
// so it overrides the rules of the single pages. To change the look of the whole site edit only this file.
const GIORNO = "--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--btx:#fff;--esci:#c62828;--err:#b00020;--ok:#1a7f37";
const NOTTE = "--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--btx:#0b1220;--esci:#e5534b;--err:#ff7a8a;--ok:#4cc26a";

export const STILE = [
  // themes: "Auto" follows the system, "Day" and "Night" force the choice (data-t attribute on <html>)
  ":root{" + GIORNO + ";color-scheme:light dark}",
  "@media (prefers-color-scheme:dark){:root:not([data-t=light]){" + NOTTE + "}}",
  ":root[data-t=light]{" + GIORNO + ";color-scheme:light}",
  ":root[data-t=dark]{" + NOTTE + ";color-scheme:dark}",
  "body{background:var(--bg);color:var(--tx)}",
  "a{color:var(--acc)}",
  // buttons: all blue with the same style
  "button{cursor:pointer;background:var(--acc);border:1px solid var(--acc);color:var(--btx);border-radius:6px}",
  "button:not(:disabled):hover{filter:brightness(1.08)}",
  "button:disabled{opacity:.5;cursor:default}",
  // exceptions: header links (language, theme, change password) and menu tabs
  "button.l{background:none;border-color:transparent;color:var(--acc)}",
  "nav button{background:none;color:var(--tx)}",
  ".tabs button{background:var(--bg);color:var(--tx);border-color:var(--line)}",
  ".tabs button.on{background:var(--acc);border-color:var(--acc);color:var(--btx)}",
  // Log out button: red
  "#bEsci{background:var(--esci);border-color:var(--esci);color:#fff}",
  // version next to the title: small and grey
  ".ver{font-size:.65em;font-weight:400;color:var(--mut);white-space:nowrap}",
  ".verM{display:none}",                                    // copy for phones, where the title is hidden
  // ---------- phone (up to 700 px): app-like look ----------
  "#titoloM,nav .ico,nav .lbM,#navAltro,#altroM{display:none}",
  // prepaid cards: number tiles, credit bar, status labels
  ".metri{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:8px 0}",
  ".metri div{border:1px solid var(--line);border-radius:10px;padding:8px 12px}",
  ".metri small{display:block;color:var(--mut);font-size:12px}",
  ".metri b{font-size:20px;font-weight:600}",
  ".barra{height:8px;border-radius:4px;background:var(--line);overflow:hidden;margin:8px 0}",
  ".barra div{height:100%;background:var(--acc)}.barra div.warn{background:#b8780a}.barra div.err{background:var(--esci)}",
  ".pst{display:inline-block;padding:1px 8px;border-radius:6px;font-size:12px;border:1px solid var(--line);white-space:nowrap}",
  ".pst.ok{color:#2a8a55}.pst.warn,b.warn{color:#b8780a}.pst.err{color:var(--esci)}",
  "@media (max-width:700px){" + [
    "html,body{overflow-x:clip}body{background:var(--bg)}",
    // tables not turned into cards (e.g. Information): wrap instead of widening the page
    "table:not(.tbm) th,table:not(.tbm) td{white-space:normal;overflow-wrap:anywhere}",
    "header{padding:calc(14px + env(safe-area-inset-top)) 16px 12px;border-bottom:0;background:var(--bg)}",
    "header h1{display:none}",
    "#titoloM{display:block;font-size:24px;font-weight:700;letter-spacing:-.02em;margin:0}",
    "header .top:first-child{flex-direction:column-reverse;align-items:stretch;gap:6px}",
    ".utente{justify-content:flex-end;gap:4px 12px;font-size:14px}",
    "#chi{display:none}",
    ".verM{display:block;order:9;flex-basis:100%;text-align:right;font-size:12px;margin-top:-4px}",   // own line, below the links
    "header button{min-height:36px;font-size:14px}",
    "#bEsci{border-radius:10px;padding:0 14px}",
    ".riga2{flex-direction:column;align-items:stretch;gap:10px;margin-top:10px}",
    ".azioni{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".azioni button{min-height:44px;border-radius:12px;white-space:normal}",
    ".pwbox{flex-direction:column;align-items:stretch}",
    "main{padding:4px 14px calc(96px + env(safe-area-inset-bottom))}",
    ".card{border-radius:18px;padding:16px;margin:12px 0;box-shadow:0 1px 2px rgba(20,24,31,.05)}",
    "h2{font-size:17px;margin:0 0 10px}",
    "button,select,input,textarea{min-height:44px;font-size:16px;border-radius:12px}",
    "input[type=checkbox],input[type=radio]{min-height:0;width:20px;height:20px}",
    "button.l{min-height:36px}",
    // bottom tab bar
    "nav{position:fixed;left:0;right:0;bottom:0;z-index:20;margin:0;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:0;background:var(--card);border-top:1px solid var(--line);border-bottom:0;padding:6px 4px calc(8px + env(safe-area-inset-bottom));font-size:15px!important}",
    "nav button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;min-height:52px;padding:4px 2px;border:0!important;border-radius:10px;font-size:0!important;color:var(--mut);white-space:normal}",
    "nav button.on{color:var(--acc);font-weight:600}",
    "nav button.fuori{display:none}",
    "nav .ico{display:block;order:-1;line-height:0}",
    "nav .lbM{display:block;font-size:11px;line-height:1.15;text-align:center}",
    "#navAltro{display:flex}",
    "nav #navN,nav #navUN,nav #navTN{position:absolute;top:0;left:50%;margin-left:6px;font-size:10px;padding:1px 6px}",
    // "More" panel
    "#altroM.aperto{display:block;position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:21;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;box-shadow:0 12px 32px rgba(0,0,0,.25)}",
    "#altroM button{display:flex;width:100%;align-items:center;gap:12px;min-height:50px;padding:0 14px;background:none;border:0;border-radius:12px;color:var(--tx);font-size:16px;text-align:left}",
    "#altroM button.on{color:var(--acc);font-weight:600}",
    // sign-in and registration
    ".tabs{background:var(--line);border-radius:12px;padding:4px;gap:4px}",
    ".tabs button{background:transparent;border:0;border-radius:9px;color:var(--mut);min-height:40px}",
    ".tabs button.on{background:var(--card);color:var(--tx);border:0;font-weight:600;box-shadow:0 1px 2px rgba(20,24,31,.15)}",
  ].join("") + "}",
].join("\n");

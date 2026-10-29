// Global stylesheet of the site: rounded cards, an icon for each section, tab bar at the bottom on phones and at the
// top on desktop, blue as the site colour.
// Appended at the end of <head> of every page (reserved area, sign-in/registration, invitation, setup),
// so it overrides the rules of the single pages. To change the look of the whole site edit only this file.
const GIORNO = "--bg:#f2f4f8;--card:#fff;--tx:#141a22;--mut:#5d6878;--line:#dde3eb;--acc:#0b6bcb;--acc2:#0957a8;--btx:#fff;--soft:#e7f0fb;--ring:rgba(11,107,203,.22);--esci:#c62828;--err:#b3261e;--ok:#1b7f3b;--ombra:0 1px 2px rgba(20,26,34,.05)";
const NOTTE = "--bg:#0f1318;--card:#18202a;--tx:#e8edf3;--mut:#97a3b2;--line:#29333f;--acc:#5aa6ff;--acc2:#3d8ff0;--btx:#0b1220;--soft:#1b2b40;--ring:rgba(90,166,255,.3);--esci:#e5534b;--err:#ff8a80;--ok:#5fd38d;--ombra:0 1px 2px rgba(0,0,0,.3)";

export const STILE = [
  // themes: "Auto" follows the system, "Day" and "Night" force the choice (data-t attribute on <html>)
  ":root{" + GIORNO + ";color-scheme:light dark}",
  "@media (prefers-color-scheme:dark){:root:not([data-t=light]){" + NOTTE + "}}",
  ":root[data-t=light]{" + GIORNO + ";color-scheme:light}",
  ":root[data-t=dark]{" + NOTTE + ";color-scheme:dark}",
  "body{background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}",
  "a{color:var(--acc)}",
  "h2{font-size:17px;font-weight:650;letter-spacing:-.01em;margin:0 0 10px}",
  // cards
  ".card{border-radius:18px;padding:16px;box-shadow:var(--ombra)}",
  // fields
  "input,select,textarea{border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--tx);padding:8px 12px;min-height:40px;outline:none}",
  "input:focus,select:focus,textarea:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--ring)}",
  "input[type=checkbox],input[type=radio]{min-height:0;width:18px;height:18px;padding:0;accent-color:var(--acc)}",
  "input[type=file]{min-height:0}",
  // buttons: all blue with the same style
  "button{cursor:pointer;background:var(--acc);border:1px solid var(--acc);color:var(--btx);border-radius:12px;min-height:40px;padding:8px 16px;font-weight:600}",
  "button:not(:disabled):hover{background:var(--acc2);border-color:var(--acc2)}",
  "button:disabled{opacity:.5;cursor:default}",
  // exceptions: header links (language, theme, change password) and the secondary import button
  "button.l{background:none;border-color:transparent;color:var(--acc);min-height:0;padding:4px 6px}button.l:not(:disabled):hover{background:none;border-color:transparent;text-decoration:underline}",
  "#bImporta{background:transparent;color:var(--tx);border-color:var(--line)}#bImporta:not(:disabled):hover{background:var(--soft);border-color:var(--line)}",
  // Log out button: red
  "#bEsci{background:var(--esci);border-color:var(--esci);color:#fff}#bEsci:hover{filter:brightness(1.08)}",
  // labels
  ".pill{border-radius:999px;padding:2px 9px;font-weight:600}",
  // tables: roomier rows, light blue on hover
  "th,td{padding:8px 9px}th{font-weight:600}",
  "tr.cl:hover,tr.rs:hover td,tr.ut:hover td{background:var(--soft)}",
  "td button{min-height:32px;padding:4px 10px;font-size:13px;border-radius:10px}",
  // brand mark next to the title: blue square with a bolt
  ".marca{display:flex;align-items:center;gap:12px;min-width:0}",
  ".logo{flex:none;width:40px;height:40px;border-radius:12px;background:var(--acc);color:var(--btx);display:flex;align-items:center;justify-content:center}",
  ".logo svg{width:24px;height:24px}",
  // version next to the title: small and grey
  ".ver{font-size:.55em;font-weight:400;color:var(--mut);white-space:nowrap}",
  ".verM{display:none}",                                    // copy for phones, where the title is hidden
  "#titoloM,nav .lbM,#navAltro,#altroM{display:none}",
  // prepaid cards: number tiles, credit bar, status labels
  ".metri{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:8px 0}",
  ".metri div{border:1px solid var(--line);border-radius:14px;padding:10px 14px;background:var(--bg)}",
  ".metri small{display:block;color:var(--mut);font-size:12px}",
  ".metri b{font-size:20px;font-weight:650}",
  ".barra{height:8px;border-radius:4px;background:var(--line);overflow:hidden;margin:8px 0}",
  ".barra div{height:100%;background:var(--acc)}.barra div.warn{background:#b8780a}.barra div.err{background:var(--esci)}",
  ".pst{display:inline-block;padding:1px 9px;border-radius:999px;font-size:12px;border:1px solid var(--line);white-space:nowrap}",
  ".pst.ok{color:#2a8a55}.pst.warn,b.warn{color:#b8780a}.pst.err{color:var(--esci)}",
  // show/hide button next to every password field (all pages)
  ".occhio{margin-left:4px;padding:2px 10px;min-height:0;font-size:12px;font-weight:500;line-height:1.4;background:transparent;border:1px solid var(--line);color:var(--mut);border-radius:8px;vertical-align:middle;cursor:pointer}",
  ".occhio:not(:disabled):hover{background:var(--soft);border-color:var(--line)}",
  "form>.occhio,label>.occhio{align-self:flex-end}body>.card .occhio,body>.card .occhio:not(:disabled):hover{min-height:0;color:var(--mut)}",
  // live check that the two passwords match
  ".pwm{font-size:12px;min-height:1em;margin-top:-4px}.pwm.ok{color:#2a8a55}.pwm.no{color:var(--esci)}",
  // sign-in, registration, invitation and setup: one centred card, segmented Sign in / Sign up tabs
  "body>.card{border-radius:18px;padding:22px;box-shadow:0 10px 30px rgba(20,26,34,.08)}",
  "body>.card .marca{margin:0 0 4px}body>.card h1{font-size:19px;margin:0;overflow-wrap:anywhere}",
  "body>.card input,body>.card select,body>.card button{min-height:44px}",
  "body>.card details{border-radius:12px}",
  ".tabs{display:flex;background:var(--line);border-radius:12px;padding:4px;gap:4px}",
  ".tabs button{flex:1;background:transparent;border:0;border-radius:9px;color:var(--mut);min-height:38px}",
  ".tabs button:not(:disabled):hover{background:transparent;color:var(--tx)}",
  ".tabs button.on,.tabs button.on:not(:disabled):hover{background:var(--card);color:var(--tx);border:0;box-shadow:0 1px 2px rgba(20,26,34,.15)}",

  // ---------- desktop (over 700 px): the header scrolls away, tabs with icons stay at the top ----------
  "@media (min-width:701px){" + [
    "header{background:transparent;border:0;padding:20px 24px 8px;max-width:1400px;margin:0 auto}",
    "header h1{font-size:22px;font-weight:750;letter-spacing:-.01em}",
    ".utente{gap:6px 10px}",
    "header .riga2{margin-top:12px}",
    "#bEsci{min-height:34px;padding:4px 14px;font-size:13px}",
    "header .azioni button{min-height:38px}",
    // full-width tab bar fixed at the top while scrolling, buttons aligned with the page content
    "nav{position:sticky;top:0;z-index:30;display:flex;flex-wrap:nowrap;gap:4px;overflow-x:auto;scrollbar-width:thin;margin:0 0 4px;padding:6px max(16px,calc((100% - 1400px)/2 + 16px));border:0;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px)}",
    "nav button{display:flex;align-items:center;gap:8px;flex:none;min-height:40px;padding:6px 13px;background:none;border:0;border-radius:12px;color:var(--mut);font-size:14px;font-weight:600}",
    "nav button:not(:disabled):hover{background:var(--soft);border:0;color:var(--tx)}",
    "nav button.on,nav button.on:not(:disabled):hover{background:var(--soft);color:var(--acc)}",
    "nav .ico{display:flex;order:-1;line-height:0}nav .ico svg{width:18px;height:18px}",
    "nav #navN,nav #navUN,nav #navTN{margin-left:0}",
    "html{scroll-padding-top:70px}",
    "main{padding:4px 24px 24px}",
  ].join("") + "}",

  // ---------- phone (up to 700 px): app-like look ----------
  "@media (max-width:700px){" + [
    "html,body{overflow-x:clip}body{background:var(--bg)}",
    // tables not turned into cards (e.g. Information): wrap instead of widening the page
    "table:not(.tbm) th,table:not(.tbm) td{white-space:normal;overflow-wrap:anywhere}",
    "header{padding:calc(14px + env(safe-area-inset-top)) 16px 12px;border-bottom:0;background:var(--bg)}",
    "html{scroll-padding-top:0}",
    "header .marca{display:none}",
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
    ".card{margin:12px 0}",
    "button,select,input,textarea{min-height:44px;font-size:16px}",
    "input[type=checkbox],input[type=radio]{min-height:0;width:20px;height:20px}",
    "button.l{min-height:36px}",
    // bottom tab bar
    "nav{position:fixed;left:0;right:0;bottom:0;z-index:20;margin:0;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:0;background:var(--card);border-top:1px solid var(--line);border-bottom:0;padding:6px 4px calc(8px + env(safe-area-inset-bottom));font-size:15px!important}",
    "nav button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;min-height:52px;padding:4px 2px;background:none;border:0!important;border-radius:12px;font-size:0!important;color:var(--mut);white-space:normal}",
    "nav button:not(:disabled):hover{background:var(--soft)}",
    "nav button.on,nav button.on:not(:disabled):hover{color:var(--acc);background:var(--soft);font-weight:600}",
    "nav button.fuori{display:none}",
    "nav .ico{display:block;order:-1;line-height:0}",
    "nav .lbM{display:block;font-size:11px;line-height:1.15;text-align:center}",
    "#navAltro{display:flex}",
    "nav #navN,nav #navUN,nav #navTN{position:absolute;top:0;left:50%;margin-left:6px;font-size:10px;padding:1px 6px}",
    // "More" panel
    "#altroM.aperto{display:block;position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:21;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;box-shadow:0 12px 32px rgba(0,0,0,.25)}",
    "#altroM button{display:flex;width:100%;align-items:center;gap:12px;min-height:50px;padding:0 14px;background:none;border:0;border-radius:12px;color:var(--tx);font-size:16px;text-align:left}",
    "#altroM button:not(:disabled):hover{background:var(--soft)}",
    "#altroM button.on{color:var(--acc);font-weight:600}",
    // sign-in pages: full-width card
    "body>.card{width:calc(100vw - 24px);padding:20px 18px}",
    // theme and language on their own row at the top right, the title below with the full width
    "body>.card>.marca{clear:both;padding-top:8px}body>.card h1{font-size:18px;line-height:1.25}",
  ].join("") + "}",
].join("\n");

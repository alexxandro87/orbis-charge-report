// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Alessandro Pomponi. This program is free software under the GNU Affero General Public License v3 or later; see LICENSE.
//
// Orbis Viaris Charge Report - Cloudflare Worker (API + pages + scheduled download from the charger + OCPP server)
// Everything about the installation (charger address, title, time zone, currency, email, legal texts, card fee)
// is entered from the web page: nothing in the code is specific to one installation.
import { HTML, LOGIN, INVITO, SETUP } from "./ui.js";
import { STILE } from "./stile.js";
// every page gets the global stylesheet (stile.js) at the end of <head>
const conStile = (h) => h.replace("</head>", "<style>\n" + STILE + "\n</style>\n</head>");
const P_HTML = conStile(HTML), P_LOGIN = conStile(LOGIN), P_INVITO = conStile(INVITO), P_SETUP = conStile(SETUP);
const escHtml = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pagina = (h) => h.replaceAll("__TITLE__", () => escHtml(TITOLO));   // site title from Settings
// anti-bot check (Cloudflare Turnstile) on registration, optional: TURNSTILE_SITE_KEY in wrangler.toml and the TURNSTILE_SECRET secret
const turnstileAttivo = (env) => !!(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET);
const paginaLogin = (env) => turnstileAttivo(env)
  ? P_LOGIN.replace("__TURNSTILE__", `<div class="cf-turnstile" data-sitekey="${escHtml(env.TURNSTILE_SITE_KEY)}" data-theme="auto"></div><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`)
  : P_LOGIN.replace("__TURNSTILE__", "");
async function verificaTurnstile(env, token, ip) {
  if (!turnstileAttivo(env)) return true;
  if (!token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: String(token).slice(0, 4000), remoteip: ip }) });
    return !!(await r.json()).success;
  } catch (_) { return false; }
}
// attempt limit per IP address (besides the one per user name): max errors in 10 minutes; returns true when blocked
async function ipBloccato(env, req, cosa, max) {
  const ip = req.headers.get("cf-connecting-ip") || "?", ora = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM tentativi WHERE ts < ?").bind(ora - 600).run();
  return (await env.DB.prepare("SELECT COUNT(*) n FROM tentativi WHERE nome=?").bind(cosa + ":" + ip).first()).n >= max;
}
async function ipErrore(env, req, cosa) {
  await env.DB.prepare("INSERT INTO tentativi VALUES (?, ?)").bind(cosa + ":" + (req.headers.get("cf-connecting-ip") || "?"), Math.floor(Date.now() / 1000)).run();
}

let TITOLO = "EV Charger";            // site title (from Settings, set by leggiConfig on every request)
let TZ = "Europe/Rome";                // time zone for months, reports and dates (from Settings)
let VALUTA = "€";                 // currency symbol (from Settings)
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
  "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

// ------------------------------------------------------------ local time (any IANA time zone)
const tzFmt = new Map();
function offsetTz(epoch) {             // offset of TZ from UTC at that instant, in seconds
  let f = tzFmt.get(TZ);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "numeric",
      day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    tzFmt.set(TZ, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(epoch * 1000)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) / 1000 - Math.floor(epoch);
}
function epochDaLocale(y, mo, d, h = 0, mi = 0) {   // local wall-clock time -> epoch seconds
  const ts = Date.UTC(y, mo - 1, d, h, mi) / 1000;
  let e = ts - offsetTz(ts);
  e = ts - offsetTz(e);
  return e;
}
function intervalloMese(anno, mese) {
  const [a, m] = mese === 12 ? [anno + 1, 1] : [anno, mese + 1];
  return [epochDaLocale(anno, mese, 1), epochDaLocale(a, m, 1)];
}
const p2 = (n) => String(n).padStart(2, "0");
const isoLocale = (e) => { const d = new Date((e + offsetTz(e)) * 1000); return `${p2(d.getUTCDate())}-${p2(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`; };
function fmtLocale(epoch) {
  const d = new Date((epoch + offsetTz(epoch)) * 1000);
  return `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
}

// -------------------------------------------------------------- price lock
// A month's price can be entered whenever you want (even late, when the bill arrives);
// as soon as it is saved the month is locked and can no longer be changed.

// -------------------------------------------------------------- amounts
const r2 = (x) => Math.round(x * 100 + 1e-7) / 100;
const euro = (kwh, prezzo) => (prezzo == null ? null : r2(kwh * prezzo));
const iva = (imp, pct) => (imp == null ? null : r2((imp * pct) / 100));

// Splits a total in cents among items, in proportion to the weights (largest-remainder method):
// the sum of the single sessions always equals the card total.
function ripartisci(totCent, pesi) {
  if (!pesi.length) return [];
  const S = pesi.reduce((a, b) => a + b, 0);
  if (S <= 0) {
    const q = Math.floor(totCent / pesi.length), out = pesi.map(() => q);
    out[0] += totCent - q * pesi.length;
    return out;
  }
  const quote = pesi.map((p) => (totCent * p) / S);
  const out = quote.map(Math.floor);
  const resto = totCent - out.reduce((a, b) => a + b, 0);
  const ord = quote.map((q, i) => [q - Math.floor(q), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < resto; k++) out[ord[k % ord.length][1]]++;
  return out;
}
// Net amount, VAT and total of every single session of a group (same card and same month).
// perSessione=true for app sessions, which are rounded one by one.
function costiGruppo(whList, prezzo, pct, perSessione) {
  if (prezzo == null) return whList.map(() => ({ imp: null, iva: null, tot: null }));
  const impC = perSessione
    ? whList.map((wh) => Math.round(euro(wh / 1000, prezzo) * 100))
    : ripartisci(Math.round(euro(whList.reduce((a, b) => a + b, 0) / 1000, prezzo) * 100), whList);
  const impTot = impC.reduce((a, b) => a + b, 0);
  const ivaC = ripartisci(Math.round(iva(impTot / 100, pct) * 100), impC);
  return impC.map((c, i) => ({ imp: c / 100, iva: ivaC[i] / 100, tot: (c + ivaC[i]) / 100 }));
}
const annoMeseLocale = (epoch) => {
  const d = new Date((epoch + offsetTz(epoch)) * 1000);
  return d.getUTCFullYear() * 100 + d.getUTCMonth() + 1;
};

// -------------------------------------------------------------- card holder history
// A returned card can be reassigned: every session belongs to whoever held the card at that time.
// Each row = one period (tag, nome, dal, al); empty al = card still assigned. Dates can be corrected from the Settings tab.
let nomiTabellaOk = false;
const dataLocale = (s) => {                               // accepts dd-mm-yyyy (also with / or no separators) and yyyy-mm-dd
  const t = String(s || "").trim();
  let m = /^(\d{1,2})[\/.-]?(\d{1,2})[\/.-]?(\d{4})$/.exec(t);
  if (m) return epochDaLocale(+m[3], +m[2], +m[1]);
  m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(t);
  return m ? epochDaLocale(+m[1], +m[2], +m[3]) : null;
};
async function syncNomi(env) {
  if (!nomiTabellaOk) {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS tessere_nomi (tag TEXT NOT NULL, nome TEXT NOT NULL, dal INTEGER NOT NULL, al INTEGER, man INTEGER DEFAULT 0, PRIMARY KEY (tag, dal))").run();
    const col = (await env.DB.prepare("PRAGMA table_info(tessere_nomi)").all()).results.map((c) => c.name);
    if (!col.includes("al")) await env.DB.prepare("ALTER TABLE tessere_nomi ADD COLUMN al INTEGER").run();
    if (!col.includes("man")) await env.DB.prepare("ALTER TABLE tessere_nomi ADD COLUMN man INTEGER DEFAULT 0").run();
    const colT = (await env.DB.prepare("PRAGMA table_info(tessere)").all()).results.map((c) => c.name);
    if (colT.length && !colT.includes("attiva")) await env.DB.prepare("ALTER TABLE tessere ADD COLUMN attiva INTEGER NOT NULL DEFAULT 1").run();
    // initial periods (dal 0): start the day before the card's first session
    await env.DB.prepare("UPDATE tessere_nomi SET dal = (SELECT MIN(inizio_utc) - 86400 FROM sessioni WHERE sessioni.tag = tessere_nomi.tag) " +
      "WHERE dal = 0 AND EXISTS (SELECT 1 FROM sessioni WHERE sessioni.tag = tessere_nomi.tag)").run();
    // periods with no sessions still at 1970: start now
    await env.DB.prepare("UPDATE tessere_nomi SET dal = ? WHERE dal = 0").bind(Math.floor(Date.now() / 1000)).run();
    nomiTabellaOk = true;
  }
  const cor = (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results;
  const rs = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_stato'").first();
  let presenti = null;                                       // cards now on the charger (removed ones stay in 'tessere' for the history)
  if (rs) { try { presenti = new Set(JSON.parse(rs.valore).map((x) => x.id)); } catch (_) { presenti = null; } }
  const pm = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='nomi_presenti'").first();
  let prev = null;                                           // cards present at the last check: needed to recognise a card coming back
  if (pm) { try { prev = new Set(JSON.parse(pm.valore)); } catch (_) { prev = null; } }
  const ult = new Map((await env.DB.prepare(
    "SELECT tag, nome, dal, al FROM tessere_nomi n WHERE dal = (SELECT MAX(dal) FROM tessere_nomi WHERE tag = n.tag)").all()).results.map((r) => [r.tag, r]));
  const prima = new Map((await env.DB.prepare("SELECT tag, MIN(inizio_utc) p FROM sessioni GROUP BY tag").all()).results.map((r) => [r.tag, r.p]));
  const ora = Math.floor(Date.now() / 1000), st = [];
  for (const c of cor) {
    if (!c.nome || (presenti && !presenti.has(c.tag))) continue;
    const u = ult.get(c.tag);
    if (!u) {                                                // first time seen: valid from the day before its first use
      const p = prima.get(c.tag);
      st.push(env.DB.prepare("INSERT OR REPLACE INTO tessere_nomi (tag, nome, dal) VALUES (?,?,?)").bind(c.tag, c.nome, p && p < ora ? p - 86400 : ora));
    } else if (u.al != null) {                               // deactivated and now on the charger again (it was not there before): new assignment
      if (prev && !prev.has(c.tag)) st.push(env.DB.prepare("INSERT OR REPLACE INTO tessere_nomi (tag, nome, dal) VALUES (?,?,?)").bind(c.tag, c.nome, ora));
    } else if (u.nome !== c.nome) {
      if (norm(c.nome).startsWith(norm(u.nome)))            // same name completed: not a new assignment
        st.push(env.DB.prepare("UPDATE tessere_nomi SET nome=? WHERE tag=? AND dal=?").bind(c.nome, c.tag, u.dal));
      else if (!norm(u.nome).startsWith(norm(c.nome)))
        st.push(env.DB.prepare("INSERT OR REPLACE INTO tessere_nomi (tag, nome, dal) VALUES (?,?,?)").bind(c.tag, c.nome, ora));
    }
  }
  if (presenti) st.push(env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('nomi_presenti', ?)").bind(JSON.stringify([...presenti])));
  if (st.length) await env.DB.batch(st);
}
// tag -> [{dal, al, nome}] in date order
async function nomiStorici(env) {
  await syncNomi(env);
  const m = new Map();
  for (const r of (await env.DB.prepare("SELECT tag, nome, dal, al FROM tessere_nomi ORDER BY tag, dal").all()).results) {
    if (!m.has(r.tag)) m.set(r.tag, []);
    m.get(r.tag).push(r);
  }
  return m;
}
function nomeAl(storia, tag, t) {
  const a = storia.get(tag);
  if (!a) return undefined;
  let r = a[0];
  for (const x of a) if (x.dal <= t) r = x;
  return r.al != null && t >= r.al ? undefined : r.nome;     // after deactivation the card belongs to nobody
}

// -------------------------------------------------------------- data access
async function reportMese(env, anno, mese, riservato = false) {
  const [ini, fin] = intervalloMese(anno, mese);
  const storia = await nomiStorici(env);
  const pr = await env.DB.prepare("SELECT eur_kwh, iva FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).first();
  const prezzo = pr ? pr.eur_kwh : null;
  const ivaPct = pr ? pr.iva : null;
  const righe = (await env.DB.prepare(
    "SELECT inizio_utc, fine_utc, tag, tag_tipo, energia_wh FROM sessioni " +
    "WHERE inizio_utc >= ? AND inizio_utc < ? ORDER BY inizio_utc").bind(ini, fin).all()).results;

  const perTag = {};
  const app = [];
  for (const s of righe) {
    if (s.tag === "" || s.tag_tipo === "app") {
      if (riservato) app.push({ inizio: fmtLocale(s.inizio_utc), fine: fmtLocale(s.fine_utc), kwh: s.energia_wh / 1000,
        imp: euro(s.energia_wh / 1000, prezzo) });
    } else {
      const nome = nomeAl(storia, s.tag, s.inizio_utc) || "(tessera non in elenco)";
      const d = (perTag[s.tag + "|" + nome] ||= { tag: s.tag, nome, n: 0, wh: 0, sess: [] });
      d.sess.push({ inizio: fmtLocale(s.inizio_utc), fine: fmtLocale(s.fine_utc), kwh: s.energia_wh / 1000 });
      d.n += 1;
      d.wh += s.energia_wh;
    }
  }
  const ivaUsata = ivaPct ?? 0;
  const prec = pr ? null : await env.DB.prepare(
    "SELECT iva FROM prezzi WHERE (anno*12+mese) < ? ORDER BY anno DESC, mese DESC LIMIT 1").bind(anno * 12 + mese).first();
  const tessere = Object.values(perTag)
    .sort((a, b) => a.nome.toUpperCase().localeCompare(b.nome.toUpperCase()))
    .map((d) => {
      const kwh = d.wh / 1000;
      const imp = euro(kwh, prezzo);
      const iv = iva(imp, ivaUsata);
      return { tag: d.tag, nome: d.nome, n: d.n, sess: d.sess, kwh, imp, iva: iv, tot: imp == null ? null : r2(imp + iv) };
    });
  for (const d of Object.values(perTag)) {
    const c = costiGruppo(d.sess.map((x) => Math.round(x.kwh * 1000)), prezzo, ivaUsata, false);
    d.sess.forEach((x, i) => Object.assign(x, c[i]));
  }
  if (app.length) {
    const c = costiGruppo(app.map((x) => Math.round(x.kwh * 1000)), prezzo, ivaUsata, true);
    app.forEach((x, i) => Object.assign(x, c[i]));
  }
  const ok = prezzo != null;
  const somma = (arr, k) => arr.reduce((s, x) => s + (x[k] || 0), 0);
  const kT = somma(tessere, "kwh"), kA = somma(app, "kwh");
  const impT = ok ? r2(somma(tessere, "imp")) : null;
  const ivaT = ok ? r2(somma(tessere, "iva")) : null;
  const impA = ok ? r2(somma(app, "imp")) : null;
  const ivaA = iva(impA, ivaUsata);
  return {
    bloccato: prezzo != null,
    riservato, anno, mese, titolo: `${MESI[mese - 1]} ${anno}`, prezzo, iva_pct: ivaPct, iva_prec: prec ? prec.iva : 0, tessere, app,
    kwh_tessere: kT, kwh_app: kA, kwh_tot: kT + kA,
    imp_tessere: impT, iva_tessere: ivaT, tot_tessere: ok ? r2(impT + ivaT) : null,
    imp_app: impA, iva_app: ivaA, tot_app: ok ? r2(impA + ivaA) : null,
    imp_tot: ok ? r2(impT + impA) : null, iva_tot: ok ? r2(ivaT + ivaA) : null,
    eur_tot: ok ? r2(impT + impA + ivaT + ivaA) : null,
    sessioni: tessere.reduce((s, t) => s + t.n, 0) + app.length,
  };
}

async function storicoAnno(env, anno, riservato = false) {
  const out = [];
  for (let m = 1; m <= 12; m++) out.push(await reportMese(env, anno, m, riservato));
  return out.map((r) => ({ riservato, mese: r.mese, nome: MESI[r.mese - 1], sessioni: r.sessioni, kwh_tessere: r.kwh_tessere,
    kwh_app: r.kwh_app, kwh_tot: r.kwh_tot, prezzo: r.prezzo, iva_pct: r.iva_pct, imp_tot: r.imp_tot,
    iva_tot: r.iva_tot, eur_tot: r.eur_tot }));
}

async function statoArchivio(env) {
  const r = await env.DB.prepare("SELECT COUNT(*) n, MIN(inizio_utc) a, MAX(fine_utc) b FROM sessioni").first();
  const u = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ultimo_scarico'").first();
  const e = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ultimo_errore'").first();
  return { sessioni: r.n, dal: r.a ? fmtLocale(r.a) : null, al: r.b ? fmtLocale(r.b) : null,
    ultimo_scarico: u ? u.valore : null, ultimo_errore: e ? e.valore : null };
}

// -------------------------------------------------------------- installation settings (Settings tab / first run)
// Saved in meta 'config'. The wrangler.toml variables (CHARGER_URL, SITE_TITLE, TIMEZONE, CURRENCY, MAIL_FROM, RESEND_API_KEY)
// are the initial values; what is saved from the page wins.
const CFG_DEFAULTS = {
  title: "EV Charger", url: "", user: "", password: "", header_name: "", header_value: "",
  history_path: "/modules/modulator/historic?from=0&to=-1", tags_path: "/modules/tags?level=file", status_path: "/modules/evsm/elements",
  timeout: 20, auto: true,
  // history response: JSON object whose text field holds the CSV lines (Orbis); empty field = the response itself is CSV
  hist_json_field: "body", hist_sep: ",", hist_skip: 0,
  c_start: 0, c_tag: 7, c_type: 8, c_cont_ini: 9, c_end: 10, c_cont_fin: 13,
  tz: "Europe/Rome", currency: "€", tax_label: "",
  resend_key: "", mail_from: "",          // email via Resend (optional)
  card_fee: 0,                             // card fee shown to whoever requests a card (0 = not shown)
  contact: "",                             // contact of whoever runs the site (Information tab and footer)
  charger_id: "CHARGER",                   // charger identifier in the OCPP address
};
const CFG_NUM = ["timeout", "hist_skip", "c_start", "c_tag", "c_type", "c_cont_ini", "c_end", "c_cont_fin"];
const CFG_STR = ["title", "url", "user", "password", "header_name", "header_value", "history_path", "tags_path", "status_path",
  "hist_json_field", "hist_sep", "tz", "currency", "tax_label", "resend_key", "mail_from", "contact", "charger_id"];

async function leggiConfig(env) {
  const c = { ...CFG_DEFAULTS };
  const E = { url: env.CHARGER_URL, user: env.CHARGER_USER, password: env.CHARGER_PASSWORD, title: env.SITE_TITLE,
    tz: env.TIMEZONE, currency: env.CURRENCY, resend_key: env.RESEND_API_KEY, mail_from: env.MAIL_FROM };
  for (const [k, v] of Object.entries(E)) if (v) c[k] = v;
  const r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='config'").first();
  if (r) { try { Object.assign(c, JSON.parse(r.valore)); } catch (_) { /* damaged value: ignored */ } }
  TITOLO = c.title || CFG_DEFAULTS.title;
  VALUTA = c.currency || CFG_DEFAULTS.currency;
  try { new Intl.DateTimeFormat("en-US", { timeZone: c.tz }); TZ = c.tz; } catch (_) { TZ = CFG_DEFAULTS.tz; }
  return c;
}
// what the browser may see: never the charger password or the Resend key
const configPubblica = (c) => { const { password, resend_key, ...x } = c; return { ...x, password_set: !!password, resend_set: !!resend_key }; };

function pulisciConfig(inp, base) {                      // validates what the admin sends and merges it over `base`
  const out = { ...base };
  for (const k of CFG_STR) {
    if (inp[k] === undefined) continue;
    if ((k === "password" || k === "resend_key") && inp[k] === null) continue;   // null = keep the saved secret
    out[k] = String(inp[k]).trim().slice(0, 500);
  }
  for (const k of CFG_NUM) {
    if (inp[k] === undefined || inp[k] === "") continue;
    const n = Math.trunc(+inp[k]);
    if (!Number.isFinite(n) || n < 0 || n > 1000) throw Object.assign(new Error("Numero non valido: " + k), { codice: "bad_config" });
    out[k] = n;
  }
  if (inp.card_fee !== undefined && inp.card_fee !== "") {
    const f = Math.round(+String(inp.card_fee).replace(",", ".") * 100) / 100;
    if (!Number.isFinite(f) || f < 0 || f > 10000) throw Object.assign(new Error("Costo tessera non valido"), { codice: "bad_config" });
    out.card_fee = f;
  }
  if (inp.auto !== undefined) out.auto = !!inp.auto;
  if (out.url && !/^https?:\/\/[^\s]+$/i.test(out.url)) throw Object.assign(new Error("L'indirizzo della colonnina deve iniziare con http:// o https://"), { codice: "bad_url" });
  try { new Intl.DateTimeFormat("en-US", { timeZone: out.tz }); }
  catch (_) { throw Object.assign(new Error("Fuso orario sconosciuto"), { codice: "bad_tz" }); }
  if (!/^[A-Za-z0-9._-]{1,40}$/.test(out.charger_id)) out.charger_id = CFG_DEFAULTS.charger_id;
  if (!out.timeout) out.timeout = CFG_DEFAULTS.timeout;
  if (!out.hist_sep) out.hist_sep = ",";
  if (!out.currency) out.currency = CFG_DEFAULTS.currency;
  return out;
}
const costoTessera = (c) => (c.card_fee > 0 ? `${String(c.card_fee).replace(".", ",")} ${c.currency}` : "");   // "" = no fee to show

// -------------------------------------------------------------- download from the charger
function parseStorico(testo, c) {
  let body = testo;
  if (c.hist_json_field) {
    let j; try { j = JSON.parse(testo); } catch (_) { throw new Error("La risposta dello storico non e' JSON (controlla il campo JSON nelle Impostazioni)"); }
    body = j[c.hist_json_field];
    if (typeof body !== "string") throw new Error(`La risposta dello storico non ha il campo di testo "${c.hist_json_field}"`);
  }
  const out = [];
  for (const riga of body.split(/\r?\n/).slice(c.hist_skip)) {
    if (!riga.trim()) continue;
    const x = riga.split(c.hist_sep);
    const ini = parseInt(x[c.c_cont_ini], 10), fin = parseInt(x[c.c_cont_fin], 10);
    const a = parseInt(x[c.c_start], 10), b = parseInt(x[c.c_end], 10);
    if (![ini, fin, a, b].every(Number.isFinite) || x[c.c_tag] === undefined) continue;
    out.push([a, b, x[c.c_tag].trim().toUpperCase(), (x[c.c_type] || "").trim(), ini, fin, fin - ini]);
  }
  return out;
}
function parseTessere(testo) {
  const out = [];
  for (const riga of testo.split(/\r?\n/).slice(1)) {   // first line = list version
    const p = riga.split(";");
    if (p.length >= 3 && p[0].trim()) out.push([p[0].trim().toUpperCase(), p[2].trim()]);
  }
  return out;
}

async function inserisciSessioni(env, sess) {
  let nuove = 0;
  const stmt = env.DB.prepare("INSERT OR IGNORE INTO sessioni VALUES (?,?,?,?,?,?,?)");
  for (let i = 0; i < sess.length; i += 50) {
    const res = await env.DB.batch(sess.slice(i, i + 50).map((s) => stmt.bind(...s)));
    nuove += res.reduce((n, r) => n + (r.meta.changes || 0), 0);
  }
  return nuove;
}

async function rimuoviDoppioni(env) {
  // app sessions imported from Viaris must be marked 'viaris' like the others (fix for an earlier version)
  await env.DB.prepare("UPDATE sessioni SET tag_tipo='viaris' WHERE cont_ini_wh=-1 AND tag_tipo='app'").run();
  const r = await env.DB.prepare(
    "DELETE FROM sessioni WHERE tag_tipo='viaris' AND EXISTS (" +
    " SELECT 1 FROM sessioni c WHERE c.tag_tipo<>'viaris' AND c.tag=sessioni.tag" +
    " AND ABS(c.inizio_utc - sessioni.inizio_utc) <= 180)").run();
  return r.meta.changes || 0;
}

// attiva = 1 only for cards still on the charger and in state accepted (the others stay in the db for the history)
const stmtTessereAttive = (env, tags) =>
  env.DB.prepare("UPDATE tessere SET attiva = CASE WHEN tag IN (SELECT value FROM json_each(?)) THEN 1 ELSE 0 END").bind(JSON.stringify(tags));

async function salvaScarico(env, c, testoStorico, testoTessere) {
  const sess = parseStorico(testoStorico, c);
  const nuove = await inserisciSessioni(env, sess);
  const avvisi = [];
  if (testoTessere) {
    const st = env.DB.prepare("INSERT INTO tessere (tag, nome) VALUES (?,?) ON CONFLICT(tag) DO UPDATE SET nome = CASE WHEN excluded.nome <> '' THEN excluded.nome ELSE tessere.nome END");
    // the charger truncates long names: if the db name is the full version of the same name, keep it
    const vecchi = new Map((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
    const t = parseTessere(testoTessere).filter(([tag, nome]) => !vecchi.has(tag) || !norm(vecchi.get(tag)).startsWith(norm(nome)));
    const attive = rfidLeggi(testoTessere).filter((x) => x.id && x.stato === "0").map((x) => x.id);
    await env.DB.batch([...t.map((x) => st.bind(...x)), stmtTessereAttive(env, attive)]);
    if (t.length) await syncNomi(env);
  }
  await rimuoviDoppioni(env);
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_scarico', ?)").bind(new Date().toISOString()).run();
  await env.DB.prepare("DELETE FROM meta WHERE chiave='ultimo_errore'").run();
  return { lette: sess.length, nuove, avvisi };
}

// requests to the charger: optional authentication and header from Settings, configurable timeout
function intestazioni(c) {
  const h = { accept: "*/*" };
  if (c.user) h.authorization = "Basic " + btoa(unescape(encodeURIComponent(c.user + ":" + c.password)));
  if (c.header_name && c.header_value) h[c.header_name] = c.header_value;
  return h;
}
const urlCompleto = (c, path) => c.url.replace(/\/$/, "") + (path.startsWith("/") ? "" : "/") + path;
async function conTimeout(url, c, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms || c.timeout * 1000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: intestazioni(c) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } catch (e) {
    if (e.name === "AbortError") throw new Error(`nessuna risposta entro ${Math.round((ms || c.timeout * 1000) / 1000)} s`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}
// card list paths: read and save (null = card management is not available for this charger)
function rfidPercorsi(c) {
  if (!c.url || !/level=file/.test(c.tags_path || "")) return null;
  return { file: urlCompleto(c, c.tags_path), salva: urlCompleto(c, c.tags_path.replace("level=file", "level=save")) };
}
async function colonninaConfig(env) {               // configuration with the charger address, or a clear error
  const c = await leggiConfig(env);
  if (!c.url) throw new Error("Indirizzo della colonnina non impostato (scheda Impostazioni)");
  return c;
}

// public IP the charger's name (DDNS) resolves to, read over DNS-over-HTTPS
async function ipDi(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
  const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`,
    { headers: { accept: "application/dns-json" } });
  const a = ((await r.json()).Answer || []).filter((x) => x.type === 1);
  return a.length ? a[a.length - 1].data : null;
}

async function scarica(env) {
  try {
    const c = await colonninaConfig(env);
    const storico = await conTimeout(urlCompleto(c, c.history_path), c);
    let tessere = null;
    const per = rfidPercorsi(c);
    if (per) {
      try { tessere = await conTimeout(per.file, c); } catch (_) { /* optional */ }
      if (tessere) { try { await rfidCache(env, rfidLeggi(tessere)); } catch (_) { /* optional */ } }
    }
    const esito = await salvaScarico(env, c, storico, tessere);
    try {                                                   // optional: if DNS does not answer the download is still valid
      const ip = await ipDi(new URL(c.url).hostname);
      if (ip) await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_ip', ?)").bind(JSON.stringify({ ip, quando: new Date().toISOString() })).run();
    } catch (_) { /* ignore */ }
    return esito;
  } catch (e) {
    const msg = `${new Date().toISOString()} ${e.message || e}`;
    await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_errore', ?)").bind(msg).run();
    throw e;
  }
}

// connection test from Settings: nothing is saved
async function provaColonnina(c) {
  const out = {};
  async function una(nome, path, parse) {
    const t0 = Date.now();
    try {
      const txt = await conTimeout(urlCompleto(c, path), c);
      let analisi = null, errore = null;
      try { analisi = parse(txt); } catch (e) { errore = String(e.message || e); }
      out[nome] = { ok: !errore, ms: Date.now() - t0, bytes: txt.length, sample: txt.slice(0, 500), ...analisi, errore };
    } catch (e) { out[nome] = { ok: false, ms: Date.now() - t0, errore: String(e.message || e) }; }
  }
  if (!c.url) return { errore: "Indirizzo della colonnina non impostato" };
  await una("history", c.history_path, (t) => { const r = parseStorico(t, c); return { righe: r.length,
    primo: r[0] ? { inizio: fmtLocale(r[0][0]), fine: fmtLocale(r[0][1]), tag: r[0][2], tipo: r[0][3], wh: r[0][6] } : null }; });
  if (c.tags_path) await una("tags", c.tags_path, (t) => ({ righe: parseTessere(t).length }));
  return out;
}

// -------------------------------------------------------------- RFID cards on the charger
// charger file: 1st line = version, then "ID;expiry;name;state" (state 0 = active)
function rfidLeggi(testo) {
  const out = [];
  for (const riga of testo.split(/\r?\n/).slice(1)) {
    const p = riga.split(";");
    if (p.length >= 4 && (p[0].trim() || p[2].trim())) out.push({ id: p[0].trim().toUpperCase(), scad: p[1].trim(), nome: p[2].trim(), stato: p[3].trim() });
  }
  return out;
}
const rfidTesto = (L) => "1\r\n" + L.map((t) => `${t.id};${t.scad};${t.nome};${t.stato}\r\n`).join("");   // like the Orbis panel
const rfidId = (x) => String(x || "").trim().toUpperCase();
const rfidNome = (x) => String(x || "").replace(/[;\r\n\t]/g, " ").replace(/\s+/g, " ").trim();
const RFID_NOME_MAX = 25;                       // beyond that the Orbis panel truncates the name (and may lose the code)
const RFID_SCAD_OK = /^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d)?$/;   // e.g. 2026-10-31T08:24:00+01:00, empty = none
const RFID_ID_OK = /^[0-9A-F]{4,20}$/;
// states as in OCPP: 0 Accepted, 1 Blocked, 2 Expired, 3 Invalid (the names are those of the Viaris CSV)
const RFID_STATI = ["accepted", "blocked", "expired", "invalid"];
const rfidStato = (x) => { const v = String(x ?? "").trim(); if (/^[0-3]$/.test(v)) return v; const i = RFID_STATI.indexOf(v.toLowerCase()); return i >= 0 ? String(i) : null; };

// import: charger file (ID;expiry;name;state) or CSV exported by Viaris (Card,Expiry date,Group,Status)
function rfidDaFile(testo) {
  const righe = testo.replace(/^﻿/, "").split(/\r?\n/).filter((r) => r.trim());
  if (!righe.length) return [];
  if (/^card\s*,/i.test(righe[0])) {
    return righe.slice(1).map((r) => r.split(",")).filter((c) => c[0] && c[0].trim())
      .map((c) => ({ id: rfidId(c[0]), scad: (c[1] || "").trim(), nome: rfidNome(c[2]).slice(0, RFID_NOME_MAX), stato: rfidStato(c[3]) ?? "0" }));
  }
  return rfidLeggi(/;/.test(righe[0]) ? "x\n" + righe.join("\n") : righe.join("\n"));
}

// card states as the OCPP server sees them: saved in the db (meta 'rfid_stato'), updated at every read of the charger file.
// If something changes (card blocked, expired, added...) the offline list on the charger is sent again.
async function rfidCache(env, lista) {
  const nuovo = JSON.stringify(lista.filter((x) => x.id).map((x) => ({ id: x.id, scad: x.scad || "", stato: x.stato })).sort((a, b) => (a.id < b.id ? -1 : 1)));
  const v = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_stato'").first();
  if (v && v.valore === nuovo) return;
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('rfid_stato', ?)").bind(nuovo).run();
  try { await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/sync-differita", { method: "POST" }); } catch (_) { /* not connected: it is aligned at its next start */ }
}

async function rfidDallaColonnina(env) {
  const c = await colonninaConfig(env), per = rfidPercorsi(c);
  if (!per) throw new Error("Per gestire le tessere serve un percorso elenco tessere che contenga level=file (scheda Impostazioni)");
  return rfidLeggi(await conTimeout(per.file, c, 15000));
}

// "Connection check" (OCPP Heartbeat): default 5 minutes, changeable from Settings (stored in the Durable Object)
const HEARTBEAT_S = 300;
// Other OCPP settings changeable from Settings (key: [min, max, charger default]); LocalAuthorizeOffline is a true/false switch
const PARAMETRI = {
  ConnectionTimeOut: [10, 300, 60], WebSocketPingInterval: [5, 300, 10], TransactionMessageRetryInterval: [5, 600, 30],
  TransactionMessageAttempts: [1, 10, 3], MeterValueSampleInterval: [10, 3600, 60], ClockAlignedDataInterval: [0, 3600, 900],
};

// When the charger receives the offline list over OCPP (SendLocalList) it rewrites its own card list WITHOUT names.
// The names are put back from the site's database (max 25 characters, as the panel accepts).
async function nomiDb(env) {
  return new Map((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
}
function riempiNomi(lista, nomi) {
  return lista.map((x) => (x.id && !x.nome && nomi.get(x.id) ? { ...x, nome: rfidNome(nomi.get(x.id)).slice(0, RFID_NOME_MAX) } : x));
}
// returns: number of names put back, 0 if none was needed, -1 if postponed because the charger is busy
async function ripristinaNomi(env) {
  const c = await colonninaConfig(env);
  if (!rfidPercorsi(c)) return 0;
  if (c.status_path) {
    try {
      const ev = JSON.parse(await conTimeout(urlCompleto(c, c.status_path), c, 15000));
      if (ev[0] && ev[0].stat && ev[0].stat.state !== 1) return -1;          // write only when the charger is free
    } catch (_) { return -1; }
  }
  const prima = await rfidDallaColonnina(env);
  const dopo = riempiNomi(prima, await nomiDb(env));
  const n = dopo.filter((x, i) => x.nome !== prima[i].nome).length;
  if (!n) return 0;
  await rfidScrivi(env, prima, dopo, false);
  return n;
}

async function rfidScrivi(env, prima, dopo, copia = true) {
  // safety copy of the list as it was (not when only putting names back), then write and save as the panel does
  if (copia) await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('rfid_backup', ?)").bind(JSON.stringify({ quando: new Date().toISOString(), lista: prima })).run();
  const c = await colonninaConfig(env), per = rfidPercorsi(c);
  if (!per) throw new Error("Per gestire le tessere serve un percorso elenco tessere che contenga level=file (scheda Impostazioni)");
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(per.file, { method: "POST", headers: { ...intestazioni(c), "content-type": "text/plain" }, body: rfidTesto(dopo), signal: ctl.signal });
    if (!r.ok) throw new Error("scrittura: HTTP " + r.status);
  } finally { clearTimeout(t); }
  await conTimeout(per.salva, c, 20000);
  const letta = await rfidDallaColonnina(env);                 // check: read again and compare
  await rfidCache(env, letta);
  const ok = letta.length === dopo.length && dopo.every((x) => letta.some((y) => y.id === x.id && y.nome === x.nome && y.scad === x.scad));
  // the site's db keeps the full name: update it only for cards that are new or really renamed
  const st = env.DB.prepare("INSERT INTO tessere (tag, nome) VALUES (?,?) ON CONFLICT(tag) DO UPDATE SET nome=excluded.nome");
  const vecchi = new Map((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
  const da = dopo.filter((x) => x.id && (!vecchi.has(x.id) || !norm(vecchi.get(x.id)).startsWith(norm(x.nome))));
  if (da.length) { await env.DB.batch(da.map((x) => st.bind(x.id, x.nome))); await syncNomi(env); }   // removed cards stay in the db for the history
  return { ok, lista: letta };
}

// -------------------------------------------------------------- Viaris export import
const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

async function importaCsv(env, nomeFile, testo) {
  const righe = testo.replace(/^﻿/, "").split(/\r?\n/).filter((r) => r.trim());
  if (!righe.length) throw new Error("file vuoto");
  const intest = righe[0].split(";").map(norm);
  const cIni = intest.indexOf("DATAEORAINIZIO"), cFin = intest.indexOf("DATAEORAFINE"), cKwh = intest.indexOf("ENERGIAKWH");
  if (cIni < 0 || cFin < 0 || cKwh < 0) throw new Error("non sembra un export per tessera di Viaris");

  const nome = norm(nomeFile.replace(/\.csv$/i, "").split(" ")[0]);
  let tag, tipo;
  if (nome === "U") { tag = ""; tipo = "viaris"; }
  else {
    const t = (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.filter((r) => norm(r.nome) === nome);
    if (t.length !== 1) throw new Error(`non riconosco la tessera dal nome del file (${nomeFile.split(" ")[0]}): scarica prima dalla colonnina`);
    tag = t[0].tag; tipo = "viaris";
  }
  const sess = [];
  for (const r of righe.slice(1)) {
    const c = r.split(";");
    const m1 = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(c[cIni] || "");
    const m2 = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(c[cFin] || "");
    if (!m1 || !m2) continue;
    // dates in the Viaris exports are local time (the 'Z' is just a label)
    const ini = epochDaLocale(+m1[1], +m1[2], +m1[3], +m1[4], +m1[5]);
    const fin = epochDaLocale(+m2[1], +m2[2], +m2[3], +m2[4], +m2[5]);
    const k = c[cKwh];
    const wh = Math.round((k.includes(",") ? parseFloat(k.replace(/\./g, "").replace(",", ".")) : parseFloat(k)) * 1000);
    sess.push([ini, fin, tag, tipo, -1, -1 + wh, wh]);
  }
  const nuove = await inserisciSessioni(env, sess);
  const tolte = await rimuoviDoppioni(env);
  return { file: nomeFile, tessera: tag || "(app)", lette: sess.length, nuove, doppioni_tolti: tolte };
}

// -------------------------------------------------------------- HTTP
const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

// -------------------------------------------------------------- users and sessions
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// permissions that can be given to users (the admin always has everything)
const PERMESSI = ["report", "storico", "sessioni", "prezzo", "stampa", "scarica", "app", "live"];
const PERMESSI_DEFAULT = { report: 1, storico: 1, sessioni: 1, stampa: 1 };
const DURATA_INVITO = 48 * 3600;
function permessiDi(u) {
  if (u.tessera) return Object.fromEntries(PERMESSI.map((k) => [k, false]));   // charger user: sees only their own sessions
  if (u.ruolo === "admin") return Object.fromEntries(PERMESSI.map((k) => [k, true]));
  let p = PERMESSI_DEFAULT;
  if (u.permessi) { try { p = JSON.parse(u.permessi); } catch (_) { /* default */ } }
  return Object.fromEntries(PERMESSI.map((k) => [k, !!p[k]]));
}
const ITER = 5000;                       // PBKDF2: kept low to stay inside the free plan's CPU limit
const DURATA_SESSIONE = 30 * 24 * 3600;  // seconds
const enc = (t) => new TextEncoder().encode(t);
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (h) => Uint8Array.from(h.match(/../g) || [], (x) => parseInt(x, 16));
function uguali(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function hashPw(pw, saltHex) {
  const k = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(saltHex), iterations: ITER }, k, 256));
}
async function nuovaCredenziale(pw) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await hashPw(pw, salt) };
}

let tabelleOk = false, chiaveCache = null;
async function preparaTabelle(env) {
  if (tabelleOk) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS utenti (nome TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, ruolo TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS tentativi (nome TEXT NOT NULL, ts INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS revocati (sig TEXT PRIMARY KEY, exp INTEGER NOT NULL)"),   // sessions closed with "Log out"
    env.DB.prepare("CREATE TABLE IF NOT EXISTS ticket (id INTEGER PRIMARY KEY AUTOINCREMENT, utente TEXT, tipo TEXT, testo TEXT, extra TEXT, stato TEXT, creato TEXT, gestito TEXT, nota TEXT)"),   // requests from the reserved area
  ]);
  const col = (await env.DB.prepare("PRAGMA table_info(utenti)").all()).results.map((c) => c.name);
  for (const [nome, tipo] of [["permessi", "TEXT"], ["invito_hash", "TEXT"], ["invito_exp", "INTEGER"], ["tessera", "TEXT"], ["cognome", "TEXT"], ["nome_proprio", "TEXT"], ["tel1", "TEXT"], ["tel2", "TEXT"], ["verifica_hash", "TEXT"], ["verifica_exp", "INTEGER"], ["consensi", "TEXT"], ["registrato_il", "TEXT"], ["profilo_il", "TEXT"], ["tessere_altre", "TEXT"]])
    if (!col.includes(nome)) await env.DB.prepare(`ALTER TABLE utenti ADD COLUMN ${nome} ${tipo}`).run();
  const colT = (await env.DB.prepare("PRAGMA table_info(ticket)").all()).results.map((c) => c.name);
  if (!colT.includes("integrazioni")) await env.DB.prepare("ALTER TABLE ticket ADD COLUMN integrazioni TEXT").run();   // user additions to the ticket (encrypted JSON)
  tabelleOk = true;
}
async function chiaveSessioni(env) {
  if (chiaveCache) return chiaveCache;
  let r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='chiave_sessioni'").first();
  if (!r) {
    await env.DB.prepare("INSERT OR IGNORE INTO meta VALUES ('chiave_sessioni', ?)")
      .bind(hex(crypto.getRandomValues(new Uint8Array(32)))).run();
    r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='chiave_sessioni'").first();
  }
  chiaveCache = r.valore;
  return chiaveCache;
}
async function firma(env, testo) {
  const k = await crypto.subtle.importKey("raw", enc(await chiaveSessioni(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc(testo)));
}
// the token is bound to the password hash: changing the password or deleting the user closes their sessions
async function creaToken(env, u) {
  const exp = Math.floor(Date.now() / 1000) + DURATA_SESSIONE;
  const nonce = hex(crypto.getRandomValues(new Uint8Array(8)));          // every sign-in gets a different token
  return `${u.nome}~${exp}~${nonce}~${await firma(env, `${u.nome}|${exp}|${nonce}|${u.hash.slice(0, 16)}`)}`;
}
const cookie = (v, età) => `sess=${encodeURIComponent(v)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${età}`;

// a user may have several cards: the main one (column tessera) and the others (JSON in tessere_altre)
function tessereDi(u) {
  const l = u && u.tessera ? [u.tessera] : [];
  try { for (const t of JSON.parse((u && u.tessere_altre) || "[]")) if (t && !l.includes(t)) l.push(t); } catch (_) { /* empty */ }
  return l;
}
async function utenteCorrente(req, env) {
  await preparaTabelle(env);
  const ck = /(?:^|;\s*)sess=([^;]+)/.exec(req.headers.get("cookie") || "");
  if (ck) {
    let val = "";
    try { val = decodeURIComponent(ck[1]); } catch (_) { /* malformed cookie */ }
    const p = (/^(.+)~(\d+)~([0-9a-f]{16})~([0-9a-f]{64})$/.exec(val) || []).slice(1);
    if (p.length === 4 && +p[1] > Date.now() / 1000) {
      const u = await env.DB.prepare("SELECT nome, hash, ruolo, permessi, tessera, tessere_altre, verifica_hash FROM utenti WHERE nome=?").bind(p[0]).first();
      if (u && u.hash && !u.verifica_hash && uguali(p[3], await firma(env, `${u.nome}|${p[1]}|${p[2]}|${u.hash.slice(0, 16)}`))) {
        const rev = await env.DB.prepare("SELECT 1 FROM revocati WHERE sig=?").bind(p[3]).first();
        if (!rev) return { nome: u.nome, ruolo: u.ruolo, perm: permessiDi(u), tessera: u.tessera || null, tessere: tessereDi(u) };
      }
    }
  }
  // Basic auth: only for scripts that push data (e.g. --invia), never for the pages
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Basic ") && new URL(req.url).pathname === "/api/ingest") {
    try {
      const [n, ...r] = atob(h.slice(6)).split(":");
      const u = await loginLimitato(env, n.trim().toLowerCase(), r.join(":"));
      if (u && !u.limite && !u.nonVerificato && !u.inAttesa) return u;
    } catch (_) { /* ignore */ }
  }
  return null;
}

// checks name and password; the first time (no users) admin = APP_PASSWORD
async function verificaLogin(env, nome, pw) {
  await preparaTabelle(env);
  const n = (await env.DB.prepare("SELECT COUNT(*) n FROM utenti WHERE ruolo='admin'").first()).n;
  if (n === 0) {
    if (nome === "admin" && env.APP_PASSWORD && uguali(pw, env.APP_PASSWORD)) {
      const c = await nuovaCredenziale(pw);
      await env.DB.prepare("INSERT OR IGNORE INTO utenti (nome, salt, hash, ruolo) VALUES ('admin', ?, ?, 'admin')").bind(c.salt, c.hash).run();
    } else return null;
  }
  const u = await env.DB.prepare("SELECT nome, salt, hash, ruolo, permessi, tessera, verifica_hash, registrato_il FROM utenti WHERE nome=?").bind(nome).first();
  if (!u || !u.hash) { await hashPw(pw, "00".repeat(16)); return null; }   // similar timing even if the user does not exist or has not chosen a password yet
  return uguali(await hashPw(pw, u.salt), u.hash) ? { nome: u.nome, ruolo: u.ruolo, hash: u.hash, perm: permessiDi(u), tessera: u.tessera || null, nonVerificato: !!u.verifica_hash, inAttesa: !!u.registrato_il && !u.tessera } : null;
}

// verificaLogin with the attempt limit (5 errors per 10 minutes per user name), used by /api/login
// and by Basic auth on /api/ingest. Returns the user, null, or { limite: true }.
async function loginLimitato(env, nome, pw) {
  await preparaTabelle(env);
  const ora = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM tentativi WHERE ts < ?").bind(ora - 600).run();
  const t = await env.DB.prepare("SELECT COUNT(*) n FROM tentativi WHERE nome=?").bind(nome).first();
  if (t.n >= 5) return { limite: true };
  const u = await verificaLogin(env, nome, pw);
  if (!u) await env.DB.prepare("INSERT INTO tentativi VALUES (?, ?)").bind(nome, ora).run();
  else await env.DB.prepare("DELETE FROM tentativi WHERE nome=?").bind(nome).run();
  return u;
}

async function login(req, env) {
  const b = await req.json();
  const nome = String(b.nome || "").trim().toLowerCase(), pw = String(b.password || "");
  if (await ipBloccato(env, req, "ip", 20)) return json({ errore: "Troppi tentativi da questo indirizzo: riprova tra 10 minuti" }, 429);
  const u = await loginLimitato(env, nome, pw);
  if (u && u.limite) return json({ errore: "Troppi tentativi: riprova tra 10 minuti" }, 429);
  if (!u) { await ipErrore(env, req, "ip"); return json({ errore: "Nome o password errati" }, 401); }
  if (u.nonVerificato) return json({ errore: "Devi prima confermare l'indirizzo email: controlla la tua posta" }, 403);
  const r = json({ ok: true, nome: u.nome, ruolo: u.ruolo });
  r.headers.append("set-cookie", cookie(await creaToken(env, u), DURATA_SESSIONE));
  return r;
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const sha256 = async (t) => hex(await crypto.subtle.digest("SHA-256", enc(t)));

async function inviaMail(env, a, oggetto, html, cc, allegati) {
  const c = await leggiConfig(env);
  if (!c.resend_key || !c.mail_from) return "non configurata";
  try {
    const corpo = { from: c.mail_from, to: [].concat(a), subject: oggetto, html };
    if (cc && cc.length) corpo.cc = cc;
    if (allegati && allegati.length) corpo.attachments = allegati;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + c.resend_key, "content-type": "application/json" },
      body: JSON.stringify(corpo),
    });
    return r.ok ? "inviata" : "errore " + r.status + ": " + (await r.text()).slice(0, 200);
  } catch (e) { return "errore: " + (e.message || e); }
}

const NOREPLY = `<p style="margin-top:20px"><b>Questa casella non riceve email in ingresso: si prega di non rispondere a questo messaggio.<br>` +
  `This mailbox does not receive incoming email: please do not reply to this message.</b></p>`;

// ---------------------------------------------------- price report by email
const DEST_DEFAULT = { a: [], cc: [] };          // empty until the admin enters them: no email goes out
async function leggiDestinatari(env) {
  const r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='destinatari_report'").first();
  if (r) { try { const d = JSON.parse(r.valore); if (Array.isArray(d.a) && Array.isArray(d.cc)) return d; } catch (e) { /* use the defaults */ } }
  return DEST_DEFAULT;
}
const listaEmail = (t) => [...new Set(String(t || "").split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
const num = (x, d = 2) => x === null || x === undefined ? "-" : x.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });


// ------------------------------------------------ monitoring: check every 5 minutes, email to the recipients and episode history
// type "durata": fires when the condition lasts longer than the threshold (um = minutes per displayed unit); "valore": fires when the measure reaches the threshold;
// "evento": single alert, no threshold. The check runs from the cron "*/5 * * * *": thresholds under 5 minutes mean the next run.
const MALF = {
  connessione: { g: "Connessione", label: "Colonnina non collegata al server", tipo: "durata", def: 10, min: 5, max: 1440, um: 1, unita: "minuti" },
  battito: { g: "Connessione", label: "Colonnina collegata ma senza messaggi (nemmeno il battito)", tipo: "durata", def: 15, min: 5, max: 1440, um: 1, unita: "minuti" },
  riconnessioni: { g: "Connessione", label: "Riconnessioni troppo frequenti", tipo: "valore", def: 5, min: 2, max: 50, um: 1, unita: "cadute in un'ora" },
  riavvio: { g: "Connessione", label: "Riavvio imprevisto della colonnina", tipo: "evento" },
  orologio: { g: "Connessione", label: "Orologio della colonnina sfasato", tipo: "valore", def: 5, min: 1, max: 120, um: 1, unita: "minuti di differenza" },
  ip: { g: "Connessione", label: "Indirizzo IP pubblico cambiato", tipo: "evento" },
  presa: { g: "Presa e ricariche", label: "Presa in errore", tipo: "durata", def: 5, min: 0, max: 1440, um: 1, unita: "minuti" },
  presa_nd: { g: "Presa e ricariche", label: "Presa non disponibile (Unavailable)", tipo: "durata", def: 10, min: 0, max: 1440, um: 1, unita: "minuti" },
  presa_ferma: { g: "Presa e ricariche", label: "Cavo collegato ma nessuna ricarica", tipo: "durata", def: 360, min: 60, max: 2880, um: 60, unita: "ore" },
  energia: { g: "Presa e ricariche", label: "Ricarica in corso ma energia ferma", tipo: "durata", def: 15, min: 5, max: 240, um: 1, unita: "minuti" },
  lunga: { g: "Presa e ricariche", label: "Ricarica troppo lunga", tipo: "durata", def: 720, min: 60, max: 4320, um: 60, unita: "ore" },
  kwh: { g: "Presa e ricariche", label: "Troppi kWh in una sola ricarica", tipo: "valore", def: 100, min: 10, max: 500, um: 1, unita: "kWh" },
  aperta: { g: "Presa e ricariche", label: "Ricarica rimasta aperta dopo lo scollegamento", tipo: "durata", def: 15, min: 5, max: 240, um: 1, unita: "minuti" },
  rifiutata: { g: "Tessere", label: "Stessa tessera rifiutata più volte", tipo: "valore", def: 3, min: 2, max: 20, um: 1, unita: "rifiuti in un'ora" },
  tessere: { g: "Tessere", label: "Tessere sulla colonnina diverse da quelle del sito", tipo: "durata", def: 720, min: 360, max: 2880, um: 60, unita: "ore" },
  nomi: { g: "Tessere", label: "Nomi delle tessere non ripristinati", tipo: "durata", def: 30, min: 10, max: 1440, um: 1, unita: "minuti" },
  lista: { g: "Tessere", label: "Invio lista tessere alla colonnina non riuscito", tipo: "durata", def: 10, min: 0, max: 1440, um: 1, unita: "minuti" },
  parametri: { g: "Impostazioni", label: "Impostazione della colonnina diversa da quella voluta", tipo: "durata", def: 60, min: 60, max: 1440, um: 1, unita: "minuti" },
  firmware: { g: "Impostazioni", label: "Versione del firmware cambiata", tipo: "evento" },
  scarico: { g: "Sito e sicurezza", label: "Dati non scaricati dalla colonnina", tipo: "durata", def: 720, min: 360, max: 10080, um: 60, unita: "ore" },
  backup: { g: "Sito e sicurezza", label: "Backup del database non fatto da molto", tipo: "durata", def: 10080, min: 1440, max: 86400, um: 1440, unita: "giorni" },
  login: { g: "Sito e sicurezza", label: "Troppi tentativi di accesso falliti", tipo: "durata", def: 0, min: 0, max: 60, um: 1, unita: "minuti" },
  limiti_cf: { g: "Sito e sicurezza", label: "Consumi Cloudflare vicini al limite giornaliero gratuito", tipo: "valore", def: 80, min: 10, max: 100, um: 1, unita: "% del limite" },   // on by default with notification only
  token: { g: "Sito e sicurezza", label: "Collegamenti OCPP con codice segreto sbagliato", tipo: "valore", def: 3, min: 1, max: 50, um: 1, unita: "tentativi in un'ora" },
};
const ERRORI_OCPP = { ConnectorLockFailure: "blocco del connettore", EVCommunicationError: "comunicazione con l'auto", GroundFailure: "dispersione a terra",
  HighTemperature: "temperatura elevata", InternalError: "errore interno", LocalListConflict: "conflitto lista locale", OtherError: "altro errore",
  OverCurrentFailure: "sovracorrente", PowerMeterFailure: "guasto al contatore", PowerSwitchFailure: "guasto all'interruttore di potenza",
  ReaderFailure: "guasto al lettore tessere", ResetFailure: "riavvio non riuscito", UnderVoltage: "tensione bassa", OverVoltage: "tensione alta", WeakSignal: "segnale debole" };
async function leggiMalf(env) {
  const r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='malfunzionamenti'").first();
  let c = {}; try { c = r ? JSON.parse(r.valore) : {}; } catch (_) { /* defaults */ }
  const regole = {};
  for (const [id, d] of Object.entries(MALF)) { const x = (c.regole || {})[id] || {}; const mail = x.mail !== undefined ? x.mail === true : x.on === true && !("not" in x), not = x.not !== undefined ? x.not === true : id === "limiti_cf";   // mail and notification: everything off until switched on (except Cloudflare usage: notification on)
    regole[id] = { on: mail || not, mail, not, min: Number.isFinite(x.min) ? x.min : d.def }; }
  return { a: Array.isArray(c.a) ? c.a : [], cc: Array.isArray(c.cc) ? c.cc : [], regole };
}
async function leggiMeta(env, chiave, vuoto) {
  const r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave=?").bind(chiave).first();
  try { return r ? JSON.parse(r.valore) : vuoto; } catch (_) { return vuoto; }
}
const salvaMeta = (env, chiave, v) => env.DB.prepare("INSERT OR REPLACE INTO meta VALUES (?, ?)").bind(chiave, JSON.stringify(v)).run();
const dataIt = (ms) => new Date(ms).toLocaleString("it-IT", { timeZone: TZ, dateStyle: "short", timeStyle: "short" });
const durataIt = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 2880 ? Math.round(m / 1440) + " giorni" : m >= 120 ? Math.round(m / 60) + " ore" : m + " minuti"; };
function mailMalf(titolo, righe) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${esc(TITOLO)}</h2><p><b>${esc(titolo)}</b></p><p>${righe.map(esc).join("<br>")}</p>${NOREPLY}</div>`;
}
// email to the user in the standard format: Italian, then English
function mailBil(titIt, righeIt, titEn, righeEn) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${esc(TITOLO)}</h2>` +
    `<p style="color:#555;margin:0 0 8px"><b>Italiano</b> - ${esc(titIt)}</p><p>${righeIt.map(esc).join("<br>")}</p>` +
    `<hr style="border:0;border-top:1px solid #ddd;margin:20px 0">` +
    `<p style="color:#555;margin:0 0 8px"><b>English</b> - ${esc(titEn)}</p><p>${righeEn.map(esc).join("<br>")}</p>${NOREPLY}</div>`;
}
// in-site notifications for the admin: alerts that do not go out by email (no recipient, failed email, "notification only" checks)
async function notifica(env, titolo, dett, ts = Date.now()) {
  const l = await leggiMeta(env, "notifiche", []);
  l.unshift({ ts, titolo, dett: await cifra(env, dett, "notifica|dett"), letta: false });   // the detail may contain personal data
  l.length = Math.min(l.length, 50);
  await salvaMeta(env, "notifiche", l);
}
const energiaKwh = (m) => { const x = m && m.dati && m.dati["Energy.Active.Import.Register"]; if (!x) return null; const v = parseFloat(x.v); return isNaN(v) ? null : /^k/i.test(x.u) ? v : v / 1000; };
// ------------------------------------------------ reminder to users: charge finished but car still plugged in
const AVVISI_DEF = { on: true, attesa: 10, sollecito: 60 };      // minutes after the end of the charge; sollecito 0 = no second reminder
async function leggiAvvisi(env) { return { ...AVVISI_DEF, ...(await leggiMeta(env, "avvisi_utenti_cfg", {})) }; }
async function avvisiUtenti(env, live, ora) {
  const cfg = await leggiAvvisi(env), pr = live.prese && live.prese["1"], tx = live.ultima_tx;
  const fermo = cfg.on && live.connessa && pr && /^(Finishing|SuspendedEV|SuspendedEVSE)$/.test(pr.status) && tx;
  if (!fermo) { await env.DB.prepare("DELETE FROM meta WHERE chiave='avvisi_utenti'").run(); return; }
  let rec = await leggiMeta(env, "avvisi_utenti", null);
  if (!rec || rec.chiave !== tx.id) {
    const t = Date.parse(pr.ts);                          // from the socket's timestamp if plausible, otherwise from when it was first seen
    rec = { chiave: tx.id, da: t && t <= ora + 120000 && ora - t < 6 * 3600e3 ? t : ora };
  }
  const like = `%"${tx.tag}"%`;
  const u = await env.DB.prepare("SELECT nome FROM utenti WHERE (tessera=? OR tessere_altre LIKE ?) AND ruolo!='admin' LIMIT 1").bind(tx.tag, like).first()
    || await env.DB.prepare("SELECT nome FROM utenti WHERE tessera=? OR tessere_altre LIKE ? LIMIT 1").bind(tx.tag, like).first();
  if (u && EMAIL_OK.test(u.nome)) {
    const kwh = tx.meter_fin != null && tx.meter_ini != null ? ((tx.meter_fin - tx.meter_ini) / 1000).toFixed(1).replace(".", ",") + " kWh" : "";
    const invia = async (promemoria) => inviaMail(env, u.nome, `${promemoria ? "Promemoria: la ricarica" : "La ricarica"} è terminata - ${TITOLO}`,
      mailBil(promemoria ? "Promemoria: ricarica terminata, auto ancora collegata" : "Ricarica terminata", [
        "La ricarica con la tessera " + tx.tag + " è terminata" + (tx.fine ? " alle " + new Date(tx.fine).toLocaleTimeString("it-IT", { timeZone: TZ, timeStyle: "short" }) : "") + (kwh ? " (" + kwh + ")" : "") + ".",
        "L'auto risulta ancora collegata alla colonnina: per favore scollegala per lasciare il posto agli altri utenti."],
      promemoria ? "Reminder: charging finished, car still plugged in" : "Charging finished", [
        "Charging with card " + tx.tag + " has finished" + (tx.fine ? " at " + new Date(tx.fine).toLocaleTimeString("en-GB", { timeZone: TZ, timeStyle: "short" }) : "") + (kwh ? " (" + kwh.replace(",", ".") + ")" : "") + ".",
        "The car is still plugged in: please unplug it so others can use the charger."]));
    if (!rec.m1 && ora - rec.da >= cfg.attesa * 60000) { if ((await invia(false)) === "inviata") rec.m1 = ora; }
    else if (rec.m1 && !rec.m2 && cfg.sollecito > 0 && ora - rec.da >= cfg.sollecito * 60000) { if ((await invia(true)) === "inviata") rec.m2 = ora; }
  }
  await salvaMeta(env, "avvisi_utenti", rec);
}

async function verificaMalfunzionamenti(env, ora = Date.now()) {
  try { await migraCifratura(env); } catch (_) { /* optional */ }
  try { await applicaBlocchiPendenti(env); } catch (_) { /* retry at the next run */ }
  const cfg = await leggiMalf(env), stato = await leggiMeta(env, "malfunzionamenti_stato", {}), storico = await leggiMeta(env, "malfunzionamenti_storico", []);
  const ext = stato._ext || (stato._ext = {});
  const DO = env.COLONNINA.get(env.COLONNINA.idFromName("colonnina"));
  let live;
  try { live = await (await DO.fetch("https://do/stato")).json(); } catch (_) { return; }
  try { await avvisiUtenti(env, live, ora); } catch (_) { /* optional */ }
  let eventiDO = [];
  try { eventiDO = await (await DO.fetch("https://do/malf-eventi", { method: "POST" })).json(); } catch (_) { /* no events */ }
  const on = (id) => cfg.regole[id].on, v = (id) => cfg.regole[id].min;
  const pr = live.prese && live.prese["1"], tx = live.transazione_aperta, ultimoIn = live.ultimo_in || live.ultimo_msg || null;
  const hbMin = Math.ceil(((live.heartbeat && live.heartbeat.voluto) || 300) / 60);
  const prima = (id) => (stato[id] && stato[id].da) || ora;
  const sc = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ultimo_scarico'").first();
  const er = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ultimo_errore'").first();
  const stP = pr ? pr.status : "", kwhTot = energiaKwh(live.meter), cod = pr && pr.errore && pr.errore !== "NoError" ? pr.errore : "";
  const guasto = pr && (stP === "Faulted" || cod);
  const cond = {
    connessione: { da: live.connessa ? null : (ultimoIn || prima("connessione")), dett: ultimoIn ? "Ultimo messaggio ricevuto: " + dataIt(ultimoIn) : "Nessun messaggio ricevuto dopo l'ultimo avvio del server" },
    battito: { da: live.connessa && ultimoIn ? ultimoIn : null, dett: "Ultimo messaggio ricevuto: " + (ultimoIn ? dataIt(ultimoIn) : "-"), minimo: 2 * hbMin },
    presa: { da: guasto ? prima("presa") : null, dett: guasto ? "Stato della presa: " + stP + (cod ? " - " + cod + (ERRORI_OCPP[cod] ? " (" + ERRORI_OCPP[cod] + ")" : "") : "") : "" },
    presa_nd: { da: stP === "Unavailable" ? prima("presa_nd") : null, dett: "La presa risulta non disponibile (Unavailable)" },
    presa_ferma: { da: /^(Preparing|SuspendedEV|SuspendedEVSE|Finishing)$/.test(stP) ? prima("presa_ferma") : null, dett: "Stato della presa: " + stP + " (cavo collegato, nessuna ricarica in corso)" },
    lunga: { da: tx ? tx.inizio : null, dett: tx ? "Ricarica della tessera " + tx.tag + " iniziata il " + dataIt(tx.inizio) : "" },
    aperta: { da: tx && stP === "Available" ? prima("aperta") : null, dett: "Risulta una ricarica aperta ma la presa e' libera" },
    nomi: { da: live.nomi_pendenti ? (live.nomi_pendenti_da || prima("nomi")) : null, dett: "I nomi delle tessere non sono stati rimessi sulla colonnina dopo l'invio della lista" },
    lista: { da: live.lista && live.lista.ok === false && !live.sync_pendente ? prima("lista") : null, dett: "L'ultimo invio della lista tessere alla colonnina non e' andato a buon fine" },
    scarico: { da: sc ? Date.parse(sc.valore) : null, dett: "Ultimo scarico riuscito: " + (sc ? dataIt(Date.parse(sc.valore)) : "-") + (er ? ". Ultimo errore: " + er.valore.slice(0, 200) : "") },
  };
  // energy not increasing: the meter does not rise while the socket is charging
  if (tx && stP === "Charging" && kwhTot !== null) {
    const st = stato.energia;
    cond.energia = { da: st && st.e === kwhTot ? st.da : ora, extra: { e: kwhTot }, dett: "Contatore fermo a " + kwhTot.toFixed(2) + " kWh durante la ricarica della tessera " + tx.tag };
  } else cond.energia = { da: null };
  // measure thresholds (fire at once)
  const ora1h = ora - 3600e3, cadute = (live.cadute || []).filter((t) => t > ora1h).length;
  cond.riconnessioni = { da: cadute >= v("riconnessioni") ? prima("riconnessioni") : null, dett: cadute + " cadute della connessione nell'ultima ora" };
  const sf = live.sfasa && ora - live.sfasa.ts < 86400e3 ? live.sfasa.ms : null;
  cond.orologio = { da: sf !== null && Math.abs(sf) >= v("orologio") * 60000 ? prima("orologio") : null, dett: sf !== null ? "L'orologio della colonnina differisce di " + Math.round(sf / 60000) + " minuti da quello del server" : "" };
  const kwhRic = tx && kwhTot !== null && tx.meter_ini != null ? kwhTot - tx.meter_ini / (live.meter && live.meter.dati["Energy.Active.Import.Register"] && /^k/i.test(live.meter.dati["Energy.Active.Import.Register"].u) ? 1 : 1000) : null;
  cond.kwh = { da: kwhRic !== null && kwhRic >= v("kwh") ? prima("kwh") : null, dett: kwhRic !== null ? "Ricarica della tessera " + tx.tag + ": " + kwhRic.toFixed(1) + " kWh finora" : "" };
  const conta = {}; for (const x of live.rifiuti || []) if (x.ts > ora1h) conta[x.tag] = (conta[x.tag] || 0) + 1;
  const [tagMax, nMax] = Object.entries(conta).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  cond.rifiutata = { da: nMax >= v("rifiutata") ? prima("rifiutata") : null, dett: "Tessera " + tagMax + " rifiutata " + nMax + " volte nell'ultima ora" };
  // from the site: cards, backup, sign-ins, connections with a wrong token
  if (on("tessere")) {
    const nCol = ((await leggiMeta(env, "rfid_stato", [])) || []).length, nDb = (await env.DB.prepare("SELECT COUNT(*) n FROM tessere").first()).n;
    cond.tessere = { da: nCol !== nDb ? prima("tessere") : null, dett: "Tessere sulla colonnina: " + nCol + ", sul sito: " + nDb };
  }
  const bk = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ultimo_backup'").first();
  cond.backup = { da: bk ? Date.parse(bk.valore) : null, dett: "Ultimo backup scaricato: " + (bk ? dataIt(Date.parse(bk.valore)) : "-") };
  if (on("login")) {
    try {
      const t = await env.DB.prepare("SELECT nome, COUNT(*) n FROM tentativi WHERE ts > ? GROUP BY nome HAVING n >= 5").bind(Math.floor(ora / 1000) - 600).all();
      cond.login = { da: t.results.length ? prima("login") : null, dett: "Troppi accessi falliti per: " + t.results.map((x) => x.nome).join(", ") };
    } catch (_) { /* table not created yet */ }
  }
  if (on("limiti_cf") && env.CF_API_TOKEN && env.CF_ACCOUNT_ID) {          // today's usage (UTC) against the free-plan limits
    const cf = await consumiCloudflare(env), g = cf.giorni && cf.giorni[0];
    if (g) {
      const voci = [["richieste del sito", g.req, cf.limiti.req], ["righe lette D1", g.d1r, cf.limiti.d1r], ["righe scritte D1", g.d1w, cf.limiti.d1w],
        ["richieste OCPP", g.dor, cf.limiti.dor], ["durata OCPP (GB-s)", Math.round(g.dogbs), cf.limiti.dogbs], ["righe lette OCPP", g.dorr, cf.limiti.dorr], ["righe scritte OCPP", g.dorw, cf.limiti.dorw]];
      if (cf.spazio) { if (cf.spazio.d1) voci.push(["archivio D1 (byte)", cf.spazio.d1, cf.limiti.spazio]); if (cf.spazio.ocpp) voci.push(["archivio OCPP (byte)", cf.spazio.ocpp, cf.limiti.spazio]); }
      const sopra = voci.filter(([, x, l]) => x / l * 100 >= v("limiti_cf"));
      cond.limiti_cf = { da: sopra.length ? prima("limiti_cf") : null, dett: "Oggi (UTC): " + sopra.map(([n, x, l]) => `${n} ${x.toLocaleString("it-IT")} su ${l.toLocaleString("it-IT")} (${Math.round(x / l * 100)}%)`).join("; ") };
    }
  }
  const rt = (await leggiMeta(env, "ocpp_rifiuti", [])).filter((t) => t > ora1h).length;
  cond.token = { da: rt >= v("token") ? prima("token") : null, dett: rt + " tentativi di collegamento OCPP con codice segreto sbagliato nell'ultima ora" };
  // settings read from the charger (at most once an hour)
  if (on("parametri") && live.connessa) {
    const e = ext.parametri || (ext.parametri = {});
    if (!e.ultimo || ora - e.ultimo > 3600e3) {
      try {
        const r = await (await DO.fetch("https://do/comando", { method: "POST", body: JSON.stringify({ azione: "GetConfiguration", payload: {} }) })).json();
        if (r && r.configurationKey) {
          const letti = Object.fromEntries(r.configurationKey.map((k) => [k.key, String(k.value)]));
          const voluti = { ...(live.lista_on ? { LocalAuthListEnabled: "true" } : {}), HeartbeatInterval: String((live.heartbeat && live.heartbeat.voluto) || 300),
            ...Object.fromEntries(Object.entries((live.parametri && live.parametri.voluti) || {}).map(([k, x]) => [k, String(x)])) };
          e.diff = Object.keys(voluti).filter((k) => letti[k] !== undefined && letti[k] !== voluti[k]).map((k) => `${k}: voluto ${voluti[k]}, letto ${letti[k]}`);
          e.ultimo = ora;
        }
      } catch (_) { /* retry at the next run */ }
    }
    cond.parametri = { da: e.diff && e.diff.length ? prima("parametri") : null, dett: (e.diff || []).join("; ") };
  }
  for (const [id, c] of Object.entries(cond)) {
    const r = cfg.regole[id], d = MALF[id], st = stato[id] || {};
    const soglia = d.tipo === "durata" ? Math.max(r.min, c.minimo || 0) * 60000 : 0;
    const attivo = r.on && c.da != null && ora - c.da >= soglia;
    const sogliaTxt = d.tipo === "durata" ? durataIt(soglia) : r.min + " " + d.unita;
    if (attivo) {
      let n = { ...st, da: c.da, ...(c.extra || {}) };
      if (!n.reg) { n.reg = true; storico.unshift({ id, dal: c.da, al: null }); }
      if (r.not && !n.nSent) { await notifica(env, d.label, c.dett + " - soglia " + sogliaTxt, ora); n.nSent = true; }
      if (!n.notificato) {
        if (!r.mail) { if (n.nSent) { n.notificato = ora; n.esito = "notifica"; } }
        else if (cfg.a.length) {
          const m = await inviaMail(env, cfg.a, `Malfunzionamento: ${d.label} - ${TITOLO}`,
            mailMalf("Malfunzionamento: " + d.label, [c.dett, "Dura da: " + dataIt(c.da) + " (" + durataIt(ora - c.da) + ")", "Soglia impostata: " + sogliaTxt, "Malfunction: " + d.label]), cfg.cc);
          n.esito = m; if (m === "inviata") n.notificato = ora;
          else if (!n.nSent && !n.notif) { n.notif = true; await notifica(env, d.label, c.dett + " (mail non inviata: " + m + ")", ora); }
        } else if (!n.nSent && !n.notif) { n.notif = true; await notifica(env, d.label, c.dett + " (nessun destinatario mail)", ora); }
      }
      stato[id] = n;
    } else if (st.reg) {
      const aperto = storico.find((x) => x.id === id && x.al === null); if (aperto) aperto.al = ora;
      if (st.notificato && st.esito === "inviata" && r.mail) {
        const m = await inviaMail(env, cfg.a, `Ripristinato: ${d.label} - ${TITOLO}`,
          mailMalf("Ripristinato: " + d.label, ["Il problema è rientrato.", "Segnalato il: " + dataIt(st.notificato), "Durata: " + durataIt(ora - (st.da || st.notificato)), "Resolved: " + d.label]), cfg.cc);
        if (m !== "inviata") { stato[id] = { ...st, esito: m, risolto: true }; continue; }
      }
      delete stato[id];
    } else if (c.da != null && r.on) stato[id] = { da: c.da, notificato: null, ...(c.extra || {}) };
    else delete stato[id];
  }
  // single events: unexpected restart (from the charger), public IP change, firmware change
  const eventi = eventiDO.filter((x) => x.id === "riavvio");
  const ip = await leggiMeta(env, "ultimo_ip", null);
  if (ip && ip.ip) { if (ext.ip && ext.ip !== ip.ip) eventi.push({ id: "ip", ts: ora, dett: "L'indirizzo IP pubblico e' passato da " + ext.ip + " a " + ip.ip }); ext.ip = ip.ip; }
  const fw = live.boot && live.boot.firmwareVersion;
  if (fw) { if (ext.fw && ext.fw !== fw) eventi.push({ id: "firmware", ts: ora, dett: "La versione del firmware e' passata da " + ext.fw + " a " + fw }); ext.fw = fw; }
  for (const x of eventi) {
    if (!on(x.id)) continue;
    const d = MALF[x.id];
    const rx = cfg.regole[x.id];
    let m = "non richiesta";
    if (rx.mail) { m = "nessun destinatario"; if (cfg.a.length) m = await inviaMail(env, cfg.a, `Avviso: ${d.label} - ${TITOLO}`, mailMalf("Avviso: " + d.label, [x.dett, "Il: " + dataIt(x.ts), "Notice: " + d.label]), cfg.cc); }
    if (rx.not || (rx.mail && m !== "inviata")) await notifica(env, d.label, x.dett + (rx.mail && m !== "inviata" ? " (mail non inviata: " + m + ")" : ""), x.ts);
    storico.unshift({ id: x.id, dal: x.ts, al: x.ts, evento: true, inviata: m === "inviata" });
  }
  storico.length = Math.min(storico.length, 100);
  await salvaMeta(env, "malfunzionamenti_stato", stato);
  await salvaMeta(env, "malfunzionamenti_storico", storico);
  await salvaMeta(env, "monitor_ultimo", ora);
}

// ------------------------------------------------ minimal PDF (text only, no libraries)
function creaPdf() {
  const pagine = [];
  let cur = null, y = 0;
  const nuova = () => { cur = []; pagine.push(cur); y = 800; };
  nuova();
  const W = (t, sz) => [...String(t)].reduce((s, c) => s + (c === "," || c === "." || c === " " ? 278 : c === "-" ? 333 : 556), 0) * sz / 1000;
  const enc = (t) => String(t).replace(/€/g, "\x80").replace(/[^\x20-\x7e\xa0-\xff\x80]/g, "?").replace(/([()\\])/g, "\\$1");
  const testo = (x, t, sz = 9, bold = false, destra = false) => {
    const xx = destra ? x - W(t, sz) : x;
    cur.push(`BT /F${bold ? 2 : 1} ${sz} Tf ${xx.toFixed(1)} ${y.toFixed(1)} Td (${enc(t)}) Tj ET`);
  };
  const filetto = (x1, x2, sp = 0.5) => cur.push(`${sp} w ${x1} ${(y - 3).toFixed(1)} m ${x2} ${(y - 3).toFixed(1)} l S`);
  const giu = (n = 1, h = 13) => { y -= n * h; };
  const serve = (righe) => { if (y - righe * 13 < 50) nuova(); };
  const build = () => {
    pagine.forEach((c, i) => { y = 25; cur = c; testo(555, `Pagina ${i + 1} di ${pagine.length}`, 8, false, true); });
    let out = "%PDF-1.4\n";
    const off = [];
    const add = (n, body) => { off[n] = out.length; out += `${n} 0 obj\n${body}\nendobj\n`; };
    const np = pagine.length;
    add(1, "<< /Type /Catalog /Pages 2 0 R >>");
    add(2, `<< /Type /Pages /Count ${np} /Kids [${pagine.map((_, i) => `${5 + i * 2} 0 R`).join(" ")}] >>`);
    add(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    add(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    pagine.forEach((c, i) => {
      const flusso = c.join("\n");
      add(5 + i * 2, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
      add(6 + i * 2, `<< /Length ${flusso.length} >>\nstream\n${flusso}\nendstream`);
    });
    const n = 4 + np * 2, x0 = out.length;
    out += `xref\n0 ${n + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= n; i++) out += String(off[i]).padStart(10, "0") + " 00000 n \n";
    out += `trailer\n<< /Size ${n + 1} /Root 1 0 R >>\nstartxref\n${x0}\n%%EOF\n`;
    return out;                                   // "binary" string (every character = 1 byte)
  };
  return { testo, filetto, giu, serve, build, y: () => y };
}

function pdfReportPrezzo(r) {
  const P = creaPdf(), N = (x, d = 2) => num(x, d);
  P.testo(40, TITOLO, 13, true); P.giu(1.4);
  P.testo(40, `Ripartizione costi di ricarica - ${r.titolo}`, 11, true); P.giu(1.3);
  P.testo(40, `Prezzo ${N(r.prezzo, 4)} €/kWh   IVA ${N(r.iva_pct, 1)}%   Importi in euro`, 9); P.giu(2);
  // summary per card
  const intest = () => {
    P.testo(40, "Tessera", 9, true); P.testo(110, "Utente", 9, true);
    P.testo(330, "Sess.", 9, true, true); P.testo(385, "kWh", 9, true, true); P.testo(450, "Imponibile", 9, true, true);
    P.testo(505, "IVA", 9, true, true); P.testo(555, "Totale", 9, true, true); P.filetto(40, 555, 0.8); P.giu();
  };
  P.testo(40, "Riepilogo per tessera", 10, true); P.giu(1.3); intest();
  for (const t of r.tessere) {
    P.serve(2);
    P.testo(40, t.tag); P.testo(110, t.nome.slice(0, 40));
    P.testo(330, String(t.n), 9, false, true); P.testo(385, N(t.kwh), 9, false, true); P.testo(450, N(t.imp), 9, false, true);
    P.testo(505, N(t.iva), 9, false, true); P.testo(555, N(t.tot), 9, false, true); P.giu();
  }
  P.filetto(40, 555); P.giu(1.1);
  P.testo(110, "Totale", 9, true);
  P.testo(330, String(r.tessere.reduce((x, t) => x + t.n, 0)), 9, true, true); P.testo(385, N(r.kwh_tessere), 9, true, true);
  P.testo(450, N(r.imp_tessere), 9, true, true); P.testo(505, N(r.iva_tessere), 9, true, true); P.testo(555, N(r.tot_tessere), 9, true, true);
  P.giu(2.5);
  // session details
  P.serve(4); P.testo(40, "Dettaglio delle sessioni", 10, true); P.giu(1.6);
  for (const t of r.tessere) {
    P.serve(Math.min(t.sess.length, 3) + 3);
    P.testo(40, `${t.tag} - ${t.nome}`.slice(0, 60), 10, true);
    P.testo(330, `${t.n} sess.`, 9, true, true); P.testo(385, N(t.kwh), 9, true, true); P.testo(450, N(t.imp), 9, true, true);
    P.testo(505, N(t.iva), 9, true, true); P.testo(555, N(t.tot), 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    for (const x of t.sess) {
      P.serve(2);
      P.testo(55, x.inizio); P.testo(150, x.fine);
      P.testo(385, N(x.kwh), 9, false, true); P.testo(450, N(x.imp), 9, false, true);
      P.testo(505, N(x.iva), 9, false, true); P.testo(555, N(x.tot), 9, false, true); P.giu();
    }
    P.giu(0.8);
  }
  return P.build();
}

async function mieRicariche(env, tags, anno) {
  tags = Array.isArray(tags) ? tags : [tags];
  const out = [];
  for (let m = 1; m <= 12; m++) {
    const r = await reportMese(env, anno, m, false);
    const ts = r.tessere.filter((x) => tags.includes(x.tag));          // if the card changed name during the month it appears more than once
    const sm = (k) => ts.reduce((z, x) => z + (x[k] || 0), 0);
    const t = ts.length ? { n: sm("n"), kwh: sm("kwh"), imp: ts[0].imp == null ? null : r2(sm("imp")), iva: ts[0].iva == null ? null : r2(sm("iva")),
      tot: ts[0].tot == null ? null : r2(sm("tot")), sess: ts.flatMap((x) => x.sess.map((z) => ({ ...z, tag: x.tag }))) } : null;
    out.push({ mese: m, nome: MESI[m - 1], prezzo: r.prezzo, iva_pct: r.iva_pct, n: t ? t.n : 0,
      kwh: t ? t.kwh : 0, imp: t ? t.imp : null, iva: t ? t.iva : null, tot: t ? t.tot : null, sess: t ? t.sess : [] });
  }
  return out;
}

function pdfMieRicariche(nome, tag, anno, mese, lista) {
  const P = creaPdf(), N = (x, d = 2) => num(x, d);
  const sel = mese ? lista.filter((x) => x.mese === mese) : lista;
  P.testo(40, TITOLO, 13, true); P.giu(1.4);
  P.testo(40, `Le mie ricariche - ${nome ? nome + " - " : ""}tessera ${tag}`, 11, true); P.giu(1.3);
  P.testo(40, mese ? `${MESI[mese - 1]} ${anno}` : `Anno ${anno}`, 9); P.giu(2);
  if (!mese) {
    P.testo(40, "Riepilogo per mese", 10, true); P.giu(1.3);
    P.testo(40, "Mese", 9, true); P.testo(220, "Ricariche", 9, true, true); P.testo(285, "kWh", 9, true, true);
    P.testo(345, "€/kWh", 9, true, true); P.testo(420, "Imponibile", 9, true, true); P.testo(485, "IVA", 9, true, true);
    P.testo(555, "Totale", 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    let k = 0, tt = 0, ok = false, nn = 0;
    for (const x of sel) {
      P.serve(2);
      P.testo(40, x.nome); P.testo(220, String(x.n), 9, false, true); P.testo(285, N(x.kwh), 9, false, true);
      P.testo(345, x.prezzo === null ? "-" : N(x.prezzo, 4), 9, false, true);
      P.testo(420, N(x.imp), 9, false, true); P.testo(485, N(x.iva), 9, false, true); P.testo(555, N(x.tot), 9, false, true);
      P.giu(); k += x.kwh; nn += x.n; if (x.tot !== null) { tt += x.tot; ok = true; }
    }
    P.filetto(40, 555); P.giu(1.1);
    P.testo(40, "Totale", 9, true); P.testo(220, String(nn), 9, true, true); P.testo(285, N(k), 9, true, true);
    P.testo(555, ok ? N(Math.round(tt * 100) / 100) : "-", 9, true, true);
    P.giu(2.5);
  }
  P.serve(4); P.testo(40, "Dettaglio delle sessioni", 10, true); P.giu(1.6);
  let nessuna = true;
  for (const x of sel) {
    if (!x.n) continue;
    nessuna = false;
    P.serve(Math.min(x.sess.length, 3) + 3);
    P.testo(40, `${x.nome} ${anno}`, 10, true);
    P.testo(330, `${x.n} sess.`, 9, true, true); P.testo(385, N(x.kwh), 9, true, true); P.testo(450, N(x.imp), 9, true, true);
    P.testo(505, N(x.iva), 9, true, true); P.testo(555, N(x.tot), 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    for (const s of x.sess) {
      P.serve(2);
      P.testo(55, s.inizio); P.testo(150, s.fine);
      P.testo(385, N(s.kwh), 9, false, true); P.testo(450, N(s.imp), 9, false, true);
      P.testo(505, N(s.iva), 9, false, true); P.testo(555, N(s.tot), 9, false, true); P.giu();
    }
    if (x.prezzo === null) { P.testo(55, "Prezzo del mese non ancora inserito: importi non disponibili.", 8); P.giu(); }
    else { P.testo(55, `Prezzo ${N(x.prezzo, 4)} €/kWh - IVA ${N(x.iva_pct, 1)}% - importi in euro`, 8); P.giu(); }
    P.giu(0.8);
  }
  if (nessuna) { P.testo(40, "Nessuna ricarica nel periodo selezionato.", 9); P.giu(); }
  return P.build();
}

async function inviaReportPrezzo(env, anno, mese, origin) {
  const d = await leggiDestinatari(env);
  if (!d.a.length) return "nessun destinatario";
  const r = await reportMese(env, anno, mese, false);
  const td = (v, n) => `<td style="padding:5px 8px;border-bottom:1px solid #ddd;${n ? "text-align:right;white-space:nowrap" : ""}">${v}</td>`;
  const th = (v, n) => `<th style="padding:5px 8px;border-bottom:2px solid #333;text-align:${n ? "right" : "left"}">${v}</th>`;
  let righe = "";
  for (const t of r.tessere)
    righe += `<tr>${td(esc(t.tag))}${td(esc(t.nome))}${td(t.n, 1)}${td(num(t.kwh), 1)}${td(num(t.imp), 1)}${td(num(t.iva), 1)}${td(num(t.tot), 1)}</tr>`;
  if (!r.tessere.length) righe = `<tr><td colspan="7" style="padding:8px"><i>Nessuna ricarica con tessera in questo mese.</i></td></tr>`;
  const n = r.tessere.reduce((x, t) => x + t.n, 0);
  const html = `<div style="font-family:Arial,sans-serif;max-width:720px">` +
    `<h2 style="margin:0 0 4px">${esc(TITOLO)}</h2>` +
    `<p style="color:#555;margin:0 0 16px">Ripartizione costi di ricarica - ${esc(r.titolo)}</p>` +
    `<p>Buongiorno,<br>è stato inserito il prezzo dell'energia di ${esc(r.titolo)}. Di seguito la ripartizione per tessera.</p>` +
    `<p>Prezzo: <b>${num(r.prezzo, 4)} &euro;/kWh</b> - IVA: <b>${num(r.iva_pct, 1)}%</b></p>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px"><tr>${th("Tessera")}${th("Utente")}${th("Sess.", 1)}${th("kWh", 1)}${th("Imponibile", 1)}${th("IVA", 1)}${th("Totale", 1)}</tr>${righe}` +
    `<tr style="font-weight:bold">${td("")}${td("Totale")}${td(n, 1)}${td(num(r.kwh_tessere), 1)}${td(num(r.imp_tessere), 1)}${td(num(r.iva_tessere), 1)}${td(num(r.tot_tessere), 1)}</tr></table>` +
    `<p style="color:#555;font-size:13px">Importi in euro. Il prezzo del mese è ora bloccato. Il dettaglio di tutte le sessioni è nel PDF allegato ed è consultabile anche nella pagina: ${esc(origin)}</p>${NOREPLY}</div>`;
  let allegati;
  try { allegati = [{ filename: `Ricariche_${anno}-${String(mese).padStart(2, "0")}.pdf`, content: btoa(pdfReportPrezzo(r)) }]; }
  catch (e) { allegati = undefined; }                       // if the PDF cannot be generated the email goes out anyway
  return inviaMail(env, d.a, `Ripartizione ricariche ${r.titolo} - ${TITOLO}`, html, d.cc, allegati);
}

function leggiPermessi(b) {
  return JSON.stringify(Object.fromEntries(PERMESSI.map((k) => [k, b && b[k] ? 1 : 0])));
}

// main card + other cards of the same user: checks they exist; returns { tess, altre } or { errore }
async function leggiTessereForm(env, b) {
  let tess = null; const altre = [];
  if (b.tessera) {
    const t = await env.DB.prepare("SELECT tag FROM tessere WHERE tag=?").bind(String(b.tessera).toUpperCase()).first();
    if (!t) return { errore: "Tessera non trovata: scarica prima dalla colonnina" };
    tess = t.tag;
  }
  if (tess && Array.isArray(b.tessere_altre)) for (const x of b.tessere_altre.slice(0, 8)) {
    const tag = String(x || "").toUpperCase();
    if (!tag || tag === tess || altre.includes(tag)) continue;
    const t = await env.DB.prepare("SELECT tag FROM tessere WHERE tag=?").bind(tag).first();
    if (!t) return { errore: "Tessera non trovata: scarica prima dalla colonnina" };
    altre.push(t.tag);
  }
  return { tess, altre };
}
async function gestisciUtenti(env, me, b, origin) {
  const nome = String(b.nome || "").trim().toLowerCase();
  if (b.azione === "invita") {
    if (!EMAIL_OK.test(nome)) return json({ errore: "Indirizzo email non valido" }, 400);
    const es = await env.DB.prepare("SELECT nome, ruolo FROM utenti WHERE nome=?").bind(nome).first();
    if (es && es.ruolo === "admin") return json({ errore: "Questo utente e' l'admin" }, 400);
    const tf = await leggiTessereForm(env, b);
    if (tf.errore) return json({ errore: tf.errore }, 400);
    const tess = tf.tess; let nomeTess = "";
    if (tess) nomeTess = (await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tess).first()).nome;
    const tok = hex(crypto.getRandomValues(new Uint8Array(32)));
    const exp = Math.floor(Date.now() / 1000) + DURATA_INVITO;
    if (es) {
      await env.DB.prepare("UPDATE utenti SET invito_hash=?, invito_exp=?, permessi=?, tessera=? WHERE nome=?")
        .bind(await sha256(tok), exp, leggiPermessi(b.permessi), tess, nome).run();
    } else {
      await env.DB.prepare("INSERT INTO utenti (nome, salt, hash, ruolo, permessi, invito_hash, invito_exp, tessera) VALUES (?,?,?,?,?,?,?,?)")
        .bind(nome, "", "", "utente", leggiPermessi(b.permessi), await sha256(tok), exp, tess).run();
    }
    await env.DB.prepare("UPDATE utenti SET tessere_altre=? WHERE nome=?").bind(tf.altre.length ? JSON.stringify(tf.altre) : null, nome).run();
    const link = `${origin}/?invito=${tok}&e=${encodeURIComponent(nome)}`;
    const cosaIt = tess
      ? `potrai consultare le tue ricariche (tessera ${esc(tess)}, ${esc(nomeTess)})`
      : "potrai consultare i report delle ricariche";
    const cosaEn = tess
      ? `you will be able to view your charges (card ${esc(tess)}, ${esc(nomeTess)})`
      : "you will be able to view the charging reports";
    const bottone = (t) => `<p><a href="${link}" style="display:inline-block;background:#0b6bcb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${t}</a></p>`;
    const mail = await inviaMail(env, nome, `Accesso a ${TITOLO} / Access to ${TITOLO}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px">` +
      `<h2 style="margin:0 0 16px">${TITOLO}</h2>` +
      `<p style="color:#555;margin:0 0 8px"><b>Italiano</b> - Ripartizione costi di ricarica</p>` +
      `<p>Buongiorno,</p><p>è stato creato un accesso a tuo nome: ${cosaIt}.</p>` +
      `<p>Per iniziare scegli la tua password dal pulsante qui sotto. Il link è personale, monouso e vale 48 ore.</p>` +
      bottone("Scegli la password") +
      `<p style="color:#555;font-size:13px">Il tuo nome utente è ${esc(nome)}.</p>` +
      `<hr style="border:0;border-top:1px solid #ddd;margin:20px 0">` +
      `<p style="color:#555;margin:0 0 8px"><b>English</b> - Charging cost split</p>` +
      `<p>Hello,</p><p>An account has been created for you: ${cosaEn}.</p>` +
      `<p>To get started, choose your password with the button below. The link is personal, single-use and valid for 48 hours.</p>` +
      bottone("Choose your password") +
      `<p style="color:#555;font-size:13px">Your username is ${esc(nome)}.</p>` +
      `<p style="color:#555;font-size:13px">Se il pulsante non funziona copia questo indirizzo nel browser / If the button does not work, copy this address into your browser:<br>${link}</p>${NOREPLY}</div>`);
    return json({ ok: true, mail, link: mail === "inviata" ? undefined : link });
  }
  if (b.azione === "permessi") {
    const tf = await leggiTessereForm(env, b);
    if (tf.errore) return json({ errore: tf.errore }, 400);
    const tess = tf.tess;
    const prima = await env.DB.prepare("SELECT tessera, registrato_il, verifica_hash, nome_proprio FROM utenti WHERE nome=?").bind(nome).first();
    const r = await env.DB.prepare("UPDATE utenti SET permessi=?, tessera=? WHERE nome=? AND ruolo<>'admin'").bind(leggiPermessi(b.permessi), tess, nome).run();
    if (r.meta.changes) await env.DB.prepare("UPDATE utenti SET tessere_altre=? WHERE nome=?").bind(tf.altre.length ? JSON.stringify(tf.altre) : null, nome).run();
    let mail;
    if (r.meta.changes && prima && prima.registrato_il && !prima.tessera && tess && !prima.verifica_hash) mail = await mailAttivazione(env, nome, await decifra(env, prima.nome_proprio, nome + "|nome_proprio"), tess, origin);   // self-registered user: now active
    return json(r.meta.changes ? { ok: true, mail } : { errore: "utente non trovato" }, r.meta.changes ? 200 : 404);
  }
  if (b.azione === "elimina") {
    const es = await env.DB.prepare("SELECT ruolo FROM utenti WHERE nome=?").bind(nome).first();
    if (!es) return json({ errore: "utente non trovato" }, 404);
    if (es.ruolo === "admin") return json({ errore: "L'admin non si puo' eliminare" }, 400);
    await env.DB.prepare("DELETE FROM utenti WHERE nome=?").bind(nome).run();
    await env.DB.prepare("DELETE FROM ticket WHERE utente=?").bind(nome).run();
    return json({ ok: true });
  }
  return json({ errore: "azione non valida" }, 400);
}

// block/unblock of a card: effective at once for the OCPP server (state in meta) and also written to the charger;
// if the charger does not answer the block stays "in attesa" (pending) and the 5-minute check retries. Returns "ok" or "in attesa".
// When the charger receives the list over OCPP (which does not contain blocked cards) it removes them from its own list: that is why blocked cards
// are recorded in the register (meta 'tessere_bloccate', with name and expiry) and unblocking puts them back in the list.
async function bloccaTessera(env, tag, blocca) {
  const stato = blocca ? "1" : "0";
  const regVecchio = await leggiMeta(env, "tessere_bloccate", []);
  const salvato = regVecchio.find((x) => x.tag === tag) || null;
  const reg = regVecchio.filter((x) => x.tag !== tag);
  const nomeDb = async () => { const r = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tag).first(); return rfidNome(r ? r.nome : tag).slice(0, RFID_NOME_MAX); };
  let nome = salvato && salvato.nome ? salvato.nome : await nomeDb(), scad = salvato ? salvato.scad || "" : "";
  const salvaReg = async () => { if (blocca) reg.push({ tag, nome, scad }); await salvaMeta(env, "tessere_bloccate", reg); };
  const c = await leggiMeta(env, "rfid_stato", null);      // OCPP server view: effective at once
  if (Array.isArray(c)) {
    const x = c.find((t) => t.id === tag);
    if (x) x.stato = stato; else if (!blocca) c.push({ id: tag, scad, stato });
    c.sort((p, q) => (p.id < q.id ? -1 : 1));
    await salvaMeta(env, "rfid_stato", c);
  }
  // the card list is sent to the charger over OCPP too (deferred by 30 s): rfidCache would not do it, the state in meta is already updated
  try { await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/sync-differita", { method: "POST" }); } catch (_) { /* not connected: it is aligned at its next start*/ }
  const pend = (await leggiMeta(env, "blocchi_pendenti", [])).filter((p) => p.tag !== tag);
  try {
    const prima = riempiNomi(await rfidDallaColonnina(env), await nomiDb(env));
    const x = prima.find((t) => t.id === tag);
    if (x) {
      if (x.nome) nome = x.nome;
      scad = x.scad || scad;
      if (x.stato !== stato) await rfidScrivi(env, prima, prima.map((t) => (t.id === tag ? { ...t, stato } : t)));
    } else if (!blocca) {                                   // removed from the charger after the block: put it back in the list
      await rfidScrivi(env, prima, [...prima, { id: tag, scad, nome, stato: "0" }]);
    }
    await salvaReg();
    await salvaMeta(env, "blocchi_pendenti", pend);
    return "ok";
  } catch (_) {
    pend.push({ tag, stato });
    await salvaReg();
    await salvaMeta(env, "blocchi_pendenti", pend);
    return "in attesa";
  }
}
// card list for the admin: those on the charger plus those blocked by the site (the charger removes them from its list), with state "1" (blocked)
async function conBloccate(env, lista) {
  const reg = await leggiMeta(env, "tessere_bloccate", []);
  return lista.concat(reg.filter((r) => !lista.some((x) => x.id === r.tag)).map((r) => ({ id: r.tag, scad: r.scad || "", nome: r.nome || "", stato: "1", bloccata_sito: true })));
}
async function applicaBlocchiPendenti(env) {
  const pend = await leggiMeta(env, "blocchi_pendenti", []);
  for (const p of pend.slice(0, 5)) await bloccaTessera(env, p.tag, p.stato === "1");
}

// ------------------------------------------------ tickets: user requests to the admin (card, data, deletion, charger, other)
const TIPI_TICKET = { tessera: "Tessera smarrita o danneggiata", dati: "Correzione dei dati", cancellazione: "Cancellazione dei dati / dell'utenza", colonnina: "Problema con la colonnina", altro: "Altro", nuova: "Richiesta nuova tessera" };
const TICKET_GRAVI = ["tessera", "colonnina", "nuova"];      // for these the admin also gets an email; the others only the in-site notification
async function ticketLeggi(env, r) {
  const ex = await decifra(env, r.extra, r.utente + "|ticket_extra");
  let extra = null; try { extra = ex ? JSON.parse(ex) : null; } catch (_) { /* empty */ }
  let integr = []; try { const x = await decifra(env, r.integrazioni, r.utente + "|ticket_integr"); integr = x ? JSON.parse(x) : []; } catch (_) { /* empty */ }
  return { id: r.id, utente: r.utente, tipo: r.tipo, stato: r.stato, creato: r.creato, gestito: r.gestito, extra, integrazioni: integr,
    testo: await decifra(env, r.testo, r.utente + "|ticket_testo"), nota: await decifra(env, r.nota, r.utente + "|ticket_nota") };
}
async function ticket(req, env, me, url) {
  await preparaTabelle(env);
  if (req.method === "GET") {
    const righe = me.ruolo === "admin"
      ? (await env.DB.prepare("SELECT * FROM ticket ORDER BY (stato='aperto') DESC, id DESC LIMIT 200").all()).results
      : (await env.DB.prepare("SELECT * FROM ticket WHERE utente=? ORDER BY id DESC LIMIT 50").bind(me.nome).all()).results;
    const L = [];
    for (const r of righe) L.push(await ticketLeggi(env, r));
    if (me.ruolo === "admin") {                      // names, to recognise who writes
      const ana = {};
      for (const t of L) if (!ana[t.utente]) {
        const u = await env.DB.prepare("SELECT nome_proprio, cognome FROM utenti WHERE nome=?").bind(t.utente).first();
        ana[t.utente] = u ? (((await decifra(env, u.nome_proprio, t.utente + "|nome_proprio")) || "") + " " + ((await decifra(env, u.cognome, t.utente + "|cognome")) || "")).trim() : "";
      }
      for (const t of L) t.nome_utente = ana[t.utente];
    }
    return json(L);
  }
  if (req.method !== "POST") return json({ errore: "metodo non valido" }, 405);
  const b = await req.json();
  if (b.azione === "apri") {
    if (me.ruolo === "admin") return json({ errore: "L'admin gestisce i ticket, non li apre" }, 400);
    const tipo = String(b.tipo || "");
    if (!TIPI_TICKET[tipo]) return json({ errore: "Tipo di richiesta non valido" }, 400);
    const testo = String(b.testo || "").trim().slice(0, 1000);
    const aperti = (await env.DB.prepare("SELECT COUNT(*) n FROM ticket WHERE utente=? AND stato='aperto'").bind(me.nome).first()).n;
    if (aperti >= 5) return json({ errore: "Hai gia' 5 richieste aperte: attendi che vengano gestite" }, 429);
    let extra = null;
    if (tipo === "tessera") {
      const tag = String(b.tessera || "").toUpperCase();
      if (!(me.tessere || []).includes(tag)) return json({ errore: "Scegli una delle tue tessere" }, 400);
      extra = { tessera: tag, motivo: b.motivo === "danneggiata" ? "danneggiata" : "smarrita" };
      extra.blocco = await bloccaTessera(env, tag, true);      // for safety the card is blocked at once; the admin can unblock it

    } else if (tipo === "dati") {
      const nuovo = {}, nome = nomePulito(b.nome), cognome = nomePulito(b.cognome);
      const t1 = String(b.tel1 || "").replace(/\s/g, ""), t2 = String(b.tel2 || "").replace(/\s/g, "");
      if (nome) nuovo.nome = nome;
      if (cognome) nuovo.cognome = cognome;
      if (t1) { if (!TEL_OK.test(t1)) return json({ errore: "Numero di telefono non valido" }, 400); nuovo.tel1 = t1; }
      if (t2) { if (!TEL_OK.test(t2)) return json({ errore: "Secondo numero di telefono non valido" }, 400); nuovo.tel2 = t2; }
      if (!Object.keys(nuovo).length && !testo) return json({ errore: "Indica cosa vuoi correggere" }, 400);
      extra = nuovo;
    } else if (tipo === "nuova") {
      const gia = (await env.DB.prepare("SELECT COUNT(*) n FROM ticket WHERE utente=? AND tipo='nuova' AND stato='aperto'").bind(me.nome).first()).n;
      if (gia) return json({ errore: "Hai gia' una richiesta di nuova tessera aperta: attendi che venga gestita" }, 400);
      const pg = await leggiMeta(env, "pagamento_tessera", {});
      const met = String(b.pagamento || "contanti");
      if (met !== "contanti" && !(["paypal", "satispay", "revolut"].includes(met) && pg[met])) return json({ errore: "Metodo di pagamento non disponibile" }, 400);
      extra = { pagamento: met };
    } else if (!testo) return json({ errore: "Scrivi il messaggio" }, 400);
    const r = await env.DB.prepare("INSERT INTO ticket (utente, tipo, testo, extra, stato, creato) VALUES (?,?,?,?,?,?)")
      .bind(me.nome, tipo, await cifra(env, testo || null, me.nome + "|ticket_testo"), await cifra(env, extra ? JSON.stringify(extra) : null, me.nome + "|ticket_extra"), "aperto", new Date().toISOString()).run();
    const id = r.meta.last_row_id;
    const grave = TICKET_GRAVI.includes(tipo);
    const dett = `${me.nome}: ${TIPI_TICKET[tipo]}` + (extra && extra.tessera ? ` (${extra.tessera}, ${extra.motivo}, ${extra.blocco === "ok" ? "bloccata" : "blocco in attesa"})` : "");
    let righeNuova = [];
    if (tipo === "nuova") {      // the admin must be able to contact the user for delivery and payment
      const cfgReq = await leggiConfig(env);
      const uu = await env.DB.prepare("SELECT nome_proprio, cognome, tel1, tel2 FROM utenti WHERE nome=?").bind(me.nome).first();
      const g = async (c) => (uu ? (await decifra(env, uu[c], me.nome + "|" + c)) || "" : "");
      const t2 = await g("tel2");
      righeNuova = [`Nome: ${(await g("nome_proprio"))} ${(await g("cognome"))}`.trim(), `Telefono: ${await g("tel1")}${t2 ? " / " + t2 : ""}`, `Pagamento scelto dall'utente: ${{ paypal: "PayPal", satispay: "Satispay", revolut: "Revolut", contanti: "contanti alla consegna" }[(extra && extra.pagamento) || "contanti"]}`, "Richiesta di una nuova tessera" + (costoTessera(cfgReq) ? " (" + costoTessera(cfgReq) + ")" : "") + ": contattare l'utente per consegna e pagamento."];
    }
    let inviata = false;
    if (grave) {
      const m = await leggiMalf(env);
      if (m.a.length) inviata = (await inviaMail(env, m.a, `Nuova richiesta #${id}: ${TIPI_TICKET[tipo]} - ${TITOLO}`,
        mailMalf(`Nuova richiesta #${id}: ${TIPI_TICKET[tipo]}`, [`Utente: ${me.nome}`, ...righeNuova, ...(extra && extra.tessera ? [`Tessera ${extra.motivo}: ${extra.tessera}`, extra.blocco === "ok" ? "La tessera è stata bloccata sulla colonnina." : "Blocco della tessera in attesa: la colonnina non ha risposto, riprovo ogni 5 minuti."] : []), ...(testo ? [`Messaggio: ${testo}`] : []),
          "Gestiscila dalla scheda Ticket del sito."]), m.cc)) === "inviata";
    }
    if (!inviata) await notifica(env, `Nuovo ticket #${id}`, dett + (righeNuova.length ? " - " + righeNuova.join(" - ") : ""));
    return json({ ok: true, id });
  }
  if (b.azione === "integra") {                      // the user adds information to one of their open tickets (instead of opening more)
    const r = await env.DB.prepare("SELECT * FROM ticket WHERE id=? AND utente=?").bind(+b.id || 0, me.nome).first();
    if (!r) return json({ errore: "Ticket non trovato" }, 404);
    if (r.stato !== "aperto") return json({ errore: "Ticket gia' gestito: non si puo' piu' integrare" }, 400);
    const testo = String(b.testo || "").trim().slice(0, 1000);
    if (!testo) return json({ errore: "Scrivi il messaggio" }, 400);
    const t = await ticketLeggi(env, r);
    if (t.integrazioni.length >= 10) return json({ errore: "Hai raggiunto il numero massimo di integrazioni" }, 400);
    t.integrazioni.push({ ts: new Date().toISOString(), testo });
    await env.DB.prepare("UPDATE ticket SET integrazioni=? WHERE id=?").bind(await cifra(env, JSON.stringify(t.integrazioni), me.nome + "|ticket_integr"), r.id).run();
    await notifica(env, `Ticket #${r.id} integrato`, `${me.nome}: ${TIPI_TICKET[r.tipo]}`);
    return json({ ok: true });
  }
  if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
  if (b.azione === "sblocca") {                      // manual unblock of a card blocked by a ticket (even one already handled)
    const r = await env.DB.prepare("SELECT * FROM ticket WHERE id=?").bind(+b.id || 0).first();
    if (!r) return json({ errore: "Ticket non trovato" }, 404);
    const t = await ticketLeggi(env, r);
    if (t.tipo !== "tessera" || !t.extra || !t.extra.tessera) return json({ errore: "Questo ticket non riguarda una tessera" }, 400);
    const sb = await bloccaTessera(env, t.extra.tessera, false);
    await env.DB.prepare("UPDATE ticket SET extra=? WHERE id=?").bind(await cifra(env, JSON.stringify({ ...t.extra, blocco: "sbloccata" }), t.utente + "|ticket_extra"), r.id).run();
    if (EMAIL_OK.test(t.utente)) {
      const att = sb === "in attesa", tg = t.extra.tessera;
      await inviaMail(env, t.utente, `Tessera ${tg} riattivata / Card ${tg} reactivated - ${TITOLO}`,
        `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${TITOLO}</h2><p><b>Italiano</b></p><p>${esc(`La tessera ${tg} è stata riattivata a seguito della tua comunicazione di ritrovamento.` + (att ? " La riattivazione sulla colonnina sarà completata entro pochi minuti." : ""))}</p>` +
        `<hr style="border:0;border-top:1px solid #ddd;margin:20px 0"><p><b>English</b></p><p>${esc(`Card ${tg} has been reactivated following your report that it was found.` + (att ? " Reactivation on the charger will be completed within a few minutes." : ""))}</p>${NOREPLY}</div>`);
    }
    return json({ ok: true, applicato: sb === "in attesa" ? "Sblocco in attesa: la colonnina non risponde, riprovo ogni 5 minuti." : "Tessera sbloccata." });
  }
  if (b.azione === "gestisci") {
    const r = await env.DB.prepare("SELECT * FROM ticket WHERE id=?").bind(+b.id || 0).first();
    if (!r) return json({ errore: "Ticket non trovato" }, 404);
    if (r.stato !== "aperto") return json({ errore: "Ticket gia' gestito" }, 400);
    const t = await ticketLeggi(env, r);
    const esito = { approva: "approvato", rifiuta: "rifiutato", chiudi: "chiuso", ritrovata: "chiuso" }[b.esito];
    if (!esito) return json({ errore: "Esito non valido" }, 400);
    if (esito === "approvato" && !["tessera", "dati", "cancellazione", "nuova"].includes(t.tipo)) return json({ errore: "Questo tipo di richiesta si chiude, non si approva" }, 400);
    const nota = String(b.nota || "").trim().slice(0, 500);
    let applicato = "";
    const dIt = [], dEn = [];                         // outcome details for the email to the user
    const u = await env.DB.prepare("SELECT nome, ruolo, tessera, tessere_altre FROM utenti WHERE nome=?").bind(t.utente).first();
    if (esito === "approvato") {
      if (!u) return json({ errore: "L'utente non esiste piu'" }, 404);
      if (u.ruolo === "admin") return json({ errore: "Non applicabile all'admin" }, 400);
      if (t.tipo === "tessera") {
        const vecchia = t.extra && t.extra.tessera, tutte = tessereDi(u).filter((x) => x !== vecchia);
        const nuova = String(b.nuova || "").toUpperCase();
        if (nuova) {
          const ok = await env.DB.prepare("SELECT tag FROM tessere WHERE tag=?").bind(nuova).first();
          if (!ok) return json({ errore: "Tessera non trovata: scarica prima dalla colonnina" }, 400);
          if (!tutte.includes(nuova)) tutte.push(nuova);
        }
        await env.DB.prepare("UPDATE utenti SET tessera=?, tessere_altre=? WHERE nome=?")
          .bind(tutte[0] || null, tutte.length > 1 ? JSON.stringify(tutte.slice(1)) : null, u.nome).run();
        applicato = `Tessera ${vecchia} scollegata` + (nuova ? `, abbinata ${nuova}` : "") + ".";
        dIt.push(`La tessera ${vecchia} è stata bloccata` + (nuova ? ` e sostituita con la nuova tessera ${nuova}, già utilizzabile.` : " e scollegata dal tuo account."));
        dEn.push(`Card ${vecchia} has been blocked` + (nuova ? ` and replaced with the new card ${nuova}, ready to use.` : " and unlinked from your account."));
      } else if (t.tipo === "nuova") {
        const nuova = String(b.nuova || "").toUpperCase();
        if (!nuova) return json({ errore: "Scegli la tessera da assegnare" }, 400);
        const ok = await env.DB.prepare("SELECT tag FROM tessere WHERE tag=?").bind(nuova).first();
        if (!ok) return json({ errore: "Tessera non trovata: scarica prima dalla colonnina" }, 400);
        const altro = await env.DB.prepare("SELECT nome FROM utenti WHERE nome<>? AND (tessera=? OR tessere_altre LIKE ?)").bind(u.nome, nuova, `%"${nuova}"%`).first();
        if (altro) return json({ errore: "Tessera gia' assegnata a un altro utente" }, 400);
        const tutte = tessereDi(u);
        if (!tutte.includes(nuova)) tutte.push(nuova);
        await env.DB.prepare("UPDATE utenti SET tessera=?, tessere_altre=? WHERE nome=?")
          .bind(tutte[0] || null, tutte.length > 1 ? JSON.stringify(tutte.slice(1)) : null, u.nome).run();
        applicato = `Tessera ${nuova} abbinata.`;
        dIt.push(`La tessera ${nuova} è stata abbinata al tuo account ed è già utilizzabile.`);
        dEn.push(`Card ${nuova} has been linked to your account and is ready to use.`);
      } else if (t.tipo === "dati") {
        const x = t.extra || {}, set = {};
        if (x.nome) set.nome_proprio = x.nome;
        if (x.cognome) set.cognome = x.cognome;
        if (x.tel1) set.tel1 = x.tel1;
        if (x.tel2) set.tel2 = x.tel2;
        const campi = Object.keys(set);
        if (campi.length) {
          const vals = []; for (const c of campi) vals.push(await cifra(env, set[c], u.nome + "|" + c));
          await env.DB.prepare(`UPDATE utenti SET ${campi.map((c) => c + "=?").join(", ")} WHERE nome=?`).bind(...vals, u.nome).run();
        }
        applicato = campi.length ? "Dati aggiornati." : "Nessun dato da aggiornare: la richiesta era solo testuale.";
        if (campi.length) {
          const et = { nome_proprio: ["nome", "first name"], cognome: ["cognome", "last name"], tel1: ["telefono", "phone"], tel2: ["secondo telefono", "second phone"] };
          dIt.push("Abbiamo aggiornato i tuoi dati: " + campi.map((c) => et[c][0]).join(", ") + ".");
          dEn.push("We have updated your details: " + campi.map((c) => et[c][1]).join(", ") + ".");
        }
      }
    }
    let extraNuovo = null;
    if (t.tipo === "tessera" && t.extra && t.extra.tessera && (esito === "rifiutato" || b.esito === "ritrovata")) {   // request rejected or card found: unblock
      const sb = await bloccaTessera(env, t.extra.tessera, false);
      extraNuovo = await cifra(env, JSON.stringify({ ...t.extra, blocco: "sbloccata" }), t.utente + "|ticket_extra");
      applicato = sb === "in attesa" ? `Tessera ${t.extra.tessera}: sblocco in attesa (colonnina non raggiungibile).` : `Tessera ${t.extra.tessera} sbloccata.`;
      const att = sb === "in attesa", tg = t.extra.tessera;
      if (b.esito === "ritrovata") {
        dIt.push(`La tessera ${tg} è stata riattivata a seguito della tua comunicazione di ritrovamento.` + (att ? " La riattivazione sulla colonnina sarà completata entro pochi minuti." : ""));
        dEn.push(`Card ${tg} has been reactivated following your report that it was found.` + (att ? " Reactivation on the charger will be completed within a few minutes." : ""));
      } else {
        dIt.push(`La tessera ${tg} è stata riattivata: la richiesta di blocco non è stata accolta.` + (att ? " La riattivazione sulla colonnina sarà completata entro pochi minuti." : ""));
        dEn.push(`Card ${tg} has been reactivated: the block request was not accepted.` + (att ? " Reactivation on the charger will be completed within a few minutes." : ""));
      }
    }
    const intest = { approvato: "approvata", rifiutato: "rifiutata", chiuso: "chiusa" }[esito], intestEn = { approvato: "approved", rifiutato: "rejected", chiuso: "closed" }[esito];
    if (EMAIL_OK.test(t.utente)) {      // the user gets the outcome (before the account is possibly deleted)
      const rIt = [`La tua richiesta n. ${r.id} (${TIPI_TICKET[t.tipo]}) è stata ${intest}.`, ...(t.tipo === "cancellazione" && esito === "approvato" ? ["L'utenza e i dati personali associati sono stati cancellati."] : []), ...dIt, ...(nota ? [`Nota dell'Amministratore: ${nota}`] : [])];
      const rEn = [`Your request no. ${r.id} has been ${intestEn}.`, ...(t.tipo === "cancellazione" && esito === "approvato" ? ["Your account and the associated personal data have been deleted."] : []), ...dEn, ...(nota ? [`Administrator's note: ${nota}`] : [])];
      await inviaMail(env, t.utente, `Richiesta n. ${r.id} ${intest} / Request no. ${r.id} ${intestEn} - ${TITOLO}`,
        `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${TITOLO}</h2><p><b>Italiano</b></p><p>${rIt.map(esc).join("<br>")}</p><hr style="border:0;border-top:1px solid #ddd;margin:20px 0"><p><b>English</b></p><p>${rEn.map(esc).join("<br>")}</p>${NOREPLY}</div>`);
    }
    if (esito === "approvato" && t.tipo === "cancellazione") {
      await env.DB.prepare("DELETE FROM utenti WHERE nome=?").bind(t.utente).run();
      await env.DB.prepare("DELETE FROM ticket WHERE utente=? AND id<>?").bind(t.utente, r.id).run();
      await env.DB.prepare("UPDATE ticket SET utente='(utenza cancellata)', testo=NULL, extra=NULL, nota=NULL, integrazioni=NULL, stato=?, gestito=? WHERE id=?").bind(esito, new Date().toISOString(), r.id).run();
      return json({ ok: true, applicato: "Utenza e dati cancellati." });
    }
    await env.DB.prepare("UPDATE ticket SET stato=?, gestito=?, nota=?, extra=COALESCE(?, extra) WHERE id=?")
      .bind(esito, new Date().toISOString(), await cifra(env, nota || null, t.utente + "|ticket_nota"), extraNuovo, r.id).run();
    return json({ ok: true, applicato });
  }
  return json({ errore: "azione non valida" }, 400);
}

// ---------------------------------------------------- encryption of personal data (AES-256-GCM)
// The key is the DATA_KEY secret (32 bytes in base64). Every encrypted value is "enc1:<iv>:<ciphertext>" and is valid only for that row and field
// (authenticated context = email + field name). Without the key data stays in clear (and the site says so); without the key encrypted data cannot be read.
let chiaveDati = null;
async function chiaveAes(env) {
  if (!env.DATA_KEY) return null;
  if (chiaveDati) return chiaveDati;
  try {
    const raw = Uint8Array.from(atob(String(env.DATA_KEY).trim()), (c) => c.charCodeAt(0));
    if (raw.length !== 32) return null;
    chiaveDati = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  } catch (_) { return null; }
  return chiaveDati;
}
const b64u8 = (u8) => { let t = ""; for (const x of u8) t += String.fromCharCode(x); return btoa(t); };
const u8b64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
async function cifra(env, valore, ctx) {
  if (valore === null || valore === undefined || valore === "") return valore;
  const k = await chiaveAes(env);
  if (!k) return valore;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc(ctx) }, k, enc(String(valore))));
  return "enc1:" + b64u8(iv) + ":" + b64u8(ct);
}
async function decifra(env, valore, ctx) {
  if (typeof valore !== "string" || !valore.startsWith("enc1:")) return valore;      // in clear (old data or encryption not active)
  const k = await chiaveAes(env);
  if (!k) return "[cifrato: manca la chiave]";
  try {
    const [, iv, ct] = valore.split(":");
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u8b64(iv), additionalData: enc(ctx) }, k, u8b64(ct)));
  } catch (_) { return "[illeggibile]"; }
}
const CAMPI_CIFRATI = ["nome_proprio", "cognome", "tel1", "tel2", "consensi"];
// encrypts data already present in clear (once, harmless to repeat); returns how many users were updated
async function migraCifratura(env) {
  if (!(await chiaveAes(env))) return 0;
  await preparaTabelle(env);
  const righe = (await env.DB.prepare("SELECT nome, nome_proprio, cognome, tel1, tel2, consensi FROM utenti WHERE registrato_il IS NOT NULL OR profilo_il IS NOT NULL").all()).results;
  let n = 0;
  for (const r of righe) {
    const nuovi = {};
    for (const c of CAMPI_CIFRATI) if (r[c] && !String(r[c]).startsWith("enc1:")) nuovi[c] = await cifra(env, r[c], r.nome + "|" + c);
    const campi = Object.keys(nuovi);
    if (!campi.length) continue;
    await env.DB.prepare(`UPDATE utenti SET ${campi.map((c) => c + "=?").join(", ")} WHERE nome=?`).bind(...campi.map((c) => nuovi[c]), r.nome).run();
    n++;
  }
  return n;
}
async function statoCifratura(env) {
  await preparaTabelle(env);
  const righe = (await env.DB.prepare("SELECT nome_proprio, cognome, tel1, tel2, consensi FROM utenti WHERE registrato_il IS NOT NULL OR profilo_il IS NOT NULL").all()).results;
  let cifrati = 0, chiaro = 0;
  for (const r of righe) for (const c of CAMPI_CIFRATI) if (r[c]) (String(r[c]).startsWith("enc1:") ? cifrati++ : chiaro++);
  return { attiva: !!(await chiaveAes(env)), cifrati, chiaro, utenti: righe.length, turnstile: turnstileAttivo(env) };
}

// ---------------------------------------------------- user self-registration
// Rules and privacy notice: written by whoever installs the site (Settings -> Legal texts), in Italian and English,
// with an "edition" (e.g. the date) saved in the consents. Without texts registration still works but the page says so.
const TESTI_VUOTI = { reg_it: "", reg_en: "", priv_it: "", priv_en: "", edizione: "" };
async function leggiTesti(env) { return { ...TESTI_VUOTI, ...(await leggiMeta(env, "testi_legali", {})) }; }
const PW_FORTE = (p) => p.length >= 12 && p.length <= 128 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9\s]/.test(p);
const TEL_OK = /^\+[1-9][0-9]{7,14}$/;
const nomePulito = (t) => String(t || "").replace(/\s+/g, " ").trim().slice(0, 60);

// "Service activation" email: sent when a self-registered user has confirmed the email and has a card linked
async function mailAttivazione(env, email, nomeP, tess, origin) {
  const t = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tess).first();
  const dett = `${esc(tess)}${t && t.nome ? " (" + esc(t.nome) + ")" : ""}`;
  return await inviaMail(env, email, `Attivazione del servizio / Service activation - ${TITOLO}`,
    `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${TITOLO}</h2>` +
    `<p style="color:#555;margin:0 0 8px"><b>Italiano</b></p><p>Buongiorno ${esc(nomeP || "")},</p>` +
    `<p><b>Utenza attivata: puoi accedere al sito.</b></p><p>La tessera ${dett} è stata abbinata al tuo account: ora puoi consultare le tue ricariche.</p>` +
    `<p><a href="${origin}/" style="display:inline-block;background:#0b6bcb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Accedi</a></p>` +
    `<hr style="border:0;border-top:1px solid #ddd;margin:20px 0"><p style="color:#555;margin:0 0 8px"><b>English</b></p><p>Hello ${esc(nomeP || "")},</p>` +
    `<p><b>Account activated: you can now sign in to the site.</b></p><p>Card ${dett} has been linked to your account: you can now view your charges.</p>` +
    `<p><a href="${origin}/" style="display:inline-block;background:#0b6bcb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Sign in</a></p>${NOREPLY}</div>`);
}

// ---------------------------------------------------- Cloudflare usage (admin only)
// Needs an API token with the "Account Analytics: Read" permission (secret CF_API_TOKEN) and CF_ACCOUNT_ID in wrangler.toml.
// Free-plan limits, per day (UTC).
const LIMITI_CF = { req: 100000, d1r: 5000000, d1w: 100000, dor: 100000, dogbs: 13000, dorr: 5000000, dorw: 100000, spazio: 5000000000 };   // storage: 5 GB for D1 and 5 GB for the Durable Object, totals (not daily)
async function consumiCloudflare(env) {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return { configurato: false };
  const c = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='consumi_cache'").first();
  if (c) { try { const d = JSON.parse(c.valore); if (Date.now() - d.ts < 600000 && d.mesi) return d; } catch (_) { /* redo */ } }
  const oggi = new Date(), iso = (d) => d.toISOString().slice(0, 10);
  const da = iso(new Date(Math.max(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - 1, 1), Date.now() - 31 * 86400000))), a = iso(oggi);   // Cloudflare accepts at most 32 days per query
  const filtro = `filter:{date_geq:"${da}",date_leq:"${a}"}`;
  const Q = {
    w: `workersInvocationsAdaptive(limit:2000,${filtro}){dimensions{date} sum{requests errors} quantiles{cpuTimeP99}}`,
    d: `d1AnalyticsAdaptiveGroups(limit:2000,${filtro}){dimensions{date} sum{rowsRead rowsWritten}}`,
    o: `durableObjectsInvocationsAdaptiveGroups(limit:2000,${filtro}){dimensions{date} sum{requests}}`,
    p: `durableObjectsPeriodicGroups(limit:2000,${filtro}){dimensions{date} sum{duration rowsRead rowsWritten}}`,
  };
  const per = {};                                     // date -> values of the day
  const g = (dt) => per[dt] || (per[dt] = { req: 0, err: 0, cpu99: 0, d1r: 0, d1w: 0, dor: 0, dogbs: 0, dorr: 0, dorw: 0 });
  try {
    for (const [k, q] of Object.entries(Q)) {
      const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST",
        headers: { authorization: "Bearer " + env.CF_API_TOKEN, "content-type": "application/json" },
        body: JSON.stringify({ query: `query($a:String!){viewer{accounts(filter:{accountTag:$a}){x:${q}}}}`, variables: { a: env.CF_ACCOUNT_ID } }) });
      const j = await r.json();
      if (!r.ok || (j.errors && j.errors.length)) return { configurato: true, errore: "Cloudflare: " + ((j.errors && j.errors[0] && j.errors[0].message) || r.status) };
      for (const x of j.data.viewer.accounts[0].x) {
        const o = g(x.dimensions.date), sm = x.sum;
        if (k === "w") { o.req += sm.requests || 0; o.err += sm.errors || 0; o.cpu99 = Math.max(o.cpu99, ((x.quantiles && x.quantiles.cpuTimeP99) || 0) / 1000); }
        else if (k === "d") { o.d1r += sm.rowsRead || 0; o.d1w += sm.rowsWritten || 0; }
        else if (k === "o") o.dor += sm.requests || 0;
        else { o.dogbs += sm.duration || 0; o.dorr += sm.rowsRead || 0; o.dorw += sm.rowsWritten || 0; }
      }
    }
  } catch (e) { return { configurato: true, errore: "Cloudflare: " + (e.message || e) }; }
  // day history (queries cover only ~32 days): the days read are merged with those already saved, for the monthly summaries
  const storico = await leggiMeta(env, "consumi_giorni", {});
  Object.assign(storico, per);
  for (const k of Object.keys(storico).sort().slice(0, Math.max(0, Object.keys(storico).length - 120))) delete storico[k];
  await salvaMeta(env, "consumi_giorni", storico);
  for (const [dt, o] of Object.entries(storico)) if (!per[dt]) per[dt] = o;
  const giorni = [];
  for (let i = 0; i < 7; i++) giorni.push({ giorno: iso(new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth(), oggi.getUTCDate() - i))), ...g(iso(new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth(), oggi.getUTCDate() - i)))) });
  const L = LIMITI_CF, voci = [["req", "richieste del sito"], ["d1r", "righe lette D1"], ["d1w", "righe scritte D1"], ["dor", "richieste OCPP"], ["dogbs", "durata OCPP"], ["dorr", "righe lette OCPP"], ["dorw", "righe scritte OCPP"]];
  const mesi = {};
  for (const [dt, o] of Object.entries(per)) {
    const m = dt.slice(0, 7), t = mesi[m] || (mesi[m] = { mese: m, req: 0, err: 0, d1r: 0, d1w: 0, dor: 0, dogbs: 0, dorr: 0, dorw: 0, giorni: 0, picco: { pct: 0, voce: "", giorno: "" } });
    t.giorni++;
    for (const [k, nome] of voci) { t[k] += o[k]; const pct = o[k] / L[k] * 100; if (pct > t.picco.pct) t.picco = { pct, voce: nome, giorno: dt }; }
  }
  let spazio = { d1: null, ocpp: null };
  try {                                                // D1 storage (from Cloudflare) and Durable Object storage (measured inside the object)
    const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST",
      headers: { authorization: "Bearer " + env.CF_API_TOKEN, "content-type": "application/json" },
      body: JSON.stringify({ query: `query($a:String!){viewer{accounts(filter:{accountTag:$a}){x:d1StorageAdaptiveGroups(limit:50,filter:{date_geq:"${iso(new Date(Date.now() - 2 * 86400000))}",date_leq:"${a}"}){max{databaseSizeBytes}}}}}`, variables: { a: env.CF_ACCOUNT_ID } }) });
    const j = await r.json();
    if (j.data) spazio.d1 = Math.max(0, ...j.data.viewer.accounts[0].x.map((x) => x.max.databaseSizeBytes || 0)) || null;
  } catch (_) { /* stays null */ }
  try { spazio.ocpp = (await (await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/stato")).json()).spazio || null; } catch (_) { /* stays null */ }
  const out = { configurato: true, ts: Date.now(), limiti: LIMITI_CF, giorni, spazio, mesi: Object.values(mesi).sort((x, y) => y.mese.localeCompare(x.mese)) };
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('consumi_cache', ?)").bind(JSON.stringify(out)).run();
  return out;
}

// personal data and consents collected from invited and already active users (same checks as registration); returns { errore } or { d }
function datiProfilo(b, edizione) {
  const nomeP = nomePulito(b.nome), cognome = nomePulito(b.cognome);
  const t1 = String(b.tel1 || "").replace(/\s/g, ""), t2 = String(b.tel2 || "").replace(/\s/g, "");
  if (!nomeP || !cognome) return { errore: "Inserisci nome e cognome" };
  if (!TEL_OK.test(t1)) return { errore: "Numero di telefono non valido" };
  if (t2 && !TEL_OK.test(t2)) return { errore: "Secondo numero di telefono non valido" };
  if (b.reg !== true) return { errore: "Devi accettare il regolamento" };
  if (b.priv !== true) return { errore: "Devi confermare di aver letto l'informativa privacy" };
  const msg = b.msg === true;
  return { d: { nomeP, cognome, t1, t2, consensi: { edizione: edizione || "", regolamento: true, privacy: true, messaggi: msg, whatsapp: msg, telegram: msg, data: new Date().toISOString() } } };
}
async function cifraProfilo(env, email, d) {
  return { cognome: await cifra(env, d.cognome, email + "|cognome"), nome_proprio: await cifra(env, d.nomeP, email + "|nome_proprio"), tel1: await cifra(env, d.t1, email + "|tel1"),
    tel2: await cifra(env, d.t2 || null, email + "|tel2"), consensi: await cifra(env, JSON.stringify(d.consensi), email + "|consensi") };
}

async function registrazione(req, env) {
  let b;
  try { b = await req.json(); } catch (_) { return json({ errore: "Richiesta non valida" }, 400); }
  await preparaTabelle(env);
  if (b.hp) return json({ ok: true });                                   // honeypot field for bots: fake success
  const ip = req.headers.get("cf-connecting-ip") || "?";
  const ora = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM tentativi WHERE ts < ?").bind(ora - 600).run();
  const chiave = "reg:" + ip;
  if ((await env.DB.prepare("SELECT COUNT(*) n FROM tentativi WHERE nome=?").bind(chiave).first()).n >= 5)
    return json({ errore: "Troppe registrazioni da questo indirizzo: riprova tra 10 minuti" }, 429);
  await env.DB.prepare("INSERT INTO tentativi VALUES (?, ?)").bind(chiave, ora).run();

  if (!(await verificaTurnstile(env, b.turnstile, ip))) return json({ errore: "Verifica anti-robot non superata: riprova" }, 400);
  const email = String(b.email || "").trim().toLowerCase(), pw = String(b.password || "");
  const nomeP = nomePulito(b.nome), cognome = nomePulito(b.cognome);
  const t1 = String(b.tel1 || "").replace(/\s/g, ""), t2 = String(b.tel2 || "").replace(/\s/g, "");
  const en = b.lang === "en";
  if (!nomeP || !cognome) return json({ errore: "Inserisci nome e cognome" }, 400);
  if (!EMAIL_OK.test(email) || email.length > 120) return json({ errore: "Indirizzo email non valido" }, 400);
  if (!PW_FORTE(pw)) return json({ errore: "La password non rispetta i requisiti" }, 400);
  if (!TEL_OK.test(t1)) return json({ errore: "Numero di telefono non valido" }, 400);
  if (t2 && !TEL_OK.test(t2)) return json({ errore: "Secondo numero di telefono non valido" }, 400);
  if (b.reg !== true) return json({ errore: "Devi accettare il regolamento" }, 400);
  if (b.priv !== true) return json({ errore: "Devi confermare di aver letto l'informativa privacy" }, 400);

  // registrations never confirmed: freed after 48 hours
  await env.DB.prepare("DELETE FROM utenti WHERE verifica_hash IS NOT NULL AND verifica_exp < ?").bind(ora).run();
  const es = await env.DB.prepare("SELECT nome, verifica_hash FROM utenti WHERE nome=?").bind(email).first();
  const ok = json({ ok: true });                                         // same answer if the address is already used: nobody can find out who is registered
  if (es && !es.verifica_hash) {
    await inviaMail(env, email, `${TITOLO}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${TITOLO}</h2>` +
      `<p><b>Italiano</b> - Per questo indirizzo esiste già un account: accedi dalla pagina iniziale. Se non ricordi la password chiedi all'Amministratore di reimpostarla.</p>` +
      `<p><b>English</b> - An account already exists for this address: sign in from the home page. If you forgot the password, ask the Administrator to reset it.</p>${NOREPLY}</div>`);
    return ok;
  }
  const tok = hex(crypto.getRandomValues(new Uint8Array(32)));
  const c = await nuovaCredenziale(pw);
  const consensi = JSON.stringify({ edizione: (await leggiTesti(env)).edizione, regolamento: true, privacy: true, messaggi: b.msg === true, data: new Date().toISOString() });
  const cf = { cognome: await cifra(env, cognome, email + "|cognome"), nome_proprio: await cifra(env, nomeP, email + "|nome_proprio"), tel1: await cifra(env, t1, email + "|tel1"),
    tel2: await cifra(env, t2 || null, email + "|tel2"), consensi: await cifra(env, consensi, email + "|consensi") };
  const exp = ora + DURATA_INVITO;
  const perm = leggiPermessi({});                                         // no permissions until the Administrator links the card
  if (es) {
    await env.DB.prepare("UPDATE utenti SET salt=?, hash=?, cognome=?, nome_proprio=?, tel1=?, tel2=?, verifica_hash=?, verifica_exp=?, consensi=?, registrato_il=? WHERE nome=?")
      .bind(c.salt, c.hash, cf.cognome, cf.nome_proprio, cf.tel1, cf.tel2, await sha256(tok), exp, cf.consensi, new Date().toISOString(), email).run();
  } else {
    await env.DB.prepare("INSERT INTO utenti (nome, salt, hash, ruolo, permessi, cognome, nome_proprio, tel1, tel2, verifica_hash, verifica_exp, consensi, registrato_il) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(email, c.salt, c.hash, "utente", perm, cf.cognome, cf.nome_proprio, cf.tel1, cf.tel2, await sha256(tok), exp, cf.consensi, new Date().toISOString()).run();
  }
  const link = `${new URL(req.url).origin}/?verifica=${tok}&e=${encodeURIComponent(email)}`;
  const costo = costoTessera(await leggiConfig(env));
  const bottone = (t) => `<p><a href="${link}" style="display:inline-block;background:#0b6bcb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${t}</a></p>`;
  const mail = await inviaMail(env, email, `Conferma di registrazione / Registration confirmation - ${TITOLO}`,
    `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 16px">${TITOLO}</h2>` +
    `<p style="color:#555;margin:0 0 8px"><b>Italiano</b></p><p>Buongiorno ${esc(nomeP)},</p>` +
    `<p>abbiamo ricevuto la tua registrazione. Per completarla conferma il tuo indirizzo email dal pulsante qui sotto (il link vale 48 ore). Dopo la conferma potrai accedere al sito. Se hai già la tessera, l'Amministratore la abbinerà al tuo account e riceverai la mail di <b>Attivazione del servizio</b>; se non ce l'hai, potrai richiederla dalla pagina Assistenza${costo ? " (costo " + costo + " una tantum: ti contatteremo per consegna e pagamento)" : ""}.</p>` +
    bottone("Conferma l'indirizzo email") +
    `<hr style="border:0;border-top:1px solid #ddd;margin:20px 0"><p style="color:#555;margin:0 0 8px"><b>English</b></p><p>Hello ${esc(nomeP)},</p>` +
    `<p>we have received your registration. To complete it, confirm your email address with the button below (the link is valid for 48 hours). After confirming you can sign in. If you already have a card, the Administrator will link it to your account and you will receive the <b>Service activation</b> email; if you do not, you can request one from the Support page${costo ? " (one-off cost " + costo + ": we will contact you for delivery and payment)" : ""}.</p>` +
    bottone("Confirm email address") +
    `<p style="color:#555;font-size:13px">Se non hai chiesto tu la registrazione ignora questa mail / If you did not request this registration, ignore this email.<br>${link}</p>${NOREPLY}</div>`);
  if (mail !== "inviata") {
    await env.DB.prepare("DELETE FROM utenti WHERE nome=? AND verifica_hash IS NOT NULL").bind(email).run();
    return json({ errore: "Non sono riuscito a inviare la mail di conferma: riprova più tardi" }, 502);
  }
  return ok;
}

async function confermaEmail(url, env) {
  await preparaTabelle(env);
  const email = String(url.searchParams.get("e") || "").trim().toLowerCase(), tok = String(url.searchParams.get("verifica") || "");
  const u = await env.DB.prepare("SELECT verifica_hash, verifica_exp FROM utenti WHERE nome=?").bind(email).first();
  const valido = u && u.verifica_hash && u.verifica_exp >= Date.now() / 1000 && uguali(u.verifica_hash, await sha256(tok));
  if (valido) {
    await env.DB.prepare("UPDATE utenti SET verifica_hash=NULL, verifica_exp=NULL WHERE nome=?").bind(email).run();
    const x = await env.DB.prepare("SELECT tessera, nome_proprio, cognome, tel1, tel2 FROM utenti WHERE nome=?").bind(email).first();
    if (x) for (const c of ["nome_proprio", "cognome", "tel1", "tel2"]) x[c] = await decifra(env, x[c], email + "|" + c);
    if (x && x.tessera) await mailAttivazione(env, email, x.nome_proprio, x.tessera, url.origin);
    else if (x) {                       // notify the administrator (malfunction recipients): there is a card to link
      const m = await leggiMalf(env);
      if (!m.a.length) await notifica(env, "Nuova registrazione da attivare", `${x.nome_proprio} ${x.cognome} (${email}, ${x.tel1}): abbina la tessera in Utenti`);
      else await inviaMail(env, m.a, `Nuova registrazione da attivare - ${TITOLO}`,
        mailMalf("Nuova registrazione confermata: serve abbinare la tessera", [`Nome: ${x.nome_proprio} ${x.cognome}`, `Email: ${email}`, `Telefono: ${x.tel1}${x.tel2 ? " / " + x.tel2 : ""}`,
          "Per attivarla: apri Utenti, premi \"Attiva utenza\" sulla riga dell'utente, scegli la tessera e conferma. All'utente parte la mail \"Utenza attivata: puoi accedere al sito\"."]), m.cc);
    }
  }
  const costo = costoTessera(await leggiConfig(env));
  const msg = valido
    ? `<h2>Email confermata / Email confirmed</h2><p>Ora puoi accedere al sito. Se hai già la tessera, l'Amministratore la abbinerà al tuo account e riceverai la mail di Attivazione del servizio; altrimenti puoi richiederla dalla pagina Assistenza${costo ? " (costo " + costo + " una tantum)" : ""}.</p><p>You can now sign in. If you already have a card, the Administrator will link it to your account and you will receive the Service activation email; otherwise you can request one from the Support page${costo ? " (one-off cost " + costo + ")" : ""}.</p>`
    : `<h2>Link non valido o scaduto / Invalid or expired link</h2><p>Se la registrazione risale a più di 48 ore fa, registrati di nuovo.</p><p>If you registered more than 48 hours ago, please register again.</p>`;
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${TITOLO}</title>` +
    `<style>body{font:16px/1.5 system-ui,sans-serif;max-width:480px;margin:12vh auto;padding:0 20px;color:#14181f;background:#f6f7f9}a{color:#0b6bcb}@media(prefers-color-scheme:dark){body{background:#12151a;color:#e8ecf1}a{color:#5aa6ff}}</style></head>` +
    `<body>${msg}<p><a href="/">Vai alla pagina di accesso / Go to the sign-in page</a></p></body></html>`,
    { status: valido ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function accettaInvito(req, env) {
  const b = await req.json();
  const nome = String(b.email || "").trim().toLowerCase(), pw = String(b.password || "");
  await preparaTabelle(env);
  if (!PW_FORTE(pw)) return json({ errore: "La password non rispetta i requisiti" }, 400);
  const p = datiProfilo(b, (await leggiTesti(env)).edizione);
  if (p.errore) return json({ errore: p.errore }, 400);
  const u = await env.DB.prepare("SELECT nome, invito_hash, invito_exp FROM utenti WHERE nome=?").bind(nome).first();
  if (!u || !u.invito_hash || u.invito_exp < Date.now() / 1000 || !uguali(u.invito_hash, await sha256(String(b.token || ""))))
    return json({ errore: "Link non valido o scaduto: chiedi un nuovo invito" }, 400);
  const c = await nuovaCredenziale(pw), cf = await cifraProfilo(env, nome, p.d);
  await env.DB.prepare("UPDATE utenti SET salt=?, hash=?, invito_hash=NULL, invito_exp=NULL, cognome=?, nome_proprio=?, tel1=?, tel2=?, consensi=?, profilo_il=? WHERE nome=?")
    .bind(c.salt, c.hash, cf.cognome, cf.nome_proprio, cf.tel1, cf.tel2, cf.consensi, new Date().toISOString(), nome).run();
  const r = json({ ok: true });
  r.headers.append("set-cookie", cookie(await creaToken(env, { nome, hash: c.hash }), DURATA_SESSIONE));
  return r;
}

// ------------------------------------------------ OCPP 1.6J server
// The charger opens the connection to us; a Durable Object keeps it open (hibernating between messages).
export class Colonnina {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS eventi (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, dir TEXT, testo TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS transazioni (id INTEGER PRIMARY KEY AUTOINCREMENT, tag TEXT, connettore INTEGER, inizio INTEGER, meter_ini INTEGER, fine INTEGER, meter_fin INTEGER, motivo TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS campioni (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, tx INTEGER, dati TEXT)");
  }
  put(k, v) { this.sql.exec("INSERT OR REPLACE INTO kv VALUES (?, ?)", k, JSON.stringify(v)); }
  get(k) { const r = [...this.sql.exec("SELECT v FROM kv WHERE k=?", k)][0]; return r ? JSON.parse(r.v) : null; }
  log(dir, testo) {
    const ora = Date.now();
    this.sql.exec("INSERT INTO eventi (ts, dir, testo) VALUES (?, ?, ?)", ora, dir, String(testo).slice(0, 2000));
    this.sql.exec("DELETE FROM eventi WHERE id < (SELECT MAX(id) FROM eventi) - 300");
    if (dir !== "sys") this.put("ultimo_msg", ora);
    if (dir === "<") this.put("ultimo_in", ora);          // only messages coming from the charger (for the monitoring check)
  }
  // single alerts for monitoring (unexpected restart): the 5-minute check collects them
  rifiuto(idTag, st) {                                       // refused cards (000000 is the empty start, does not count)
    const tag = String(idTag || "").toUpperCase();
    if (st === "Accepted" || /^0+$/.test(tag)) return;
    const l = (this.get("rifiuti") || []).filter((x) => x.ts > Date.now() - 86400000); l.push({ tag, ts: Date.now(), st }); this.put("rifiuti", l.slice(-100));
  }
  malfEvento(id, dett) { const l = this.get("malf_eventi") || []; l.push({ id, ts: Date.now(), dett }); this.put("malf_eventi", l.slice(-20)); }
  sfasamento(ts) { const t = Date.parse(ts); if (t) this.put("sfasa", { ms: t - Date.now(), ts: Date.now() }); }
  async fetch(req) {
    if (req.headers.get("upgrade") !== "websocket") {
      if (req.method === "POST") {
        if (new URL(req.url).pathname === "/malf-eventi") { const l = this.get("malf_eventi") || []; this.put("malf_eventi", []); return json(l); }
        if (new URL(req.url).pathname === "/heartbeat") {        // new interval from Settings
          const b = await req.json(); this.put("hb_voluto", b.s); await this.applicaHeartbeat(); return json({ ok: true });
        }
        if (new URL(req.url).pathname === "/parametro") {        // another OCPP setting from Settings
          const b = await req.json(); this.put("par_voluti", { ...(this.get("par_voluti") || {}), [b.k]: b.v }); await this.applicaHeartbeat(); return json({ ok: true });
        }
        if (new URL(req.url).pathname === "/lista-opzione") {    // card list over OCPP: switched on/off by the admin (off by default)
          const b = await req.json(); this.put("lista_on", b.attiva === true);
          if (b.attiva !== true) { this.put("sync_pendente", false); this.put("nomi_pendenti", false); await this.state.storage.deleteAlarm(); }
          return json({ ok: true });
        }
        if (new URL(req.url).pathname === "/sync-differita") {   // card changes: wait 30 s, so several changes in a row become one send
          if (!this.get("lista_on")) return json({ ok: false });
          await this.state.storage.setAlarm(Date.now() + 30000); return json({ ok: true });
        }
        if (new URL(req.url).pathname === "/comando") { const b = await req.json(); return json(await this.inviaComando(b.azione, b.payload)); }   // admin command, waits for the answer
        if (!this.get("lista_on")) return json({ errore: "Invio della lista tessere disattivato: attivalo prima dalla scheda OCPP" }, 400);
        await this.avviaComandi(); return json({ ok: true });                                                                                          // "sync": sends config and card list again
      }
      return json(this.stato());
    }
    for (const w of this.state.getWebSockets()) { try { w.close(1012, "sostituita da una nuova connessione"); } catch (_) { /* already closed */ } }
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    const proto = (req.headers.get("sec-websocket-protocol") || "").split(",").map((x) => x.trim()).find((x) => /^ocpp1\.6$/i.test(x));
    this.log("sys", "connessione aperta" + (proto ? " (" + proto + ")" : " (nessun sottoprotocollo)"));
    return new Response(null, { status: 101, webSocket: client, headers: proto ? { "sec-websocket-protocol": proto } : {} });
  }
  async webSocketMessage(ws, msg) {
    let m;
    try { m = JSON.parse(typeof msg === "string" ? msg : new TextDecoder().decode(msg)); } catch (_) { return; }
    this.log("<", JSON.stringify(m));
    if (!Array.isArray(m)) return;
    const [tipo, id, azione, payload] = m;
    if (tipo === 3 || tipo === 4) {                          // answer to one of our commands
      if (this.attese && this.attese.has(id)) {              // admin command (OCPP tab): hand the answer to whoever is waiting
        const ris = this.attese.get(id); this.attese.delete(id);
        ris(tipo === 3 ? { ok: true, risposta: azione } : { errore: "La colonnina risponde con errore: " + azione + (payload ? " - " + String(payload).slice(0, 120) : "") });
        return;
      }
      const a = this.get("attesa");
      if (a && a.id === id) {
        this.put("attesa", null);
        if (a.azione === "SendLocalList") {                     // keep track of the outcome of the offline list send
          const l = this.get("lista") || {};
          if (tipo === 3 && azione && azione.status === "Accepted") l.inviate = (l.inviate || 0) + a.n; else l.ok = false;
          if (!(this.get("coda") || []).length && l.ok !== false) { l.ok = true; this.put("nomi_pendenti", true); this.put("nomi_pendenti_da", Date.now()); this.state.waitUntil(this.rimettiNomi()); }
          this.put("lista", l);
        }
        await this.prossimo();
      }
      return;
    }
    if (tipo !== 2) return;
    let r;
    try { r = await this.chiamata(azione, payload || {}); }
    catch (e) { this.log("sys", "errore in " + azione + ": " + (e.message || e)); ws.send(JSON.stringify([4, id, "InternalError", String(e.message || e).slice(0, 100), {}])); return; }
    const out = r === undefined ? [4, id, "NotImplemented", "", {}] : [3, id, r];
    this.log(">", JSON.stringify(out)); ws.send(JSON.stringify(out));
    if (azione === "BootNotification") await this.avviaComandi(true);   // after the start send the offline settings and the card list
    else if (azione === "Heartbeat" && this.get("nomi_pendenti")) this.state.waitUntil(this.rimettiNomi());
    if (azione === "BootNotification") { /* already handled */ }
    else await this.applicaHeartbeat();
  }
  hbVoluto() { return this.get("hb_voluto") || HEARTBEAT_S; }
  // "connection check" interval: sent at once, without waiting for a charger restart
  async applicaHeartbeat() {
    const s = this.hbVoluto();
    if ((this.get("coda") || []).length || this.get("attesa")) return;
    const cmd = [];
    if (this.get("hb") !== s) { this.put("hb", s); cmd.push({ azione: "ChangeConfiguration", payload: { key: "HeartbeatInterval", value: String(s) } }); }
    const voluti = this.get("par_voluti") || {}, inviati = { ...(this.get("par_inviati") || {}) };
    for (const k of Object.keys(voluti)) if (inviati[k] !== voluti[k]) { inviati[k] = voluti[k]; cmd.push({ azione: "ChangeConfiguration", payload: { key: k, value: String(voluti[k]) } }); }
    if (!cmd.length) return;
    this.put("par_inviati", inviati);
    this.put("coda", cmd);
    await this.prossimo();
  }
  // server commands to the charger, one at a time (the answer is awaited before the next one)
  // single admin command: sends it and waits for the answer (max 15 s)
  async inviaComando(azione, payload) {
    const ws = this.state.getWebSockets()[0];
    if (!ws) return { errore: "Colonnina non collegata al server" };
    if (azione === "Reset") this.put("reset_ts", Date.now());
    const id = "adm" + Date.now() + Math.random().toString(36).slice(2, 6);
    if (!this.attese) this.attese = new Map();
    const p = new Promise((ris) => {
      this.attese.set(id, ris);
      setTimeout(() => { if (this.attese.delete(id)) ris({ errore: "Nessuna risposta entro 15 secondi" }); }, 15000);
    });
    const out = [2, id, azione, payload || {}];
    this.log(">", JSON.stringify(out)); ws.send(JSON.stringify(out));
    return await p;
  }
  // conConfig: at the charger's start also the offline settings; in later syncs only the list.
  // With a charge in progress nothing is sent: postponed until the socket is free.
  async alarm() { await this.avviaComandi(); }

  async rimettiNomi() {
    await new Promise((r) => setTimeout(r, 5000));               // give the charger time to rewrite its list
    try {
      const n = await ripristinaNomi(this.env);
      if (n >= 0) { this.put("nomi_pendenti", false); if (n > 0) this.log("sys", `Nomi tessere rimessi sulla colonnina: ${n}`); }
      else this.log("sys", "Nomi tessere da rimettere: colonnina occupata, riprovo piu' tardi");
    } catch (e) { this.log("sys", "nomi tessere non rimessi: " + (e.message || e)); }
  }

  // The card list (SendLocalList) goes out ONLY if the admin switched the option on in the OCPP tab (off by default):
  // otherwise the server sends the charger only the settings chosen by the admin and no card list.
  async avviaComandi(conConfig = false) {
    const listaOn = !!this.get("lista_on");
    if (!conConfig && !listaOn) { this.put("sync_pendente", false); return; }
    const aperta = [...this.sql.exec("SELECT 1 FROM transazioni WHERE fine IS NULL LIMIT 1")].length > 0;
    const occupata = [...this.sql.exec("SELECT v FROM kv WHERE k LIKE 'presa_%'")].some((r) => /Charging|Suspended|Preparing|Finishing/.test(r.v));   // also a car plugged in and waiting: sending the list makes it attempt an empty start
    if (!conConfig && (aperta || occupata)) { this.put("sync_pendente", true); return; }
    this.put("sync_pendente", false);
    let tessere = [];
    if (listaOn) {
      const c = await this.env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_stato'").first();
      if (c) tessere = JSON.parse(c.valore).filter((t) => t.stato === "0" && (!t.scad || Date.parse(t.scad) > Date.now()));   // only active and not expired
      else tessere = (await this.env.DB.prepare("SELECT tag AS id, '' AS scad FROM tessere WHERE attiva<>0 ORDER BY tag LIMIT 500").all()).results;
      tessere = tessere.slice(0, 500);
    }
    const pv = this.get("par_voluti") || {};
    const v = Math.floor(Date.now() / 1000), cmd = conConfig ? [
      ...(listaOn ? [{ azione: "ChangeConfiguration", payload: { key: "LocalAuthListEnabled", value: "true" } }] : []),
      ...(pv.LocalAuthorizeOffline !== undefined ? [{ azione: "ChangeConfiguration", payload: { key: "LocalAuthorizeOffline", value: String(pv.LocalAuthorizeOffline) } }] : []),
      { azione: "ChangeConfiguration", payload: { key: "HeartbeatInterval", value: String(this.hbVoluto()) } },
      ...Object.entries(pv).filter(([k]) => k !== "LocalAuthorizeOffline").map(([k, v]) => ({ azione: "ChangeConfiguration", payload: { key: k, value: String(v) } })),
    ] : [];
    if (conConfig) { this.put("hb", this.hbVoluto()); this.put("par_inviati", { ...pv }); }
    if (listaOn) {
      for (let i = 0; i < Math.max(1, Math.ceil(tessere.length / 10)); i++) {   // max 10 cards per send (SendLocalListMaxLength): first Full, then Differential
        cmd.push({ azione: "SendLocalList", payload: { listVersion: v + i, updateType: i === 0 ? "Full" : "Differential",
          localAuthorizationList: tessere.slice(i * 10, i * 10 + 10).map((t) => ({ idTag: t.id, idTagInfo: t.scad ? { status: "Accepted", expiryDate: new Date(t.scad).toISOString() } : { status: "Accepted" } })) } });
      }
      this.put("lista", { quando: Date.now(), n: tessere.length, inviate: 0, ok: null });
    }
    this.put("coda", cmd);
    this.put("attesa", null);
    await this.prossimo();
  }
  async prossimo() {
    const ws = this.state.getWebSockets()[0]; if (!ws) return;
    const a = this.get("attesa");
    if (a && Date.now() - a.ts < 60000) return;
    const coda = this.get("coda") || [];
    const n = coda.shift(); this.put("coda", coda);
    if (!n) { this.put("attesa", null); return; }
    const id = "srv" + Date.now() + "x" + coda.length;
    this.put("attesa", { id, ts: Date.now(), azione: n.azione, n: n.azione === "SendLocalList" ? n.payload.localAuthorizationList.length : 0 });
    const out = [2, id, n.azione, n.payload];
    this.log(">", JSON.stringify(out)); ws.send(JSON.stringify(out));
  }
  webSocketClose(ws, code, reason) { const cd = (this.get("cadute") || []).filter((t) => t > Date.now() - 86400000); cd.push(Date.now()); this.put("cadute", cd.slice(-50)); try { ws.close(code, reason); } catch (_) { /* already closed */ } this.log("sys", "connessione chiusa (" + code + ")"); }
  webSocketError(ws, e) { this.log("sys", "errore connessione: " + (e && e.message || e)); }

  async tagOk(idTag) {
    const tag = String(idTag || "").toUpperCase();
    const c = await this.env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_stato'").first();
    if (c) {                                                 // state read from the charger: honours block and expiry
      const x = JSON.parse(c.valore).find((t) => t.id === tag);
      if (!x) return "Invalid";
      if (x.stato === "1") return "Blocked";
      if (x.stato === "2") return "Expired";
      if (x.stato !== "0") return "Invalid";
      if (x.scad && Date.parse(x.scad) <= Date.now()) return "Expired";
      return "Accepted";
    }
    const r = await this.env.DB.prepare("SELECT * FROM tessere WHERE tag=?").bind(tag).first();   // no known state: site db
    return r && r.attiva !== 0 ? "Accepted" : "Invalid";
  }
  async chiamata(azione, p) {
    const adesso = new Date().toISOString();
    switch (azione) {
      case "BootNotification": {
        const rt = this.get("reset_ts");
        if (!(rt && Date.now() - rt < 600000)) this.malfEvento("riavvio", "La colonnina si e' riavviata senza una richiesta dal sito" + (p.firmwareVersion ? " (firmware " + p.firmwareVersion + ")" : ""));
        this.put("boot", { ...p, ts: adesso }); return { status: "Accepted", currentTime: adesso, interval: this.hbVoluto() };
      }
      case "Heartbeat": return { currentTime: adesso };
      case "StatusNotification":
        this.put("presa_" + (p.connectorId || 0), { status: p.status, errore: p.errorCode, ts: p.timestamp || adesso });
        // socket free or finishing: a charge left "open" (e.g. started offline) is considered finished
        if (p.status === "Available" || p.status === "Finishing") this.sql.exec("UPDATE transazioni SET fine=? WHERE fine IS NULL", Date.parse(p.timestamp) || Date.now());
        if (p.status === "Available" && this.get("sync_pendente")) this.state.waitUntil(this.avviaComandi());
        else if (p.status === "Available" && this.get("nomi_pendenti")) this.state.waitUntil(this.rimettiNomi());   // sync postponed during the charge
        return {};
      case "Authorize": { const st = await this.tagOk(p.idTag); this.rifiuto(p.idTag, st); return { idTagInfo: { status: st } }; }
      case "StartTransaction": {
        const st = await this.tagOk(p.idTag); this.rifiuto(p.idTag, st);
        this.sql.exec("UPDATE transazioni SET fine=? WHERE fine IS NULL", Date.parse(p.timestamp) || Date.now());   // a new charge closes any left open
        const r = [...this.sql.exec("INSERT INTO transazioni (tag, connettore, inizio, meter_ini) VALUES (?, ?, ?, ?) RETURNING id",
          String(p.idTag || "").toUpperCase(), p.connectorId || 1, Date.parse(p.timestamp) || Date.now(), p.meterStart ?? null)][0];
        return { transactionId: r.id, idTagInfo: { status: st } };
      }
      case "StopTransaction":
      {
        const ts = Date.parse(p.timestamp) || Date.now();
        let id = p.transactionId;
        if (![...this.sql.exec("SELECT 1 FROM transazioni WHERE id=?", id)].length) {   // charge started offline: the charger did not know the id yet (sends 0)
          const r = [...this.sql.exec("SELECT id FROM transazioni WHERE meter_fin IS NULL AND inizio<=? ORDER BY id DESC LIMIT 1", ts)][0];
          id = r ? r.id : null;
        }
        if (id !== null) this.sql.exec("UPDATE transazioni SET fine=?, meter_fin=?, motivo=? WHERE id=?", ts, p.meterStop ?? null, p.reason || null, id);
      }
        return { idTagInfo: { status: "Accepted" } };
      case "MeterValues": {
        for (const mv of p.meterValue || []) {
          const dati = {};
          for (const sv of mv.sampledValue || []) {
            const nome = (sv.measurand || "Energy.Active.Import.Register") + (sv.phase ? "." + sv.phase : "");
            dati[nome] = { v: sv.value, u: sv.unit || "" };
          }
          const ts = Date.parse(mv.timestamp) || Date.now(); this.sfasamento(mv.timestamp);
          this.sql.exec("INSERT INTO campioni (ts, tx, dati) VALUES (?, ?, ?)", ts, p.transactionId ?? null, JSON.stringify(dati));
          this.put("meter", { ts, tx: p.transactionId ?? null, dati });
        }
        this.sql.exec("DELETE FROM campioni WHERE id < (SELECT MAX(id) FROM campioni) - 5000");
        return {};
      }
      case "DiagnosticsStatusNotification": case "FirmwareStatusNotification": return {};
      case "DataTransfer": return { status: "UnknownVendorId" };
      default: return undefined;
    }
  }
  // readable rows instead of raw messages: the server's answers (->) are not shown, except errors
  eventiBrevi() {
    const out = [];
    const righe = [...this.sql.exec("SELECT ts, dir, testo FROM eventi ORDER BY id DESC LIMIT 120")];
    const cmdDi = {};                                        // command id -> name, to say what the charger is answering
    for (const r of righe) { const k = /^\[2,"([^"]+)","([A-Za-z]+)"/.exec(r.testo); if (r.dir === ">" && k) cmdDi[k[1]] = k[2]; }
    const NOMI_CMD = { Reset: "riavvio", GetConfiguration: "lettura configurazione", ChangeConfiguration: "modifica impostazione", SendLocalList: "invio lista tessere",
      GetLocalListVersion: "versione lista tessere", TriggerMessage: "richiesta messaggio", RemoteStopTransaction: "stop ricarica da remoto" };
    const ESITI = { Accepted: "accettato", Rejected: "rifiutato", NotSupported: "non supportato", RebootRequired: "accettato, vale dopo il riavvio",
      Failed: "non riuscito", VersionMismatch: "versione lista non valida", NotImplemented: "non previsto" };
    const esito = (p, testo) => {
      if (p && p.configurationKey) return `configurazione letta (${p.configurationKey.length} parametri)`;
      if (!p && /configurationKey/.test(testo)) return "configurazione letta";
      if (p && p.status) return ESITI[p.status] || p.status;
      if (p && p.listVersion !== undefined) return "versione lista " + p.listVersion;
      if (p && !Object.keys(p).length) return "ok";
      return JSON.stringify(p || {}).slice(0, 100);
    };
    for (const r of righe) {
      if (out.length >= 25) break;
      let t = r.testo;
      let m; try { m = JSON.parse(r.testo); } catch (_) { m = null; }
      if (r.dir === "<") {
        const id3 = /^\[3,"([^"]+)"/.exec(r.testo);
        if ((m && m[0] === 3) || (!m && id3)) {
          const c = cmdDi[m ? m[1] : id3[1]];
          t = "Risposta della colonnina" + (c ? " a " + (NOMI_CMD[c] || c) : "") + ": " + esito(m ? m[2] : null, r.testo);
        }
        else if (m && m[0] === 4) t = "Errore dalla colonnina: " + String(m[2] || "") + " " + String(m[3] || "").slice(0, 80);
        else t = m ? this.sintesi(m[2], m[3] || {}) : r.testo.slice(0, 120);
      } else if (r.dir === ">") {
        if (m && m[0] === 2) t = "Comando alla colonnina: " + (NOMI_CMD[m[2]] || m[2]) + (m[2] === "ChangeConfiguration" ? " " + m[3].key + "=" + m[3].value : m[2] === "SendLocalList" ? " (" + m[3].localAuthorizationList.length + " tessere)" : "");
        else if (!r.testo.startsWith('[4,')) continue;
        else t = "Errore inviato alla colonnina: " + r.testo.slice(0, 120);
      }
      out.push({ ts: r.ts, dir: r.dir, testo: t, raw: r.testo.slice(0, 600) });
    }
    return out;
  }
  sintesi(a, p) {
    const kwh = (wh) => (parseFloat(wh) / 1000).toFixed(2) + " kWh";
    switch (a) {
      case "BootNotification": return `Avvio colonnina (${p.chargePointModel || "?"}, firmware ${p.firmwareVersion || "?"})`;
      case "Heartbeat": return "Conferma collegamento";
      case "StatusNotification": return `Presa ${p.connectorId}: ${p.status}` + (p.errorCode && p.errorCode !== "NoError" ? ` (errore ${p.errorCode})` : "");
      case "Authorize": return `Richiesta di autorizzazione, tessera ${String(p.idTag || "").toUpperCase()}`;
      case "StartTransaction": return `Inizio ricarica, tessera ${String(p.idTag || "").toUpperCase()}, contatore ${kwh(p.meterStart)}`;
      case "StopTransaction": return `Fine ricarica${p.reason ? " (" + p.reason + ")" : ""}, contatore ${kwh(p.meterStop)}`;
      case "MeterValues": {
        const v = {};
        for (const sv of ((p.meterValue || [])[0] || {}).sampledValue || []) v[(sv.measurand || "Energy.Active.Import.Register")] = sv;
        const x = [];
        if (v["Power.Active.Import"]) x.push((parseFloat(v["Power.Active.Import"].value) / (/^k/i.test(v["Power.Active.Import"].unit || "") ? 1 : 1000)).toFixed(2) + " kW");
        if (v["Current.Import"]) x.push(parseFloat(v["Current.Import"].value).toFixed(1) + " A");
        if (v["Energy.Active.Import.Register"]) x.push("contatore " + kwh(v["Energy.Active.Import.Register"].value));
        return "Misura: " + (x.join(", ") || "-");
      }
      default: return a;
    }
  }
  stato() {
    const aperta = [...this.sql.exec("SELECT * FROM transazioni WHERE fine IS NULL ORDER BY id DESC LIMIT 1")][0] || null;
    const prese = {};
    for (const r of this.sql.exec("SELECT k, v FROM kv WHERE k LIKE 'presa_%'")) prese[r.k.slice(6)] = JSON.parse(r.v);
    const ultima = [...this.sql.exec("SELECT id, tag, inizio, fine, meter_ini, meter_fin FROM transazioni ORDER BY id DESC LIMIT 1")][0] || null;
    return {
      connessa: this.state.getWebSockets().length > 0, ultimo_msg: this.get("ultimo_msg"), ultimo_in: this.get("ultimo_in"), ultima_tx: ultima, cadute: this.get("cadute") || [], rifiuti: this.get("rifiuti") || [], sfasa: this.get("sfasa") || null, nomi_pendenti: !!this.get("nomi_pendenti"), nomi_pendenti_da: this.get("nomi_pendenti_da") || null, boot: this.get("boot"), prese,
      meter: this.get("meter"), transazione_aperta: aperta, lista: this.get("lista"), lista_on: !!this.get("lista_on"), sync_pendente: !!this.get("sync_pendente"),
      heartbeat: { voluto: this.hbVoluto(), inviato: this.get("hb") || null },
      parametri: { def: PARAMETRI, voluti: this.get("par_voluti") || {}, inviati: this.get("par_inviati") || {} },
      eventi: this.eventiBrevi(),
      spazio: this.sql.databaseSize,                                  // bytes used by the Durable Object database
    };
  }
}

// -------------------------------------------------------------- first run
async function setupAperto(env) {              // true until an administrator exists (and APP_PASSWORD is not used)
  await preparaTabelle(env);
  if (env.APP_PASSWORD) return false;
  return (await env.DB.prepare("SELECT COUNT(*) n FROM utenti WHERE ruolo='admin'").first()).n === 0;
}
const codiceSbagliato = (env, b) =>
  env.SETUP_CODE && !uguali(String(b.code || ""), String(env.SETUP_CODE)) ? json({ errore: "Codice di configurazione errato" }, 403) : null;

async function eseguiSetup(req, env, cfg) {
  const b = await req.json();
  const no = codiceSbagliato(env, b);
  if (no) return no;
  const nome = String(b.nome || "").trim().toLowerCase();
  if (!/^\S{1,64}$/.test(nome)) return json({ errore: "Nome utente non valido" }, 400);
  const pw = String(b.password_admin || "");
  if (!PW_FORTE(pw)) return json({ errore: "La password non rispetta i requisiti" }, 400);
  const nuova = pulisciConfig(b, cfg);
  const c = await nuovaCredenziale(pw);
  // atomic: inserts only if there is still no administrator
  const r = await env.DB.prepare("INSERT INTO utenti (nome, salt, hash, ruolo) SELECT ?, ?, ?, 'admin' WHERE NOT EXISTS (SELECT 1 FROM utenti WHERE ruolo='admin')")
    .bind(nome, c.salt, c.hash).run();
  if (!r.meta.changes) return json({ errore: "Configurazione gia' completata" }, 409);
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('config', ?)").bind(JSON.stringify(nuova)).run();
  const out = json({ ok: true });
  out.headers.append("set-cookie", cookie(await creaToken(env, { nome, hash: c.hash }), DURATA_SESSIONE));
  return out;
}

async function tokenOcpp(env, rigenera = false) {
  let r = rigenera ? null : await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ocpp_token'").first();
  if (!r) {
    const v = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
    await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ocpp_token', ?)").bind(v).run();
    return v;
  }
  return r.valore;
}
async function ocppConnessione(req, env, url) {
  const [, , token, sigla] = url.pathname.split("/");
  if (req.headers.get("upgrade") !== "websocket") return new Response("Upgrade Required", { status: 426 });
  if (!sigla || !/^[A-Za-z0-9._-]{1,40}$/.test(sigla) || !uguali(token || "", await tokenOcpp(env))) {
    try {                                                   // for monitoring: count connections with a wrong token (at most one write every 5 seconds)
      const l = await leggiMeta(env, "ocpp_rifiuti", []), ora = Date.now();
      if (!l.length || ora - l[l.length - 1] > 5000) { l.push(ora); await salvaMeta(env, "ocpp_rifiuti", l.filter((t) => t > ora - 86400000).slice(-100)); }
    } catch (_) { /* optional */ }
    return new Response("Not found", { status: 404 });
  }
  return await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch(req);
}

export default {
  // Forces https (except in local development) and asks browsers to always use https (HSTS)
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.protocol === "http:" && !u.pathname.startsWith("/ocpp/") && u.hostname !== "localhost" && u.hostname !== "127.0.0.1" && u.hostname !== "[::1]") {
      u.protocol = "https:";
      return Response.redirect(u.toString(), 301);
    }
    const r = await this.gestisci(req, env, ctx);
    let out = new Response(r.body, r);
    // Content Security Policy: scripts run only if they carry the nonce generated for this response (no injected scripts),
    // connections stay towards the site itself; Turnstile (anti-bot check) is the only external service allowed.
    const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
    if ((out.headers.get("content-type") || "").startsWith("text/html")) {
      const html = (await out.text()).replace(/<(script|style)(?=[\s>])/g, `<$1 nonce="${nonce}"`);
      out = new Response(html, { status: out.status, headers: out.headers });
    }
    const TS = "https://challenges.cloudflare.com";
    out.headers.set("content-security-policy", `default-src 'self'; script-src 'nonce-${nonce}' ${TS}; style-src 'unsafe-inline'; style-src-elem 'nonce-${nonce}'; style-src-attr 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${TS}; frame-src ${TS}; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'`);
    if (u.protocol === "https:") out.headers.set("strict-transport-security", "max-age=31536000");
    out.headers.set("x-frame-options", "DENY");                       // never inside someone else's iframe
    out.headers.set("x-content-type-options", "nosniff");
    out.headers.set("referrer-policy", "no-referrer");               // the invitation link never leaks through Referer
    return out;
  },

  async gestisci(req, env, ctx) {
    const url = new URL(req.url);
    const q = url.searchParams;
    try {
      if (url.pathname.startsWith("/ocpp/")) return await ocppConnessione(req, env, url);
      const cfg = await leggiConfig(env);            // also sets TITOLO, TZ and VALUTA for this request
      if (await setupAperto(env)) {                  // first run: no administrator created yet
        const html = (h) => new Response(pagina(h), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
        if (url.pathname === "/" && req.method === "GET") return html(P_SETUP);
        if (url.pathname === "/api/setup" && req.method === "GET") return json({ code_required: !!env.SETUP_CODE });
        if (url.pathname === "/api/setup" && req.method === "POST") return await eseguiSetup(req, env, cfg);
        if (url.pathname === "/api/setup/test" && req.method === "POST") {
          const b = await req.json();
          return codiceSbagliato(env, b) || json(await provaColonnina(pulisciConfig(b, cfg)));
        }
        return json({ errore: "Configurazione iniziale non completata: apri la pagina principale" }, 403);
      }
      if (url.pathname === "/api/setup" && req.method === "GET") return json({ done: true });
      if (url.pathname === "/api/testi" && req.method === "GET") {       // rules and privacy notice (needed before sign-in too)
        const t = await leggiTesti(env);
        return json({ ...t, titolo: TITOLO, costo: costoTessera(cfg), contatto: cfg.contact });
      }
      if (url.pathname === "/api/login" && req.method === "POST") return await login(req, env);
      if (url.pathname === "/api/invito" && req.method === "POST") return await accettaInvito(req, env);
      if (url.pathname === "/api/registrazione" && req.method === "POST") return await registrazione(req, env);
      if (url.pathname === "/" && req.method === "GET" && q.get("verifica")) return await confermaEmail(url, env);
      if (url.pathname === "/" && req.method === "GET" && q.get("invito"))
        return new Response(pagina(P_INVITO), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      const me = await utenteCorrente(req, env);
      if (!me) {
        if (url.pathname === "/" && req.method === "GET")
          return new Response(pagina(paginaLogin(env)), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
        return json({ errore: "login" }, 401);
      }
      if (url.pathname === "/" && req.method === "GET" && q.get("completa"))
        return new Response(pagina(P_INVITO), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      if (me.ruolo !== "admin" && url.pathname.startsWith("/api/") && !["/api/me", "/api/profilo", "/api/logout", "/api/ingest"].includes(url.pathname)) {
        const pr = await env.DB.prepare("SELECT registrato_il, profilo_il FROM utenti WHERE nome=?").bind(me.nome).first();   // profile to complete: no data until it is filled in
        if (pr && !pr.registrato_il && !pr.profilo_il) return json({ errore: "Completa il profilo per continuare", completa: true }, 403);
      }
      const P = me.perm, ris = P.app;               // sessions without a card: only with the "app" permission (the admin has it)
      const nega = () => json({ errore: "non hai il permesso per questa operazione" }, 403);
      if (url.pathname === "/api/logout" && req.method === "POST") {
        // the session is cancelled on the server too, not just by deleting the cookie
        const ck = /(?:^|;\s*)sess=([^;]+)/.exec(req.headers.get("cookie") || "");
        let val = "";
        try { val = ck ? decodeURIComponent(ck[1]) : ""; } catch (_) { /* malformed cookie */ }
        const pp = (/^(.+)~(\d+)~([0-9a-f]{16})~([0-9a-f]{64})$/.exec(val) || []).slice(1);
        const adesso = Math.floor(Date.now() / 1000);
        await env.DB.prepare("DELETE FROM revocati WHERE exp < ?").bind(adesso).run();
        if (pp.length === 4) await env.DB.prepare("INSERT OR REPLACE INTO revocati (sig, exp) VALUES (?, ?)").bind(pp[3], +pp[1]).run();
        const r = json({ ok: true });
        r.headers.append("set-cookie", cookie("", 0) + "; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
        r.headers.set("clear-site-data", '"cookies"');
        r.headers.set("cache-control", "no-store");
        return r;
      }
      if (url.pathname === "/api/profilo") {                // profile and consents of the self-registered user
        const r = await env.DB.prepare("SELECT nome, nome_proprio, cognome, tel1, tel2, consensi, registrato_il, profilo_il FROM utenti WHERE nome=?").bind(me.nome).first();
        if (r && !r.registrato_il && !r.profilo_il && me.ruolo !== "admin" && req.method === "POST") {   // user active before the data collection: mandatory "Complete your profile" screen
          const b = await req.json();
          const p = datiProfilo(b, (await leggiTesti(env)).edizione);
          if (p.errore) return json({ errore: p.errore }, 400);
          const cf = await cifraProfilo(env, r.nome, p.d);
          await env.DB.prepare("UPDATE utenti SET cognome=?, nome_proprio=?, tel1=?, tel2=?, consensi=?, profilo_il=? WHERE nome=?")
            .bind(cf.cognome, cf.nome_proprio, cf.tel1, cf.tel2, cf.consensi, new Date().toISOString(), r.nome).run();
          return json({ ok: true });
        }
        if (!r || (!r.registrato_il && !r.profilo_il)) return json({ registrato: false });
        let c = {}; try { c = JSON.parse((await decifra(env, r.consensi, r.nome + "|consensi")) || "{}"); } catch (_) { /* empty */ }
        if (req.method === "POST") {
          const b = await req.json();
          const wa = b.whatsapp === true, tg = b.telegram === true;
          const storico = Array.isArray(c.storico) ? c.storico : [];
          storico.push({ data: new Date().toISOString(), whatsapp: wa, telegram: tg });
          c = { ...c, whatsapp: wa, telegram: tg, messaggi: wa || tg, storico: storico.slice(-20) };
          await env.DB.prepare("UPDATE utenti SET consensi=? WHERE nome=?").bind(await cifra(env, JSON.stringify(c), r.nome + "|consensi"), r.nome).run();
        }
        const d = {}; for (const k of ["nome_proprio", "cognome", "tel1", "tel2"]) d[k] = await decifra(env, r[k], r.nome + "|" + k);
        const ult = (c.storico || []).slice(-1)[0];
        return json({ registrato: true, email: r.nome, nome: d.nome_proprio, cognome: d.cognome, tel1: d.tel1, tel2: d.tel2,
          whatsapp: c.whatsapp !== undefined ? !!c.whatsapp : !!c.messaggi, telegram: c.telegram !== undefined ? !!c.telegram : !!c.messaggi,
          aggiornato: ult ? ult.data : c.data || null, edizione: c.edizione || null });
      }
      if (url.pathname === "/api/me") {
        const reg = await env.DB.prepare("SELECT registrato_il, profilo_il FROM utenti WHERE nome=?").bind(me.nome).first();
        const t = me.tessera ? await env.DB.prepare("SELECT tag, nome FROM tessere WHERE tag=?").bind(me.tessera).first() : null;
        const an = await env.DB.prepare("SELECT nome_proprio, cognome FROM utenti WHERE nome=?").bind(me.nome).first();
        const nomeCompleto = an ? (((await decifra(env, an.nome_proprio, me.nome + "|nome_proprio")) || "") + " " + ((await decifra(env, an.cognome, me.nome + "|cognome")) || "")).trim() : "";
        return json({ nome: me.nome, nome_completo: nomeCompleto, ruolo: me.ruolo, perm: P, senzaTessera: !!(reg && reg.registrato_il) && me.ruolo !== "admin" && !(me.tessere || []).length, registrato: !!(reg && (reg.registrato_il || reg.profilo_il)), completa: !!(reg && !reg.registrato_il && !reg.profilo_il && me.ruolo !== "admin"), titolo: TITOLO, valuta: VALUTA, tz: TZ, tax_label: cfg.tax_label, costo_tessera: costoTessera(cfg), contatto: cfg.contact, tessera: t || (me.tessera ? { tag: me.tessera, nome: "" } : null),
          tessere: await Promise.all((me.tessere || []).map(async (tag) => ({ tag, nome: ((await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tag).first()) || {}).nome || "" }))) });
      }
      if (url.pathname === "/api/pagamento") {         // where to pay for the card: the admin's PayPal, Satispay, Revolut accounts (cash always available)
        if (req.method === "POST") {
          if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
          const bp = await req.json(), out = {};
          for (const k of ["paypal", "satispay", "revolut"]) {
            const v = String(bp[k] || "").trim();
            if (!v) continue;
            if (!/^[A-Za-z0-9._@-]{1,60}$/.test(v) && !/^https:\/\/[^\s"'<>]{4,200}$/.test(v)) return json({ errore: "Nome account non valido (solo lettere, numeri, punto, trattino) oppure un link https" }, 400);
            out[k] = v;
          }
          await salvaMeta(env, "pagamento_tessera", out);
          return json({ ok: true });
        }
        const pg = await leggiMeta(env, "pagamento_tessera", {});
        return json({ paypal: pg.paypal || "", satispay: pg.satispay || "", revolut: pg.revolut || "" });
      }
      if (url.pathname === "/api/ticket") return await ticket(req, env, me, url);
      if (url.pathname === "/api/cifratura") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        return json(await statoCifratura(env));
      }
      if (url.pathname === "/api/config") {             // installation settings (admin only)
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "POST") {
          const nuova = pulisciConfig(await req.json(), cfg);
          await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('config', ?)").bind(JSON.stringify(nuova)).run();
          await leggiConfig(env);
          return json({ ok: true, config: configPubblica(nuova) });
        }
        return json({ config: configPubblica(cfg), defaults: configPubblica(CFG_DEFAULTS), fonti: { url_env: !!env.CHARGER_URL, title_env: !!env.SITE_TITLE, mail_env: !!env.RESEND_API_KEY } });
      }
      if (url.pathname === "/api/colonnina-info") {     // public IP the charger answered from at the last download
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        return json({ ultimo_ip: await leggiMeta(env, "ultimo_ip", null) });
      }
      if (url.pathname === "/api/config/test" && req.method === "POST") {   // connection test with the values in the form (does not save)
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        return json(await provaColonnina(pulisciConfig(await req.json(), cfg)));
      }
      if (url.pathname === "/api/testi" && req.method === "POST") {       // rules and privacy notice (admin only)
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        const b = await req.json(), t = { ...TESTI_VUOTI };
        for (const k of Object.keys(TESTI_VUOTI)) t[k] = String(b[k] || "").trim().slice(0, k === "edizione" ? 40 : 60000);
        await salvaMeta(env, "testi_legali", t);
        return json({ ok: true });
      }
      if (url.pathname === "/api/utenti") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "GET") {
          try { await migraCifratura(env); } catch (_) { /* retry at the next run */ }
          const righe = (await env.DB.prepare(
            "SELECT u.nome, u.ruolo, u.permessi, u.hash, u.invito_exp, u.tessera, u.cognome, u.nome_proprio, u.tel1, u.tel2, u.verifica_hash, u.verifica_exp, u.consensi, u.registrato_il, u.profilo_il, u.tessere_altre, t.nome AS tessera_nome " +
            "FROM utenti u LEFT JOIN tessere t ON t.tag = u.tessera ORDER BY u.ruolo, u.nome").all()).results;
          const nomiTess = Object.fromEntries((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((x) => [x.tag, x.nome]));
          const lista = [];
          for (const u of righe) {
            let an = null;
            if (u.registrato_il || u.profilo_il) {
              const d = {}; for (const c of CAMPI_CIFRATI) d[c] = await decifra(env, u[c], u.nome + "|" + c);
              let msg = false; try { const cc = JSON.parse(d.consensi || "{}"); msg = !!(cc.whatsapp || cc.telegram || (cc.whatsapp === undefined && cc.messaggi)); } catch (_) { /* unreadable */ }
              an = { nome: d.nome_proprio, cognome: d.cognome, tel1: d.tel1, tel2: d.tel2, data: u.registrato_il || u.profilo_il, messaggi: msg, da_confermare: !!u.verifica_hash };
            }
            lista.push({ nome: u.nome, ruolo: u.ruolo, perm: permessiDi(u), attivo: !!u.hash && !u.verifica_hash && !(u.registrato_il && !u.tessera), in_attesa_tessera: !!u.registrato_il && !u.tessera && !u.verifica_hash,
              tessera: u.tessera, tessera_nome: u.tessera_nome, tessere_altre: tessereDi({ tessere_altre: u.tessere_altre }).map((tag) => ({ tag, nome: nomiTess[tag] || "" })), anagrafica: an, invito_scaduto: !u.hash && u.invito_exp < Date.now() / 1000 });
          }
          return json(lista);
        }
        if (req.method === "POST") return await gestisciUtenti(env, me, await req.json(), url.origin);
      }
      if (url.pathname === "/api/backup") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_backup', ?)").bind(new Date().toISOString()).run();
        const q1 = (v) => v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
        const tabelle = ["sessioni", "tessere", "prezzi", "meta", "utenti", "ticket"];
        let out = "-- Backup " + TITOLO + " - " + new Date().toISOString() + "\n-- Ripristino / restore: npx wrangler d1 execute ricariche --remote --file=<questo file>\n-- Contiene impostazioni e segreti salvati (password colonnina, chiave Resend): tienilo privato.\n";
        for (const t of tabelle) {
          const def = await env.DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").bind(t).first();
          if (!def) continue;
          out += def.sql.replace(/^CREATE TABLE\s+(IF NOT EXISTS\s+)?/i, "CREATE TABLE IF NOT EXISTS ") + ";\n";
          const rows = (await env.DB.prepare("SELECT * FROM " + t).all()).results;
          for (const r of rows) {
            if (t === "meta" && r.chiave === "chiave_sessioni") continue;   // regenerates by itself
            const cols = Object.keys(r);
            out += "INSERT OR REPLACE INTO " + t + " (" + cols.join(", ") + ") VALUES (" + cols.map((c) => q1(r[c])).join(", ") + ");\n";
          }
        }
        const d = new Date().toISOString().slice(0, 10);
        return new Response(out, { headers: { "content-type": "application/sql; charset=utf-8", "cache-control": "no-store",
          "content-disposition": `attachment; filename="ricariche_${d}.sql"` } });
      }
      if (url.pathname === "/api/destinatari") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "GET") return json(await leggiDestinatari(env));
        if (req.method === "POST") {
          const b = await req.json();
          const a = listaEmail(b.a), cc = listaEmail(b.cc);
          if (!a.length) return json({ errore: "Inserisci almeno un destinatario" }, 400);
          if (![...a, ...cc].every((x) => EMAIL_OK.test(x))) return json({ errore: "Indirizzo email non valido" }, 400);
          await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('destinatari_report', ?)").bind(JSON.stringify({ a, cc })).run();
          return json({ ok: true, a, cc });
        }
      }
      if (url.pathname === "/api/notifiche") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "POST") { const l = await leggiMeta(env, "notifiche", []); l.forEach((x) => { x.letta = true; }); await salvaMeta(env, "notifiche", l); }
        const l = await leggiMeta(env, "notifiche", []);
        for (const x of l) x.dett = await decifra(env, x.dett, "notifica|dett");
        return json({ notifiche: l, nonLette: l.filter((x) => !x.letta).length });
      }
      if (url.pathname === "/api/consumi") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        return json(await consumiCloudflare(env));
      }
      if (url.pathname === "/api/malfunzionamenti") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "POST") {
          const b = await req.json();
          if (b.azione === "prova") {
            const c = await leggiMalf(env);
            if (!c.a.length) return json({ errore: "Inserisci almeno un destinatario" }, 400);
            const m = await inviaMail(env, c.a, `Prova avvisi - ${TITOLO}`, mailMalf("Prova avvisi", ["Questa è una mail di prova: gli avvisi arriveranno a questi destinatari.", "This is a test message."]), c.cc);
            return json({ ok: m === "inviata", mail: m, errore: m === "inviata" ? undefined : "Mail non inviata: " + m });
          }
          if (b.azione === "avvisi") {
            const at = Math.round(Number(b.attesa)), so = Math.round(Number(b.sollecito));
            if (!(at >= 0 && at <= 240)) return json({ errore: "Attesa non valida: da 0 a 240 minuti" }, 400);
            if (!(so === 0 || (so >= 5 && so <= 1440))) return json({ errore: "Secondo avviso non valido: 0 (nessuno) oppure da 5 a 1440 minuti" }, 400);
            await salvaMeta(env, "avvisi_utenti_cfg", { on: !!b.on, attesa: at, sollecito: so });
            return json({ ok: true, avvisi: await leggiAvvisi(env) });
          }
          const a = listaEmail(b.a), cc = listaEmail(b.cc);
          if (![...a, ...cc].every((x) => EMAIL_OK.test(x))) return json({ errore: "Indirizzo email non valido" }, 400);
          const regole = {};
          for (const [id, d] of Object.entries(MALF)) {
            const x = (b.regole || {})[id] || {};
            const mail = !!x.mail, not = !!x.not;
            if (d.tipo === "evento") { regole[id] = { on: mail || not, mail, not, min: 0 }; continue; }
            const min = Math.round(Number(x.valore) * d.um);
            if (!(min >= d.min && min <= d.max)) return json({ errore: `${d.label}: valore da ${d.min / d.um} a ${d.max / d.um} ${d.unita}` }, 400);
            regole[id] = { on: mail || not, mail, not, min };
          }
          await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('malfunzionamenti', ?)").bind(JSON.stringify({ a, cc, regole })).run();
        }
        const c = await leggiMalf(env), stato = await leggiMeta(env, "malfunzionamenti_stato", {}), storico = await leggiMeta(env, "malfunzionamenti_storico", []);
        delete stato._ext;
        return json({ a: c.a, cc: c.cc, stato, avvisi: await leggiAvvisi(env), ultimo: await leggiMeta(env, "monitor_ultimo", null),
          regole: Object.entries(MALF).map(([id, d]) => ({ id, g: d.g, label: d.label, tipo: d.tipo, on: c.regole[id].on, mail: c.regole[id].mail, not: c.regole[id].not, unita: d.unita || "", valore: d.tipo === "evento" ? null : c.regole[id].min / d.um, da: d.tipo === "evento" ? null : d.min / d.um, a: d.tipo === "evento" ? null : d.max / d.um })),
          storico: storico.slice(0, 40).map((x) => ({ ...x, label: MALF[x.id] ? MALF[x.id].label : x.id })) });
      }
      if (url.pathname === "/api/live") {                  // charge in progress: everyone sees "busy by whom", details only admin, whoever has the permission and whoever is charging with their own card
        const live = await (await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/stato")).json();
        const tx = live.transazione_aperta, pr = live.prese && live.prese["1"];
        const out = { connessa: live.connessa, stato: pr ? pr.status : null, occupata: !!tx || !!(pr && /Charging|Suspended/.test(pr.status)) };
        if (tx) {
          const t = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tx.tag).first();
          out.da = t ? t.nome : "";
          if (me.ruolo === "admin" || P.live || (me.tessere || []).includes(tx.tag)) {
            const m = live.meter && live.meter.tx === tx.id ? live.meter : null, d = m ? m.dati : {};
            const num = (k, div) => { const x = d[k]; if (!x) return null; const v = parseFloat(x.v); return isNaN(v) ? null : v / (/^k/i.test(x.u) ? 1 : div); };
            const e = d["Energy.Active.Import.Register"], wh = e ? parseFloat(e.v) * (/^k/i.test(e.u) ? 1000 : 1) : null;
            out.dettagli = { tag: tx.tag, inizio: tx.inizio, kw: num("Power.Active.Import", 1000), a: num("Current.Import", 1) ?? num("Current.Import.L1", 1), v: num("Voltage", 1),
              kwh: wh != null && tx.meter_ini != null ? (wh - tx.meter_ini) / 1000 : null, agg: m ? m.ts : null };
          }
        }
        return json(out);
      }
      if (url.pathname === "/api/ocpp") {                  // OCPP server: state and address to give to the charger
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        if (req.method === "POST") {
          const b = await req.json();
          if (b.azione === "comando") {                      // OCPP tab: commands from a fixed list (3 read-only + RemoteStop)
            const mess = ["MeterValues", "StatusNotification", "Heartbeat", "DiagnosticsStatusNotification", "FirmwareStatusNotification"];
            const CMD = {
              GetConfiguration: () => ({}),
              GetLocalListVersion: () => ({}),
              TriggerMessage: (x) => mess.includes(x.richiesta) ? { requestedMessage: x.richiesta, ...(x.richiesta === "Heartbeat" ? {} : { connectorId: 1 }) } : null,
            };
            let payload = null;
            if (b.comando === "RemoteStopTransaction") {       // acts: stops the open charge (the server takes the id, not the user)
              const st = await (await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/stato")).json();
              if (!st.transazione_aperta) return json({ errore: "Nessuna ricarica in corso da fermare" }, 400);
              payload = { transactionId: st.transazione_aperta.id };
            } else if (b.comando === "Reset") {                // restart (soft): only when the charger is free, never during a charge
              const st = await (await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/stato")).json();
              const occ = Object.values(st.prese || {}).some((p) => /Charging|Suspended|Preparing|Finishing/.test(p.status));
              if (st.transazione_aperta || occ) return json({ errore: "Colonnina occupata: riavvio non consentito" }, 400);
              payload = { type: "Soft" };
            } else {
              const f = Object.prototype.hasOwnProperty.call(CMD, b.comando) ? CMD[b.comando] : null;
              payload = f ? f(b) : null;
            }
            if (!payload) return json({ errore: "Comando non consentito" }, 400);
            const r = await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/comando", { method: "POST", body: JSON.stringify({ azione: b.comando, payload }) });
            return json(await r.json());
          }
          if (b.azione === "heartbeat") {                    // connection check interval, in minutes (1-60)
            const m = Math.round(Number(b.minuti));
            if (!(m >= 1 && m <= 60)) return json({ errore: "Intervallo non valido: da 1 a 60 minuti" }, 400);
            await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/heartbeat", { method: "POST", body: JSON.stringify({ s: m * 60 }) });
          }
          if (b.azione === "parametro") {                    // other OCPP settings, with limits
            let v;
            if (b.chiave === "LocalAuthorizeOffline") v = b.valore === true || b.valore === "true";
            else {
              const d = Object.prototype.hasOwnProperty.call(PARAMETRI, b.chiave) ? PARAMETRI[b.chiave] : null;
              if (!d) return json({ errore: "Parametro non consentito" }, 400);
              v = Math.round(Number(b.valore));
              if (!(v >= d[0] && v <= d[1])) return json({ errore: `Valore non valido: da ${d[0]} a ${d[1]}` }, 400);
            }
            await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/parametro", { method: "POST", body: JSON.stringify({ k: b.chiave, v }) });
          }
          if (b.azione === "rigenera") await tokenOcpp(env, true);
          if (b.azione === "lista") await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/lista-opzione", { method: "POST", body: JSON.stringify({ attiva: b.attiva === true }) });   // card list sending on/off
          if (b.azione === "sincronizza") { const r = await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/sync", { method: "POST" }); if (!r.ok) return json(await r.json(), 400); }
        }
        const token = await tokenOcpp(env);
        const live = await (await env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")).fetch("https://do/stato")).json();
        return json({ ...live, host: url.host, percorso: `/ocpp/${token}/${(await leggiConfig(env)).charger_id}` });
      }
      if (url.pathname === "/api/reinvia" && req.method === "POST") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        const b = await req.json();
        const anno = +b.anno, mese = +b.mese;
        const es = await env.DB.prepare("SELECT 1 FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).first();
        if (!es) return json({ errore: "Prezzo non ancora inserito" }, 400);
        const mail = await inviaReportPrezzo(env, anno, mese, url.origin);
        const d = await leggiDestinatari(env);
        return json({ ok: true, mail, destinatari: mail === "inviata" ? d.a.concat(d.cc) : undefined });
      }
      if (url.pathname === "/api/rfid") {                  // cards programmed on the charger (admin only)
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        let prima;
        try {
          const letta = await rfidDallaColonnina(env);
          prima = riempiNomi(letta, await nomiDb(env));
          // names missing on the charger (erased by the OCPP list send): put them back in the background
          if (req.method === "GET" && prima.some((x, i) => x.nome !== letta[i].nome)) ctx.waitUntil(ripristinaNomi(env).catch(() => {}));
        }
        catch (e) { return json({ errore: "Colonnina non raggiungibile: " + (e.message || e) }, 502); }
        const bk = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_backup'").first();
        const backup = bk ? JSON.parse(bk.valore) : null;
        if (req.method === "GET") {
          // for entries without a code suggest the code from the site db, searching by name
          const db = (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results;
          const lista = prima.map((x) => {
            if (x.id) return x;
            const c = db.filter((r) => norm(r.nome).startsWith(norm(x.nome)) && !prima.some((y) => y.id === r.tag));
            return { ...x, suggerito: c.length === 1 ? c[0].tag : "", nome_completo: c.length === 1 ? c[0].nome : "" };
          });
          return json({ lista: await conBloccate(env, lista), backup: backup ? { quando: backup.quando, n: backup.lista.length } : null });
        }
        if (req.method !== "POST") return json({ errore: "metodo" }, 405);
        const b = await req.json();
        let dopo = prima.map((x) => ({ ...x }));
        const id = rfidId(b.id), nome = rfidNome(b.nome), scad = String(b.scad || "").trim(), stato = rfidStato(b.stato ?? "0");
        const controlla = () => {
          if (!RFID_ID_OK.test(id)) return "Codice tessera non valido (solo cifre e lettere A-F)";
          if (!nome) return "Inserisci il nome";
          if (nome.length > RFID_NOME_MAX) return "Nome troppo lungo (massimo 25 caratteri)";
          if (!RFID_SCAD_OK.test(scad)) return "Scadenza non valida";
          if (stato === null) return "Stato non valido";
          return null;
        };
        const regB = await leggiMeta(env, "tessere_bloccate", []);
        const soloReg = id && !dopo.some((x) => x.id === id) && regB.some((x) => x.tag === id);      // card blocked by the site, removed from the charger's list
        if (soloReg && b.azione === "modifica") {
          if (stato !== "0") return json({ ok: true, lista: await conBloccate(env, prima) });
          await bloccaTessera(env, id, false);                                                        // state "accepted": put it back in the list
          return json({ ok: true, lista: await conBloccate(env, riempiNomi(await rfidDallaColonnina(env), await nomiDb(env))) });
        }
        if (b.azione === "aggiungi" || b.azione === "modifica") {
          const err = controlla(); if (err) return json({ errore: err }, 400);
          const es = dopo.find((x) => x.id === id);
          if (b.azione === "aggiungi") { if (es) return json({ errore: "Tessera già presente" }, 400); dopo.push({ id, scad, nome, stato }); }
          else { if (!es) return json({ errore: "Tessera non trovata" }, 404); Object.assign(es, { nome, scad, stato }); }
        } else if (b.azione === "ripara") {                // entry left without a code: give it the code back
          const x = dopo[+b.indice];
          if (!x || x.id) return json({ errore: "Tessera non trovata" }, 404);
          const err = controlla(); if (err) return json({ errore: err }, 400);
          if (dopo.some((y) => y.id === id)) return json({ errore: "Tessera già presente" }, 400);
          Object.assign(x, { id, nome, scad, stato });
        } else if (b.azione === "elimina") {
          if (soloReg) await salvaMeta(env, "tessere_bloccate", regB.filter((x) => x.tag !== id));
          const i = soloReg ? -2 : id ? dopo.findIndex((x) => x.id === id) : (dopo[+b.indice] && !dopo[+b.indice].id ? +b.indice : -1);
          if (i === -1) return json({ errore: "Tessera non trovata" }, 404);
          if (i >= 0) dopo.splice(i, 1);
        } else if (b.azione === "importa") {               // merge: adds new cards and updates names, deletes nothing
          const nuove = rfidDaFile(String(b.testo || "")).filter((x) => RFID_ID_OK.test(x.id) && x.nome).map((x) => ({ ...x, nome: x.nome.slice(0, RFID_NOME_MAX) }));
          if (!nuove.length) return json({ errore: "Nel file non ho trovato tessere valide" }, 400);
          for (const n of nuove) {                                // the Viaris CSV strips spaces: if the name is the same keep the existing one
            const es = dopo.find((x) => x.id === n.id);
            if (!es) dopo.push(n); else { if (norm(es.nome) !== norm(n.nome) || n.nome.length > es.nome.length) es.nome = n.nome; /* on a tie keep the spelling with spaces */ if (n.scad) es.scad = n.scad; es.stato = n.stato; }
          }
        } else if (b.azione === "ripristina") {
          if (!backup) return json({ errore: "Nessuna copia precedente" }, 400);
          dopo = backup.lista;
        } else return json({ errore: "azione sconosciuta" }, 400);
        try {
          const r = await rfidScrivi(env, prima, dopo);
          if (b.azione === "aggiungi") await syncNomi(env);
          if (b.azione === "aggiungi" && dataLocale(b.dal)) {      // assignment date chosen by the user
            await env.DB.prepare("UPDATE tessere_nomi SET dal=? WHERE tag=? AND dal=(SELECT MAX(dal) FROM tessere_nomi WHERE tag=?) AND al IS NULL")
              .bind(dataLocale(b.dal), id, id).run().catch(() => {});
          }
          if (b.azione === "elimina" && id) {                      // deactivation: closes the card's open period
            await syncNomi(env);
            await env.DB.prepare("UPDATE tessere_nomi SET al=? WHERE tag=? AND dal=(SELECT MAX(dal) FROM tessere_nomi WHERE tag=?) AND al IS NULL")
              .bind(dataLocale(b.al) ?? Math.floor(Date.now() / 1000), id, id).run();
          }
          return json({ ok: r.ok, lista: await conBloccate(env, r.lista), avviso: r.ok ? null : "La colonnina ha risposto, ma la lista riletta non coincide: controlla" });
        } catch (e) { return json({ errore: "Scrittura sulla colonnina non riuscita: " + (e.message || e) }, 502); }
      }
      if (url.pathname === "/api/nomi") {                  // card assignment history (admin only)
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        await syncNomi(env);
        if (req.method === "GET") {
          const r = (await env.DB.prepare("SELECT tag, nome, dal, al FROM tessere_nomi ORDER BY nome, dal").all()).results;
          return json(r.map((x) => ({ tag: x.tag, nome: x.nome, dal: x.dal, al: x.al, dal_txt: isoLocale(x.dal), al_txt: x.al == null ? "" : isoLocale(x.al) })));
        }
        if (req.method !== "POST") return json({ errore: "metodo" }, 405);
        const q2 = await req.json();
        const nd = dataLocale(q2.nuovo_dal), na = q2.nuovo_al ? dataLocale(q2.nuovo_al) : null;
        if (nd === null || (q2.nuovo_al && na === null)) return json({ errore: "Data non valida" }, 400);
        if (na !== null && na <= nd) return json({ errore: "La dismissione deve essere dopo l'assegnazione" }, 400);
        try {
          await env.DB.prepare("UPDATE tessere_nomi SET dal=?, al=? WHERE tag=? AND dal=?").bind(nd, na, String(q2.tag), +q2.dal).run();
        } catch (e) { return json({ errore: "Esiste gia' un periodo con quella data" }, 400); }
        return json({ ok: true });
      }
      if (url.pathname === "/api/tessere") {
        if (me.ruolo !== "admin") return json({ errore: "non autorizzato" }, 403);
        return json((await env.DB.prepare("SELECT tag, nome FROM tessere ORDER BY nome").all()).results);
      }
      if (url.pathname === "/api/mie") {                 // the charger user's sessions (only their own cards)
        if (!me.tessera) return nega();
        return json(await mieRicariche(env, me.tessere, +q.get("anno") || new Date().getUTCFullYear()));
      }
      if (url.pathname === "/api/mie.pdf") {             // PDF of one's own sessions (month or whole year)
        if (!me.tessera) return nega();
        const anno = +q.get("anno") || new Date().getUTCFullYear();
        const mese = Math.min(12, Math.max(0, +q.get("mese") || 0));
        const t = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(me.tessera).first();
        const lista = await mieRicariche(env, me.tessere, anno);
        const bin = pdfMieRicariche(t ? t.nome : "", me.tessere.join(", "), anno, mese, lista);
        const nomeFile = `Ricariche_${me.tessera}_${anno}${mese ? "-" + String(mese).padStart(2, "0") : ""}.pdf`;
        return new Response(Uint8Array.from(bin, (c) => c.charCodeAt(0)), { headers: {
          "content-type": "application/pdf", "cache-control": "no-store",
          "content-disposition": `attachment; filename="${nomeFile}"` } });
      }
      if (url.pathname === "/api/miapassword" && req.method === "POST") {
        const b = await req.json();
        if (!PW_FORTE(String(b.nuova || ""))) return json({ errore: "La nuova password deve avere almeno 12 caratteri con minuscola, maiuscola, numero e carattere speciale" }, 400);
        if (b.ripeti !== b.nuova) return json({ errore: "Le due nuove password non coincidono" }, 400);
        const u = await loginLimitato(env, me.nome, String(b.vecchia || ""));       // same limit as sign-in: 5 errors per 10 minutes
        if (u && u.limite) return json({ errore: "Troppi tentativi: riprova tra 10 minuti" }, 429);
        if (!u) return json({ errore: "Password attuale errata" }, 400);
        const c = await nuovaCredenziale(String(b.nuova));
        await env.DB.prepare("UPDATE utenti SET salt=?, hash=? WHERE nome=?").bind(c.salt, c.hash, me.nome).run();
        const r = json({ ok: true });
        r.headers.append("set-cookie", cookie(await creaToken(env, { nome: me.nome, hash: c.hash }), DURATA_SESSIONE));
        return r;
      }
      if (url.pathname === "/" && req.method === "GET") {
        return new Response(pagina(P_HTML), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      }
      if (url.pathname === "/api/stato") return json(await statoArchivio(env));
      if (url.pathname === "/api/report") {
        if (!P.report) return nega();
        const oggi = new Date();
        return json(await reportMese(env, +q.get("anno") || oggi.getUTCFullYear(), +q.get("mese") || oggi.getUTCMonth() + 1, ris));
      }
      if (url.pathname === "/api/storico") { if (!P.storico) return nega(); }
      if (url.pathname === "/api/storico") return json(await storicoAnno(env, +q.get("anno") || new Date().getUTCFullYear(), ris));
      if (url.pathname === "/api/sessioni") {
        if (!P.sessioni) return nega();
        const storia = await nomiStorici(env);
        const prz = new Map((await env.DB.prepare("SELECT anno, mese, eur_kwh, iva FROM prezzi").all()).results.map((p) => [p.anno * 100 + p.mese, p]));
        const r = (await env.DB.prepare("SELECT inizio_utc, fine_utc, tag, tag_tipo, energia_wh FROM sessioni ORDER BY inizio_utc DESC").all()).results
          .filter((s) => ris || !(s.tag === "" || s.tag_tipo === "app"));
        const gruppi = new Map();                       // same card (or app) and same month
        for (const s of r) {
          const k = (s.tag === "" || s.tag_tipo === "app" ? "app" : s.tag) + "|" + annoMeseLocale(s.inizio_utc);
          if (!gruppi.has(k)) gruppi.set(k, []);
          gruppi.get(k).push(s);
        }
        for (const [k, lista] of gruppi) {
          const p = prz.get(+k.split("|")[1]);
          const c = costiGruppo(lista.map((s) => s.energia_wh), p ? p.eur_kwh : null, p ? p.iva : 0, k.startsWith("app|"));
          lista.forEach((s, i) => { s.costo = c[i]; });
        }
        return json(r.map((s) => ({ inizio: fmtLocale(s.inizio_utc), fine: fmtLocale(s.fine_utc),
          tag: s.tag || "(app)", nome: s.tag ? (nomeAl(storia, s.tag, s.inizio_utc) || "") : "Avviata da app", kwh: s.energia_wh / 1000,
          imp: s.costo.imp, iva: s.costo.iva, tot: s.costo.tot })));
      }
      if (req.method === "POST") {
        if (url.pathname === "/api/prezzo") {
          if (!P.prezzo) return nega();
          const b = await req.json();
          const anno = +b.anno, mese = +b.mese;
          if (!(mese >= 1 && mese <= 12) || !(anno >= 2020 && anno <= 2100)) return json({ errore: "mese/anno non validi" }, 400);
          const es = await env.DB.prepare("SELECT 1 FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).first();
          if (es) return json({ errore: "Prezzo gia' inserito: il mese e' bloccato e non si puo' piu' modificare" }, 423);
          if (b.prezzo === null || b.prezzo === "") {
            await env.DB.prepare("DELETE FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).run();
          } else {
            const p = +b.prezzo, i = +b.iva || 0;
            if (!(p > 0 && p < 5) || !(i >= 0 && i <= 100)) return json({ errore: "prezzo o IVA non validi" }, 400);
            await env.DB.prepare("INSERT OR REPLACE INTO prezzi VALUES (?,?,?,?)").bind(anno, mese, p, i).run();
            const mail = await inviaReportPrezzo(env, anno, mese, url.origin);
            return json({ ok: true, mail, destinatari: mail === "inviata" ? (await leggiDestinatari(env)).a.concat((await leggiDestinatari(env)).cc) : undefined });
          }
          return json({ ok: true });
        }
        if (["/api/scarica", "/api/ingest", "/api/importa"].includes(url.pathname) && !P.scarica) return nega();
        if (url.pathname === "/api/scarica") {
          try { return json({ ok: true, ...(await scarica(env)) }); }
          catch (e) { return json({ ok: false, errore: String(e.message || e) }, 502); }
        }
        if (url.pathname === "/api/ingest") {          // for whoever pushes the data from outside (see README)
          let b;
          const cIn = await leggiConfig(env);
          try { b = await req.json(); if (!parseStorico(String(b.storico), cIn).length && !String(b.storico).trim()) throw new Error("vuoto"); }   // empty or malformed data -> 400
          catch (_) { return json({ ok: false, errore: "Dati non validi: serve 'storico' con il testo letto dalla colonnina" }, 400); }
          return json({ ok: true, ...(await salvaScarico(env, cIn, b.storico, typeof b.tessere === "string" ? b.tessere : null)) });
        }
        if (url.pathname === "/api/importa") {
          const b = await req.json();
          try { return json({ ok: true, ...(await importaCsv(env, b.nome, b.csv)) }); }
          catch (e) { return json({ ok: false, file: b.nome, errore: String(e.message || e) }, 400); }
        }
      }
      return json({ errore: "non trovato" }, 404);
    } catch (e) {
      return json({ errore: String(e.message || e) }, e.codice ? 400 : 500);
    }
  },

  async scheduled(ev, env, ctx) {
    if (ev.cron === "*/5 * * * *") { ctx.waitUntil(verificaMalfunzionamenti(env).catch(() => {})); return; }   // monitoring check
    ctx.waitUntil(leggiConfig(env).then((c) => (c.auto && c.url ? scarica(env).catch(() => { /* the error is saved in meta */ }).then(() => ripristinaNomi(env)) : null)).catch(() => {}));
  },
};

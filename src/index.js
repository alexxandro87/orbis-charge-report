// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Alessandro Pomponi. This program is free software under the GNU Affero General Public License v3 or later; see LICENSE.
// Orbis Charge Report - Cloudflare Worker (API + pages + scheduled download from the charger)
// Note: internal identifiers are in Italian (historical); user-facing text is in EN/IT.
import { HTML, LOGIN, INVITO, SETUP, I18N } from "./ui.js";
import { Colonnina } from "./ocpp.js";
export { Colonnina };      // Durable Object class (OCPP live connection), bound as COLONNINA

let TITOLO = "EV Charger";            // site title (from settings)
let TZ = "Europe/Rome";                // time zone used for months, reports and the price lock (from settings)
const MESI = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const MESI_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
  "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const lingua = (l) => (l === "it" ? "it" : "en");
const nomeMese = (m, l) => (lingua(l) === "it" ? MESI_IT : MESI)[m - 1];

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
function fmtLocale(epoch) {
  const d = new Date((epoch + offsetTz(epoch)) * 1000);
  return `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;   // DD/MM/YYYY HH:MM (the page reformats it)
}

// -------------------------------------------------------------- blocco dei prezzi
// Il prezzo di un mese si puo' inserire e correggere fino alla fine del mese successivo;
// dal 1 del secondo mese dopo (es. ottobre -> 1 dicembre) e' bloccato per sempre.
function inizioBlocco(anno, mese) {
  return epochDaLocale(anno + Math.floor((mese + 1) / 12), ((mese + 1) % 12) + 1, 1);
}
const dataBlocco = (anno, mese) => fmtLocale(inizioBlocco(anno, mese)).slice(0, 10);
const prezzoBloccato = (anno, mese) => Date.now() / 1000 >= inizioBlocco(anno, mese);

// -------------------------------------------------------------- importi
const r2 = (x) => Math.round(x * 100 + 1e-7) / 100;
const euro = (kwh, prezzo) => (prezzo == null ? null : r2(kwh * prezzo));
const iva = (imp, pct) => (imp == null ? null : r2((imp * pct) / 100));

// Ripartisce un totale in centesimi tra delle voci, in proporzione ai pesi (metodo del resto maggiore):
// la somma delle singole ricariche coincide sempre con il totale della tessera.
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
// Imponibile, IVA e totale di ogni singola ricarica di un gruppo (stessa tessera e stesso mese).
// perSessione=true per le ricariche da app, che si arrotondano una per una.
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

// -------------------------------------------------------------- card assignments (who held a card, and when)
// tessere_nomi keeps one row per (card, holder, from-date); "al" is the date the card was returned.
// Reports use the holder at the time of each session, so reassigning a card never rewrites the past.
// Names that come from the charger create/extend periods automatically; periods edited by the administrator
// (man = 1) are never touched by the automatic synchronisation.
async function syncNomi(env) {
  await preparaTabelle(env);
  const cor = (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results;
  const ult = new Map((await env.DB.prepare(
    "SELECT tag, nome, dal, al, man FROM tessere_nomi n WHERE dal = (SELECT MAX(dal) FROM tessere_nomi WHERE tag = n.tag)").all()).results.map((r) => [r.tag, r]));
  const prima = new Map((await env.DB.prepare("SELECT tag, MIN(inizio_utc) p FROM sessioni GROUP BY tag").all()).results.map((r) => [r.tag, r.p]));
  const ora = Math.floor(Date.now() / 1000), st = [];
  const ins = "INSERT OR REPLACE INTO tessere_nomi (tag, nome, dal, man) VALUES (?,?,?,0)";
  for (const c of cor) {
    if (!c.nome) continue;
    const u = ult.get(c.tag);
    if (!u) {
      const p = prima.get(c.tag);
      st.push(env.DB.prepare(ins).bind(c.tag, c.nome, p && p < ora ? p - 86400 : ora));
    } else if (!u.man && u.al == null && u.nome !== c.nome) {
      if (norm(c.nome).startsWith(norm(u.nome))) st.push(env.DB.prepare("UPDATE tessere_nomi SET nome=? WHERE tag=? AND dal=?").bind(c.nome, c.tag, u.dal));
      else if (!norm(u.nome).startsWith(norm(c.nome))) {
        st.push(env.DB.prepare("UPDATE tessere_nomi SET al=? WHERE tag=? AND dal=?").bind(ora, c.tag, u.dal));
        st.push(env.DB.prepare(ins).bind(c.tag, c.nome, ora));
      }
    }
  }
  if (st.length) await env.DB.batch(st);
}
let storiaCache = { t: 0, m: null };
async function nomiStorici(env) {
  if (storiaCache.m && Date.now() - storiaCache.t < 15000) return storiaCache.m;
  await syncNomi(env);
  const m = new Map();
  for (const r of (await env.DB.prepare("SELECT tag, nome, dal, al FROM tessere_nomi ORDER BY tag, dal").all()).results) {
    if (!m.has(r.tag)) m.set(r.tag, []);
    m.get(r.tag).push(r);
  }
  storiaCache = { t: Date.now(), m };
  return m;
}
function nomeAl(storia, tag, t) {              // holder of the card at epoch t (undefined = none)
  const a = storia.get(tag);
  if (!a) return undefined;
  let r = a[0];
  for (const x of a) if (x.dal <= t) r = x;
  return r.al != null && t >= r.al ? undefined : r.nome;
}

// -------------------------------------------------------------- accesso ai dati
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
      const nome = nomeAl(storia, s.tag, s.inizio_utc) || "";
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
    blocco_da: dataBlocco(anno, mese), bloccato: prezzo != null && prezzoBloccato(anno, mese),
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

// -------------------------------------------------------------- settings (charger connection, format, general)
const CFG_DEFAULTS = {
  title: "EV Charger", url: "", user: "", password: "", header_name: "", header_value: "",
  history_path: "/modules/modulator/historic?from=0&to=-1", tags_path: "/modules/tags?level=file",
  timeout: 20, auto: true,
  // history response: JSON object whose text field holds CSV lines (Orbis); empty field = the response itself is CSV
  hist_json_field: "body", hist_sep: ",", hist_skip: 0,
  c_start: 0, c_tag: 7, c_type: 8, c_cont_ini: 9, c_end: 10, c_cont_fin: 13,
  // tag list response: text lines
  tags_sep: ";", tags_skip: 1, tags_c_tag: 0, tags_c_name: 2,
  tz: "Europe/Rome", currency: "€", tax_label: "",
  resend_key: "", mail_from: "",          // invitation emails via Resend (optional)
  report_to: "", report_cc: "",            // who receives the monthly report when a price is saved (comma-separated)
};
const CFG_NUM = ["timeout", "hist_skip", "c_start", "c_tag", "c_type", "c_cont_ini", "c_end", "c_cont_fin", "tags_skip", "tags_c_tag", "tags_c_name"];
const CFG_STR = ["title", "url", "user", "password", "header_name", "header_value", "history_path", "tags_path",
  "hist_json_field", "hist_sep", "tags_sep", "tz", "currency", "tax_label", "resend_key", "mail_from", "report_to", "report_cc"];

async function leggiConfig(env) {
  const c = { ...CFG_DEFAULTS };
  const E = { url: env.CHARGER_URL, user: env.CHARGER_USER, password: env.CHARGER_PASSWORD, title: env.SITE_TITLE,
    tz: env.TIMEZONE, currency: env.CURRENCY, resend_key: env.RESEND_API_KEY, mail_from: env.MAIL_FROM };
  for (const [k, v] of Object.entries(E)) if (v) c[k] = v;
  const r = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='config'").first();
  if (r) { try { Object.assign(c, JSON.parse(r.valore)); } catch (_) { /* ignore a damaged value */ } }
  TITOLO = c.title || CFG_DEFAULTS.title;
  try { new Intl.DateTimeFormat("en-US", { timeZone: c.tz }); TZ = c.tz; } catch (_) { TZ = CFG_DEFAULTS.tz; }
  return c;
}
// what the browser may see: never the password
const configPubblica = (c) => { const { password, resend_key, ...x } = c; return { ...x, password_set: !!password, resend_set: !!resend_key }; };

function pulisciConfig(inp, base) {                      // validate what the admin sends and merge it over `base`
  const out = { ...base };
  for (const k of CFG_STR) {
    if (inp[k] === undefined) continue;
    if ((k === "password" || k === "resend_key") && inp[k] === null) continue;   // null = keep the saved secret
    out[k] = String(inp[k]).trim().slice(0, 500);
  }
  for (const k of CFG_NUM) {
    if (inp[k] === undefined || inp[k] === "") continue;
    const n = Math.trunc(+inp[k]);
    if (!Number.isFinite(n) || n < 0 || n > 1000) throw Object.assign(new Error("bad number: " + k), { codice: "bad_config", par: { k } });
    out[k] = n;
  }
  if (inp.auto !== undefined) out.auto = !!inp.auto;
  for (const k of ["report_to", "report_cc"]) {
    const l = listaEmail(out[k]);
    if (!l.every((x) => EMAIL_OK.test(x))) throw Object.assign(new Error("Invalid email address"), { codice: "bad_email" });
    out[k] = l.join(", ");
  }
  if (out.url && !/^https?:\/\/[^\s]+$/i.test(out.url)) throw Object.assign(new Error("The charger URL must start with http:// or https://"), { codice: "bad_url" });
  try { new Intl.DateTimeFormat("en-US", { timeZone: out.tz }); }
  catch (_) { throw Object.assign(new Error("Unknown time zone"), { codice: "bad_tz" }); }
  if (!out.timeout) out.timeout = CFG_DEFAULTS.timeout;
  if (!out.hist_sep) out.hist_sep = ","; if (!out.tags_sep) out.tags_sep = ";";
  return out;
}

// -------------------------------------------------------------- download from the charger
function parseStorico(testo, c) {
  let body = testo;
  if (c.hist_json_field) {
    let j; try { j = JSON.parse(testo); } catch (_) { throw new Error("The history response is not JSON (check the JSON field in settings)"); }
    body = j[c.hist_json_field];
    if (typeof body !== "string") throw new Error(`The history response has no text field "${c.hist_json_field}"`);
  }
  const righe = [];
  let scartate = 0;
  for (const riga of body.split(/\r?\n/).slice(c.hist_skip)) {
    if (!riga.trim()) continue;
    const x = riga.split(c.hist_sep);
    const ini = parseInt(x[c.c_cont_ini], 10), fin = parseInt(x[c.c_cont_fin], 10);
    const a = parseInt(x[c.c_start], 10), b = parseInt(x[c.c_end], 10);
    if (![ini, fin, a, b].every(Number.isFinite) || x[c.c_tag] === undefined) { scartate++; continue; }
    righe.push([a, b, x[c.c_tag].trim().toUpperCase(), (x[c.c_type] || "").trim(), ini, fin, fin - ini]);
  }
  return { righe, scartate };
}
function parseTessere(testo, c) {
  const out = [];
  for (const riga of testo.split(/\r?\n/).slice(c.tags_skip)) {
    const p = riga.split(c.tags_sep);
    const tag = (p[c.tags_c_tag] || "").trim(), nome = (p[c.tags_c_name] || "").trim();
    if (tag) out.push([tag.toUpperCase(), nome]);
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
  // le ricariche da app importate da Viaris vanno marcate 'viaris' come le altre (correzione di una versione precedente)
  await env.DB.prepare("UPDATE sessioni SET tag_tipo='viaris' WHERE cont_ini_wh=-1 AND tag_tipo='app'").run();
  const r = await env.DB.prepare(
    "DELETE FROM sessioni WHERE tag_tipo='viaris' AND EXISTS (" +
    " SELECT 1 FROM sessioni c WHERE c.tag_tipo<>'viaris' AND c.tag=sessioni.tag" +
    " AND ABS(c.inizio_utc - sessioni.inizio_utc) <= 180)").run();
  return r.meta.changes || 0;
}

// Marks as active only the given cards: the others were removed from the charger or are not accepted there.
const stmtTessereAttive = (env, tags) =>
  env.DB.prepare("UPDATE tessere SET attiva = CASE WHEN tag IN (SELECT value FROM json_each(?)) THEN 1 ELSE 0 END").bind(JSON.stringify(tags));
const idAccettati = (L) => L.filter((x) => x.id && x.stato === "0").map((x) => x.id);

async function salvaScarico(env, c, testoStorico, testoTessere) {
  await preparaTabelle(env);
  const { righe, scartate } = parseStorico(testoStorico, c);
  const nuove = await inserisciSessioni(env, righe);
  if (testoTessere) {
    const st = env.DB.prepare("INSERT OR REPLACE INTO tessere (tag, nome) VALUES (?,?)");
    const t = parseTessere(testoTessere, c);
    if (t.length) {
      // Orbis card list: only state 0 (accepted) is active; other layouts carry no state, so every listed card is
      const orbis = rfidPercorsi(c) ? rfidLeggi(testoTessere) : [];
      const attive = orbis.length ? idAccettati(orbis) : t.map((x) => x[0]);
      await env.DB.batch([...t.map((x) => st.bind(...x)), stmtTessereAttive(env, attive)]);
    }
  }
  await rimuoviDoppioni(env);
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_scarico', ?)").bind(new Date().toISOString()).run();
  await env.DB.prepare("DELETE FROM meta WHERE chiave='ultimo_errore'").run();
  return { lette: righe.length, nuove, scartate };
}

function intestazioni(c) {
  const h = { accept: "*/*" };
  if (c.user) h.authorization = "Basic " + btoa(unescape(encodeURIComponent(c.user + ":" + c.password)));
  if (c.header_name && c.header_value) h[c.header_name] = c.header_value;
  return h;
}
async function conTimeout(url, c) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), c.timeout * 1000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: intestazioni(c) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } catch (e) {
    if (e.name === "AbortError") throw new Error(`timeout after ${c.timeout} s`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}
const urlCompleto = (c, path) => c.url.replace(/\/$/, "") + (path.startsWith("/") ? "" : "/") + path;

async function scarica(env, c) {
  try {
    if (!c.url) throw new Error("The charger URL is not set (Settings tab)");
    const storico = await conTimeout(urlCompleto(c, c.history_path), c);
    let tessere = null;
    if (c.tags_path) { try { tessere = await conTimeout(urlCompleto(c, c.tags_path), c); } catch (_) { /* optional */ } }
    return await salvaScarico(env, c, storico, tessere);
  } catch (e) {
    const msg = `${new Date().toISOString()} ${e.message || e}`;
    await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ultimo_errore', ?)").bind(msg).run();
    throw e;
  }
}

// connection test: nothing is saved
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
  if (!c.url) return { errore: "no_url" };
  await una("history", c.history_path, (t) => { const r = parseStorico(t, c); return { righe: r.righe.length, scartate: r.scartate,
    primo: r.righe[0] ? { inizio: fmtLocale(r.righe[0][0]), fine: fmtLocale(r.righe[0][1]), tag: r.righe[0][2], tipo: r.righe[0][3], wh: r.righe[0][6] } : null }; });
  if (c.tags_path) await una("tags", c.tags_path, (t) => ({ righe: parseTessere(t, c).length }));
  return out;
}

// -------------------------------------------------------------- importazione export Viaris
const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

// -------------------------------------------------------------- card list on the charger (Orbis web interface)
// The charger keeps its authorised cards in a text file: first line = version, then one card per line
// "code;expiry;name;state" (state 0 accepted, 1 blocked, 2 expired, 3 invalid). It is read and written through the
// same path as the card list (level=file), then saved with level=save. Nothing is ever sent over OCPP.
const RFID_NOME_MAX = 25;
const RFID_ID_OK = /^[0-9A-F]{4,20}$/;
const RFID_SCAD_OK = /^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d)?$/;
const RFID_STATI = ["accepted", "blocked", "expired", "invalid"];
const rfidId = (x) => String(x || "").trim().toUpperCase();
const rfidNome = (x) => String(x || "").replace(/[;\r\n\t]/g, " ").replace(/\s+/g, " ").trim();
const rfidStato = (x) => {
  const v = String(x ?? "").trim();
  if (/^[0-3]$/.test(v)) return v;
  const i = RFID_STATI.indexOf(v.toLowerCase());
  return i >= 0 ? String(i) : null;
};
function rfidLeggi(testo) {
  const out = [];
  for (const riga of testo.split(/\r?\n/).slice(1)) {
    const p = riga.split(";");
    if (p.length >= 4 && (p[0].trim() || p[2].trim())) out.push({ id: p[0].trim().toUpperCase(), scad: p[1].trim(), nome: p[2].trim(), stato: p[3].trim() });
  }
  return out;
}
const rfidTesto = (L) => "1\r\n" + L.map((t) => `${t.id};${t.scad};${t.nome};${t.stato}\r\n`).join("");
function rfidPercorsi(c) {                         // read path and save path; null = this charger layout is not supported
  if (!c.url || !/level=file/.test(c.tags_path || "")) return null;
  return { file: urlCompleto(c, c.tags_path), salva: urlCompleto(c, c.tags_path.replace("level=file", "level=save")) };
}
async function rfidDallaColonnina(c, per) { return rfidLeggi(await conTimeout(per.file, c)); }
async function rfidScrivi(env, c, per, prima, dopo, copia = true) {
  if (copia) await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('rfid_backup', ?)").bind(JSON.stringify({ quando: new Date().toISOString(), lista: prima })).run();
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), c.timeout * 1000);
  try {
    const r = await fetch(per.file, { method: "POST", headers: { ...intestazioni(c), "content-type": "text/plain" }, body: rfidTesto(dopo), signal: ctl.signal });
    if (!r.ok) throw new Error("write: HTTP " + r.status);
  } finally { clearTimeout(t); }
  await conTimeout(per.salva, c);
  const letta = await rfidDallaColonnina(c, per);
  const ok = letta.length === dopo.length && dopo.every((x) => letta.some((y) => y.id === x.id && y.nome === x.nome && y.scad === x.scad));
  // keep the local card table in step (it feeds the reports and the OCPP card check)
  const vecchi = new Map((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
  const st = env.DB.prepare("INSERT OR REPLACE INTO tessere (tag, nome) VALUES (?,?)");
  const da = dopo.filter((x) => x.id && (!vecchi.has(x.id) || !norm(vecchi.get(x.id)).startsWith(norm(x.nome))));
  // the list read back is what the charger really accepts: removed or blocked cards stop being active
  await env.DB.batch([...da.map((x) => st.bind(x.id, x.nome)), stmtTessereAttive(env, idAccettati(letta))]);
  if (da.length) await syncNomi(env);
  storiaCache = { t: 0, m: null };
  return { ok, lista: letta };
}

async function importaCsv(env, nomeFile, testo) {
  const righe = testo.replace(/^﻿/, "").split(/\r?\n/).filter((r) => r.trim());
  if (!righe.length) throw Object.assign(new Error("Empty file"), { codice: "empty_file" });
  const intest = righe[0].split(";").map(norm);
  const cIni = intest.indexOf("DATAEORAINIZIO"), cFin = intest.indexOf("DATAEORAFINE"), cKwh = intest.indexOf("ENERGIAKWH");
  if (cIni < 0 || cFin < 0 || cKwh < 0) throw Object.assign(new Error("This does not look like a per-card Viaris export"), { codice: "not_viaris" });

  const nome = norm(nomeFile.replace(/\.csv$/i, "").split(" ")[0]);
  let tag, tipo;
  if (nome === "U") { tag = ""; tipo = "viaris"; }
  else {
    const t = (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.filter((r) => norm(r.nome) === nome);
    if (t.length !== 1) throw Object.assign(new Error(`Cannot match the card from the file name (${nomeFile.split(" ")[0]}): download from the charger first`), { codice: "card_unknown", par: { f: nomeFile.split(" ")[0] } });
    tag = t[0].tag; tipo = "viaris";
  }
  const sess = [];
  for (const r of righe.slice(1)) {
    const c = r.split(";");
    const m1 = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(c[cIni] || "");
    const m2 = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(c[cFin] || "");
    if (!m1 || !m2) continue;
    // Viaris export dates are local time of the configured time zone (the 'Z' is just a label)
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
const err = (codice, errore, status = 400, par) => json({ errore, codice, par }, status);
const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

// -------------------------------------------------------------- utenti e sessioni
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// permessi assegnabili agli utenti (l'admin ha sempre tutto)
const PERMESSI = ["report", "storico", "sessioni", "prezzo", "stampa", "scarica", "app", "live"];
const PERMESSI_DEFAULT = { report: 1, storico: 1, sessioni: 1, stampa: 1 };
const DURATA_INVITO = 48 * 3600;
function permessiDi(u) {
  if (u.tessera) return Object.fromEntries(PERMESSI.map((k) => [k, false]));   // utente della colonnina: vede solo le proprie ricariche
  if (u.ruolo === "admin") return Object.fromEntries(PERMESSI.map((k) => [k, true]));
  let p = PERMESSI_DEFAULT;
  if (u.permessi) { try { p = JSON.parse(u.permessi); } catch (_) { /* default */ } }
  return Object.fromEntries(PERMESSI.map((k) => [k, !!p[k]]));
}
const ITER = 5000;                       // PBKDF2: tenuto basso per stare nel limite di CPU del piano gratuito
const DURATA_SESSIONE = 30 * 24 * 3600;  // secondi
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
    env.DB.prepare("CREATE TABLE IF NOT EXISTS tessere_nomi (tag TEXT NOT NULL, nome TEXT NOT NULL, dal INTEGER NOT NULL, al INTEGER, man INTEGER DEFAULT 0, PRIMARY KEY (tag, dal))"),
  ]);
  const col = (await env.DB.prepare("PRAGMA table_info(utenti)").all()).results.map((c) => c.name);
  for (const [nome, tipo] of [["permessi", "TEXT"], ["invito_hash", "TEXT"], ["invito_exp", "INTEGER"], ["tessera", "TEXT"]])
    if (!col.includes(nome)) await env.DB.prepare(`ALTER TABLE utenti ADD COLUMN ${nome} ${tipo}`).run();
  const colT = (await env.DB.prepare("PRAGMA table_info(tessere)").all()).results.map((c) => c.name);
  if (colT.length && !colT.includes("attiva")) await env.DB.prepare("ALTER TABLE tessere ADD COLUMN attiva INTEGER NOT NULL DEFAULT 1").run();
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
// il token e' legato all'hash della password: cambiare password o cancellare l'utente chiude le sue sessioni
async function creaToken(env, u) {
  const exp = Math.floor(Date.now() / 1000) + DURATA_SESSIONE;
  const nonce = hex(crypto.getRandomValues(new Uint8Array(8)));          // every sign-in gets a different token
  return `${u.nome}~${exp}~${nonce}~${await firma(env, `${u.nome}|${exp}|${nonce}|${u.hash.slice(0, 16)}`)}`;
}
const leggiToken = (req) => {                // [name, exp, nonce, signature] from the session cookie, or []
  const ck = /(?:^|;\s*)sess=([^;]+)/.exec(req.headers.get("cookie") || "");
  let val = "";
  try { val = ck ? decodeURIComponent(ck[1]) : ""; } catch (_) { /* malformed cookie */ }
  return (/^(.+)~(\d+)~([0-9a-f]{16})~([0-9a-f]{64})$/.exec(val) || []).slice(1);
};
const cookie = (v, eta) => `sess=${encodeURIComponent(v)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${eta}`;

async function utenteCorrente(req, env) {
  await preparaTabelle(env);
  const p = leggiToken(req);
  if (p.length === 4 && +p[1] > Date.now() / 1000) {
    const u = await env.DB.prepare("SELECT nome, hash, ruolo, permessi, tessera FROM utenti WHERE nome=?").bind(p[0]).first();
    if (u && u.hash && uguali(p[3], await firma(env, `${u.nome}|${p[1]}|${p[2]}|${u.hash.slice(0, 16)}`))) {
      const rev = await env.DB.prepare("SELECT 1 FROM revocati WHERE sig=?").bind(p[3]).first();
      if (!rev) return { nome: u.nome, ruolo: u.ruolo, perm: permessiDi(u), tessera: u.tessera || null };
    }
  }
  // HTTP Basic: only for scripts that push data (/api/ingest), never for the pages
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Basic ") && new URL(req.url).pathname === "/api/ingest") {
    try {
      const [n, ...r] = atob(h.slice(6)).split(":");
      const u = await loginLimitato(env, n.trim().toLowerCase(), r.join(":"));
      if (u && !u.limite) return u;
    } catch (_) { /* ignora */ }
  }
  return null;
}

// verificaLogin with the attempt limit (5 failures per 10 minutes per user name), shared by
// /api/login and HTTP Basic on /api/ingest. Returns the user, null, or { limite: true }.
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

// controlla nome e password; alla prima volta (nessun utente) admin = APP_PASSWORD
async function verificaLogin(env, nome, pw) {
  await preparaTabelle(env);
  const n = (await env.DB.prepare("SELECT COUNT(*) n FROM utenti WHERE ruolo='admin'").first()).n;
  if (n === 0) {
    if (nome === "admin" && env.APP_PASSWORD && uguali(pw, env.APP_PASSWORD)) {
      const c = await nuovaCredenziale(pw);
      await env.DB.prepare("INSERT OR IGNORE INTO utenti (nome, salt, hash, ruolo) VALUES ('admin', ?, ?, 'admin')").bind(c.salt, c.hash).run();
    } else return null;
  }
  const u = await env.DB.prepare("SELECT nome, salt, hash, ruolo, permessi, tessera FROM utenti WHERE nome=?").bind(nome).first();
  if (!u || !u.hash) { await hashPw(pw, "00".repeat(16)); return null; }   // tempo simile anche se l'utente non esiste o non ha ancora scelto la password
  return uguali(await hashPw(pw, u.salt), u.hash) ? { nome: u.nome, ruolo: u.ruolo, hash: u.hash, perm: permessiDi(u), tessera: u.tessera || null } : null;
}

async function login(req, env) {
  const b = await req.json();
  const nome = String(b.nome || "").trim().toLowerCase(), pw = String(b.password || "");
  const u = await loginLimitato(env, nome, pw);
  if (u && u.limite) return err("too_many", "Too many attempts: try again in 10 minutes", 429);
  if (!u) return err("bad_login", "Wrong user name or password", 401);
  const r = json({ ok: true, nome: u.nome, ruolo: u.ruolo });
  r.headers.append("set-cookie", cookie(await creaToken(env, u), DURATA_SESSIONE));
  return r;
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sha256 = async (t) => hex(await crypto.subtle.digest("SHA-256", enc(t)));

async function inviaMail(cfg, a, oggetto, html, cc, allegati) {
  if (!cfg.resend_key || !cfg.mail_from) return "not_configured";
  try {
    const corpo = { from: cfg.mail_from, to: [].concat(a), subject: oggetto, html };
    if (cc && cc.length) corpo.cc = cc;
    if (allegati && allegati.length) corpo.attachments = allegati;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + cfg.resend_key, "content-type": "application/json" },
      body: JSON.stringify(corpo),
    });
    return r.ok ? "sent" : "error " + r.status + ": " + (await r.text()).slice(0, 200);
  } catch (e) { return "error: " + (e.message || e); }
}
const MAILT = {
  en: { subj: "Access to", sub: "Charging cost sharing", hello: "Hello,", own: (n, t) => `an account has been created for you: you will be able to see your charging sessions (card ${t}, ${n}).`,
    all: "an account has been created for you: you will be able to see the charging reports.",
    pick: "To get started, choose your password with the button below. The link is personal, single-use and valid for 48 hours.",
    btn: "Choose password", user: (n) => `Your user name is ${n}. If the button does not work, copy this address into your browser:` },
  it: { subj: "Accesso a", sub: "Ripartizione costi di ricarica", hello: "Buongiorno,", own: (n, t) => `e' stato creato un accesso a tuo nome: potrai consultare le tue ricariche (tessera ${t}, ${n}).`,
    all: "e' stato creato un accesso a tuo nome: potrai consultare i report delle ricariche.",
    pick: "Per iniziare scegli la tua password dal pulsante qui sotto. Il link e' personale, monouso e vale 48 ore.",
    btn: "Scegli la password", user: (n) => `Il tuo nome utente e' ${n}. Se il pulsante non funziona copia questo indirizzo nel browser:` },
};

// -------------------------------------------------------------- report email and PDF (EN/IT)
const listaEmail = (t) => [...new Set(String(t || "").split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
const numL = (x, l, d = 2) => x === null || x === undefined ? "-"
  : x.toLocaleString(lingua(l) === "it" ? "it-IT" : "en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
const dataL = (s, l) => {                     // "DD/MM/YYYY HH:MM" -> "YYYY-MM-DD HH:MM" in English
  if (lingua(l) === "it" || !s) return s;
  const m = /^(\d\d)\/(\d\d)\/(\d{4}) (.*)$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}` : s;
};
const REPT = {
  en: { sub: "Charging cost sharing", hello: "Hello,", intro: (t) => `the energy price for ${t} has been entered. Here is the split per card.`,
    price: "Price", card: "Card", user: "User", sess: "Sess.", kwh: "kWh", net: "Net", total: "Total", none: "No card charging sessions this month.",
    foot: (o) => `The detail of every session is in the attached PDF and on the page: ${o}`,
    noreply: "This mailbox does not receive email: please do not reply to this message.",
    subj: (t) => `Charging cost sharing ${t}`, page: (i, n) => `Page ${i} of ${n}`, summary: "Summary per card", detail: "Session detail",
    amounts: (c) => `Amounts in ${c}`, mine: "My charging", cardw: "card", year: "Year", month: "Month", charges: "Sessions",
    permonth: "Summary per month", noprice: "Price for this month not entered yet: no amounts.", nothing: "No charging sessions in the selected period." },
  it: { sub: "Ripartizione costi di ricarica", hello: "Buongiorno,", intro: (t) => `e' stato inserito il prezzo dell'energia di ${t}. Di seguito la ripartizione per tessera.`,
    price: "Prezzo", card: "Tessera", user: "Utente", sess: "Sess.", kwh: "kWh", net: "Imponibile", total: "Totale", none: "Nessuna ricarica con tessera in questo mese.",
    foot: (o) => `Il dettaglio di tutte le sessioni e' nel PDF allegato ed e' consultabile anche nella pagina: ${o}`,
    noreply: "Questa casella non riceve email: si prega di non rispondere a questo messaggio.",
    subj: (t) => `Ripartizione ricariche ${t}`, page: (i, n) => `Pagina ${i} di ${n}`, summary: "Riepilogo per tessera", detail: "Dettaglio delle sessioni",
    amounts: (c) => `Importi in ${c}`, mine: "Le mie ricariche", cardw: "tessera", year: "Anno", month: "Mese", charges: "Ricariche",
    permonth: "Riepilogo per mese", noprice: "Prezzo del mese non ancora inserito: importi non disponibili.", nothing: "Nessuna ricarica nel periodo selezionato." },
};
const taxL = (cfg, l) => cfg.tax_label || (lingua(l) === "it" ? "IVA" : "VAT");

// Minimal PDF writer (text only, Helvetica, A4, no libraries)
function creaPdf(l) {
  const pagine = [];
  let cur = null, y = 0;
  const nuova = () => { cur = []; pagine.push(cur); y = 800; };
  nuova();
  const W = (t, sz) => [...String(t)].reduce((s, c) => s + (c === "," || c === "." || c === " " ? 278 : c === "-" ? 333 : 556), 0) * sz / 1000;
  const codifica = (t) => String(t).replace(/€/g, "\x80").replace(/[^\x20-\x7e\xa0-\xff\x80]/g, "?").replace(/([()\\])/g, "\\$1");
  const testo = (x, t, sz = 9, bold = false, destra = false) => {
    const xx = destra ? x - W(t, sz) : x;
    cur.push(`BT /F${bold ? 2 : 1} ${sz} Tf ${xx.toFixed(1)} ${y.toFixed(1)} Td (${codifica(t)}) Tj ET`);
  };
  const filetto = (x1, x2, sp = 0.5) => cur.push(`${sp} w ${x1} ${(y - 3).toFixed(1)} m ${x2} ${(y - 3).toFixed(1)} l S`);
  const giu = (n = 1, h = 13) => { y -= n * h; };
  const serve = (righe) => { if (y - righe * 13 < 50) nuova(); };
  const build = () => {
    pagine.forEach((c, i) => { y = 25; cur = c; testo(555, REPT[lingua(l)].page(i + 1, pagine.length), 8, false, true); });
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
    return out;                                   // "binary" string: one character = one byte
  };
  return { testo, filetto, giu, serve, build };
}
const pdfBytes = (bin) => Uint8Array.from(bin, (c) => c.charCodeAt(0));

function pdfReportMese(r, cfg, l) {
  const T = REPT[lingua(l)], P = creaPdf(l), N = (x, d = 2) => numL(x, l, d), tx = taxL(cfg, l);
  const titolo = `${nomeMese(r.mese, l)} ${r.anno}`;
  P.testo(40, TITOLO, 13, true); P.giu(1.4);
  P.testo(40, `${T.sub} - ${titolo}`, 11, true); P.giu(1.3);
  P.testo(40, `${T.price} ${N(r.prezzo, 4)} ${cfg.currency}/kWh   ${tx} ${N(r.iva_pct, 1)}%   ${T.amounts(cfg.currency)}`, 9); P.giu(2);
  P.testo(40, T.summary, 10, true); P.giu(1.3);
  P.testo(40, T.card, 9, true); P.testo(110, T.user, 9, true);
  P.testo(330, T.sess, 9, true, true); P.testo(385, T.kwh, 9, true, true); P.testo(450, T.net, 9, true, true);
  P.testo(505, tx, 9, true, true); P.testo(555, T.total, 9, true, true); P.filetto(40, 555, 0.8); P.giu();
  for (const t of r.tessere) {
    P.serve(2);
    P.testo(40, t.tag); P.testo(110, t.nome.slice(0, 40));
    P.testo(330, String(t.n), 9, false, true); P.testo(385, N(t.kwh), 9, false, true); P.testo(450, N(t.imp), 9, false, true);
    P.testo(505, N(t.iva), 9, false, true); P.testo(555, N(t.tot), 9, false, true); P.giu();
  }
  P.filetto(40, 555); P.giu(1.1);
  P.testo(110, T.total, 9, true);
  P.testo(330, String(r.tessere.reduce((x, t) => x + t.n, 0)), 9, true, true); P.testo(385, N(r.kwh_tessere), 9, true, true);
  P.testo(450, N(r.imp_tessere), 9, true, true); P.testo(505, N(r.iva_tessere), 9, true, true); P.testo(555, N(r.tot_tessere), 9, true, true);
  P.giu(2.5);
  P.serve(4); P.testo(40, T.detail, 10, true); P.giu(1.6);
  for (const t of r.tessere) {
    P.serve(Math.min(t.sess.length, 3) + 3);
    P.testo(40, `${t.tag} - ${t.nome}`.slice(0, 60), 10, true);
    P.testo(330, `${t.n} ${T.sess}`, 9, true, true); P.testo(385, N(t.kwh), 9, true, true); P.testo(450, N(t.imp), 9, true, true);
    P.testo(505, N(t.iva), 9, true, true); P.testo(555, N(t.tot), 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    for (const x of t.sess) {
      P.serve(2);
      P.testo(55, dataL(x.inizio, l)); P.testo(150, dataL(x.fine, l));
      P.testo(385, N(x.kwh), 9, false, true); P.testo(450, N(x.imp), 9, false, true);
      P.testo(505, N(x.iva), 9, false, true); P.testo(555, N(x.tot), 9, false, true); P.giu();
    }
    P.giu(0.8);
  }
  return P.build();
}

async function mieRicariche(env, tag, anno) {
  const out = [];
  const lista = (await nomiStorici(env)).get(tag) || [];
  const cur = lista.length ? lista[lista.length - 1].nome : "";      // only what belongs to the current holder of the card
  for (let m = 1; m <= 12; m++) {
    const r = await reportMese(env, anno, m, false);
    const t = r.tessere.find((x) => x.tag === tag && x.nome === cur);
    out.push({ mese: m, nome: MESI[m - 1], prezzo: r.prezzo, iva_pct: r.iva_pct, n: t ? t.n : 0,
      kwh: t ? t.kwh : 0, imp: t ? t.imp : null, iva: t ? t.iva : null, tot: t ? t.tot : null, sess: t ? t.sess : [] });
  }
  return out;
}

function pdfMieRicariche(nome, tag, anno, mese, lista, cfg, l) {
  const T = REPT[lingua(l)], P = creaPdf(l), N = (x, d = 2) => numL(x, l, d), tx = taxL(cfg, l);
  const sel = mese ? lista.filter((x) => x.mese === mese) : lista;
  P.testo(40, TITOLO, 13, true); P.giu(1.4);
  P.testo(40, `${T.mine} - ${nome ? nome + " - " : ""}${T.cardw} ${tag}`, 11, true); P.giu(1.3);
  P.testo(40, mese ? `${nomeMese(mese, l)} ${anno}` : `${T.year} ${anno}`, 9); P.giu(2);
  if (!mese) {
    P.testo(40, T.permonth, 10, true); P.giu(1.3);
    P.testo(40, T.month, 9, true); P.testo(220, T.charges, 9, true, true); P.testo(285, T.kwh, 9, true, true);
    P.testo(345, `${cfg.currency}/kWh`, 9, true, true); P.testo(420, T.net, 9, true, true); P.testo(485, tx, 9, true, true);
    P.testo(555, T.total, 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    let k = 0, tt = 0, ok = false, nn = 0;
    for (const x of sel) {
      P.serve(2);
      P.testo(40, nomeMese(x.mese, l)); P.testo(220, String(x.n), 9, false, true); P.testo(285, N(x.kwh), 9, false, true);
      P.testo(345, x.prezzo === null ? "-" : N(x.prezzo, 4), 9, false, true);
      P.testo(420, N(x.imp), 9, false, true); P.testo(485, N(x.iva), 9, false, true); P.testo(555, N(x.tot), 9, false, true);
      P.giu(); k += x.kwh; nn += x.n; if (x.tot !== null) { tt += x.tot; ok = true; }
    }
    P.filetto(40, 555); P.giu(1.1);
    P.testo(40, T.total, 9, true); P.testo(220, String(nn), 9, true, true); P.testo(285, N(k), 9, true, true);
    P.testo(555, ok ? N(Math.round(tt * 100) / 100) : "-", 9, true, true);
    P.giu(2.5);
  }
  P.serve(4); P.testo(40, T.detail, 10, true); P.giu(1.6);
  let nessuna = true;
  for (const x of sel) {
    if (!x.n) continue;
    nessuna = false;
    P.serve(Math.min(x.sess.length, 3) + 3);
    P.testo(40, `${nomeMese(x.mese, l)} ${anno}`, 10, true);
    P.testo(330, `${x.n} ${T.sess}`, 9, true, true); P.testo(385, N(x.kwh), 9, true, true); P.testo(450, N(x.imp), 9, true, true);
    P.testo(505, N(x.iva), 9, true, true); P.testo(555, N(x.tot), 9, true, true); P.filetto(40, 555, 0.8); P.giu();
    for (const s of x.sess) {
      P.serve(2);
      P.testo(55, dataL(s.inizio, l)); P.testo(150, dataL(s.fine, l));
      P.testo(385, N(s.kwh), 9, false, true); P.testo(450, N(s.imp), 9, false, true);
      P.testo(505, N(s.iva), 9, false, true); P.testo(555, N(s.tot), 9, false, true); P.giu();
    }
    P.testo(55, x.prezzo === null ? T.noprice : `${T.price} ${N(x.prezzo, 4)} ${cfg.currency}/kWh - ${tx} ${N(x.iva_pct, 1)}%`, 8); P.giu();
    P.giu(0.8);
  }
  if (nessuna) { P.testo(40, T.nothing, 9); P.giu(); }
  return P.build();
}

// Email the monthly split (with the PDF) to the report recipients set in Settings
async function inviaReportPrezzo(env, cfg, anno, mese, origin, l) {
  const a = listaEmail(cfg.report_to), cc = listaEmail(cfg.report_cc);
  if (!a.length) return "no_recipients";
  const T = REPT[lingua(l)], tx = taxL(cfg, l), N = (x, d = 2) => numL(x, l, d);
  const r = await reportMese(env, anno, mese, false);
  const titolo = `${nomeMese(mese, l)} ${anno}`;
  const td = (v, n) => `<td style="padding:5px 8px;border-bottom:1px solid #ddd;${n ? "text-align:right;white-space:nowrap" : ""}">${v}</td>`;
  const th = (v, n) => `<th style="padding:5px 8px;border-bottom:2px solid #333;text-align:${n ? "right" : "left"}">${v}</th>`;
  let righe = "";
  for (const t of r.tessere)
    righe += `<tr>${td(esc(t.tag))}${td(esc(t.nome))}${td(t.n, 1)}${td(N(t.kwh), 1)}${td(N(t.imp), 1)}${td(N(t.iva), 1)}${td(N(t.tot), 1)}</tr>`;
  if (!r.tessere.length) righe = `<tr><td colspan="7" style="padding:8px"><i>${T.none}</i></td></tr>`;
  const n = r.tessere.reduce((x, t) => x + t.n, 0);
  const html = `<div style="font-family:Arial,sans-serif;max-width:720px">` +
    `<h2 style="margin:0 0 4px">${esc(TITOLO)}</h2>` +
    `<p style="color:#555;margin:0 0 16px">${T.sub} - ${esc(titolo)}</p>` +
    `<p>${T.hello}<br>${T.intro(esc(titolo))}</p>` +
    `<p>${T.price}: <b>${N(r.prezzo, 4)} ${esc(cfg.currency)}/kWh</b> - ${esc(tx)}: <b>${N(r.iva_pct, 1)}%</b></p>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px"><tr>${th(T.card)}${th(T.user)}${th(T.sess, 1)}${th(T.kwh, 1)}${th(T.net, 1)}${th(esc(tx), 1)}${th(T.total, 1)}</tr>${righe}` +
    `<tr style="font-weight:bold">${td("")}${td(T.total)}${td(n, 1)}${td(N(r.kwh_tessere), 1)}${td(N(r.imp_tessere), 1)}${td(N(r.iva_tessere), 1)}${td(N(r.tot_tessere), 1)}</tr></table>` +
    `<p style="color:#555;font-size:13px">${T.amounts(esc(cfg.currency))}. ${T.foot(esc(origin))}</p>` +
    `<p style="color:#555;font-size:13px"><b>${T.noreply}</b></p></div>`;
  let allegati;
  try { allegati = [{ filename: `charging_${anno}-${p2(mese)}.pdf`, content: btoa(pdfReportMese(r, cfg, l)) }]; }
  catch (_) { allegati = undefined; }          // if the PDF fails, the email is sent anyway
  return inviaMail(cfg, a, `${T.subj(titolo)} - ${TITOLO}`, html, cc, allegati);
}

// Full SQL dump of the database (admin only). Restore: npx wrangler d1 execute <db> --remote --file=<file>
async function backupSql(env) {
  const q1 = (v) => v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  let out = `-- Backup ${TITOLO} - ${new Date().toISOString()}\n-- Contains saved secrets (charger password, Resend key): keep it private.\n` +
    "-- Restore: npx wrangler d1 execute <database> --remote --file=<this file>\n";
  for (const t of ["sessioni", "tessere", "tessere_nomi", "prezzi", "meta", "utenti"]) {
    const def = await env.DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").bind(t).first();
    if (!def) continue;
    out += def.sql.replace(/^CREATE TABLE\s+(IF NOT EXISTS\s+)?/i, "CREATE TABLE IF NOT EXISTS ") + ";\n";
    for (const r of (await env.DB.prepare("SELECT * FROM " + t).all()).results) {
      if (t === "meta" && r.chiave === "chiave_sessioni") continue;   // regenerated automatically
      const cols = Object.keys(r);
      out += `INSERT OR REPLACE INTO ${t} (${cols.join(", ")}) VALUES (${cols.map((c) => q1(r[c])).join(", ")});\n`;
    }
  }
  return out;
}

function leggiPermessi(b) {
  return JSON.stringify(Object.fromEntries(PERMESSI.map((k) => [k, b && b[k] ? 1 : 0])));
}

async function gestisciUtenti(env, me, b, origin, cfg) {
  const M = MAILT[b.lang === "it" ? "it" : "en"];
  const nome = String(b.nome || "").trim().toLowerCase();
  if (b.azione === "invita") {
    if (!EMAIL_OK.test(nome)) return err("bad_email", "Invalid email address");
    const es = await env.DB.prepare("SELECT nome, ruolo FROM utenti WHERE nome=?").bind(nome).first();
    if (es && es.ruolo === "admin") return err("is_admin", "This user is the admin");
    let tess = null, nomeTess = "";
    if (b.tessera) {
      const t = await env.DB.prepare("SELECT tag, nome FROM tessere WHERE tag=?").bind(String(b.tessera).toUpperCase()).first();
      if (!t) return err("card_not_found", "Card not found: download from the charger first");
      tess = t.tag; nomeTess = t.nome;
    }
    const tok = hex(crypto.getRandomValues(new Uint8Array(32)));
    const exp = Math.floor(Date.now() / 1000) + DURATA_INVITO;
    if (es) {
      await env.DB.prepare("UPDATE utenti SET invito_hash=?, invito_exp=?, permessi=?, tessera=? WHERE nome=?")
        .bind(await sha256(tok), exp, leggiPermessi(b.permessi), tess, nome).run();
    } else {
      await env.DB.prepare("INSERT INTO utenti (nome, salt, hash, ruolo, permessi, invito_hash, invito_exp, tessera) VALUES (?,?,?,?,?,?,?,?)")
        .bind(nome, "", "", "utente", leggiPermessi(b.permessi), await sha256(tok), exp, tess).run();
    }
    const link = `${origin}/?invito=${tok}&e=${encodeURIComponent(nome)}`;
    const cosa = tess ? M.own(esc(nomeTess), esc(tess)) : M.all;
    const mail = await inviaMail(cfg, nome, `${M.subj} ${TITOLO}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px">` +
      `<h2 style="margin:0 0 4px">${esc(TITOLO)}</h2><p style="color:#555;margin:0 0 16px">${M.sub}</p>` +
      `<p>${M.hello}</p><p>${cosa}</p><p>${M.pick}</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#0b6bcb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${M.btn}</a></p>` +
      `<p style="color:#555;font-size:13px">${M.user(esc(nome))}<br>${link}</p></div>`);
    return json({ ok: true, mail, link: mail === "sent" ? undefined : link });
  }
  if (b.azione === "permessi") {
    let tess = null;
    if (b.tessera) {
      const t = await env.DB.prepare("SELECT tag FROM tessere WHERE tag=?").bind(String(b.tessera).toUpperCase()).first();
      if (!t) return err("card_not_found", "Card not found");
      tess = t.tag;
    }
    const r = await env.DB.prepare("UPDATE utenti SET permessi=?, tessera=? WHERE nome=? AND ruolo<>'admin'").bind(leggiPermessi(b.permessi), tess, nome).run();
    return r.meta.changes ? json({ ok: true }) : err("user_not_found", "User not found", 404);
  }
  if (b.azione === "elimina") {
    const es = await env.DB.prepare("SELECT ruolo FROM utenti WHERE nome=?").bind(nome).first();
    if (!es) return err("user_not_found", "User not found", 404);
    if (es.ruolo === "admin") return err("cant_delete_admin", "The admin cannot be deleted");
    await env.DB.prepare("DELETE FROM utenti WHERE nome=?").bind(nome).run();
    return json({ ok: true });
  }
  return err("bad_action", "Invalid action");
}

async function accettaInvito(req, env) {
  const b = await req.json();
  const nome = String(b.nome || "").trim().toLowerCase(), pw = String(b.password || "");
  await preparaTabelle(env);
  if (pw.length < 8) return err("pw_short", "The password must be at least 8 characters");
  const u = await env.DB.prepare("SELECT nome, invito_hash, invito_exp FROM utenti WHERE nome=?").bind(nome).first();
  if (!u || !u.invito_hash || u.invito_exp < Date.now() / 1000 || !uguali(u.invito_hash, await sha256(String(b.token || ""))))
    return err("invite_invalid", "Invalid or expired link: ask for a new invitation");
  const c = await nuovaCredenziale(pw);
  await env.DB.prepare("UPDATE utenti SET salt=?, hash=?, invito_hash=NULL, invito_exp=NULL WHERE nome=?").bind(c.salt, c.hash, nome).run();
  const r = json({ ok: true });
  r.headers.append("set-cookie", cookie(await creaToken(env, { nome, hash: c.hash }), DURATA_SESSIONE));
  return r;
}

// -------------------------------------------------------------- first-run setup
async function setupAperto(env) {              // true until an administrator exists (and APP_PASSWORD is not used)
  await preparaTabelle(env);
  if (env.APP_PASSWORD) return false;
  return (await env.DB.prepare("SELECT COUNT(*) n FROM utenti WHERE ruolo='admin'").first()).n === 0;
}
const codiceSbagliato = (env, b) =>
  env.SETUP_CODE && !uguali(String(b.code || ""), String(env.SETUP_CODE)) ? err("setup_code", "Wrong setup code", 403) : null;

async function eseguiSetup(req, env, cfg) {
  const b = await req.json();
  const no = codiceSbagliato(env, b);
  if (no) return no;
  const nome = String(b.nome || "").trim().toLowerCase();
  if (!/^\S{1,64}$/.test(nome)) return err("bad_name", "Invalid user name");
  const pw = String(b.password_admin || "");
  if (pw.length < 8) return err("pw_short", "The password must be at least 8 characters");
  const nuova = pulisciConfig(b, cfg);
  const c = await nuovaCredenziale(pw);
  // atomic: only inserts if there is still no administrator
  const r = await env.DB.prepare("INSERT INTO utenti (nome, salt, hash, ruolo) SELECT ?, ?, ?, 'admin' WHERE NOT EXISTS (SELECT 1 FROM utenti WHERE ruolo='admin')")
    .bind(nome, c.salt, c.hash).run();
  if (!r.meta.changes) return err("setup_done", "Setup already completed", 409);
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('config', ?)").bind(JSON.stringify(nuova)).run();
  const out = json({ ok: true });
  out.headers.append("set-cookie", cookie(await creaToken(env, { nome, hash: c.hash }), DURATA_SESSIONE));
  return out;
}

const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// -------------------------------------------------------------- OCPP (live connection from the charger, optional)
const colonnina = (env) => (env.COLONNINA ? env.COLONNINA.get(env.COLONNINA.idFromName("colonnina")) : null);
async function statoLive(env) { return await (await colonnina(env).fetch("https://do/stato")).json(); }
async function tokenOcpp(env, rigenera = false) {         // secret part of the address the charger connects to
  let r = rigenera ? null : await env.DB.prepare("SELECT valore FROM meta WHERE chiave='ocpp_token'").first();
  if (r) return r.valore;
  const v = hex(crypto.getRandomValues(new Uint8Array(16)));
  await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('ocpp_token', ?)").bind(v).run();
  return v;
}
async function ocppConnessione(req, env, url) {           // /ocpp/<token>/<charger-id>
  const [, , token, sigla] = url.pathname.split("/");
  if (req.headers.get("upgrade") !== "websocket") return new Response("Upgrade Required", { status: 426 });
  if (!env.COLONNINA || !sigla || !/^[A-Za-z0-9._-]{1,40}$/.test(sigla) || !uguali(token || "", await tokenOcpp(env)))
    return new Response("Not found", { status: 404 });
  return await colonnina(env).fetch(req);
}
const OCPP_CMD = ["GetConfiguration", "GetLocalListVersion", "TriggerMessage", "RemoteStopTransaction", "Reset"];
const OCPP_TRIGGER = ["MeterValues", "StatusNotification", "Heartbeat", "DiagnosticsStatusNotification", "FirmwareStatusNotification"];

const pagina = (h) => h.replaceAll("__I18N__", () => I18N).replaceAll("__TITLE__", () => escHtml(TITOLO));

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.protocol === "http:" && !u.pathname.startsWith("/ocpp/") && !["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)) {
      u.protocol = "https:";
      return Response.redirect(u.toString(), 301);
    }
    const r = await this.gestisci(req, env, ctx);
    const out = new Response(r.body, r);
    if (u.protocol === "https:") out.headers.set("strict-transport-security", "max-age=31536000");
    out.headers.set("x-frame-options", "DENY");                       // never inside someone else's iframe
    out.headers.set("content-security-policy", "frame-ancestors 'none'");
    out.headers.set("x-content-type-options", "nosniff");
    out.headers.set("referrer-policy", "no-referrer");               // invitation links never leak through Referer
    return out;
  },

  async gestisci(req, env) {
    const url = new URL(req.url);
    const q = url.searchParams;
    try {
      if (url.pathname.startsWith("/ocpp/")) return await ocppConnessione(req, env, url);
      const cfg = await leggiConfig(env);
      if (await setupAperto(env)) {
        const html = (h) => new Response(pagina(h), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
        if (url.pathname === "/" && req.method === "GET") return html(SETUP);
        if (url.pathname === "/api/setup" && req.method === "GET") return json({ code_required: !!env.SETUP_CODE });
        if (url.pathname === "/api/setup" && req.method === "POST") return await eseguiSetup(req, env, cfg);
        if (url.pathname === "/api/setup/test" && req.method === "POST") {
          const b = await req.json();
          return codiceSbagliato(env, b) || json(await provaColonnina(pulisciConfig(b, cfg)));
        }
        return err("setup_required", "Setup not completed: open the home page", 403);
      }
      if (url.pathname === "/api/setup" && req.method === "GET") return json({ done: true });
      if (url.pathname === "/api/login" && req.method === "POST") return await login(req, env);
      if (url.pathname === "/api/invito" && req.method === "POST") return await accettaInvito(req, env);
      if (url.pathname === "/" && req.method === "GET" && q.get("invito"))
        return new Response(pagina(INVITO), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      const me = await utenteCorrente(req, env);
      if (!me) {
        if (url.pathname === "/" && req.method === "GET")
          return new Response(pagina(LOGIN), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
        return json({ errore: "login" }, 401);
      }
      const P = me.perm, ris = P.app;               // ricariche senza tessera: solo con il permesso "app" (l'admin ce l'ha)
      const nega = () => err("forbidden", "You do not have permission for this operation", 403);
      if (url.pathname === "/api/logout" && req.method === "POST") {
        // the session is also cancelled on the server, not only by deleting the cookie
        const pp = leggiToken(req);
        await env.DB.prepare("DELETE FROM revocati WHERE exp < ?").bind(Math.floor(Date.now() / 1000)).run();
        if (pp.length === 4) await env.DB.prepare("INSERT OR REPLACE INTO revocati (sig, exp) VALUES (?, ?)").bind(pp[3], +pp[1]).run();
        const r = json({ ok: true });
        r.headers.append("set-cookie", cookie("", 0) + "; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
        r.headers.set("clear-site-data", '"cookies"');
        return r;
      }
      if (url.pathname === "/api/me") {
        const t = me.tessera ? await env.DB.prepare("SELECT tag, nome FROM tessere WHERE tag=?").bind(me.tessera).first() : null;
        return json({ nome: me.nome, ruolo: me.ruolo, perm: P, titolo: TITOLO, valuta: cfg.currency, tax_label: cfg.tax_label, tz: TZ, tessera: t || (me.tessera ? { tag: me.tessera, nome: "" } : null) });
      }
      if (url.pathname === "/api/utenti") {
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        if (req.method === "GET")
          return json((await env.DB.prepare(
            "SELECT u.nome, u.ruolo, u.permessi, u.hash, u.invito_exp, u.tessera, t.nome AS tessera_nome " +
            "FROM utenti u LEFT JOIN tessere t ON t.tag = u.tessera ORDER BY u.ruolo, u.nome").all()).results
            .map((u) => ({ nome: u.nome, ruolo: u.ruolo, perm: permessiDi(u), attivo: !!u.hash,
              tessera: u.tessera, tessera_nome: u.tessera_nome,
              invito_scaduto: !u.hash && u.invito_exp < Date.now() / 1000 })));
        if (req.method === "POST") return await gestisciUtenti(env, me, await req.json(), url.origin, cfg);
      }
      if (url.pathname === "/api/config") {
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        if (req.method === "POST") {
          const nuova = pulisciConfig(await req.json(), cfg);
          await env.DB.prepare("INSERT OR REPLACE INTO meta VALUES ('config', ?)").bind(JSON.stringify(nuova)).run();
          await leggiConfig(env);
          return json({ ok: true });
        }
        return json({ config: configPubblica(cfg), defaults: configPubblica(CFG_DEFAULTS),
          fonti: { url_env: !!env.CHARGER_URL, password_env: !!env.CHARGER_PASSWORD } });
      }
      if (url.pathname === "/api/config/test" && req.method === "POST") {
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        return json(await provaColonnina(pulisciConfig(await req.json(), cfg)));
      }
      if (url.pathname === "/api/tessere") {
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        return json((await env.DB.prepare("SELECT tag, nome FROM tessere ORDER BY nome").all()).results);
      }
      if (url.pathname === "/api/rfid") {              // card list on the charger (administrator)
        if (me.ruolo !== "admin") return nega();
        const c = await leggiConfig(env), per = rfidPercorsi(c);
        if (!per) return err("rfid_unsupported", "Managing cards needs the charger URL and a card list path containing level=file (Settings tab)", 501);
        let prima;
        try { prima = await rfidDallaColonnina(c, per); }
        catch (e) { return err("rfid_unreachable", "Charger not reachable: " + (e.message || e), 502); }
        const bk = await env.DB.prepare("SELECT valore FROM meta WHERE chiave='rfid_backup'").first();
        const backup = bk ? JSON.parse(bk.valore) : null;
        if (req.method === "GET") {
          const db = new Map((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
          return json({ lista: prima.map((x) => ({ ...x, nome_completo: x.id && db.has(x.id) && norm(db.get(x.id)).startsWith(norm(x.nome)) ? db.get(x.id) : x.nome })),
            backup: backup ? { quando: backup.quando, n: backup.lista.length } : null });
        }
        if (req.method !== "POST") return err("method", "Method not allowed", 405);
        const b = await req.json();
        let dopo = prima.map((x) => ({ ...x }));
        const id = rfidId(b.id), nome = rfidNome(b.nome), scad = String(b.scad || "").trim(), stato = rfidStato(b.stato ?? "0");
        const controlla = () => {
          if (!RFID_ID_OK.test(id)) return ["rfid_bad_id", "Invalid card code (digits and letters A-F only, 4 to 20 characters)"];
          if (!nome) return ["rfid_bad_name", "Enter the name"];
          if (nome.length > RFID_NOME_MAX) return ["rfid_name_long", "Name too long (maximum 25 characters)"];
          if (!RFID_SCAD_OK.test(scad)) return ["rfid_bad_expiry", "Invalid expiry"];
          if (stato === null) return ["rfid_bad_state", "Invalid state"];
          return null;
        };
        if (b.azione === "aggiungi" || b.azione === "modifica") {
          const e = controlla();
          if (e) return err(e[0], e[1]);
          const es = dopo.find((x) => x.id === id);
          if (b.azione === "aggiungi") {
            if (es) return err("rfid_exists", "Card already present");
            dopo.push({ id, scad, nome, stato });
          } else {
            if (!es) return err("rfid_missing", "Card not found", 404);
            Object.assign(es, { nome, scad, stato });
          }
        } else if (b.azione === "ripara") {                // a line the charger kept without a readable code
          const x = dopo[+b.indice];
          if (!x || x.id) return err("rfid_missing", "Card not found", 404);
          const e = controlla();
          if (e) return err(e[0], e[1]);
          if (dopo.some((y) => y.id === id)) return err("rfid_exists", "Card already present");
          Object.assign(x, { id, nome, scad, stato });
        } else if (b.azione === "elimina") {
          const i = id ? dopo.findIndex((x) => x.id === id) : (dopo[+b.indice] && !dopo[+b.indice].id ? +b.indice : -1);
          if (i < 0) return err("rfid_missing", "Card not found", 404);
          dopo.splice(i, 1);
        } else if (b.azione === "ripristina") {
          if (!backup) return err("rfid_no_backup", "No previous copy", 400);
          dopo = backup.lista;
        } else return err("bad_cmd", "Unknown action");
        try {
          const r = await rfidScrivi(env, c, per, prima, dopo);
          const dal = String(b.dal || "").match(/^(\d{4})-(\d\d)-(\d\d)$/);
          if (b.azione === "aggiungi" && dal) {              // card handed over on a given day: the holder starts that day
            await env.DB.prepare("UPDATE tessere_nomi SET dal=? WHERE tag=? AND dal=(SELECT MAX(dal) FROM tessere_nomi WHERE tag=?) AND al IS NULL")
              .bind(epochDaLocale(+dal[1], +dal[2], +dal[3]), id, id).run().catch(() => {});
            storiaCache = { t: 0, m: null };
          }
          if (b.azione === "elimina" && id) {                // card removed: close the holder's period now
            await syncNomi(env);
            await env.DB.prepare("UPDATE tessere_nomi SET al=? WHERE tag=? AND dal=(SELECT MAX(dal) FROM tessere_nomi WHERE tag=?) AND al IS NULL")
              .bind(Math.floor(Date.now() / 1000), id, id).run();
            storiaCache = { t: 0, m: null };
          }
          return json({ ok: r.ok, lista: r.lista, avviso: r.ok ? null : "rfid_mismatch" });
        } catch (e) {
          return err("rfid_write_failed", "Writing to the charger failed: " + (e.message || e), 502);
        }
      }
      if (url.pathname === "/api/mie") {                 // le ricariche dell'utente della colonnina (solo la sua tessera)
        if (!me.tessera) return nega();
        return json(await mieRicariche(env, me.tessera, +q.get("anno") || new Date().getUTCFullYear()));
      }
      if (url.pathname === "/api/mie.pdf") {             // PDF of the user's own sessions (one month or the whole year)
        if (!me.tessera) return nega();
        const anno = +q.get("anno") || new Date().getUTCFullYear();
        const mese = Math.min(12, Math.max(0, +q.get("mese") || 0));
        const l = q.get("lang");
        const t = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(me.tessera).first();
        const bin = pdfMieRicariche(t ? t.nome : "", me.tessera, anno, mese, await mieRicariche(env, me.tessera, anno), cfg, l);
        return new Response(pdfBytes(bin), { headers: { "content-type": "application/pdf", "cache-control": "no-store",
          "content-disposition": `attachment; filename="charging_${me.tessera}_${anno}${mese ? "-" + p2(mese) : ""}.pdf"` } });
      }
      if (url.pathname === "/api/backup") {
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        return new Response(await backupSql(env), { headers: { "content-type": "application/sql; charset=utf-8", "cache-control": "no-store",
          "content-disposition": `attachment; filename="backup_${new Date().toISOString().slice(0, 10)}.sql"` } });
      }
      if (url.pathname === "/api/reinvia" && req.method === "POST") {   // send the monthly report email again
        if (me.ruolo !== "admin") return err("unauthorized", "Not authorized", 403);
        const b = await req.json();
        const anno = +b.anno, mese = +b.mese;
        const es = await env.DB.prepare("SELECT 1 FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).first();
        if (!es) return err("no_price", "Price not entered yet");
        return json({ ok: true, mail: await inviaReportPrezzo(env, cfg, anno, mese, url.origin, b.lang) });
      }
      if (url.pathname === "/api/miapassword" && req.method === "POST") {
        const b = await req.json();
        if (String(b.nuova || "").length < 8) return err("pw_short", "The password must be at least 8 characters");
        if (b.ripeti !== b.nuova) return err("pw_mismatch", "The two new passwords do not match");
        const u = await verificaLogin(env, me.nome, String(b.vecchia || ""));
        if (!u) return err("pw_wrong", "Current password is wrong");
        const c = await nuovaCredenziale(String(b.nuova));
        await env.DB.prepare("UPDATE utenti SET salt=?, hash=? WHERE nome=?").bind(c.salt, c.hash, me.nome).run();
        const r = json({ ok: true });
        r.headers.append("set-cookie", cookie(await creaToken(env, { nome: me.nome, hash: c.hash }), DURATA_SESSIONE));
        return r;
      }
      if (url.pathname === "/" && req.method === "GET") {
        return new Response(pagina(HTML), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      }
      if (url.pathname === "/api/stato") return json(await statoArchivio(env));
      if (url.pathname === "/api/report") {
        if (!P.report) return nega();
        const oggi = new Date();
        return json(await reportMese(env, +q.get("anno") || oggi.getUTCFullYear(), +q.get("mese") || oggi.getUTCMonth() + 1, ris));
      }
      if (url.pathname === "/api/storico") { if (!P.storico) return nega(); }
      if (url.pathname === "/api/storico") return json(await storicoAnno(env, +q.get("anno") || new Date().getUTCFullYear(), ris));
      if (url.pathname === "/api/live") {
        if (!env.COLONNINA) return json({ attivo: false });
        const live = await statoLive(env);
        const tx = live.transazione_aperta, pr = live.prese && live.prese["1"];
        const out = { attivo: true, connessa: live.connessa, stato: pr ? pr.status : null, occupata: !!live.occupata };
        const mia = tx && me.tessera && me.tessera === tx.tag;
        if (tx && (P.live || mia)) {
          const t = await env.DB.prepare("SELECT nome FROM tessere WHERE tag=?").bind(tx.tag).first();
          out.da = t ? t.nome : "";
          const m = live.meter && live.meter.tx === tx.id ? live.meter : null, d = m ? m.dati : {};
          const num = (k, div) => {
            const x = d[k];
            if (!x) return null;
            const v = parseFloat(x.v);
            return isNaN(v) ? null : v / (/^k/i.test(x.u) ? 1 : div);
          };
          const e = d["Energy.Active.Import.Register"], wh = e ? parseFloat(e.v) * (/^k/i.test(e.u) ? 1000 : 1) : null;
          out.dettagli = { tag: tx.tag, inizio: tx.inizio, kw: num("Power.Active.Import", 1000),
            a: num("Current.Import", 1) ?? num("Current.Import.L1", 1), v: num("Voltage", 1),
            kwh: wh != null && tx.meter_ini != null ? (wh - tx.meter_ini) / 1000 : null, agg: m ? m.ts : null };
        }
        return json(out);
      }
      if (url.pathname === "/api/ocpp") {
        if (me.ruolo !== "admin") return nega();
        if (!env.COLONNINA) return err("no_ocpp", "OCPP is not enabled: add the Durable Object binding shown in wrangler.toml.example and deploy again", 501);
        if (req.method === "POST") {
          const b = await req.json();
          if (b.azione === "rigenera") await tokenOcpp(env, true);
          if (b.azione === "comando") {
            if (!OCPP_CMD.includes(b.comando)) return err("bad_cmd", "Command not allowed");
            let payload = {};
            if (b.comando === "TriggerMessage") {
              if (!OCPP_TRIGGER.includes(b.richiesta)) return err("bad_cmd", "Command not allowed");
              payload = { requestedMessage: b.richiesta, ...(b.richiesta === "Heartbeat" ? {} : { connectorId: 1 }) };
            } else if (b.comando === "RemoteStopTransaction" || b.comando === "Reset") {
              const st = await statoLive(env);
              if (b.comando === "RemoteStopTransaction") {
                if (!st.transazione_aperta) return err("no_tx", "No charging session to stop");
                payload = { transactionId: st.transazione_aperta.id };
              } else {
                if (st.occupata) return err("ocpp_busy", "The charger is in use: restart not allowed");
                payload = { type: "Soft" };
              }
            }
            const r = await colonnina(env).fetch("https://do/comando", { method: "POST", body: JSON.stringify({ azione: b.comando, payload }) });
            return json(await r.json());
          }
        }
        return json({ ...(await statoLive(env)), host: url.host, percorso: `/ocpp/${await tokenOcpp(env)}/CHARGER` });
      }
      if (url.pathname === "/api/nomi") {
        if (me.ruolo !== "admin") return nega();
        await syncNomi(env);
        const data = (e) => {
          if (e == null) return "";
          const d = new Date((e + offsetTz(e)) * 1000);
          return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
        };
        if (req.method === "GET")
          return json((await env.DB.prepare("SELECT tag, nome, dal, al FROM tessere_nomi ORDER BY nome, dal").all()).results
            .map((x) => ({ ...x, dal_txt: data(x.dal), al_txt: data(x.al) })));
        if (req.method !== "POST") return err("method", "Method not allowed", 405);
        const b = await req.json();
        const giorno = (t) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(String(t || "").trim()); return m ? epochDaLocale(+m[1], +m[2], +m[3]) : null; };
        try {
          if (b.azione === "assegna") {                    // hand the card to someone from a date: closes the open period
            const tag = String(b.tag || "").toUpperCase(), nome = String(b.nome || "").trim().slice(0, 80), dal = giorno(b.dal);
            if (!tag || !nome) return err("bad_card", "Card and name are required");
            if (dal === null) return err("bad_date", "Invalid date");
            const ult = await env.DB.prepare("SELECT dal, al FROM tessere_nomi WHERE tag=? ORDER BY dal DESC LIMIT 1").bind(tag).first();
            if (ult && dal <= ult.dal) return err("bad_period", "The new assignment must start after the previous one");
            const st = [];
            if (ult && ult.al == null) st.push(env.DB.prepare("UPDATE tessere_nomi SET al=?, man=1 WHERE tag=? AND dal=?").bind(dal, tag, ult.dal));
            st.push(env.DB.prepare("INSERT INTO tessere_nomi (tag, nome, dal, man) VALUES (?,?,?,1)").bind(tag, nome, dal));
            await env.DB.batch(st);
          } else {                                         // edit the dates of an existing period
            const nd = giorno(b.nuovo_dal), na = b.nuovo_al ? giorno(b.nuovo_al) : null;
            if (nd === null || (b.nuovo_al && na === null)) return err("bad_date", "Invalid date");
            if (na !== null && na <= nd) return err("bad_period", "The end date must be after the start date");
            await env.DB.prepare("UPDATE tessere_nomi SET dal=?, al=?, man=1 WHERE tag=? AND dal=?").bind(nd, na, String(b.tag), +b.dal).run();
          }
        } catch (_) {
          return err("dup_period", "A period with that start date already exists");
        }
        storiaCache = { t: 0, m: null };
        return json({ ok: true });
      }
      if (url.pathname === "/api/sessioni") {
        if (!P.sessioni) return nega();
        const storia = await nomiStorici(env);
        const prz = new Map((await env.DB.prepare("SELECT anno, mese, eur_kwh, iva FROM prezzi").all()).results.map((p) => [p.anno * 100 + p.mese, p]));
        const r = (await env.DB.prepare("SELECT inizio_utc, fine_utc, tag, tag_tipo, energia_wh FROM sessioni ORDER BY inizio_utc DESC").all()).results
          .filter((s) => ris || !(s.tag === "" || s.tag_tipo === "app"));
        const gruppi = new Map();                       // stessa tessera (o app) e stesso mese
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
          tag: s.tag || "(app)", nome: s.tag ? (nomeAl(storia, s.tag, s.inizio_utc) || "") : "", kwh: s.energia_wh / 1000,
          imp: s.costo.imp, iva: s.costo.iva, tot: s.costo.tot })));
      }
      if (req.method === "POST") {
        if (url.pathname === "/api/prezzo") {
          if (!P.prezzo) return nega();
          const b = await req.json();
          const anno = +b.anno, mese = +b.mese;
          if (!(mese >= 1 && mese <= 12) || !(anno >= 2020 && anno <= 2100)) return err("bad_period", "Invalid month/year");
          const es = await env.DB.prepare("SELECT 1 FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).first();
          if (es && prezzoBloccato(anno, mese))
            return err("price_locked", `Price locked: the month has been closed since ${dataBlocco(anno, mese)} and can no longer be changed`, 423, { d: dataBlocco(anno, mese) });
          if (b.prezzo === null || b.prezzo === "") {
            await env.DB.prepare("DELETE FROM prezzi WHERE anno=? AND mese=?").bind(anno, mese).run();
          } else {
            const p = +b.prezzo, i = +b.iva || 0;
            if (!(p > 0 && p < 5) || !(i >= 0 && i <= 100)) return err("bad_price", "Invalid price or tax");
            await env.DB.prepare("INSERT OR REPLACE INTO prezzi VALUES (?,?,?,?)").bind(anno, mese, p, i).run();
            return json({ ok: true, mail: await inviaReportPrezzo(env, cfg, anno, mese, url.origin, b.lang) });
          }
          return json({ ok: true });
        }
        if (["/api/scarica", "/api/ingest", "/api/importa"].includes(url.pathname) && !P.scarica) return nega();
        if (url.pathname === "/api/scarica") {
          try { return json({ ok: true, ...(await scarica(env, cfg)) }); }
          catch (e) { return json({ ok: false, errore: String(e.message || e) }, 502); }
        }
        if (url.pathname === "/api/ingest") {          // per chi spinge i dati da fuori (vedi README)
          const b = await req.json();
          return json({ ok: true, ...(await salvaScarico(env, cfg, b.storico, b.tessere || null)) });
        }
        if (url.pathname === "/api/importa") {
          const b = await req.json();
          try { return json({ ok: true, ...(await importaCsv(env, b.nome, b.csv)) }); }
          catch (e) { return json({ ok: false, file: b.nome, errore: String(e.message || e), codice: e.codice, par: e.par }, 400); }
        }
      }
      return err("not_found", "Not found", 404);
    } catch (e) {
      return e.codice ? err(e.codice, String(e.message), 400, e.par) : json({ errore: String(e.message || e) }, 500);
    }
  },

  async scheduled(_ev, env, ctx) {
    ctx.waitUntil((async () => {
      const cfg = await leggiConfig(env);
      if (cfg.auto && cfg.url) await scarica(env, cfg).catch(() => { /* the error is saved in meta */ });
    })());
  },
};

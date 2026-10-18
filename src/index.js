// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Alessandro Pomponi. This program is free software under the GNU Affero General Public License v3 or later; see LICENSE.
// Orbis Charge Report - Cloudflare Worker (API + pages + scheduled download from the charger)
// Note: internal identifiers are in Italian (historical); user-facing text is in EN/IT.
import { HTML, LOGIN, INVITO, SETUP, I18N } from "./ui.js";

let TITOLO = "EV Charger";            // site title (from settings)
let TZ = "Europe/Rome";                // time zone used for months, reports and the price lock (from settings)
const MESI = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

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

// -------------------------------------------------------------- accesso ai dati
async function reportMese(env, anno, mese, riservato = false) {
  const [ini, fin] = intervalloMese(anno, mese);
  const nomi = Object.fromEntries(
    (await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
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
      const d = (perTag[s.tag] ||= { tag: s.tag, nome: nomi[s.tag] || "", n: 0, wh: 0, sess: [] });
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
};
const CFG_NUM = ["timeout", "hist_skip", "c_start", "c_tag", "c_type", "c_cont_ini", "c_end", "c_cont_fin", "tags_skip", "tags_c_tag", "tags_c_name"];
const CFG_STR = ["title", "url", "user", "password", "header_name", "header_value", "history_path", "tags_path",
  "hist_json_field", "hist_sep", "tags_sep", "tz", "currency", "tax_label", "resend_key", "mail_from"];

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

async function salvaScarico(env, c, testoStorico, testoTessere) {
  const { righe, scartate } = parseStorico(testoStorico, c);
  const nuove = await inserisciSessioni(env, righe);
  if (testoTessere) {
    const st = env.DB.prepare("INSERT OR REPLACE INTO tessere VALUES (?,?)");
    const t = parseTessere(testoTessere, c);
    if (t.length) await env.DB.batch(t.map((x) => st.bind(...x)));
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
const PERMESSI = ["report", "storico", "sessioni", "prezzo", "stampa", "scarica", "app"];
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
  ]);
  const col = (await env.DB.prepare("PRAGMA table_info(utenti)").all()).results.map((c) => c.name);
  for (const [nome, tipo] of [["permessi", "TEXT"], ["invito_hash", "TEXT"], ["invito_exp", "INTEGER"], ["tessera", "TEXT"]])
    if (!col.includes(nome)) await env.DB.prepare(`ALTER TABLE utenti ADD COLUMN ${nome} ${tipo}`).run();
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
  return `${u.nome}~${exp}~${await firma(env, `${u.nome}|${exp}|${u.hash.slice(0, 16)}`)}`;
}
const cookie = (v, età) => `sess=${encodeURIComponent(v)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${età}`;

async function utenteCorrente(req, env) {
  await preparaTabelle(env);
  const ck = /(?:^|;\s*)sess=([^;]+)/.exec(req.headers.get("cookie") || "");
  if (ck) {
    let val = "";
    try { val = decodeURIComponent(ck[1]); } catch (_) { /* cookie malformato */ }
    const p = (/^(.+)~(\d+)~([0-9a-f]{64})$/.exec(val) || []).slice(1);
    if (p.length === 3 && +p[1] > Date.now() / 1000) {
      const u = await env.DB.prepare("SELECT nome, hash, ruolo, permessi, tessera FROM utenti WHERE nome=?").bind(p[0]).first();
      if (u && u.hash && uguali(p[2], await firma(env, `${u.nome}|${p[1]}|${u.hash.slice(0, 16)}`)))
        return { nome: u.nome, ruolo: u.ruolo, perm: permessiDi(u), tessera: u.tessera || null };
    }
  }
  // accesso con Basic (per gli script, es. --invia)
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Basic ")) {
    try {
      const [n, ...r] = atob(h.slice(6)).split(":");
      const u = await verificaLogin(env, n.toLowerCase(), r.join(":"));
      if (u) return u;
    } catch (_) { /* ignora */ }
  }
  return null;
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
  await preparaTabelle(env);
  const ora = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM tentativi WHERE ts < ?").bind(ora - 600).run();
  const t = await env.DB.prepare("SELECT COUNT(*) n FROM tentativi WHERE nome=?").bind(nome).first();
  if (t.n >= 5) return err("too_many", "Too many attempts: try again in 10 minutes", 429);
  const u = await verificaLogin(env, nome, pw);
  if (!u) {
    await env.DB.prepare("INSERT INTO tentativi VALUES (?, ?)").bind(nome, ora).run();
    return err("bad_login", "Wrong user name or password", 401);
  }
  await env.DB.prepare("DELETE FROM tentativi WHERE nome=?").bind(nome).run();
  const r = json({ ok: true, nome: u.nome, ruolo: u.ruolo });
  r.headers.append("set-cookie", cookie(await creaToken(env, u), DURATA_SESSIONE));
  return r;
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sha256 = async (t) => hex(await crypto.subtle.digest("SHA-256", enc(t)));

async function inviaMail(cfg, a, oggetto, html) {
  if (!cfg.resend_key || !cfg.mail_from) return "not_configured";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + cfg.resend_key, "content-type": "application/json" },
      body: JSON.stringify({ from: cfg.mail_from, to: [a], subject: oggetto, html }),
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
const pagina = (h) => h.replaceAll("__I18N__", () => I18N).replaceAll("__TITLE__", () => escHtml(TITOLO));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const q = url.searchParams;
    try {
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
        const r = json({ ok: true });
        r.headers.append("set-cookie", cookie("", 0));
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
      if (url.pathname === "/api/mie") {                 // le ricariche dell'utente della colonnina (solo la sua tessera)
        if (!me.tessera) return nega();
        const anno = +q.get("anno") || new Date().getUTCFullYear();
        const out = [];
        for (let m = 1; m <= 12; m++) {
          const r = await reportMese(env, anno, m, false);
          const t = r.tessere.find((x) => x.tag === me.tessera);
          out.push({ mese: m, nome: MESI[m - 1], prezzo: r.prezzo, iva_pct: r.iva_pct, n: t ? t.n : 0,
            kwh: t ? t.kwh : 0, imp: t ? t.imp : null, iva: t ? t.iva : null, tot: t ? t.tot : null, sess: t ? t.sess : [] });
        }
        return json(out);
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
      if (url.pathname === "/api/sessioni") {
        if (!P.sessioni) return nega();
        const nomi = Object.fromEntries((await env.DB.prepare("SELECT tag, nome FROM tessere").all()).results.map((r) => [r.tag, r.nome]));
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
          tag: s.tag || "(app)", nome: s.tag ? (nomi[s.tag] || "") : "", kwh: s.energia_wh / 1000,
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

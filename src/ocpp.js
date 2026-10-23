// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Alessandro Pomponi. This program is free software under the GNU Affero General Public License v3 or later; see LICENSE.
//
// Minimal OCPP 1.6-J central system, one Durable Object ("Colonnina" = the charger).
// The charger opens a WebSocket to  wss://<your-domain>/ocpp/<secret-token>/<charger-id>  and this object
// answers its messages (BootNotification, Heartbeat, StatusNotification, Authorize, Start/StopTransaction,
// MeterValues) and keeps the live state: socket status, running transaction, last measures.
//
// The server never sends a card list or a charging profile to the charger: the charger keeps managing its own
// cards. Only a card present and active in the "tessere" table (downloaded from the charger, still on its list
// and in state accepted) is accepted when the charger asks the server to authorize it; others get "Invalid".

const HEARTBEAT_S = 300;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const OCCUPATA = /Charging|Suspended|Preparing|Finishing/;

export class Colonnina {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.attese = new Map();
    this.sql.exec("CREATE TABLE IF NOT EXISTS eventi (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, dir TEXT, testo TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS transazioni (id INTEGER PRIMARY KEY AUTOINCREMENT, tag TEXT, connettore INTEGER, inizio INTEGER, meter_ini INTEGER, fine INTEGER, meter_fin INTEGER, motivo TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS campioni (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, tx INTEGER, dati TEXT)");
  }

  put(k, v) { this.sql.exec("INSERT OR REPLACE INTO kv VALUES (?, ?)", k, JSON.stringify(v)); }
  get(k) {
    const r = [...this.sql.exec("SELECT v FROM kv WHERE k=?", k)][0];
    return r ? JSON.parse(r.v) : null;
  }
  log(dir, testo) {
    const ora = Date.now();
    this.sql.exec("INSERT INTO eventi (ts, dir, testo) VALUES (?, ?, ?)", ora, dir, String(testo).slice(0, 2000));
    this.sql.exec("DELETE FROM eventi WHERE id < (SELECT MAX(id) FROM eventi) - 300");
    if (dir !== "sys") this.put("ultimo_msg", ora);
  }

  async fetch(req) {
    if (req.headers.get("upgrade") !== "websocket") {
      const path = new URL(req.url).pathname;
      if (req.method === "POST" && path === "/comando") {
        const b = await req.json();
        return json(await this.inviaComando(b.azione, b.payload));
      }
      return json(this.stato());
    }
    for (const w of this.state.getWebSockets()) {          // a new connection replaces the old one
      try { w.close(1012, "replaced by a new connection"); } catch (_) { /* already closed */ }
    }
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    const proto = (req.headers.get("sec-websocket-protocol") || "").split(",").map((x) => x.trim()).find((x) => /^ocpp1\.6$/i.test(x));
    this.log("sys", "open" + (proto ? " " + proto : ""));
    return new Response(null, { status: 101, webSocket: client, headers: proto ? { "sec-websocket-protocol": proto } : {} });
  }

  async webSocketMessage(ws, msg) {
    let m;
    try { m = JSON.parse(typeof msg === "string" ? msg : new TextDecoder().decode(msg)); } catch (_) { return; }
    this.log("<", JSON.stringify(m));
    if (!Array.isArray(m)) return;
    const [tipo, id, azione, payload] = m;
    if (tipo === 3 || tipo === 4) {                         // answer to a command sent by the administrator
      const ris = this.attese.get(id);
      if (ris) {
        this.attese.delete(id);
        ris(tipo === 3 ? { ok: true, risposta: azione }
          : { errore: "charger_error", dettaglio: String(azione) + (payload ? " - " + String(payload).slice(0, 120) : "") });
      }
      return;
    }
    if (tipo !== 2) return;
    let r;
    try {
      r = await this.chiamata(azione, payload || {});
    } catch (e) {
      this.log("sys", "error in " + azione + ": " + (e.message || e));
      ws.send(JSON.stringify([4, id, "InternalError", String(e.message || e).slice(0, 100), {}]));
      return;
    }
    const out = r === undefined ? [4, id, "NotImplemented", "", {}] : [3, id, r];
    this.log(">", JSON.stringify(out));
    ws.send(JSON.stringify(out));
    if (azione === "BootNotification" || (azione === "Heartbeat" && this.get("hb") !== HEARTBEAT_S)) {
      this.put("hb", HEARTBEAT_S);                          // ask the charger for a gentle heartbeat
      this.state.waitUntil(this.inviaComando("ChangeConfiguration", { key: "HeartbeatInterval", value: String(HEARTBEAT_S) }));
    }
  }

  // a command from the administrator: sent now, the answer is awaited for 15 seconds
  async inviaComando(azione, payload) {
    const ws = this.state.getWebSockets()[0];
    if (!ws) return { errore: "not_connected" };
    const id = "adm" + Date.now() + Math.random().toString(36).slice(2, 6);
    const p = new Promise((ris) => {
      this.attese.set(id, ris);
      setTimeout(() => { if (this.attese.delete(id)) ris({ errore: "no_answer" }); }, 15000);
    });
    const out = [2, id, azione, payload || {}];
    this.log(">", JSON.stringify(out));
    ws.send(JSON.stringify(out));
    return await p;
  }

  webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch (_) { /* already closed */ }
    this.log("sys", "closed " + code);
  }
  webSocketError(ws, e) { this.log("sys", "socket error: " + (e && e.message || e)); }

  async tagOk(idTag) {
    // SELECT * so this still works before the "attiva" column has been added by the Worker
    const r = await this.env.DB.prepare("SELECT * FROM tessere WHERE tag=?").bind(String(idTag || "").toUpperCase()).first();
    return r && r.attiva !== 0 ? "Accepted" : "Invalid";
  }

  async chiamata(azione, p) {
    const adesso = new Date().toISOString();
    switch (azione) {
      case "BootNotification":
        this.put("boot", { ...p, ts: adesso });
        return { status: "Accepted", currentTime: adesso, interval: HEARTBEAT_S };
      case "Heartbeat":
        return { currentTime: adesso };
      case "StatusNotification":
        this.put("presa_" + (p.connectorId || 0), { status: p.status, errore: p.errorCode, ts: p.timestamp || adesso });
        if (p.status === "Available" || p.status === "Finishing")        // safety net: close a transaction left open
          this.sql.exec("UPDATE transazioni SET fine=? WHERE fine IS NULL", Date.parse(p.timestamp) || Date.now());
        return {};
      case "Authorize":
        return { idTagInfo: { status: await this.tagOk(p.idTag) } };
      case "StartTransaction": {
        const st = await this.tagOk(p.idTag);
        this.sql.exec("UPDATE transazioni SET fine=? WHERE fine IS NULL", Date.parse(p.timestamp) || Date.now());
        const r = [...this.sql.exec(
          "INSERT INTO transazioni (tag, connettore, inizio, meter_ini) VALUES (?, ?, ?, ?) RETURNING id",
          String(p.idTag || "").toUpperCase(), p.connectorId || 1, Date.parse(p.timestamp) || Date.now(), p.meterStart ?? null)][0];
        return { transactionId: r.id, idTagInfo: { status: st } };
      }
      case "StopTransaction": {
        const ts = Date.parse(p.timestamp) || Date.now();
        let id = p.transactionId;
        if (![...this.sql.exec("SELECT 1 FROM transazioni WHERE id=?", id)].length) {
          const r = [...this.sql.exec("SELECT id FROM transazioni WHERE meter_fin IS NULL AND inizio<=? ORDER BY id DESC LIMIT 1", ts)][0];
          id = r ? r.id : null;
        }
        if (id !== null) this.sql.exec("UPDATE transazioni SET fine=?, meter_fin=?, motivo=? WHERE id=?", ts, p.meterStop ?? null, p.reason || null, id);
        return { idTagInfo: { status: "Accepted" } };
      }
      case "MeterValues": {
        for (const mv of p.meterValue || []) {
          const dati = {};
          for (const sv of mv.sampledValue || []) {
            const nome = (sv.measurand || "Energy.Active.Import.Register") + (sv.phase ? "." + sv.phase : "");
            dati[nome] = { v: sv.value, u: sv.unit || "" };
          }
          const ts = Date.parse(mv.timestamp) || Date.now();
          this.sql.exec("INSERT INTO campioni (ts, tx, dati) VALUES (?, ?, ?)", ts, p.transactionId ?? null, JSON.stringify(dati));
          this.put("meter", { ts, tx: p.transactionId ?? null, dati });
        }
        this.sql.exec("DELETE FROM campioni WHERE id < (SELECT MAX(id) FROM campioni) - 5000");
        return {};
      }
      case "DiagnosticsStatusNotification":
      case "FirmwareStatusNotification":
        return {};
      case "DataTransfer":
        return { status: "UnknownVendorId" };
      default:
        return undefined;
    }
  }

  // Language-free event list: the page turns {k, a} into text in the user's language.
  eventiBrevi() {
    const righe = [...this.sql.exec("SELECT ts, dir, testo FROM eventi ORDER BY id DESC LIMIT 120")];
    const cmdDi = {};
    for (const r of righe) {
      const k = /^\[2,"([^"]+)","([A-Za-z]+)"/.exec(r.testo);
      if (r.dir === ">" && k) cmdDi[k[1]] = k[2];
    }
    const out = [];
    for (const r of righe) {
      if (out.length >= 15) break;
      let m = null;
      try { m = JSON.parse(r.testo); } catch (_) { /* not JSON */ }
      let e = null;
      if (r.dir === "sys") e = { k: "ev_sys", a: [r.testo] };
      else if (r.dir === "<" && m) {
        const [t, id, a, p] = m;
        if (t === 3) {
          let res = "ok";
          if (a && a.configurationKey) res = "config:" + a.configurationKey.length;
          else if (a && a.status) res = a.status;
          else if (a && a.listVersion !== undefined) res = "list:" + a.listVersion;
          e = { k: "ev_resp", a: [cmdDi[id] || "", res] };
        } else if (t === 4) e = { k: "ev_err", a: [String(a || ""), String(p || "").slice(0, 80)] };
        else if (t === 2) e = this.sintesi(a, p || {});
      } else if (r.dir === ">" && m && m[0] === 2)
        e = { k: "ev_cmd", a: [m[2], m[2] === "ChangeConfiguration" ? m[3].key + "=" + m[3].value : ""] };
      else if (r.dir === ">" && r.testo.startsWith("[4,")) e = { k: "ev_srverr", a: [r.testo.slice(0, 120)] };
      if (e) out.push({ ts: r.ts, dir: r.dir, ...e, raw: r.testo.slice(0, 600) });
    }
    return out;
  }
  sintesi(a, p) {
    const kwh = (wh) => (parseFloat(wh) / 1000).toFixed(2);
    const tag = String(p.idTag || "").toUpperCase();
    switch (a) {
      case "BootNotification": return { k: "ev_boot", a: [p.chargePointModel || "?", p.firmwareVersion || "?"] };
      case "Heartbeat": return { k: "ev_hb", a: [] };
      case "StatusNotification": return { k: "ev_status", a: [p.connectorId, p.status, p.errorCode && p.errorCode !== "NoError" ? p.errorCode : ""] };
      case "Authorize": return { k: "ev_auth", a: [tag] };
      case "StartTransaction": return { k: "ev_start", a: [tag, kwh(p.meterStart)] };
      case "StopTransaction": return { k: "ev_stop", a: [p.reason || "", kwh(p.meterStop)] };
      case "MeterValues": {
        const v = {};
        for (const sv of ((p.meterValue || [])[0] || {}).sampledValue || []) v[sv.measurand || "Energy.Active.Import.Register"] = sv;
        const x = [];
        const pw = v["Power.Active.Import"];
        if (pw) x.push((parseFloat(pw.value) / (/^k/i.test(pw.unit || "") ? 1 : 1000)).toFixed(2) + " kW");
        if (v["Current.Import"]) x.push(parseFloat(v["Current.Import"].value).toFixed(1) + " A");
        if (v["Energy.Active.Import.Register"]) x.push(kwh(v["Energy.Active.Import.Register"].value) + " kWh");
        return { k: "ev_meter", a: [x.join(", ") || "-"] };
      }
      default: return { k: "ev_other", a: [a] };
    }
  }

  stato() {
    const aperta = [...this.sql.exec("SELECT * FROM transazioni WHERE fine IS NULL ORDER BY id DESC LIMIT 1")][0] || null;
    const prese = {};
    for (const r of this.sql.exec("SELECT k, v FROM kv WHERE k LIKE 'presa_%'")) prese[r.k.slice(6)] = JSON.parse(r.v);
    return {
      connessa: this.state.getWebSockets().length > 0,
      ultimo_msg: this.get("ultimo_msg"),
      boot: this.get("boot"),
      prese,
      meter: this.get("meter"),
      transazione_aperta: aperta,
      occupata: !!aperta || Object.values(prese).some((p) => OCCUPATA.test(p.status)),
      eventi: this.eventiBrevi(),
    };
  }
}

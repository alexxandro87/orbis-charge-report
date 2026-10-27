// Single-page UI (HTML + JS, no libraries). Never use backticks inside the page code (it lives in String.raw templates).
export const HTML = String.raw`<!doctype html>
<html lang="it">
<head>
<script>try{var _t=localStorage.getItem("tema");if(_t)document.documentElement.setAttribute("data-t",_t)}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:15px/1.4 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
header{padding:8px 16px;background:var(--card);border-bottom:1px solid var(--line)}
h1{font-size:16px;margin:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:6px 16px;flex-wrap:wrap}
.riga2{margin-top:6px}
.utente,.azioni{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.utente{font-size:13px}
header button{padding:4px 10px;font-size:13px}
button.l{border:0;padding:0 2px}
.pill{background:var(--acc);color:var(--btx);border-radius:10px;padding:1px 8px;font-size:11px}
.pwbox{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;margin-top:8px}
.pwbox input{padding:5px 8px;font-size:13px}
.sub{color:var(--mut);font-size:13px}
main{padding:12px 16px;max-width:1400px;margin:0 auto}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
button,select,input{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--tx)}

nav{display:flex;gap:4px;margin:12px 0 0;border-bottom:1px solid var(--line)}
nav button{border:0;border-bottom:3px solid transparent;border-radius:0;background:none;color:var(--tx)}
#navN,#navUN,#navTN{background:#c62828;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:600;margin-left:6px;vertical-align:middle}#navN:empty,#navUN:empty,#navTN:empty{display:none}.piede{margin:24px auto 12px;text-align:center;font-size:12px;color:var(--mut)}.piede a{color:var(--acc)}.noprint-f{}@media print{.piede{display:none}}
nav button.on{border-bottom-color:var(--acc);font-weight:600}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;margin:12px 0}
h2{font-size:15px;margin:0 0 8px}
.w{overflow-x:visible}input,select,textarea{max-width:100%}
table{border-collapse:collapse;width:100%;font-size:calc(15px*var(--z,1))}
th,td{padding:6px 7px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
table.wr th,table.wr td{white-space:normal;overflow-wrap:break-word;vertical-align:top}
th{color:var(--mut);font-weight:600;font-size:.87em}
td.n,th.n{text-align:right}
tr.t td{font-weight:600;border-top:2px solid var(--tx)}
tr.cl{cursor:pointer}tr.cl:hover{background:var(--bg)}
#tabO th{position:sticky;top:0;background:var(--card)}#tabO td,#tabO th{padding:4px 8px}
.err{color:var(--err)}.ok{color:var(--acc)}
.tot{font-size:16px;font-weight:600;text-align:right;margin-top:8px}
.hide{display:none}
@media print{.noprint{display:none!important}body{background:#fff;color:#000}.card{border:0}}
#tabU td:nth-child(3){white-space:normal}#tabU td.n{white-space:nowrap;width:1%}#tabU button{padding:3px 9px;font-size:13px}
.solostampa{display:none}@media print{.solostampa{display:block;font-weight:600;margin-bottom:6px}}
tr.rs{cursor:pointer}tr.rs:hover td{background:var(--bg)}tr.rs.sel td{background:rgba(90,140,255,.28)}tr.old td{color:var(--mut)}tr.ut{cursor:pointer}tr.ut:hover td{background:var(--bg)}tr.det td{background:var(--bg);color:var(--mut);font-size:.92em}
tr.det td:first-child{padding-left:24px}
nav{flex-wrap:wrap}button{white-space:nowrap}.top h1{min-width:0;overflow-wrap:anywhere}@media(max-width:700px){main{padding:10px 8px}.w{overflow-x:visible}table.tbm{min-width:0;display:block}table.tbm thead,table.tbm tr:has(>th){display:none}table.tbm tbody{display:block}table.tbm tr{display:block;border:1px solid var(--line);border-radius:8px;margin:0 0 8px;padding:4px 10px;background:var(--card)}table.tbm td{display:flex;justify-content:space-between;align-items:center;gap:12px;border:0;padding:4px 0;white-space:normal;text-align:right;overflow-wrap:anywhere}table.tbm td::before{content:attr(data-l);color:var(--mut);font-weight:600;font-size:13px;text-align:left;flex:none;max-width:45%}table.tbm td[data-l=""]::before{display:none}table.tbm td[data-l=""]{justify-content:flex-start;flex-wrap:wrap}table.tbm tr.det{margin:-6px 0 8px;border-top:0;border-radius:0 0 8px 8px}table.tbm td.n{width:auto}nav button{padding:7px 8px}.bar>label{display:block;flex:1 1 100%;min-width:0}.bar>label input,.bar>label select,.bar>label textarea,.bar>input,.bar>select,textarea{width:100%;max-width:100%}.bar>input[type=checkbox],.bar>label input[type=checkbox]{width:auto}}
</style>
</head>
<body>
<header class="noprint">
  <div class="top">
    <div id="titoloM"></div>
    <h1>__TITLE__ <span class="ver">__VERSION__</span></h1>
    <div class="utente">
      <span class="ver verM">__VERSION__</span>
      <span id="chi"></span>
      <button class="l" id="bLang"></button>
      <button class="l" id="bTema"></button>
      <button class="l" id="bPw">Cambia password</button>
      <button id="bEsci">Esci</button>
    </div>
  </div>
  <div class="top riga2">
    <div class="sub"><span id="stato">Caricamento...</span> <span class="err" id="esito"></span></div>
    <div class="azioni">
      <button class="p" id="bScarica">Scarica dalla colonnina</button>
      <button id="bImporta">Importa CSV Viaris</button>
      <input type="file" id="fCsv" accept=".csv" multiple class="hide">
    </div>
  </div>
  <div class="pwbox hide" id="boxPw">
    <input type="password" id="pwOld" placeholder="Password attuale" autocomplete="current-password">
    <input type="password" id="pwNew" placeholder="Nuova password (min. 12, con maiuscola, numero e simbolo)" autocomplete="new-password">
    <input type="password" id="pwNew2" placeholder="Ripeti la nuova password" autocomplete="new-password">
    <button class="p" id="bPwOk">Salva</button>
    <span class="sub err" id="pwEsito"></span>
  </div>
</header>
<main>
<nav class="noprint">
  <button class="on" data-t="t1">Report mensile</button>
  <button data-t="t3">Tutte le sessioni</button>
  <button data-t="t2">Storico annuale</button>
  <button data-t="t4" id="navUt" class="hide">Utenti/Card<span id="navUN"></span></button>
  <button data-t="t13" id="navPre" class="hide">Prepagate</button>
  <button data-t="t9" id="navL">Monitoraggio<span id="navN"></span></button>
  <button data-t="t5" id="navM" class="hide">Le mie ricariche</button>
  <button data-t="t10" id="navP" class="hide">Il mio profilo</button>
  <button data-t="t6" id="navSet" class="hide">Impostazioni</button>
  <button data-t="t8" id="navOc" class="hide">OCPP</button>
  <button data-t="t11" id="navT" class="hide">Assistenza<span id="navTN"></span></button>
  <button data-t="t12" id="navI" class="hide">Informazioni</button>
</nav>

<section id="t1">
  <div class="solostampa">__TITLE__</div>
  <div class="bar noprint">
    <select id="selAnno"></select>
    <select id="selMese"></select>
    <label>Prezzo €/kWh <input id="prezzo" size="7" inputmode="decimal"></label>
    <label>IVA % <input id="iva" size="4" inputmode="decimal"></label>
    <button class="p" id="bPrezzo">Salva prezzo</button>
    <button id="bReinvia" class="hide">Reinvia report</button>
  </div>
  <div class="sub err noprint" id="avviso"></div>
  <div class="card">
    <h2 id="titoloRep"></h2>
    <div class="sub" id="subRep"></div>
  </div>
  <div class="card">
    <h2>Ricariche con tessera</h2>
    <div class="w"><table id="tabT"></table></div>
  </div>
  <div class="card hide" id="cApp">
    <h2>Ricariche avviate da app (non attribuite a una tessera)</h2>
    <div class="w"><table id="tabA"></table></div>
  </div>
  <div class="card"><div class="tot" id="totale"></div></div>
  <div class="bar noprint">
    <button id="bStampa">Stampa / PDF</button>
    <button id="bCsv">Esporta CSV</button>
  </div>
</section>

<section id="t2" class="hide">
  <div class="bar noprint">
    <select id="selAnnoS"></select>
    <button id="bCsvAnno">Esporta CSV</button>
  </div>
  <div class="card"><div class="w"><table id="tabS"></table></div>
  <div class="tot" id="totAnno"></div>
  <div class="sub noprint">Tocca un mese per aprirlo. I mesi senza prezzo mostrano solo i kWh.</div></div>
</section>

<section id="t8" class="hide">
  <div class="card">
    <h2>Impostazioni OCPP</h2>
    <div class="bar"><label>Indirizzo da dare alla colonnina <input id="oUrl" readonly size="72"></label></div>
    <div class="bar"><button id="bOAgg">Aggiorna</button> <button id="bORig">Rigenera codice segreto</button> <span class="sub err" id="oEsito"></span></div>
    <div class="sub" id="oStato"></div>
    <div class="bar"><label><input type="checkbox" id="oListaOn"> Invia la lista tessere alla colonnina (OCPP SendLocalList)</label> <button id="bOSync">Sincronizza lista tessere</button></div>
    <div class="sub" id="oLista"></div>
    <div class="sub">Opzione disattivata di serie: il server non manda nessun elenco tessere. Se la attivi, le tessere attive vengono inviate all'avvio della colonnina, circa 30 secondi dopo una modifica e con il pulsante; mai con un'auto collegata o in carica. Dopo l'invio i nomi vengono rimessi sulla colonnina. Provato solo su firmware Orbis 7.2.53.</div>
    <div class="bar"><label>Conferma collegamento ogni <input id="oHb" type="number" min="1" max="60" style="width:5em"> minuti</label> <button id="bOHb">Salva</button> <span class="sub" id="oHbTxt"></span></div>
<label class="sub"><input type="checkbox" id="oRaw"> Mostra i messaggi grezzi</label>
    <div style="overflow:auto;height:240px;border:1px solid var(--line);border-radius:6px"><table id="tabO" style="table-layout:fixed;width:100%"></table></div>
    <div class="bar"><button id="bOPrec">Mostra precedenti</button> <span class="sub" id="oPrecTxt"></span></div>
    <div class="sub">Il server riceve e registra i messaggi della colonnina e le manda solo le impostazioni scelte qui sotto (e la lista tessere, se attivata). Il codice dentro l'indirizzo è segreto, chi non lo conosce non può collegarsi. Se lo rigeneri devi aggiornare l'indirizzo sulla colonnina.</div>
  </div>
  <div class="card">
    <h2>Comandi OCPP</h2>
    <div class="sub" id="ocStato"></div>
    <div class="bar"><label>Comando <select id="ocCmd">
      <option value="GetConfiguration">GetConfiguration - legge tutte le impostazioni OCPP</option>
      <option value="GetLocalListVersion">GetLocalListVersion - versione della lista tessere offline</option>
      <option value="TriggerMessage">TriggerMessage - fa inviare subito un messaggio</option>
      <option value="RemoteStopTransaction">RemoteStopTransaction - ferma la ricarica in corso (non provato)</option>
      <option value="Reset">Riavvia colonnina (non cancella nulla, solo se libera)</option>
    </select></label>
    <label class="hide" id="ocMsgL">Messaggio <select id="ocMsg"><option>MeterValues</option><option>StatusNotification</option><option>Heartbeat</option><option>DiagnosticsStatusNotification</option><option>FirmwareStatusNotification</option></select></label>
    <button class="p" id="bOcInvia">Invia</button> <span class="sub err" id="ocEsito"></span></div>
    <div id="ocRis"></div>
    <div class="sub">I comandi di lettura non cambiano nulla. RemoteStopTransaction agisce sulla colonnina e non è ancora stato provato su quella reale: chiede conferma prima dell'invio. La risposta arriva dalla colonnina stessa, entro 15 secondi.</div>
  </div>
  <div class="card">
    <h2>Parametri avanzati della colonnina</h2>
    <div id="oPar"></div>
    <div class="sub">Il server manda alla colonnina solo i valori che cambi, subito o al primo messaggio utile, e li rimanda a ogni riavvio. Per vedere i valori letti dalla colonnina usa GetConfiguration.</div>
  </div>
</section>


<section id="t5" class="hide">
  <div class="bar noprint"><select id="selAnnoM"></select> <select id="selMeseM"></select> <button class="p" id="bPdfM">Scarica PDF</button></div>
  <div id="cPre"></div>
  <div class="card">
    <h2 id="mieTit">Le mie ricariche</h2>
    <div class="w"><table id="tabM"></table></div>
    <div class="tot" id="totM"></div>
    <div class="sub noprint hide" id="noteM">I mesi senza prezzo (-) non hanno ancora l'importo perché il prezzo dell'energia non è ancora stato inserito dall'Amministratore: l'importo viene calcolato appena il prezzo è disponibile.</div>
    <div class="sub noprint">Tocca un mese per vedere le singole ricariche.</div>
  </div>
</section>

<section id="t10" class="hide">
  <div class="card">
    <h2>Il mio profilo</h2>
    <table id="tabP"></table>
    <h3 style="margin:16px 0 6px;font-size:14px">Messaggi di servizio</h3>
    <label class="chk" style="display:flex;gap:8px;margin:6px 0"><input type="checkbox" id="pTg"> <span>Acconsento a ricevere messaggi di servizio su Telegram</span></label>
    <div class="bar"><button class="p" id="bProfilo">Salva</button> <span class="sub" id="pEsito"></span></div>
    <div id="pTgBox" class="sub hide">Telegram: <b id="pTgStato"></b> <button type="button" class="l" id="bTgCollega">Collega Telegram</button><button type="button" class="l hide" id="bTgScollega">Scollega Telegram</button><div id="pTgLink"></div></div>
    <div class="sub">Il consenso è facoltativo. Puoi cambiarlo o revocarlo quando vuoi da qui: la modifica vale subito e ne resta traccia con data e ora. I tuoi dati sono usati solo per erogare il servizio, senza cessione a terzi e senza pubblicità.</div>
    <div class="sub">Per correggere i dati o chiederne la cancellazione apri una richiesta dalla scheda «Assistenza»<span id="pContatto"></span>.</div>
    <div class="sub" id="pAgg"></div>
  </div>
</section>

<section id="t11" class="hide">
  <div class="card" id="cTkNuovo">
    <h2>Assistenza</h2>
    <div class="card hide" id="cSenzaT" style="margin:0 0 10px">Non hai ancora una tessera. Puoi richiederla qui sotto<span class="fee-par"></span>: ti contatteremo per la consegna e il pagamento. Se l'hai già, attendi che l'Amministratore la abbini al tuo account.</div>
    <div class="sub">Da qui puoi inviare una richiesta all'Amministratore. Riceverai l'esito per email.</div>
    <div class="bar"><label>Tipo di richiesta <select id="tkTipo">
      <option value="tessera">Tessera smarrita o danneggiata</option><option value="nuova">Richiesta nuova tessera</option><option value="dati">Correzione dei dati</option>
      <option value="cancellazione">Cancellazione dei dati / dell'utenza</option><option value="colonnina">Problema con la colonnina</option><option value="altro">Altro</option></select></label></div>
    <div class="bar" id="tkTessBox"><label>Tessera <select id="tkTess"></select></label> <label>Motivo <select id="tkMotivo"><option value="smarrita">Smarrita</option><option value="danneggiata">Danneggiata</option></select></label></div>
    <div class="sub" id="tkTessInfo">Per sicurezza la tessera viene bloccata subito sulla colonnina. Se la ritrovi, scrivi all'Amministratore: può sbloccarla. Se non la ritrovi o è danneggiata dovrai richiederne una nuova<span class="fee-par"></span>.</div>
    <div class="sub" id="tkNuovaInfo" style="display:none"><span class="fee-info"></span>Ti contatteremo al telefono indicato nel tuo profilo per la consegna e il pagamento. Il messaggio è facoltativo (ad esempio gli orari in cui sei reperibile).</div>
    <div class="bar hide" id="tkPagBox"><label>Come vuoi pagare<span class="fee-par"></span> <select id="tkPagSel"></select></label></div>
    <div class="sub" id="tkPag"></div>
    <div id="tkDatiBox" class="hide">
      <div class="sub">Compila solo i campi da cambiare. I telefoni con il prefisso internazionale (es. +39 333 1234567).</div>
      <div class="bar"><input id="tkNome" placeholder="Nome" size="14"><input id="tkCognome" placeholder="Cognome" size="14"><input id="tkTel1" placeholder="Telefono" size="16"><input id="tkTel2" placeholder="Secondo telefono" size="16"></div>
    </div>
    <div class="sub" id="tkCancInfo" style="display:none">Se l'Amministratore approva, l'utenza e i tuoi dati personali vengono cancellati; restano solo i dati di consumo che il gestore deve conservare per legge.</div>
    <label style="display:block">Messaggio<br><textarea id="tkTesto" rows="4" maxlength="1000" style="width:100%;font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--tx)"></textarea></label>
    <div class="bar"><button class="p" id="bTk">Invia richiesta</button> <span class="sub" id="tkEsito"></span></div>
  </div>
  <div class="card"><h2 id="tkTit">Le mie richieste</h2><div id="listaT"></div></div>
</section>

<section id="t12" class="hide">
  <div class="card">
    <h2>Informazioni e contatti</h2>
    <table>
      <tr><th>Software</th><td>Orbis Viaris Charge Report</td></tr>
      <tr id="infoContatto" class="hide"><th>Contatto del gestore</th><td id="infoContattoV"></td></tr>
      <tr><th>Codice sorgente</th><td><a href="https://github.com/alexxandro87/orbis-viaris-charge-report" target="_blank" rel="noopener">github.com/alexxandro87/orbis-viaris-charge-report</a></td></tr>
      <tr><th>Licenza</th><td><a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">GNU AGPL-3.0</a></td></tr>
    </table>
    <div class="sub">Il contatto del gestore si imposta nella scheda Impostazioni. Per errori del software o proposte usa il codice sorgente (issue su GitHub).</div>
  </div>
</section>

<section id="t13" class="hide">
  <div class="card">
    <h2>Tessere prepagate</h2>
    <div class="w"><table id="tabPre"></table></div>
    <div class="sub">Il prezzo serve solo a scalare il credito e lo decidi tu, tessera per tessera. Il consumo conta le ricariche dalla data di attivazione, compresa quella in corso. A credito esaurito la tessera viene bloccata sulla colonnina e la ricarica in corso viene fermata da remoto; l'utente riceve mail e messaggio. Aggiungere credito sblocca la tessera. Tocca una riga per sceglierla.</div>
  </div>
  <div class="card">
    <h2>Aggiungi credito o modifica</h2>
    <div class="bar" style="flex-wrap:wrap"><label>Tessera <select id="prSel"></select></label> <label>Importo da aggiungere <input id="prImp" type="number" min="0" step="0.01" style="width:6em"> €</label> <label>Prezzo €/kWh <input id="prPr" type="number" min="0.01" step="0.01" style="width:6em"></label> <label>Avviso sotto <input id="prSo" type="number" min="0" step="1" style="width:5em"> €</label></div>
    <div class="bar"><button class="p" id="bPrSalva">Salva</button> <button id="bPrTogli">Torna a consumo</button> <span class="sub err" id="prEsito"></span></div>
    <div class="sub" id="prStor"></div>
  </div>
  <div class="card">
    <h2>Rendi prepagata una tessera esistente</h2>
    <div class="bar" style="flex-wrap:wrap"><label>Tessera <select id="prNuova"></select></label> <label>Prezzo €/kWh <input id="prNPr" type="number" min="0.01" step="0.01" placeholder="0,40" style="width:6em"></label> <label>Credito iniziale <input id="prNCr" type="number" min="0" step="0.01" style="width:6em"> €</label> <label>Avviso sotto <input id="prNSo" type="number" min="0" step="1" value="5" style="width:5em"> €</label> <button class="p" id="bPrNuova">Attiva prepagata</button> <span class="sub err" id="prNEsito"></span></div>
    <div class="sub">Tessere già presenti sulla colonnina. Da questo momento le loro ricariche scalano il credito. Le tessere nuove si aggiungono dalla scheda Utenti/Card scegliendo il tipo «Prepagata».</div>
  </div>
</section>

<section id="t9" class="hide">
  <div class="card">
    <h2>Ricarica in corso</h2>
    <div id="liveTit" style="font-size:20px;font-weight:600;margin-bottom:8px"></div>
    <table id="tabL"></table>
    <div class="sub" id="liveAgg"></div>
  </div>

  <div class="card solo-adm hide" id="cardNot">
    <h2>Notifiche</h2>
    <div id="listaNot"></div>
    <button id="bNotLette" class="hide">Segna come lette</button>
    <p class="sub">Qui compaiono gli avvisi che non partono via mail: controlli solo notifica (consumi Cloudflare), mail non inviate, nessun destinatario impostato.</p>
  </div>
  <div class="card solo-adm hide">
    <h2>Avvisi agli utenti</h2>
    <div class="bar"><label><input type="checkbox" id="avOn"> Avvisa chi ha caricato quando la ricarica è finita e l'auto è ancora collegata</label></div>
    <div class="bar"><label>Prima mail dopo <input id="avAt" type="number" min="0" max="240" style="width:5em"> minuti dalla fine della ricarica</label> <label>Secondo avviso dopo <input id="avSo" type="number" min="0" max="1440" style="width:5em"> minuti (0 = nessuno)</label></div>
    <div class="bar"><button class="p" id="bAv">Salva</button> <span class="sub err" id="avEsito"></span></div>
    <div class="sub">La mail arriva all'indirizzo dell'utente registrato con la tessera usata, per liberare la colonnina. Il controllo gira ogni 5 minuti, quindi la mail può arrivare fino a 5 minuti dopo l'attesa impostata. Vale anche quando la colonnina resta in «Charging» ad auto piena (contatore fermo e potenza zero).</div>
  </div>
  <div class="card solo-adm hide">
    <h2>Destinatari malfunzionamenti</h2>
    <div class="bar"><label>A (separa più indirizzi con la virgola) <input id="mA" size="48" autocomplete="off"></label></div>
    <div class="bar"><label>In copia (separa più indirizzi con la virgola) <input id="mCc" size="48" autocomplete="off"></label></div>
    <div class="w"><table id="tabMal"></table></div>
    <div class="bar"><button class="p" id="bMal">Salva</button> <button id="bMalProva">Invia mail di prova</button> <span class="sub err" id="mEsito"></span></div>
    <div class="sub" id="mUlt"></div>
    <div class="sub">Tutti i controlli partono disattivati: accendi quelli che vuoi. Il controllo gira ogni 5 minuti. Quando un problema dura più della soglia parte una mail con il tipo di malfunzionamento, e una seconda quando rientra; gli avvisi singoli (riavvio, IP, firmware) arrivano una volta sola. Il controllo del battito tiene conto dell'intervallo di Conferma collegamento (soglia almeno il doppio).</div>
  </div>
  <div class="card solo-adm hide">
    <h2>Ultimi episodi</h2>
    <div class="w"><table id="tabEp"></table></div>
  </div>
  <div class="card solo-adm hide">
    <h2>Consumi Cloudflare</h2>
    <h3 style="margin:0 0 6px;font-size:14px">Mail e messaggi inviati dal sito</h3>
    <div class="w"><table id="tabMsg"></table></div>
    <p class="sub" id="msgNota"></p>
    <h3 style="margin:14px 0 6px;font-size:14px">Cosa consuma (conteggio del sito)</h3>
    <div class="w"><table id="tabChi"></table></div>
    <p class="sub" id="chiNota"></p>
    <h3 style="margin:14px 0 6px;font-size:14px">Cloudflare</h3>
    <div class="w"><table id="tabCf"></table></div>
    <h3 style="margin:14px 0 6px;font-size:14px">Riepilogo mensile</h3>
    <div class="w"><table id="tabCfM"></table></div>
    <p id="cfSpazio" style="margin:10px 0 0"></p>
    <p class="sub" id="cfNota"></p>
  </div>
</section>

<section id="t4" class="hide">
  <div class="card">
    <h2>Utenti</h2>
    <div class="w"><table id="tabU"></table></div>
    <p class="sub" id="cifraInfo"></p>
  </div>
  <div class="card">
    <h2>Invita un utente o modifica i permessi</h2>
    <div class="bar"><input id="uNome" type="email" size="32" placeholder="email dell'utente" autocomplete="off"></div>
    <div class="bar"><label>Tipo di utente
      <select id="uTipo"><option value="g">Gestione (scegli i permessi)</option><option value="c">Utente della colonnina (vede solo le sue ricariche)</option></select></label></div>
    <div class="bar hide" id="uTessBox"><label>Tessera <select id="uTess"></select></label> <label>Altre tessere, facoltativo (Ctrl/⌘ per sceglierne più di una) <select id="uTess2" multiple size="4"></select></label></div>
    <div class="bar hide" id="uAnBox" style="flex-wrap:wrap"><label>Nome <input id="uAnNome" size="14" autocomplete="off"></label> <label>Cognome <input id="uAnCognome" size="14" autocomplete="off"></label> <label>Telefono <input id="uAnTel1" size="14" autocomplete="off" placeholder="+39..."></label> <label>Telefono facoltativo <input id="uAnTel2" size="14" autocomplete="off" placeholder="+39..."></label></div>
    <div class="bar" id="uPerm" style="flex-direction:column;align-items:flex-start;gap:4px">
      <label><input type="checkbox" data-p="report"> Vedere il report mensile</label>
      <label><input type="checkbox" data-p="storico"> Vedere lo storico annuale</label>
      <label><input type="checkbox" data-p="sessioni"> Vedere tutte le sessioni</label>
      <label><input type="checkbox" data-p="prezzo"> Inserire prezzo kWh e IVA</label>
      <label><input type="checkbox" data-p="stampa"> Stampare ed esportare i report</label>
      <label><input type="checkbox" data-p="scarica"> Scaricare dalla colonnina e importare CSV</label>
      <label><input type="checkbox" data-p="app"> Vedere le ricariche avviate da app</label>
      <label><input type="checkbox" data-p="live"> Vedere i dettagli della ricarica in corso (potenza, kWh...)</label>
    </div>
    <div class="bar">
      <button class="p" id="bUInvita">Invia invito</button>
      <button id="bUPerm">Salva solo i permessi</button>
    </div>
    <div class="sub">L'utente riceve una mail con un link monouso (valido 48 ore) per scegliere la propria password al primo accesso.</div>
    <div class="sub err" id="uEsito"></div>
    <input id="uLink" class="hide" readonly size="60">
  </div>
  <div class="card">
    <h2>Tessere RFID della colonnina</h2>
    <div class="bar"><label>Codice tessera <input id="rId" size="12" autocomplete="off"></label> <label>Nome <input id="rNome" size="28" maxlength="25" autocomplete="off"></label> <label>Scadenza <input id="rScad" type="date"></label> <label id="rDalL">Assegnata dal <input id="rDal" type="date"></label> <label>Stato <select id="rStato"><option value="0">Attiva</option><option value="1">Bloccata</option><option value="2">Scaduta</option><option value="3">Non valida</option></select></label> <label id="rTipoL">Tipo <select id="rTipo"><option value="consumo">A consumo</option><option value="prepagata">Prepagata</option></select></label> <button class="p" id="bRAgg">Aggiungi</button> <button id="bRAnn" class="hide">Annulla</button></div>
    <div class="bar hide" id="rPreBox" style="flex-wrap:wrap"><label>Prezzo €/kWh <input id="rPPr" type="number" min="0.01" step="0.01" placeholder="0,40" style="width:6em"></label> <label>Credito iniziale <input id="rPCr" type="number" min="0" step="0.01" style="width:6em"> €</label> <label>Avviso sotto <input id="rPSo" type="number" min="0" step="1" value="5" style="width:5em"> €</label> <span class="sub">Prepagata: il credito scala con questo prezzo; a zero la tessera viene bloccata. Con credito 0 resta bloccata finché non aggiungi credito dalla scheda Prepagate.</span></div>
    <div class="bar"><button id="bRDis" disabled>Disattivazione Permanente</button> <button id="bRImp">Importa file</button><input id="rFile" type="file" accept=".csv,.txt" class="hide"> <button id="bREsp">Esporta lista</button> <button id="bRLeggi">Rileggi dalla colonnina</button> <button id="bRRip" class="hide">Ripristina lista precedente</button> <span class="sub err" id="rEsito"></span></div>
    <table id="tabR"></table>
    <div class="sub">Clicca su una tessera per selezionarla: Disattivazione Permanente la toglie dalla colonnina (lo storico resta), Modifica cambia nome, stato o data di assegnazione. In grigio le tessere disattivate: le loro ricariche restano attribuite a chi le aveva in quel periodo.</div>
    <div class="sub">Nome al massimo 25 caratteri (oltre, la colonnina lo tronca). Scadenza facoltativa: la tessera vale fino alla fine di quel giorno. Le modifiche vengono scritte subito sulla colonnina. Prima di ogni scrittura il sito tiene una copia della lista precedente. L'import aggiunge le tessere nuove e aggiorna nomi e stati, senza cancellare nulla (va bene sia il file esportato da qui sia il CSV esportato da Viaris).</div>
  </div>
  <div class="card">
    <h2>Canali di contatto</h2>
    <div class="w"><table id="tabCanali"></table></div>
    <p class="sub">Conteggio sugli utenti con profilo. I messaggi inviati per canale, mese per mese, sono nel Monitoraggio (Consumi).</p>
  </div>
  <div class="card">
    <h2>Comunicazione a tutti gli utenti</h2>
    <div class="bar"><label>Oggetto (italiano / inglese) <input id="cmOgg" size="48" autocomplete="off"></label></div>
    <div class="bar"><label style="flex:1">Testo italiano<textarea id="cmIt" rows="5" style="width:100%;display:block"></textarea></label></div>
    <div class="bar"><label style="flex:1">Testo inglese<textarea id="cmEn" rows="5" style="width:100%;display:block"></textarea></label></div>
    <div class="bar"><label><input type="checkbox" id="cmTg"> Anche su Telegram a chi lo ha collegato</label></div>
    <div class="bar"><button id="bCmAnteprima">Anteprima</button> <button class="p hide" id="bCmInvia">Invia</button> <span class="sub" id="cmEsito"></span></div>
    <div id="cmPrev" class="hide" style="border:1px solid var(--line);border-radius:6px;padding:10px;margin-top:8px"></div>
    <div class="sub">Va a tutti gli account attivi con email confermata, tranne l'admin; al massimo 44 mail per invio. L'anteprima mostra quanti sono i destinatari e la mail come arriverà. Ogni riga del testo diventa una riga della mail.</div>
  </div>
</section>

<section id="t6" class="hide">
  <div class="card">
    <h2>Destinatari report mensili</h2>
    <div class="bar"><label>A (separa più indirizzi con la virgola) <input id="dA" size="48" autocomplete="off"></label></div>
    <div class="bar"><label>In copia (separa più indirizzi con la virgola) <input id="dCc" size="48" autocomplete="off"></label></div>
    <div class="bar"><button class="p" id="bDest">Salva destinatari</button> <span class="sub err" id="dEsito"></span></div>
    <div class="sub">Appena viene inserito il prezzo di un mese, il report con i totali per tessera viene inviato a questi indirizzi (le ricariche avviate da app non sono incluse).</div>
  </div>
  <div class="card">
    <h2>Colonnina</h2>
    <div class="sub">Indirizzo da cui il sito scarica i dati e legge le tessere. Per una Orbis bastano l'indirizzo e la porta (es. http://nome-ddns:81); gli altri campi servono solo per colonnine con risposte diverse.</div>
    <div class="bar"><label>Indirizzo (http:// o https://) <input id="cf_url" size="36" placeholder="http://colonnina.esempio.it:81" autocomplete="off"></label> <span class="sub" id="envUrl"></span></div>
    <div class="bar"><label>Utente (se la colonnina chiede una password) <input id="cf_user" size="16" autocomplete="off"></label> <label>Password <input id="cf_password" type="password" size="16" autocomplete="new-password"></label> <label><input type="checkbox" id="cf_pw_clear"> Cancella la password salvata</label></div>
    <div class="bar"><label>Intestazione aggiuntiva, nome <input id="cf_header_name" size="16" autocomplete="off"></label> <label>Valore <input id="cf_header_value" size="24" autocomplete="off"></label></div>
    <div class="bar"><label>Percorso dello storico <input id="cf_history_path" size="40"></label></div>
    <div class="bar"><label>Percorso dell'elenco tessere (deve contenere level=file) <input id="cf_tags_path" size="32"></label> <label>Percorso dello stato (vuoto = non controllato) <input id="cf_status_path" size="28"></label></div>
    <div class="bar"><label>Tempo massimo di risposta, secondi <input id="cf_timeout" inputmode="numeric" style="width:5em"></label> <label><input type="checkbox" id="cf_auto"> Scarico automatico ogni 6 ore</label></div>
    <div class="sub" id="cInfo"></div>
    <details><summary>Formato dei dati (solo se la colonnina non è una Orbis)</summary>
      <div class="bar"><label>Campo JSON con le righe dello storico (vuoto = la risposta è già CSV) <input id="cf_hist_json_field" size="10"></label> <label>Separatore <input id="cf_hist_sep" size="3"></label> <label>Righe da saltare <input id="cf_hist_skip" inputmode="numeric" style="width:4em"></label></div>
      <div class="bar"><label>Colonna inizio <input id="cf_c_start" inputmode="numeric" style="width:4em"></label> <label>Colonna fine <input id="cf_c_end" inputmode="numeric" style="width:4em"></label> <label>Colonna tessera <input id="cf_c_tag" inputmode="numeric" style="width:4em"></label> <label>Colonna tipo <input id="cf_c_type" inputmode="numeric" style="width:4em"></label> <label>Colonna contatore iniziale <input id="cf_c_cont_ini" inputmode="numeric" style="width:4em"></label> <label>Colonna contatore finale <input id="cf_c_cont_fin" inputmode="numeric" style="width:4em"></label></div>
    </details>
  </div>
  <div class="card">
    <h2>Sito</h2>
    <div class="bar"><label>Titolo del sito <input id="cf_title" size="40"></label></div>
    <div class="bar"><label>Fuso orario <input id="cf_tz" size="18" placeholder="Europe/Rome"></label> <label>Valuta <input id="cf_currency" size="4"></label> <label>Etichetta dell'imposta (vuoto = IVA) <input id="cf_tax_label" size="8"></label></div>
    <div class="bar"><label>Costo della tessera (0 = non mostrato) <input id="cf_card_fee" inputmode="decimal" style="width:6em"></label> <label>Contatto del gestore (email o testo, facoltativo) <input id="cf_contact" size="32" autocomplete="off"></label> <label>Identificativo della colonnina nell'indirizzo OCPP <input id="cf_charger_id" size="16"></label></div>
    <div class="sub">Il titolo compare nelle pagine, nelle mail e nei PDF. Il costo della tessera è mostrato a chi la richiede dalla scheda Assistenza, nella registrazione e nelle mail. Il contatto compare nel profilo e nella scheda Informazioni.</div>
  </div>
  <div class="card">
    <h2>Mail</h2>
    <div class="sub">Facoltativo, con Resend (resend.com): serve per inviti, registrazioni, report, ticket e avvisi. Senza, il sito mostra i link da inviare a mano e le mail non partono. La chiave si può anche mettere come secret RESEND_API_KEY.</div>
    <div class="bar"><label>Chiave API Resend <input id="cf_resend_key" type="password" size="28" autocomplete="new-password"></label> <label><input type="checkbox" id="cf_rk_clear"> Cancella la chiave salvata</label></div>
    <div class="bar"><label>Mittente (dominio verificato su Resend) <input id="cf_mail_from" size="40" placeholder="Colonnina &lt;ricariche@esempio.it&gt;" autocomplete="off"></label></div>
  </div>
  <div class="card">
    <h2>Telegram</h2>
    <div class="sub">Facoltativo: un bot Telegram manda agli utenti che danno il consenso gli avvisi di servizio (ricarica terminata, importi del mese, esito delle richieste) e accetta richieste di assistenza con i comandi. Crea il bot con BotFather, incolla qui il token e un segreto lungo a caso, salva le impostazioni e premi «Attiva Telegram» (da rifare se cambia il dominio). Gli utenti collegano Telegram dal proprio profilo.</div>
    <div class="bar"><label>Token del bot <input id="cf_telegram_token" type="password" size="28" autocomplete="new-password"></label> <label>Segreto del webhook <input id="cf_telegram_secret" type="password" size="28" autocomplete="new-password"></label> <button type="button" id="bTgGenera">Genera segreto</button> <label><input type="checkbox" id="cf_tg_clear"> Cancella token e segreto salvati</label></div>
    <div class="bar"><button type="button" id="bTgAttiva">Attiva Telegram</button> <span class="sub" id="msgStato"></span> <span class="sub err" id="msgEsito"></span></div>
  </div>
  <div class="bar"><button class="p" id="bCfSalva">Salva impostazioni</button> <button id="bCfProva">Prova il collegamento</button> <button id="bCfReset">Valori predefiniti</button> <span class="sub err" id="cfEsito"></span></div>
  <div id="cfProva"></div>
  <div class="card">
    <h2>Testi legali</h2>
    <div class="sub">Regolamento d'uso della colonnina e informativa privacy mostrati nella registrazione e nell'invito, in italiano e in inglese (HTML semplice: p, b, ul, li). Vanno scritti da chi gestisce il sito: il progetto non ne fornisce. L'edizione (es. una data) viene salvata nei consensi di ogni utente.</div>
    <div class="bar"><label>Edizione <input id="tl_edizione" size="14" placeholder="es. 01-01-2027"></label></div>
    <div class="bar"><label style="width:100%">Regolamento (italiano)<br><textarea id="tl_reg_it" rows="6" style="width:100%"></textarea></label></div>
    <div class="bar"><label style="width:100%">Regolamento (inglese)<br><textarea id="tl_reg_en" rows="6" style="width:100%"></textarea></label></div>
    <div class="bar"><label style="width:100%">Informativa privacy (italiano)<br><textarea id="tl_priv_it" rows="6" style="width:100%"></textarea></label></div>
    <div class="bar"><label style="width:100%">Informativa privacy (inglese)<br><textarea id="tl_priv_en" rows="6" style="width:100%"></textarea></label></div>
    <div class="bar"><button class="p" id="bTesti">Salva testi</button> <span class="sub err" id="tlEsito"></span></div>
  </div>
  <div class="card">
    <h2>Backup del database</h2>
    <div class="bar"><label>Passphrase del backup (almeno 12 caratteri) <input type="password" id="bkP" autocomplete="new-password"></label>
      <label>Ripetila <input type="password" id="bkP2" autocomplete="new-password"></label>
      <button type="button" id="bBackup">Scarica backup cifrato (.sql.enc)</button> <span id="bkEsito" class="sub"></span></div>
    <div class="sub">Il file viene cifrato nel tuo browser con la passphrase (AES-256-GCM): senza passphrase non si legge e non si può recuperare, quindi conservala. Contiene sessioni, tessere, prezzi e utenti, con gli hash delle password. Per ripristinarlo: node decifra_backup.mjs ricariche_AAAA-MM-GG.sql.enc (chiede la passphrase e crea il file .sql), poi npx wrangler d1 execute ricariche --remote --file=ricariche_AAAA-MM-GG.sql</div>
  </div>
  <div class="card hide" id="cPag"><h2>Pagamento tessera</h2><div class="sub">Scrivi solo il nome dell'account a cui deve arrivare il costo della tessera (oppure incolla il link completo). Il costo si imposta qui sopra, nelle impostazioni generali. Le opzioni lasciate vuote non vengono proposte. "Contanti alla consegna" è sempre disponibile. Con PayPal l'utente deve scegliere "Amici e familiari".</div>
    <div class="bar"><label>paypal.me/ <input id="pagPp" placeholder="nome account" size="22" maxlength="200"></label> <label>tag.satispay.com/ <input id="pagSa" placeholder="nome account" size="22" maxlength="200"></label> <label>revolut.me/ <input id="pagRe" placeholder="nome account" size="22" maxlength="200"></label></div>
    <div class="bar"><button id="bPag">Salva</button> <span class="sub" id="pagEs"></span></div></div>
</section>

<section id="t3" class="hide">
  <div class="bar noprint"><label>Utente <select id="selUt"></select></label></div>
  <div class="card"><div class="w"><table id="tabX"></table></div></div>
</section>
</main>
<footer class="piede">Orbis Viaris Charge Report · software libero, <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">licenza AGPL-3.0</a> · <a href="https://github.com/alexxandro87/orbis-viaris-charge-report" target="_blank" rel="noopener">codice sorgente</a></footer>

<script>
var LANG="it";try{LANG=localStorage.getItem("lang")||(((navigator.language||"it").slice(0,2)==="it")?"it":"en")}catch(e){}
var LOC=LANG==="en"?"en-GB":"it-IT";
var EN={"una tantum":"one-off","costo":"cost",
"Indirizzo della colonnina non impostato":"Charger address not set","Indirizzo della colonnina non impostato (scheda Impostazioni)":"Charger address not set (Settings tab)",
"Devi prima confermare l'indirizzo email: controlla la tua posta":"You must confirm your email address first: check your inbox","metodo non valido":"Invalid method","L'admin gestisce i ticket, non li apre":"The admin handles tickets, it does not open them","Ticket non trovato":"Ticket not found","Questo ticket non riguarda una tessera":"This ticket is not about a card","Esito non valido":"Invalid outcome","L'utente non esiste piu'":"The user no longer exists","Non applicabile all'admin":"Not applicable to the admin",
"Inserisci nome e cognome":"Enter first and last name","Devi accettare il regolamento":"You must accept the rules","Devi confermare di aver letto l'informativa privacy":"You must confirm you have read the privacy notice","Richiesta non valida":"Invalid request","Troppe registrazioni da questo indirizzo: riprova tra 10 minuti":"Too many registrations from this address: try again in 10 minutes","La password non rispetta i requisiti":"The password does not meet the requirements","Non sono riuscito a inviare la mail di conferma: riprova più tardi":"Could not send the confirmation email: try again later",
"Invio della lista tessere disattivato: attivalo prima dalla scheda OCPP":"Card list sending is off: turn it on first in the OCPP tab","Codice di configurazione errato":"Wrong setup code","Nome utente non valido":"Invalid user name","Configurazione gia' completata":"Setup already completed","Configurazione iniziale non completata: apri la pagina principale":"Setup not completed: open the home page","Completa il profilo per continuare":"Complete your profile to continue",
"Attesa non valida: da 0 a 240 minuti":"Invalid wait: 0 to 240 minutes","Secondo avviso non valido: 0 (nessuno) oppure da 5 a 1440 minuti":"Invalid reminder: 0 (none) or 5 to 1440 minutes","Parametro non consentito":"Setting not allowed","azione sconosciuta":"Unknown action","La dismissione deve essere dopo l'assegnazione":"The return date must be after the assignment date","Esiste gia' un periodo con quella data":"A period with that date already exists","Dati non validi: serve 'storico' con il testo letto dalla colonnina":"Invalid data: 'storico' with the text read from the charger is required",
"Costo tessera non valido":"Invalid card fee","L'indirizzo della colonnina deve iniziare con http:// o https://":"The charger address must start with http:// or https://","Fuso orario sconosciuto":"Unknown time zone","La risposta dello storico non e' JSON (controlla il campo JSON nelle Impostazioni)":"The history response is not JSON (check the JSON field in Settings)","Per gestire le tessere serve un percorso elenco tessere che contenga level=file (scheda Impostazioni)":"Managing cards needs a card list path containing level=file (Settings tab)",

"Orbis Viaris Charge Report · software libero,":"Orbis Viaris Charge Report · free software,","licenza AGPL-3.0":"AGPL-3.0 licence","codice sorgente":"source code","Invia la lista tessere alla colonnina (OCPP SendLocalList)":"Send the card list to the charger (OCPP SendLocalList)",
"Opzione disattivata di serie: il server non manda nessun elenco tessere. Se la attivi, le tessere attive vengono inviate all'avvio della colonnina, circa 30 secondi dopo una modifica e con il pulsante; mai con un'auto collegata o in carica. Dopo l'invio i nomi vengono rimessi sulla colonnina. Provato solo su firmware Orbis 7.2.53.":"Off by default: the server sends no card list at all. When on, the active cards are sent when the charger starts, about 30 seconds after a change and with the button; never while a car is plugged in or charging. After the send the names are put back on the charger. Tested only on Orbis firmware 7.2.53.",
"Il server riceve e registra i messaggi della colonnina e le manda solo le impostazioni scelte qui sotto (e la lista tessere, se attivata). Il codice dentro l'indirizzo è segreto, chi non lo conosce non può collegarsi. Se lo rigeneri devi aggiornare l'indirizzo sulla colonnina.":"The server receives and records the charger's messages and sends it only the settings chosen below (and the card list, if enabled). The code inside the address is secret: nobody can connect without it. If you regenerate it you must update the address on the charger.",
"GetConfiguration - legge tutte le impostazioni OCPP":"GetConfiguration - reads all OCPP settings","GetLocalListVersion - versione della lista tessere offline":"GetLocalListVersion - version of the offline card list","TriggerMessage - fa inviare subito un messaggio":"TriggerMessage - asks for a message right now","RemoteStopTransaction - ferma la ricarica in corso (non provato)":"RemoteStopTransaction - stops the current charge (untested)",
"Contatto del gestore":"Operator contact","Il contatto del gestore si imposta nella scheda Impostazioni. Per errori del software o proposte usa il codice sorgente (issue su GitHub).":"The operator contact is set in the Settings tab. For software bugs or proposals use the source code (GitHub issues).",
"Indirizzo da cui il sito scarica i dati e legge le tessere. Per una Orbis bastano l'indirizzo e la porta (es. http://nome-ddns:81); gli altri campi servono solo per colonnine con risposte diverse.":"Address the site downloads data from and reads the cards from. For an Orbis the address and port are enough (e.g. http://ddns-name:81); the other fields are only for chargers with different responses.",
"Indirizzo (http:// o https://)":"Address (http:// or https://)","Utente (se la colonnina chiede una password)":"User (if the charger asks for a password)","Cancella la password salvata":"Clear the saved password","Intestazione aggiuntiva, nome":"Extra header, name","Valore":"Value","Percorso dello storico":"History path","Percorso dell'elenco tessere (deve contenere level=file)":"Card list path (must contain level=file)","Percorso dello stato (vuoto = non controllato)":"Status path (empty = not checked)","Tempo massimo di risposta, secondi":"Response timeout, seconds","Scarico automatico ogni 6 ore":"Automatic download every 6 hours",
"Formato dei dati (solo se la colonnina non è una Orbis)":"Data format (only if the charger is not an Orbis)","Campo JSON con le righe dello storico (vuoto = la risposta è già CSV)":"JSON field holding the history rows (empty = the response is already CSV)","Separatore":"Separator","Righe da saltare":"Rows to skip","Colonna inizio":"Start column","Colonna fine":"End column","Colonna tessera":"Card column","Colonna tipo":"Type column","Colonna contatore iniziale":"Start meter column","Colonna contatore finale":"End meter column",
"Sito":"Site","Titolo del sito":"Site title","Fuso orario":"Time zone","Valuta":"Currency","Etichetta dell'imposta (vuoto = IVA)":"Tax label (empty = VAT)","Costo della tessera (0 = non mostrato)":"Card fee (0 = not shown)","Contatto del gestore (email o testo, facoltativo)":"Operator contact (email or text, optional)","Identificativo della colonnina nell'indirizzo OCPP":"Charger identifier in the OCPP address",
"Il titolo compare nelle pagine, nelle mail e nei PDF. Il costo della tessera è mostrato a chi la richiede dalla scheda Assistenza, nella registrazione e nelle mail. Il contatto compare nel profilo e nella scheda Informazioni.":"The title appears in the pages, emails and PDFs. The card fee is shown to whoever requests a card from the Support tab, in the registration and in the emails. The contact appears in the profile and in the About tab.",
"Facoltativo, con Resend (resend.com): serve per inviti, registrazioni, report, ticket e avvisi. Senza, il sito mostra i link da inviare a mano e le mail non partono. La chiave si può anche mettere come secret RESEND_API_KEY.":"Optional, with Resend (resend.com): used for invitations, registrations, reports, tickets and alerts. Without it the site shows links to send by hand and no email goes out. The key can also be set as the RESEND_API_KEY secret.",
"Chiave API Resend":"Resend API key","Cancella la chiave salvata":"Clear the saved key","Mittente (dominio verificato su Resend)":"Sender (domain verified on Resend)","Salva impostazioni":"Save settings","Prova il collegamento":"Test the connection","Valori predefiniti":"Default values",
"Testi legali":"Legal texts","Regolamento d'uso della colonnina e informativa privacy mostrati nella registrazione e nell'invito, in italiano e in inglese (HTML semplice: p, b, ul, li). Vanno scritti da chi gestisce il sito: il progetto non ne fornisce. L'edizione (es. una data) viene salvata nei consensi di ogni utente.":"Charger rules and privacy notice shown in the registration and invitation pages, in Italian and English (simple HTML: p, b, ul, li). They must be written by whoever runs the site: the project provides none. The edition (e.g. a date) is saved with each user's consents.",
"Edizione":"Edition","Regolamento (italiano)":"Rules (Italian)","Regolamento (inglese)":"Rules (English)","Informativa privacy (italiano)":"Privacy notice (Italian)","Informativa privacy (inglese)":"Privacy notice (English)","Salva testi":"Save texts","Testi salvati":"Texts saved",
"Passphrase del backup (almeno 12 caratteri)":"Backup passphrase (at least 12 characters)","Ripetila":"Repeat it",
"Scrivi solo il nome dell'account a cui deve arrivare il costo della tessera (oppure incolla il link completo). Il costo si imposta qui sopra, nelle impostazioni generali. Le opzioni lasciate vuote non vengono proposte. \"Contanti alla consegna\" è sempre disponibile. Con PayPal l'utente deve scegliere \"Amici e familiari\".":"Write only the account name the card fee must go to (or paste the full link). The fee is set above, in the site settings. Empty options are not offered. \"Cash on delivery\" is always available. With PayPal the user must choose \"Friends and family\".",
"Tutto l'anno":"Whole year","(salvata)":"(saved)","(valore iniziale da wrangler.toml)":"(initial value from wrangler.toml)","Elenco tessere":"Card list","Righe lette: ":"Rows read: ","Prima sessione: ":"First session: ","tessera ":"card ","Lista offline: disattivata, il server non invia tessere alla colonnina":"Offline list: off, the server sends no cards to the charger",
"Impostazioni salvate":"Settings saved","Storico":"History","ok":"ok","errore":"error",
"Cambia password":"Change password",
"Esci":"Log out",
"Caricamento...":"Loading...",
"Scarica dalla colonnina":"Download from the charger",
"Importa CSV Viaris":"Import Viaris CSV",
"Password attuale":"Current password",
"Nuova password (min. 12, con maiuscola, numero e simbolo)":"New password (min. 12, with uppercase, digit and symbol)",
"Ripeti la nuova password":"Repeat the new password",
"Salva":"Save",
"Report mensile":"Monthly report",
"Storico annuale":"Yearly history",
"Tutte le sessioni":"All sessions",
"Utenti":"Users","Utenti/Card":"Users/Cards","Prepagate":"Prepaid","Tessere prepagate":"Prepaid cards","Il prezzo serve solo a scalare il credito e lo decidi tu, tessera per tessera. Il consumo conta le ricariche dalla data di attivazione, compresa quella in corso. A credito esaurito la tessera viene bloccata sulla colonnina e la ricarica in corso viene fermata da remoto; l'utente riceve mail e messaggio. Aggiungere credito sblocca la tessera. Tocca una riga per sceglierla.":"The price only serves to deduct the credit and you choose it card by card. Usage counts the charges since activation, including the ongoing one. When the credit is used up the card is blocked on the charger and the ongoing charge is stopped remotely; the user gets an email and a message. Adding credit unblocks the card. Tap a row to select it.","Aggiungi credito o modifica":"Add credit or edit","Importo da aggiungere":"Amount to add","Prezzo €/kWh":"Price €/kWh","Avviso sotto":"Warn below","Torna a consumo":"Back to pay-per-use","Rendi prepagata una tessera esistente":"Make an existing card prepaid","Credito iniziale":"Initial credit","Attiva prepagata":"Activate prepaid","Tessere già presenti sulla colonnina. Da questo momento le loro ricariche scalano il credito. Le tessere nuove si aggiungono dalla scheda Utenti/Card scegliendo il tipo «Prepagata».":"Cards already on the charger. From now on their charges are deducted from the credit. New cards are added from the Users/Cards tab choosing the type \u201cPrepaid\u201d.","Tipo":"Type","A consumo":"Pay-per-use","Prepagata":"Prepaid","Prepagata: il credito scala con questo prezzo; a zero la tessera viene bloccata. Con credito 0 resta bloccata finché non aggiungi credito dalla scheda Prepagate.":"Prepaid: the credit is deducted at this price; at zero the card is blocked. With credit 0 it stays blocked until you add credit from the Prepaid tab.","Indica il prezzo al kWh della prepagata":"Enter the price per kWh of the prepaid card","Tessera aggiunta e attivata come prepagata":"Card added and activated as prepaid","prepagata":"prepaid","Caricato":"Loaded","Consumato":"Used","Residuo":"Remaining","bloccata":"blocked","credito esaurito":"credit used up","credito basso, avvisato":"low credit, notified","attiva":"active","in ricarica":"charging","Nessuna tessera prepagata":"No prepaid card","Storico: ":"History: ","attivata":"activated","credito +":"credit +","prezzo ":"price ","soglia ":"threshold ","blocco":"blocked","sblocco":"unblocked","avviso":"notified","stop ricarica":"charge stopped","Niente da salvare":"Nothing to save","Riportare la tessera a consumo? Il credito residuo non viene più controllato e la tessera, se bloccata per il credito, viene sbloccata.":"Set the card back to pay-per-use? The remaining credit is no longer checked and the card, if blocked for the credit, is unblocked.","Tessera attivata come prepagata":"Card activated as prepaid","Tessera già prepagata":"Card already prepaid","Valori non validi":"Invalid values","Codice tessera non valido":"Invalid card code","Azione non valida":"Invalid action","Tessera prepagata":"Prepaid card","Credito residuo":"Remaining credit","Prezzo":"Price","Ancora disponibili":"Still available","Consumato dal ":"Used since ","Credito esaurito: la tessera è bloccata. Per ricaricare il credito contatta l'amministratore.":"Credit used up: the card is blocked. To top up the credit contact the administrator.","Credito quasi esaurito. ":"Credit almost used up. ","Quando il credito arriva a zero la ricarica si ferma e la tessera viene bloccata. Per ricaricare il credito contatta l'amministratore.":"When the credit reaches zero the charge stops and the card is blocked. To top up the credit contact the administrator.",
"Backup del database":"Database backup",
"Scarica backup (.sql)":"Download backup (.sql)",
"Il file viene cifrato nel tuo browser con la passphrase (AES-256-GCM): senza passphrase non si legge e non si può recuperare, quindi conservala. Contiene sessioni, tessere, prezzi e utenti, con gli hash delle password. Per ripristinarlo: node decifra_backup.mjs ricariche_AAAA-MM-GG.sql.enc (chiede la passphrase e crea il file .sql), poi npx wrangler d1 execute ricariche --remote --file=ricariche_AAAA-MM-GG.sql":"The file is encrypted in your browser with the passphrase (AES-256-GCM): without the passphrase it cannot be read or recovered, so keep it. It contains sessions, cards, prices and users, with password hashes. To restore it: node decifra_backup.mjs ricariche_YYYY-MM-DD.sql.enc (asks for the passphrase and creates the .sql file), then npx wrangler d1 execute ricariche --remote --file=ricariche_YYYY-MM-DD.sql",
"Le mie ricariche":"My charges",
"Prezzo €/kWh":"Price €/kWh",
"IVA %":"VAT %",
"Salva prezzo":"Save price",
"Ricariche con tessera":"Charges with a card",
"Ricariche avviate da app (non attribuite a una tessera)":"Charges started from the app (not assigned to a card)",
"Stampa / PDF":"Print / PDF",
"Esporta CSV":"Export CSV",
"Tocca un mese per aprirlo. I mesi senza prezzo mostrano solo i kWh.":"Tap a month to open it. Months without a price show kWh only.",
"Tocca un mese per vedere le singole ricariche.":"Tap a month to see the individual charges.",
"Invita un utente o modifica i permessi":"Invite a user or edit permissions",
"email dell'utente":"user's email",
"Tipo di utente":"User type",
"Gestione (scegli i permessi)":"Management (choose the permissions)",
"Utente della colonnina (vede solo le sue ricariche)":"Charger user (sees only their own charges)",
"Tessera":"Card",
"Vedere il report mensile":"View the monthly report",
"Vedere lo storico annuale":"View the yearly history",
"Vedere tutte le sessioni":"View all sessions",
"Inserire prezzo kWh e IVA":"Enter the kWh price and VAT",
"Stampare ed esportare i report":"Print and export reports",
"Scaricare dalla colonnina e importare CSV":"Download from the charger and import CSV",
"Vedere le ricariche avviate da app":"View charges started from the app",
"Invia invito":"Send invite",
"Canali di contatto":"Contact channels","Conteggio sugli utenti con profilo. I messaggi inviati per canale, mese per mese, sono nel Monitoraggio (Consumi).":"Count over users with a profile. Messages sent per channel, month by month, are in Monitoring (Usage).","Utenti con profilo":"Users with a profile","Consenso WhatsApp":"WhatsApp consent","di cui con secondo numero":"of which with a second number","Consenso Telegram":"Telegram consent","Telegram collegato":"Telegram linked","con due chat":"with two chats","Entrambi i consensi":"Both consents","Nessun consenso (solo mail)":"No consent (email only)","Comunicazione a tutti gli utenti":"Message to all users","Oggetto (italiano / inglese)":"Subject (Italian / English)","Testo italiano":"Italian text","Testo inglese":"English text","Anche su Telegram a chi lo ha collegato":"Also on Telegram to those who linked it","Anteprima":"Preview","Invia a ":"Send to "," utenti":" users","Va a tutti gli account attivi con email confermata, tranne l'admin; al massimo 44 mail per invio. L'anteprima mostra quanti sono i destinatari e la mail come arriverà. Ogni riga del testo diventa una riga della mail.":"Goes to every active account with a confirmed email, except the admin; at most 44 emails per send. The preview shows how many recipients there are and the email as it will arrive. Each line of the text becomes a line of the email.","Servono oggetto, testo italiano e testo inglese":"Subject, Italian text and English text are required","Inviare la comunicazione a tutti gli utenti? Non si può annullare.":"Send the message to all users? This cannot be undone.","Inviate ":"Sent "," non inviate per il limite":" not sent because of the limit"," messaggi in partenza entro 5 minuti":" messages leaving within 5 minutes","Salva solo i permessi":"Save permissions only","Telefono facoltativo":"Optional phone","Salva permessi e dati":"Save permissions and details","Permessi e dati salvati":"Permissions and details saved","Cognome":"Last name","Telegram":"Telegram","Token del bot":"Bot token","Segreto del webhook":"Webhook secret","Genera segreto":"Generate secret","Cancella token e segreto salvati":"Clear the saved token and secret","Attiva Telegram":"Activate Telegram","non configurato":"not configured","attivo, bot @":"active, bot @","salvato, bot da attivare":"saved, bot to activate","Telegram attivato":"Telegram activated","(salvato)":"(saved)","Telegram non configurato: inserisci token e segreto nelle Impostazioni":"Telegram not configured: enter token and secret in Settings","Telegram non ancora attivato dall'amministratore":"Telegram not yet activated by the administrator","Hai già due chat Telegram collegate":"You already have two Telegram chats linked","collegato":"linked","non collegato":"not linked","Collega Telegram":"Link Telegram","Collega un secondo Telegram":"Link a second Telegram","Scollega Telegram":"Unlink Telegram","Apri Telegram e premi Avvia":"Open Telegram and press Start","(il collegamento vale 15 minuti)":"(the link is valid for 15 minutes)","Scollegare Telegram (tutte le chat collegate)? Non riceverai più messaggi lì.":"Unlink Telegram (all linked chats)? You will no longer receive messages there."," messaggi Telegram in partenza entro 5 minuti":" Telegram messages leaving within 5 minutes","Messaggio non consegnato":"Message not delivered","Facoltativo: un bot Telegram manda agli utenti che danno il consenso gli avvisi di servizio (ricarica terminata, importi del mese, esito delle richieste) e accetta richieste di assistenza con i comandi. Crea il bot con BotFather, incolla qui il token e un segreto lungo a caso, salva le impostazioni e premi «Attiva Telegram» (da rifare se cambia il dominio). Gli utenti collegano Telegram dal proprio profilo.":"Optional: a Telegram bot sends service notices to the users who consent (charging finished, monthly amounts, request outcomes) and accepts support requests through commands. Create the bot with BotFather, paste the token and a long random secret here, save the settings and press “Activate Telegram” (repeat if the domain changes). Users link Telegram from their own profile.",
"Stato":"Status","Fuori servizio":"Out of service","In servizio":"In service","Fermare la ricarica in corso?":"Stop the charge in progress?","Mettere la colonnina fuori servizio? Nessuno potrà caricare finché non la rimetti in servizio.":"Put the charger out of service? Nobody will be able to charge until you put it back in service.","Rimettere la colonnina in servizio?":"Put the charger back in service?","Nessuna ricarica in corso da fermare":"No charge in progress to stop",
"Comandi OCPP":"OCPP commands","Comando":"Command","Messaggio":"Message","Durata (secondi)":"Duration (seconds)","Invia":"Send","Voce":"Key","Valore":"Value","Modificabile":"Editable","no":"no","sì":"yes","Voci sconosciute: ":"Unknown keys: ","In attesa della risposta...":"Waiting for the reply...","Risposta ricevuta alle ":"Reply received at ","Colonnina non collegata al server":"Charger not connected to the server","Nessuna risposta entro 15 secondi":"No reply within 15 seconds","Comando non consentito":"Command not allowed","I comandi di lettura non cambiano nulla. RemoteStopTransaction agisce sulla colonnina e non è ancora stato provato su quella reale: chiede conferma prima dell'invio. La risposta arriva dalla colonnina stessa, entro 15 secondi.":"Read commands change nothing. RemoteStopTransaction acts on the charger and has not been tried on the real one yet: it asks for confirmation before sending. The reply comes from the charger itself, within 15 seconds.",
"In corso":"In progress","Ricarica in corso":"Charging now","Occupata":"Busy","Colonnina libera":"Charger free","Auto collegata, in attesa della tessera":"Car plugged in, waiting for the card","Colonnina non collegata al server: dati non disponibili":"Charger not connected to the server: no data available","Potenza":"Power","Corrente":"Current","Tensione":"Voltage","Energia caricata":"Energy charged","Inizio":"Start","Durata":"Duration","Tessera":"Card","Aggiornato alle ":"Updated at ","tessera sconosciuta":"unknown card","Sincronizza lista tessere":"Sync card list","Lista offline: ":"Offline list: ","Lista offline: aggiornamento in attesa che la presa sia libera":"Offline list: update waiting until the socket is free","Lista offline: nessun invio registrato":"Offline list: nothing sent yet"," tessere inviate il ":" cards sent on ","tessere inviate il ":"cards sent on ","allineata":"in sync","ultimo invio non riuscito":"last send failed","invio non completato":"send not completed","Vedere i dettagli della ricarica in corso (potenza, kWh...)":"View live charge details (power, kWh...)","ricarica in corso":"charge in progress",
"L'utente riceve una mail con un link monouso (valido 48 ore) per scegliere la propria password al primo accesso.":"The user receives an email with a single-use link (valid for 48 hours) to choose their own password on first sign-in.",
"Utente":"User",
"Tutti":"All",
"Mese":"Month",
"Stato":"Status",
"Permessi / tessera":"Permissions / card",
"Sess.":"Sess.",
"Imponibile":"Net amount",
"IVA":"VAT",
"Totale":"Total",
"Inizio":"Start",
"Fine":"End",
"kWh tess.":"kWh cards",
"kWh tot.":"kWh total",
"Ricariche":"Charges",
"Gennaio":"January",
"Febbraio":"February",
"Marzo":"March",
"Aprile":"April",
"Maggio":"May",
"Giugno":"June",
"Luglio":"July",
"Agosto":"August",
"Settembre":"September",
"Ottobre":"October",
"Novembre":"November",
"Dicembre":"December",
" sessione":" session",
" sessioni":" sessions",
" dal ":" from ",
" al ":" to ",
"Archivio vuoto":"Empty archive",
" · aggiornato il ":" · updated on ",
"Ultimo scarico non riuscito: ":"Last download failed: ",
"Ripartizione costi ricarica - ":"Charging cost split - ",
"Prezzo non ancora inserito":"Price not entered yet","I mesi senza prezzo (-) non hanno ancora l'importo perché il prezzo dell'energia non è ancora stato inserito dall'Amministratore: l'importo viene calcolato appena il prezzo è disponibile.":"Months without a price (-) have no amount yet because the Administrator has not entered the energy price yet: the amount is calculated as soon as the price is available.",
"Prezzo ":"Price ",
" €/kWh, IVA ":" €/kWh, VAT ",
"sessioni: ":"sessions: ",
"Inserisci il prezzo del kWh di questo mese e premi Salva prezzo per calcolare gli importi.":"Enter this month's kWh price and press Save price to calculate the amounts.",
"Inserisci il prezzo del kWh di questo mese e premi Salva prezzo per calcolare gli importi. Dopo il salvataggio non si potra' piu' modificare.":"Enter this month's kWh price and press Save price to calculate the amounts. Once saved it can no longer be changed.",
"Prezzo bloccato: una volta inserito non si puo' piu' modificare.":"Price locked: once entered it can no longer be changed.",
"Dopo il salvataggio il prezzo di questo mese non si potra' piu' modificare e il report verra' inviato per mail ai destinatari e ogni utente ricevera' i propri importi. Confermi?":"Once saved, this month's price can no longer be changed and the report will be emailed to the recipients and each user will receive their own amounts. Confirm?",
"Destinatari report mensili":"Monthly report recipients",
"Impostazioni":"Settings",
"Scarica PDF":"Download PDF",
"Tutto l'anno":"Whole year",
"A (separa più indirizzi con la virgola)":"To (separate several addresses with commas)",
"In copia (separa più indirizzi con la virgola)":"Cc (separate several addresses with commas)",
"Salva destinatari":"Save recipients",
"Appena viene inserito il prezzo di un mese, il report con i totali per tessera viene inviato a questi indirizzi (le ricariche avviate da app non sono incluse).":"As soon as a month's price is entered, the report with totals per card is emailed to these addresses (charges started from the app are not included).",
"tessera sbloccata":"card unblocked","bloccata sulla colonnina":"blocked on the charger","tessera non presente sulla colonnina":"card not present on the charger","blocco in attesa: la colonnina non risponde, riprovo ogni 5 minuti":"block pending: the charger is not responding, retrying every 5 minutes",
"Sblocca tessera":"Unblock card","Sostituisci tessera":"Replace card","nessuna nuova tessera (la vecchia viene solo dismessa)":"no new card (the old one is only retired)","Rifiuta e sblocca":"Reject and unblock","Ritrovata: sblocca e chiudi":"Found: unblock and close",

"Tessera sbloccata.":"Card unblocked.","Sblocco in attesa: la colonnina non risponde, riprovo ogni 5 minuti.":"Unblock pending: the charger is not responding, retrying every 5 minutes.",
"Assistenza":"Support","Integrazione":"Addition","Aggiungi informazioni a questa richiesta":"Add information to this request","Aggiungi":"Add","Ticket gia' gestito: non si puo' piu' integrare":"Ticket already handled: it can no longer be supplemented","Hai raggiunto il numero massimo di integrazioni":"You have reached the maximum number of additions","Ticket":"Tickets","Informazioni":"Information","Informazioni e contatti":"Information and contacts","Realizzata da":"Created by","Contatto":"Contact","Codice sorgente":"Source code","Licenza":"License",
"Per assistenza tecnica sulla webapp, segnalazione di errori o per subentrare nella gestione, scrivi all'indirizzo indicato.":"For technical support on the web app, to report errors or to take over its management, write to the address above.",
"Da qui puoi inviare una richiesta all'Amministratore. Riceverai l'esito per email.":"From here you can send a request to the Administrator. You will receive the outcome by email.",
"Tipo di richiesta":"Request type","Tessera smarrita o danneggiata":"Lost or damaged card","Correzione dei dati":"Correction of my data","Cancellazione dei dati / dell'utenza":"Deletion of my data / account","Problema con la colonnina":"Problem with the charger","Altro":"Other",
"Smarrita":"Lost","Danneggiata":"Damaged","Motivo":"Reason","smarrita":"lost","danneggiata":"damaged",
"Compila solo i campi da cambiare. I telefoni con il prefisso internazionale (es. +39 333 1234567).":"Fill in only the fields to change. Phone numbers with the international prefix (e.g. +39 333 1234567).",
"Se l'Amministratore approva, l'utenza e i tuoi dati personali vengono cancellati; restano solo i dati di consumo che il gestore deve conservare per legge.":"If the Administrator approves, your account and personal data are deleted; only the consumption data the operator must keep by law remain.",
"Messaggio":"Message","Invia richiesta":"Send request","Le mie richieste":"My requests","Richieste degli utenti":"Users' requests","Nessuna richiesta":"No requests",
"aperta":"open","approvata":"approved","rifiutata":"rejected","chiusa":"closed","Tessera ":"Card ","Secondo telefono":"Second phone",
"Nota dell'Amministratore: ":"Administrator's note: ","Nota per l'utente (facoltativa)":"Note for the user (optional)","nessuna nuova tessera":"no new card",
"Approva":"Approve","Rifiuta":"Reject","Chiudi":"Close","Cancellare definitivamente l'utenza e i dati di ":"Permanently delete the account and data of ","Scollegare la tessera dall'utente?":"Unlink the card from the user?",
"Richiesta inviata: riceverai l'esito per email":"Request sent: you will receive the outcome by email",
"Tipo di richiesta non valido":"Invalid request type","Scegli una delle tue tessere":"Choose one of your cards","Scrivi il messaggio":"Write the message","Indica cosa vuoi correggere":"Say what you want to correct",
"Hai gia' 5 richieste aperte: attendi che vengano gestite":"You already have 5 open requests: wait until they are handled","Ticket gia' gestito":"Ticket already handled",
"Questo tipo di richiesta si chiude, non si approva":"This request type is closed, not approved","Numero di telefono non valido":"Invalid phone number","Secondo numero di telefono non valido":"Invalid second phone number",
"Per correggere i dati o chiederne la cancellazione apri una richiesta dalla scheda «Assistenza»":"To correct your data or ask for its deletion, open a request from the «Support» tab",", oppure scrivi a ":", or write to ",
"Altre tessere, facoltativo (Ctrl/⌘ per sceglierne più di una)":"Other cards, optional (Ctrl/⌘ to pick more than one)",
"Mail e messaggi inviati dal sito":"Emails and messages sent by the site","Nessun invio contato finora. ":"No sends counted yet. ","Resend gratuito: 3.000 mail al mese e 100 al giorno (tra parentesi la quota mensile); Telegram non ha limiti di costo.":"Free Resend: 3,000 emails a month and 100 a day (monthly share in brackets); Telegram has no cost limits.","Messaggi in coda: ":"Queued messages: ","Cosa consuma (conteggio del sito)":"What consumes (site count)","Pagina / API":"Page / API","Chiamate":"Calls","Query D1":"D1 queries","Chiamate in uscita":"Outbound calls","Nessun dato finora. ":"No data yet. ","Richieste pesanti (oltre 35): ":"Heavy requests (over 35): ","chiamate":"calls","Conteggio del sito dalla versione 2.8.0: per ogni pagina o API, chiamate, query D1 e chiamate in uscita (mail, messaggi, colonnina), oggi e ieri (UTC). Le query del server OCPP non sono incluse. Per singola richiesta il piano gratuito ammette 50 query D1 e 50 chiamate in uscita.":"Site count since version 2.8.0: for each page or API, calls, D1 queries and outbound calls (emails, messages, charger), today and yesterday (UTC). The OCPP server queries are not included. Per request the free plan allows 50 D1 queries and 50 outbound calls.","Consumi Cloudflare":"Cloudflare usage","Sessioni":"Sessions","Profilo":"Profile","Info":"Info","Report":"Report","OCPP":"OCPP","Il consenso è facoltativo. Puoi cambiarlo o revocarlo quando vuoi da qui: la modifica vale subito e ne resta traccia con data e ora. I tuoi dati sono usati solo per erogare il servizio, senza cessione a terzi e senza pubblicità.":"Consent is optional. You can change or withdraw it at any time from here: the change takes effect immediately and is recorded with date and time. Your data is used only to provide the service, with no disclosure to third parties and no advertising.","Notifiche":"Notifications","Il mio profilo":"My profile","Messaggi di servizio":"Service messages","Telefono":"Phone","Acconsento a ricevere messaggi di servizio su Telegram":"I agree to receive service messages on Telegram","Ultima modifica del consenso: ":"Last consent change: ","Passphrase del backup (almeno 12 caratteri) ":"Backup passphrase (at least 12 characters) ","Ripetila ":"Repeat it ","Scarica backup cifrato (.sql.enc)":"Download encrypted backup (.sql.enc)","La passphrase deve avere almeno 12 caratteri":"The passphrase must have at least 12 characters","Le due passphrase non coincidono":"The two passphrases do not match","Backup cifrato scaricato":"Encrypted backup downloaded","Backup non riuscito":"Backup failed","Cifratura dei dati personali: attiva":"Personal data encryption: on","Cifratura dei dati personali NON attiva: manca il secret DATA_KEY, i dati dei nuovi utenti restano in chiaro (vedi README)":"Personal data encryption NOT on: the DATA_KEY secret is missing, new users' data stays in clear text (see README)","campi cifrati":"encrypted fields","in chiaro":"in clear","Spazio occupato (limite 5 GB ciascuno, totale):":"Space used (5 GB limit each, total):","server OCPP":"OCPP server","Limite giornaliero":"Daily limit","OCPP righe lette":"OCPP rows read","OCPP righe scritte":"OCPP rows written","righe lette OCPP":"OCPP rows read","righe scritte OCPP":"OCPP rows written","Riepilogo mensile":"Monthly summary","Mese":"Month","Giorno di picco":"Peak day","richieste del sito":"site requests","righe lette D1":"D1 rows read","righe scritte D1":"D1 rows written","richieste OCPP":"OCPP requests","durata OCPP":"OCPP duration","Attiva utenza":"Activate account","Utenza attivata: mail inviata a ":"Account activated: mail sent to ","Utenza attivata, ma la mail non è partita (":"Account activated, but the mail was not sent (","Tessera abbinata: l'utenza si attiverà quando l'utente conferma l'email":"Card linked: the account will activate when the user confirms the email","Notifica":"Notification","Segna come lette":"Mark as read","Nessuna notifica":"No notifications","Qui compaiono gli avvisi che non partono via mail: controlli solo notifica (consumi Cloudflare), mail non inviate, nessun destinatario impostato.":"Alerts that are not sent by email appear here: notification-only checks (Cloudflare usage), unsent mails, no recipients set.","Nuova registrazione da attivare":"New registration to activate","Consumi Cloudflare vicini al limite giornaliero gratuito":"Cloudflare usage close to the free daily limit","% del limite":"% of the limit","Giorno (UTC)":"Day (UTC)","Richieste sito":"Site requests","Errori":"Errors","D1 righe lette":"D1 rows read","D1 righe scritte":"D1 rows written","Richieste OCPP":"OCPP requests","Per vedere i consumi serve un token Cloudflare con il permesso Account Analytics: Read (secret CF_API_TOKEN) e CF_ACCOUNT_ID in wrangler.toml.":"To see usage you need a Cloudflare token with the Account Analytics: Read permission (secret CF_API_TOKEN) and CF_ACCOUNT_ID in wrangler.toml.","Tutti i limiti del piano gratuito sono giornalieri e si azzerano alle 00:00 UTC (01:00 ora solare, 02:00 ora legale in Italia); non ce ne sono di mensili. Tra parentesi la quota del limite del giorno. Il giorno corrente è parziale. Il riepilogo mensile somma i giorni e indica il giorno più vicino al limite. Lo spazio (5 GB totali per D1 e per il server OCPP) non è giornaliero: si accumula e conta nell'avviso. Non monitorata la CPU (10 ms per richiesta). Dati aggiornati alle ":"All free plan limits are daily and reset at 00:00 UTC (01:00 winter time, 02:00 summer time in Italy); there are no monthly ones. In brackets: share of the day's limit. The current day is partial. The monthly summary adds up the days and shows the day closest to the limit. Storage (5 GB in total for D1 and for the OCPP server) is not daily: it accumulates and counts in the alert. CPU (10 ms per request) is not monitored. Data updated at ","Destinatari salvati":"Recipients saved","Destinatari malfunzionamenti":"Malfunction recipients","Impostazioni salvate":"Settings saved","Avvisi agli utenti":"Notices to users","Avvisa chi ha caricato quando la ricarica è finita e l'auto è ancora collegata":"Notify the user when charging has finished and the car is still plugged in","Prima mail dopo":"First mail after","minuti dalla fine della ricarica":"minutes after charging ends","Secondo avviso dopo":"Second notice after","minuti (0 = nessuno)":"minutes (0 = none)","Salvato":"Saved","La mail arriva all'indirizzo dell'utente registrato con la tessera usata, per liberare la colonnina. Il controllo gira ogni 5 minuti, quindi la mail può arrivare fino a 5 minuti dopo l'attesa impostata. Vale anche quando la colonnina resta in «Charging» ad auto piena (contatore fermo e potenza zero).":"The mail goes to the registered user of the card used, to free the charger. The check runs every 5 minutes, so the mail may arrive up to 5 minutes after the set delay. It also applies when the charger stays in “Charging” with a full car (counter still and zero power).","Monitoraggio":"Monitoring","Controllo":"Check","Soglia":"Threshold","avviso singolo":"single notice","Ultimi episodi":"Latest episodes","Dal":"From","Al":"To","Mail":"Mail","inviata":"sent","non inviata":"not sent","Nessun episodio registrato":"No episodes recorded","Ultimo controllo: ":"Last check: ","Il controllo non è ancora partito":"The check has not run yet","in corso":"ongoing","Connessione":"Connection","Presa e ricariche":"Socket and charging","Tessere":"Cards","Impostazioni":"Settings","Sito e sicurezza":"Site and security","Riconnessioni troppo frequenti":"Too many reconnections","Riavvio imprevisto della colonnina":"Unexpected charger restart","Orologio della colonnina sfasato":"Charger clock out of sync","Indirizzo IP pubblico cambiato":"Public IP address changed","Presa non disponibile (Unavailable)":"Socket unavailable (Unavailable)","Cavo collegato ma nessuna ricarica":"Cable plugged in but not charging","Ricarica in corso ma energia ferma":"Charging but energy not increasing","Ricarica troppo lunga":"Charging session too long","Troppi kWh in una sola ricarica":"Too many kWh in a single session","Ricarica rimasta aperta dopo lo scollegamento":"Session left open after unplugging","Stessa tessera rifiutata più volte":"Same card rejected several times","Tessere sulla colonnina diverse da quelle del sito":"Cards on the charger differ from the site","Nomi delle tessere non ripristinati":"Card names not restored","Impostazione della colonnina diversa da quella voluta":"Charger setting differs from the wanted one","Versione del firmware cambiata":"Firmware version changed","Backup del database non fatto da molto":"Database backup not done for a long time","Troppi tentativi di accesso falliti":"Too many failed login attempts","Collegamenti OCPP con codice segreto sbagliato":"OCPP connections with a wrong secret code","cadute in un'ora":"drops per hour","minuti di differenza":"minutes of difference","rifiuti in un'ora":"rejections per hour","tentativi in un'ora":"attempts per hour","giorni":"days","Tutti i controlli partono disattivati: accendi quelli che vuoi. Il controllo gira ogni 5 minuti. Quando un problema dura più della soglia parte una mail con il tipo di malfunzionamento, e una seconda quando rientra; gli avvisi singoli (riavvio, IP, firmware) arrivano una volta sola. Il controllo del battito tiene conto dell'intervallo di Conferma collegamento (soglia almeno il doppio).":"All checks start off: turn on the ones you want. The check runs every 5 minutes. When a problem lasts longer than the threshold a mail with the malfunction type is sent, and a second one when it clears; single notices (restart, IP, firmware) arrive once. The heartbeat check accounts for the connection-check interval (threshold at least double).","Malfunzionamento":"Malfunction","Dopo":"After","Stato":"Status","disattivato":"off","regolare":"normal","segnalato il ":"reported on ","in corso dal ":"ongoing since ","mail non inviata":"mail not sent","Mail di prova inviata":"Test mail sent","minuti":"minutes","ore":"hours","Colonnina non collegata al server":"Charger not connected to the server","Colonnina collegata ma senza messaggi (nemmeno il battito)":"Charger connected but silent (not even the heartbeat)","Presa in errore":"Socket in error","Dati non scaricati dalla colonnina":"Data not downloaded from the charger","Invio lista tessere alla colonnina non riuscito":"Sending the card list to the charger failed","Invia mail di prova":"Send test mail","Il controllo gira ogni 5 minuti. Quando un problema dura più della soglia parte una mail con il tipo di malfunzionamento, e una seconda quando rientra. Il controllo del battito tiene conto dell'intervallo di Conferma collegamento (soglia almeno il doppio).":"The check runs every 5 minutes. When a problem lasts longer than the threshold a mail with the malfunction type is sent, and a second one when it clears. The heartbeat check accounts for the connection-check interval (threshold at least double).",
"Colonnina":"Charger",
"Indirizzo":"Address",
"Porta":"Port",
"Salva e prova":"Save and test",
"Indirizzo da cui il sito scarica i dati ogni 6 ore. Lascia vuoto l'indirizzo e salva per tornare a quello di wrangler.toml.":"Address the site downloads the data from every 6 hours. Leave the address empty and save to go back to the one in wrangler.toml.",
"In uso: ":"In use: ",
"IP all'ultimo scarico: ":"IP at last download: ",
"IP non ancora rilevato (compare dopo il prossimo scarico)":"IP not detected yet (shown after the next download)",
"Provo la connessione...":"Testing the connection...",
"Salvato: colonnina raggiungibile":"Saved: charger reachable",
"Salvato, ma la colonnina non risponde: ":"Saved, but the charger does not answer: ",
"Indirizzo non valido":"Invalid address",
"Porta non valida":"Invalid port",
"Tessere RFID della colonnina":"Charger RFID cards",
"Impostazioni OCPP":"OCPP settings","Il server manda alla colonnina solo i valori che cambi, subito o al primo messaggio utile, e li rimanda a ogni riavvio. Per vedere i valori letti dalla colonnina usa GetConfiguration.":"The server sends the charger only the values you change, right away or with its next message, and sends them again at every restart. Use GetConfiguration to see the values read from the charger.",
"Mostra i messaggi grezzi":"Show raw messages","Mostra precedenti":"Show earlier","Fine del registro (conservato 48 ore)":"End of the log (48 hours kept)",
"Avvio colonnina":"Charger start",
"Conferma collegamento":"Connection check",
"Misura":"Reading",
"Indirizzo da dare alla colonnina":"Address to give to the charger",
"Aggiorna":"Refresh",
"Rigenera codice segreto":"Regenerate secret code",
"Il server riceve e registra i messaggi della colonnina e le manda solo le impostazioni offline e la lista tessere. Il codice dentro l'indirizzo è segreto, chi non lo conosce non può collegarsi. Se lo rigeneri devi aggiornare l'indirizzo sulla colonnina.":"The server receives and records the charger's messages and only sends it the offline settings and the card list. The code inside the address is secret: whoever does not know it cannot connect. If you regenerate it you must update the address on the charger.",
"Colonnina collegata":"Charger connected",
"Colonnina non collegata":"Charger not connected",
"ultimo messaggio: ":"last message: ",
"presa: ":"socket: ",
"ricarica in corso, tessera ":"charging, card ",
", dalle ":", since ",
"caricati ":"charged ",
"Ora":"Time",
"Messaggio":"Message",
"Rigenerare il codice? La colonnina smette di collegarsi finché non aggiorni l'indirizzo.":"Regenerate the code? The charger stops connecting until you update the address.",
"Attiva":"Active",
"Bloccata":"Blocked",
"Scaduta":"Expired",
"Non valida":"Invalid",
"Stato non valido":"Invalid status",
"Scadenza":"Expiry",
"Annulla":"Cancel",
"Salva modifica":"Save changes",
"Ripara":"Repair",
"scaduta":"expired",
"senza codice":"no code",
"era ":"was ",
"Tessera riparata":"Card repaired",
"Tessera aggiornata":"Card updated",
"Ci sono tessere senza codice: non funzionano finché non le ripari":"Some cards have no code: they will not work until you repair them",
"Nome troppo lungo (massimo 25 caratteri)":"Name too long (25 characters max)",
"Scadenza non valida":"Invalid expiry",
"Nome al massimo 25 caratteri (oltre, la colonnina lo tronca). Scadenza facoltativa: la tessera vale fino alla fine di quel giorno. Le modifiche vengono scritte subito sulla colonnina. Prima di ogni scrittura il sito tiene una copia della lista precedente. L'import aggiunge le tessere nuove e aggiorna nomi e stati, senza cancellare nulla (va bene sia il file esportato da qui sia il CSV esportato da Viaris).":"Name up to 25 characters (longer names get cut by the charger). Expiry is optional: the card is valid until the end of that day. Changes are written to the charger immediately. Before each write the site keeps a copy of the previous list. Import adds new cards and updates names and statuses without deleting anything (works with the file exported from here and with the CSV exported by Viaris).",
"Nome":"Name",
"Codice tessera":"Card code",
"Aggiungi":"Add",
"Importa file":"Import file",
"Esporta lista":"Export list",
"Conferma collegamento ogni":"Connection check every","minuti":"minutes","impostato sulla colonnina":"set on the charger","in attesa: viene mandato alla colonnina al prossimo messaggio":"pending: sent to the charger with its next message","Intervallo non valido: da 1 a 60 minuti":"Invalid interval: 1 to 60 minutes","Parametri avanzati della colonnina":"Advanced charger settings","Attesa tessera dopo il collegamento del cavo":"Wait for card after plugging in","secondi":"seconds","volte":"times","da":"from","a":"to","Controllo della connessione col sito ogni":"Connection check with the site every","Nuovo tentativo se un messaggio di ricarica non arriva dopo":"Retry if a charging message is not delivered after","Numero di tentativi per ogni messaggio di ricarica":"Attempts per charging message","Misure durante la ricarica ogni":"Measurements during charging every","Misure a orari fissi ogni (0 = mai)":"Fixed-time measurements every (0 = never)","Tessere in lista valide anche se il server non risponde":"Listed cards valid even when the server is unreachable",
"Riavvia colonnina (non cancella nulla, solo se libera)":"Restart charger (erases nothing, only when free)","Riavviare la colonnina? Durante il riavvio resta scollegata dal server.":"Restart the charger? It is disconnected from the server while restarting.","Colonnina occupata: riavvio non consentito":"Charger busy: restart not allowed",
"Disattivata il":"Deactivated on","Data aggiornata":"Date updated","Nessuna modifica":"No changes",
"Clicca su una tessera per selezionarla: Disattivazione Permanente la toglie dalla colonnina (lo storico resta), Modifica cambia nome, stato o data di assegnazione. In grigio le tessere disattivate: le loro ricariche restano attribuite a chi le aveva in quel periodo.":"Click a card to select it: Permanent deactivation removes it from the charger (history is kept), Edit changes name, status or assignment date. Greyed rows are deactivated cards: their charges stay assigned to whoever had them at that time.",
"Date":"Dates","Disattivata":"Deactivated","non verificata":"not verified",
"Disattiva":"Deactivate","Disattivazione Permanente":"Permanent deactivation","Disattivare la tessera ":"Deactivate card ","Disattivare in modo permanente la tessera ":"Permanently deactivate card ","Data di disattivazione (gg-mm-aaaa). Vuoto = oggi":"Deactivation date (dd-mm-yyyy). Empty = today","Tessera disattivata":"Card deactivated",
"Dismetti":"Retire","Dismettere la tessera ":"Retire card ","? Viene tolta dalla colonnina, lo storico resta.":"? It is removed from the charger, history is kept.",
"Assegnata dal":"Assigned from","Cronologia assegnazioni":"Assignment history","Fino al":"Until","Dal":"From","Modifica date":"Edit dates",
"Data di dismissione (gg-mm-aaaa). Vuoto = oggi":"Dismissal date (dd-mm-yyyy). Empty = today","Data non valida":"Invalid date",
"Assegnata dal (gg-mm-aaaa)":"Assigned from (dd-mm-yyyy)","Dismessa il (gg-mm-aaaa). Vuoto = ancora assegnata":"Dismissed on (dd-mm-yyyy). Empty = still assigned",
"Rileggi dalla colonnina":"Reread from charger",
"Ripristina lista precedente":"Restore previous list",
"Le modifiche vengono scritte subito sulla colonnina. Prima di ogni scrittura il sito tiene una copia della lista precedente. L'import aggiunge le tessere nuove e aggiorna nomi e stati, senza cancellare nulla (va bene sia il file esportato da qui sia il CSV esportato da Viaris).":"Changes are written to the charger immediately. Before each write the site keeps a copy of the previous list. Import adds new cards and updates names and statuses without deleting anything (works with the file exported from here and with the CSV exported by Viaris).",
"attiva":"active",
"Copia del ":"Copy of ",
" tessere)":" cards)",
"Leggo la colonnina...":"Reading the charger...",
"Scrivo sulla colonnina...":"Writing to the charger...",
"Tessera aggiunta":"Card added",
"Nome aggiornato":"Name updated",
"Tessera eliminata":"Card deleted",
"Import completato":"Import completed",
"Lista ripristinata":"List restored",
"Nuovo nome per la tessera ":"New name for card ",
"Eliminare dalla colonnina la tessera ":"Delete from the charger the card ",
"Importare le tessere del file ":"Import the cards in file ",
" sulla colonnina?":" to the charger?",
"Riportare sulla colonnina la lista com'era prima dell'ultima modifica?":"Put back on the charger the list as it was before the last change?",
"Codice tessera non valido (solo cifre e lettere A-F)":"Invalid card code (digits and letters A-F only)",
"Inserisci il nome":"Enter the name",
"Tessera già presente":"Card already present",
"Tessera non trovata":"Card not found",
"Nel file non ho trovato tessere valide":"No valid cards found in the file",
"Nessuna copia precedente":"No previous copy",
"La colonnina ha risposto, ma la lista riletta non coincide: controlla":"The charger answered, but the list read back does not match: please check",
"Inserisci almeno un destinatario":"Enter at least one recipient",
"Reinvia report":"Resend report",
"Inviare di nuovo il report di questo mese ai destinatari?":"Send this month's report to the recipients again?",
"Prezzo salvato. ":"Price saved. ",
"Report inviato a ":"Report sent to ",
"Mail agli utenti: ":"Emails to users: ",
" inviate":" sent",
" non riuscite":" failed",
"Mail del prezzo agli utenti":"Price emails to users",
"Report non inviato (":"Report not sent (",
"nessun destinatario":"no recipients",
"Prezzo gia' inserito: il mese e' bloccato e non si puo' piu' modificare":"Price already entered: the month is locked and can no longer be changed",
"Prezzo bloccato dal ":"Price locked since ",
": il mese e' chiuso e non si puo' piu' modificare.":": the month is closed and can no longer be changed.",
"Il prezzo si puo' correggere fino al giorno prima del ":"The price can be corrected until the day before ",
", poi viene bloccato.":", then it is locked.",
"Clicca per vedere le sessioni":"Click to see the sessions",
"Totale tessere":"Cards total",
"Totale app":"App total",
"Nessuna ricarica da app in questo mese.":"No app charges this month.",
"TOTALE ":"TOTAL ",
"TOTALE tessere ":"TOTAL cards ",
" kWh - imponibile ":" kWh - net ",
" + IVA ":" + VAT ",
" € (IVA inclusa)":" € (VAT included)",
"Prezzo non valido: scrivi per esempio 0,2845":"Invalid price: write for example 0.2845",
"IVA non valida: scrivi per esempio 10 oppure 0":"Invalid VAT: write for example 10 or 0",
"Scarico in corso...":"Downloading...",
"Scarico: ":"Download: ",
" sessioni lette, ":" sessions read, ",
" nuove":" new",
"Colonnina non raggiungibile: ":"Charger unreachable: ",
"Errore interno: riprova; se si ripete avvisa l'amministratore":"Internal error: try again; if it happens again, tell the administrator",
"Errore: ":"Error: ",
" sessioni, ":" sessions, ",
": NON importato - ":": NOT imported - ",
"file vuoto":"empty file",
"non sembra un export per tessera di Viaris":"does not look like a per-card Viaris export",
"(tessera non in elenco)":"(card not in list)",
"Avviata da app":"Started from the app",
"(app)":"(app)",
"Ricariche_":"Charges_",
"Storico_":"History_",
"storico":"history",
"sessioni":"sessions",
"prezzo":"price",
"stampa":"print",
"scarico":"download",
"nessuno":"none",
"tutti":"all",
"attivo":"active",
"invito scaduto":"invite expired",
"invito in attesa":"invite pending",
"email da confermare":"email to confirm","in attesa di tessera":"waiting for card",
"Modifica":"Edit",
"Reimposta":"Reset",
"Reinvia":"Resend",
"Elimina":"Delete",
"Manda un link per reimpostare la password":"Send a link to reset the password",
"Manda di nuovo il link di invito":"Send the invite link again",
"Mandare un nuovo link a ":"Send a new link to ",
"Eliminare l'utente ":"Delete the user ",
"- scegli la tessera -":"- choose the card -",
"Scegli la tessera da abbinare":"Choose the card to assign",
"Richiesta nuova tessera":"Request a new card","Non hai ancora una tessera. Puoi richiederla qui sotto":"You do not have a card yet. You can request one below",": ti contatteremo per la consegna e il pagamento. Se l'hai già, attendi che l'Amministratore la abbini al tuo account.":": we will contact you for delivery and payment. If you already have one, wait for the Administrator to link it to your account.","Per sicurezza la tessera viene bloccata subito sulla colonnina. Se la ritrovi, scrivi all'Amministratore: può sbloccarla. Se non la ritrovi o è danneggiata dovrai richiederne una nuova":"For safety the card is blocked on the charger immediately. If you find it, write to the Administrator: it can be unblocked. If you do not find it or it is damaged you will need to request a new one","Come vuoi pagare":"How you want to pay","Ti contatteremo al telefono indicato nel tuo profilo per la consegna e il pagamento. Il messaggio è facoltativo (ad esempio gli orari in cui sei reperibile).":"We will contact you on the phone number in your profile for delivery and payment. The message is optional (for example the hours you are available).","Costo della tessera: ":"Card cost: ","una tantum, non è una cauzione e non viene restituito; se la tessera viene smarrita o danneggiata ne servirà un'altra. ":"one-off, it is not a deposit and is not refunded; if the card is lost or damaged you will need another one. ",

"Assegna tessera":"Assign card","Causale da indicare:":"Reference to enter:","Copia causale":"Copy reference","Copiata":"Copied","Pagamento tessera":"Card payment","Pagamento":"Payment","Contanti alla consegna":"Cash on delivery","Pagherai in contanti alla consegna della tessera":"You will pay in cash when you receive the card","Paga da qui":"Pay here","Su PayPal scegli «Amici e familiari».":"On PayPal choose “Friends and family”.","Indica come causale: tessera colonnina e la tua email.":"Use as the reference: charger card and your email.","Metodo di pagamento non disponibile":"Payment method not available","Nome account non valido (solo lettere, numeri, punto, trattino) oppure un link https":"Invalid account name (letters, numbers, dot, dash only) or an https link","Testo e link (PayPal.me, Satispay, Revolut) mostrati all'utente quando richiede una tessera.":"Text and links (PayPal.me, Satispay, Revolut) shown to the user when requesting a card.","Scegli la tessera da assegnare":"Choose the card to assign","scegli la tessera da assegnare":"choose the card to assign","Hai gia' una richiesta di nuova tessera aperta: attendi che venga gestita":"You already have an open request for a new card: please wait until it is handled","Tessera gia' assegnata a un altro utente":"Card already assigned to another user",
"Invito inviato a ":"Invite sent to ",
"Mail non inviata (":"Email not sent (",
"). Copia il link e invialo tu:":"). Copy the link and send it yourself:",
"non configurata":"not configured",
"Permessi salvati":"Permissions saved",
"Le due nuove password non coincidono":"The two new passwords do not match",
"Password cambiata":"Password changed",
"Le due password non coincidono":"The two passwords do not match",
"Accedi per consultare le ricariche":"Sign in to view the charges",
"Password":"Password",
"Accedi":"Sign in",
"Errore":"Error",
"Errore di rete":"Network error",
"Scegli la tua password":"Choose your password",
"Nuova password (min. 8 caratteri)":"New password (min. 8 characters)",
"Ripeti la password":"Repeat the password",
"Salva e accedi":"Save and sign in",
"Utente: ":"User: ",
"Troppi tentativi: riprova tra 10 minuti":"Too many attempts: try again in 10 minutes",
"Nome o password errati":"Wrong username or password",
"Indirizzo email non valido":"Invalid email address",
"Questo utente e' l'admin":"This user is the admin",
"Tessera non trovata: scarica prima dalla colonnina":"Card not found: download from the charger first",
"Tessera non trovata":"Card not found",
"utente non trovato":"User not found",
"L'admin non si puo' eliminare":"The admin cannot be deleted",
"azione non valida":"Invalid action",
"La password deve avere almeno 8 caratteri":"The password must be at least 8 characters",
"Link non valido o scaduto: chiedi un nuovo invito":"Invalid or expired link: ask for a new invite",
"non hai il permesso per questa operazione":"You do not have permission for this operation",
"non autorizzato":"Not authorized",
"La nuova password deve avere almeno 12 caratteri con minuscola, maiuscola, numero e carattere speciale":"The new password must be at least 12 characters with lowercase, uppercase, digit and special character","Troppi tentativi da questo indirizzo: riprova tra 10 minuti":"Too many attempts from this address: try again in 10 minutes","Verifica anti-robot non superata: riprova":"Anti-robot check failed: try again","Controllo anti-robot nella registrazione NON attivo: mancano TURNSTILE_SITE_KEY e TURNSTILE_SECRET (vedi README)":"Anti-robot check on registration NOT active: TURNSTILE_SITE_KEY and TURNSTILE_SECRET are missing (see README)",
"Password attuale errata":"The current password is wrong",
"mese/anno non validi":"Invalid month/year",
"prezzo o IVA non validi":"Invalid price or VAT",
"non trovato":"Not found"
};
// messages built by the server with a variable part: prefix/pattern translated, the detail kept as is
var EN_PAT=[[/^(.+): (\d+) inviate, (\d+) non riuscite, (\d+) non inviate per il limite di (\d+)(?: richieste)?\.$/,"$1: $2 sent, $3 failed, $4 not sent because of the limit of $5."],
  [/^Prezzo bloccato: il mese e' chiuso dal (.+) e non si puo' piu' modificare$/,"Price locked: the month has been closed since $1 and can no longer be changed"],
  [/^non riconosco la tessera dal nome del file \((.*)\): scarica prima dalla colonnina$/,"cannot recognise the card from the file name ($1): download from the charger first"],
  [/^La colonnina risponde con errore: /,"The charger answered with an error: "],[/^Colonnina non raggiungibile: /,"Charger not reachable: "],[/^Scrittura sulla colonnina non riuscita: /,"Writing to the charger failed: "],
  [/^Cloudflare: /,"Cloudflare: "],[/^Mail non inviata: /,"Email not sent: "],[/^Numero non valido: /,"Invalid number: "],[/^nessuna risposta entro (\d+) s$/,"no answer within $1 s"],[/^HTTP (\d+)$/,"HTTP $1"],[/^scrittura: HTTP (\d+)$/,"write: HTTP $1"],
  [/^La risposta dello storico non ha il campo di testo "(.*)"$/,"The history response has no text field \"$1\""],[/^Valore non valido: da (\S+) a (\S+)$/,"Invalid value: from $1 to $2"],
  [/^(.+): valore da (\S+) a (\S+) (.+)$/,function(m,a,b,c,d){return T(a)+": value from "+b+" to "+c+" "+T(d)}],
  [/^Tessera (\S+) abbinata\.$/,"Card $1 linked."],[/^Tessera (\S+) scollegata(?:, abbinata (\S+))?\.$/,function(m,a,b){return "Card "+a+" unlinked"+(b?", "+b+" linked":"")+"."}],
  [/^Tessera (\S+): sblocco in attesa \(colonnina non raggiungibile\)\.$/,"Card $1: unblock pending (charger not reachable)."],[/^Tessera (\S+) sbloccata\.$/,"Card $1 unblocked."],
  [/^Dati aggiornati\.$/,"Data updated."],[/^Nessun dato da aggiornare: la richiesta era solo testuale\.$/,"No data to update: the request was text only."],[/^Utenza e dati cancellati\.$/,"Account and data deleted."],
  [/^Sblocco in attesa: la colonnina non risponde, riprovo ogni 5 minuti\.$/,"Unblock pending: the charger does not answer, retrying every 5 minutes."],[/^Tessera sbloccata\.$/,"Card unblocked."],
  [/^non configurata$/,"not configured"],[/^inviata$/,"sent"],[/^nessun destinatario$/,"no recipient"],[/^errore (\d+): /,"error $1: "],[/^errore: /,"error: "],
  [/^Dura da: /,"Since: "],[/^Soglia impostata: /,"Threshold: "]];
function T(s){
  if(LANG!=="en"||s===null||s===undefined)return s;
  if(EN.hasOwnProperty(s))return EN[s];
  if(typeof s!=="string")return s;
  for(var i=0;i<EN_PAT.length;i++){var p=EN_PAT[i];if(p[0].test(s)){var rest=s.replace(p[0],p[1]);
    var m=/^(.*?: )(.+)$/.exec(rest);if(m&&m[2].length<s.length)return m[1]+T(m[2]);   // the detail may itself be a known message
    return rest}}
  return s;
}
function Tm(s){var p=String(s).split(" ");p[0]=T(p[0]);return p.join(" ")}
function trDom(){
  if(LANG!=="en")return;
  document.documentElement.lang="en";
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];
  while(n=w.nextNode())L.push(n);
  L.forEach(function(x){var v=x.nodeValue,k=v.trim();if(k&&EN.hasOwnProperty(k))x.nodeValue=v.replace(k,EN[k])});
  document.querySelectorAll("[placeholder]").forEach(function(e){e.placeholder=T(e.placeholder)});
  document.querySelectorAll("[title]").forEach(function(e){e.title=T(e.title)});
}
function cambiaLingua(){try{localStorage.setItem("lang",LANG==="en"?"it":"en")}catch(e){}location.reload()}
var MESI=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
function $(i){return document.getElementById(i)}
function it(x,d){if(x===null||x===undefined)return "-";d=(d===undefined)?2:d;return x.toLocaleString(LOC,{minimumFractionDigits:d,maximumFractionDigits:d})}
function api(p,o){return fetch(p,o).then(function(r){if(r.status===401){location.reload();return new Promise(function(){})}return r.json()})}
function post(p,b){return api(p,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)})}
function b64(t){return btoa(String.fromCharCode.apply(null,new TextEncoder().encode(t)))}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
var SEP=LANG==="en"?",":";";
function nf(x,d){if(x===null||x===undefined)return "-";d=(d===undefined)?2:d;return LANG==="en"?x.toFixed(d):it(x,d)}
function J(a){return a.map(function(v){v=String(v);return(LANG==="en"&&/[",]/.test(v))?'"'+v.replace(/"/g,'""')+'"':v}).join(SEP)}
function row(cells,cls){return "<tr"+(cls?' class="'+cls+'"':"")+">"+cells.join("")+"</tr>"}
function td(v,n){return "<td"+(n?' class="n"':"")+">"+v+"</td>"}
function th(v,n){return "<th"+(n?' class="n"':"")+">"+v+"</th>"}

trDom();
$("bLang").textContent=(LANG==="en")?"Italiano":"English";$("bLang").onclick=cambiaLingua;(function(){var b=$("bTema");function cur(){return document.documentElement.getAttribute("data-t")||"auto"}function lab(){var m=LANG==="en"?{auto:"◐ Auto",light:"☀ Light",dark:"☾ Dark"}:{auto:"◐ Auto",light:"☀ Giorno",dark:"☾ Notte"};b.textContent=m[cur()]}lab();b.onclick=function(){var n={auto:"light",light:"dark",dark:"auto"}[cur()];if(n==="auto")document.documentElement.removeAttribute("data-t");else document.documentElement.setAttribute("data-t",n);try{if(n==="auto")localStorage.removeItem("tema");else localStorage.setItem("tema",n)}catch(e){}lab()}})();function adattaNav(){var n=document.querySelector("nav");if(!n)return;var b=[].filter.call(n.querySelectorAll("button"),function(x){return x.offsetWidth>0});if(b.length<2)return;
  var f=15;n.style.fontSize=f+"px";while(b[b.length-1].offsetTop!==b[0].offsetTop&&f>12){f-=0.5;n.style.fontSize=f+"px"}}
function adatta(){if(innerWidth<=700)return;adattaNav();document.querySelectorAll("table").forEach(function(t){if(t.id==="tabO")return;var c=t.parentNode;if(!c||!c.clientWidth)return;
  t.classList.remove("wr");var z=1;t.style.setProperty("--z",1);while(t.offsetWidth>c.clientWidth+1&&z>0.74){z-=0.03;t.style.setProperty("--z",z.toFixed(2))}
  if(t.offsetWidth>c.clientWidth+1)t.classList.add("wr")})}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("nav button"))setTimeout(adatta,60)});addEventListener("resize",function(){clearTimeout(window._ad);window._ad=setTimeout(adatta,100)});setTimeout(adatta,700);setTimeout(adatta,2000);
(function(){function lab(){document.querySelectorAll("table:not(.tbm)").forEach(function(t){if(t.id==="tabO"||!t.rows.length)return;var r0=t.rows[0],hs=[];for(var i=0;i<r0.cells.length;i++){if(r0.cells[i].tagName!=="TH")return;hs.push(r0.cells[i].textContent.trim())}t.classList.add("tbm");for(var j=1;j<t.rows.length;j++){var c=t.rows[j].cells;for(var k=0;k<c.length;k++){if(c[k].colSpan>1)continue;c[k].setAttribute("data-l",hs[k]||"")}}})}var tm=0;new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(function(){lab();adatta()},30)}).observe(document.body,{childList:true,subtree:true});lab()})();
var oggi=new Date(), rep=null, righeAnno=[];
(function init(){
  var a="";for(var y=2024;y<=oggi.getFullYear()+1;y++)a+='<option>'+y+'</option>';
  $("selAnno").innerHTML=a;$("selAnnoS").innerHTML=a;$("selAnnoM").innerHTML=a;$("selAnnoM").value=String(oggi.getFullYear());
  var mm='<option value="0">'+T("Tutto l\'anno")+'</option>';for(var j=0;j<12;j++)mm+='<option value="'+(j+1)+'">'+T(MESI[j])+'</option>';$("selMeseM").innerHTML=mm;
  $("selAnno").value=$("selAnnoS").value=String(oggi.getFullYear());
  var m="";for(var i=0;i<12;i++)m+='<option value="'+(i+1)+'">'+T(MESI[i])+'</option>';
  $("selMese").innerHTML=m;$("selMese").value=String(oggi.getMonth()+1);
})();

document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){
  document.querySelectorAll("nav button").forEach(function(x){x.classList.toggle("on",x===b)});
  ["t1","t2","t3","t4","t5","t6","t8","t9","t10","t11","t12","t13"].forEach(function(t){$(t).classList.toggle("hide",t!==b.dataset.t)});
  if(b.dataset.t==="t2")caricaStorico();if(b.dataset.t==="t3")caricaSessioni();if(b.dataset.t==="t4"){caricaUtenti();caricaRfid()}if(b.dataset.t==="t13")caricaPrepagate();if(b.dataset.t==="t5")caricaMie();if(b.dataset.t==="t10")caricaProfilo();if(b.dataset.t==="t11")caricaTicket();if(b.dataset.t==="t9"){caricaLive();if(MONADM){caricaMal();caricaCf();caricaNot()}}if(b.dataset.t==="t8"){ocStato();caricaOcpp()}if(b.dataset.t==="t6"){caricaDest();caricaConfig();caricaTesti()}
}});

function caricaStato(){return api("/api/stato").then(function(s){
  var t=s.sessioni?(s.sessioni+(s.sessioni===1?T(" sessione"):T(" sessioni"))+T(" dal ")+s.dal.slice(0,10)+T(" al ")+s.al.slice(0,10)):T("Archivio vuoto");
  if(s.ultimo_scarico)t+=T(" · aggiornato il ")+new Date(s.ultimo_scarico).toLocaleString(LOC,{dateStyle:"short",timeStyle:"short"});
  $("stato").textContent=t;
  $("esito").textContent=s.ultimo_errore?(T("Ultimo scarico non riuscito: ")+s.ultimo_errore):"";
})}

function caricaReport(){
  return api("/api/report?anno="+$("selAnno").value+"&mese="+$("selMese").value).then(function(r){
    if(r.errore)return;
    rep=r;
    $("prezzo").value=r.prezzo===null?"":String(r.prezzo).replace(".",",");
    var iv=(r.prezzo===null)?r.iva_prec:r.iva_pct;
    $("iva").value=String(iv===null||iv===undefined?0:iv).replace(".",",");
    $("titoloRep").textContent=T("Ripartizione costi ricarica - ")+Tm(r.titolo);
    $("subRep").textContent=r.prezzo===null?T("Prezzo non ancora inserito"):(T("Prezzo ")+it(r.prezzo,4)+T(" €/kWh, IVA ")+it(r.iva_pct,1)+"% - "+T("sessioni: ")+r.sessioni);
    $("avviso").textContent=r.prezzo===null?T("Inserisci il prezzo del kWh di questo mese e premi Salva prezzo per calcolare gli importi. Dopo il salvataggio non si potra' piu' modificare."):
      (r.bloccato?T("Prezzo bloccato: una volta inserito non si puo' piu' modificare."):"");
    $("avviso").style.color=r.bloccato?"":"var(--mut)";
    $("prezzo").disabled=$("iva").disabled=$("bPrezzo").disabled=!!r.bloccato;
    $("bReinvia").classList.toggle("hide",!(io&&io.ruolo==="admin"&&r.prezzo!==null));
    var t=row([th(T("Tessera")),th(T("Utente")),th(T("Sess."),1),th(T("kWh"),1),th(T("Imponibile"),1),th(T("IVA"),1),th(T("Totale"),1)]);
    r.tessere.forEach(function(x,i){t+='<tr class="ut" data-i="'+i+'" title="'+T("Clicca per vedere le sessioni")+'">'+td(esc(x.tag))+td(esc(T(x.nome)))+td(x.n,1)+td(it(x.kwh),1)+td(it(x.imp),1)+td(it(x.iva),1)+td(it(x.tot),1)+"</tr>"});
    t+=row([td(""),td(T("Totale tessere")),td(r.tessere.reduce(function(s,x){return s+x.n},0),1),td(it(r.kwh_tessere),1),td(it(r.imp_tessere),1),td(it(r.iva_tessere),1),td(it(r.tot_tessere),1)],"t");
    $("tabT").innerHTML=t;
    document.querySelectorAll("#tabT tr.ut").forEach(function(tr){tr.onclick=function(){
      var nx=tr.nextElementSibling;
      if(nx&&nx.classList.contains("det")){while(tr.nextElementSibling&&tr.nextElementSibling.classList.contains("det"))tr.nextElementSibling.remove();return}
      var x=r.tessere[+tr.dataset.i],h="";
      x.sess.forEach(function(s){h+='<tr class="det"><td></td><td>'+s.inizio+" &rarr; "+s.fine+'</td><td></td><td class="n">'+it(s.kwh)+'</td><td class="n">'+it(s.imp)+'</td><td class="n">'+it(s.iva)+'</td><td class="n">'+it(s.tot)+'</td></tr>'});
      tr.insertAdjacentHTML("afterend",h)}});
    $("cApp").classList.toggle("hide",!r.riservato);
    var a=row([th(T("Inizio")),th(T("Fine")),th(T("kWh"),1),th(T("Imponibile"),1),th(T("IVA"),1),th(T("Totale"),1)]);
    if(!r.app.length)a+='<tr><td colspan="6"><i>'+T("Nessuna ricarica da app in questo mese.")+'</i></td></tr>';
    r.app.forEach(function(x){a+=row([td(x.inizio),td(x.fine),td(it(x.kwh),1),td(it(x.imp),1),td(it(x.iva),1),td(it(x.tot),1)])});
    a+=row([td(T("Totale app")),td(""),td(it(r.kwh_app),1),td(it(r.imp_app),1),td(it(r.iva_app),1),td(it(r.tot_app),1)],"t");
    $("tabA").innerHTML=a;
    $("totale").textContent=T(r.riservato?"TOTALE ":"TOTALE tessere ")+Tm(r.titolo)+": "+it(r.kwh_tot)+T(" kWh - imponibile ")+it(r.imp_tot)+T(" + IVA ")+it(r.iva_tot)+" = "+it(r.eur_tot)+" €";
  });
}

function caricaStorico(){
  return api("/api/storico?anno="+$("selAnnoS").value).then(function(rr){
    if(!Array.isArray(rr))return;
    righeAnno=rr;
    var R=rr.length&&rr[0].riservato;
    var t=row([th(T("Mese")),th(T("Sess."),1),th(T("kWh tess."),1)].concat(R?[th(T("kWh app"),1),th(T("kWh tot."),1)]:[]).concat([th(T("€/kWh"),1),th(T("IVA %"),1),th(T("Totale"),1)]));
    var k=0,e=0;
    rr.forEach(function(x){k+=x.kwh_tot;e+=x.eur_tot||0;
      t+='<tr class="cl" data-m="'+x.mese+'">'+td(T(x.nome))+td(x.sessioni,1)+td(it(x.kwh_tessere),1)+(R?td(it(x.kwh_app),1)+td(it(x.kwh_tot),1):"")+td(it(x.prezzo,4),1)+td(x.prezzo===null?"-":it(x.iva_pct,1),1)+td(it(x.eur_tot),1)+"</tr>"});
    $("tabS").innerHTML=t;
    $("totAnno").textContent=T("TOTALE ")+$("selAnnoS").value+": "+it(k)+" kWh - "+it(Math.round(e*100)/100)+T(" € (IVA inclusa)");
    document.querySelectorAll("#tabS tr.cl").forEach(function(tr){tr.onclick=function(){
      $("selAnno").value=$("selAnnoS").value;$("selMese").value=tr.dataset.m;
      document.querySelector('nav button[data-t="t1"]').click();caricaReport()}});
  });
}

var tutteSess=[];
function disegnaSessioni(){
  var f=$("selUt").value, t=row([th(T("Inizio")),th(T("Fine")),th(T("Tessera")),th(T("Utente")),th(T("kWh"),1),th(T("Imponibile"),1),th(T("IVA"),1),th(T("Totale"),1)]), k=0, n=0, ti=null, tv=null, tt=null;
  function som(a,b){return b===null?a:(a||0)+b}
  tutteSess.forEach(function(s){if(f&&s.nome!==f)return;k+=s.kwh;n++;ti=som(ti,s.imp);tv=som(tv,s.iva);tt=som(tt,s.tot);
    t+='<tr>'+td(s.inizio)+td(s.fine)+td(esc(T(s.tag)))+'<td class="ut" style="cursor:pointer" data-u="'+esc(s.nome)+'">'+esc(T(s.nome))+'</td>'+td(it(s.kwh),1)+td(it(s.imp),1)+td(it(s.iva),1)+td(it(s.tot),1)+'</tr>'});
  function r2c(x){return x===null?null:Math.round(x*100)/100}
  t+=row([td(""),td(""),td(""),td(n+(n===1?T(" sessione"):T(" sessioni"))),td(it(k),1),td(it(r2c(ti)),1),td(it(r2c(tv)),1),td(it(r2c(tt)),1)],"t");
  $("tabX").innerHTML=t;
  document.querySelectorAll("#tabX td.ut").forEach(function(c){c.onclick=function(){$("selUt").value=c.dataset.u;disegnaSessioni()}});
}
function caricaSessioni(){
  return api("/api/sessioni").then(function(ss){
    if(!Array.isArray(ss))return;
    tutteSess=ss;var cur=$("selUt").value,nomi={};
    ss.forEach(function(s){if(s.nome)nomi[s.nome]=1});
    $("selUt").innerHTML='<option value="">'+T("Tutti")+'</option>'+Object.keys(nomi).sort().map(function(n){return '<option value="'+esc(n)+'">'+esc(T(n))+'</option>'}).join("");
    $("selUt").value=nomi[cur]?cur:"";
    disegnaSessioni();
  });
}
$("selUt").onchange=disegnaSessioni;


function tutto(){return caricaStato().then(function(){if(!io||io.perm.report)return caricaReport()})}

$("selAnno").onchange=$("selMese").onchange=caricaReport;
$("selAnnoS").onchange=caricaStorico;

$("bPrezzo").onclick=function(){
  var p=$("prezzo").value.trim().replace(",","."), i=$("iva").value.trim().replace(",",".")||"0";
  if(p!==""&&(isNaN(+p)||+p<=0||+p>=5)){alert(T("Prezzo non valido: scrivi per esempio 0,2845"));return}
  if(isNaN(+i)||+i<0||+i>100){alert(T("IVA non valida: scrivi per esempio 10 oppure 0"));return}
  if(p!==""&&!confirm(T("Dopo il salvataggio il prezzo di questo mese non si potra' piu' modificare e il report verra' inviato per mail ai destinatari e ogni utente ricevera' i propri importi. Confermi?")))return;
  post("/api/prezzo",{anno:+$("selAnno").value,mese:+$("selMese").value,prezzo:p===""?null:+p,iva:+i}).then(function(r){
    if(r.errore)alert(T(r.errore));else $("esito").textContent=esitoMail(r,"Prezzo salvato. ")+(r.utenti&&(r.utenti.inviate||r.utenti.errori)?". "+T("Mail agli utenti: ")+r.utenti.inviate+T(" inviate")+(r.utenti.errori?", "+r.utenti.errori+T(" non riuscite"):"")+(r.utenti.messaggi?", "+r.utenti.messaggi+T(" messaggi Telegram in partenza entro 5 minuti"):""):"");caricaReport()});
};

$("bScarica").onclick=function(){
  var b=$("bScarica");b.disabled=true;$("esito").textContent=T("Scarico in corso...");
  api("/api/scarica",{method:"POST"}).then(function(r){
    $("esito").textContent=r.ok?(T("Scarico: ")+r.lette+T(" sessioni lette, ")+r.nuove+T(" nuove")):(T("Colonnina non raggiungibile: ")+T(r.errore));
    b.disabled=false;tutto().then(function(){if(r.ok)return;});
  }).catch(function(e){$("esito").textContent=T("Errore: ")+e;b.disabled=false});
};

$("bImporta").onclick=function(){$("fCsv").click()};
$("fCsv").onchange=function(){
  var files=Array.prototype.slice.call($("fCsv").files), out=[];
  (function next(){
    if(!files.length){$("esito").textContent=out.join(" | ");$("fCsv").value="";tutto();return}
    var f=files.shift();
    f.text().then(function(t){return post("/api/importa",{nome:f.name,csv:t})}).then(function(r){
      out.push(r.ok?(r.tessera+": "+r.lette+T(" sessioni, ")+r.nuove+T(" nuove")):(f.name+T(": NON importato - ")+T(r.errore)));next()});
  })();
};

function scarico(nome,testo){
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+testo],{type:"text/csv;charset=utf-8"}));
  a.download=nome;document.body.appendChild(a);a.click();a.remove();
}
$("bStampa").onclick=function(){window.print()};
$("bCsv").onclick=function(){
  if(!rep)return;var r=rep,L=[];
  L.push("__TITLE__");L.push(T("Ripartizione costi ricarica - ")+Tm(r.titolo));
  L.push(J([LANG==="en"?"Price EUR/kWh":"Prezzo EUR/kWh",nf(r.prezzo,4),LANG==="en"?"VAT %":"IVA %",nf(r.iva_pct,1)]));L.push("");
  L.push(J([T("Tessera"),T("Utente"),LANG==="en"?"Sessions":"Sessioni","kWh",T("Imponibile"),T("IVA"),T("Totale")]));
  r.tessere.forEach(function(x){L.push(J([x.tag,T(x.nome),x.n,nf(x.kwh,3),nf(x.imp),nf(x.iva),nf(x.tot)]))});
  L.push(J(["",T("Totale tessere"),"",nf(r.kwh_tessere,3),nf(r.imp_tessere),nf(r.iva_tessere),nf(r.tot_tessere)]));L.push("");
  if(r.riservato){L.push(T("Ricariche avviate da app (non attribuite a una tessera)"));L.push(J([T("Inizio"),T("Fine"),"","kWh",T("Imponibile"),T("IVA"),T("Totale")]));
  r.app.forEach(function(x){L.push(J([x.inizio,x.fine,"",nf(x.kwh,3),nf(x.imp),nf(x.iva),nf(x.tot)]))});
  L.push(J(["",T("Totale app"),"",nf(r.kwh_app,3),nf(r.imp_app),nf(r.iva_app),nf(r.tot_app)]));L.push("")}
  L.push(J(["",LANG==="en"?"TOTAL":"TOTALE","",nf(r.kwh_tot,3),nf(r.imp_tot),nf(r.iva_tot),nf(r.eur_tot)]));
  scarico(T("Ricariche_")+r.anno+"-"+("0"+r.mese).slice(-2)+".csv",L.join("\r\n"));
};
$("bCsvAnno").onclick=function(){
  var en=LANG==="en",R=righeAnno.length&&righeAnno[0].riservato;
  var L=["__TITLE__",(en?"Charging history ":"Storico ricariche ")+$("selAnnoS").value];
  L.push(J([T("Mese"),en?"Sessions":"Sessioni",en?"kWh cards":"kWh tessere",R?(en?"kWh app":"kWh app"):"",en?"kWh total":"kWh totali",en?"Price EUR/kWh":"Prezzo EUR/kWh",en?"VAT %":"IVA %",T("Imponibile"),T("IVA"),T("Totale")]));
  righeAnno.forEach(function(x){L.push(J([T(x.nome),x.sessioni,nf(x.kwh_tessere,3),nf(x.kwh_app,3),nf(x.kwh_tot,3),nf(x.prezzo,4),x.prezzo===null?"-":nf(x.iva_pct,1),nf(x.imp_tot),nf(x.iva_tot),nf(x.eur_tot)]))});
  scarico(T("Storico_")+$("selAnnoS").value+".csv",L.join("\r\n"));
};

// ---------- tessere prepagate (scheda Prepagate, admin) e riquadro del credito in "Le mie ricariche"
var PRE=[];
function prStato(p){return p.bloccata?'<span class="pst err">'+T("bloccata")+"</span>":p.residuo_cent<=0?'<span class="pst err">'+T("credito esaurito")+"</span>":p.avvisata?'<span class="pst warn">'+T("credito basso, avvisato")+"</span>":'<span class="pst ok">'+T("attiva")+"</span>"}
function prStorico(p){var N={attivata:"attivata",credito:"credito +",prezzo:"prezzo ",soglia:"soglia ",blocco:"blocco",sblocco:"sblocco",avviso:"avviso",stop:"stop ricarica"};
  return (p.storico||[]).slice().reverse().map(function(s){var v=s.tipo==="credito"||s.tipo==="attivata"||s.tipo==="soglia"?it(s.v/100)+" €":s.tipo==="prezzo"?it(s.v/100)+" €/kWh":s.tipo==="stop"?"+"+it(s.v/1000,1)+" kWh":"";
    return oraTxt(s.ts)+" "+T(N[s.tipo]||s.tipo)+(v?" "+v:"")}).join(" · ")}
function caricaPrepagate(){
  return api("/api/prepagate").then(function(r){
    if(!r||r.errore)return;PRE=r.prepagate||[];
    var h=row([th(T("Tessera")),th(T("€/kWh"),1),th(T("Caricato"),1),th(T("Consumato"),1),th(T("Residuo"),1),th(T("Stato"))]);
    PRE.forEach(function(p){
      h+='<tr class="ut" data-tag="'+esc(p.tag)+'">'+td(esc(p.nome||"")+'<br><span class="sub">'+esc(p.tag)+"</span>")+td(it(p.prezzo_cent/100),1)+td(it(p.credito_cent/100)+" €",1)
        +td(it(p.consumato_wh/1000,1)+' kWh<br><span class="sub">'+it(p.consumato_cent/100)+" €</span>",1)
        +td('<b class="'+(p.residuo_cent<=0?"err":p.residuo_cent<=p.soglia_cent?"warn":"")+'">'+it(p.residuo_cent/100)+" €</b>",1)
        +td(prStato(p)+(p.in_corso_wh?" · "+T("in ricarica")+" "+it(p.in_corso_wh/1000,1)+" kWh":""))+"</tr>"});
    $("tabPre").innerHTML=PRE.length?h:'<tr><td class="sub">'+T("Nessuna tessera prepagata")+"</td></tr>";
    var sel=$("prSel"),cur=sel.value;sel.innerHTML=PRE.map(function(p){return '<option value="'+esc(p.tag)+'">'+esc((p.nome?p.nome+" · ":"")+p.tag)+"</option>"}).join("");
    if(cur&&PRE.some(function(p){return p.tag===cur}))sel.value=cur;prMostra();
    $("prNuova").innerHTML=(r.disponibili||[]).map(function(t){return '<option value="'+esc(t.tag)+'">'+esc((t.nome?t.nome+" · ":"")+t.tag)+"</option>"}).join("");
  });
}
function prMostra(){var p=PRE.filter(function(x){return x.tag===$("prSel").value})[0];$("prImp").value="";
  $("prPr").value=p?(p.prezzo_cent/100).toFixed(2):"";$("prSo").value=p?(p.soglia_cent/100).toFixed(0):"";$("prStor").textContent=p?T("Storico: ")+prStorico(p):""}
$("prSel").onchange=prMostra;
$("tabPre").onclick=function(e){var tr=e.target.closest("tr.ut");if(!tr)return;$("prSel").value=tr.dataset.tag;prMostra()};
$("bPrSalva").onclick=function(){
  var p=PRE.filter(function(x){return x.tag===$("prSel").value})[0];if(!p)return;var e=$("prEsito");e.classList.remove("err");e.textContent="...";
  var az=[],imp=parseFloat($("prImp").value);if(imp>0)az.push({azione:"credito",tag:p.tag,importo:imp});
  var pr=parseFloat($("prPr").value);if(pr>0&&Math.round(pr*100)!==p.prezzo_cent)az.push({azione:"prezzo",tag:p.tag,prezzo:pr});
  var so=parseFloat($("prSo").value);if(so>=0&&Math.round(so*100)!==p.soglia_cent)az.push({azione:"soglia",tag:p.tag,soglia:so});
  if(!az.length){e.textContent=T("Niente da salvare");return}
  var k=0,err=null;function next(){if(k>=az.length||err){caricaPrepagate().then(function(){e.classList.toggle("err",!!err);e.textContent=err?T(err):T("Salvato")});return}
    post("/api/prepagate",az[k++]).then(function(r){if(r.errore)err=r.errore;next()})}next()};
$("bPrTogli").onclick=function(){var p=PRE.filter(function(x){return x.tag===$("prSel").value})[0];if(!p)return;
  if(!confirm(T("Riportare la tessera a consumo? Il credito residuo non viene più controllato e la tessera, se bloccata per il credito, viene sbloccata.")))return;
  post("/api/prepagate",{azione:"rimuovi",tag:p.tag}).then(function(r){$("prEsito").textContent=r.errore?T(r.errore):T("Salvato");caricaPrepagate()})};
$("bPrNuova").onclick=function(){var e=$("prNEsito");e.classList.remove("err");e.textContent="...";
  post("/api/prepagate",{azione:"attiva",tag:$("prNuova").value,prezzo:$("prNPr").value,credito:$("prNCr").value||0,soglia:$("prNSo").value}).then(function(r){
    e.classList.toggle("err",!!r.errore);e.textContent=r.errore?T(r.errore):T("Tessera attivata come prepagata");if(!r.errore){$("prNCr").value="";caricaPrepagate()}})};
$("rTipo").onchange=function(){$("rPreBox").classList.toggle("hide",this.value!=="prepagata")};
function caricaMiePrepagata(){
  api("/api/mieprepagata").then(function(L){
    var c=$("cPre");if(!Array.isArray(L)||!L.length){c.innerHTML="";return}
    c.innerHTML=L.map(function(p){
      var pct=p.credito_cent>0?Math.max(0,Math.min(100,Math.round(p.residuo_cent*100/p.credito_cent))):0,cls=p.bloccata||p.residuo_cent<=0?"err":p.residuo_cent<=p.soglia_cent?"warn":"";
      var txt=p.bloccata||p.residuo_cent<=0?T("Credito esaurito: la tessera è bloccata. Per ricaricare il credito contatta l'amministratore."):(p.residuo_cent<=p.soglia_cent?T("Credito quasi esaurito. "):"")+T("Quando il credito arriva a zero la ricarica si ferma e la tessera viene bloccata. Per ricaricare il credito contatta l'amministratore.");
      return '<div class="card"><h2>'+T("Tessera prepagata")+(p.nome?" · "+esc(p.nome):"")+' <span class="sub">'+esc(p.tag)+'</span></h2>'
        +'<div class="metri"><div><small>'+T("Credito residuo")+'</small><b class="'+cls+'">'+it(Math.max(0,p.residuo_cent)/100)+' €</b></div><div><small>'+T("Prezzo")+'</small><b>'+it(p.prezzo_cent/100)+' €/kWh</b></div>'
        +'<div><small>'+T("Ancora disponibili")+'</small><b>'+it(p.residuo_wh/1000,1)+' kWh</b></div><div><small>'+T("Consumato dal ")+new Date(p.dal).toLocaleDateString(LOC)+'</small><b>'+it(p.consumato_wh/1000,1)+' kWh</b></div></div>'
        +'<div class="barra"><div class="'+cls+'" style="width:'+pct+'%"></div></div><div class="sub">'+txt+"</div></div>"}).join("");
  });
}
function caricaMie(){
  caricaMiePrepagata();
  return api("/api/mie?anno="+$("selAnnoM").value).then(function(L){
    if(!Array.isArray(L))return;
    var t=row([th(T("Mese")),th(T("Ricariche"),1),th(T("kWh"),1),th(T("€/kWh"),1),th(T("Imponibile"),1),th(T("IVA"),1),th(T("Totale"),1)]),k=0,e=0,ok=false;
    L.forEach(function(x){k+=x.kwh;if(x.tot!==null){e+=x.tot;ok=true}
      t+='<tr class="ut" data-m="'+x.mese+'">'+td(T(x.nome))+td(x.n,1)+td(it(x.kwh),1)+td(x.prezzo===null?"-":it(x.prezzo,4),1)+td(it(x.imp),1)+td(it(x.iva),1)+td(it(x.tot),1)+"</tr>"});
    $("tabM").innerHTML=t;
    $("noteM").classList.toggle("hide",!L.some(function(x){return x.prezzo===null&&x.kwh>0}));
    $("totM").textContent=T("TOTALE ")+$("selAnnoM").value+": "+it(k)+" kWh"+(ok?" - "+it(Math.round(e*100)/100)+T(" € (IVA inclusa)"):"");
    document.querySelectorAll("#tabM tr.ut").forEach(function(tr){tr.onclick=function(){
      var nx=tr.nextElementSibling;
      if(nx&&nx.classList.contains("det")){while(tr.nextElementSibling&&tr.nextElementSibling.classList.contains("det"))tr.nextElementSibling.remove();return}
      var x=L[+tr.dataset.m-1],h="";
      x.sess.forEach(function(s){h+='<tr class="det"><td>'+s.inizio+" &rarr; "+s.fine+(io&&io.tessere&&io.tessere.length>1&&s.tag?" ("+esc(s.tag)+")":"")+'</td><td></td><td class="n">'+it(s.kwh)+'</td><td></td><td class="n">'+it(s.imp)+'</td><td class="n">'+it(s.iva)+'</td><td class="n">'+it(s.tot)+'</td></tr>'});
      tr.insertAdjacentHTML("afterend",h)}});
  });
}
$("selAnnoM").onchange=caricaMie;
$("bPdfM").onclick=function(){location.href="/api/mie.pdf?anno="+$("selAnnoM").value+"&mese="+$("selMeseM").value};
function esitoMail(r,pre){
  if(r.mail==="inviata")return pre+T("Report inviato a ")+(r.destinatari||[]).join(", ");
  return pre+T("Report non inviato (")+T(r.mail)+")";
}
$("bReinvia").onclick=function(){
  if(!confirm(T("Inviare di nuovo il report di questo mese ai destinatari?")))return;
  post("/api/reinvia",{anno:+$("selAnno").value,mese:+$("selMese").value}).then(function(r){
    $("esito").textContent=r.errore?T(r.errore):esitoMail(r,"")});
};
/* ---- installation settings (admin) ---- */
var CUR="€",FEE="",CONTATTO="",cfg=null;
var CF_TXT=["url","user","header_name","header_value","history_path","tags_path","status_path","timeout","hist_json_field","hist_sep","hist_skip","c_start","c_end","c_tag","c_type","c_cont_ini","c_cont_fin","title","tz","currency","tax_label","card_fee","contact","charger_id","mail_from"];
function feeTesto(){return FEE?" ("+FEE+")":""}
function applicaConfig(m){
  CUR=m.valuta||"€";FEE=m.costo_tessera||"";CONTATTO=m.contatto||"";
  if(CUR!=="€"){var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];while(n=w.nextNode())L.push(n);L.forEach(function(x){if(x.nodeValue.indexOf("€")>=0)x.nodeValue=x.nodeValue.split("€").join(CUR)})}
  document.querySelectorAll(".fee-par").forEach(function(e){e.textContent=FEE?" ("+T("costo")+" "+FEE+" "+T("una tantum")+")":""});
  document.querySelectorAll(".fee-info").forEach(function(e){e.textContent=FEE?T("Costo della tessera: ")+FEE+" "+T("una tantum, non è una cauzione e non viene restituito; se la tessera viene smarrita o danneggiata ne servirà un'altra. "):""});
  var pc=$("pContatto");if(pc)pc.textContent=CONTATTO?T(", oppure scrivi a ")+CONTATTO:"";
  if(CONTATTO){$("infoContatto").classList.remove("hide");$("infoContattoV").textContent=CONTATTO}
}
function formCfg(c){
  CF_TXT.forEach(function(k){var e=$("cf_"+k);if(e)e.value=c[k]===undefined||c[k]===null?"":c[k]});
  $("cf_auto").checked=!!c.auto;$("cf_password").value="";$("cf_pw_clear").checked=false;
  $("cf_password").placeholder=c.password_set?T("(salvata)"):"";
  $("cf_resend_key").value="";$("cf_rk_clear").checked=false;$("cf_resend_key").placeholder=c.resend_set?T("(salvata)"):"re_...";
  $("cf_telegram_token").value="";$("cf_telegram_secret").value="";$("cf_tg_clear").checked=false;
  $("cf_telegram_token").placeholder=c.telegram_set?T("(salvato)"):"123456:ABC...";$("cf_telegram_secret").placeholder=c.telegram_set?T("(salvato)"):"";
  caricaMessaggi();
}
function leggiCfg(){
  var o={};CF_TXT.forEach(function(k){var e=$("cf_"+k);if(e)o[k]=e.value});
  o.auto=$("cf_auto").checked;
  if($("cf_pw_clear").checked)o.password="";else if($("cf_password").value!=="")o.password=$("cf_password").value;else o.password=null;
  if($("cf_rk_clear").checked)o.resend_key="";else if($("cf_resend_key").value!=="")o.resend_key=$("cf_resend_key").value;else o.resend_key=null;
  if($("cf_tg_clear").checked){o.telegram_token="";o.telegram_secret=""}else{o.telegram_token=$("cf_telegram_token").value!==""?$("cf_telegram_token").value:null;o.telegram_secret=$("cf_telegram_secret").value!==""?$("cf_telegram_secret").value:null}
  return o;
}
function caricaMessaggi(){return api("/api/messaggi").then(function(s){if(!s||s.errore||!s.telegram)return;
  $("msgStato").textContent=!s.telegram.attivo?T("non configurato"):s.telegram.bot?T("attivo, bot @")+s.telegram.bot+" ("+oraTxt(Date.parse(s.telegram.attivato))+")":T("salvato, bot da attivare")})}
$("bTgAttiva").onclick=function(){$("msgEsito").textContent="";post("/api/messaggi",{azione:"attiva_telegram"}).then(function(r){$("msgEsito").textContent=r.errore?T(r.errore):T("Telegram attivato");caricaMessaggi()})};
$("bTgGenera").onclick=function(){var a=new Uint8Array(24);crypto.getRandomValues(a);$("cf_telegram_secret").type="text";$("cf_telegram_secret").value=Array.prototype.map.call(a,function(x){return("0"+x.toString(16)).slice(-2)}).join("")};
function caricaConfig(){
  return api("/api/config").then(function(r){
    if(!r.config)return;cfg=r;formCfg(r.config);
    $("envUrl").textContent=r.fonti.url_env?T("(valore iniziale da wrangler.toml)"):"";
    api("/api/colonnina-info").then(function(c){var t="";if(c&&c.ultimo_ip)t=T("IP all'ultimo scarico: ")+c.ultimo_ip.ip+" ("+new Date(c.ultimo_ip.quando).toLocaleString(LOC,{dateStyle:"short",timeStyle:"short"})+")";$("cInfo").textContent=t});
  });
}
$("bCfSalva").onclick=function(){
  $("cfEsito").textContent="";
  post("/api/config",leggiCfg()).then(function(r){
    if(r.errore){$("cfEsito").classList.add("err");$("cfEsito").textContent=T(r.errore);return}
    $("cfEsito").classList.remove("err");$("cfEsito").textContent=T("Impostazioni salvate");
    api("/api/me").then(function(m){io=m;applicaConfig(m);caricaConfig()});
  });
};
$("bCfReset").onclick=function(){if(cfg){var d=cfg.defaults;d.password_set=false;formCfg(d);$("cf_url").value=cfg.config.url;$("cf_pw_clear").checked=false}};
$("bCfProva").onclick=function(){
  $("cfProva").innerHTML='<div class="sub">'+T("Provo la connessione...")+'</div>';$("cfEsito").textContent="";
  post("/api/config/test",leggiCfg()).then(function(r){
    if(r.errore){$("cfProva").innerHTML="";$("cfEsito").classList.add("err");$("cfEsito").textContent=T(r.errore);return}
    $("cfProva").innerHTML=bloccoProva(T("Storico"),r.history)+(r.tags?bloccoProva(T("Elenco tessere"),r.tags):"");
  });
};
function bloccoProva(nome,x){
  if(!x)return "";
  var h='<div class="card"><h2>'+esc(nome)+": "+(x.ok?T("ok"):T("errore"))+' <span class="sub">('+x.ms+" ms"+(x.bytes!==undefined?", "+x.bytes+" byte":"")+')</span></h2>';
  if(x.errore)h+='<div class="sub err">'+esc(x.errore)+"</div>";
  if(x.righe!==undefined)h+='<div class="sub">'+T("Righe lette: ")+x.righe+"</div>";
  if(x.primo)h+='<div class="sub">'+T("Prima sessione: ")+esc(x.primo.inizio)+" - "+esc(x.primo.fine)+", "+T("tessera ")+esc(x.primo.tag)+", "+esc(x.primo.wh)+" Wh</div>";
  if(x.sample)h+='<pre style="white-space:pre-wrap;font-size:12px;max-height:160px;overflow:auto;border:1px solid var(--line);border-radius:6px;padding:6px">'+esc(x.sample)+"</pre>";
  return h+"</div>";
}
/* ---- legal texts (admin) ---- */
var TL=["edizione","reg_it","reg_en","priv_it","priv_en"];
function caricaTesti(){return api("/api/testi").then(function(t){if(!t)return;TL.forEach(function(k){$("tl_"+k).value=t[k]||""})})}
$("bTesti").onclick=function(){var o={};TL.forEach(function(k){o[k]=$("tl_"+k).value});
  post("/api/testi",o).then(function(r){$("tlEsito").classList.toggle("err",!!r.errore);$("tlEsito").textContent=r.errore?T(r.errore):T("Testi salvati")})};
function oraTxt(ms){return ms?new Date(ms).toLocaleString(LOC,{dateStyle:"short",timeStyle:"medium"}):"-"}
function misura(m,k,div,dec,u){var x=m&&m.dati&&m.dati[k];if(!x)return null;var v=parseFloat(x.v);if(isNaN(v))return null;if(/^k/i.test(x.u))div=1;return (v/div).toFixed(dec)+" "+u}
function caricaOcpp(leggero){
  var dopo=leggero&&OEV.length?OEV[0].id:null;
  return api("/api/ocpp"+(dopo?"?dopo="+dopo:"")).then(function(r){
    if(r.errore){$("oEsito").textContent=T(r.errore);return}
    $("oEsito").textContent="";$("oUrl").value="wss://"+r.host+r.percorso;
    var t=(r.connessa?T("Colonnina collegata"):T("Colonnina non collegata"))+" · "+T("ultimo messaggio: ")+oraTxt(r.ultimo_msg);
    var pr=r.prese&&r.prese["1"];if(pr)t+=" · "+T("presa: ")+pr.status+(pr.errore&&pr.errore!=="NoError"?" ("+pr.errore+")":"");
    var tx=r.transazione_aperta;
    if(tx){t+=" · "+T("ricarica in corso, tessera ")+tx.tag+T(", dalle ")+oraTxt(tx.inizio);
      var m=r.meter,pw=misura(m,"Power.Active.Import",1000,2,"kW"),a=misura(m,"Current.Import",1,1,"A")||misura(m,"Current.Import.L1",1,1,"A"),v=misura(m,"Voltage",1,0,"V");
      var e=m&&m.dati&&m.dati["Energy.Active.Import.Register"],ks=e&&tx.meter_ini!=null?((parseFloat(e.v)-tx.meter_ini)/(/^k/i.test(e.u)?1:1000)).toFixed(2)+" kWh":null;
      var q=[pw,ks&&T("caricati ")+ks,a,v].filter(Boolean);if(q.length)t+=" · "+q.join(" · ")}
    $("oStato").textContent=t;if(document.activeElement!==$("oListaOn"))$("oListaOn").checked=!!r.lista_on;$("bOSync").disabled=!r.lista_on;$("oLista").textContent=listaTxt(r);
    var hb=r.heartbeat;if(hb){if(document.activeElement!==$("oHb"))$("oHb").value=Math.round(hb.voluto/60);
      $("oHbTxt").textContent=hb.inviato===hb.voluto?T("impostato sulla colonnina"):T("in attesa: viene mandato alla colonnina al prossimo messaggio")}
    disegnaPar(r.parametri);OEV=dopo?(r.eventi||[]).concat(OEV):(r.eventi||[]);disegnaOcpp()});
}
var PAR_ET={ConnectionTimeOut:["Attesa tessera dopo il collegamento del cavo","secondi"],WebSocketPingInterval:["Controllo della connessione col sito ogni","secondi"],
  TransactionMessageRetryInterval:["Nuovo tentativo se un messaggio di ricarica non arriva dopo","secondi"],TransactionMessageAttempts:["Numero di tentativi per ogni messaggio di ricarica","volte"],
  MeterValueSampleInterval:["Misure durante la ricarica ogni","secondi"],ClockAlignedDataInterval:["Misure a orari fissi ogni (0 = mai)","secondi"]};
function disegnaPar(p){
  var box=$("oPar");if(!p||!box)return;
  if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
  var h="";
  Object.keys(PAR_ET).forEach(function(k){
    var d=p.def[k],v=p.voluti[k]!==undefined?p.voluti[k]:d[2],st=p.voluti[k]===undefined?"":(p.inviati[k]===p.voluti[k]?T("impostato sulla colonnina"):T("in attesa: viene mandato alla colonnina al prossimo messaggio"));
    h+='<div class="bar"><label>'+T(PAR_ET[k][0])+' <input data-k="'+k+'" type="number" min="'+d[0]+'" max="'+d[1]+'" value="'+v+'" style="width:6em"> '+T(PAR_ET[k][1])+'</label> <button data-k="'+k+'" class="bPar">'+T("Salva")+'</button> <span class="sub">'+T("da")+' '+d[0]+' '+T("a")+' '+d[1]+(st?' · '+st:'')+'</span></div>'});
  var off=p.voluti.LocalAuthorizeOffline!==undefined?p.voluti.LocalAuthorizeOffline:true,so=p.voluti.LocalAuthorizeOffline===undefined?"":(p.inviati.LocalAuthorizeOffline===p.voluti.LocalAuthorizeOffline?T("impostato sulla colonnina"):T("in attesa: viene mandato alla colonnina al prossimo messaggio"));
  h+='<div class="bar"><label><input type="checkbox" id="oOff"'+(off?' checked':'')+'> '+T("Tessere in lista valide anche se il server non risponde")+'</label> <span class="sub">'+so+'</span></div>';
  box.innerHTML=h;
}
$("oPar").onclick=function(e){
  var t=e.target,k=t.getAttribute&&t.getAttribute("data-k");
  if(t.className==="bPar"&&k){var inp=$("oPar").querySelector('input[data-k="'+k+'"]');
    post("/api/ocpp",{azione:"parametro",chiave:k,valore:inp.value}).then(function(r){if(r&&r.errore)alert(T(r.errore));setTimeout(ocStato,2500)})}};
$("oPar").onchange=function(e){
  if(e.target.id==="oOff")post("/api/ocpp",{azione:"parametro",chiave:"LocalAuthorizeOffline",valore:e.target.checked}).then(function(){setTimeout(ocStato,2500)})};
function listaTxt(r){
  var l=r.lista,t;
  if(!r.lista_on)return T("Lista offline: disattivata, il server non invia tessere alla colonnina");
  if(r.sync_pendente)t=T("Lista offline: aggiornamento in attesa che la presa sia libera");
  else if(!l)t=T("Lista offline: nessun invio registrato");
  else{var q=l.inviate+"/"+l.n+" "+T("tessere inviate il ")+oraTxt(l.quando);
    t=T("Lista offline: ")+q+" - "+(l.ok===true?T("allineata"):l.ok===false?T("ultimo invio non riuscito"):T("invio non completato"))}
  return t}
$("bOHb").onclick=function(){post("/api/ocpp",{azione:"heartbeat",minuti:$("oHb").value}).then(function(r){if(r&&r.errore)alert(T(r.errore));setTimeout(caricaOcpp,2500)})};
$("bOSync").onclick=function(){post("/api/ocpp",{azione:"sincronizza"}).then(function(r){if(r&&r.errore)alert(T(r.errore));setTimeout(caricaOcpp,2500)})};
$("oListaOn").onchange=function(){post("/api/ocpp",{azione:"lista",attiva:$("oListaOn").checked}).then(function(){setTimeout(caricaOcpp,800)})};
var OEV=[];
var OCPP_EN=[[/^Comando alla colonnina: /,"Command to the charger: "],[/^Risposta della colonnina a /,"Charger's reply to "],[/^Risposta della colonnina: /,"Charger's reply: "],[/^Errore dalla colonnina: /,"Error from the charger: "],[/^Errore inviato alla colonnina: /,"Error sent to the charger: "],
  [/^Avvio colonnina /,"Charger start "],[/^Conferma collegamento$/,"Heartbeat"],[/^Presa (\d+): /,"Socket $1: "],[/ \(errore /," (error "],[/^Richiesta di autorizzazione, tessera /,"Authorisation request, card "],[/^Inizio ricarica, tessera /,"Charge started, card "],[/^Fine ricarica/,"Charge ended"],[/, contatore /,", meter "],[/^Misura: /,"Measurement: "],[/contatore /,"meter "],
  [/^connessione aperta/,"connection opened"],[/^connessione chiusa/,"connection closed"],[/nessun sottoprotocollo/,"no subprotocol"],[/^Nomi tessere rimessi sulla colonnina: /,"Card names put back on the charger: "],[/^Nomi tessere da rimettere: colonnina occupata, riprovo piu' tardi$/,"Card names to put back: charger busy, retrying later"],[/^nomi tessere non rimessi: /,"card names not put back: "],[/^errore connessione: /,"connection error: "],[/^errore in /,"error in "],
  [/riavvio/,"restart"],[/lettura configurazione/,"read settings"],[/modifica impostazione/,"change setting"],[/invio lista tessere/,"send card list"],[/versione lista tessere/,"card list version"],[/richiesta messaggio/,"request message"],[/stop ricarica da remoto/,"remote stop"],[/ tessere\)/," cards)"],
  [/: accettato, vale dopo il riavvio$/,": accepted, applied after restart"],[/: accettato$/,": accepted"],[/: rifiutato$/,": rejected"],[/: non supportato$/,": not supported"],[/: non riuscito$/,": failed"],[/: versione lista non valida$/,": invalid list version"],[/: non previsto$/,": not implemented"],[/configurazione letta \((\d+) parametri\)/,"settings read ($1 keys)"],[/configurazione letta/,"settings read"],[/versione lista (\d+)/,"list version $1"]];
function evTr(t){if(LANG!=="en")return t;OCPP_EN.forEach(function(p){t=t.replace(p[0],p[1])});return t}
function disegnaOcpp(){
  var raw=$("oRaw").checked;
  var h='<colgroup><col style="width:150px"><col style="width:28px"><col></colgroup>'+row([th(T("Ora")),th(""),th(T("Messaggio"))]);
  OEV.forEach(function(e){h+=row([td(oraTxt(e.ts)),td(esc(e.dir==="<"?"←":e.dir===">"?"→":"·")),td('<div style="white-space:normal;overflow-wrap:anywhere;font-size:'+(raw?12:14)+'px">'+esc(raw?e.raw:evTr(T(e.testo)))+"</div>")])});
  $("tabO").innerHTML=h;
}
$("oRaw").onchange=disegnaOcpp;
$("bOPrec").onclick=function(){if(!OEV.length)return;$("bOPrec").disabled=true;api("/api/ocpp?prima="+OEV[OEV.length-1].id).then(function(r){$("bOPrec").disabled=false;
  var e=(r&&r.eventi)||[];if(!e.length){$("bOPrec").classList.add("hide");$("oPrecTxt").textContent=T("Fine del registro (conservato 48 ore)");return}OEV=OEV.concat(e);disegnaOcpp()})};
$("bOAgg").onclick=caricaOcpp;
$("bORig").onclick=function(){if(confirm(T("Rigenerare il codice? La colonnina smette di collegarsi finché non aggiorni l'indirizzo.")))post("/api/ocpp",{azione:"rigenera"}).then(function(){caricaOcpp()})};
setInterval(function(){if(!document.hidden&&!$("t8").classList.contains("hide"))caricaOcpp(true)},10000);
function ocStato(){return api("/api/ocpp").then(function(r){
  if(r.errore){$("ocStato").textContent=T(r.errore);return}
  var pr=r.prese&&r.prese["1"];
  $("ocStato").textContent=(r.connessa?T("Colonnina collegata"):T("Colonnina non collegata"))+(pr?" · "+T("presa: ")+pr.status:"")+(r.transazione_aperta?" · "+T("ricarica in corso, tessera ")+r.transazione_aperta.tag:"");disegnaPar(r.parametri)})}
function ocForm(){var c=$("ocCmd").value;$("ocMsgL").classList.toggle("hide",c!=="TriggerMessage");}
$("ocCmd").onchange=ocForm;
function ocMostra(c,r){
  var h="";
  if(c==="GetConfiguration"&&r.configurationKey){
    h='<div class="w" style="max-height:420px;overflow:auto"><table>'+row([th(T("Voce")),th(T("Valore")),th(T("Modificabile"))])
      +r.configurationKey.map(function(k){return row([td(esc(k.key)),td(esc(k.value===undefined?"-":k.value)),td(k.readonly?T("no"):T("sì"))])}).join("")+"</table></div>";
    if(r.unknownKey&&r.unknownKey.length)h+='<div class="sub">'+T("Voci sconosciute: ")+esc(r.unknownKey.join(", "))+"</div>"}
  else h='<pre style="white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0">'+esc(JSON.stringify(r,null,2))+"</pre>";
  $("ocRis").innerHTML=h}
$("bOcInvia").onclick=function(){
  var c=$("ocCmd").value,b={azione:"comando",comando:c,richiesta:$("ocMsg").value};
  if(c==="RemoteStopTransaction"&&!confirm(T("Fermare la ricarica in corso?")))return;
  if(c==="Reset"&&!confirm(T("Riavviare la colonnina? Durante il riavvio resta scollegata dal server.")))return;
  $("ocEsito").classList.remove("err");$("ocEsito").textContent=T("In attesa della risposta...");$("ocRis").innerHTML="";$("bOcInvia").disabled=true;
  post("/api/ocpp",b).then(function(r){
    $("bOcInvia").disabled=false;
    if(r.errore){$("ocEsito").classList.add("err");$("ocEsito").textContent=T(r.errore);return}
    $("ocEsito").textContent=T("Risposta ricevuta alle ")+new Date().toLocaleTimeString(LOC);ocMostra(c,r.risposta||{})})};
function durTxt(ms){var m=Math.max(0,Math.round(ms/60000)),h=Math.floor(m/60);return h?h+" h "+(m%60)+" min":m+" min"}
function caricaLive(){
  return api("/api/live").then(function(r){
    var tit="",h="",agg="";
    if(r.errore)tit=T(r.errore);
    else if(!r.connessa)tit=T("Colonnina non collegata al server: dati non disponibili");
    else if(!r.occupata)tit=r.stato==="Preparing"?T("Auto collegata, in attesa della tessera"):T("Colonnina libera");
    else{tit=T("Occupata")+" - "+(r.da?r.da:T("tessera sconosciuta"));
      var d=r.dettagli;
      if(d){var f=function(x,n,u){return x==null?"-":x.toFixed(n)+" "+u};
        h=row([td(T("Potenza")),td(f(d.kw,2,"kW"))])+row([td(T("Corrente")),td(f(d.a,1,"A"))])+(d.v!=null?row([td(T("Tensione")),td(f(d.v,0,"V"))]):"")
          +row([td(T("Energia caricata")),td(f(d.kwh,2,"kWh"))])+row([td(T("Inizio")),td(oraTxt(d.inizio))])+row([td(T("Durata")),td(durTxt(Date.now()-d.inizio))])+row([td(T("Tessera")),td(esc(d.tag))]);
        if(d.agg)agg=T("Aggiornato alle ")+new Date(d.agg).toLocaleTimeString(LOC,{timeStyle:"short"})}}
    $("liveTit").textContent=tit;$("tabL").innerHTML=h;$("liveAgg").textContent=agg});
}
var MONN=0;setInterval(function(){if(!document.hidden&&!$("t9").classList.contains("hide")){caricaLive();if(MONADM&&++MONN%6===0)caricaMal()}},10000);   // live status every 10 s, rules every 60 s (they change with the 5-minute cron)
var RFID=[],RMOD=null;
function scadIso(d){if(!d)return"";var o=-new Date(d+"T23:59:00").getTimezoneOffset(),z=o>=0?"+":"-";o=Math.abs(o);return d+"T23:59:00"+z+String(Math.floor(o/60)).padStart(2,"0")+":"+String(o%60).padStart(2,"0")}
function scadTxt(x){if(!x.scad)return"";var d=new Date(x.scad);if(isNaN(d))return esc(x.scad);var t=d.toLocaleDateString(LOC);return d<new Date()?'<span class="err">'+t+" ("+T("scaduta")+")</span>":t}
function modoR(m){RMOD=m;$("rTipoL").classList.toggle("hide",!!m);if(m)$("rPreBox").classList.add("hide");$("rDalL").classList.toggle("hide",!!(m&&m.indice!==undefined));$("bRAgg").textContent=T(m?(m.indice!==undefined?"Ripara":"Salva modifica"):"Aggiungi");$("bRAnn").classList.toggle("hide",!m);$("rId").readOnly=!!(m&&m.indice===undefined);
  if(!m){$("rId").value="";$("rNome").value="";$("rScad").value="";$("rDal").value="";$("rStato").value="0"}}
var STATI=["Attiva","Bloccata","Scaduta","Non valida"];
function statoTxt(v){var t=STATI[+v];return t===undefined?esc(v):(v==="0"?T(t):'<span class="err">'+T(t)+"</span>")}
var RSEL=-1,NOMI=[],RERR="";
// one table: cards on the charger (with their assignment period) + closed periods (deactivated or reassigned cards)
function mostraRfid(r){
  var e=$("rEsito");e.classList.toggle("err",!!r.errore||!!r.avviso);
  RERR=r.errore||"";
  if(r.errore){e.textContent=T(r.errore);RFID=[]}
  if(r.lista)RFID=r.lista.map(function(x,i){x.i=i;return x});
  if(r.backup!==undefined){$("bRRip").classList.toggle("hide",!r.backup);if(r.backup)$("bRRip").title=T("Copia del ")+new Date(r.backup.quando).toLocaleString(LOC,{dateStyle:"short",timeStyle:"short"})+" ("+r.backup.n+T(" tessere)")}
  disegnaR();
  if(r.avviso)e.textContent=T(r.avviso);
  else if(!r.errore&&RFID.some(function(x){return !x.id}))e.textContent=T("Ci sono tessere senza codice: non funzionano finché non le ripari");
}
function disegnaR(){
  var bDate=function(n){return n<0?"":' <button class="nd" data-n="'+n+'">'+T("Date")+'</button>'};
  var aperto=function(tag){var k=-1;NOMI.forEach(function(p,n){if(p.tag===tag&&!p.al_txt)k=n});return k};
  var sc=RFID.some(function(x){return x.scad}),tdS=function(v){return sc?td(v):""};
  var t=row([th(T("Codice tessera")),th(T("Nome")),th(T("Assegnata dal")),th(T("Disattivata il")),sc?th(T("Scadenza")):"",th(T("Stato")),th("")]);
  var ord=RFID.slice().sort(function(a,b){return a.nome.localeCompare(b.nome,undefined,{numeric:true})});
  var usati={};
  ord.forEach(function(x){
    var n=x.id?aperto(x.id):-1;if(n>=0)usati[n]=1;var p=n>=0?NOMI[n]:null;
    var az=x.id?'<button class="rm" data-i="'+x.i+'" data-n="'+n+'">'+T("Modifica")+'</button>'
      :'<button class="p rr" data-i="'+x.i+'">'+T("Ripara")+'</button> <button class="rd" data-i="'+x.i+'">'+T("Elimina")+'</button>';
    t+='<tr class="rs" data-i="'+x.i+'">'+td(x.id?esc(x.id):'<span class="err">'+T("senza codice")+(x.suggerito?" ("+T("era ")+esc(x.suggerito)+")":"")+"</span>")+td(esc(x.nome)+(x.prepagata?' <span class="pst '+(x.prepagata.bloccata?"err":"ok")+'">'+T("prepagata")+(x.prepagata.residuo_cent!=null?" · "+it(x.prepagata.residuo_cent/100)+" €":"")+"</span>":""))+td(p?esc(p.dal_txt):"")+td("")+tdS(scadTxt(x))+td(statoTxt(x.stato))+'<td class="n">'+az+"</td></tr>";
  });
  // closed periods and, if the charger does not answer, the open ones from the site database
  NOMI.map(function(p,n){return {p:p,n:n}}).filter(function(o){return !usati[o.n]&&(o.p.al_txt||RERR)})
    .sort(function(a,b){return a.p.nome.localeCompare(b.p.nome,undefined,{numeric:true})||a.p.dal-b.p.dal})
    .forEach(function(o){var p=o.p;
      t+='<tr class="old">'+td(esc(p.tag))+td(esc(p.nome))+td(esc(p.dal_txt))+td(p.al_txt?esc(p.al_txt):"")+tdS("")+td(p.al_txt?T("Disattivata"):T("non verificata"))+'<td class="n">'+bDate(o.n)+"</td></tr>"});
  $("tabR").innerHTML=t;RSEL=-1;$("bRDis").disabled=true;
}
function caricaNomi(){return api("/api/nomi").then(function(L){NOMI=Array.isArray(L)?L:[]})}
function caricaRfid(){modoR(null);$("rEsito").classList.remove("err");$("rEsito").textContent=T("Leggo la colonnina...");
  return Promise.all([api("/api/rfid"),caricaNomi()]).then(function(v){$("rEsito").textContent="";mostraRfid(v[0])})}
function rfid(b,msg){$("rEsito").classList.remove("err");$("rEsito").textContent=T("Scrivo sulla colonnina...");return post("/api/rfid",b).then(function(r){
  if(!r.errore){caricaRfid().then(function(){$("rEsito").classList.toggle("err",!r.ok);$("rEsito").textContent=r.ok?T(msg):T(r.avviso||"")})}else mostraRfid(r);return r})}
$("bRAgg").onclick=function(){
  var b={id:$("rId").value,nome:$("rNome").value,scad:scadIso($("rScad").value),stato:$("rStato").value,dal:$("rDal").value};
  if(!RMOD){var pre=$("rTipo").value==="prepagata"?{azione:"attiva",tag:b.id,prezzo:$("rPPr").value,credito:$("rPCr").value||0,soglia:$("rPSo").value}:null;
    if(pre&&!(parseFloat(String(pre.prezzo).replace(",","."))>0)){$("rEsito").classList.add("err");$("rEsito").textContent=T("Indica il prezzo al kWh della prepagata");return}
    rfid(Object.assign(b,{azione:"aggiungi"}),"Tessera aggiunta").then(function(r){if(r&&!r.errore&&pre)post("/api/prepagate",pre).then(function(q){$("rEsito").classList.toggle("err",!!q.errore);$("rEsito").textContent=q.errore?T(q.errore):T("Tessera aggiunta e attivata come prepagata");caricaRfid()})})}
  else if(RMOD.indice!==undefined)rfid(Object.assign(b,{azione:"ripara",indice:RMOD.indice}),"Tessera riparata");
  else{
    var p=RMOD.p,nd=b.dal?b.dal.split("-").reverse().join("-"):"",cambioData=p&&nd&&nd!==p.dal_txt;
    var cambioCol=b.nome.trim()!==RMOD.nome||b.stato!==RMOD.stato||$("rScad").value!==RMOD.scad;
    var data=function(){return cambioData?post("/api/nomi",{tag:p.tag,dal:p.dal,nuovo_dal:nd,nuovo_al:""}).then(function(r){if(r.errore)alert(T(r.errore))}):Promise.resolve()};
    if(cambioCol)data().then(function(){rfid(Object.assign(b,{azione:"modifica"}),"Tessera aggiornata")});   // writes to the charger only when needed
    else data().then(function(){caricaNomi().then(function(){modoR(null);disegnaR();$("rEsito").classList.remove("err");$("rEsito").textContent=T(cambioData?"Data aggiornata":"Nessuna modifica")})});
  }
};
$("bRAnn").onclick=function(){modoR(null)};
$("tabR").onclick=function(ev){
  var b=ev.target.closest("button");
  if(b&&b.classList.contains("nd")){var p=NOMI[+b.dataset.n];if(!p)return;
    var d=prompt(T("Assegnata dal (gg-mm-aaaa)"),p.dal_txt);if(d===null)return;
    var a=prompt(T("Dismessa il (gg-mm-aaaa). Vuoto = ancora assegnata"),p.al_txt);if(a===null)return;
    post("/api/nomi",{tag:p.tag,dal:p.dal,nuovo_dal:d.trim(),nuovo_al:a.trim()}).then(function(r){if(r.errore)alert(T(r.errore));caricaNomi().then(disegnaR)});return}
  if(!b){var tr=ev.target.closest("tr.rs");if(!tr)return;var k=+tr.dataset.i;
    Array.prototype.forEach.call($("tabR").querySelectorAll("tr.rs"),function(q){q.classList.remove("sel")});
    if(RSEL===k){RSEL=-1}else{RSEL=k;tr.classList.add("sel")}
    var sx=RFID[RSEL];$("bRDis").disabled=!(sx&&sx.id);return}var x=RFID[+b.dataset.i];if(!x)return;
  var d=x.scad&&!isNaN(new Date(x.scad))?x.scad.slice(0,10):"";
  if(b.classList.contains("rm")){var pn=NOMI[+b.dataset.n];modoR({p:pn,nome:x.nome,stato:x.stato,scad:d});$("rDal").value=pn?pn.dal_txt.split("-").reverse().join("-"):"";$("rId").value=x.id;$("rNome").value=x.nome;$("rScad").value=d;$("rStato").value=STATI[+x.stato]?x.stato:"0";$("rNome").focus()}
  if(b.classList.contains("rr")){modoR({indice:x.i});$("rId").value=x.suggerito||"";$("rNome").value=(x.nome_completo||x.nome).slice(0,25);$("rScad").value=d;$("rStato").value=STATI[+x.stato]?x.stato:"0";$("rId").focus()}
  if(b.classList.contains("rd")&&confirm(x.id?T("Dismettere la tessera ")+x.id+" - "+x.nome+T("? Viene tolta dalla colonnina, lo storico resta."):T("Eliminare dalla colonnina la tessera ")+T("senza codice")+" - "+x.nome+"?")){
    var al="";if(x.id){al=prompt(T("Data di dismissione (gg-mm-aaaa). Vuoto = oggi"),"");if(al===null)return;al=al.trim();if(al&&!/^\d{1,2}[\/.-]?\d{1,2}[\/.-]?\d{4}$/.test(al)){alert(T("Data non valida"));return}}
    rfid(x.id?{azione:"elimina",id:x.id,al:al}:{azione:"elimina",indice:x.i},"Tessera eliminata")}
};
$("bRDis").onclick=function(){var x=RFID[RSEL];if(!x||!x.id)return;
  if(!confirm(T("Disattivare in modo permanente la tessera ")+x.id+" - "+x.nome+T("? Viene tolta dalla colonnina, lo storico resta.")))return;
  var al=prompt(T("Data di disattivazione (gg-mm-aaaa). Vuoto = oggi"),"");if(al===null)return;al=al.trim();
  if(al&&!/^\d{1,2}[\/.-]?\d{1,2}[\/.-]?\d{4}$/.test(al)){alert(T("Data non valida"));return}
  rfid({azione:"elimina",id:x.id,al:al},"Tessera disattivata")};
$("bRImp").onclick=function(){$("rFile").value="";$("rFile").click()};
$("rFile").onchange=function(){var f=this.files[0];if(!f)return;f.text().then(function(t){
  if(confirm(T("Importare le tessere del file ")+f.name+T(" sulla colonnina?")))rfid({azione:"importa",testo:t},"Import completato")})};
$("bRLeggi").onclick=function(){$("rEsito").classList.remove("err");caricaRfid()};
$("bREsp").onclick=function(){
  var s="1\r\n"+RFID.map(function(x){return x.id+";"+x.scad+";"+x.nome+";"+x.stato+"\r\n"}).join("");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([s],{type:"text/plain"}));a.download="tessere_colonnina_"+new Date().toISOString().slice(0,10)+".txt";a.click();
};
$("bRRip").onclick=function(){if(confirm(T("Riportare sulla colonnina la lista com'era prima dell'ultima modifica?")))rfid({azione:"ripristina"},"Lista ripristinata")};
var MONADM=false,MALDIRTY=false,AVDIRTY=false;
function caricaMal(){return api("/api/malfunzionamenti").then(disegnaMal)}
function caricaProfilo(salva){
  var p=salva?post("/api/profilo",{whatsapp:false,telegram:$("pTg").checked}):api("/api/profilo");
  return p.then(function(d){
    if(!d||d.errore||!d.registrato)return;
    $("tabP").innerHTML=row([th(T("Nome")),td(esc(d.nome+" "+d.cognome))])+row([th("Email"),td(esc(d.email))])+row([th(T("Telefono")),td(esc(d.tel1||"")+(d.tel2?" / "+esc(d.tel2):""))]);
    $("pTg").checked=!!d.telegram;
    if(d.tg_attivo){$("pTgBox").classList.remove("hide");tgStato()}else $("pTgBox").classList.add("hide");
    $("pAgg").textContent=d.aggiornato?T("Ultima modifica del consenso: ")+oraTxt(Date.parse(d.aggiornato)):"";
    if(salva)$("pEsito").textContent=T("Salvato");
  });
}
$("bProfilo").onclick=function(){$("pEsito").textContent="";caricaProfilo(true)};
var TGPOLL=null,TGN=0,TGPREV=0;
function tgStato(d){
  var p=d?Promise.resolve(d):api("/api/telegram");
  return p.then(function(s){
    if(!s||s.errore){$("pTgStato").textContent=s&&s.errore?T(s.errore):"";return}
    TGN=s.chat||0;
    $("pTgStato").textContent=s.collegato?T("collegato")+(TGN>1?" ("+TGN+")":""):T("non collegato");
    $("bTgCollega").classList.toggle("hide",TGN>=2);$("bTgCollega").textContent=T(TGN===1?"Collega un secondo Telegram":"Collega Telegram");$("bTgScollega").classList.toggle("hide",!s.collegato);
    $("pTgLink").innerHTML=s.link?'<a href="'+esc(s.link)+'" target="_blank" rel="noopener">'+T("Apri Telegram e premi Avvia")+'</a> '+T("(il collegamento vale 15 minuti)"):"";
    if(TGPOLL&&TGN>TGPREV){clearInterval(TGPOLL);TGPOLL=null}
  });
}
$("bTgCollega").onclick=function(){TGPREV=TGN;post("/api/telegram",{azione:"collega"}).then(function(s){tgStato(s);
  if(s&&s.link&&!TGPOLL){var n=0;TGPOLL=setInterval(function(){if(++n>180){clearInterval(TGPOLL);TGPOLL=null;return}tgStato()},5000)}})};
$("bTgScollega").onclick=function(){if(confirm(T("Scollegare Telegram (tutte le chat collegate)? Non riceverai più messaggi lì.")))post("/api/telegram",{azione:"scollega"}).then(tgStato)};

var TIPIT={tessera:"Tessera smarrita o danneggiata",dati:"Correzione dei dati",cancellazione:"Cancellazione dei dati / dell'utenza",colonnina:"Problema con la colonnina",altro:"Altro",nuova:"Richiesta nuova tessera"};
var TESST=[];
function tipoT(){var t=$("tkTipo").value;$("tkTessBox").classList.toggle("hide",t!=="tessera");$("tkTessInfo").style.display=t==="tessera"?"block":"none";$("tkDatiBox").classList.toggle("hide",t!=="dati");$("tkCancInfo").style.display=t==="cancellazione"?"block":"none";$("tkNuovaInfo").style.display=t==="nuova"?"block":"none";$("tkPagBox").classList.toggle("hide",t!=="nuova");$("tkPag").style.display=t==="nuova"?"block":"none";if(t==="nuova")pagTesto()}
var PAG={};
function pagLink(k,v){if(/^https:\/\//.test(v))return v;return k==="paypal"?"https://paypal.me/"+v+"/5EUR":k==="satispay"?"https://tag.satispay.com/"+v:"https://revolut.me/"+v}
function pagTesto(){api("/api/pagamento").then(function(d){if(!d)return;PAG=d;var cur=$("tkPagSel").value,o=[];
  if(d.paypal)o.push(["paypal","PayPal"]);if(d.satispay)o.push(["satispay","Satispay"]);if(d.revolut)o.push(["revolut","Revolut"]);o.push(["contanti",T("Contanti alla consegna")]);
  $("tkPagSel").innerHTML=o.map(function(x){return '<option value="'+x[0]+'">'+esc(x[1])+"</option>"}).join("");
  if(cur&&o.some(function(x){return x[0]===cur}))$("tkPagSel").value=cur;pagMostra()})}
function causale(){return "Tessera "+((io&&(io.nome_completo||io.nome))||"")}
function pagMostra(){var v=$("tkPagSel").value,h="";
  if(v==="contanti")h=T("Pagherai in contanti alla consegna della tessera")+(FEE?" ("+FEE+")":"")+".";
  else if(PAG[v]){var l=esc(pagLink(v,PAG[v]));h=T("Paga da qui")+(FEE?" ("+FEE+")":"")+': <a href="'+l+'" target="_blank" rel="noopener">'+l+"</a>"+(v==="paypal"?"<br>"+T("Su PayPal scegli «Amici e familiari»."):"")+"<br>"+T("Causale da indicare:")+' <b id="causale">'+esc(causale())+'</b> <button type="button" id="bCopia">'+T("Copia causale")+"</button>"}
  $("tkPag").innerHTML=h;var bc=$("bCopia");if(bc)bc.onclick=function(){var t=causale();try{navigator.clipboard.writeText(t).then(function(){bc.textContent=T("Copiata")})}catch(e){var r=document.createRange();r.selectNode($("causale"));getSelection().removeAllRanges();getSelection().addRange(r)}}}
$("tkPagSel").onchange=pagMostra;
$("bPag").onclick=function(){post("/api/pagamento",{paypal:$("pagPp").value,satispay:$("pagSa").value,revolut:$("pagRe").value}).then(function(r){$("pagEs").textContent=r.errore?T(r.errore):T("Salvato")})};
$("tkTipo").onchange=tipoT;tipoT();
function statoT(s){return T(s==="aperto"?"aperta":s==="approvato"?"approvata":s==="rifiutato"?"rifiutata":"chiusa")}
function extraT(t){
  var x=t.extra;if(!x)return "";
  if(t.tipo==="tessera")return T("Tessera ")+esc(x.tessera)+" ("+T(x.motivo==="danneggiata"?"danneggiata":"smarrita")+") - "+T(x.blocco==="sbloccata"?"tessera sbloccata":x.blocco==="ok"?"bloccata sulla colonnina":x.blocco==="assente"?"tessera non presente sulla colonnina":"blocco in attesa: la colonnina non risponde, riprovo ogni 5 minuti");
  if(t.tipo==="nuova"&&x.pagamento)return T("Pagamento")+": "+({paypal:"PayPal",satispay:"Satispay",revolut:"Revolut",contanti:T("Contanti alla consegna")}[x.pagamento]||esc(x.pagamento));
  if(t.tipo==="dati"){var p=[];if(x.nome)p.push(T("Nome")+": "+esc(x.nome));if(x.cognome)p.push(T("Cognome")+": "+esc(x.cognome));if(x.tel1)p.push(T("Telefono")+": "+esc(x.tel1));if(x.tel2)p.push(T("Secondo telefono")+": "+esc(x.tel2));return p.join(", ")}
  return "";
}
function badgeTicket(){
  return api("/api/ticket").then(function(L){
    if(!Array.isArray(L))return;
    var n=L.filter(function(x){return x.stato==="aperto"}).length;
    $("navTN").textContent=n?String(n):"";
  });
}
function caricaTicket(){
  var adm=io&&io.ruolo==="admin";
  var pt=adm?api("/api/tessere").then(function(L){TESST=Array.isArray(L)?L:[]}):Promise.resolve();
  return pt.then(function(){return api("/api/ticket")}).then(function(L){
    if(!Array.isArray(L))return;
    var h="";
    L.forEach(function(t){
      var ap=t.stato==="aperto";
      h+='<div style="padding:8px 0;border-top:1px solid var(--line)"><b>#'+t.id+" "+T(TIPIT[t.tipo]||t.tipo)+'</b> <small>'+esc(oraTxt(Date.parse(t.creato)))+" - "+statoT(t.stato)+"</small>";
      if(adm)h+="<br><small>"+esc(t.nome_utente?t.nome_utente+" - ":"")+esc(t.utente)+"</small>";
      var ex=extraT(t);if(ex)h+="<br>"+ex;
      if(t.testo)h+="<br>"+esc(t.testo).replace(/\n/g,"<br>");
      (t.integrazioni||[]).forEach(function(g){h+='<div style="margin:4px 0 0 10px;padding-left:8px;border-left:3px solid var(--line)"><small>'+T("Integrazione")+" - "+esc(oraTxt(Date.parse(g.ts)))+"</small><br>"+esc(g.testo).replace(/\n/g,"<br>")+"</div>"});
      if(!adm&&ap)h+='<div class="bar"><input id="ig'+t.id+'" placeholder="'+T("Aggiungi informazioni a questa richiesta")+'" size="34" maxlength="1000"><button class="igb" data-i="'+t.id+'">'+T("Aggiungi")+"</button></div>";
      if(t.nota)h+='<br><small>'+T("Nota dell'Amministratore: ")+esc(t.nota)+"</small>";
      if(adm&&!ap&&t.tipo==="tessera"&&t.extra&&(t.extra.blocco==="ok"||t.extra.blocco==="in attesa"))h+='<div class="bar"><button class="tkb" data-i="'+t.id+'" data-e="sblocca">'+T("Sblocca tessera")+"</button></div>";
      if(adm&&ap){
        h+='<div class="bar"><input id="tn'+t.id+'" placeholder="'+T("Nota per l'utente (facoltativa)")+'" size="30" maxlength="500">';
        if(t.tipo==="tessera"||t.tipo==="nuova")h+='<select id="tx'+t.id+'"><option value="">'+T(t.tipo==="nuova"?"scegli la tessera da assegnare":"nessuna nuova tessera (la vecchia viene solo dismessa)")+'</option>'+TESST.map(function(x){return '<option value="'+esc(x.tag)+'">'+esc(x.tag)+" - "+esc(x.nome)+"</option>"}).join("")+"</select>";
        if(t.tipo==="tessera"||t.tipo==="dati"||t.tipo==="cancellazione"||t.tipo==="nuova")h+='<button class="p tkb" data-i="'+t.id+'" data-e="approva" data-t="'+t.tipo+'" data-u="'+esc(t.utente)+'">'+T(t.tipo==="tessera"?"Sostituisci tessera":t.tipo==="nuova"?"Assegna tessera":"Approva")+"</button>";
        if(t.tipo!=="tessera")h+='<button class="tkb" data-i="'+t.id+'" data-e="rifiuta">'+T("Rifiuta")+"</button>";
        if(t.tipo==="tessera"&&t.extra&&t.extra.blocco!=="sbloccata")h+='<button class="tkb" data-i="'+t.id+'" data-e="ritrovata">'+T("Ritrovata: sblocca e chiudi")+"</button>";
        if(t.tipo==="colonnina"||t.tipo==="altro")h+='<button class="tkb" data-i="'+t.id+'" data-e="chiudi">'+T("Chiudi")+"</button>";
        h+="</div>";
      }
      h+="</div>";
    });
    $("listaT").innerHTML=h||'<p class="sub">'+T("Nessuna richiesta")+"</p>";
    document.querySelectorAll("#listaT .igb").forEach(function(b){b.onclick=function(){
      var i=$("ig"+b.dataset.i);if(!i.value.trim())return;
      post("/api/ticket",{azione:"integra",id:+b.dataset.i,testo:i.value}).then(function(r){
        if(r.errore){alert(T(r.errore));return}
        caricaTicket()})}});
    document.querySelectorAll("#listaT .tkb").forEach(function(b){b.onclick=function(){
      var e=b.dataset.e,t=b.dataset.t;
      if(e==="approva"&&t==="cancellazione"&&!confirm(T("Cancellare definitivamente l'utenza e i dati di ")+b.dataset.u+"?"))return;
      if(e==="approva"&&t==="tessera"&&!confirm(T("Scollegare la tessera dall'utente?")))return;
      var n=$("tx"+b.dataset.i);
      if(e==="approva"&&t==="nuova"&&!(n&&n.value)){alert(T("Scegli la tessera da assegnare"));return}
      var corpo=e==="sblocca"?{azione:"sblocca",id:+b.dataset.i}:{azione:"gestisci",id:+b.dataset.i,esito:e,nota:$("tn"+b.dataset.i).value,nuova:n?n.value:""};
      post("/api/ticket",corpo).then(function(r){
        if(r.errore){alert(T(r.errore));return}
        if(r.applicato)alert(T(r.applicato));
        caricaTicket();badgeTicket()})}});
  });
}
$("bTk").onclick=function(){
  var e=$("tkEsito");e.textContent="";
  var tipo=$("tkTipo").value;
  $("bTk").disabled=true;
  post("/api/ticket",{azione:"apri",tipo:tipo,pagamento:$("tkPagSel").value,testo:$("tkTesto").value,tessera:$("tkTess").value,motivo:$("tkMotivo").value,
    nome:$("tkNome").value,cognome:$("tkCognome").value,tel1:$("tkTel1").value,tel2:$("tkTel2").value}).then(function(r){
    $("bTk").disabled=false;
    if(r.errore){e.textContent=T(r.errore);return}
    e.textContent=T("Richiesta inviata: riceverai l'esito per email");
    ["tkTesto","tkNome","tkCognome","tkTel1","tkTel2"].forEach(function(i){$(i).value=""});
    caricaTicket()});
};
function badgeUtenti(){
  return api("/api/utenti").then(function(L){
    if(!Array.isArray(L))return;
    var n=L.filter(function(x){return x.in_attesa_tessera}).length;      // registered with confirmed email, waiting for the card
    $("navUN").textContent=n?String(n):"";
    return L;
  });
}
function caricaNot(letti){
  return (letti?post("/api/notifiche",{}):api("/api/notifiche")).then(function(d){
    if(!d||d.errore)return;
    $("navN").textContent=d.nonLette?String(d.nonLette):"";
    var h="";d.notifiche.forEach(function(n){h+='<div style="padding:5px 0;border-top:1px solid var(--line)'+(n.letta?";opacity:.65":"")+'"><b>'+esc(T(n.titolo))+'</b> <small>'+esc(oraTxt(n.ts))+'</small><br>'+esc(n.dett)+"</div>"});
    $("listaNot").innerHTML=h||'<p class="sub">'+T("Nessuna notifica")+"</p>";
    $("bNotLette").classList.toggle("hide",!d.nonLette);
  });
}
$("bNotLette").onclick=function(){caricaNot(true)};
setInterval(function(){if(MONADM&&!document.hidden){caricaNot();badgeUtenti()}},30000);
function caricaCf(){
  return api("/api/consumi").then(function(d){
    if(d&&d.messaggi){var K=Object.keys(d.messaggi).sort().reverse(),M2=row([th(T("Mese")),th("Mail",1),th("Telegram",1),th(T("Errori"),1)]);
      K.forEach(function(k){var c=d.messaggi[k];M2+=row([td(esc(k.split("-").reverse().join("-"))),td((c.mail||0).toLocaleString(LOC)+' <small>('+((c.mail||0)/3000*100).toLocaleString(LOC,{maximumFractionDigits:1})+'%)</small>',1),td(String(c.tg||0),1),td(String((c.mail_err||0)+(c.wa_err||0)+(c.tg_err||0)),1)])});
      $("tabMsg").innerHTML=K.length?M2:"";$("msgNota").textContent=(K.length?"":T("Nessun invio contato finora. "))+T("Resend gratuito: 3.000 mail al mese e 100 al giorno (tra parentesi la quota mensile); Telegram non ha limiti di costo.")+(d.coda?" "+T("Messaggi in coda: ")+d.coda:"")}
    if(d&&d.chi){var G=d.chi.giorni||{},gg=Object.keys(G).sort().reverse().slice(0,2),C=row([th(T("Giorno (UTC)")),th(T("Pagina / API")),th(T("Chiamate"),1),th(T("Query D1"),1),th(T("Chiamate in uscita"),1)]);
      gg.forEach(function(g){Object.keys(G[g]).sort(function(a,b){return G[g][b].q-G[g][a].q}).forEach(function(k){var x=G[g][k];C+=row([td(esc(g.split("-").reverse().join("-"))),td(esc(k)),td(x.n.toLocaleString(LOC),1),td(x.q.toLocaleString(LOC),1),td(x.f.toLocaleString(LOC),1)])})});
      var PP=(d.chi.pesanti||[]).slice().reverse();
      $("tabChi").innerHTML=gg.length?C:"";
      $("chiNota").textContent=(gg.length?"":T("Nessun dato finora. "))+T("Conteggio del sito dalla versione 2.8.0: per ogni pagina o API, chiamate, query D1 e chiamate in uscita (mail, messaggi, colonnina), oggi e ieri (UTC). Le query del server OCPP non sono incluse. Per singola richiesta il piano gratuito ammette 50 query D1 e 50 chiamate in uscita.")+(PP.length?" "+T("Richieste pesanti (oltre 35): ")+PP.map(function(p){return oraTxt(p.ts)+" "+p.chiave+" ("+p.q+" query, "+p.f+" "+T("chiamate")+")"}).join("; "):"")}
    if(!d||d.errore&&!d.configurato)return;
    if(!d.configurato){$("tabCf").innerHTML="";$("cfNota").textContent=T("Per vedere i consumi serve un token Cloudflare con il permesso Account Analytics: Read (secret CF_API_TOKEN) e CF_ACCOUNT_ID in wrangler.toml.");return}
    if(d.errore){$("tabCf").innerHTML="";$("cfNota").textContent=d.errore;return}
    function pc(v,l){var p=v/l*100;return v.toLocaleString(LOC)+' <small>('+(p<0.1?"<0,1":p.toLocaleString(LOC,{maximumFractionDigits:1}))+"%)</small>"}
    var L=d.limiti,t=row([th(T("Giorno (UTC)")),th(T("Richieste sito"),1),th(T("Errori"),1),th("CPU 99% ms",1),th(T("D1 righe lette"),1),th(T("D1 righe scritte"),1),th(T("Richieste OCPP"),1),th("OCPP GB-s",1),th(T("OCPP righe lette"),1),th(T("OCPP righe scritte"),1)]);
    t+=row([td("<b>"+T("Limite giornaliero")+"</b>"),td(L.req.toLocaleString(LOC),1),td("-",1),td("-",1),td(L.d1r.toLocaleString(LOC),1),td(L.d1w.toLocaleString(LOC),1),td(L.dor.toLocaleString(LOC),1),td(L.dogbs.toLocaleString(LOC),1),td(L.dorr.toLocaleString(LOC),1),td(L.dorw.toLocaleString(LOC),1)]);
    d.giorni.forEach(function(g){t+=row([td(esc(g.giorno.split("-").reverse().join("-"))),td(pc(g.req,L.req),1),td(String(g.err),1),td(g.cpu99.toLocaleString(LOC,{maximumFractionDigits:1}),1),td(pc(g.d1r,L.d1r),1),td(pc(g.d1w,L.d1w),1),td(pc(g.dor,L.dor),1),td(pc(Math.round(g.dogbs),L.dogbs),1),td(pc(g.dorr,L.dorr),1),td(pc(g.dorw,L.dorw),1)])});
    $("tabCf").innerHTML=t;
    var M=row([th(T("Mese")),th(T("Richieste sito"),1),th(T("D1 righe lette"),1),th(T("D1 righe scritte"),1),th(T("Richieste OCPP"),1),th("OCPP GB-s",1),th(T("OCPP righe lette"),1),th(T("OCPP righe scritte"),1),th(T("Giorno di picco"))]);
    d.mesi.forEach(function(m){var p=m.picco,mm=m.mese.split("-").reverse().join("-");
      M+=row([td(esc(mm)),td(m.req.toLocaleString(LOC),1),td(m.d1r.toLocaleString(LOC),1),td(m.d1w.toLocaleString(LOC),1),td(m.dor.toLocaleString(LOC),1),td(Math.round(m.dogbs).toLocaleString(LOC),1),td(m.dorr.toLocaleString(LOC),1),td(m.dorw.toLocaleString(LOC),1),
        td(p.voce?esc(p.giorno.split("-").reverse().join("-"))+" - "+esc(T(p.voce))+" "+p.pct.toLocaleString(LOC,{maximumFractionDigits:1})+"%":"-")])});
    $("tabCfM").innerHTML=M;
    function by(n){return n>=1e9?(n/1e9).toLocaleString(LOC,{maximumFractionDigits:2})+" GB":n>=1e6?(n/1e6).toLocaleString(LOC,{maximumFractionDigits:1})+" MB":Math.round(n/1e3).toLocaleString(LOC)+" KB"}
    var sp=d.spazio||{};
    $("cfSpazio").innerHTML=T("Spazio occupato (limite 5 GB ciascuno, totale):")+" D1 <b>"+(sp.d1?by(sp.d1)+" ("+(sp.d1/L.spazio*100).toLocaleString(LOC,{maximumFractionDigits:3})+"%)":"-")+"</b>; "+T("server OCPP")+" <b>"+(sp.ocpp?by(sp.ocpp)+" ("+(sp.ocpp/L.spazio*100).toLocaleString(LOC,{maximumFractionDigits:3})+"%)":"-")+"</b>";
    $("cfNota").textContent=T("Tutti i limiti del piano gratuito sono giornalieri e si azzerano alle 00:00 UTC (01:00 ora solare, 02:00 ora legale in Italia); non ce ne sono di mensili. Tra parentesi la quota del limite del giorno. Il giorno corrente è parziale. Il riepilogo mensile somma i giorni e indica il giorno più vicino al limite. Lo spazio (5 GB totali per D1 e per il server OCPP) non è giornaliero: si accumula e conta nell'avviso. Non monitorata la CPU (10 ms per richiesta). Dati aggiornati alle ")+oraTxt(d.ts)+".";
  });
}
function disegnaMal(d){
  if(!d||d.errore)return;
  function statoTxt(r){var st=d.stato[r.id];return !r.on?T("disattivato"):!st?T("regolare"):st.notificato?T("segnalato il ")+oraTxt(st.notificato):T("in corso dal ")+oraTxt(st.da)+(st.esito&&st.esito!=="inviata"?" - "+T("mail non inviata"):"")}
  if(MALDIRTY){d.regole.forEach(function(r){var c=document.querySelector('#tabMal td[data-s="'+r.id+'"]');if(c){var cb=document.querySelector('#tabMal input[data-m="'+r.id+'"]'),cn=document.querySelector('#tabMal input[data-n="'+r.id+'"]');c.textContent=cb&&!cb.checked&&cn&&!cn.checked?T("disattivato"):statoTxt(Object.assign({},r,{on:true}))}})}   // unsaved changes: do not redraw the table
  else{$("mA").value=d.a.join(", ");$("mCc").value=d.cc.join(", ");
    var h=row([th(T("Mail")),th(T("Notifica")),th(T("Controllo")),th(T("Soglia")),th(T("Stato"))]),g="";
    d.regole.forEach(function(r){
      if(r.g!==g){g=r.g;h+='<tr><th colspan="5" style="background:var(--bg)">'+esc(T(g))+"</th></tr>"}
      var t=statoTxt(r);
      var v=r.tipo==="evento"?'<span class="sub">'+T("avviso singolo")+"</span>":'<input type="number" data-v="'+r.id+'" min="'+r.da+'" max="'+r.a+'" value="'+r.valore+'" style="width:5em"> '+esc(T(r.unita));
      h+=row([td('<input type="checkbox" data-m="'+r.id+'"'+(r.mail?" checked":"")+">"),td('<input type="checkbox" data-n="'+r.id+'"'+(r.not?" checked":"")+">"),td(esc(T(r.label))),td(v),'<td data-s="'+r.id+'">'+esc(t)+'</td>'])});
    $("tabMal").innerHTML=h}
  if(d.avvisi&&!AVDIRTY){$("avOn").checked=!!d.avvisi.on;$("avAt").value=d.avvisi.attesa;$("avSo").value=d.avvisi.sollecito}
  var ep=row([th(T("Controllo")),th(T("Dal")),th(T("Al")),th(T("Mail"))]);
  if(!d.storico.length)ep+='<tr><td colspan="4" class="sub">'+T("Nessun episodio registrato")+"</td></tr>";
  d.storico.forEach(function(x){ep+=row([td(esc(T(x.label))),td(oraTxt(x.dal)),td(x.evento?"-":x.al?oraTxt(x.al):T("in corso")),td(x.evento?(x.inviata?T("inviata"):T("non inviata")):"")])});
  $("tabEp").innerHTML=ep;
  $("mUlt").textContent=d.ultimo?T("Ultimo controllo: ")+oraTxt(d.ultimo):T("Il controllo non è ancora partito")}
function leggiMal(){
  var rg={};document.querySelectorAll("#tabMal input[data-m]").forEach(function(c){var id=c.getAttribute("data-m");var vi=document.querySelector('#tabMal input[data-v="'+id+'"]');var cn=document.querySelector('#tabMal input[data-n="'+id+'"]');rg[id]={mail:c.checked,not:!!(cn&&cn.checked),valore:vi?vi.value:0}});
  return {a:$("mA").value,cc:$("mCc").value,regole:rg}}
["tabMal","mA","mCc"].forEach(function(id){var e=$(id);e.addEventListener("input",function(){MALDIRTY=true});e.addEventListener("change",function(){MALDIRTY=true})});
["avOn","avAt","avSo"].forEach(function(id){$(id).addEventListener("input",function(){AVDIRTY=true});$(id).addEventListener("change",function(){AVDIRTY=true})});
$("bAv").onclick=function(){post("/api/malfunzionamenti",{azione:"avvisi",on:$("avOn").checked,attesa:$("avAt").value,sollecito:$("avSo").value}).then(function(r){
  $("avEsito").textContent=r.errore?T(r.errore):T("Salvato");if(!r.errore)AVDIRTY=false})};
$("bMal").onclick=function(){post("/api/malfunzionamenti",leggiMal()).then(function(r){
  $("mEsito").textContent=r.errore?T(r.errore):T("Impostazioni salvate");if(!r.errore){MALDIRTY=false;disegnaMal(r)}})};
$("bMalProva").onclick=function(){post("/api/malfunzionamenti",{azione:"prova"}).then(function(r){$("mEsito").textContent=r.errore?T(r.errore):T("Mail di prova inviata")})};
function caricaDest(){return api("/api/destinatari").then(function(d){if(d&&d.a){$("dA").value=d.a.join(", ");$("dCc").value=d.cc.join(", ")}})}
$("bDest").onclick=function(){
  post("/api/destinatari",{a:$("dA").value,cc:$("dCc").value}).then(function(r){
    $("dEsito").textContent=r.errore?T(r.errore):T("Destinatari salvati");if(r.a){$("dA").value=r.a.join(", ");$("dCc").value=r.cc.join(", ")}});
};
var io=null;
var ETI={report:"report",storico:"storico",sessioni:"sessioni",prezzo:"prezzo",stampa:"stampa",scarica:"scarico",app:"app",live:"ricarica in corso"};
function permForm(){var p={};document.querySelectorAll("#uPerm input").forEach(function(c){p[c.dataset.p]=c.checked});return p}
function setPermForm(p){document.querySelectorAll("#uPerm input").forEach(function(c){c.checked=!!p[c.dataset.p]})}
setPermForm({report:1,storico:1,sessioni:1,stampa:1});
var ATT=null;
function modoUtente(att){
  ATT=att||null;
  $("bUInvita").textContent=T(ATT?"Attiva utenza":"Invia invito");
  $("bUPerm").classList.toggle("hide",!!ATT);
  if(ATT){$("uTipo").value="c";tipoUI()}
}
function tipoUI(){var c=$("uTipo").value==="c";$("uTessBox").classList.toggle("hide",!c);$("uPerm").classList.toggle("hide",c)}
$("uTipo").onchange=tipoUI;
var ANAG=null;   // registered user whose personal details are being edited
function anagMostra(x){
  var an=x&&x.anagrafica;ANAG=an?x.nome:null;
  $("uAnBox").classList.toggle("hide",!an);
  $("bUPerm").textContent=T(an?"Salva permessi e dati":"Salva solo i permessi");
  if(an){$("uAnNome").value=an.nome||"";$("uAnCognome").value=an.cognome||"";$("uAnTel1").value=an.tel1||"";$("uAnTel2").value=an.tel2||""}
}
function anagDati(){
  if(!ANAG||$("uNome").value.trim().toLowerCase()!==ANAG)return null;
  return {nome:$("uAnNome").value,cognome:$("uAnCognome").value,tel1:$("uAnTel1").value,tel2:$("uAnTel2").value};
}
function caricaTessere(){
  return api("/api/tessere").then(function(L){
    if(!Array.isArray(L))return;var cur=$("uTess").value;
    $("uTess").innerHTML='<option value="">'+T("- scegli la tessera -")+'</option>'+L.map(function(x){return '<option value="'+esc(x.tag)+'">'+esc(x.tag)+' - '+esc(x.nome)+'</option>'}).join("");
    $("uTess").value=cur;
    var cur2=Array.prototype.map.call($("uTess2").selectedOptions,function(o){return o.value});
    $("uTess2").innerHTML=L.map(function(x){return '<option value="'+esc(x.tag)+'">'+esc(x.tag)+' - '+esc(x.nome)+'</option>'}).join("");
    Array.prototype.forEach.call($("uTess2").options,function(o){o.selected=cur2.indexOf(o.value)>=0});
  });
}
function invia(email,perm,tess,altre){
  $("uEsito").textContent="";$("uLink").classList.add("hide");
  return post("/api/utenti",{azione:"invita",nome:email,permessi:perm,tessera:tess||"",tessere_altre:altre||[],lang:LANG}).then(function(r){
    if(r.errore){$("uEsito").textContent=T(r.errore);return}
    if(r.mail==="inviata")$("uEsito").textContent=T("Invito inviato a ")+email;
    else{$("uEsito").textContent=T("Mail non inviata (")+T(r.mail)+T("). Copia il link e invialo tu:");$("uLink").value=r.link;$("uLink").classList.remove("hide")}
    $("uNome").value="";caricaUtenti();
  });
}
function caricaUtenti(){
  return api("/api/utenti").then(function(L){
    if(!Array.isArray(L))return;
    var na=L.filter(function(x){return x.in_attesa_tessera}).length;$("navUN").textContent=na?String(na):"";
    caricaTessere();
    api("/api/cifratura").then(function(c){if(!c||c.errore)return;
      $("cifraInfo").textContent=c.attiva?T("Cifratura dei dati personali: attiva")+(c.utenti?" ("+c.cifrati+" "+T("campi cifrati")+(c.chiaro?", "+c.chiaro+" "+T("in chiaro"):"")+")":""):T("Cifratura dei dati personali NON attiva: manca il secret DATA_KEY, i dati dei nuovi utenti restano in chiaro (vedi README)");
      $("cifraInfo").style.color=c.attiva&&!c.chiaro?"":"var(--err)";
      if(!c.turnstile)$("cifraInfo").textContent+=" - "+T("Controllo anti-robot nella registrazione NON attivo: mancano TURNSTILE_SITE_KEY e TURNSTILE_SECRET (vedi README)")});
    var t=row([th(T("Utente")),th(T("Stato")),th(T("Permessi / tessera")),th("")]);
    L.forEach(function(x){
      var adm=x.ruolo==="admin";
      var an=x.anagrafica;
      var st=adm?"admin":T(an&&an.da_confermare?"email da confermare":x.in_attesa_tessera?"in attesa di tessera":(x.attivo?"attivo":(x.invito_scaduto?"invito scaduto":"invito in attesa")));
      var pe=adm?T("tutti"):x.tessera?(x.tessera+" - "+(x.tessera_nome||"")+(x.tessere_altre&&x.tessere_altre.length?" + "+x.tessere_altre.map(function(a){return a.tag+" - "+(a.nome||"")}).join(" + "):"")):Object.keys(x.perm).filter(function(k){return x.perm[k]}).map(function(k){return T(ETI[k])}).join(", ")||T("nessuno");
      var attiva=an&&(x.in_attesa_tessera||an.da_confermare);
      var az=adm?"":'<button class="bm" data-m="'+esc(x.nome)+'">'+T("Modifica")+'</button> '+(attiva?'<button class="ba" data-m="'+esc(x.nome)+'">'+T("Attiva utenza")+'</button> ':'<button class="br" data-m="'+esc(x.nome)+'" title="'+T(x.attivo?"Manda un link per reimpostare la password":"Manda di nuovo il link di invito")+'">'+T(x.attivo?"Reimposta":"Reinvia")+'</button> ')+'<button class="bd" data-d="'+esc(x.nome)+'">'+T("Elimina")+'</button>';
      var ut=esc(x.nome);
      if(an)ut='<b>'+esc((an.nome||"")+" "+(an.cognome||""))+'</b><br>'+ut+'<br><small>'+esc(an.tel1||"")+(an.tel2?" / "+esc(an.tel2):"")+(an.messaggi?" - Telegram: "+T("sì"):"")+'</small>';
      t+=row([td(ut),td(st),td(esc(pe)),'<td class="n">'+az+"</td>"]);
    });
    $("tabU").innerHTML=t;
    var per={};L.forEach(function(x){per[x.nome]=x});
    var S={reg:0,wa:0,tg:0,tgc:0,tg2:0,ent:0,nessuno:0,tel2:0};L.forEach(function(x){var c=x.anagrafica&&x.anagrafica.canali;if(!c)return;S.reg++;if(c.wa)S.wa++;if(c.tg)S.tg++;if(c.tg_chat)S.tgc++;if(c.tg_chat>1)S.tg2++;if(c.wa&&c.tg)S.ent++;if(!c.wa&&!c.tg)S.nessuno++;if(c.wa&&c.tel2)S.tel2++});
    function pct(n){return S.reg?" ("+Math.round(n/S.reg*100)+"%)":""}
    $("tabCanali").innerHTML=row([th(T("Utenti con profilo")),td(String(S.reg),1)])+row([th(T("Consenso Telegram")),td(S.tg+pct(S.tg),1)])+row([th(T("Telegram collegato")),td(S.tgc+pct(S.tgc)+(S.tg2?" - "+S.tg2+" "+T("con due chat"):""),1)])+row([th(T("Nessun consenso (solo mail)")),td(S.nessuno+pct(S.nessuno),1)]);
    document.querySelectorAll("#tabU .bm,#tabU .ba").forEach(function(b){b.onclick=function(){var x=per[b.dataset.m];$("uNome").value=x.nome;setPermForm(x.perm);$("uTipo").value=x.tessera?"c":"g";tipoUI();$("uTess").value=x.tessera||"";var al=(x.tessere_altre||[]).map(function(a){return a.tag});Array.prototype.forEach.call($("uTess2").options,function(o){o.selected=al.indexOf(o.value)>=0});anagMostra(x);modoUtente(b.classList.contains("ba")?x.nome:null);$("uTess").focus();window.scrollTo(0,0)}});
    document.querySelectorAll("#tabU .br").forEach(function(b){b.onclick=function(){
      if(confirm(T("Mandare un nuovo link a ")+b.dataset.m+"?"))invia(b.dataset.m,per[b.dataset.m].perm,per[b.dataset.m].tessera,(per[b.dataset.m].tessere_altre||[]).map(function(a){return a.tag}))}});
    document.querySelectorAll("#tabU .bd").forEach(function(b){b.onclick=function(){
      if(!confirm(T("Eliminare l'utente ")+b.dataset.d+"?"))return;
      post("/api/utenti",{azione:"elimina",nome:b.dataset.d}).then(function(r){$("uEsito").textContent=T(r.errore)||"";caricaUtenti()})}});
  });
}
function datiForm(){
  var c=$("uTipo").value==="c";
  if(c&&!$("uTess").value){$("uEsito").textContent=T("Scegli la tessera da abbinare");return null}
  return {perm:c?{}:permForm(),tess:c?$("uTess").value:"",altre:c?Array.prototype.map.call($("uTess2").selectedOptions,function(o){return o.value}):[],an:anagDati()};
}
$("bUInvita").onclick=function(){
  var d=datiForm();if(!d)return;
  if(!ATT){invia($("uNome").value,d.perm,d.tess,d.altre);return}
  post("/api/utenti",{azione:"permessi",nome:ATT,permessi:{},tessera:d.tess,tessere_altre:d.altre,anagrafica:d.an}).then(function(r){
    if(r.errore){$("uEsito").textContent=T(r.errore);return}
    $("uEsito").textContent=r.mail==="inviata"?T("Utenza attivata: mail inviata a ")+ATT:r.mail?T("Utenza attivata, ma la mail non è partita (")+T(r.mail)+")":T("Tessera abbinata: l'utenza si attiverà quando l'utente conferma l'email");
    modoUtente(null);anagMostra(null);$("uNome").value="";caricaUtenti()});
};
$("uNome").addEventListener("input",function(){if(ATT&&$("uNome").value.trim().toLowerCase()!==ATT)modoUtente(null);if(ANAG&&$("uNome").value.trim().toLowerCase()!==ANAG)anagMostra(null)});
$("bUPerm").onclick=function(){
  var d=datiForm();if(!d)return;
  post("/api/utenti",{azione:"permessi",nome:$("uNome").value,permessi:d.perm,tessera:d.tess,tessere_altre:d.altre,anagrafica:d.an}).then(function(r){
    $("uEsito").textContent=T(r.errore)||T(d.an?"Permessi e dati salvati":"Permessi salvati");caricaUtenti()});
};
function cmDati(){return {oggetto:$("cmOgg").value,it:$("cmIt").value,en:$("cmEn").value,telegram:$("cmTg").checked}}
$("bCmAnteprima").onclick=function(){$("cmEsito").textContent="";post("/api/comunicazione",Object.assign(cmDati(),{azione:"anteprima"})).then(function(r){
  if(r.errore){$("cmEsito").textContent=T(r.errore);$("bCmInvia").classList.add("hide");return}
  $("cmPrev").innerHTML=r.anteprima;$("cmPrev").classList.remove("hide");$("bCmInvia").classList.remove("hide");$("bCmInvia").textContent=T("Invia a ")+r.destinatari+T(" utenti")})};
$("bCmInvia").onclick=function(){if(!confirm(T("Inviare la comunicazione a tutti gli utenti? Non si può annullare.")))return;$("bCmInvia").disabled=true;
  post("/api/comunicazione",Object.assign(cmDati(),{azione:"invia"})).then(function(r){$("bCmInvia").disabled=false;if(r.errore){$("cmEsito").textContent=T(r.errore);return}
    $("cmEsito").textContent=T("Inviate ")+r.inviate+(r.errori?", "+r.errori+T(" non riuscite"):"")+(r.saltate?", "+r.saltate+T(" non inviate per il limite"):"")+(r.messaggi?", "+r.messaggi+T(" messaggi in partenza entro 5 minuti"):"");$("bCmInvia").classList.add("hide")})};
$("bBackup").onclick=function(){
  var p=$("bkP").value,e=$("bkEsito");e.textContent="";
  if(p.length<12){e.textContent=T("La passphrase deve avere almeno 12 caratteri");return}
  if(p!==$("bkP2").value){e.textContent=T("Le due passphrase non coincidono");return}
  var enc=new TextEncoder(),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  e.textContent="...";
  fetch("/api/backup").then(function(r){if(!r.ok)throw new Error("http");return r.arrayBuffer()}).then(function(buf){
    return crypto.subtle.importKey("raw",enc.encode(p),"PBKDF2",false,["deriveKey"]).then(function(km){
      return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:600000,hash:"SHA-256"},km,{name:"AES-GCM",length:256},false,["encrypt"])})
    .then(function(k){return crypto.subtle.encrypt({name:"AES-GCM",iv:iv},k,buf)})
  }).then(function(ct){
    var magic=enc.encode("RBK1"),out=new Uint8Array(4+16+12+ct.byteLength);
    out.set(magic,0);out.set(salt,4);out.set(iv,20);out.set(new Uint8Array(ct),32);
    var a=document.createElement("a"),d=new Date().toISOString().slice(0,10);
    a.href=URL.createObjectURL(new Blob([out],{type:"application/octet-stream"}));a.download="ricariche_"+d+".sql.enc";
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},5000);
    $("bkP").value="";$("bkP2").value="";e.textContent=T("Backup cifrato scaricato");
  }).catch(function(){e.textContent=T("Backup non riuscito")});
};
$("bEsci").onclick=function(){post("/api/logout",{}).then(function(){location.reload()})};
$("bPw").onclick=function(){$("boxPw").classList.toggle("hide")};
$("bPwOk").onclick=function(){
  if($("pwNew").value!==$("pwNew2").value){$("pwEsito").textContent=T("Le due nuove password non coincidono");return}
  post("/api/miapassword",{vecchia:$("pwOld").value,nuova:$("pwNew").value,ripeti:$("pwNew2").value}).then(function(r){
    $("pwEsito").textContent=T(r.errore)||T("Password cambiata");if(r.ok){$("pwOld").value="";$("pwNew").value="";$("pwNew2").value=""}});
};
// ---------- phone (up to 700 px): bottom tab bar with icons; extra tabs go into the "More" menu
var ICO={t1:'<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
t3:'<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
t2:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
t4:'<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M17 4a4 4 0 0 1 0 8"/><path d="M22 21c0-3-1.5-5-4-5.6"/>',
t13:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
t9:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
t5:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
t10:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
t6:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/>',
t8:'<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-12 0V8z"/>',
t11:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
t12:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
altro:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
var CORTO={t1:"Report",t3:"Sessioni",t2:"Storico",t4:"Utenti/Card",t13:"Prepagate",t9:"Stato",t5:"Ricariche",t10:"Profilo",t6:"Impostazioni",t8:"OCPP",t12:"Info"};
var PRI=["t9","t5","t1","t4","t11","t13","t10","t3","t2","t6","t8","t12"];
function svgIco(k){return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO[k]+"</svg>"}
function testoTab(b){var n=b.firstChild;return n&&n.nodeType===3?n.nodeValue.trim():""}
function navMob(){
  var nav=document.querySelector("nav");if(!nav)return;
  var bs=[].slice.call(nav.querySelectorAll("button[data-t]"));
  bs.forEach(function(b){
    if(!b.querySelector(".ico")){var i=document.createElement("span");i.className="ico";i.innerHTML=svgIco(b.dataset.t);b.appendChild(i);var l=document.createElement("span");l.className="lbM";b.appendChild(l)}
    var c=b.dataset.t==="t11"?(io&&io.ruolo==="admin"?"Ticket":"Assistenza"):CORTO[b.dataset.t],lb=b.querySelector(".lbM");
    if(lb.textContent!==T(c))lb.textContent=T(c);
    if(b.getAttribute("aria-label")!==testoTab(b))b.setAttribute("aria-label",testoTab(b));
  });
  var vis=bs.filter(function(b){return !b.classList.contains("hide")});
  var prim=vis.length<=5?vis:PRI.map(function(t){return vis.filter(function(b){return b.dataset.t===t})[0]}).filter(Boolean).slice(0,4);
  bs.forEach(function(b){b.classList.toggle("fuori",prim.indexOf(b)<0)});
  var al=$("navAltro");
  if(!al){al=document.createElement("button");al.type="button";al.id="navAltro";al.innerHTML='<span class="ico">'+svgIco("altro")+'</span><span class="lbM">'+(LANG==="en"?"More":"Altro")+"</span>";nav.appendChild(al);
    var sh=document.createElement("div");sh.id="altroM";sh.setAttribute("role","menu");document.body.appendChild(sh);
    al.onclick=function(e){e.stopPropagation();var aperto=!sh.classList.contains("aperto");
      if(aperto){sh.innerHTML="";[].slice.call(nav.querySelectorAll("button[data-t].fuori:not(.hide)")).forEach(function(b){
        var x=document.createElement("button");x.type="button";x.setAttribute("role","menuitem");x.className=b.classList.contains("on")?"on":"";x.innerHTML=svgIco(b.dataset.t);x.appendChild(document.createTextNode(testoTab(b)));
        x.onclick=function(){sh.classList.remove("aperto");b.click()};sh.appendChild(x)})}
      sh.classList.toggle("aperto",aperto)};
    document.addEventListener("click",function(){sh.classList.remove("aperto")});
  }
  al.style.display=vis.length>5?"":"none";
  var attiva=document.querySelector("nav button.on[data-t]");
  al.classList.toggle("on",!!(attiva&&attiva.classList.contains("fuori")));
  var tit=attiva?testoTab(attiva):"";if($("titoloM").textContent!==tit)$("titoloM").textContent=tit;
}
(function(){var tm=0,nav=document.querySelector("nav");if(!nav)return;
  new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(navMob,20)}).observe(nav,{attributes:true,attributeFilter:["class"],characterData:true,subtree:true});
  navMob()})();
api("/api/me").then(function(m){
  io=m;var P=m.perm;
  if(m.completa){location.href="/?completa=1";return}
  applicaConfig(m);
  if(m.registrato){$("navP").classList.remove("hide");$("navT").classList.remove("hide")}
  if(m.tessere&&m.tessere.length)$("tkTess").innerHTML=m.tessere.map(function(t){return '<option value="'+esc(t.tag)+'">'+esc(t.tag)+(t.nome?" - "+esc(t.nome):"")+'</option>'}).join("");
  if(m.senzaTessera){
    document.querySelectorAll("nav button").forEach(function(b){b.classList.add("hide")});
    $("navP").classList.remove("hide");$("navT").classList.remove("hide");$("bScarica").classList.add("hide");$("bImporta").classList.add("hide");$("stato").classList.add("hide");
    $("cSenzaT").classList.remove("hide");var po=$("tkTipo").querySelector('option[value="tessera"]');if(po)po.remove();$("tkTipo").value="nuova";tipoT();
  }
  $("chi").innerHTML=esc(m.nome)+(m.ruolo==="admin"&&m.nome!=="admin"?' <span class="pill">admin</span>':"");
  if(m.senzaTessera){$("chi").innerHTML=esc(m.nome);$("navT").click();return}
  if(m.tessera){
    document.querySelectorAll("nav button").forEach(function(b){b.classList.add("hide")});
    $("navM").classList.remove("hide");$("navL").classList.remove("hide");if(m.registrato){$("navP").classList.remove("hide");$("navT").classList.remove("hide")}$("bScarica").classList.add("hide");$("bImporta").classList.add("hide");$("stato").classList.add("hide");
    $("mieTit").textContent=T("Le mie ricariche")+((m.tessere&&m.tessere.length>1)?" - "+m.tessere.map(function(t){return (t.nome?t.nome+" ":"")+"("+t.tag+")"}).join(", "):(m.tessera.nome?" - "+m.tessera.nome+" ("+m.tessera.tag+")":""));
    $("navM").click();return;
  }
  if(m.ruolo==="admin"){MONADM=true;caricaNot();badgeUtenti();badgeTicket();$("navT").classList.remove("hide");$("navT").firstChild.nodeValue=T("Ticket");$("navI").classList.remove("hide");$("navPre").classList.remove("hide");$("cTkNuovo").classList.add("hide");$("cPag").classList.remove("hide");api("/api/pagamento").then(function(d){if(d){$("pagPp").value=d.paypal||"";$("pagSa").value=d.satispay||"";$("pagRe").value=d.revolut||""}});$("tkTit").textContent=T("Richieste degli utenti");document.querySelectorAll(".solo-adm").forEach(function(e){e.classList.remove("hide")});$("navUt").classList.remove("hide");$("navSet").classList.remove("hide");$("navOc").classList.remove("hide")}
  function nasc(id,ok){var e=$(id);if(e)e.classList.toggle("hide",!ok)}
  nasc("bScarica",P.scarica);nasc("bImporta",P.scarica);
  document.querySelectorAll("#prezzo,#iva,#bPrezzo").forEach(function(e){(e.tagName==="BUTTON"?e:e.parentNode).classList.toggle("hide",!P.prezzo)});
  nasc("bStampa",P.stampa);nasc("bCsv",P.stampa);nasc("bCsvAnno",P.stampa);
  document.querySelector('nav button[data-t="t1"]').classList.toggle("hide",!P.report);
  document.querySelector('nav button[data-t="t2"]').classList.toggle("hide",!P.storico);
  document.querySelector('nav button[data-t="t3"]').classList.toggle("hide",!P.sessioni);
  if(!P.report){var primo=document.querySelector("nav button:not(.hide)");if(primo)primo.click()}
  caricaStato();if(P.report)caricaReport();
});
</script>
</body>
</html>`;

export const LOGIN = String.raw`<!doctype html>
<html lang="it">
<head>
<script>try{var _t=localStorage.getItem("tema");if(_t)document.documentElement.setAttribute("data-t",_t)}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:15px/1.45 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);display:flex;min-height:100vh;justify-content:center;padding:20px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:22px;width:min(460px,94vw);align-self:flex-start;margin:auto 0}
h1{font-size:18px;margin:0 0 4px}
.sub{color:var(--mut);font-size:13px;margin-bottom:12px}
.tabs{display:flex;gap:6px;margin:10px 0 14px}
.tabs button{flex:1;background:var(--bg);color:var(--tx);border:1px solid var(--line)}
form{display:flex;flex-direction:column;gap:10px}
label{font-size:13px;color:var(--mut);display:flex;flex-direction:column;gap:3px}
input,select,button{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx);min-width:0}
.riga{display:flex;gap:8px}
.riga>label{flex:1;min-width:0}
label input,label select{width:100%}
.tel select{width:44%}.tel input{width:auto}.chk input{width:auto}
.tel{display:flex;gap:6px}
.tel select{width:44%;flex:none}.tel input{flex:1}
.err{color:var(--err);min-height:1.2em;font-size:13px}
.okm{color:var(--ok);font-size:14px}
.rg{font-size:12px;color:var(--mut);margin:-4px 0 0;display:flex;flex-wrap:wrap;gap:2px 12px}
.rg span.s{color:var(--ok)}
.chk{flex-direction:row;gap:8px;align-items:flex-start;font-size:13px;color:var(--tx)}
.chk input{margin-top:3px;flex:none}
details{border:1px solid var(--line);border-radius:6px;padding:6px 10px;font-size:13px}
details summary{cursor:pointer;color:var(--acc)}
details .t{max-height:220px;overflow:auto;margin-top:6px}
details h4{margin:10px 0 3px;font-size:13px}details p,details li{margin:3px 0}
.hide{display:none!important}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.piede{margin:24px auto 12px;text-align:center;font-size:12px;color:var(--mut)}.piede a{color:var(--acc)}.noprint-f{}</style>
</head>
<body>
<div class="card">
  <button type="button" id="bLang" style="float:right;background:none;border:0;color:var(--acc);padding:0;cursor:pointer"></button><button type="button" id="bTema" style="float:right;margin-right:12px;background:none;border:0;color:var(--acc);padding:0;cursor:pointer"></button>
  <h1>__TITLE__ <span class="ver">__VERSION__</span></h1>
  <div class="sub">Accedi o registrati per consultare le tue ricariche</div>
  <div class="tabs"><button type="button" id="tA" class="on">Accedi</button><button type="button" id="tR">Registrati</button></div>

  <form id="f">
    <input id="n" placeholder="Email" autocomplete="username" autocapitalize="none" required>
    <input id="p" type="password" placeholder="Password" autocomplete="current-password" required>
    <button type="submit" class="p">Accedi</button>
    <div class="err" id="e"></div>
  </form>

  <form id="g" class="hide" autocomplete="on" novalidate>
    <div class="riga">
      <label>Nome<input id="rN" autocomplete="given-name" required></label>
      <label>Cognome<input id="rC" autocomplete="family-name" required></label>
    </div>
    <label>Indirizzo email<input id="rE" type="email" autocomplete="email" autocapitalize="none" required></label>
    <label>Password<input id="rP" type="password" autocomplete="new-password" required></label>
    <div class="rg" id="rg"><span data-k="l">12+ caratteri</span><span data-k="a">minuscola</span><span data-k="A">maiuscola</span><span data-k="d">numero</span><span data-k="s">carattere speciale</span></div>
    <label>Ripeti la password<input id="rP2" type="password" autocomplete="new-password" required></label>
    <label>Numero di telefono (obbligatorio)
      <div class="tel"><select id="pf1"></select><input id="t1" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="333 1234567" required></div>
    </label>
    <label>Secondo numero di telefono (facoltativo)
      <div class="tel"><select id="pf2"></select><input id="t2" type="tel" inputmode="tel" placeholder="333 1234567"></div>
    </label>
    <div class="hp" aria-hidden="true"><label>Sito web<input id="hp" tabindex="-1" autocomplete="off"></label></div>

    <details><summary>Leggi il regolamento della colonnina</summary><div class="t" id="regTxt"></div></details>
    <label class="chk"><input type="checkbox" id="cR"><span>Ho letto e accetto il regolamento per l'uso della colonnina di ricarica.</span></label>

    <details><summary>Leggi l'informativa sulla privacy<span id="edTxt"></span></summary><div class="t" id="prTxt"></div></details>
    <label class="chk"><input type="checkbox" id="cP"><span>Ho letto l'informativa sulla privacy: i miei dati saranno utilizzati solo ed esclusivamente per erogare il servizio, senza cessione a terzi e senza pubblicità.</span></label>

    <label class="chk"><input type="checkbox" id="cM"><span>Facoltativo: acconsento a ricevere messaggi di servizio su Telegram. Posso cambiare o revocare il consenso in qualsiasi momento dalla pagina «Il mio profilo», dopo l'accesso.</span></label>

    __TURNSTILE__
    <button type="submit" class="p" id="bR">Registrati</button>
    <div class="err" id="re"></div>
    <div class="okm hide" id="ro"></div>
  </form>
<footer class="piede">Orbis Viaris Charge Report · software libero, <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">licenza AGPL-3.0</a> · <a href="https://github.com/alexxandro87/orbis-viaris-charge-report" target="_blank" rel="noopener">codice sorgente</a></footer>
</div>
<script>
var PREFISSI=[["Afghanistan","Afghanistan",93],["Albania","Albania",355],["Algeria","Algeria",213],["Andorra","Andorra",376],["Angola","Angola",244],["Anguilla","Anguilla",1],["Antigua e Barbuda","Antigua & Barbuda",1],["Arabia Saudita","Saudi Arabia",966],["Argentina","Argentina",54],["Armenia","Armenia",374],["Aruba","Aruba",297],["Australia","Australia",61],["Austria","Austria",43],["Azerbaigian","Azerbaijan",994],["Bahamas","Bahamas",1],["Bahrein","Bahrain",973],["Bangladesh","Bangladesh",880],["Barbados","Barbados",1],["Belgio","Belgium",32],["Belize","Belize",501],["Benin","Benin",229],["Bermuda","Bermuda",1],["Bhutan","Bhutan",975],["Bielorussia","Belarus",375],["Bolivia","Bolivia",591],["Bosnia ed Erzegovina","Bosnia & Herzegovina",387],["Botswana","Botswana",267],["Brasile","Brazil",55],["Brunei","Brunei",673],["Bulgaria","Bulgaria",359],["Burkina Faso","Burkina Faso",226],["Burundi","Burundi",257],["Cambogia","Cambodia",855],["Camerun","Cameroon",237],["Canada","Canada",1],["Capo Verde","Cape Verde",238],["Caraibi Olandesi","Caribbean Netherlands",599],["Cechia","Czechia",420],["Ciad","Chad",235],["Cile","Chile",56],["Cina","China",86],["Cipro","Cyprus",357],["Città del Vaticano","Vatican City",39],["Colombia","Colombia",57],["Comore","Comoros",269],["Congo - Kinshasa","Congo - Kinshasa",243],["Congo-Brazzaville","Congo - Brazzaville",242],["Corea del Nord","North Korea",850],["Corea del Sud","South Korea",82],["Costa d’Avorio","Côte d’Ivoire",225],["Costa Rica","Costa Rica",506],["Croazia","Croatia",385],["Cuba","Cuba",53],["Curaçao","Curaçao",599],["Danimarca","Denmark",45],["Dominica","Dominica",1],["Ecuador","Ecuador",593],["Egitto","Egypt",20],["El Salvador","El Salvador",503],["Emirati Arabi Uniti","United Arab Emirates",971],["Eritrea","Eritrea",291],["Estonia","Estonia",372],["Eswatini","Eswatini",268],["Etiopia","Ethiopia",251],["Figi","Fiji",679],["Filippine","Philippines",63],["Finlandia","Finland",358],["Francia","France",33],["Gabon","Gabon",241],["Gambia","Gambia",220],["Georgia","Georgia",995],["Germania","Germany",49],["Ghana","Ghana",233],["Giamaica","Jamaica",1],["Giappone","Japan",81],["Gibilterra","Gibraltar",350],["Gibuti","Djibouti",253],["Giordania","Jordan",962],["Grecia","Greece",30],["Grenada","Grenada",1],["Groenlandia","Greenland",299],["Guadalupa","Guadeloupe",590],["Guam","Guam",1],["Guatemala","Guatemala",502],["Guernsey","Guernsey",44],["Guinea","Guinea",224],["Guinea Equatoriale","Equatorial Guinea",240],["Guinea-Bissau","Guinea-Bissau",245],["Guyana","Guyana",592],["Guyana Francese","French Guiana",594],["Haiti","Haiti",509],["Honduras","Honduras",504],["India","India",91],["Indonesia","Indonesia",62],["Iran","Iran",98],["Iraq","Iraq",964],["Irlanda","Ireland",353],["Islanda","Iceland",354],["Isola Ascensione","Ascension Island",247],["Isola Christmas","Christmas Island",61],["Isola di Man","Isle of Man",44],["Isola Norfolk","Norfolk Island",672],["Isole Cayman","Cayman Islands",1],["Isole Cocos (Keeling)","Cocos (Keeling) Islands",61],["Isole Cook","Cook Islands",682],["Isole Falkland","Falkland Islands",500],["Isole Fær Øer","Faroe Islands",298],["Isole Marianne Settentrionali","Northern Mariana Islands",1],["Isole Marshall","Marshall Islands",692],["Isole Salomone","Solomon Islands",677],["Isole Turks e Caicos","Turks & Caicos Islands",1],["Isole Vergini Americane","U.S. Virgin Islands",1],["Isole Vergini Britanniche","British Virgin Islands",1],["Isole Åland","Åland Islands",358],["Israele","Israel",972],["Italia","Italy",39],["Jersey","Jersey",44],["Kazakistan","Kazakhstan",7],["Kenya","Kenya",254],["Kirghizistan","Kyrgyzstan",996],["Kiribati","Kiribati",686],["Kosovo","Kosovo",383],["Kuwait","Kuwait",965],["Laos","Laos",856],["Lesotho","Lesotho",266],["Lettonia","Latvia",371],["Libano","Lebanon",961],["Liberia","Liberia",231],["Libia","Libya",218],["Liechtenstein","Liechtenstein",423],["Lituania","Lithuania",370],["Lussemburgo","Luxembourg",352],["Macedonia del Nord","North Macedonia",389],["Madagascar","Madagascar",261],["Malawi","Malawi",265],["Malaysia","Malaysia",60],["Maldive","Maldives",960],["Mali","Mali",223],["Malta","Malta",356],["Marocco","Morocco",212],["Martinica","Martinique",596],["Mauritania","Mauritania",222],["Mauritius","Mauritius",230],["Mayotte","Mayotte",262],["Messico","Mexico",52],["Micronesia","Micronesia",691],["Moldavia","Moldova",373],["Monaco","Monaco",377],["Mongolia","Mongolia",976],["Montenegro","Montenegro",382],["Montserrat","Montserrat",1],["Mozambico","Mozambique",258],["Myanmar (Birmania)","Myanmar (Burma)",95],["Namibia","Namibia",264],["Nauru","Nauru",674],["Nepal","Nepal",977],["Nicaragua","Nicaragua",505],["Niger","Niger",227],["Nigeria","Nigeria",234],["Niue","Niue",683],["Norvegia","Norway",47],["Nuova Caledonia","New Caledonia",687],["Nuova Zelanda","New Zealand",64],["Oman","Oman",968],["Paesi Bassi","Netherlands",31],["Pakistan","Pakistan",92],["Palau","Palau",680],["Panama","Panama",507],["Papua Nuova Guinea","Papua New Guinea",675],["Paraguay","Paraguay",595],["Perù","Peru",51],["Polinesia Francese","French Polynesia",689],["Polonia","Poland",48],["Portogallo","Portugal",351],["Portorico","Puerto Rico",1],["Qatar","Qatar",974],["RAS di Hong Kong","Hong Kong SAR China",852],["RAS di Macao","Macao SAR China",853],["Regno Unito","United Kingdom",44],["Repubblica Centrafricana","Central African Republic",236],["Repubblica Dominicana","Dominican Republic",1],["Riunione","Réunion",262],["Romania","Romania",40],["Ruanda","Rwanda",250],["Russia","Russia",7],["Sahara Occidentale","Western Sahara",212],["Saint Kitts e Nevis","St. Kitts & Nevis",1],["Saint Lucia","St. Lucia",1],["Saint Martin","St. Martin",590],["Saint Vincent e Grenadine","St. Vincent & Grenadines",1],["Saint-Barthélemy","St. Barthélemy",590],["Saint-Pierre e Miquelon","St. Pierre & Miquelon",508],["Samoa","Samoa",685],["Samoa Americane","American Samoa",1],["San Marino","San Marino",378],["Sant’Elena","St. Helena",290],["Senegal","Senegal",221],["Serbia","Serbia",381],["Seychelles","Seychelles",248],["Sierra Leone","Sierra Leone",232],["Singapore","Singapore",65],["Sint Maarten","Sint Maarten",1],["Siria","Syria",963],["Slovacchia","Slovakia",421],["Slovenia","Slovenia",386],["Somalia","Somalia",252],["Spagna","Spain",34],["Sri Lanka","Sri Lanka",94],["Stati Uniti","United States",1],["Sud Sudan","South Sudan",211],["Sudafrica","South Africa",27],["Sudan","Sudan",249],["Suriname","Suriname",597],["Svalbard e Jan Mayen","Svalbard & Jan Mayen",47],["Svezia","Sweden",46],["Svizzera","Switzerland",41],["São Tomé e Príncipe","São Tomé & Príncipe",239],["Tagikistan","Tajikistan",992],["Taiwan","Taiwan",886],["Tanzania","Tanzania",255],["Territori Palestinesi","Palestinian Territories",970],["Territorio Britannico dell’Oceano Indiano","British Indian Ocean Territory",246],["Thailandia","Thailand",66],["Timor Est","Timor-Leste",670],["Togo","Togo",228],["Tokelau","Tokelau",690],["Tonga","Tonga",676],["Trinidad e Tobago","Trinidad & Tobago",1],["Tristan da Cunha","Tristan da Cunha",290],["Tunisia","Tunisia",216],["Turchia","Türkiye",90],["Turkmenistan","Turkmenistan",993],["Tuvalu","Tuvalu",688],["Ucraina","Ukraine",380],["Uganda","Uganda",256],["Ungheria","Hungary",36],["Uruguay","Uruguay",598],["Uzbekistan","Uzbekistan",998],["Vanuatu","Vanuatu",678],["Venezuela","Venezuela",58],["Vietnam","Vietnam",84],["Wallis e Futuna","Wallis & Futuna",681],["Yemen","Yemen",967],["Zambia","Zambia",260],["Zimbabwe","Zimbabwe",263]];
var LANG="it";try{LANG=localStorage.getItem("lang")||(((navigator.language||"it").slice(0,2)==="it")?"it":"en")}catch(e){}
var EN={"Orbis Viaris Charge Report · software libero,":"Orbis Viaris Charge Report · free software,","licenza AGPL-3.0":"AGPL-3.0 licence","codice sorgente":"source code","Sito web":"Website",
"Accedi o registrati per consultare le tue ricariche":"Sign in or register to view your charges",
"Accedi":"Sign in","Registrati":"Register","Email":"Email","Password":"Password","Nome":"First name","Cognome":"Last name",
"Indirizzo email":"Email address","Ripeti la password":"Repeat the password",
"12+ caratteri":"12+ characters","minuscola":"lowercase","maiuscola":"uppercase","numero":"digit","carattere speciale":"special character",
"Numero di telefono (obbligatorio)":"Phone number (required)","Secondo numero di telefono (facoltativo)":"Second phone number (optional)",
"Leggi il regolamento della colonnina":"Read the charger rules",
"Leggi l'informativa sulla privacy":"Read the privacy notice"," (edizione ":" (edition ","(testo non ancora pubblicato dal gestore del sito)":"(text not yet published by the site operator)","costo":"cost","una tantum":"one-off",
"Ho letto e accetto il regolamento per l'uso della colonnina di ricarica.":"I have read and accept the rules for using the charging station.",
"Ho letto l'informativa sulla privacy: i miei dati saranno utilizzati solo ed esclusivamente per erogare il servizio, senza cessione a terzi e senza pubblicità.":"I have read the privacy notice: my data will be used only and exclusively to provide the service, with no disclosure to third parties and no advertising.",
"Facoltativo: acconsento a ricevere messaggi di servizio su Telegram. Posso cambiare o revocare il consenso in qualsiasi momento dalla pagina «Il mio profilo», dopo l'accesso.":"Optional: I agree to receive service messages on Telegram. I can change or withdraw consent at any time from the “My profile” page, after signing in.",
"Inserisci nome e cognome":"Enter first and last name","Indirizzo email non valido":"Invalid email address",
"La password non rispetta i requisiti":"The password does not meet the requirements","Le due password non coincidono":"The two passwords do not match",
"Numero di telefono non valido":"Invalid phone number","Secondo numero di telefono non valido":"Invalid second phone number",
"Devi accettare il regolamento":"You must accept the rules","Devi confermare di aver letto l'informativa privacy":"You must confirm you have read the privacy notice",
"Errore di rete":"Network error","Errore":"Error",
"Troppi tentativi: riprova tra 10 minuti":"Too many attempts: try again in 10 minutes",
"Nome o password errati":"Wrong user name or password",
"Account in attesa di attivazione: sarà attivo quando l'Amministratore avrà abbinato la tua tessera":"Account awaiting activation: it will be active once the Administrator has linked your card",
"Devi prima confermare l'indirizzo email: controlla la tua posta":"You must confirm your email address first: check your inbox",
"Registrazione ricevuta. Ti abbiamo mandato una email di conferma: apri il link per confermare l'indirizzo, poi potrai accedere. Se hai già la tessera, l'Amministratore la abbinerà al tuo account e riceverai la mail di Attivazione del servizio; se non ce l'hai, dopo l'accesso potrai richiederla dalla pagina Assistenza.":"Registration received. We sent you a confirmation email: open the link to confirm your address, then you can sign in. If you already have a card, the Administrator will link it to your account and you will receive the Service activation email; if you do not, after signing in you can request one from the Support page.",
"Troppe registrazioni da questo indirizzo: riprova tra 10 minuti":"Too many registrations from this address: try again in 10 minutes",
"Non sono riuscito a inviare la mail di conferma: riprova più tardi":"Could not send the confirmation email: try again later"
};
function T(s){return(LANG==="en"&&EN.hasOwnProperty(s))?EN[s]:s}
function $(i){return document.getElementById(i)}
function trDom(){
  if(LANG!=="en")return;
  document.documentElement.lang="en";
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];
  while(n=w.nextNode())L.push(n);
  L.forEach(function(x){var v=x.nodeValue,k=v.trim();if(k&&EN.hasOwnProperty(k))x.nodeValue=v.replace(k,EN[k])});
  document.querySelectorAll("[placeholder]").forEach(function(e){e.placeholder=T(e.placeholder)});
}
function cambiaLingua(){try{localStorage.setItem("lang",LANG==="en"?"it":"en")}catch(e){}location.reload()}
// prefixes: Italy (+39) by default
function riempi(sel){
  var h="";PREFISSI.forEach(function(p,i){h+='<option value="'+p[2]+'"'+(p[2]===39&&p[0]==="Italia"?" selected":"")+'>'+(LANG==="en"?p[1]:p[0])+" (+"+p[2]+")</option>"});
  sel.innerHTML=h;
}
riempi($("pf1"));riempi($("pf2"));
trDom();
fetch("/api/testi").then(function(r){return r.json()}).then(function(t){
  var en=LANG==="en",reg=en?(t.reg_en||t.reg_it):(t.reg_it||t.reg_en),pr=en?(t.priv_en||t.priv_it):(t.priv_it||t.priv_en),no='<p class="sub">'+T("(testo non ancora pubblicato dal gestore del sito)")+"</p>";
  document.getElementById("regTxt").innerHTML=reg||no;document.getElementById("prTxt").innerHTML=pr||no;
  if(t.edizione)document.getElementById("edTxt").textContent=T(" (edizione ")+t.edizione+")";
  var f=document.getElementById("feeReg");if(f)f.textContent=t.costo?" ("+T("costo")+" "+t.costo+" "+T("una tantum")+")":"";
}).catch(function(){});$("bLang").textContent=(LANG==="en")?"Italiano":"English";$("bLang").onclick=cambiaLingua;(function(){var b=$("bTema");function cur(){return document.documentElement.getAttribute("data-t")||"auto"}function lab(){var m=LANG==="en"?{auto:"◐ Auto",light:"☀ Light",dark:"☾ Dark"}:{auto:"◐ Auto",light:"☀ Giorno",dark:"☾ Notte"};b.textContent=m[cur()]}lab();b.onclick=function(){var n={auto:"light",light:"dark",dark:"auto"}[cur()];if(n==="auto")document.documentElement.removeAttribute("data-t");else document.documentElement.setAttribute("data-t",n);try{if(n==="auto")localStorage.removeItem("tema");else localStorage.setItem("tema",n)}catch(e){}lab()}})();
function mostra(reg){
  $("f").className=reg?"hide":"";$("g").className=reg?"":"hide";
  $("tA").className=reg?"":"on";$("tR").className=reg?"on":"";
}
$("tA").onclick=function(){mostra(false)};$("tR").onclick=function(){mostra(true)};
if(location.hash==="#registrati")mostra(true);

$("f").onsubmit=function(ev){
  ev.preventDefault();
  fetch("/api/login",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({nome:$("n").value,password:$("p").value})})
  .then(function(r){return r.json()}).then(function(r){
    if(r.ok)location.reload();else $("e").textContent=T(r.errore||"Errore")})
  .catch(function(){$("e").textContent=T("Errore di rete")});
};

// password requirements (same checks as the server)
function reqPw(p){return{l:p.length>=12,a:/[a-z]/.test(p),A:/[A-Z]/.test(p),d:/[0-9]/.test(p),s:/[^A-Za-z0-9\s]/.test(p)}}
function pwOk(p){var r=reqPw(p);return r.l&&r.a&&r.A&&r.d&&r.s}
$("rP").oninput=function(){
  var r=reqPw($("rP").value);
  document.querySelectorAll("#rg span").forEach(function(s){s.className=r[s.dataset.k]?"s":""});
};
function nazionale(t){return t.value.replace(/[\s.\-()\/]/g,"")}
function telOk(pf,n){return /^[0-9]{6,12}$/.test(n)&&/^\+[1-9][0-9]{7,14}$/.test("+"+pf.value+n)}
$("g").onsubmit=function(ev){
  ev.preventDefault();
  var er=$("re");er.textContent="";$("ro").className="okm hide";
  var nome=$("rN").value.trim(),cog=$("rC").value.trim(),em=$("rE").value.trim().toLowerCase();
  if(!nome||!cog){er.textContent=T("Inserisci nome e cognome");return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){er.textContent=T("Indirizzo email non valido");return}
  if(!pwOk($("rP").value)){er.textContent=T("La password non rispetta i requisiti");return}
  if($("rP").value!==$("rP2").value){er.textContent=T("Le due password non coincidono");return}
  var n1=nazionale($("t1")),n2=nazionale($("t2")),t1,t2="";
  if(!telOk($("pf1"),n1)){er.textContent=T("Numero di telefono non valido");return}
  t1="+"+$("pf1").value+n1;
  if(n2){if(!telOk($("pf2"),n2)){er.textContent=T("Secondo numero di telefono non valido");return}t2="+"+$("pf2").value+n2}
  if(!$("cR").checked){er.textContent=T("Devi accettare il regolamento");return}
  if(!$("cP").checked){er.textContent=T("Devi confermare di aver letto l'informativa privacy");return}
  $("bR").disabled=true;
  fetch("/api/registrazione",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({nome:nome,cognome:cog,email:em,password:$("rP").value,tel1:t1,tel2:t2,
      reg:true,priv:true,msg:$("cM").checked,lang:LANG,hp:$("hp").value,turnstile:(document.querySelector("[name=cf-turnstile-response]")||{}).value||""})})
  .then(function(r){return r.json()}).then(function(r){
    $("bR").disabled=false;
    if(!r.ok&&window.turnstile){try{turnstile.reset()}catch(e){}}
    if(r.ok){$("g").querySelectorAll("input,select,button.p").forEach(function(x){x.disabled=true});$("ro").textContent=T("Registrazione ricevuta. Ti abbiamo mandato una email di conferma: apri il link per confermare l'indirizzo, poi potrai accedere. Se hai già la tessera, l'Amministratore la abbinerà al tuo account e riceverai la mail di Attivazione del servizio; se non ce l'hai, dopo l'accesso potrai richiederla dalla pagina Assistenza.");$("ro").className="okm"}
    else er.textContent=T(r.errore||"Errore")})
  .catch(function(){$("bR").disabled=false;er.textContent=T("Errore di rete")});
};
</script>
</body>
</html>`;

export const INVITO = String.raw`<!doctype html>
<html lang="it">
<head>
<script>try{var _t=localStorage.getItem("tema");if(_t)document.documentElement.setAttribute("data-t",_t)}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:15px/1.45 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);display:flex;min-height:100vh;justify-content:center;padding:20px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:22px;width:min(460px,94vw);align-self:flex-start;margin:auto 0}
h1{font-size:18px;margin:0 0 4px}
.sub{color:var(--mut);font-size:13px;margin-bottom:12px}
.tabs{display:flex;gap:6px;margin:10px 0 14px}
.tabs button{flex:1;background:var(--bg);color:var(--tx);border:1px solid var(--line)}
form{display:flex;flex-direction:column;gap:10px}
label{font-size:13px;color:var(--mut);display:flex;flex-direction:column;gap:3px}
input,select,button{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx);min-width:0}
.riga{display:flex;gap:8px}
.riga>label{flex:1;min-width:0}
label input,label select{width:100%}
.tel select{width:44%}.tel input{width:auto}.chk input{width:auto}
.tel{display:flex;gap:6px}
.tel select{width:44%;flex:none}.tel input{flex:1}
.err{color:var(--err);min-height:1.2em;font-size:13px}
.okm{color:var(--ok);font-size:14px}
.rg{font-size:12px;color:var(--mut);margin:-4px 0 0;display:flex;flex-wrap:wrap;gap:2px 12px}
.rg span.s{color:var(--ok)}
.chk{flex-direction:row;gap:8px;align-items:flex-start;font-size:13px;color:var(--tx)}
.chk input{margin-top:3px;flex:none}
details{border:1px solid var(--line);border-radius:6px;padding:6px 10px;font-size:13px}
details summary{cursor:pointer;color:var(--acc)}
details .t{max-height:220px;overflow:auto;margin-top:6px}
details h4{margin:10px 0 3px;font-size:13px}details p,details li{margin:3px 0}
.hide{display:none!important}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.piede{margin:24px auto 12px;text-align:center;font-size:12px;color:var(--mut)}.piede a{color:var(--acc)}.noprint-f{}</style>
</head>
<body>
<div class="card">
  <button type="button" id="bLang" style="float:right;background:none;border:0;color:var(--acc);padding:0;cursor:pointer"></button><button type="button" id="bTema" style="float:right;margin-right:12px;background:none;border:0;color:var(--acc);padding:0;cursor:pointer"></button>
  <h1>__TITLE__ <span class="ver">__VERSION__</span></h1>
  <div class="sub" id="tit"></div>
  <div class="sub" id="chi"></div>
  <form id="g" autocomplete="on" novalidate>
    <div class="riga">
      <label>Nome<input id="rN" autocomplete="given-name" required></label>
      <label>Cognome<input id="rC" autocomplete="family-name" required></label>
    </div>
    <div id="pwBox" style="display:flex;flex-direction:column;gap:10px">
      <label>Password<input id="rP" type="password" autocomplete="new-password"></label>
      <div class="rg" id="rg"><span data-k="l">12+ caratteri</span><span data-k="a">minuscola</span><span data-k="A">maiuscola</span><span data-k="d">numero</span><span data-k="s">carattere speciale</span></div>
      <label>Ripeti la password<input id="rP2" type="password" autocomplete="new-password"></label>
    </div>
    <label>Numero di telefono (obbligatorio)
      <div class="tel"><select id="pf1"></select><input id="t1" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="333 1234567" required></div>
    </label>
    <label>Secondo numero di telefono (facoltativo)
      <div class="tel"><select id="pf2"></select><input id="t2" type="tel" inputmode="tel" placeholder="333 1234567"></div>
    </label>
    <details><summary>Leggi il regolamento della colonnina</summary><div class="t" id="regTxt"></div></details>
    <label class="chk"><input type="checkbox" id="cR"><span>Ho letto e accetto il regolamento per l'uso della colonnina di ricarica.</span></label>

    <details><summary>Leggi l'informativa sulla privacy<span id="edTxt"></span></summary><div class="t" id="prTxt"></div></details>
    <label class="chk"><input type="checkbox" id="cP"><span>Ho letto l'informativa sulla privacy: i miei dati saranno utilizzati solo ed esclusivamente per erogare il servizio, senza cessione a terzi e senza pubblicità.</span></label>

    <label class="chk"><input type="checkbox" id="cM"><span>Facoltativo: acconsento a ricevere messaggi di servizio su Telegram. Posso cambiare o revocare il consenso in qualsiasi momento dalla pagina «Il mio profilo».</span></label>

    <button type="submit" class="p" id="bR">Salva e accedi</button>
    <div class="err" id="re"></div>
    <button type="button" id="bEsci" class="p hide" style="align-self:flex-start">Esci</button>
  </form>
<footer class="piede">Orbis Viaris Charge Report · software libero, <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">licenza AGPL-3.0</a> · <a href="https://github.com/alexxandro87/orbis-viaris-charge-report" target="_blank" rel="noopener">codice sorgente</a></footer>
</div>
<script>

var PREFISSI=[["Afghanistan","Afghanistan",93],["Albania","Albania",355],["Algeria","Algeria",213],["Andorra","Andorra",376],["Angola","Angola",244],["Anguilla","Anguilla",1],["Antigua e Barbuda","Antigua & Barbuda",1],["Arabia Saudita","Saudi Arabia",966],["Argentina","Argentina",54],["Armenia","Armenia",374],["Aruba","Aruba",297],["Australia","Australia",61],["Austria","Austria",43],["Azerbaigian","Azerbaijan",994],["Bahamas","Bahamas",1],["Bahrein","Bahrain",973],["Bangladesh","Bangladesh",880],["Barbados","Barbados",1],["Belgio","Belgium",32],["Belize","Belize",501],["Benin","Benin",229],["Bermuda","Bermuda",1],["Bhutan","Bhutan",975],["Bielorussia","Belarus",375],["Bolivia","Bolivia",591],["Bosnia ed Erzegovina","Bosnia & Herzegovina",387],["Botswana","Botswana",267],["Brasile","Brazil",55],["Brunei","Brunei",673],["Bulgaria","Bulgaria",359],["Burkina Faso","Burkina Faso",226],["Burundi","Burundi",257],["Cambogia","Cambodia",855],["Camerun","Cameroon",237],["Canada","Canada",1],["Capo Verde","Cape Verde",238],["Caraibi Olandesi","Caribbean Netherlands",599],["Cechia","Czechia",420],["Ciad","Chad",235],["Cile","Chile",56],["Cina","China",86],["Cipro","Cyprus",357],["Città del Vaticano","Vatican City",39],["Colombia","Colombia",57],["Comore","Comoros",269],["Congo - Kinshasa","Congo - Kinshasa",243],["Congo-Brazzaville","Congo - Brazzaville",242],["Corea del Nord","North Korea",850],["Corea del Sud","South Korea",82],["Costa d’Avorio","Côte d’Ivoire",225],["Costa Rica","Costa Rica",506],["Croazia","Croatia",385],["Cuba","Cuba",53],["Curaçao","Curaçao",599],["Danimarca","Denmark",45],["Dominica","Dominica",1],["Ecuador","Ecuador",593],["Egitto","Egypt",20],["El Salvador","El Salvador",503],["Emirati Arabi Uniti","United Arab Emirates",971],["Eritrea","Eritrea",291],["Estonia","Estonia",372],["Eswatini","Eswatini",268],["Etiopia","Ethiopia",251],["Figi","Fiji",679],["Filippine","Philippines",63],["Finlandia","Finland",358],["Francia","France",33],["Gabon","Gabon",241],["Gambia","Gambia",220],["Georgia","Georgia",995],["Germania","Germany",49],["Ghana","Ghana",233],["Giamaica","Jamaica",1],["Giappone","Japan",81],["Gibilterra","Gibraltar",350],["Gibuti","Djibouti",253],["Giordania","Jordan",962],["Grecia","Greece",30],["Grenada","Grenada",1],["Groenlandia","Greenland",299],["Guadalupa","Guadeloupe",590],["Guam","Guam",1],["Guatemala","Guatemala",502],["Guernsey","Guernsey",44],["Guinea","Guinea",224],["Guinea Equatoriale","Equatorial Guinea",240],["Guinea-Bissau","Guinea-Bissau",245],["Guyana","Guyana",592],["Guyana Francese","French Guiana",594],["Haiti","Haiti",509],["Honduras","Honduras",504],["India","India",91],["Indonesia","Indonesia",62],["Iran","Iran",98],["Iraq","Iraq",964],["Irlanda","Ireland",353],["Islanda","Iceland",354],["Isola Ascensione","Ascension Island",247],["Isola Christmas","Christmas Island",61],["Isola di Man","Isle of Man",44],["Isola Norfolk","Norfolk Island",672],["Isole Cayman","Cayman Islands",1],["Isole Cocos (Keeling)","Cocos (Keeling) Islands",61],["Isole Cook","Cook Islands",682],["Isole Falkland","Falkland Islands",500],["Isole Fær Øer","Faroe Islands",298],["Isole Marianne Settentrionali","Northern Mariana Islands",1],["Isole Marshall","Marshall Islands",692],["Isole Salomone","Solomon Islands",677],["Isole Turks e Caicos","Turks & Caicos Islands",1],["Isole Vergini Americane","U.S. Virgin Islands",1],["Isole Vergini Britanniche","British Virgin Islands",1],["Isole Åland","Åland Islands",358],["Israele","Israel",972],["Italia","Italy",39],["Jersey","Jersey",44],["Kazakistan","Kazakhstan",7],["Kenya","Kenya",254],["Kirghizistan","Kyrgyzstan",996],["Kiribati","Kiribati",686],["Kosovo","Kosovo",383],["Kuwait","Kuwait",965],["Laos","Laos",856],["Lesotho","Lesotho",266],["Lettonia","Latvia",371],["Libano","Lebanon",961],["Liberia","Liberia",231],["Libia","Libya",218],["Liechtenstein","Liechtenstein",423],["Lituania","Lithuania",370],["Lussemburgo","Luxembourg",352],["Macedonia del Nord","North Macedonia",389],["Madagascar","Madagascar",261],["Malawi","Malawi",265],["Malaysia","Malaysia",60],["Maldive","Maldives",960],["Mali","Mali",223],["Malta","Malta",356],["Marocco","Morocco",212],["Martinica","Martinique",596],["Mauritania","Mauritania",222],["Mauritius","Mauritius",230],["Mayotte","Mayotte",262],["Messico","Mexico",52],["Micronesia","Micronesia",691],["Moldavia","Moldova",373],["Monaco","Monaco",377],["Mongolia","Mongolia",976],["Montenegro","Montenegro",382],["Montserrat","Montserrat",1],["Mozambico","Mozambique",258],["Myanmar (Birmania)","Myanmar (Burma)",95],["Namibia","Namibia",264],["Nauru","Nauru",674],["Nepal","Nepal",977],["Nicaragua","Nicaragua",505],["Niger","Niger",227],["Nigeria","Nigeria",234],["Niue","Niue",683],["Norvegia","Norway",47],["Nuova Caledonia","New Caledonia",687],["Nuova Zelanda","New Zealand",64],["Oman","Oman",968],["Paesi Bassi","Netherlands",31],["Pakistan","Pakistan",92],["Palau","Palau",680],["Panama","Panama",507],["Papua Nuova Guinea","Papua New Guinea",675],["Paraguay","Paraguay",595],["Perù","Peru",51],["Polinesia Francese","French Polynesia",689],["Polonia","Poland",48],["Portogallo","Portugal",351],["Portorico","Puerto Rico",1],["Qatar","Qatar",974],["RAS di Hong Kong","Hong Kong SAR China",852],["RAS di Macao","Macao SAR China",853],["Regno Unito","United Kingdom",44],["Repubblica Centrafricana","Central African Republic",236],["Repubblica Dominicana","Dominican Republic",1],["Riunione","Réunion",262],["Romania","Romania",40],["Ruanda","Rwanda",250],["Russia","Russia",7],["Sahara Occidentale","Western Sahara",212],["Saint Kitts e Nevis","St. Kitts & Nevis",1],["Saint Lucia","St. Lucia",1],["Saint Martin","St. Martin",590],["Saint Vincent e Grenadine","St. Vincent & Grenadines",1],["Saint-Barthélemy","St. Barthélemy",590],["Saint-Pierre e Miquelon","St. Pierre & Miquelon",508],["Samoa","Samoa",685],["Samoa Americane","American Samoa",1],["San Marino","San Marino",378],["Sant’Elena","St. Helena",290],["Senegal","Senegal",221],["Serbia","Serbia",381],["Seychelles","Seychelles",248],["Sierra Leone","Sierra Leone",232],["Singapore","Singapore",65],["Sint Maarten","Sint Maarten",1],["Siria","Syria",963],["Slovacchia","Slovakia",421],["Slovenia","Slovenia",386],["Somalia","Somalia",252],["Spagna","Spain",34],["Sri Lanka","Sri Lanka",94],["Stati Uniti","United States",1],["Sud Sudan","South Sudan",211],["Sudafrica","South Africa",27],["Sudan","Sudan",249],["Suriname","Suriname",597],["Svalbard e Jan Mayen","Svalbard & Jan Mayen",47],["Svezia","Sweden",46],["Svizzera","Switzerland",41],["São Tomé e Príncipe","São Tomé & Príncipe",239],["Tagikistan","Tajikistan",992],["Taiwan","Taiwan",886],["Tanzania","Tanzania",255],["Territori Palestinesi","Palestinian Territories",970],["Territorio Britannico dell’Oceano Indiano","British Indian Ocean Territory",246],["Thailandia","Thailand",66],["Timor Est","Timor-Leste",670],["Togo","Togo",228],["Tokelau","Tokelau",690],["Tonga","Tonga",676],["Trinidad e Tobago","Trinidad & Tobago",1],["Tristan da Cunha","Tristan da Cunha",290],["Tunisia","Tunisia",216],["Turchia","Türkiye",90],["Turkmenistan","Turkmenistan",993],["Tuvalu","Tuvalu",688],["Ucraina","Ukraine",380],["Uganda","Uganda",256],["Ungheria","Hungary",36],["Uruguay","Uruguay",598],["Uzbekistan","Uzbekistan",998],["Vanuatu","Vanuatu",678],["Venezuela","Venezuela",58],["Vietnam","Vietnam",84],["Wallis e Futuna","Wallis & Futuna",681],["Yemen","Yemen",967],["Zambia","Zambia",260],["Zimbabwe","Zimbabwe",263]];
var LANG="it";try{LANG=localStorage.getItem("lang")||(((navigator.language||"it").slice(0,2)==="it")?"it":"en")}catch(e){}
var EN={"Orbis Viaris Charge Report · software libero,":"Orbis Viaris Charge Report · free software,","licenza AGPL-3.0":"AGPL-3.0 licence","codice sorgente":"source code","Sito web":"Website",
"Scegli la tua password e completa i tuoi dati":"Choose your password and complete your details",
"Completa il tuo profilo":"Complete your profile",
"Per continuare a usare il servizio servono i tuoi dati, l'accettazione del regolamento e la presa visione dell'informativa privacy.":"To keep using the service we need your details, your acceptance of the rules and confirmation that you have read the privacy notice.",
"Salva e accedi":"Save and sign in","Salva e continua":"Save and continue","Esci":"Log out","Utente: ":"User: ",
"Facoltativo: acconsento a ricevere messaggi di servizio su Telegram. Posso cambiare o revocare il consenso in qualsiasi momento dalla pagina «Il mio profilo».":"Optional: I agree to receive service messages on Telegram. I can change or withdraw consent at any time from the “My profile” page.",
"Link non valido o scaduto: chiedi un nuovo invito":"Invalid or expired link: ask for a new invite",
"login":"Please sign in again",
"Accedi o registrati per consultare le tue ricariche":"Sign in or register to view your charges",
"Accedi":"Sign in","Registrati":"Register","Email":"Email","Password":"Password","Nome":"First name","Cognome":"Last name",
"Indirizzo email":"Email address","Ripeti la password":"Repeat the password",
"12+ caratteri":"12+ characters","minuscola":"lowercase","maiuscola":"uppercase","numero":"digit","carattere speciale":"special character",
"Numero di telefono (obbligatorio)":"Phone number (required)","Secondo numero di telefono (facoltativo)":"Second phone number (optional)",
"Leggi il regolamento della colonnina":"Read the charger rules",
"Leggi l'informativa sulla privacy":"Read the privacy notice"," (edizione ":" (edition ","(testo non ancora pubblicato dal gestore del sito)":"(text not yet published by the site operator)","costo":"cost","una tantum":"one-off",
"Ho letto e accetto il regolamento per l'uso della colonnina di ricarica.":"I have read and accept the rules for using the charging station.",
"Ho letto l'informativa sulla privacy: i miei dati saranno utilizzati solo ed esclusivamente per erogare il servizio, senza cessione a terzi e senza pubblicità.":"I have read the privacy notice: my data will be used only and exclusively to provide the service, with no disclosure to third parties and no advertising.",
"Facoltativo: acconsento a ricevere messaggi di servizio su Telegram. Posso cambiare o revocare il consenso in qualsiasi momento dalla pagina «Il mio profilo», dopo l'accesso.":"Optional: I agree to receive service messages on Telegram. I can change or withdraw consent at any time from the “My profile” page, after signing in.",
"Inserisci nome e cognome":"Enter first and last name","Indirizzo email non valido":"Invalid email address",
"La password non rispetta i requisiti":"The password does not meet the requirements","Le due password non coincidono":"The two passwords do not match",
"Numero di telefono non valido":"Invalid phone number","Secondo numero di telefono non valido":"Invalid second phone number",
"Devi accettare il regolamento":"You must accept the rules","Devi confermare di aver letto l'informativa privacy":"You must confirm you have read the privacy notice",
"Errore di rete":"Network error","Errore":"Error",
"Troppi tentativi: riprova tra 10 minuti":"Too many attempts: try again in 10 minutes",
"Nome o password errati":"Wrong user name or password",
"Account in attesa di attivazione: sarà attivo quando l'Amministratore avrà abbinato la tua tessera":"Account awaiting activation: it will be active once the Administrator has linked your card",
"Devi prima confermare l'indirizzo email: controlla la tua posta":"You must confirm your email address first: check your inbox",
"Registrazione ricevuta. Ti abbiamo mandato una email di conferma: apri il link per confermare l'indirizzo, poi potrai accedere. Se hai già la tessera, l'Amministratore la abbinerà al tuo account e riceverai la mail di Attivazione del servizio; se non ce l'hai, dopo l'accesso potrai richiederla dalla pagina Assistenza.":"Registration received. We sent you a confirmation email: open the link to confirm your address, then you can sign in. If you already have a card, the Administrator will link it to your account and you will receive the Service activation email; if you do not, after signing in you can request one from the Support page.",
"Troppe registrazioni da questo indirizzo: riprova tra 10 minuti":"Too many registrations from this address: try again in 10 minutes",
"Non sono riuscito a inviare la mail di conferma: riprova più tardi":"Could not send the confirmation email: try again later"
};
function T(s){return(LANG==="en"&&EN.hasOwnProperty(s))?EN[s]:s}
function $(i){return document.getElementById(i)}
function trDom(){
  if(LANG!=="en")return;
  document.documentElement.lang="en";
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];
  while(n=w.nextNode())L.push(n);
  L.forEach(function(x){var v=x.nodeValue,k=v.trim();if(k&&EN.hasOwnProperty(k))x.nodeValue=v.replace(k,EN[k])});
  document.querySelectorAll("[placeholder]").forEach(function(e){e.placeholder=T(e.placeholder)});
}
function cambiaLingua(){try{localStorage.setItem("lang",LANG==="en"?"it":"en")}catch(e){}location.reload()}
var PREFISSI=[["Afghanistan","Afghanistan",93],["Albania","Albania",355],["Algeria","Algeria",213],["Andorra","Andorra",376],["Angola","Angola",244],["Anguilla","Anguilla",1],["Antigua e Barbuda","Antigua & Barbuda",1],["Arabia Saudita","Saudi Arabia",966],["Argentina","Argentina",54],["Armenia","Armenia",374],["Aruba","Aruba",297],["Australia","Australia",61],["Austria","Austria",43],["Azerbaigian","Azerbaijan",994],["Bahamas","Bahamas",1],["Bahrein","Bahrain",973],["Bangladesh","Bangladesh",880],["Barbados","Barbados",1],["Belgio","Belgium",32],["Belize","Belize",501],["Benin","Benin",229],["Bermuda","Bermuda",1],["Bhutan","Bhutan",975],["Bielorussia","Belarus",375],["Bolivia","Bolivia",591],["Bosnia ed Erzegovina","Bosnia & Herzegovina",387],["Botswana","Botswana",267],["Brasile","Brazil",55],["Brunei","Brunei",673],["Bulgaria","Bulgaria",359],["Burkina Faso","Burkina Faso",226],["Burundi","Burundi",257],["Cambogia","Cambodia",855],["Camerun","Cameroon",237],["Canada","Canada",1],["Capo Verde","Cape Verde",238],["Caraibi Olandesi","Caribbean Netherlands",599],["Cechia","Czechia",420],["Ciad","Chad",235],["Cile","Chile",56],["Cina","China",86],["Cipro","Cyprus",357],["Città del Vaticano","Vatican City",39],["Colombia","Colombia",57],["Comore","Comoros",269],["Congo - Kinshasa","Congo - Kinshasa",243],["Congo-Brazzaville","Congo - Brazzaville",242],["Corea del Nord","North Korea",850],["Corea del Sud","South Korea",82],["Costa d’Avorio","Côte d’Ivoire",225],["Costa Rica","Costa Rica",506],["Croazia","Croatia",385],["Cuba","Cuba",53],["Curaçao","Curaçao",599],["Danimarca","Denmark",45],["Dominica","Dominica",1],["Ecuador","Ecuador",593],["Egitto","Egypt",20],["El Salvador","El Salvador",503],["Emirati Arabi Uniti","United Arab Emirates",971],["Eritrea","Eritrea",291],["Estonia","Estonia",372],["Eswatini","Eswatini",268],["Etiopia","Ethiopia",251],["Figi","Fiji",679],["Filippine","Philippines",63],["Finlandia","Finland",358],["Francia","France",33],["Gabon","Gabon",241],["Gambia","Gambia",220],["Georgia","Georgia",995],["Germania","Germany",49],["Ghana","Ghana",233],["Giamaica","Jamaica",1],["Giappone","Japan",81],["Gibilterra","Gibraltar",350],["Gibuti","Djibouti",253],["Giordania","Jordan",962],["Grecia","Greece",30],["Grenada","Grenada",1],["Groenlandia","Greenland",299],["Guadalupa","Guadeloupe",590],["Guam","Guam",1],["Guatemala","Guatemala",502],["Guernsey","Guernsey",44],["Guinea","Guinea",224],["Guinea Equatoriale","Equatorial Guinea",240],["Guinea-Bissau","Guinea-Bissau",245],["Guyana","Guyana",592],["Guyana Francese","French Guiana",594],["Haiti","Haiti",509],["Honduras","Honduras",504],["India","India",91],["Indonesia","Indonesia",62],["Iran","Iran",98],["Iraq","Iraq",964],["Irlanda","Ireland",353],["Islanda","Iceland",354],["Isola Ascensione","Ascension Island",247],["Isola Christmas","Christmas Island",61],["Isola di Man","Isle of Man",44],["Isola Norfolk","Norfolk Island",672],["Isole Cayman","Cayman Islands",1],["Isole Cocos (Keeling)","Cocos (Keeling) Islands",61],["Isole Cook","Cook Islands",682],["Isole Falkland","Falkland Islands",500],["Isole Fær Øer","Faroe Islands",298],["Isole Marianne Settentrionali","Northern Mariana Islands",1],["Isole Marshall","Marshall Islands",692],["Isole Salomone","Solomon Islands",677],["Isole Turks e Caicos","Turks & Caicos Islands",1],["Isole Vergini Americane","U.S. Virgin Islands",1],["Isole Vergini Britanniche","British Virgin Islands",1],["Isole Åland","Åland Islands",358],["Israele","Israel",972],["Italia","Italy",39],["Jersey","Jersey",44],["Kazakistan","Kazakhstan",7],["Kenya","Kenya",254],["Kirghizistan","Kyrgyzstan",996],["Kiribati","Kiribati",686],["Kosovo","Kosovo",383],["Kuwait","Kuwait",965],["Laos","Laos",856],["Lesotho","Lesotho",266],["Lettonia","Latvia",371],["Libano","Lebanon",961],["Liberia","Liberia",231],["Libia","Libya",218],["Liechtenstein","Liechtenstein",423],["Lituania","Lithuania",370],["Lussemburgo","Luxembourg",352],["Macedonia del Nord","North Macedonia",389],["Madagascar","Madagascar",261],["Malawi","Malawi",265],["Malaysia","Malaysia",60],["Maldive","Maldives",960],["Mali","Mali",223],["Malta","Malta",356],["Marocco","Morocco",212],["Martinica","Martinique",596],["Mauritania","Mauritania",222],["Mauritius","Mauritius",230],["Mayotte","Mayotte",262],["Messico","Mexico",52],["Micronesia","Micronesia",691],["Moldavia","Moldova",373],["Monaco","Monaco",377],["Mongolia","Mongolia",976],["Montenegro","Montenegro",382],["Montserrat","Montserrat",1],["Mozambico","Mozambique",258],["Myanmar (Birmania)","Myanmar (Burma)",95],["Namibia","Namibia",264],["Nauru","Nauru",674],["Nepal","Nepal",977],["Nicaragua","Nicaragua",505],["Niger","Niger",227],["Nigeria","Nigeria",234],["Niue","Niue",683],["Norvegia","Norway",47],["Nuova Caledonia","New Caledonia",687],["Nuova Zelanda","New Zealand",64],["Oman","Oman",968],["Paesi Bassi","Netherlands",31],["Pakistan","Pakistan",92],["Palau","Palau",680],["Panama","Panama",507],["Papua Nuova Guinea","Papua New Guinea",675],["Paraguay","Paraguay",595],["Perù","Peru",51],["Polinesia Francese","French Polynesia",689],["Polonia","Poland",48],["Portogallo","Portugal",351],["Portorico","Puerto Rico",1],["Qatar","Qatar",974],["RAS di Hong Kong","Hong Kong SAR China",852],["RAS di Macao","Macao SAR China",853],["Regno Unito","United Kingdom",44],["Repubblica Centrafricana","Central African Republic",236],["Repubblica Dominicana","Dominican Republic",1],["Riunione","Réunion",262],["Romania","Romania",40],["Ruanda","Rwanda",250],["Russia","Russia",7],["Sahara Occidentale","Western Sahara",212],["Saint Kitts e Nevis","St. Kitts & Nevis",1],["Saint Lucia","St. Lucia",1],["Saint Martin","St. Martin",590],["Saint Vincent e Grenadine","St. Vincent & Grenadines",1],["Saint-Barthélemy","St. Barthélemy",590],["Saint-Pierre e Miquelon","St. Pierre & Miquelon",508],["Samoa","Samoa",685],["Samoa Americane","American Samoa",1],["San Marino","San Marino",378],["Sant’Elena","St. Helena",290],["Senegal","Senegal",221],["Serbia","Serbia",381],["Seychelles","Seychelles",248],["Sierra Leone","Sierra Leone",232],["Singapore","Singapore",65],["Sint Maarten","Sint Maarten",1],["Siria","Syria",963],["Slovacchia","Slovakia",421],["Slovenia","Slovenia",386],["Somalia","Somalia",252],["Spagna","Spain",34],["Sri Lanka","Sri Lanka",94],["Stati Uniti","United States",1],["Sud Sudan","South Sudan",211],["Sudafrica","South Africa",27],["Sudan","Sudan",249],["Suriname","Suriname",597],["Svalbard e Jan Mayen","Svalbard & Jan Mayen",47],["Svezia","Sweden",46],["Svizzera","Switzerland",41],["São Tomé e Príncipe","São Tomé & Príncipe",239],["Tagikistan","Tajikistan",992],["Taiwan","Taiwan",886],["Tanzania","Tanzania",255],["Territori Palestinesi","Palestinian Territories",970],["Territorio Britannico dell’Oceano Indiano","British Indian Ocean Territory",246],["Thailandia","Thailand",66],["Timor Est","Timor-Leste",670],["Togo","Togo",228],["Tokelau","Tokelau",690],["Tonga","Tonga",676],["Trinidad e Tobago","Trinidad & Tobago",1],["Tristan da Cunha","Tristan da Cunha",290],["Tunisia","Tunisia",216],["Turchia","Türkiye",90],["Turkmenistan","Turkmenistan",993],["Tuvalu","Tuvalu",688],["Ucraina","Ukraine",380],["Uganda","Uganda",256],["Ungheria","Hungary",36],["Uruguay","Uruguay",598],["Uzbekistan","Uzbekistan",998],["Vanuatu","Vanuatu",678],["Venezuela","Venezuela",58],["Vietnam","Vietnam",84],["Wallis e Futuna","Wallis & Futuna",681],["Yemen","Yemen",967],["Zambia","Zambia",260],["Zimbabwe","Zimbabwe",263]];
function riempi(sel){
  var h="";PREFISSI.forEach(function(p){h+='<option value="'+p[2]+'"'+(p[2]===39&&p[0]==="Italia"?" selected":"")+'>'+(LANG==="en"?p[1]:p[0])+" (+"+p[2]+")</option>"});
  sel.innerHTML=h;
}
var q=new URLSearchParams(location.search),mail=q.get("e")||"",tok=q.get("invito")||"",COMPLETA=!!q.get("completa");
riempi($("pf1"));riempi($("pf2"));
if(COMPLETA){
  $("pwBox").style.display="none";$("tit").textContent="Completa il tuo profilo";
  $("chi").textContent="Per continuare a usare il servizio servono i tuoi dati, l'accettazione del regolamento e la presa visione dell'informativa privacy.";
  $("bR").textContent="Salva e continua";$("bEsci").classList.remove("hide");
  $("bEsci").onclick=function(){fetch("/api/logout",{method:"POST"}).then(function(){location.href="/"})};
}else{
  $("tit").textContent="Scegli la tua password e completa i tuoi dati";$("chi").textContent="Utente: "+mail;
}
trDom();
fetch("/api/testi").then(function(r){return r.json()}).then(function(t){
  var en=LANG==="en",reg=en?(t.reg_en||t.reg_it):(t.reg_it||t.reg_en),pr=en?(t.priv_en||t.priv_it):(t.priv_it||t.priv_en),no='<p class="sub">'+T("(testo non ancora pubblicato dal gestore del sito)")+"</p>";
  document.getElementById("regTxt").innerHTML=reg||no;document.getElementById("prTxt").innerHTML=pr||no;
  if(t.edizione)document.getElementById("edTxt").textContent=T(" (edizione ")+t.edizione+")";
  var f=document.getElementById("feeReg");if(f)f.textContent=t.costo?" ("+T("costo")+" "+t.costo+" "+T("una tantum")+")":"";
}).catch(function(){});$("bLang").textContent=(LANG==="en")?"Italiano":"English";$("bLang").onclick=cambiaLingua;(function(){var b=$("bTema");function cur(){return document.documentElement.getAttribute("data-t")||"auto"}function lab(){var m=LANG==="en"?{auto:"◐ Auto",light:"☀ Light",dark:"☾ Dark"}:{auto:"◐ Auto",light:"☀ Giorno",dark:"☾ Notte"};b.textContent=m[cur()]}lab();b.onclick=function(){var n={auto:"light",light:"dark",dark:"auto"}[cur()];if(n==="auto")document.documentElement.removeAttribute("data-t");else document.documentElement.setAttribute("data-t",n);try{if(n==="auto")localStorage.removeItem("tema");else localStorage.setItem("tema",n)}catch(e){}lab()}})();
function reqPw(p){return{l:p.length>=12,a:/[a-z]/.test(p),A:/[A-Z]/.test(p),d:/[0-9]/.test(p),s:/[^A-Za-z0-9\s]/.test(p)}}
function pwOk(p){var r=reqPw(p);return r.l&&r.a&&r.A&&r.d&&r.s}
$("rP").oninput=function(){
  var r=reqPw($("rP").value);
  document.querySelectorAll("#rg span").forEach(function(s){s.className=r[s.dataset.k]?"s":""});
};
function nazionale(t){return t.value.replace(/[\s.\-()\/]/g,"")}
function telOk(pf,n){return /^[0-9]{6,12}$/.test(n)&&/^\+[1-9][0-9]{7,14}$/.test("+"+pf.value+n)}
$("g").onsubmit=function(ev){
  ev.preventDefault();
  var er=$("re");er.textContent="";
  var nome=$("rN").value.trim(),cog=$("rC").value.trim();
  if(!nome||!cog){er.textContent=T("Inserisci nome e cognome");return}
  if(!COMPLETA){
    if(!pwOk($("rP").value)){er.textContent=T("La password non rispetta i requisiti");return}
    if($("rP").value!==$("rP2").value){er.textContent=T("Le due password non coincidono");return}
  }
  var n1=nazionale($("t1")),n2=nazionale($("t2")),t1,t2="";
  if(!telOk($("pf1"),n1)){er.textContent=T("Numero di telefono non valido");return}
  t1="+"+$("pf1").value+n1;
  if(n2){if(!telOk($("pf2"),n2)){er.textContent=T("Secondo numero di telefono non valido");return}t2="+"+$("pf2").value+n2}
  if(!$("cR").checked){er.textContent=T("Devi accettare il regolamento");return}
  if(!$("cP").checked){er.textContent=T("Devi confermare di aver letto l'informativa privacy");return}
  var body={nome:nome,cognome:cog,tel1:t1,tel2:t2,reg:true,priv:true,msg:$("cM").checked};
  if(!COMPLETA){body.password=$("rP").value;body.token=tok;body.email=mail}
  $("bR").disabled=true;
  fetch(COMPLETA?"/api/profilo":"/api/invito",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})
  .then(function(r){return r.json()}).then(function(r){
    $("bR").disabled=false;
    if(r.ok)location.href="/";else er.textContent=T(r.errore||"Errore")})
  .catch(function(){$("bR").disabled=false;er.textContent=T("Errore di rete")});
};
</script>
</body>
</html>`;

// First-run setup: shown until an administrator exists (and the APP_PASSWORD secret is not used).
export const SETUP = String.raw`<!doctype html>
<html lang="it">
<head>
<script>try{var _t=localStorage.getItem("tema");if(_t)document.documentElement.setAttribute("data-t",_t)}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:15px/1.45 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);display:flex;min-height:100vh;justify-content:center;padding:20px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:22px;width:min(560px,94vw);align-self:flex-start;margin:auto 0}
h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:14px 0 6px}
.sub{color:var(--mut);font-size:13px;margin-bottom:10px}
form{display:flex;flex-direction:column;gap:10px}
label{font-size:13px;color:var(--mut);display:flex;flex-direction:column;gap:3px}
input,select,button{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx);min-width:0}
.riga{display:flex;gap:8px}.riga>label{flex:1;min-width:0}label input{width:100%}
.err{color:var(--err);min-height:1.2em;font-size:13px}.okm{color:var(--ok);font-size:13px}
pre{white-space:pre-wrap;font-size:12px;max-height:140px;overflow:auto;border:1px solid var(--line);border-radius:6px;padding:6px}
.hide{display:none!important}
</style>
</head>
<body>
<div class="card">
  <button type="button" id="bLang" style="float:right;background:none;border:0;color:var(--acc);padding:0;cursor:pointer"></button>
  <h1>Prima configurazione <span class="ver">__VERSION__</span></h1>
  <div class="sub">Crea l'amministratore e indica la colonnina. Tutto si può cambiare dopo dalla scheda Impostazioni.</div>
  <form id="f">
    <h2>Amministratore</h2>
    <div class="riga"><label>Nome utente<input id="s_nome" value="admin" autocomplete="username" required></label></div>
    <div class="riga"><label>Password<input id="s_pw" type="password" autocomplete="new-password" required></label><label>Ripeti la password<input id="s_pw2" type="password" autocomplete="new-password" required></label></div>
    <div class="sub">Almeno 12 caratteri con minuscola, maiuscola, numero e carattere speciale.</div>
    <div class="riga hide" id="codeBox"><label>Codice di configurazione (SETUP_CODE)<input id="s_code" autocomplete="off"></label></div>
    <h2>Colonnina</h2>
    <div class="riga"><label>Indirizzo (http:// o https://, con la porta se serve)<input id="cf_url" placeholder="http://colonnina.esempio.it:81" autocomplete="off"></label></div>
    <div class="riga"><label>Utente (se la colonnina chiede una password)<input id="cf_user" autocomplete="off"></label><label>Password<input id="cf_password" type="password" autocomplete="new-password"></label></div>
    <h2>Sito</h2>
    <div class="riga"><label>Titolo del sito<input id="cf_title" value="EV Charger"></label></div>
    <div class="riga"><label>Fuso orario<input id="cf_tz" value="Europe/Rome"></label><label>Valuta<input id="cf_currency" value="&euro;"></label></div>
    <h2>Mail (facoltativo, Resend)</h2>
    <div class="riga"><label>Chiave API Resend<input id="cf_resend_key" type="password" autocomplete="new-password"></label><label>Mittente<input id="cf_mail_from" placeholder="Colonnina &lt;ricariche@esempio.it&gt;"></label></div>
    <div class="riga"><button type="button" id="bProva">Prova il collegamento</button><button type="submit" class="p" id="bOk" style="background:var(--acc);color:var(--btx);border-color:var(--acc)">Salva e inizia</button></div>
    <div class="err" id="er"></div><div id="prova"></div>
  </form>
</div>
<script>
var LANG="it";try{LANG=localStorage.getItem("lang")||(((navigator.language||"it").slice(0,2)==="it")?"it":"en")}catch(e){}
var EN={"Prima configurazione":"First-run setup","Crea l'amministratore e indica la colonnina. Tutto si può cambiare dopo dalla scheda Impostazioni.":"Create the administrator and point to the charger. Everything can be changed later from the Settings tab.",
"Amministratore":"Administrator","Nome utente":"User name","Password":"Password","Ripeti la password":"Repeat the password","Almeno 12 caratteri con minuscola, maiuscola, numero e carattere speciale.":"At least 12 characters with lower case, upper case, a digit and a special character.",
"Codice di configurazione (SETUP_CODE)":"Setup code (SETUP_CODE)","Colonnina":"Charger","Indirizzo (http:// o https://, con la porta se serve)":"Address (http:// or https://, with the port if needed)","Utente (se la colonnina chiede una password)":"User (if the charger asks for a password)",
"Sito":"Site","Titolo del sito":"Site title","Fuso orario":"Time zone","Valuta":"Currency","Mail (facoltativo, Resend)":"Email (optional, Resend)","Chiave API Resend":"Resend API key","Mittente":"Sender","Prova il collegamento":"Test the connection","Salva e inizia":"Save and start",
"Le password non coincidono":"The passwords do not match","Provo la connessione...":"Testing the connection...","Storico":"History","Elenco tessere":"Card list","ok":"ok","errore":"error","Righe lette: ":"Rows read: ",
"La password non rispetta i requisiti":"The password does not meet the requirements","Nome utente non valido":"Invalid user name","Codice di configurazione errato":"Wrong setup code","Configurazione gia' completata":"Setup already completed","L'indirizzo della colonnina deve iniziare con http:// o https://":"The charger address must start with http:// or https://","Fuso orario sconosciuto":"Unknown time zone","Indirizzo della colonnina non impostato":"Charger address not set"};
function T(s){return(LANG==="en"&&EN.hasOwnProperty(s))?EN[s]:s}
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
(function(){if(LANG!=="en")return;document.documentElement.lang="en";var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];while(n=w.nextNode())L.push(n);L.forEach(function(x){var v=x.nodeValue,k=v.trim();if(k&&EN.hasOwnProperty(k))x.nodeValue=v.replace(k,EN[k])})})();
$("bLang").textContent=(LANG==="en")?"Italiano":"English";$("bLang").onclick=function(){try{localStorage.setItem("lang",LANG==="en"?"it":"en")}catch(e){}location.reload()};
var IDS=["url","user","password","title","tz","currency","resend_key","mail_from"];
function dati(){var o={};IDS.forEach(function(k){o[k]=$("cf_"+k).value});o.code=$("s_code").value;return o}
function post(p,b){return fetch(p,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json()})}
fetch("/api/setup").then(function(r){return r.json()}).then(function(r){if(r.done){location.href="/";return}$("codeBox").classList.toggle("hide",!r.code_required)});
function blocco(nome,x){if(!x)return "";var h="<h2>"+esc(nome)+": "+(x.ok?T("ok"):T("errore"))+" <span class=\"sub\">("+x.ms+" ms)</span></h2>";if(x.errore)h+='<div class="err">'+esc(x.errore)+"</div>";if(x.righe!==undefined)h+='<div class="sub">'+T("Righe lette: ")+x.righe+"</div>";if(x.sample)h+="<pre>"+esc(x.sample)+"</pre>";return h}
$("bProva").onclick=function(){$("er").textContent="";$("prova").innerHTML='<div class="sub">'+T("Provo la connessione...")+"</div>";
  post("/api/setup/test",dati()).then(function(r){if(r.errore){$("prova").innerHTML="";$("er").textContent=T(r.errore);return}$("prova").innerHTML=blocco(T("Storico"),r.history)+blocco(T("Elenco tessere"),r.tags)})};
$("f").onsubmit=function(e){e.preventDefault();$("er").textContent="";
  if($("s_pw").value!==$("s_pw2").value){$("er").textContent=T("Le password non coincidono");return}
  var d=dati();d.nome=$("s_nome").value;d.password_admin=$("s_pw").value;
  $("bOk").disabled=true;
  post("/api/setup",d).then(function(r){$("bOk").disabled=false;if(r.errore){$("er").textContent=T(r.errore);return}location.href="/"});
};
</script>
</body>
</html>`;

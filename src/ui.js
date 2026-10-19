// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Alessandro Pomponi. This program is free software under the GNU Affero General Public License v3 or later; see LICENSE.
// Single-page UI (plain HTML + JS, no libraries). Do not use backticks or dollar-brace in page code: pages are String.raw templates.
// The I18N block (EN/IT dictionary) is shared by all three pages and injected where __I18N__ appears.
export const I18N = String.raw`var TR={en:{
lang_name:"English",
setup_title:"first setup",setup_h:"Welcome - first setup",setup_intro:"Create the administrator account and enter how to reach the charger. Everything can be changed later in the Settings tab; optional fields can stay empty.",
setup_code:"Setup code",setup_code_h:"Required: the SETUP_CODE secret is set on this installation.",setup_admin:"Administrator user name",setup_pass:"Administrator password (min. 8)",setup_pass2:"Repeat the password",
setup_btn:"Create administrator and finish",setup_sec:"Security: until this step is done, anyone who opens this page can create the administrator. Set the SETUP_CODE secret before the first visit (see the README).",
s_email:"Email invitations (optional)",s_email_h:"Invitations are sent with Resend (free up to 3,000 emails a month): create an account at resend.com, verify your sending domain and create an API key.",s_rkey:"Resend API key",s_rclear:"Remove the saved API key",s_mfrom:"Sender address (for example Charger <charge@example.com>)",
e_setup_code:"Wrong setup code",e_setup_done:"Setup already completed",e_setup_required:"Setup not completed: open the home page",e_bad_name:"Invalid user name (1-64 characters, no spaces)",
pw_change:"Change password",logout:"Log out",loading:"Loading...",dl:"Download from the charger",imp:"Import Viaris CSV...",
pw_cur:"Current password",pw_new:"New password (min. 8)",pw_new2:"Repeat the new password",save:"Save",
n_month:"Monthly report",n_year:"Yearly history",n_all:"All sessions",n_users:"Users",n_mine:"My charging",n_set:"Settings",
price_lbl:"Price {cur}/kWh",tax_lbl:"{tax} %",save_price:"Save price",
h_cards:"Charging with a card",h_app:"Sessions started from the app (not assigned to a card)",
print:"Print / PDF",csv:"Export CSV",tap_year:"Tap a month to open it. Months without a price only show kWh.",tap_mine:"Tap a month to see the single sessions.",
c_card:"Card",c_user:"User",c_sess:"Sess.",c_kwh:"kWh",c_net:"Net",c_tax:"VAT",c_total:"Total",c_start:"Start",c_end:"End",c_month:"Month",
c_kwh_cards:"kWh cards",c_kwh_app:"kWh app",c_kwh_tot:"kWh total",c_charges:"Sessions",c_state:"Status",c_perm:"Permissions / card",
tax_default:"VAT",
st_empty:"Archive is empty",st_n:"{n} sessions from {a} to {b}",st_n1:"1 session from {a} to {b}",st_upd:" - updated {t}",st_err:"Last download failed: {e}",
rep_title:"Charging cost sharing - {t}",rep_noprice:"Price not entered yet",rep_sub:"Price {p} {cur}/kWh, {tax} {i}% - sessions: {n}",
adv_enter:"Enter this month's price per kWh and press Save price to compute the amounts.",
adv_locked:"Price locked since {d}: the month is closed and can no longer be changed.",adv_open:"The price can be corrected until the day before {d}, then it is locked.",
click_sess:"Click to see the sessions",tot_cards:"Cards total",tot_app:"App total",no_app:"No app sessions this month.",
tot_all:"TOTAL {t}: {k} kWh - net {n} + {tax} {v} = {e}",tot_cards_l:"TOTAL cards {t}: {k} kWh - net {n} + {tax} {v} = {e}",
tot_year:"TOTAL {y}: {k} kWh - {e} ({tax} included)",tot_year_kwh:"TOTAL {y}: {k} kWh",
all_users:"All",user_filter:"User",n1:"1 session",nn:"{n} sessions",from_app:"Started from app",unknown_card:"(card not in list)",app_short:"(app)",
alert_price:"Invalid price: write for example 0.2845",alert_tax:"Invalid tax: write for example 10 or 0",
dl_running:"Downloading...",dl_ok:"Download: {l} sessions read, {n} new",dl_skipped:", {s} rows skipped",dl_fail:"Charger not reachable: {e}",err_net:"Error: {e}",
imp_ok:"{t}: {l} sessions, {n} new",imp_fail:"{f}: NOT imported - {e}",
my_title:"My charging",c_charges_n:"Sessions",
u_title:"Users",u_invite:"Invite a user or change permissions",u_email:"user's email",u_type:"User type",u_t_mgr:"Manager (choose the permissions)",u_t_cus:"Charger user (sees only their own sessions)",
u_card:"Card",u_pick_card:"- choose the card -",
p_report:"See the monthly report",p_storico:"See the yearly history",p_sessioni:"See all sessions",p_prezzo:"Enter price per kWh and tax",p_stampa:"Print and export the reports",p_scarica:"Download from the charger and import CSV",p_app:"See sessions started from the app",
pe_report:"report",pe_storico:"history",pe_sessioni:"sessions",pe_prezzo:"price",pe_stampa:"print",pe_scarica:"download",pe_app:"app",
u_send:"Send invitation",u_saveperm:"Save permissions only",u_hint:"The user receives an email with a single-use link (valid 48 hours) to choose their password on first access.",
u_edit:"Edit",u_reset:"Reset",u_resend:"Resend",u_delete:"Delete",u_resend_t:"Send again the invitation link",u_reset_t:"Send a link to reset the password",
u_admin:"admin",u_all:"all",u_none:"none",u_active:"active",u_expired:"invitation expired",u_pending:"invitation pending",
u_confirm_send:"Send a new link to {u}?",u_confirm_del:"Delete user {u}?",u_pick:"Choose the card to link",u_saved:"Permissions saved",
inv_sent:"Invitation sent to {e}",inv_notsent:"Email not sent ({r}). Copy the link and send it yourself:",mail_nc:"email not configured",
pw_mismatch:"The two new passwords do not match",pw_changed:"Password changed",
s_conn:"Charger connection",s_url:"Charger address (URL)",s_url_h:"Base address of the charger web interface, for example http://charger.example.com. Cloudflare Workers can only reach ports 80 and 443 reliably.",
s_user:"User name (HTTP Basic)",s_pass:"Password (HTTP Basic)",s_pass_set:"(saved - leave empty to keep)",s_pass_clear:"Remove the saved password",
s_hname:"Extra header name",s_hval:"Extra header value",s_h_h:"For example Authorization / Bearer xxxx, or Cookie / session=xxxx",
s_hist:"Session history path",s_tags:"Card list path (empty = skip)",s_timeout:"Timeout (seconds)",s_auto:"Download automatically (schedule set in wrangler.toml)",
s_fmt:"Data format",s_fmt_h:"The default values match Orbis chargers. Use the test button to see the raw response and adjust the column numbers (first column is 0).",
s_jf:"JSON field containing the CSV (empty = response is CSV itself)",s_hsep:"Column separator",s_hskip:"Header lines to skip",
s_c_start:"Column: start time (epoch)",s_c_end:"Column: end time (epoch)",s_c_tag:"Column: card",s_c_type:"Column: start type (card/app)",s_c_ci:"Column: meter at start (Wh)",s_c_cf:"Column: meter at end (Wh)",
s_tsep:"Card list: separator",s_tskip:"Card list: lines to skip",s_tc_tag:"Card list: card column",s_tc_name:"Card list: name column",
s_gen:"General",s_title:"Site title",s_tz:"Time zone (IANA)",s_tz_h:"For example Europe/Rome, Europe/London, America/New_York. Decides which month a session belongs to.",s_cur:"Currency symbol",s_taxl:"Tax label (empty = VAT / IVA)",
s_test:"Test connection",s_save:"Save settings",s_reset:"Restore defaults",s_saved:"Settings saved",s_testing:"Testing...",s_ok:"OK",s_fail:"Failed",
s_t_hist:"Session history",s_t_tags:"Card list",s_t_rows:"{r} rows read, {s} skipped",s_t_first:"First row: {f}",s_t_ms:"{ms} ms, {b} bytes",s_t_raw:"Raw response (first 500 characters)",
s_t_rows_tags:"{r} cards read",s_env_url:"The address is also set by an environment variable (settings saved here win).",
login_h:"Sign in to see the charging sessions",login_user:"User",login_pass:"Password",login_btn:"Sign in",login_title:"sign in",
inv_h:"Choose your password",inv_user:"User: {m}",inv_p1:"New password (min. 8 characters)",inv_p2:"Repeat the password",inv_btn:"Save and sign in",inv_title:"choose the password",
e_generic:"Error",e_network:"Network error",
e_forbidden:"You do not have permission for this operation",e_unauthorized:"Not authorized",e_too_many:"Too many attempts: try again in 10 minutes",e_bad_login:"Wrong user name or password",
e_bad_email:"Invalid email address",e_is_admin:"This user is the admin",e_card_not_found:"Card not found: download from the charger first",e_user_not_found:"User not found",
e_cant_delete_admin:"The admin cannot be deleted",e_bad_action:"Invalid action",e_pw_short:"The password must be at least 8 characters",e_pw_mismatch:"The two new passwords do not match",
e_pw_wrong:"Current password is wrong",e_invite_invalid:"Invalid or expired link: ask for a new invitation",e_bad_period:"Invalid month/year",
e_price_locked:"Price locked: the month has been closed since {d} and can no longer be changed",e_bad_price:"Invalid price or tax",e_not_found:"Not found",
e_empty_file:"Empty file",e_not_viaris:"This does not look like a per-card Viaris export",e_card_unknown:"Cannot match the card from the file name ({f}): download from the charger first",
e_bad_url:"The charger address must start with http:// or https://",e_bad_tz:"Unknown time zone",e_bad_config:"Invalid number in field {k}",e_no_url:"Set the charger address first",
e_no_price:"Price not entered yet",
rep_resend:"Email report again",rep_resend_c:"Email the {t} report again to the report recipients?",rep_mailed:"Report emailed to the recipients",rep_notmailed:"Report email not sent: {r}",rep_norec:"no report recipients in Settings",
s_rto:"Monthly report recipients (To)",s_rcc:"Monthly report recipients (CC)",s_rep_h:"When a month's price is saved, the split per card is emailed here with a PDF of every session. Separate addresses with commas; leave To empty to send nothing.",
s_bk:"Database backup",s_bk_h:"A .sql file with sessions, cards, prices, users and settings (including the saved charger password and Resend key): keep it private. Restore with: npx wrangler d1 execute <database> --remote --file=<file>",s_bk_btn:"Download backup (.sql)",
m_pdf:"Download PDF",m_year:"Whole year"
},it:{
lang_name:"Italiano",
setup_title:"prima configurazione",setup_h:"Benvenuto - prima configurazione",setup_intro:"Crea l'account amministratore e indica come raggiungere la colonnina. Tutto si puo' cambiare dopo nella scheda Impostazioni; i campi facoltativi possono restare vuoti.",
setup_code:"Codice di installazione",setup_code_h:"Obbligatorio: su questa installazione e' impostato il segreto SETUP_CODE.",setup_admin:"Nome utente dell'amministratore",setup_pass:"Password dell'amministratore (min. 8)",setup_pass2:"Ripeti la password",
setup_btn:"Crea l'amministratore e termina",setup_sec:"Sicurezza: finche' questo passaggio non e' completato, chiunque apra questa pagina puo' creare l'amministratore. Imposta il segreto SETUP_CODE prima del primo accesso (vedi il README).",
s_email:"Inviti via email (facoltativo)",s_email_h:"Gli inviti partono da Resend (gratis fino a 3.000 email al mese): crea un account su resend.com, verifica il dominio del mittente e crea una chiave API.",s_rkey:"Chiave API di Resend",s_rclear:"Rimuovi la chiave API salvata",s_mfrom:"Indirizzo mittente (per esempio Colonnina <ricariche@example.com>)",
e_setup_code:"Codice di installazione errato",e_setup_done:"Configurazione gia' completata",e_setup_required:"Configurazione non completata: apri la pagina principale",e_bad_name:"Nome utente non valido (1-64 caratteri, senza spazi)",
pw_change:"Cambia password",logout:"Esci",loading:"Caricamento...",dl:"Scarica dalla colonnina",imp:"Importa CSV Viaris...",
pw_cur:"Password attuale",pw_new:"Nuova password (min. 8)",pw_new2:"Ripeti la nuova password",save:"Salva",
n_month:"Report mensile",n_year:"Storico annuale",n_all:"Tutte le sessioni",n_users:"Utenti",n_mine:"Le mie ricariche",n_set:"Impostazioni",
price_lbl:"Prezzo {cur}/kWh",tax_lbl:"{tax} %",save_price:"Salva prezzo",
h_cards:"Ricariche con tessera",h_app:"Ricariche avviate da app (non attribuite a una tessera)",
print:"Stampa / PDF",csv:"Esporta CSV",tap_year:"Tocca un mese per aprirlo. I mesi senza prezzo mostrano solo i kWh.",tap_mine:"Tocca un mese per vedere le singole ricariche.",
c_card:"Tessera",c_user:"Utente",c_sess:"Sess.",c_kwh:"kWh",c_net:"Imponibile",c_tax:"IVA",c_total:"Totale",c_start:"Inizio",c_end:"Fine",c_month:"Mese",
c_kwh_cards:"kWh tess.",c_kwh_app:"kWh app",c_kwh_tot:"kWh tot.",c_charges:"Ricariche",c_state:"Stato",c_perm:"Permessi / tessera",
tax_default:"IVA",
st_empty:"Archivio vuoto",st_n:"{n} sessioni dal {a} al {b}",st_n1:"1 sessione dal {a} al {b}",st_upd:" - aggiornato il {t}",st_err:"Ultimo scarico non riuscito: {e}",
rep_title:"Ripartizione costi ricarica - {t}",rep_noprice:"Prezzo non ancora inserito",rep_sub:"Prezzo {p} {cur}/kWh, {tax} {i}% - sessioni: {n}",
adv_enter:"Inserisci il prezzo del kWh di questo mese e premi Salva prezzo per calcolare gli importi.",
adv_locked:"Prezzo bloccato dal {d}: il mese e' chiuso e non si puo' piu' modificare.",adv_open:"Il prezzo si puo' correggere fino al giorno prima del {d}, poi viene bloccato.",
click_sess:"Clicca per vedere le sessioni",tot_cards:"Totale tessere",tot_app:"Totale app",no_app:"Nessuna ricarica da app in questo mese.",
tot_all:"TOTALE {t}: {k} kWh - imponibile {n} + {tax} {v} = {e}",tot_cards_l:"TOTALE tessere {t}: {k} kWh - imponibile {n} + {tax} {v} = {e}",
tot_year:"TOTALE {y}: {k} kWh - {e} ({tax} inclusa)",tot_year_kwh:"TOTALE {y}: {k} kWh",
all_users:"Tutti",user_filter:"Utente",n1:"1 sessione",nn:"{n} sessioni",from_app:"Avviata da app",unknown_card:"(tessera non in elenco)",app_short:"(app)",
alert_price:"Prezzo non valido: scrivi per esempio 0,2845",alert_tax:"IVA non valida: scrivi per esempio 10 oppure 0",
dl_running:"Scarico in corso...",dl_ok:"Scarico: {l} sessioni lette, {n} nuove",dl_skipped:", {s} righe scartate",dl_fail:"Colonnina non raggiungibile: {e}",err_net:"Errore: {e}",
imp_ok:"{t}: {l} sessioni, {n} nuove",imp_fail:"{f}: NON importato - {e}",
my_title:"Le mie ricariche",c_charges_n:"Ricariche",
u_title:"Utenti",u_invite:"Invita un utente o modifica i permessi",u_email:"email dell'utente",u_type:"Tipo di utente",u_t_mgr:"Gestione (scegli i permessi)",u_t_cus:"Utente della colonnina (vede solo le sue ricariche)",
u_card:"Tessera",u_pick_card:"- scegli la tessera -",
p_report:"Vedere il report mensile",p_storico:"Vedere lo storico annuale",p_sessioni:"Vedere tutte le sessioni",p_prezzo:"Inserire prezzo kWh e IVA",p_stampa:"Stampare ed esportare i report",p_scarica:"Scaricare dalla colonnina e importare CSV",p_app:"Vedere le ricariche avviate da app",
pe_report:"report",pe_storico:"storico",pe_sessioni:"sessioni",pe_prezzo:"prezzo",pe_stampa:"stampa",pe_scarica:"scarico",pe_app:"app",
u_send:"Invia invito",u_saveperm:"Salva solo i permessi",u_hint:"L'utente riceve una mail con un link monouso (valido 48 ore) per scegliere la propria password al primo accesso.",
u_edit:"Modifica",u_reset:"Reimposta",u_resend:"Reinvia",u_delete:"Elimina",u_resend_t:"Manda di nuovo il link di invito",u_reset_t:"Manda un link per reimpostare la password",
u_admin:"admin",u_all:"tutti",u_none:"nessuno",u_active:"attivo",u_expired:"invito scaduto",u_pending:"invito in attesa",
u_confirm_send:"Mandare un nuovo link a {u}?",u_confirm_del:"Eliminare l'utente {u}?",u_pick:"Scegli la tessera da abbinare",u_saved:"Permessi salvati",
inv_sent:"Invito inviato a {e}",inv_notsent:"Mail non inviata ({r}). Copia il link e invialo tu:",mail_nc:"mail non configurata",
pw_mismatch:"Le due nuove password non coincidono",pw_changed:"Password cambiata",
s_conn:"Connessione alla colonnina",s_url:"Indirizzo della colonnina (URL)",s_url_h:"Indirizzo di base dell'interfaccia web della colonnina, per esempio http://colonnina.example.com. I Cloudflare Worker raggiungono in modo affidabile solo le porte 80 e 443.",
s_user:"Nome utente (HTTP Basic)",s_pass:"Password (HTTP Basic)",s_pass_set:"(salvata - lascia vuoto per mantenerla)",s_pass_clear:"Rimuovi la password salvata",
s_hname:"Nome intestazione extra",s_hval:"Valore intestazione extra",s_h_h:"Per esempio Authorization / Bearer xxxx, oppure Cookie / session=xxxx",
s_hist:"Percorso dello storico sessioni",s_tags:"Percorso elenco tessere (vuoto = salta)",s_timeout:"Timeout (secondi)",s_auto:"Scarica automaticamente (orario in wrangler.toml)",
s_fmt:"Formato dei dati",s_fmt_h:"I valori predefiniti vanno bene per le colonnine Orbis. Usa il pulsante di prova per vedere la risposta grezza e correggere i numeri di colonna (la prima colonna e' la 0).",
s_jf:"Campo JSON che contiene il CSV (vuoto = la risposta e' gia' CSV)",s_hsep:"Separatore di colonna",s_hskip:"Righe di intestazione da saltare",
s_c_start:"Colonna: inizio (epoch)",s_c_end:"Colonna: fine (epoch)",s_c_tag:"Colonna: tessera",s_c_type:"Colonna: tipo di avvio (tessera/app)",s_c_ci:"Colonna: contatore iniziale (Wh)",s_c_cf:"Colonna: contatore finale (Wh)",
s_tsep:"Elenco tessere: separatore",s_tskip:"Elenco tessere: righe da saltare",s_tc_tag:"Elenco tessere: colonna tessera",s_tc_name:"Elenco tessere: colonna nome",
s_gen:"Generale",s_title:"Titolo del sito",s_tz:"Fuso orario (IANA)",s_tz_h:"Per esempio Europe/Rome, Europe/London, America/New_York. Decide a quale mese appartiene una sessione.",s_cur:"Simbolo della valuta",s_taxl:"Nome dell'imposta (vuoto = IVA / VAT)",
s_test:"Prova la connessione",s_save:"Salva le impostazioni",s_reset:"Ripristina i valori predefiniti",s_saved:"Impostazioni salvate",s_testing:"Prova in corso...",s_ok:"OK",s_fail:"Non riuscita",
s_t_hist:"Storico sessioni",s_t_tags:"Elenco tessere",s_t_rows:"{r} righe lette, {s} scartate",s_t_first:"Prima riga: {f}",s_t_ms:"{ms} ms, {b} byte",s_t_raw:"Risposta grezza (primi 500 caratteri)",
s_t_rows_tags:"{r} tessere lette",s_env_url:"L'indirizzo e' impostato anche da una variabile d'ambiente (vale quello salvato qui).",
login_h:"Accedi per consultare le ricariche",login_user:"Utente",login_pass:"Password",login_btn:"Accedi",login_title:"accesso",
inv_h:"Scegli la tua password",inv_user:"Utente: {m}",inv_p1:"Nuova password (min. 8 caratteri)",inv_p2:"Ripeti la password",inv_btn:"Salva e accedi",inv_title:"scegli la password",
e_generic:"Errore",e_network:"Errore di rete",
e_forbidden:"Non hai il permesso per questa operazione",e_unauthorized:"Non autorizzato",e_too_many:"Troppi tentativi: riprova tra 10 minuti",e_bad_login:"Nome o password errati",
e_bad_email:"Indirizzo email non valido",e_is_admin:"Questo utente e' l'admin",e_card_not_found:"Tessera non trovata: scarica prima dalla colonnina",e_user_not_found:"Utente non trovato",
e_cant_delete_admin:"L'admin non si puo' eliminare",e_bad_action:"Azione non valida",e_pw_short:"La password deve avere almeno 8 caratteri",e_pw_mismatch:"Le due nuove password non coincidono",
e_pw_wrong:"Password attuale errata",e_invite_invalid:"Link non valido o scaduto: chiedi un nuovo invito",e_bad_period:"Mese/anno non validi",
e_price_locked:"Prezzo bloccato: il mese e' chiuso dal {d} e non si puo' piu' modificare",e_bad_price:"Prezzo o IVA non validi",e_not_found:"Non trovato",
e_empty_file:"File vuoto",e_not_viaris:"Non sembra un export per tessera di Viaris",e_card_unknown:"Non riconosco la tessera dal nome del file ({f}): scarica prima dalla colonnina",
e_bad_url:"L'indirizzo della colonnina deve iniziare con http:// o https://",e_bad_tz:"Fuso orario sconosciuto",e_bad_config:"Numero non valido nel campo {k}",e_no_url:"Imposta prima l'indirizzo della colonnina",
e_no_price:"Prezzo non ancora inserito",
rep_resend:"Reinvia il report via email",rep_resend_c:"Reinviare il report di {t} ai destinatari dei report?",rep_mailed:"Report inviato via email ai destinatari",rep_notmailed:"Email del report non inviata: {r}",rep_norec:"nessun destinatario dei report nelle Impostazioni",
s_rto:"Destinatari del report mensile (A)",s_rcc:"Destinatari del report mensile (CC)",s_rep_h:"Quando salvi il prezzo di un mese, la ripartizione per tessera viene mandata a questi indirizzi con il PDF di tutte le sessioni. Separa gli indirizzi con una virgola; lascia vuoto A per non inviare nulla.",
s_bk:"Backup del database",s_bk_h:"Un file .sql con sessioni, tessere, prezzi, utenti e impostazioni (compresi la password della colonnina e la chiave Resend salvate): tienilo riservato. Si ripristina con: npx wrangler d1 execute <database> --remote --file=<file>",s_bk_btn:"Scarica backup (.sql)",
m_pdf:"Scarica PDF",m_year:"Anno intero"
}};
var LANG=(function(){try{var l=localStorage.getItem("lang");if(l==="en"||l==="it")return l}catch(e){}return String(navigator.language||"en").slice(0,2)==="it"?"it":"en"})();
var LOC=LANG==="it"?"it-IT":"en-GB";
function T(k,v){var s=TR[LANG][k];if(s===undefined)s=TR.en[k];if(s===undefined)return k;if(v)for(var x in v)s=s.split("{"+x+"}").join(v[x]);return s}
function E(r){if(r&&r.codice){var k="e_"+r.codice;if(TR[LANG][k]!==undefined)return T(k,r.par)}return (r&&r.errore)||T("e_generic")}
function setLang(l){try{localStorage.setItem("lang",l)}catch(e){}location.reload()}
function applyI18n(){
  document.documentElement.lang=LANG;
  document.querySelectorAll("[data-i]").forEach(function(e){e.textContent=T(e.getAttribute("data-i"))});
  document.querySelectorAll("[data-ph]").forEach(function(e){e.placeholder=T(e.getAttribute("data-ph"))});
  document.querySelectorAll("[data-ti]").forEach(function(e){e.title=T(e.getAttribute("data-ti"))});
  var s=document.getElementById("lang");
  if(s){s.innerHTML='<option value="en">English</option><option value="it">Italiano</option>';s.value=LANG;s.onchange=function(){setLang(s.value)}}
}

function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function D(s){if(LANG==="it"||!s)return s;var m=/^(\d\d)\/(\d\d)\/(\d{4}) (.*)$/.exec(s);return m?m[3]+"-"+m[2]+"-"+m[1]+" "+m[4]:s}
function bloccoProva(nome,x){
  var h='<div class="card"><h2>'+nome+' - '+(x.ok?'<span class="ok">'+T("s_ok")+'</span>':'<span class="err">'+T("s_fail")+'</span>')+'</h2>';
  if(x.ms!==undefined)h+='<div class="sub">'+T("s_t_ms",{ms:x.ms,b:x.bytes===undefined?"-":x.bytes})+'</div>';
  if(x.errore)h+='<div class="err">'+esc(x.errore)+'</div>';
  if(x.righe!==undefined)h+='<div>'+(x.scartate!==undefined?T("s_t_rows",{r:x.righe,s:x.scartate}):T("s_t_rows_tags",{r:x.righe}))+'</div>';
  if(x.primo)h+='<div class="sub">'+T("s_t_first",{f:esc(D(x.primo.inizio)+" -> "+D(x.primo.fine)+", "+x.primo.tag+" ("+x.primo.tipo+"), "+(x.primo.wh/1000)+" kWh")})+'</div>';
  if(x.sample)h+='<details><summary class="sub">'+T("s_t_raw")+'</summary><pre>'+esc(x.sample)+'</pre></details>';
  return h+'</div>';
}
`;

export const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--err:#b00020}
@media (prefers-color-scheme:dark){:root{--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--err:#ff7a8a}}
*{box-sizing:border-box}
body{margin:0;font:15px/1.4 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
header{padding:8px 16px;background:var(--card);border-bottom:1px solid var(--line)}
h1{font-size:16px;margin:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:6px 16px;flex-wrap:wrap}
.riga2{margin-top:6px}
.utente,.azioni{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.utente{font-size:13px}
header button,header select{padding:4px 10px;font-size:13px}
button.l{border:0;background:none;color:var(--acc);padding:0 2px}
.pill{background:var(--acc);color:#fff;border-radius:10px;padding:1px 8px;font-size:11px}
.pwbox{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;margin-top:8px}
.pwbox input{padding:5px 8px;font-size:13px}
.sub{color:var(--mut);font-size:13px}
main{padding:12px 16px;max-width:1000px;margin:0 auto}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
button,select,input{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--tx)}
button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}
button:disabled{opacity:.5}
nav{display:flex;gap:4px;margin:12px 0 0;border-bottom:1px solid var(--line);flex-wrap:wrap}
nav button{border:0;border-bottom:3px solid transparent;border-radius:0;background:none}
nav button.on{border-bottom-color:var(--acc);font-weight:600}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;margin:12px 0}
h2{font-size:15px;margin:0 0 8px}
.w{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:480px}
th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
th{color:var(--mut);font-weight:600;font-size:13px}
td.n,th.n{text-align:right}
tr.t td{font-weight:600;border-top:2px solid var(--tx)}
tr.cl{cursor:pointer}tr.cl:hover{background:var(--bg)}
.err{color:var(--err)}.ok{color:var(--acc)}
.tot{font-size:16px;font-weight:600;text-align:right;margin-top:8px}
.hide{display:none}
@media print{.noprint{display:none!important}body{background:#fff;color:#000}.card{border:0}}
#tabU td:nth-child(3){white-space:normal}#tabU td.n{white-space:nowrap;width:1%}#tabU button{padding:3px 9px;font-size:13px}
.solostampa{display:none}@media print{.solostampa{display:block;font-weight:600;margin-bottom:6px}}
tr.ut{cursor:pointer}tr.ut:hover td{background:var(--bg)}tr.det td{background:var(--bg);color:var(--mut);font-size:.92em}
tr.det td:first-child{padding-left:24px}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px 14px}
.fg label{display:flex;flex-direction:column;gap:3px;font-size:13px;color:var(--mut)}
.fg input,.fg select{width:100%;color:var(--tx);font-size:15px}
.fg .wide{grid-column:1/-1}
.chk{flex-direction:row!important;align-items:center;gap:8px!important}.chk input{width:auto}
pre{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px;overflow:auto;white-space:pre-wrap;word-break:break-all;font-size:12px;margin:6px 0}
</style>
</head>
<body>
<header class="noprint">
  <div class="top">
    <h1>__TITLE__</h1>
    <div class="utente">
      <select id="lang" title="Language"></select>
      <span id="chi"></span>
      <button class="l" id="bPw" data-i="pw_change"></button>
      <button id="bEsci" data-i="logout"></button>
    </div>
  </div>
  <div class="top riga2">
    <div class="sub"><span id="stato"></span> <span class="err" id="esito"></span></div>
    <div class="azioni">
      <button class="p" id="bScarica" data-i="dl"></button>
      <button id="bImporta" data-i="imp"></button>
      <input type="file" id="fCsv" accept=".csv" multiple class="hide">
    </div>
  </div>
  <div class="pwbox hide" id="boxPw">
    <input type="password" id="pwOld" data-ph="pw_cur" autocomplete="current-password">
    <input type="password" id="pwNew" data-ph="pw_new" autocomplete="new-password">
    <input type="password" id="pwNew2" data-ph="pw_new2" autocomplete="new-password">
    <button class="p" id="bPwOk" data-i="save"></button>
    <span class="sub err" id="pwEsito"></span>
  </div>
</header>
<main>
<nav class="noprint">
  <button class="on" data-t="t1" data-i="n_month"></button>
  <button data-t="t2" data-i="n_year"></button>
  <button data-t="t3" data-i="n_all"></button>
  <button data-t="t4" id="navUt" class="hide" data-i="n_users"></button>
  <button data-t="t6" id="navSet" class="hide" data-i="n_set"></button>
  <button data-t="t5" id="navM" class="hide" data-i="n_mine"></button>
</nav>

<section id="t1">
  <div class="solostampa">__TITLE__</div>
  <div class="bar noprint">
    <select id="selAnno"></select>
    <select id="selMese"></select>
    <label><span id="lPrezzo"></span> <input id="prezzo" size="7" inputmode="decimal"></label>
    <label><span id="lIva"></span> <input id="iva" size="4" inputmode="decimal"></label>
    <button class="p" id="bPrezzo" data-i="save_price"></button>
    <button id="bReinvia" class="hide" data-i="rep_resend"></button>
  </div>
  <div class="sub err noprint" id="avviso"></div>
  <div class="card">
    <h2 id="titoloRep"></h2>
    <div class="sub" id="subRep"></div>
  </div>
  <div class="card">
    <h2 data-i="h_cards"></h2>
    <div class="w"><table id="tabT"></table></div>
  </div>
  <div class="card hide" id="cApp">
    <h2 data-i="h_app"></h2>
    <div class="w"><table id="tabA"></table></div>
  </div>
  <div class="card"><div class="tot" id="totale"></div></div>
  <div class="bar noprint">
    <button id="bStampa" data-i="print"></button>
    <button id="bCsv" data-i="csv"></button>
  </div>
</section>

<section id="t2" class="hide">
  <div class="bar noprint">
    <select id="selAnnoS"></select>
    <button id="bCsvAnno" data-i="csv"></button>
  </div>
  <div class="card"><div class="w"><table id="tabS"></table></div>
  <div class="tot" id="totAnno"></div>
  <div class="sub noprint" data-i="tap_year"></div></div>
</section>

<section id="t5" class="hide">
  <div class="bar noprint"><select id="selAnnoM"></select> <select id="selMeseM"></select> <button class="p" id="bPdfM" data-i="m_pdf"></button></div>
  <div class="card">
    <h2 id="mieTit"></h2>
    <div class="w"><table id="tabM"></table></div>
    <div class="tot" id="totM"></div>
    <div class="sub noprint" data-i="tap_mine"></div>
  </div>
</section>

<section id="t4" class="hide">
  <div class="card">
    <h2 data-i="u_title"></h2>
    <div class="w"><table id="tabU"></table></div>
  </div>
  <div class="card">
    <h2 data-i="u_invite"></h2>
    <div class="bar"><input id="uNome" type="email" size="32" data-ph="u_email" autocomplete="off"></div>
    <div class="bar"><label><span data-i="u_type"></span>
      <select id="uTipo"><option value="g" id="oTg"></option><option value="c" id="oTc"></option></select></label></div>
    <div class="bar hide" id="uTessBox"><label><span data-i="u_card"></span> <select id="uTess"></select></label></div>
    <div class="bar" id="uPerm" style="flex-direction:column;align-items:flex-start;gap:4px">
      <label><input type="checkbox" data-p="report"> <span data-i="p_report"></span></label>
      <label><input type="checkbox" data-p="storico"> <span data-i="p_storico"></span></label>
      <label><input type="checkbox" data-p="sessioni"> <span data-i="p_sessioni"></span></label>
      <label><input type="checkbox" data-p="prezzo"> <span data-i="p_prezzo"></span></label>
      <label><input type="checkbox" data-p="stampa"> <span data-i="p_stampa"></span></label>
      <label><input type="checkbox" data-p="scarica"> <span data-i="p_scarica"></span></label>
      <label><input type="checkbox" data-p="app"> <span data-i="p_app"></span></label>
    </div>
    <div class="bar">
      <button class="p" id="bUInvita" data-i="u_send"></button>
      <button id="bUPerm" data-i="u_saveperm"></button>
    </div>
    <div class="sub" data-i="u_hint"></div>
    <div class="sub err" id="uEsito"></div>
    <input id="uLink" class="hide" readonly size="60">
  </div>
</section>

<section id="t6" class="hide">
  <div class="card">
    <h2 data-i="s_conn"></h2>
    <div class="fg">
      <label class="wide"><span data-i="s_url"></span><input id="cf_url" placeholder="http://charger.example.com" autocomplete="off"><span class="sub" data-i="s_url_h"></span><span class="sub" id="envUrl"></span></label>
      <label><span data-i="s_user"></span><input id="cf_user" autocomplete="off"></label>
      <label><span data-i="s_pass"></span><input id="cf_password" type="password" autocomplete="new-password"></label>
      <label class="chk"><input type="checkbox" id="cf_pw_clear"><span data-i="s_pass_clear"></span></label>
      <label><span data-i="s_hname"></span><input id="cf_header_name" autocomplete="off"></label>
      <label><span data-i="s_hval"></span><input id="cf_header_value" autocomplete="off"></label>
      <span class="sub wide" data-i="s_h_h"></span>
      <label class="wide"><span data-i="s_hist"></span><input id="cf_history_path"></label>
      <label class="wide"><span data-i="s_tags"></span><input id="cf_tags_path"></label>
      <label><span data-i="s_timeout"></span><input id="cf_timeout" inputmode="numeric"></label>
      <label class="chk wide"><input type="checkbox" id="cf_auto"><span data-i="s_auto"></span></label>
    </div>
  </div>
  <div class="card">
    <h2 data-i="s_fmt"></h2>
    <div class="sub" data-i="s_fmt_h"></div>
    <div class="fg" style="margin-top:8px">
      <label class="wide"><span data-i="s_jf"></span><input id="cf_hist_json_field"></label>
      <label><span data-i="s_hsep"></span><input id="cf_hist_sep" size="3"></label>
      <label><span data-i="s_hskip"></span><input id="cf_hist_skip" inputmode="numeric"></label>
      <label><span data-i="s_c_start"></span><input id="cf_c_start" inputmode="numeric"></label>
      <label><span data-i="s_c_end"></span><input id="cf_c_end" inputmode="numeric"></label>
      <label><span data-i="s_c_tag"></span><input id="cf_c_tag" inputmode="numeric"></label>
      <label><span data-i="s_c_type"></span><input id="cf_c_type" inputmode="numeric"></label>
      <label><span data-i="s_c_ci"></span><input id="cf_c_cont_ini" inputmode="numeric"></label>
      <label><span data-i="s_c_cf"></span><input id="cf_c_cont_fin" inputmode="numeric"></label>
      <label><span data-i="s_tsep"></span><input id="cf_tags_sep" size="3"></label>
      <label><span data-i="s_tskip"></span><input id="cf_tags_skip" inputmode="numeric"></label>
      <label><span data-i="s_tc_tag"></span><input id="cf_tags_c_tag" inputmode="numeric"></label>
      <label><span data-i="s_tc_name"></span><input id="cf_tags_c_name" inputmode="numeric"></label>
    </div>
  </div>
  <div class="card">
    <h2 data-i="s_gen"></h2>
    <div class="fg">
      <label class="wide"><span data-i="s_title"></span><input id="cf_title"></label>
      <label><span data-i="s_tz"></span><input id="cf_tz" placeholder="Europe/Rome"></label>
      <label><span data-i="s_cur"></span><input id="cf_currency" size="4"></label>
      <label><span data-i="s_taxl"></span><input id="cf_tax_label" size="8"></label>
      <span class="sub wide" data-i="s_tz_h"></span>
    </div>
  </div>
  <div class="card">
    <h2 data-i="s_email"></h2>
    <div class="sub" data-i="s_email_h"></div>
    <div class="fg" style="margin-top:8px">
      <label><span data-i="s_rkey"></span><input id="cf_resend_key" type="password" autocomplete="new-password"></label>
      <label class="chk"><input type="checkbox" id="cf_rk_clear"><span data-i="s_rclear"></span></label>
      <label class="wide"><span data-i="s_mfrom"></span><input id="cf_mail_from" autocomplete="off"></label>
      <label class="wide"><span data-i="s_rto"></span><input id="cf_report_to" autocomplete="off" placeholder="admin@example.com"></label>
      <label class="wide"><span data-i="s_rcc"></span><input id="cf_report_cc" autocomplete="off"></label>
      <span class="sub wide" data-i="s_rep_h"></span>
    </div>
  </div>
  <div class="card">
    <h2 data-i="s_bk"></h2>
    <div class="sub" data-i="s_bk_h"></div>
    <div class="bar"><a href="/api/backup" download><button type="button" data-i="s_bk_btn"></button></a></div>
  </div>
  <div class="bar">
    <button class="p" id="bCfSalva" data-i="s_save"></button>
    <button id="bCfProva" data-i="s_test"></button>
    <button id="bCfReset" data-i="s_reset"></button>
  </div>
  <div class="sub err" id="cfEsito"></div>
  <div id="cfProva"></div>
</section>

<section id="t3" class="hide">
  <div class="bar noprint"><label><span data-i="user_filter"></span> <select id="selUt"></select></label></div>
  <div class="card"><div class="w"><table id="tabX"></table></div></div>
</section>
</main>
<script>
__I18N__
var MESI=[];for(var mi=0;mi<12;mi++){var mn=new Date(2000,mi,1).toLocaleString(LOC,{month:"long"});MESI.push(mn.charAt(0).toUpperCase()+mn.slice(1))}
var CUR="€",TAXL=T("tax_default"),TITLE="",io=null,cfg=null;
function $(i){return document.getElementById(i)}
function nf(x,d){if(x===null||x===undefined)return "-";d=(d===undefined)?2:d;return x.toLocaleString(LOC,{minimumFractionDigits:d,maximumFractionDigits:d})}
function cn(x,d){if(x===null||x===undefined||x==="")return "";var s=Number(x).toFixed(d===undefined?2:d);return LANG==="it"?s.replace(".",","):s}
var SEP=LANG==="it"?";":",";
function q(v){v=String(v===null||v===undefined?"":v);return (v.indexOf(SEP)>=0||v.indexOf('"')>=0||v.indexOf("\n")>=0)?'"'+v.replace(/"/g,'""')+'"':v}
function api(p,o){o=o||{};o.headers=o.headers||{};return fetch(p,o).then(function(r){if(r.status===401){location.reload();return new Promise(function(){})}return r.json()})}
function post(p,b){return api(p,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)})}
function row(cells,cls){return "<tr"+(cls?' class="'+cls+'"':"")+">"+cells.join("")+"</tr>"}
function td(v,n){return "<td"+(n?' class="n"':"")+">"+v+"</td>"}
function th(v,n){return "<th"+(n?' class="n"':"")+">"+v+"</th>"}
function cnt(n){return n===1?T("n1"):T("nn",{n:n})}

var oggi=new Date(), rep=null, righeAnno=[];
(function init(){
  applyI18n();
  $("oTg").textContent=T("u_t_mgr");$("oTc").textContent=T("u_t_cus");
  var a="";for(var y=2020;y<=oggi.getFullYear()+1;y++)a+='<option>'+y+'</option>';
  $("selAnno").innerHTML=a;$("selAnnoS").innerHTML=a;$("selAnnoM").innerHTML=a;$("selAnnoM").value=String(oggi.getFullYear());
  $("selAnno").value=$("selAnnoS").value=String(oggi.getFullYear());
  var m="";for(var i=0;i<12;i++)m+='<option value="'+(i+1)+'">'+MESI[i]+'</option>';
  $("selMese").innerHTML=m;$("selMese").value=String(oggi.getMonth()+1);
  $("selMeseM").innerHTML='<option value="0">'+T("m_year")+'</option>'+m;
  $("stato").textContent=T("loading");
})();
function etichette(){
  $("lPrezzo").textContent=T("price_lbl",{cur:CUR});$("lIva").textContent=T("tax_lbl",{tax:TAXL});
}
etichette();

document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){
  document.querySelectorAll("nav button").forEach(function(x){x.classList.toggle("on",x===b)});
  ["t1","t2","t3","t4","t5","t6"].forEach(function(t){$(t).classList.toggle("hide",t!==b.dataset.t)});
  if(b.dataset.t==="t2")caricaStorico();if(b.dataset.t==="t3")caricaSessioni();if(b.dataset.t==="t4")caricaUtenti();if(b.dataset.t==="t5")caricaMie();if(b.dataset.t==="t6")caricaConfig();
}});

function caricaStato(){return api("/api/stato").then(function(s){
  var t=s.sessioni?T(s.sessioni===1?"st_n1":"st_n",{n:s.sessioni,a:D(s.dal).slice(0,10),b:D(s.al).slice(0,10)}):T("st_empty");
  if(s.ultimo_scarico)t+=T("st_upd",{t:new Date(s.ultimo_scarico).toLocaleString(LOC,{dateStyle:"short",timeStyle:"short"})});
  $("stato").textContent=t;
  $("esito").textContent=s.ultimo_errore?T("st_err",{e:s.ultimo_errore}):"";
})}

function caricaReport(){
  return api("/api/report?anno="+$("selAnno").value+"&mese="+$("selMese").value).then(function(r){
    if(r.errore)return;
    rep=r;r.titolo=MESI[r.mese-1]+" "+r.anno;
    var dec=LANG==="it"?",":".";
    $("prezzo").value=r.prezzo===null?"":String(r.prezzo).replace(".",dec);
    var iv=(r.prezzo===null)?r.iva_prec:r.iva_pct;
    $("iva").value=String(iv===null||iv===undefined?0:iv).replace(".",dec);
    $("titoloRep").textContent=T("rep_title",{t:r.titolo});
    $("subRep").textContent=r.prezzo===null?T("rep_noprice"):T("rep_sub",{p:nf(r.prezzo,4),cur:CUR,tax:TAXL,i:nf(r.iva_pct,1),n:r.sessioni});
    $("avviso").textContent=r.prezzo===null?T("adv_enter"):(r.bloccato?T("adv_locked",{d:D(r.blocco_da+" 00:00").slice(0,10)}):T("adv_open",{d:D(r.blocco_da+" 00:00").slice(0,10)}));
    $("avviso").style.color=r.bloccato?"":"var(--mut)";
    $("prezzo").disabled=$("iva").disabled=$("bPrezzo").disabled=!!r.bloccato;
    $("bReinvia").classList.toggle("hide",!(io&&io.ruolo==="admin"&&r.prezzo!==null));
    var t=row([th(T("c_card")),th(T("c_user")),th(T("c_sess"),1),th(T("c_kwh"),1),th(T("c_net"),1),th(TAXL,1),th(T("c_total"),1)]);
    r.tessere.forEach(function(x,i){t+='<tr class="ut" data-i="'+i+'" title="'+T("click_sess")+'">'+td(esc(x.tag))+td(esc(x.nome||T("unknown_card")))+td(x.n,1)+td(nf(x.kwh),1)+td(nf(x.imp),1)+td(nf(x.iva),1)+td(nf(x.tot),1)+"</tr>"});
    t+=row([td(""),td(T("tot_cards")),td(r.tessere.reduce(function(s,x){return s+x.n},0),1),td(nf(r.kwh_tessere),1),td(nf(r.imp_tessere),1),td(nf(r.iva_tessere),1),td(nf(r.tot_tessere),1)],"t");
    $("tabT").innerHTML=t;
    document.querySelectorAll("#tabT tr.ut").forEach(function(tr){tr.onclick=function(){
      var nx=tr.nextElementSibling;
      if(nx&&nx.classList.contains("det")){while(tr.nextElementSibling&&tr.nextElementSibling.classList.contains("det"))tr.nextElementSibling.remove();return}
      var x=r.tessere[+tr.dataset.i],h="";
      x.sess.forEach(function(s){h+='<tr class="det"><td></td><td>'+D(s.inizio)+" &rarr; "+D(s.fine)+'</td><td></td><td class="n">'+nf(s.kwh)+'</td><td class="n">'+nf(s.imp)+'</td><td class="n">'+nf(s.iva)+'</td><td class="n">'+nf(s.tot)+'</td></tr>'});
      tr.insertAdjacentHTML("afterend",h)}});
    $("cApp").classList.toggle("hide",!r.riservato);
    var a=row([th(T("c_start")),th(T("c_end")),th(T("c_kwh"),1),th(T("c_net"),1),th(TAXL,1),th(T("c_total"),1)]);
    if(!r.app.length)a+='<tr><td colspan="6"><i>'+T("no_app")+'</i></td></tr>';
    r.app.forEach(function(x){a+=row([td(D(x.inizio)),td(D(x.fine)),td(nf(x.kwh),1),td(nf(x.imp),1),td(nf(x.iva),1),td(nf(x.tot),1)])});
    a+=row([td(T("tot_app")),td(""),td(nf(r.kwh_app),1),td(nf(r.imp_app),1),td(nf(r.iva_app),1),td(nf(r.tot_app),1)],"t");
    $("tabA").innerHTML=a;
    $("totale").textContent=T(r.riservato?"tot_all":"tot_cards_l",{t:r.titolo,k:nf(r.kwh_tot),n:nf(r.imp_tot),tax:TAXL,v:nf(r.iva_tot),e:nf(r.eur_tot)+" "+CUR});
  });
}

function caricaStorico(){
  return api("/api/storico?anno="+$("selAnnoS").value).then(function(rr){
    if(!Array.isArray(rr))return;
    righeAnno=rr;
    var R=rr.length&&rr[0].riservato;
    var t=row([th(T("c_month")),th(T("c_sess"),1),th(T("c_kwh_cards"),1)].concat(R?[th(T("c_kwh_app"),1),th(T("c_kwh_tot"),1)]:[]).concat([th(CUR+"/kWh",1),th(TAXL+" %",1),th(T("c_total"),1)]));
    var k=0,e=0,okp=false;
    rr.forEach(function(x){k+=x.kwh_tot;if(x.eur_tot!==null){e+=x.eur_tot;okp=true}
      t+='<tr class="cl" data-m="'+x.mese+'">'+td(MESI[x.mese-1])+td(x.sessioni,1)+td(nf(x.kwh_tessere),1)+(R?td(nf(x.kwh_app),1)+td(nf(x.kwh_tot),1):"")+td(nf(x.prezzo,4),1)+td(x.prezzo===null?"-":nf(x.iva_pct,1),1)+td(nf(x.eur_tot),1)+"</tr>"});
    $("tabS").innerHTML=t;
    $("totAnno").textContent=okp?T("tot_year",{y:$("selAnnoS").value,k:nf(k),e:nf(Math.round(e*100)/100)+" "+CUR,tax:TAXL}):T("tot_year_kwh",{y:$("selAnnoS").value,k:nf(k)});
    document.querySelectorAll("#tabS tr.cl").forEach(function(tr){tr.onclick=function(){
      $("selAnno").value=$("selAnnoS").value;$("selMese").value=tr.dataset.m;
      document.querySelector('nav button[data-t="t1"]').click();caricaReport()}});
  });
}

var tutteSess=[];
function nomeSess(s){return s.tag==="(app)"?T("from_app"):(s.nome||"")}
function disegnaSessioni(){
  var f=$("selUt").value, t=row([th(T("c_start")),th(T("c_end")),th(T("c_card")),th(T("c_user")),th(T("c_kwh"),1),th(T("c_net"),1),th(TAXL,1),th(T("c_total"),1)]), k=0, n=0, ti=null, tv=null, tt=null;
  function som(a,b){return b===null?a:(a||0)+b}
  tutteSess.forEach(function(s){var nm=nomeSess(s);if(f&&nm!==f)return;k+=s.kwh;n++;ti=som(ti,s.imp);tv=som(tv,s.iva);tt=som(tt,s.tot);
    t+='<tr>'+td(D(s.inizio))+td(D(s.fine))+td(esc(s.tag==="(app)"?T("app_short"):s.tag))+'<td class="ut" style="cursor:pointer" data-u="'+esc(nm)+'">'+esc(nm)+'</td>'+td(nf(s.kwh),1)+td(nf(s.imp),1)+td(nf(s.iva),1)+td(nf(s.tot),1)+'</tr>'});
  function r2c(x){return x===null?null:Math.round(x*100)/100}
  t+=row([td(""),td(""),td(""),td(cnt(n)),td(nf(k),1),td(nf(r2c(ti)),1),td(nf(r2c(tv)),1),td(nf(r2c(tt)),1)],"t");
  $("tabX").innerHTML=t;
  document.querySelectorAll("#tabX td.ut").forEach(function(c){c.onclick=function(){$("selUt").value=c.dataset.u;disegnaSessioni()}});
}
function caricaSessioni(){
  return api("/api/sessioni").then(function(ss){
    if(!Array.isArray(ss))return;
    tutteSess=ss;var cur=$("selUt").value,nomi={};
    ss.forEach(function(s){var n=nomeSess(s);if(n)nomi[n]=1});
    $("selUt").innerHTML='<option value="">'+T("all_users")+'</option>'+Object.keys(nomi).sort().map(function(n){return '<option>'+esc(n)+'</option>'}).join("");
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
  if(p!==""&&(isNaN(+p)||+p<=0||+p>=5)){alert(T("alert_price"));return}
  if(isNaN(+i)||+i<0||+i>100){alert(T("alert_tax"));return}
  post("/api/prezzo",{anno:+$("selAnno").value,mese:+$("selMese").value,prezzo:p===""?null:+p,iva:+i,lang:LANG}).then(function(r){
    if(r.errore)alert(E(r));else esitoMail(r.mail);caricaReport()});
};
function esitoMail(m){
  if(!m||m==="no_recipients")return;
  $("esito").textContent=m==="sent"?T("rep_mailed"):T("rep_notmailed",{r:m==="not_configured"?T("mail_nc"):m});
}
$("bReinvia").onclick=function(){
  if(!rep||!confirm(T("rep_resend_c",{t:rep.titolo})))return;
  post("/api/reinvia",{anno:rep.anno,mese:rep.mese,lang:LANG}).then(function(r){
    if(r.errore){alert(E(r));return}
    if(r.mail==="no_recipients")alert(T("rep_notmailed",{r:T("rep_norec")}));else{esitoMail(r.mail);alert($("esito").textContent)}});
};

$("bScarica").onclick=function(){
  var b=$("bScarica");b.disabled=true;$("esito").textContent=T("dl_running");
  api("/api/scarica",{method:"POST"}).then(function(r){
    $("esito").textContent=r.ok?(T("dl_ok",{l:r.lette,n:r.nuove})+(r.scartate?T("dl_skipped",{s:r.scartate}):"")):T("dl_fail",{e:E(r)});
    b.disabled=false;tutto();
  }).catch(function(e){$("esito").textContent=T("err_net",{e:e});b.disabled=false});
};

$("bImporta").onclick=function(){$("fCsv").click()};
$("fCsv").onchange=function(){
  var files=Array.prototype.slice.call($("fCsv").files), out=[];
  (function next(){
    if(!files.length){$("esito").textContent=out.join(" | ");$("fCsv").value="";tutto();return}
    var f=files.shift();
    f.text().then(function(t){return post("/api/importa",{nome:f.name,csv:t})}).then(function(r){
      out.push(r.ok?T("imp_ok",{t:r.tessera,l:r.lette,n:r.nuove}):T("imp_fail",{f:f.name,e:E(r)}));next()});
  })();
};

function scarico(nome,testo){
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+testo],{type:"text/csv;charset=utf-8"}));
  a.download=nome;document.body.appendChild(a);a.click();a.remove();
}
function linea(a){return a.map(q).join(SEP)}
$("bStampa").onclick=function(){window.print()};
$("bCsv").onclick=function(){
  if(!rep)return;var r=rep,L=[];
  L.push(q(TITLE));L.push(q(T("rep_title",{t:r.titolo})));
  L.push(linea([T("price_lbl",{cur:CUR}),cn(r.prezzo,4),TAXL+" %",cn(r.iva_pct,1)]));L.push("");
  L.push(linea([T("c_card"),T("c_user"),T("c_sess"),T("c_kwh"),T("c_net"),TAXL,T("c_total")]));
  r.tessere.forEach(function(x){L.push(linea([x.tag,x.nome||T("unknown_card"),x.n,cn(x.kwh,3),cn(x.imp),cn(x.iva),cn(x.tot)]))});
  L.push(linea(["",T("tot_cards"),"",cn(r.kwh_tessere,3),cn(r.imp_tessere),cn(r.iva_tessere),cn(r.tot_tessere)]));L.push("");
  if(r.riservato){L.push(q(T("h_app")));L.push(linea([T("c_start"),T("c_end"),"",T("c_kwh"),T("c_net"),TAXL,T("c_total")]));
  r.app.forEach(function(x){L.push(linea([D(x.inizio),D(x.fine),"",cn(x.kwh,3),cn(x.imp),cn(x.iva),cn(x.tot)]))});
  L.push(linea(["",T("tot_app"),"",cn(r.kwh_app,3),cn(r.imp_app),cn(r.iva_app),cn(r.tot_app)]));L.push("")}
  L.push(linea(["","TOTAL","",cn(r.kwh_tot,3),cn(r.imp_tot),cn(r.iva_tot),cn(r.eur_tot)]));
  scarico("charging_"+r.anno+"-"+("0"+r.mese).slice(-2)+".csv",L.join("\r\n"));
};
$("bCsvAnno").onclick=function(){
  var R=righeAnno.length&&righeAnno[0].riservato,L=[q(TITLE),q(T("n_year")+" "+$("selAnnoS").value)];
  L.push(linea([T("c_month"),T("c_sess"),T("c_kwh_cards"),R?T("c_kwh_app"):"",T("c_kwh_tot"),T("price_lbl",{cur:CUR}),TAXL+" %",T("c_net"),TAXL,T("c_total")]));
  righeAnno.forEach(function(x){L.push(linea([MESI[x.mese-1],x.sessioni,cn(x.kwh_tessere,3),R?cn(x.kwh_app,3):"",cn(x.kwh_tot,3),cn(x.prezzo,4),x.prezzo===null?"-":cn(x.iva_pct,1),cn(x.imp_tot),cn(x.iva_tot),cn(x.eur_tot)]))});
  scarico("history_"+$("selAnnoS").value+".csv",L.join("\r\n"));
};

function caricaMie(){
  return api("/api/mie?anno="+$("selAnnoM").value).then(function(L){
    if(!Array.isArray(L))return;
    var t=row([th(T("c_month")),th(T("c_charges_n"),1),th(T("c_kwh"),1),th(CUR+"/kWh",1),th(T("c_net"),1),th(TAXL,1),th(T("c_total"),1)]),k=0,e=0,ok=false;
    L.forEach(function(x){k+=x.kwh;if(x.tot!==null){e+=x.tot;ok=true}
      t+='<tr class="ut" data-m="'+x.mese+'">'+td(MESI[x.mese-1])+td(x.n,1)+td(nf(x.kwh),1)+td(x.prezzo===null?"-":nf(x.prezzo,4),1)+td(nf(x.imp),1)+td(nf(x.iva),1)+td(nf(x.tot),1)+"</tr>"});
    $("tabM").innerHTML=t;
    $("totM").textContent=ok?T("tot_year",{y:$("selAnnoM").value,k:nf(k),e:nf(Math.round(e*100)/100)+" "+CUR,tax:TAXL}):T("tot_year_kwh",{y:$("selAnnoM").value,k:nf(k)});
    document.querySelectorAll("#tabM tr.ut").forEach(function(tr){tr.onclick=function(){
      var nx=tr.nextElementSibling;
      if(nx&&nx.classList.contains("det")){while(tr.nextElementSibling&&tr.nextElementSibling.classList.contains("det"))tr.nextElementSibling.remove();return}
      var x=L[+tr.dataset.m-1],h="";
      x.sess.forEach(function(s){h+='<tr class="det"><td>'+D(s.inizio)+" &rarr; "+D(s.fine)+'</td><td></td><td class="n">'+nf(s.kwh)+'</td><td></td><td class="n">'+nf(s.imp)+'</td><td class="n">'+nf(s.iva)+'</td><td class="n">'+nf(s.tot)+'</td></tr>'});
      tr.insertAdjacentHTML("afterend",h)}});
  });
}
$("selAnnoM").onchange=caricaMie;
$("bPdfM").onclick=function(){
  var a=document.createElement("a");a.href="/api/mie.pdf?anno="+$("selAnnoM").value+"&mese="+$("selMeseM").value+"&lang="+LANG;
  a.download="";document.body.appendChild(a);a.click();a.remove();
};

function permForm(){var p={};document.querySelectorAll("#uPerm input").forEach(function(c){p[c.dataset.p]=c.checked});return p}
function setPermForm(p){document.querySelectorAll("#uPerm input").forEach(function(c){c.checked=!!p[c.dataset.p]})}
setPermForm({report:1,storico:1,sessioni:1,stampa:1});
function tipoUI(){var c=$("uTipo").value==="c";$("uTessBox").classList.toggle("hide",!c);$("uPerm").classList.toggle("hide",c)}
$("uTipo").onchange=tipoUI;
function caricaTessere(){
  return api("/api/tessere").then(function(L){
    if(!Array.isArray(L))return;var cur=$("uTess").value;
    $("uTess").innerHTML='<option value="">'+T("u_pick_card")+'</option>'+L.map(function(x){return '<option value="'+esc(x.tag)+'">'+esc(x.tag)+' - '+esc(x.nome)+'</option>'}).join("");
    $("uTess").value=cur;
  });
}
function invia(email,perm,tess){
  $("uEsito").textContent="";$("uLink").classList.add("hide");
  return post("/api/utenti",{azione:"invita",nome:email,permessi:perm,tessera:tess||"",lang:LANG}).then(function(r){
    if(r.errore){$("uEsito").textContent=E(r);return}
    if(r.mail==="sent")$("uEsito").textContent=T("inv_sent",{e:email});
    else{$("uEsito").textContent=T("inv_notsent",{r:r.mail==="not_configured"?T("mail_nc"):r.mail});$("uLink").value=r.link;$("uLink").classList.remove("hide")}
    $("uNome").value="";caricaUtenti();
  });
}
function caricaUtenti(){
  return api("/api/utenti").then(function(L){
    if(!Array.isArray(L))return;
    caricaTessere();
    var t=row([th(T("c_user")),th(T("c_state")),th(T("c_perm")),th("")]);
    L.forEach(function(x){
      var adm=x.ruolo==="admin";
      var st=adm?T("u_admin"):(x.attivo?T("u_active"):(x.invito_scaduto?T("u_expired"):T("u_pending")));
      var pe=adm?T("u_all"):x.tessera?(x.tessera+" - "+(x.tessera_nome||"")):Object.keys(x.perm).filter(function(k){return x.perm[k]}).map(function(k){return T("pe_"+k)}).join(", ")||T("u_none");
      var az=adm?"":'<button class="bm" data-m="'+esc(x.nome)+'">'+T("u_edit")+'</button> <button class="br" data-m="'+esc(x.nome)+'" title="'+(x.attivo?T("u_reset_t"):T("u_resend_t"))+'">'+(x.attivo?T("u_reset"):T("u_resend"))+'</button> <button class="bd" data-d="'+esc(x.nome)+'">'+T("u_delete")+'</button>';
      t+=row([td(esc(x.nome)),td(st),td(esc(pe)),'<td class="n">'+az+"</td>"]);
    });
    $("tabU").innerHTML=t;
    var per={};L.forEach(function(x){per[x.nome]=x});
    document.querySelectorAll("#tabU .bm").forEach(function(b){b.onclick=function(){var x=per[b.dataset.m];$("uNome").value=x.nome;setPermForm(x.perm);$("uTipo").value=x.tessera?"c":"g";tipoUI();$("uTess").value=x.tessera||"";$("uNome").focus()}});
    document.querySelectorAll("#tabU .br").forEach(function(b){b.onclick=function(){
      if(confirm(T("u_confirm_send",{u:b.dataset.m})))invia(b.dataset.m,per[b.dataset.m].perm,per[b.dataset.m].tessera)}});
    document.querySelectorAll("#tabU .bd").forEach(function(b){b.onclick=function(){
      if(!confirm(T("u_confirm_del",{u:b.dataset.d})))return;
      post("/api/utenti",{azione:"elimina",nome:b.dataset.d}).then(function(r){$("uEsito").textContent=r.errore?E(r):"";caricaUtenti()})}});
  });
}
function datiForm(){
  var c=$("uTipo").value==="c";
  if(c&&!$("uTess").value){$("uEsito").textContent=T("u_pick");return null}
  return {perm:c?{}:permForm(),tess:c?$("uTess").value:""};
}
$("bUInvita").onclick=function(){var d=datiForm();if(d)invia($("uNome").value,d.perm,d.tess)};
$("bUPerm").onclick=function(){
  var d=datiForm();if(!d)return;
  post("/api/utenti",{azione:"permessi",nome:$("uNome").value,permessi:d.perm,tessera:d.tess}).then(function(r){
    $("uEsito").textContent=r.errore?E(r):T("u_saved");caricaUtenti()});
};

/* ---- settings (admin) ---- */
var CF_TXT=["url","user","header_name","header_value","history_path","tags_path","timeout","hist_json_field","hist_sep","hist_skip","c_start","c_end","c_tag","c_type","c_cont_ini","c_cont_fin","tags_sep","tags_skip","tags_c_tag","tags_c_name","title","tz","currency","tax_label","mail_from","report_to","report_cc"];
function formCfg(c){
  CF_TXT.forEach(function(k){var e=$("cf_"+k);if(e)e.value=c[k]===undefined||c[k]===null?"":c[k]});
  $("cf_auto").checked=!!c.auto;$("cf_password").value="";$("cf_pw_clear").checked=false;
  $("cf_password").placeholder=c.password_set?T("s_pass_set"):"";
  $("cf_resend_key").value="";$("cf_rk_clear").checked=false;$("cf_resend_key").placeholder=c.resend_set?T("s_pass_set"):"re_...";
}
function leggiCfg(){
  var o={};CF_TXT.forEach(function(k){var e=$("cf_"+k);if(e)o[k]=e.value});
  o.auto=$("cf_auto").checked;
  if($("cf_pw_clear").checked)o.password="";else if($("cf_password").value!=="")o.password=$("cf_password").value;else o.password=null;
  if($("cf_rk_clear").checked)o.resend_key="";else if($("cf_resend_key").value!=="")o.resend_key=$("cf_resend_key").value;else o.resend_key=null;
  return o;
}
function caricaConfig(){
  return api("/api/config").then(function(r){
    if(!r.config)return;cfg=r;formCfg(r.config);
    $("envUrl").textContent=r.fonti.url_env?T("s_env_url"):"";
  });
}
$("bCfSalva").onclick=function(){
  $("cfEsito").textContent="";
  post("/api/config",leggiCfg()).then(function(r){
    if(r.errore){$("cfEsito").className="sub err";$("cfEsito").textContent=E(r);return}
    $("cfEsito").className="sub ok";$("cfEsito").textContent=T("s_saved");caricaConfig();
    api("/api/me").then(function(m){io=m;CUR=m.valuta||"€";TAXL=m.tax_label||T("tax_default");TITLE=m.titolo;etichette()});
  });
};
$("bCfReset").onclick=function(){if(cfg){var d=cfg.defaults;d.password_set=false;formCfg(d);$("cf_url").value=cfg.config.url;$("cf_pw_clear").checked=false}};
$("bCfProva").onclick=function(){
  $("cfProva").innerHTML='<div class="sub">'+T("s_testing")+'</div>';$("cfEsito").textContent="";
  post("/api/config/test",leggiCfg()).then(function(r){
    if(r.errore){$("cfProva").innerHTML="";$("cfEsito").className="sub err";$("cfEsito").textContent=E(r);return}
    $("cfProva").innerHTML=bloccoProva(T("s_t_hist"),r.history)+(r.tags?bloccoProva(T("s_t_tags"),r.tags):"");
  }).catch(function(e){$("cfProva").innerHTML="";$("cfEsito").textContent=T("err_net",{e:e})});
};

$("bEsci").onclick=function(){post("/api/logout",{}).then(function(){location.reload()})};
$("bPw").onclick=function(){$("boxPw").classList.toggle("hide")};
$("bPwOk").onclick=function(){
  if($("pwNew").value!==$("pwNew2").value){$("pwEsito").textContent=T("pw_mismatch");return}
  post("/api/miapassword",{vecchia:$("pwOld").value,nuova:$("pwNew").value,ripeti:$("pwNew2").value}).then(function(r){
    $("pwEsito").textContent=r.errore?E(r):T("pw_changed");if(r.ok){$("pwOld").value="";$("pwNew").value="";$("pwNew2").value=""}});
};
api("/api/me").then(function(m){
  io=m;var P=m.perm;CUR=m.valuta||"€";TAXL=m.tax_label||T("tax_default");TITLE=m.titolo;etichette();
  $("chi").innerHTML=esc(m.nome)+(m.ruolo==="admin"&&m.nome!=="admin"?' <span class="pill">admin</span>':"");
  if(m.tessera){
    document.querySelectorAll("nav button").forEach(function(b){b.classList.add("hide")});
    $("navM").classList.remove("hide");$("bScarica").classList.add("hide");$("bImporta").classList.add("hide");$("stato").classList.add("hide");
    $("mieTit").textContent=T("my_title")+(m.tessera.nome?" - "+m.tessera.nome+" ("+m.tessera.tag+")":"");
    $("navM").click();return;
  }
  if(m.ruolo==="admin"){$("navUt").classList.remove("hide");$("navSet").classList.remove("hide")}
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
</html>
`;

export const LOGIN = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--err:#b00020}
@media (prefers-color-scheme:dark){:root{--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--err:#ff7a8a}}
*{box-sizing:border-box}
body{margin:0;font:15px/1.4 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);display:flex;min-height:100vh;align-items:center;justify-content:center}
form{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:24px;width:min(360px,92vw);display:flex;flex-direction:column;gap:10px}
h1{font-size:18px;margin:0 0 2px}.sub{color:var(--mut);font-size:13px}
input,button,select{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx)}
button{background:var(--acc);border-color:var(--acc);color:#fff;cursor:pointer}
.err{color:var(--err);min-height:1.2em;font-size:13px}
#lang{align-self:flex-end;padding:3px 6px;font-size:13px}
</style>
</head>
<body>
<form id="f">
  <select id="lang" title="Language"></select>
  <h1>__TITLE__</h1>
  <div class="sub" data-i="login_h"></div>
  <input id="n" data-ph="login_user" autocomplete="username" autocapitalize="none" required>
  <input id="p" type="password" data-ph="login_pass" autocomplete="current-password" required>
  <button type="submit" data-i="login_btn"></button>
  <div class="err" id="e"></div>
</form>
<script>
__I18N__
applyI18n();
document.title=document.title+" - "+T("login_title");
document.getElementById("f").onsubmit=function(ev){
  ev.preventDefault();
  fetch("/api/login",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({nome:document.getElementById("n").value,password:document.getElementById("p").value})})
  .then(function(r){return r.json()}).then(function(r){
    if(r.ok)location.reload();else document.getElementById("e").textContent=E(r)})
  .catch(function(){document.getElementById("e").textContent=T("e_network")});
};
</script>
</body>
</html>`;

export const INVITO = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--err:#b00020}
@media (prefers-color-scheme:dark){:root{--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--err:#ff7a8a}}
*{box-sizing:border-box}
body{margin:0;font:15px/1.4 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);display:flex;min-height:100vh;align-items:center;justify-content:center}
form{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:24px;width:min(360px,92vw);display:flex;flex-direction:column;gap:10px}
h1{font-size:18px;margin:0 0 2px}.sub{color:var(--mut);font-size:13px}
input,button,select{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx)}
button{background:var(--acc);border-color:var(--acc);color:#fff;cursor:pointer}
.err{color:var(--err);min-height:1.2em;font-size:13px}
#lang{align-self:flex-end;padding:3px 6px;font-size:13px}
</style>
</head>
<body>
<form id="f">
  <select id="lang" title="Language"></select>
  <div class="sub">__TITLE__</div>
  <h1 data-i="inv_h"></h1>
  <div class="sub" id="chi"></div>
  <input id="p1" type="password" data-ph="inv_p1" autocomplete="new-password" required>
  <input id="p2" type="password" data-ph="inv_p2" autocomplete="new-password" required>
  <button type="submit" data-i="inv_btn"></button>
  <div class="err" id="e"></div>
</form>
<script>
__I18N__
applyI18n();
document.title=document.title+" - "+T("inv_title");
var q=new URLSearchParams(location.search),mail=q.get("e")||"",tok=q.get("invito")||"";
document.getElementById("chi").textContent=T("inv_user",{m:mail});
document.getElementById("f").onsubmit=function(ev){
  ev.preventDefault();
  var a=document.getElementById("p1").value,b=document.getElementById("p2").value,e=document.getElementById("e");
  if(a!==b){e.textContent=T("pw_mismatch");return}
  fetch("/api/invito",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({nome:mail,token:tok,password:a})})
  .then(function(r){return r.json()}).then(function(r){
    if(r.ok)location.href="/";else e.textContent=E(r)})
  .catch(function(){e.textContent=T("e_network")});
};
</script>
</body>
</html>`;

export const SETUP = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Orbis Charge Report</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--err:#b00020}
@media (prefers-color-scheme:dark){:root{--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--err:#ff7a8a}}
*{box-sizing:border-box}
body{margin:0;font:15px/1.4 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
main{max-width:820px;margin:0 auto;padding:16px}
h1{font-size:20px;margin:8px 0}h2{font-size:15px;margin:0 0 8px}
.sub{color:var(--mut);font-size:13px}.err{color:var(--err)}.ok{color:var(--acc)}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;margin:12px 0}
button,select,input{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--tx)}
button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}button:disabled{opacity:.5}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px 14px}
.fg label{display:flex;flex-direction:column;gap:3px;font-size:13px;color:var(--mut)}
.fg input,.fg select{width:100%;color:var(--tx);font-size:15px}.fg .wide{grid-column:1/-1}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
pre{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px;overflow:auto;white-space:pre-wrap;word-break:break-all;font-size:12px;margin:6px 0}
#lang{float:right;padding:3px 6px;font-size:13px}
</style>
</head>
<body>
<main>
<select id="lang" title="Language"></select>
<h1 data-i="setup_h"></h1>
<div class="sub" data-i="setup_intro"></div>
<div class="sub err" data-i="setup_sec"></div>

<div class="card" id="boxCode" style="display:none">
  <div class="fg"><label class="wide"><span data-i="setup_code"></span><input id="s_code" type="password" autocomplete="off"><span class="sub" data-i="setup_code_h"></span></label></div>
</div>

<div class="card">
  <div class="fg">
    <label><span data-i="setup_admin"></span><input id="s_nome" value="admin" autocomplete="username" autocapitalize="none"></label>
    <label><span data-i="setup_pass"></span><input id="s_p1" type="password" autocomplete="new-password"></label>
    <label><span data-i="setup_pass2"></span><input id="s_p2" type="password" autocomplete="new-password"></label>
  </div>
</div>

<div class="card">
  <h2 data-i="s_conn"></h2>
  <div class="fg">
    <label class="wide"><span data-i="s_url"></span><input id="cf_url" placeholder="http://charger.example.com" autocomplete="off"><span class="sub" data-i="s_url_h"></span></label>
    <label><span data-i="s_user"></span><input id="cf_user" autocomplete="off"></label>
    <label><span data-i="s_pass"></span><input id="cf_password" type="password" autocomplete="new-password"></label>
    <label><span data-i="s_hname"></span><input id="cf_header_name" autocomplete="off"></label>
    <label><span data-i="s_hval"></span><input id="cf_header_value" autocomplete="off"></label>
    <label class="wide"><span data-i="s_hist"></span><input id="cf_history_path" value="/modules/modulator/historic?from=0&to=-1"></label>
    <label class="wide"><span data-i="s_tags"></span><input id="cf_tags_path" value="/modules/tags?level=file"></label>
  </div>
  <div class="bar"><button id="bProva" data-i="s_test"></button></div>
  <div id="prova"></div>
</div>

<div class="card">
  <h2 data-i="s_gen"></h2>
  <div class="fg">
    <label class="wide"><span data-i="s_title"></span><input id="cf_title" value="EV Charger"></label>
    <label><span data-i="s_tz"></span><input id="cf_tz" value="Europe/Rome"></label>
    <label><span data-i="s_cur"></span><input id="cf_currency" value="&euro;" size="4"></label>
    <span class="sub wide" data-i="s_tz_h"></span>
  </div>
</div>

<div class="card">
  <h2 data-i="s_email"></h2>
  <div class="sub" data-i="s_email_h"></div>
  <div class="fg" style="margin-top:8px">
    <label><span data-i="s_rkey"></span><input id="cf_resend_key" type="password" autocomplete="new-password" placeholder="re_..."></label>
    <label class="wide"><span data-i="s_mfrom"></span><input id="cf_mail_from" autocomplete="off"></label>
  </div>
</div>

<div class="bar"><button class="p" id="bFine" data-i="setup_btn"></button></div>
<div class="sub err" id="esito"></div>
</main>
<script>
__I18N__
applyI18n();
document.title=document.title+" - "+T("setup_title");
function $(i){return document.getElementById(i)}
var IDS=["url","user","password","header_name","header_value","history_path","tags_path","title","tz","currency","resend_key","mail_from"];
fetch("/api/setup").then(function(r){return r.json()}).then(function(r){if(r.code_required)$("boxCode").style.display="block";if(r.done)location.href="/"});
function dati(){var o={};IDS.forEach(function(k){o[k]=$("cf_"+k).value});o.code=$("s_code").value;return o}
$("bProva").onclick=function(){
  $("prova").innerHTML='<div class="sub">'+T("s_testing")+'</div>';$("esito").textContent="";
  fetch("/api/setup/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(dati())}).then(function(r){return r.json()}).then(function(r){
    if(r.errore){$("prova").innerHTML="";$("esito").textContent=E(r);return}
    $("prova").innerHTML=bloccoProva(T("s_t_hist"),r.history)+(r.tags?bloccoProva(T("s_t_tags"),r.tags):"");
  }).catch(function(){$("prova").innerHTML="";$("esito").textContent=T("e_network")});
};
$("bFine").onclick=function(){
  $("esito").textContent="";
  if($("s_p1").value!==$("s_p2").value){$("esito").textContent=T("pw_mismatch");return}
  var o=dati();o.nome=$("s_nome").value;o.password_admin=$("s_p1").value;
  $("bFine").disabled=true;
  fetch("/api/setup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(o)}).then(function(r){return r.json()}).then(function(r){
    if(r.ok)location.href="/";else{$("esito").textContent=E(r);$("bFine").disabled=false}
  }).catch(function(){$("esito").textContent=T("e_network");$("bFine").disabled=false});
};
</script>
</body>
</html>`;

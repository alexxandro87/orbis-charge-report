// SPDX-License-Identifier: AGPL-3.0-or-later
// Charges archive viewer: a single HTML file that opens the encrypted extraction (archivio_*.enc) in any browser,
// offline. It decrypts with the passphrase (PBKDF2 + AES-GCM, like the backup), recomputes monthly reports and the
// yearly history per card like the site (month price and VAT, cent splitting) and exports to CSV.
// No backticks nor ${ in the page code: the string is a template literal.
export const ARCHIVIO_HTML = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Archivio ricariche</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb}
@media (prefers-color-scheme:dark){:root{--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff}}
*{box-sizing:border-box}body{margin:0;padding:16px;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:0 0 10px}.sub{color:var(--mut);font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 14px}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0}label{display:flex;gap:6px;align-items:center;font-size:14px}
input,select,button{font:inherit;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--tx)}
button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
th.n,td.n{text-align:right}tr.m{cursor:pointer}tr.m:hover{background:rgba(127,127,127,.08)}tr.on{background:rgba(11,107,203,.12)}
.w{overflow:auto}.err{color:#c0392b}.hide{display:none}.top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
@media (max-width:700px){body{padding:10px}th,td{padding:5px 6px;font-size:13px}}
</style>
</head>
<body>
<div class="top"><h1 id="tit">Archivio ricariche</h1><div><button id="bLang">English</button></div></div>
<div class="card" id="cApri">
  <h2 data-t="Apri l'archivio">Apri l'archivio</h2>
  <div class="bar"><label><span data-t="File">File</span> <input type="file" id="file" accept=".enc"></label> <label><span data-t="Passphrase">Passphrase</span> <input type="password" id="pw" autocomplete="off"></label> <label><input type="checkbox" id="vedi"> <span data-t="mostra">mostra</span></label> <button class="p" id="bApri" data-t="Apri">Apri</button> <span class="sub err" id="esito"></span></div>
  <div class="sub" data-t="Tutto avviene in questa pagina, senza connessione: il file non viene inviato da nessuna parte. Senza la passphrase l'archivio non si apre.">Tutto avviene in questa pagina, senza connessione: il file non viene inviato da nessuna parte. Senza la passphrase l'archivio non si apre.</div>
</div>
<div id="vista" class="hide">
  <div class="card">
    <div class="top"><h2 id="intest"></h2><div class="bar"><label><span data-t="Anno">Anno</span> <select id="anno"></select></label> <button id="bCsv" data-t="Scarica CSV">Scarica CSV</button></div></div>
    <div class="sub" id="info"></div>
    <div class="w"><table id="tabA"></table></div>
    <div class="sub" data-t="Tocca un mese per vedere le tessere e le singole ricariche.">Tocca un mese per vedere le tessere e le singole ricariche.</div>
  </div>
  <div class="card hide" id="cMese">
    <h2 id="titMese"></h2>
    <div class="w"><table id="tabM"></table></div>
    <div class="w" id="wApp"><h2 data-t="Ricariche avviate da app (non attribuite a una tessera)" style="margin-top:12px">Ricariche avviate da app (non attribuite a una tessera)</h2><table id="tabApp"></table></div>
    <div class="w"><h2 data-t="Singole ricariche" style="margin-top:12px">Singole ricariche</h2><table id="tabS"></table></div>
  </div>
</div>
<script>
var LANG="it",A=null,REP={},ANNO=null,MESE=null;
var D={"Apri l'archivio":"Open the archive","File":"File","Passphrase":"Passphrase","Apri":"Open","Anno":"Year","Scarica CSV":"Download CSV",
"Tutto avviene in questa pagina, senza connessione: il file non viene inviato da nessuna parte. Senza la passphrase l'archivio non si apre.":"Everything happens in this page, offline: the file is not sent anywhere. Without the passphrase the archive cannot be opened.",
"Tocca un mese per vedere le tessere e le singole ricariche.":"Tap a month to see the cards and the single charges.","Ricariche avviate da app (non attribuite a una tessera)":"Charges started from the app (not attributed to a card)","Singole ricariche":"Single charges",
"Mese":"Month","Ricariche":"Charges","kWh tessere":"Card kWh","kWh app":"App kWh","kWh":"kWh","€/kWh":"€/kWh","IVA %":"VAT %","Imponibile":"Net","IVA":"VAT","Totale":"Total","Tessera":"Card","Nome":"Name","Inizio":"Start","Fine":"End","Totale anno":"Year total",
"Scegli il file e scrivi la passphrase":"Choose the file and type the passphrase","Passphrase sbagliata o file danneggiato":"Wrong passphrase or damaged file","mostra":"show","Non riesco a leggere il file: estrai lo zip in una cartella e scegli il file da lì":"Cannot read the file: extract the zip into a folder and choose the file from there","Questo browser non permette di decifrare da un file locale: prova con Chrome, Edge o Firefox aggiornati":"This browser does not allow decrypting from a local file: try an up-to-date Chrome, Edge or Firefox","Questo file non è un archivio delle ricariche":"This file is not a charges archive","Archivio ricariche":"Charges archive",
"(tessera non in elenco)":"(card not in the list)","Periodo":"Period","generato il":"generated on","sessioni":"sessions","Il prezzo del mese non è stato inserito: importi non disponibili":"The month price was not entered: amounts not available","Italiano":"Italiano","English":"English"};
var MESI={it:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],en:["January","February","March","April","May","June","July","August","September","October","November","December"]};
function T(s){return LANG==="en"&&D[s]!==undefined?D[s]:s}
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function num(x,d){if(x===null||x===undefined)return "-";return x.toLocaleString(LANG==="en"?"en-GB":"it-IT",{minimumFractionDigits:d,maximumFractionDigits:d})}
function trDom(){document.querySelectorAll("[data-t]").forEach(function(e){e.textContent=T(e.getAttribute("data-t"))});document.documentElement.lang=LANG;$("bLang").textContent=LANG==="en"?"Italiano":"English";$("tit").textContent=T("Archivio ricariche")}
$("bLang").onclick=function(){LANG=LANG==="en"?"it":"en";trDom();if(A)disegna()};
// ---------- cifratura: ARC1 + salt(16) + iv(12) + AES-GCM(PBKDF2 600000, SHA-256)
function decifra(buf,pw){
  var u=new Uint8Array(buf),enc=new TextEncoder();
  if(u.length<33||String.fromCharCode(u[0],u[1],u[2],u[3])!=="ARC1")return Promise.reject(new Error("formato"));
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error("crypto"));
  var salt=u.slice(4,20),iv=u.slice(20,32),ct=u.slice(32);
  return crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveKey"]).then(function(km){
    return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:600000,hash:"SHA-256"},km,{name:"AES-GCM",length:256},false,["decrypt"])})
  .then(function(k){return crypto.subtle.decrypt({name:"AES-GCM",iv:iv},k,ct)}).then(function(p){return JSON.parse(new TextDecoder().decode(p))});
}
$("bApri").onclick=function(){
  var f=$("file").files[0],pw=$("pw").value,e=$("esito");e.textContent="";
  if(!f||!pw){e.textContent=T("Scegli il file e scrivi la passphrase");return}
  if(!(window.crypto&&crypto.subtle)){e.textContent=T("Questo browser non permette di decifrare da un file locale: prova con Chrome, Edge o Firefox aggiornati");return}
  e.textContent="...";
  f.arrayBuffer().catch(function(){throw new Error("lettura")}).then(function(b){return decifra(b,pw)}).then(function(j){
    if(!j||j.versione!==1||!Array.isArray(j.sessioni))throw new Error("formato");
    A=j;calcola();e.textContent="";$("cApri").classList.add("hide");$("vista").classList.remove("hide");disegna();
  }).catch(function(x){var m=x&&x.message;
    e.textContent=m==="formato"?T("Questo file non è un archivio delle ricariche"):m==="lettura"?T("Non riesco a leggere il file: estrai lo zip in una cartella e scegli il file da lì")
      :T("Passphrase sbagliata o file danneggiato")+(x&&x.name&&x.name!=="OperationError"?" ("+x.name+(m?": "+m:"")+")":"")});
};
$("vedi").onchange=function(){$("pw").type=this.checked?"text":"password"};
// ---------- calcolo: stesse regole del sito (nome della tessera al momento della ricarica, prezzo e IVA del mese, centesimi ripartiti)
function r2(x){return Math.round(x*100+1e-7)/100}
function euro(kwh,pr){return pr==null?null:r2(kwh*pr)}
function iva(imp,pct){return imp==null?null:r2(imp*pct/100)}
function ripartisci(tot,pesi){if(!pesi.length)return[];var S=pesi.reduce(function(a,b){return a+b},0);
  if(S<=0){var q=Math.floor(tot/pesi.length),o=pesi.map(function(){return q});o[0]+=tot-q*pesi.length;return o}
  var quote=pesi.map(function(p){return tot*p/S}),base=quote.map(Math.floor),resto=tot-base.reduce(function(a,b){return a+b},0);
  var ord=quote.map(function(x,i){return {i:i,f:x-Math.floor(x)}}).sort(function(a,b){return b.f-a.f});for(var k=0;k<resto;k++)base[ord[k].i]++;return base}
function costi(whs,pr,pct,perSess){if(pr==null)return whs.map(function(){return {imp:null,iva:null,tot:null}});
  var impC=perSess?whs.map(function(w){return Math.round(euro(w/1000,pr)*100)}):ripartisci(Math.round(euro(whs.reduce(function(a,b){return a+b},0)/1000,pr)*100),whs);
  var tot=impC.reduce(function(a,b){return a+b},0),ivaC=ripartisci(Math.round(iva(tot/100,pct)*100),impC);
  return impC.map(function(c,i){return {imp:c/100,iva:ivaC[i]/100,tot:(c+ivaC[i])/100}})}
function parti(e){var p=new Intl.DateTimeFormat("en-US",{timeZone:A.tz||"Europe/Rome",hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e*1000)),o={};p.forEach(function(x){o[x.type]=x.value});return o}
function fmt(e){var o=parti(e);return ("0"+o.day).slice(-2)+"/"+("0"+o.month).slice(-2)+"/"+o.year+" "+("0"+o.hour).slice(-2)+":"+("0"+o.minute).slice(-2)}
function nomeAl(tag,t){var a=A.nomi.filter(function(x){return x.tag===tag}).sort(function(x,y){return x.dal-y.dal});if(!a.length){var z=A.tessere.filter(function(x){return x.tag===tag})[0];return z?z.nome:undefined}
  var r=a[0];a.forEach(function(x){if(x.dal<=t)r=x});return r.al!=null&&t>=r.al?undefined:r.nome}
function calcola(){
  REP={};var pre=A.escludi_prepagate?(A.prepagate||[]):[];
  A.sessioni.forEach(function(s){
    var ini=s[0],fin=s[1],tag=s[2]||"",tipo=s[3]||"",wh=s[4]||0;
    if(pre.some(function(p){return p.tag===tag&&ini*1000>=p.dal}))return;
    var o=parti(ini),k=o.year+"-"+("0"+o.month).slice(-2),m=REP[k]||(REP[k]={anno:+o.year,mese:+o.month,perTag:{},app:[]});
    if(tag===""||tipo==="app")m.app.push({inizio:ini,fine:fin,wh:wh});
    else{var nome=nomeAl(tag,ini)||T("(tessera non in elenco)"),d=m.perTag[tag+"|"+nome]||(m.perTag[tag+"|"+nome]={tag:tag,nome:nome,n:0,wh:0,sess:[]});d.sess.push({inizio:ini,fine:fin,wh:wh});d.n++;d.wh+=wh}
  });
  Object.keys(REP).forEach(function(k){var m=REP[k],pr=A.prezzi.filter(function(p){return p.anno===m.anno&&p.mese===m.mese})[0]||null;
    m.prezzo=pr?pr.eur_kwh:null;m.iva_pct=pr?pr.iva:null;var pct=m.iva_pct||0;
    m.tessere=Object.keys(m.perTag).map(function(x){return m.perTag[x]}).sort(function(a,b){return a.nome.toUpperCase().localeCompare(b.nome.toUpperCase())}).map(function(d){
      var kwh=d.wh/1000,imp=euro(kwh,m.prezzo),iv=iva(imp,pct),c=costi(d.sess.map(function(x){return x.wh}),m.prezzo,pct,false);
      d.sess.forEach(function(x,i){x.imp=c[i].imp;x.iva=c[i].iva;x.tot=c[i].tot});
      return {tag:d.tag,nome:d.nome,n:d.n,sess:d.sess,kwh:kwh,imp:imp,iva:iv,tot:imp==null?null:r2(imp+iv)}});
    var ca=costi(m.app.map(function(x){return x.wh}),m.prezzo,pct,true);m.app.forEach(function(x,i){x.kwh=x.wh/1000;x.imp=ca[i].imp;x.iva=ca[i].iva;x.tot=ca[i].tot});
    var ok=m.prezzo!=null,som=function(arr,f){return arr.reduce(function(s,x){return s+(x[f]||0)},0)};
    m.kwh_t=som(m.tessere,"kwh");m.kwh_a=som(m.app,"kwh");m.imp_t=ok?r2(som(m.tessere,"imp")):null;m.iva_t=ok?r2(som(m.tessere,"iva")):null;
    m.imp_a=ok?r2(som(m.app,"imp")):null;m.iva_a=iva(m.imp_a,pct);m.n=som(m.tessere,"n")+m.app.length;
    m.imp=ok?r2(m.imp_t+m.imp_a):null;m.iva=ok?r2(m.iva_t+m.iva_a):null;m.tot=ok?r2(m.imp+m.iva):null});
}
function th(v,n){return "<th"+(n?' class="n"':"")+">"+v+"</th>"}function td(v,n){return "<td"+(n?' class="n"':"")+">"+v+"</td>"}
function disegna(){
  var anni=[];Object.keys(REP).forEach(function(k){var y=REP[k].anno;if(anni.indexOf(y)<0)anni.push(y)});anni.sort();
  if(!anni.length){anni=[new Date().getFullYear()]}
  if(ANNO===null||anni.indexOf(ANNO)<0)ANNO=anni[anni.length-1];
  $("anno").innerHTML=anni.map(function(y){return '<option value="'+y+'"'+(y===ANNO?" selected":"")+">"+y+"</option>"}).join("");
  $("intest").textContent=(A.titolo||T("Archivio ricariche"))+" · "+ANNO;
  $("info").textContent=T("Periodo")+" "+A.da+" → "+A.a+" · "+A.sessioni.length+" "+T("sessioni")+" · "+T("generato il")+" "+(A.generato?new Date(A.generato).toLocaleString(LANG==="en"?"en-GB":"it-IT"):"-");
  var h="<tr>"+th(T("Mese"))+th(T("Ricariche"),1)+th(T("kWh tessere"),1)+th(T("kWh app"),1)+th(T("€/kWh"),1)+th(T("IVA %"),1)+th(T("Imponibile"),1)+th(T("IVA"),1)+th(T("Totale"),1)+"</tr>",tot={n:0,kt:0,ka:0,imp:0,iva:0,t:0,ok:false};
  for(var mm=1;mm<=12;mm++){var k=ANNO+"-"+("0"+mm).slice(-2),m=REP[k];
    h+='<tr class="m'+(MESE===k?" on":"")+'" data-k="'+k+'">'+td(MESI[LANG][mm-1])+td(m?m.n:0,1)+td(num(m?m.kwh_t:0,2),1)+td(num(m?m.kwh_a:0,2),1)+td(m&&m.prezzo!=null?num(m.prezzo,4):"-",1)+td(m&&m.iva_pct!=null?num(m.iva_pct,0):"-",1)+td(num(m?m.imp:null,2),1)+td(num(m?m.iva:null,2),1)+td(num(m?m.tot:null,2),1)+"</tr>";
    if(m){tot.n+=m.n;tot.kt+=m.kwh_t;tot.ka+=m.kwh_a;if(m.tot!=null){tot.imp+=m.imp;tot.iva+=m.iva;tot.t+=m.tot;tot.ok=true}}}
  h+="<tr><th>"+T("Totale anno")+"</th>"+th(tot.n,1)+th(num(tot.kt,2),1)+th(num(tot.ka,2),1)+th("",1)+th("",1)+th(tot.ok?num(r2(tot.imp),2):"-",1)+th(tot.ok?num(r2(tot.iva),2):"-",1)+th(tot.ok?num(r2(tot.t),2):"-",1)+"</tr>";
  $("tabA").innerHTML=h;
  if(MESE&&REP[MESE]&&REP[MESE].anno===ANNO)disegnaMese(MESE);else $("cMese").classList.add("hide");
}
function disegnaMese(k){
  var m=REP[k];MESE=k;$("cMese").classList.remove("hide");
  $("titMese").textContent=MESI[LANG][m.mese-1]+" "+m.anno+(m.prezzo==null?" · "+T("Il prezzo del mese non è stato inserito: importi non disponibili"):"");
  var h="<tr>"+th(T("Tessera"))+th(T("Nome"))+th(T("Ricariche"),1)+th(T("kWh"),1)+th(T("Imponibile"),1)+th(T("IVA"),1)+th(T("Totale"),1)+"</tr>";
  m.tessere.forEach(function(t){h+="<tr>"+td(esc(t.tag))+td(esc(t.nome))+td(t.n,1)+td(num(t.kwh,3),1)+td(num(t.imp,2),1)+td(num(t.iva,2),1)+td(num(t.tot,2),1)+"</tr>"});
  h+="<tr><th></th><th>"+T("Totale")+"</th>"+th(m.tessere.reduce(function(s,t){return s+t.n},0),1)+th(num(m.kwh_t,3),1)+th(num(m.imp_t,2),1)+th(num(m.iva_t,2),1)+th(m.imp_t==null?"-":num(r2(m.imp_t+m.iva_t),2),1)+"</tr>";
  $("tabM").innerHTML=h;
  $("wApp").classList.toggle("hide",!m.app.length);
  if(m.app.length){var a="<tr>"+th(T("Inizio"))+th(T("Fine"))+th(T("kWh"),1)+th(T("Imponibile"),1)+th(T("IVA"),1)+th(T("Totale"),1)+"</tr>";
    m.app.forEach(function(x){a+="<tr>"+td(fmt(x.inizio))+td(fmt(x.fine))+td(num(x.kwh,3),1)+td(num(x.imp,2),1)+td(num(x.iva,2),1)+td(num(x.tot,2),1)+"</tr>"});$("tabApp").innerHTML=a}
  var s="<tr>"+th(T("Inizio"))+th(T("Fine"))+th(T("Tessera"))+th(T("Nome"))+th(T("kWh"),1)+th(T("Imponibile"),1)+th(T("IVA"),1)+th(T("Totale"),1)+"</tr>",righe=[];
  m.tessere.forEach(function(t){t.sess.forEach(function(x){righe.push({t:t,x:x})})});righe.sort(function(a,b){return a.x.inizio-b.x.inizio});
  righe.forEach(function(r){s+="<tr>"+td(fmt(r.x.inizio))+td(fmt(r.x.fine))+td(esc(r.t.tag))+td(esc(r.t.nome))+td(num(r.x.wh/1000,3),1)+td(num(r.x.imp,2),1)+td(num(r.x.iva,2),1)+td(num(r.x.tot,2),1)+"</tr>"});
  $("tabS").innerHTML=s;
  document.querySelectorAll("#tabA tr.m").forEach(function(tr){tr.classList.toggle("on",tr.getAttribute("data-k")===k)});
}
$("anno").onchange=function(){ANNO=+this.value;MESE=null;disegna()};
$("tabA").onclick=function(e){var tr=e.target.closest("tr.m");if(!tr)return;var k=tr.getAttribute("data-k");if(!REP[k])return;disegnaMese(k)};
$("bCsv").onclick=function(){
  var sep=LANG==="en"?",":";",q=function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'},n=function(v,d){return v==null?"":(LANG==="en"?v.toFixed(d):v.toFixed(d).replace(".",","))};
  var L=[[T("Inizio"),T("Fine"),T("Tessera"),T("Nome"),T("kWh"),T("€/kWh"),T("IVA %"),T("Imponibile"),T("IVA"),T("Totale")].map(q).join(sep)];
  Object.keys(REP).sort().forEach(function(k){var m=REP[k];
    m.tessere.forEach(function(t){t.sess.forEach(function(x){L.push([fmt(x.inizio),fmt(x.fine),t.tag,t.nome,n(x.wh/1000,3),n(m.prezzo,4),n(m.iva_pct,0),n(x.imp,2),n(x.iva,2),n(x.tot,2)].map(q).join(sep))})});
    m.app.forEach(function(x){L.push([fmt(x.inizio),fmt(x.fine),"",T("Ricariche avviate da app (non attribuite a una tessera)"),n(x.kwh,3),n(m.prezzo,4),n(m.iva_pct,0),n(x.imp,2),n(x.iva,2),n(x.tot,2)].map(q).join(sep))})});
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\\ufeff"+L.join("\\r\\n")],{type:"text/csv;charset=utf-8"}));a.download="archivio_"+A.da+"_"+A.a+".csv";document.body.appendChild(a);a.click();a.remove();
};
trDom();
</script>
</body>
</html>
`;

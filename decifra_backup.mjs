// Decifra un backup scaricato dal sito (ricariche_AAAA-MM-GG.sql.enc) e crea il file .sql.
// Uso:  node decifra_backup.mjs ricariche_2026-10-25.sql.enc
// Chiede la passphrase scelta al momento del download (non viene mostrata mentre la scrivi).
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import readline from "node:readline";

const file = process.argv[2];
if (!file) { console.error("Uso: node decifra_backup.mjs <file.sql.enc>"); process.exit(1); }

function chiedi(testo) {
  return new Promise((ok) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(testo)) process.stdout.write(s); };   // non mostra i caratteri digitati
    rl.question(testo, (r) => { rl.close(); process.stdout.write("\n"); ok(r); });
  });
}

const dati = new Uint8Array(readFileSync(file));
if (new TextDecoder().decode(dati.slice(0, 4)) !== "RBK1") { console.error("Il file non e' un backup cifrato di questo sito."); process.exit(1); }
const salt = dati.slice(4, 20), iv = dati.slice(20, 32), ct = dati.slice(32);
const pass = process.env.BACKUP_PASSPHRASE || await chiedi("Passphrase: ");
const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
const k = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
let chiaro;
try { chiaro = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, ct); }
catch { console.error("Passphrase sbagliata o file danneggiato."); process.exit(1); }
const uscita = file.replace(/\.enc$/, "");
writeFileSync(uscita, new Uint8Array(chiaro));
console.log("Creato " + uscita + "\nOra puoi ripristinarlo con: npx wrangler d1 execute ricariche --remote --file=" + uscita + "\nCancella il file .sql dopo l'uso: contiene i dati in chiaro.");

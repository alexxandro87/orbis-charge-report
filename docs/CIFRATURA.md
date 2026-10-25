# Cifratura dei dati personali e backup cifrato

[English](ENCRYPTION.md)

## 1. Attivare la cifratura dei dati personali (una volta sola)

Dalla cartella del progetto:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
npx wrangler secret put DATA_KEY
npx wrangler deploy
```

Il primo comando stampa la chiave: **copiala e conservala in un posto sicuro** (gestore di password). Il secondo la chiede e la salva come secret del Worker. Poi il deploy.

- Se perdi la chiave, nome, cognome, telefoni e consensi degli utenti registrati non si possono più leggere (nemmeno dai backup). L'email e il resto non sono toccati.
- Dopo il deploy, i dati già presenti vengono cifrati da soli: al primo controllo di Monitoraggio (entro 5 minuti) o quando apri la scheda Utenti. In Utenti compare la riga "Cifratura dei dati personali: attiva".
- Senza `DATA_KEY` il sito funziona come prima (dati in chiaro) e in Utenti compare un avviso in rosso.
- Cifrati: nome, cognome, telefoni, consensi e il testo dei ticket di assistenza. In chiaro: email (serve per l'accesso), nomi delle tessere, ricariche, hash delle password.
- Tecnica: AES-256-GCM, ogni valore con un suo IV casuale, legato alla riga e al campo.

## 2. Backup cifrato

Impostazioni, "Backup del database": scegli una passphrase (almeno 12 caratteri), ripetila e premi "Scarica backup cifrato". Il file `ricariche_AAAA-MM-GG.sql.enc` è cifrato nel browser (PBKDF2-SHA256 600.000 iterazioni + AES-256-GCM): senza passphrase non si legge.

Per ripristinarlo:

```
node decifra_backup.mjs ricariche_AAAA-MM-GG.sql.enc
npx wrangler d1 execute ricariche --remote --file=ricariche_AAAA-MM-GG.sql
```

Il primo comando chiede la passphrase e crea il `.sql`: cancellalo dopo l'uso. Per leggere i dati personali dopo un ripristino serve anche la stessa `DATA_KEY`. Un dump in chiaro resta disponibile all'indirizzo `/api/backup` per l'amministratore.

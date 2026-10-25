# Security policy

*Italiano più sotto.*

## Supported versions

Only the latest release receives security fixes. If you run an older version, update to the latest release (redeploy the Worker with `npx wrangler deploy`) before reporting.

| Version | Supported |
|---|---|
| Latest release | Yes |
| Older releases | No |

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report them privately through GitHub: go to the **Security** tab of this repository and choose **Report a vulnerability**. Include:

- what the problem is and where (file, API path or page);
- how to reproduce it, step by step;
- the impact you expect (for example: reading other users' data, signing in without a password, writing to the charger);
- the version you tested.

Please test only on your own installation or a local one (`npx wrangler dev`), never on someone else's site or charger. Do not include real personal data in the report.

You can expect a first answer within 7 days. Once the problem is confirmed, a fix is released as a new version and the reporter is credited in the release notes, unless they prefer otherwise.

## Scope

In scope: the code in this repository (the Worker, its API, the pages, the OCPP server and the encryption of personal data).

Out of scope: Cloudflare, Resend and the charger firmware themselves, and problems caused by a wrong configuration of your own installation (for example a missing `DATA_KEY` or an exposed secret). Compatibility has been tested only with Orbis firmware 7.2.53.

---

# Politica di sicurezza

## Versioni supportate

Solo l'ultima release riceve le correzioni di sicurezza. Se usi una versione precedente, aggiorna all'ultima (ripubblica il Worker con `npx wrangler deploy`) prima di segnalare.

| Versione | Supportata |
|---|---|
| Ultima release | Sì |
| Release precedenti | No |

## Segnalare una vulnerabilità

Per i problemi di sicurezza **non aprire una issue pubblica**.

Segnalali in privato tramite GitHub: apri la scheda **Security** di questo repository e scegli **Report a vulnerability**. Indica:

- qual è il problema e dove (file, percorso dell'API o pagina);
- come riprodurlo, passo per passo;
- l'impatto che ti aspetti (per esempio: leggere i dati di altri utenti, entrare senza password, scrivere sulla colonnina);
- la versione che hai provato.

Fai le prove solo sulla tua installazione o in locale (`npx wrangler dev`), mai sul sito o sulla colonnina di altri. Non mettere dati personali reali nella segnalazione.

Riceverai una prima risposta entro 7 giorni. Confermato il problema, la correzione esce in una nuova versione e chi l'ha segnalato viene ringraziato nelle note di rilascio, salvo preferisca di no.

## Ambito

Rientra: il codice di questo repository (il Worker, le sue API, le pagine, il server OCPP e la cifratura dei dati personali).

Non rientra: Cloudflare, Resend e il firmware della colonnina in sé, e i problemi dovuti a una configurazione sbagliata della propria installazione (per esempio `DATA_KEY` mancante o un secret esposto). La compatibilità è stata provata solo con il firmware Orbis 7.2.53.

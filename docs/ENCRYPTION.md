# Encryption of personal data and encrypted backups

[Italiano](CIFRATURA.md)

## 1. Encrypt users' personal data (once)

From the project folder:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
npx wrangler secret put DATA_KEY
npx wrangler deploy
```

The first command prints the key: **copy it and keep it somewhere safe** (a password manager). The second asks for it and stores it as a Worker secret. Then deploy.

- If you lose the key, first name, last name, phone numbers and consents of the registered users can no longer be read (not even from backups). Email addresses and everything else are not affected.
- After the deploy, data already present is encrypted by itself: at the first monitoring run (within 5 minutes) or when you open the Users tab. The Users tab then shows "Encryption of personal data: on".
- Without `DATA_KEY` the site works as before (data in clear) and the Users tab shows a red warning.
- Encrypted: first name, last name, phone numbers, consents and the text of support tickets. In clear: email (needed to sign in), card names, charging sessions, password hashes.
- Technique: AES-256-GCM, a random IV per value, bound to the row and the field.

## 2. Encrypted backup

Settings, "Database backup": choose a passphrase (at least 12 characters), repeat it and press "Download encrypted backup". The file `ricariche_YYYY-MM-DD.sql.enc` is encrypted in your browser (PBKDF2-SHA256 with 600,000 iterations + AES-256-GCM): without the passphrase it cannot be read.

To restore it:

```
node decifra_backup.mjs ricariche_YYYY-MM-DD.sql.enc
npx wrangler d1 execute ricariche --remote --file=ricariche_YYYY-MM-DD.sql
```

The first command asks for the passphrase and creates the `.sql` file: delete it after use. To read personal data after a restore you also need the same `DATA_KEY`. A plain (unencrypted) dump is still available at `/api/backup` for the administrator.

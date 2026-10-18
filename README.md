# Orbis Charge Report

**English** | [Italiano](README.it.md)

A small, free web app that downloads the session history from an **Orbis** EV charging station, stores it for good, and produces monthly and yearly cost-sharing reports per RFID card, with price per kWh and VAT. It was built for condominiums where several people share one charger and the building has to split the electricity bill. It works from a phone or a PC, with no Windows software, and runs on the Cloudflare free tier (one Worker plus one D1 database).

> Unofficial community project, not affiliated with or endorsed by Orbis or Viaris. Product names are used only to describe compatibility.

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tested hardware](#tested-hardware)
- [Requirements](#requirements)
- [Install](#install)
- [First start](#first-start)
- [Settings reference](#settings-reference)
- [How it talks to the charger](#how-it-talks-to-the-charger)
- [Using it with another charger](#using-it-with-another-charger)
- [Users and permissions](#users-and-permissions)
- [Prices, VAT and the month lock](#prices-vat-and-the-month-lock)
- [Importing Viaris CSV files](#importing-viaris-csv-files)
- [Pushing data from outside (ingest API)](#pushing-data-from-outside-ingest-api)
- [Secrets and environment variables](#secrets-and-environment-variables)
- [Backups](#backups)
- [Local development](#local-development)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)
- [Limits](#limits)
- [License](#license)

## Features

- **Automatic download** from the charger every 6 hours, plus a manual button. The charger itself only keeps its last ~100 sessions; the database keeps everything.
- **Monthly report and yearly history** per card with net amount, VAT and total; print to PDF and CSV export.
- **Cost splitting that adds up**: amounts are split in cents with the largest-remainder method, so the sum of the single sessions always equals the card total.
- **Sessions started from the app** (no RFID card) are kept in a separate section that only authorised users see.
- **Monthly price entry** (price per kWh and VAT) that locks automatically once the month is closed.
- **Users and permissions**: email + password, per-user permissions, single-use invitation links (optionally emailed through [Resend](https://resend.com)). A "charger user" account is bound to one card and sees only its own sessions.
- **First-run setup page**: creates the administrator and collects everything needed to reach the charger.
- **Everything configurable from the web page**: charger URL, credentials, URL paths, response format and column numbers, time zone, currency, tax label, site title, email.
- **English and Italian interface** with a language switch (also on the sign-in page, invitations and emails).
- Optional import of the per-card CSV exports of the Viaris desktop program.

## Screenshots

All screenshots use made-up demo data.

**Monthly report** - per-card totals, single sessions on click, app sessions in their own section:

<img src="docs/monthly-report.png" alt="Monthly report">

| Yearly history | All sessions |
|---|---|
| <img src="docs/yearly-history.png" alt="Yearly history"> | <img src="docs/all-sessions.png" alt="All sessions"> |

| Users and permissions | A charger user sees only their own card |
|---|---|
| <img src="docs/users.png" alt="Users"> | <img src="docs/my-charging.png" alt="My charging"> |

| First-run setup with connection test | Settings |
|---|---|
| <img src="docs/setup.png" alt="First-run setup"> | <img src="docs/settings.png" alt="Settings"> |

| Italian interface | Sign-in |
|---|---|
| <img src="docs/monthly-report-it.png" alt="Italian interface"> | <img src="docs/login.png" alt="Sign-in"> |

## Tested hardware

Developed and used with this station (as shown in the station's own "Station information" screen):

| Item | Value |
| --- | --- |
| Firmware version | 7.2.53 |
| Hardware version | 8.0 |
| Power board firmware / hardware | 3PH_FW_ORB_V06.3 / 3PH_HW_ORB_V6.2 |
| Cortex firmware | 003.005.010 (Dec 2020) |
| Model features | three-phase, RFID enabled, charging power 22080 W, power limit 13800 W |

Other Orbis models or firmware versions may expose the same pages with different columns: see [Using it with another charger](#using-it-with-another-charger). Reports of other working (or not working) setups are welcome as issues.

## Requirements

- Node.js 18 or newer and npm.
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
- A charger whose web interface is reachable **from the internet** over HTTP or HTTPS. Cloudflare Workers can only be relied on to reach ports **80 and 443**.
  - If the charger sits behind a router with a changing public IP (for example a SIM router), use a dynamic DNS name (DDNS) and a port forward.
  - Use a host name rather than a bare IP address: Workers may refuse requests to raw IPs.
- Optional: a [Resend](https://resend.com) account and a verified sending domain, to email invitations.

## Install

```
git clone https://github.com/alexxandro87/orbis-charge-report.git
cd orbis-charge-report
npm install
npx wrangler login                          # opens the browser, sign in to Cloudflare
cp wrangler.toml.example wrangler.toml
npx wrangler d1 create ricariche            # copy the printed database_id into wrangler.toml
npx wrangler d1 execute ricariche --remote --file=schema.sql
npx wrangler secret put SETUP_CODE          # recommended, see below
npx wrangler deploy                         # prints https://orbis-charge-report.<you>.workers.dev
```

On Windows PowerShell, if `npx` is blocked, use `npx.cmd`.

**Custom domain (optional):** uncomment the `routes` line in `wrangler.toml` and put your host name there, then `npx wrangler deploy` again. The domain must already be on your Cloudflare account.

**About `SETUP_CODE`:** until the administrator exists, anyone who opens the Worker address could create it. A setup code (any long random string you choose) is asked on the setup page and prevents that. Set it before the first visit. Once the administrator exists the setup page is gone for good.

## First start

Open the Worker address. On a fresh installation you get the **first setup page**:

1. Enter the **setup code** (if you set one).
2. Choose the **administrator user name** and password (at least 8 characters).
3. Enter the **charger address** (for example `http://my-charger.example-ddns.com`), and, if the charger asks for a login, the HTTP Basic user and password, or an extra header.
4. Press **Test connection**: you will see whether the history and the card list could be downloaded, how many rows were read, the first row decoded and the raw response. If the rows are wrong, adjust the column numbers later in the Settings tab.
5. Set the **site title**, **time zone** (for example `Europe/Rome`, `Europe/London`, `America/New_York`) and **currency symbol**.
6. Optional: a **Resend API key** and a **sender address** to email invitations.
7. Press **Create administrator and finish**. You are signed in.

Then press **Download from the charger** once (it then runs by itself every 6 hours), and each month enter the price per kWh and VAT from the electricity bill in the Monthly report tab.

## Settings reference

All of these are in the **Settings** tab (administrator only) and are saved in the database. Values saved there win over environment variables.

| Setting | Default | Meaning |
| --- | --- | --- |
| Charger address (URL) | empty | Base address, for example `http://charger.example.com`. Required. |
| User name / Password (HTTP Basic) | empty | Sent as `Authorization: Basic ...` if a user name is set. The password is stored in the database and never sent back to the browser. |
| Extra header name / value | empty | One more header on every request, for example `Authorization` / `Bearer xxxx` or `Cookie` / `session=xxxx`. |
| Session history path | `/modules/modulator/historic?from=0&to=-1` | Path (and query) that returns the session history. |
| Card list path | `/modules/tags?level=file` | Path that returns the card list. Empty = skip (cards then show only their code). |
| Timeout | 20 s | Per request. |
| Download automatically | on | Whether the scheduled run downloads. The schedule itself is in `wrangler.toml`. |
| JSON field with the CSV | `body` | The history response is JSON and this field holds the CSV text. Empty = the response itself is CSV. |
| Column separator | `,` | Separator of the history CSV. |
| Header lines to skip | 0 | Lines to ignore at the top of the history CSV. |
| Columns (start, end, card, type, meter start, meter end) | 0, 10, 7, 8, 9, 13 | 0-based column numbers in a history row. Times are epoch seconds, meters are Wh. |
| Card list: separator / lines to skip / card column / name column | `;` / 1 / 0 / 2 | Layout of the card list text. |
| Site title | `EV Charger` | Shown in pages, reports and emails. |
| Time zone | `Europe/Rome` | IANA name. Decides which month a session belongs to and when prices lock. |
| Currency symbol | `€` | Shown next to totals. |
| Tax label | empty | Empty = "VAT" in English, "IVA" in Italian. |
| Resend API key / sender | empty | Enable invitation emails. The key is never sent back to the browser. |

## How it talks to the charger

On the tested firmware the charger's own web interface answers two plain HTTP GET requests, which is all this app uses:

- `GET /modules/modulator/historic?from=0&to=-1` returns JSON like `{"body": "<one CSV line per session>"}`. Each line has comma-separated fields; the app reads column 0 (start, epoch seconds), 7 (card code), 8 (start type, such as `rfid_tag` or `app`; sessions started from the app are the ones without a card), 9 (energy meter at start, Wh), 10 (end, epoch seconds) and 13 (energy meter at end, Wh). Energy of a session = meter at end - meter at start.
- `GET /modules/tags?level=file` returns plain text: a first line with the list version, then one card per line, separated by `;`, with the card code in column 0 and the owner name in column 2.

Sessions are stored once (primary key = start time + start meter), so downloading the same history again never creates duplicates. Card codes are matched case-insensitively. If a Viaris import and a charger download describe the same session, the duplicate is removed.

## Using it with another charger

Nothing about the format is hard-coded. If your charger (or firmware) returns the history in a different shape, open **Settings**, press **Test connection** and read the raw response shown there, then change:

- the paths, if the URLs differ;
- the JSON field (or leave it empty if the response is CSV directly);
- the separator, header lines to skip and column numbers.

The only assumptions left are: one session per line, start and end as epoch seconds, and energy meters in Wh. If your device reports something else, open an issue with a sample (remove personal data) or send a pull request; the parser is the two small functions `parseStorico` and `parseTessere` in `src/index.js`.

## Users and permissions

The administrator sees and does everything. Other users are created in the **Users** tab by entering an email address and either:

- **Manager**: pick what the user may do: see the monthly report, the yearly history, all sessions; enter price and VAT; print and export; download from the charger and import CSV; see sessions started from the app.
- **Charger user**: linked to one card; sees only that card's sessions (month by month, with amounts) and nothing else.

Pressing **Send invitation** emails a personal single-use link, valid 48 hours, to choose the password. If email is not configured, or sending fails, the page shows the link so you can send it yourself. "Reset" / "Resend" creates a new link. Passwords can be changed by each user from the header.

## Prices, VAT and the month lock

Enter price per kWh and VAT for each month from the electricity bill. A month's price can be entered and corrected until the end of the following month, then it locks: for example the October price can be changed until 30 November and is locked from 1 December, for everyone including the administrator. A month with no price can still be filled in once. The point is that closed reports cannot change afterwards.

Emergency correction of a locked month, from a terminal:

```
npx wrangler d1 execute ricariche --remote --command "UPDATE prezzi SET eur_kwh=0.2531, iva=10 WHERE anno=2026 AND mese=10"
```

## Importing Viaris CSV files

If you previously used the Viaris desktop program, press **Import Viaris CSV...** and select its per-card exports (one file per card, plus one named `U ...` for sessions started from the app). The card is recognised from the first word of the file name, so download from the charger first (that is what provides the card list). Importing is repeatable and creates no duplicates. Dates in those files are read as local time in the configured time zone.

## Pushing data from outside (ingest API)

If the Worker cannot reach the charger at all, a computer that can reach it can push the raw responses instead. Send the two responses as text to the Worker with the credentials of a user who may download:

```
curl -u admin:YOUR_PASSWORD https://YOUR-WORKER/api/ingest \
  -H "content-type: application/json" \
  -d "{\"storico\": $(jq -Rs . < history.txt), \"tessere\": $(jq -Rs . < tags.txt)}"
```

`history.txt` and `tags.txt` are the exact bodies returned by the two charger URLs. They are parsed with the same settings as a normal download.

## Secrets and environment variables

Nothing has to be set except what you want. Prefer the web page; use these for automation or if you do not want a value in the database.

| Name | Kind | Purpose |
| --- | --- | --- |
| `SETUP_CODE` | secret | Protects the first-run page. Recommended. |
| `CHARGER_URL`, `TIMEZONE`, `CURRENCY`, `SITE_TITLE`, `MAIL_FROM` | variable | Defaults, overridden by saved settings. |
| `CHARGER_USER`, `CHARGER_PASSWORD`, `RESEND_API_KEY` | secret | Defaults, overridden by saved settings. |
| `APP_PASSWORD` | secret | Legacy: creates the user `admin` with this password and skips the setup page. |

Set a secret with `npx wrangler secret put NAME`.

## Backups

```
npx wrangler d1 export ricariche --remote --output backup.sql
```

Schedule it with cron or Task Scheduler. D1 also keeps 7 days of point-in-time history (`npx wrangler d1 time-travel restore ricariche --timestamp=<ISO date>`). Note that the export contains the saved charger password and Resend key: keep it private.

## Local development

```
cp .dev.vars.example .dev.vars
npx wrangler d1 execute ricariche --local --file=schema.sql
npx wrangler dev
```

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| "timeout after 20 s" or a network error | The Worker cannot reach the charger: check the DDNS name, the router port forward and that you use port 80 or 443. Try the URL from another network. |
| "HTTP 401" / "HTTP 403" | The charger wants a login: set the HTTP Basic user and password or an extra header. |
| "The history response is not JSON" | The response is CSV directly: empty the JSON field setting. |
| Rows read but "skipped" is high, or wrong cards/energy | Column numbers differ: use Test connection, read the raw response, fix the columns. |
| Sessions land in the wrong month | Wrong time zone setting. |
| Invitation email not sent | Check the Resend key, that the sender domain is verified, and the error text shown on the Users tab. The link is always shown so you can send it manually. |
| The setup page does not appear | An administrator already exists (or `APP_PASSWORD` is set). |

## Security notes

- Passwords are hashed with PBKDF2-SHA-256; the iteration count is deliberately low (5000) to stay inside the free plan's CPU limit. Use long passwords.
- Sign-in is rate-limited (5 attempts per 10 minutes per user name). Session cookies are `HttpOnly`, `Secure`, `SameSite=Strict`.
- The charger password and Resend key are stored in the D1 database (not shown again in the page). If that is not acceptable, set them as Worker secrets instead.
- The charger link is plain HTTP on most of these stations, so credentials sent to it are not encrypted in transit. Prefer a dedicated, read-only account if the charger supports it.
- This was written for a small private group. Review it before exposing it to untrusted users.

## Limits

- Reports are for a single charger and a single price per month.
- The scheduled download interval is set in `wrangler.toml` (default every 6 hours).
- Code comments and internal names are partly Italian for historical reasons; the user interface and messages are bilingual.

## License

Copyright (C) 2026 Alessandro Pomponi. Licensed under the **GNU Affero General Public License v3.0 or later** (AGPL-3.0-or-later), see [LICENSE](LICENSE).

In short: you can use, study, modify and share this software, including for your own building or business. If you distribute a modified version, or let other people use a modified version over a network (for example by hosting it as a service), you must make the source code of your modified version available to those users under the same license (section 13). Using it unmodified for your own condominium requires nothing more than keeping the license and copyright notices. This summary is not legal advice; the license text is what counts.

# Cloudflare Turnstile Step-By-Step

This is the only part of the current submission stack that cannot be completed
from this workspace, because it requires your Cloudflare dashboard.

Official references:

- https://developers.cloudflare.com/turnstile/get-started/
- https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/

## What you will get

Cloudflare will give you two values:

- `site key`
  - goes into the public GitHub Pages site
- `secret key`
  - goes into the restricted OCR backend

## 1. Open Cloudflare

1. Go to `https://dash.cloudflare.com/`
2. Log in

You do **not** need to move your domain to Cloudflare to use Turnstile.

## 2. Open Turnstile

1. In the left sidebar, open `Turnstile`
2. Click `Add widget`

## 3. Create the widget

Use these settings:

- Widget name:
  - `did-case-explorer-submit`
- Hostname:
  - `shogokajimura.github.io`
- Widget mode:
  - `Managed`

Then click `Create`.

## 4. Copy the keys

After creation, Cloudflare will show:

- `site key`
- `secret key`

Copy both.

## 5. Put the site key into the public site

Open:

- `CompanionExplorer/data/site-data.js`

Set:

- `submissionPortalConfig.turnstileSiteKey`

to the copied Cloudflare `site key`.

## 6. Put the secret key into the OCR backend

In your OCR service clone:

- `/Users/shogo/Documents/Git/Research/DID_literature/did-ocr-service`

create:

- `.env.local`

by copying:

- `.env.local.example`

Then set:

- `OCR_SERVICE_TURNSTILE_SECRET_KEY`

to the copied Cloudflare `secret key`.

## 7. Restart the local OCR API and worker

After `.env.local` is saved:

1. stop the current API process
2. stop the current worker process
3. restart both using:

```bash
zsh scripts/run_local_api.sh
zsh scripts/run_local_worker.sh
```

The scripts now load `.env.local` automatically.

## 8. Publish the public site change

After updating `site-data.js`, commit and push the public repo so the GitHub
Pages submission form starts rendering the Turnstile widget.

## 9. Test

1. open `https://shogokajimura.github.io/did-case-explorer/submit.html`
2. verify the Turnstile widget is visible
3. submit a small PDF
4. confirm the backend accepts it

## Notes

- Without a Turnstile site key, the submission form still works, but bot
  protection is effectively off.
- The current system is already functionally working without Turnstile.
- Turnstile is the last protection layer before calling the stack production-ready.

# Deployment And Security

## Recommended public architecture

Use a static hosting platform for the public explorer.

Recommended target:

- Cloudflare Pages

Also acceptable:

- Netlify
- GitHub Pages
- Vercel static deployment

The key point is that the public explorer should not need a public
database, server runtime, or upload surface.

Important nuance:

- GitHub Pages is acceptable for the first release
- but it does not give the same custom-header control as Cloudflare Pages or
  Netlify
- for this project that is tolerable because the public site is read-only and
  does not expose restricted material

## Why Cloudflare Pages is the best fit

- strong static hosting
- simple custom-domain support
- security headers supported through `_headers`
- easy future path to Workers, R2, and Turnstile if the restricted workflow is
  later migrated to managed infrastructure

## Security boundary

The browser-facing app should contain only:

- bibliographic metadata
- coded variables
- access-status labels
- public-domain or open-access source links
- frozen version information

The browser-facing app should **not** contain:

- restricted PDFs
- raw contributor uploads
- internal OCR return packages
- reviewer-only notes
- private contributor identifiers

## Public vs restricted storage

Keep public and restricted storage physically separated.

Public bucket:

- frozen JSON/TSV snapshot exports
- public figures
- public-domain files
- open-access files if linking/hosting is legally clear

Restricted bucket:

- contributor uploads
- copyrighted PDFs
- OCR return artifacts
- private audit logs
- internal queue data

## Versioning rule

Each public release should correspond to a clearly named corpus freeze.

Recommended pattern:

- `2026-03-27-review-freeze`
- `2026-05-12-post-publication-update-01`

Never silently mutate a public snapshot.

## Deployment checklist

Before first public release:

1. confirm public build contains no restricted files
2. confirm all visible links are legally public
3. confirm version badge matches a frozen export
4. confirm codebook and variable names match the manuscript
5. confirm security headers are enabled
6. confirm footer/about text does not promise full-text redistribution

## Headers

This folder includes a static `_headers` file with a conservative baseline:

- `X-Content-Type-Options`
- `Referrer-Policy`
- `X-Frame-Options`
- `Permissions-Policy`
- `Content-Security-Policy`

If external analytics or hosted fonts are added later, the CSP must be updated
deliberately rather than relaxed casually.

## What should stay outside the public explorer

Do not add these to the public app:

- user accounts
- upload endpoints
- OCR job execution
- contributor dashboards
- review queues
- restricted file preview

Those require separate authentication, abuse handling, audit logging, and
private storage design.

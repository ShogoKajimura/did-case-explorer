# DID Companion Explorer

This directory contains the public explorer for the multilingual DID/MPD
case-literature companion resource.

## Current scope

This build is intentionally public and read-only at the metadata layer.

It is designed to expose:

- versioned corpus framing
- bibliographic metadata
- coded variables
- source-access status
- manuscript-aligned visualization surfaces

It is explicitly **not** the place to store or serve:

- contributor uploads
- restricted PDFs
- OCR return artifacts for private documents
- any authenticated or restricted workflow UI

Restricted intake and private OCR handling live outside this public build.

## Why this implementation is static

The safest and most maintainable public architecture is a static frontend with
no public backend.

Benefits:

- minimal attack surface
- cheap and stable hosting
- straightforward versioning by corpus freeze
- easy deployment to Cloudflare Pages, Netlify, or GitHub Pages
- clean separation between public metadata and restricted source files

## Local preview

From the project root:

```bash
python -m http.server 8080 -d CompanionExplorer
```

Then open `http://localhost:8080`.

## Files

- `index.html`: public explorer shell
- `styles.css`: visual system and responsive layout
- `app.js`: client-side rendering and filtering
- `data/site-data.js`: current preview data and manuscript-aligned aggregates
- `_headers`: recommended security headers for static hosting
- `docs/DEPLOYMENT_AND_SECURITY.md`: deployment and operations guidance
- `docs/DATA_CONTRACT.md`: future data-loading boundary

## Recommended deployment target

Cloudflare Pages is the preferred public host for this explorer because it is
well-suited to static delivery and leaves a clean upgrade path to later
Workers/R2-based private workflows if the restricted backend is later migrated
off the local service stack.

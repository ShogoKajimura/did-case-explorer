# DID Companion Explorer

This directory contains the public explorer for the multilingual DID/MPD
case-literature companion resource.

## Current scope

This build is intentionally public and read-only at the metadata layer for the
released corpus snapshot.

It is designed to expose:

- versioned corpus framing
- bibliographic metadata
- coded variables
- source-access status
- manuscript-aligned visualization surfaces

The public explorer surface is explicitly **not** the place to store or serve:

- contributor uploads
- restricted PDFs
- OCR return artifacts for private documents
- any authenticated or restricted workflow UI

At the same time, the site now includes public submit/status pages that point
to a separate restricted backend. The browser can initiate a contribution
workflow, but restricted files, OCR artifacts, and queue state remain outside
the public static snapshot.

## Current release model

The public explorer should be understood as two coordinated layers:

- a versioned manuscript-freeze snapshot exposed through static files
- a live post-freeze contribution workflow exposed through submit/status pages
  but backed by separate restricted services

The snapshot and the contribution workflow should not be conflated. New uploads
are post-freeze additions until they are audited into a later public release.

Curator-approved additions can later be published through the documented release
workflow in `docs/CURATOR_RELEASE_WORKFLOW.md`.

## Why the public explorer remains static

Benefits:

- minimal attack surface
- cheap and stable hosting
- straightforward versioning by manuscript freeze
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
- `data/site-data.js`: current snapshot metadata, aggregates, and UI config
- `data/post-freeze-public-*.json`: curator-approved public additions after the manuscript freeze
- `_headers`: recommended security headers for static hosting
- `docs/DEPLOYMENT_AND_SECURITY.md`: deployment and operations guidance
- `docs/DATA_CONTRACT.md`: future data-loading boundary
- `docs/CURATOR_RELEASE_WORKFLOW.md`: curator steps for publishing approved post-freeze updates

## Recommended deployment target

Cloudflare Pages is the preferred public host for this explorer because it is
well-suited to static delivery and leaves a clean upgrade path to later
Workers/R2-based private workflows if the restricted backend is later migrated
off the local service stack.

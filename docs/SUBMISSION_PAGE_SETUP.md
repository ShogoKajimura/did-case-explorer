# Submission Page Setup

This document explains how to connect the public `submit.html` page to the
restricted OCR backend.

## 1. Edit the public config file

Open:

- `CompanionExplorer/data/site-data.js`

Update:

- `submissionPortalConfig.intakeUrl`
  - the public URL of the OCR backend submission endpoint
  - expected path:
    - `https://YOUR-BACKEND-URL/api/v1/public/submissions`
- `submissionPortalConfig.turnstileSiteKey`
  - optional but recommended for any public-facing intake form
- `submissionPortalConfig.contactEmail`
  - optional human contact for future UI messaging

## 2. Contributor directory

The public top-of-page contributor section is driven by:

- `contributorDirectory`

Each entry supports:

- `name`
- `role`
- `affiliation`
- `note`
- `url`

If `url` is present, the contributor name becomes a clickable link.

## 3. Current boundary

The public submission page:

- accepts metadata fields and a PDF upload
- posts to a separate backend
- does not itself process OCR
- does not make the uploaded PDF public

## 4. Before enabling the form publicly

Confirm all of the following:

- the backend is reachable from the public web
- `OCR_SERVICE_SUBMISSIONS_ENABLED=true`
- `OCR_SERVICE_CORS_ORIGINS` includes your GitHub Pages origin
- the backend accepts a test PDF successfully
- if using Turnstile, both public site key and backend secret are configured

## 5. If the backend is not ready yet

Leave:

- `submissionPortalConfig.intakeUrl = ""`

The public page will remain visible, but submission will stay disabled.

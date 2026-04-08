# Render OCR Backend Architecture

## Recommended split

Use two repositories or two clearly separated subprojects:

1. public static explorer
   - hosted on GitHub Pages
   - public metadata only

2. restricted OCR backend
   - deployed to Render
   - authenticated or private
   - handles uploads, OCR processing, and private return artifacts

This separation is the right default for security and maintainability.

## Why Render is a good fit

Render works well here because it can deploy directly from GitHub and run:

- Dockerized Python services
- background workers
- persistent disks where needed
- private services and protected APIs

That makes it much more suitable for OCR workloads than a purely static host.

## Recommended system diagram

```text
Public user
  |
  v
GitHub Pages explorer
  |
  +--> public metadata / coded variables / legal links

Authorized contributor or curator
  |
  v
Render OCR API
  |
  +--> private upload storage
  +--> OCR processing worker
  +--> job status registry
  +--> private downloadable outputs
```

## Recommended Render services

### A. Private API service

Purpose:

- accept uploads
- create OCR jobs
- return job status
- expose restricted download links only to authorized users

### B. Background worker

Purpose:

- run OCRmyPDF
- run direct OCR-to-text extraction
- generate machine-readable text plus searchable PDF
- update job state

## File boundary

### Public GitHub repo

Safe contents:

- site code
- public metadata snapshots
- coded variables
- public figures
- documentation

### Private OCR service repo or private subproject

Restricted contents:

- OCR API code
- job runner
- queue state
- upload handling
- contributor credentials
- private artifacts

## Data flow

1. PDF uploaded to the restricted OCR service
2. API stores the upload in a private jobs directory or object store
3. Worker runs:
   - searchable PDF generation
   - canonical OCR text extraction
4. job state becomes `completed`
5. authorized user can download:
   - searchable PDF
   - canonical text
   - metadata JSON

## Storage recommendation

For the first restricted version, local persistent disk on Render is acceptable.

For a more durable setup later:

- S3-compatible storage
- Cloudflare R2
- AWS S3

## Authentication recommendation

Do **not** launch the OCR backend as a public anonymous endpoint.

Start with one of these:

- basic shared password gate
- invite-only token
- simple curator-only access

Contributor self-service can come later.

## Operational warning

The OCR backend should not be presented as:

- public redistribution of copyrighted full texts

It should be presented as:

- a restricted processing and return service
- with public outputs limited to metadata and coded variables unless rights are clear

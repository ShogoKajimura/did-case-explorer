# Data Contract For The Public Explorer

## Goal

This app is designed so the UI can remain stable while the public snapshot and
restricted post-freeze workflow evolve independently.

## Public data objects

### 1. Site metadata

High-level snapshot information:

- corpus version
- freeze date
- source count
- language count
- country count
- represented case count
- OCR-dependent source count
- update label distinguishing manuscript-freeze records from later audited
  additions

### 2. Aggregate distributions

Chart-ready counts for manuscript-aligned variables:

- co-consciousness
- amnesia prevalence
- amnesia directionality
- voluntary switching
- treatment goals
- treatment outcomes
- language groups
- year distribution

### 3. Public record rows

Each public record should expose only public-safe fields such as:

- record ID
- title
- authors
- year
- country
- language
- case structure
- coded variables approved for release
- access status
- public link if legally permissible
- snapshot version
- release cohort such as `manuscript_freeze` or `post_freeze_update`

## Fields that should not be exposed publicly by default

- restricted file paths
- OCR return package paths
- internal reviewer notes
- contributor identity unless explicitly consented and intended for display
- internal acquisition comments

## Access-status vocabulary

Use a small controlled vocabulary:

- `open_full_text`
- `public_domain`
- `metadata_only`
- `restricted_not_redistributed`
- `ocr_managed_local`
- `pending_verification`

The UI can map these values to friendlier labels later.

## Release discipline

The public explorer should always load from a versioned frozen export. The
restricted contribution workflow may continue to accept submissions in between
freezes, but those submissions should not silently appear in the public dataset
until they are audited into a later release.

Good pattern:

- build static `data/` snapshots from reviewed project files
- publish them with a matching visible version tag
- retain old snapshots for reproducibility

This preserves the distinction between:

- the public reproducible snapshot
- the internal working corpus and live contribution queue

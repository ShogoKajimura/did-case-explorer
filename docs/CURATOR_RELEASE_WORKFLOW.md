# Curator Release Workflow

This companion resource now has two distinct public layers:

- the frozen manuscript-aligned snapshot (`2026-03-27`)
- curator-approved post-freeze public updates

Restricted uploads do **not** enter the public explorer automatically. The
intended release flow is:

1. A contributor uploads a PDF through the public submit page.
2. OCR runs on the restricted local backend.
3. The curator reviews the job in `admin.html`.
4. The curator marks the job as:
   - `Review state = include_candidate`
   - `Include in public update = checked`
   - optional `Release cohort = post_freeze_update_01` or another cohort label
5. The curator runs the local build script:

```bash
python /Users/shogo/Dropbox/a4_論文/DID_literature/Coordinator/build_post_freeze_public_updates.py
```

6. The script regenerates:
   - `data/post-freeze-public-records.json`
   - `data/post-freeze-public-records.tsv`
   - `data/post-freeze-public-summary.json`
   - `data/post-freeze-public-contributors.json`
7. The public explorer reads these files and displays approved updates as
   clearly labeled `Post-freeze public update` records.
8. After reviewing the output, sync the updated `CompanionExplorer/` directory
   to the GitHub Pages repo and push.

## Admin access

The admin page is intentionally no longer linked from the public service pages.
Use the direct URL:

`https://shogokajimura.github.io/did-case-explorer/admin.html`

The security boundary is the admin token on the restricted backend, not the URL
itself. The current token is stored locally on the service machine in:

`/Users/shogo/Documents/Git/Research/DID_literature/did-ocr-service/.env.local`

If the token needs to be shared with another administrator, do so through a
private channel and rotate it afterwards if needed.

# Current State And Remaining Inputs

The public explorer and restricted OCR contribution workflow are already live.
The remaining decisions are about how the project should evolve from the
current manuscript-freeze release into later public updates.

## 1. Current public host and future migration

Current host:

- GitHub Pages

Future migration options:

- stay on GitHub Pages
- move the public snapshot to Cloudflare Pages
- keep the public snapshot on GitHub Pages but migrate the restricted backend
  later

If you already have an account and preferred platform, that should drive the
deployment wiring.

## 2. Domain strategy

Please decide whether the site should launch as:

- a temporary platform subdomain
- a custom domain
- a subdomain of an existing lab or project site

Recommended eventual pattern:

- `did-cases.yourdomain`
- or `/did-case-explorer` under an existing research domain

## 3. Public branding

Please confirm:

- final public title
- subtitle/tagline
- whether author names or lab identity should appear in the footer
- whether the manuscript title should be echoed directly or shortened

## 4. Public data scope for the next freeze

Please specify which public-safe data layers you want included first:

- source inventory rows
- coded variables
- aggregate counts only
- public links for open/public-domain files
- downloadable TSV/CSV
- codebook

## 5. Legal boundary preference

Please confirm your preferred default for public record pages:

- strict metadata + coded variables only
- include open/public-domain PDFs where legal
- include publisher links only

The safest first release is:

- metadata
- coded variables
- source-access labels
- links only where clearly legal

## 6. Release posture

Please choose how the public site should frame future updates:

- manuscript freeze only
- manuscript freeze plus public update log
- manuscript freeze plus clearly labeled post-freeze additions

## 7. What I can do next

Once the above is settled, I can:

1. tighten the manuscript-freeze vs post-freeze information architecture
2. generate the next audited public snapshot and charts
3. add a visible update log and release notes
4. redesign explorer views around manuscript-freeze records and later additions

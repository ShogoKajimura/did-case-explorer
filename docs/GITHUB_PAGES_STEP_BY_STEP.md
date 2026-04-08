# GitHub Pages Setup Guide

This guide assumes you already created a new GitHub repository for the public
companion explorer.

Recommended repository type:

- public repository
- dedicated to the explorer
- example name: `did-case-explorer`

## 1. Prepare the files locally

The public site files live in:

- `/Users/shogo/Dropbox/a4_論文/DID_literature/CompanionExplorer`

These are already GitHub Pages compatible and include:

- `index.html`
- `styles.css`
- `app.js`
- `data/`
- `assets/`
- `.nojekyll`

## 2. Put the site into the repository

If you are using a dedicated repository for the explorer, the easiest pattern
is:

- put the contents of `CompanionExplorer/` at the root of the repository

Important:

- copy the **contents** of `CompanionExplorer/`
- not the parent folder itself

So the repository root should end up containing:

- `index.html`
- `styles.css`
- `app.js`
- `data/`
- `assets/`
- `.nojekyll`
- `_headers`
- `robots.txt`
- `README.md`
- `docs/`

Note:

- `_headers` is included for future static hosts such as Cloudflare Pages or
  Netlify
- GitHub Pages itself will ignore `_headers`
- this is acceptable for the current read-only metadata-only launch

## 3. Upload through the GitHub website

If you are not using Git much yet, this is the easiest route.

### A. Open the repository

1. Go to your repository on GitHub.
2. Click the `Add file` button.
3. Choose `Upload files`.

### B. Upload the site files

1. Open the local folder:
   `/Users/shogo/Dropbox/a4_論文/DID_literature/CompanionExplorer`
2. Select all files and folders inside it.
3. Drag them into the GitHub upload page.
4. Wait for GitHub to finish indexing the upload list.

### C. Commit the upload

At the bottom of the page:

1. In the commit message field, enter something like:
   `Initial public companion explorer shell`
2. Leave the default option:
   `Commit directly to the main branch`
3. Click `Commit changes`

## 4. Enable GitHub Pages

After the files are in the repository:

1. Click `Settings` in the top tab bar of the repository.
2. In the left sidebar, click `Pages`.
3. Under `Build and deployment`:
   - set `Source` to `Deploy from a branch`
   - set `Branch` to `main`
   - set the folder to `/ (root)`
4. Click `Save`

GitHub will then publish the site.

## 5. Wait for the site URL

After saving the Pages settings:

1. Stay on the `Pages` settings page.
2. Wait for GitHub to show the public URL.

For a project site, it will usually look like:

- `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

Example:

- `https://yourname.github.io/did-case-explorer/`

The first deployment may take a few minutes.

## 6. If the site looks broken

Check these first:

1. `index.html` must exist at the repository root
2. `.nojekyll` must exist at the repository root
3. `Pages` must be set to `main` and `/ (root)`
4. the repository must be `Public`

## 7. Recommended repository settings

After the site is live, go to `Settings` and check:

### General

- `Issues`: on
- `Discussions`: optional, off is fine
- `Wikis`: off unless you really want them

### Security

- `Dependency graph`: on
- `Dependabot alerts`: on
- `Secret scanning`: on if available

## 8. Optional later step: custom domain

You do **not** need this now.

The default GitHub Pages URL is enough for the first launch.

If you later buy or attach a domain, GitHub Pages can serve the same site under
that domain.

## 9. Safest release pattern

For this project, the safest order is:

1. publish the shell
2. confirm the public URL works
3. add only public-safe metadata and coded variables
4. keep copyrighted full texts and OCR return artifacts out of the public repo

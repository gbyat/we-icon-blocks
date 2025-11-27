# Release System

This document describes the GitHub release system for **WE Icon Blocks**.

## Overview

The release system provides:

- **Automatic WordPress dashboard updates** via a built‑in GitHub updater.
- **GitHub Releases** with a ready‑to‑install `we-icon-blocks.zip`.
- **CI/CD validation** before a release is built.
- **Changelog management** with helper scripts and an optional pre‑commit hook.

## How it works

### 1. WordPress dashboard updates

The plugin includes an updater (`inc/class-updater.php`) that:

- checks GitHub for new releases,
- shows update notifications in the WordPress plugins screen,
- loads changelog/README content into the update popup,
- allows one‑click updates from the plugins page.

**Requirements:**

- The plugin must be installed from the GitHub ZIP (same slug / directory name).
- The GitHub repository `gbyat/we-icon-blocks` must be accessible.

Optional:

- A GitHub token can be stored in the option `we_icon_blocks_github_token` to increase API rate limits.

### 2. GitHub Releases

When you push a **version tag**, GitHub Actions (`.github/workflows/release.yml`) will:

1. Validate the code and plugin header.
2. Ensure `CHANGELOG.md` contains the tagged version.
3. Build a ZIP file `we-icon-blocks.zip` with all production files.
4. Create a GitHub Release and attach the ZIP.

### 3. CI/CD validation

The workflow `.github/workflows/release.yml`:

- runs on `push` to tags that match `v*` (e.g. `v0.1.0`),
- validates:
  - plugin header in `we-icon-blocks.php`,
  - presence of the version in `CHANGELOG.md`,
  - optional PHPCS checks (if available),
- builds the ZIP with the correct files (see `RELEASE-FILES.md`).

## Usage

Recommended commands:

```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

Each release script will:

1. Bump the version in `package.json`.
2. Sync the version to `we-icon-blocks.php` and `CHANGELOG.md` (`scripts/sync-version.js`).
3. Commit all changes.
4. Create and push the tag `vX.Y.Z`.
5. Trigger the GitHub Actions release workflow.

### Manual release (alternative)

1. Update `package.json` version manually.
2. Run:

```bash
npm run sync-version
```

3. Update `CHANGELOG.md` manually if needed.
4. Commit everything:

```bash
git add -A
git commit -m "Release vX.Y.Z"
```

5. Create and push the tag:

```bash
git tag -a "vX.Y.Z" -m "Release vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

## Automatic changelog updates

Before committing, you can automatically collect commit messages into an **Unreleased** section:

```bash
node scripts/update-changelog.js
```

This script:

- reads commits since the last version tag,
- merges them into the `## [Unreleased]` section in `CHANGELOG.md` (if present),
- avoids duplicates.

### Install as Git hook (optional)

After initialising your git repo:

```bash
git init   # if not already initialised
npm run install-hook
```

This installs a `pre-commit` hook that:

- runs `scripts/update-changelog.js` before each commit,
- stages the updated `CHANGELOG.md` automatically.

You can skip the hook with:

```bash
git commit --no-verify
```

## Changelog format

`CHANGELOG.md` follows the Keep a Changelog style:

```markdown
## [Unreleased]

- Change 1
- Change 2

## [0.1.0] - 2025-11-26

- Initial development version of WE Icon Blocks.
```

The `scripts/sync-version.js` script ensures that:

- a section for the current version exists, and
- a release link is appended at the bottom when missing.

## Files included in the ZIP

The full list of included/excluded files is documented in `RELEASE-FILES.md`.  
In short, only **runtime plugin files** (PHP, built block assets, helper scripts, translations, docs) are included – build tools, sources and dev dependencies are excluded.

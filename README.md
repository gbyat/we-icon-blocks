## WE Icon Blocks

**Contributors:** webentwicklerin  
**Tags:** icons, animations, gutenberg, block-editor, svg  
**Requires at least:** 5.8  
**Tested up to:** 6.9  
**Requires PHP:** 7.4  
**Stable tag:** 0.2.1  
**License:** GPL-2.0-or-later  
**License URI:** https://www.gnu.org/licenses/gpl-2.0.html

WE Icon Blocks adds a flexible icon block for the WordPress Block Editor (Gutenberg).

### Description

It is designed as a small, focused plugin that provides a reusable SVG icon set with fine‑grained control over layout, colors, borders and animations.

### Features

- **Icon block for Gutenberg**: Insert icons anywhere in your content or navigation menus.
- **SVG icon library**: Icons are rendered as SVGs for crisp display on all resolutions.
- **Layout options**: Icon left/right/top/bottom in relation to the text, configurable gap.
- **Icon styling**: Separate control for icon color, background, border (width, style, color, radius) and inner padding.
- **Wrapper styling**: Uses native WordPress block supports for border, spacing and typography on the wrapper.
- **Animations**: Several presets (float up, pulse, bounce, rotate, shake) with options for duration, repeat (once/loop) and trigger (always/on hover).
- **Accessibility friendly**: Screen‑reader‑only text option for purely visual icons.
- **Update system**: GitHub‑based updates via the built‑in updater class.

### Installation

- Download the latest release ZIP from the GitHub releases page.
- In your WordPress admin go to **Plugins → Add New → Upload Plugin** and upload the ZIP.
- Activate **WE Icon Blocks**.

### Usage

- In the block editor, search for **“Icon (WE)”** (or similar label) and insert the block.
- Choose an icon from the library via the block sidebar.
- Configure:
  - **Colors** for icon and background.
  - **Icon border** (width, style, color, radius) and **icon padding** (inner spacing).
  - **Text** and **position** (left/right/top/bottom) and the gap between icon and text.
  - **Link** settings if the icon/text should be clickable.
  - **Animation** type, duration (fast/medium/slow), repeat (once/loop) and trigger (always or only on hover).

### Development

Clone the repository and install dependencies:

```bash
npm install
```

Build the assets once:

```bash
npm run build
```

For development with file‑watching:

```bash
npm run dev
```

### Internationalisation

- PHP and JavaScript strings use the `we-icon-blocks` text domain.
- POT file generation:

```bash
npm run pot
```

- PO → JED JSON und Hash‑Generierung (für Block‑Editor‑Übersetzungen):

```bash
npm run po-to-jed
npm run hash-json
```

### Releases & Versioning

- This plugin follows **semantic versioning** (`MAJOR.MINOR.PATCH`).
- The script `scripts/sync-version.js` keeps the plugin header, `block.json` files, `CHANGELOG.md` and the **Stable tag** in this `README.md` in sync with the version from `package.json`.
- Release helpers:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

GitHub Actions builds the release ZIP and attaches it to the corresponding GitHub Release, which is then used by the built‑in updater.

### Testing with WordPress Playground

You can test this plugin in [WordPress Playground](https://playground.wordpress.net/) without installing it locally or in a WordPress repository.

**[🚀 Test in WordPress Playground (v0.2.4)](https://playground.wordpress.net/?plugin=https%3A%2F%2Fgithub.com%2Fgbyat%2Fwe-icon-blocks%2Freleases%2Fdownload%2Fv0.2.4%2Fwe-icon-blocks.zip)** — Opens WordPress Playground with the latest release pre-installed.

**Quick preview (latest release):**

```bash
npm run playground
```

This generates a Playground URL that opens WordPress with the plugin pre-installed from the latest GitHub release.

**Specific version:**

```bash
node scripts/generate-playground-url.js 0.2.3
```

**Using a Blueprint:**

You can also use the `playground-blueprint.json` file directly:

1. Host the blueprint file (e.g., via GitHub Gist or your own server).
2. Open: `https://playground.wordpress.net/?blueprint-url=<your-blueprint-url>`

The blueprint automatically:

- Installs the plugin from the GitHub release
- Activates it
- Navigates to the plugins page

**Note:** The plugin must be released on GitHub (via `npm run release:*`) for the Playground URLs to work, as they reference the release ZIP files.

# Dateien im Release-Paket (we-icon-blocks.zip)

Diese Dateien werden im Release‑ZIP‑Paket enthalten sein, das von GitHub Actions automatisch erstellt wird.

## 📦 Enthaltene Dateien

### Haupt‑Plugin‑Dateien

- ✅ `we-icon-blocks.php` – Haupt‑Plugin‑Datei
- ✅ `README.md` – Plugin‑Dokumentation
- ✅ `LICENSE` – Lizenz (falls vorhanden)
- ✅ `CHANGELOG.md` – Changelog (optional, aber aktuell mit im Paket)

### Plugin‑Struktur

- ✅ `inc/` – PHP‑Code des Plugins

  - ✅ `inc/class-icon-blocks.php` – Haupt‑Bootstrap / Block‑Registrierung / Updater‑Initialisierung
  - ✅ `inc/class-updater.php` – GitHub‑Updater für automatische Updates im WP‑Backend
  - ✅ `inc/icons.php` – generierte Icon‑Library / Helper‑Funktionen

- ✅ `blocks/` – gebaute Block‑Assets (für die eigentlichen Gutenberg‑Blöcke)

  - z.B. `blocks/icon/` mit:
    - `block.json`
    - `index.js`
    - `style.css`
    - `editor.css`

- ✅ `assets/` – zusätzliche Assets für das Plugin

  - z.B. `assets/js/add-icon-to-navigation.js`

- ✅ `languages/` – Übersetzungsdateien
  - `.mo`, `.po`, `.pot`
  - JSON‑Dateien für Block‑/JS‑Übersetzungen

## ❌ Ausgeschlossene Dateien

### Entwicklungs‑ und Build‑Dateien

- ❌ `src/` – Quellen (Block‑Quelle, SVG‑Files, etc.)
- ❌ `scripts/` – Build‑ und Release‑Skripte
- ❌ `node_modules/` – Node.js‑Dependencies
- ❌ `vendor/` – Composer‑Dependencies (falls später vorhanden)
- ❌ `.github/` – GitHub‑Workflows
- ❌ `.git/`, `.gitignore` – Git‑Daten
- ❌ Editor‑/Tooling‑Konfigurationen (`.editorconfig`, `.phpcs.xml`, IDE‑Dateien, usw.)

### Sonstiges

- ❌ Weitere Markdown‑Dokumente außerhalb von `README.md` und `CHANGELOG.md` (falls angelegt)
- ❌ Systemdateien wie `.DS_Store`, `Thumbs.db`

## 📊 Beispiel‑Struktur des Release‑ZIPs

```text
we-icon-blocks/
├── we-icon-blocks.php
├── README.md
├── LICENSE
├── CHANGELOG.md
├── inc/
│   ├── class-icon-blocks.php
│   ├── class-updater.php
│   └── icons.php
├── blocks/
│   └── icon/
│       ├── block.json
│       ├── index.js
│       ├── style.css
│       └── editor.css
├── assets/
│   └── js/
│       └── add-icon-to-navigation.js
└── languages/
    ├── we-icon-blocks.pot
    ├── we-icon-blocks-de_DE.po
    ├── we-icon-blocks-de_DE.mo
    ├── we-icon-blocks-de_DE.json
    └── we-icon-blocks-de_DE-<hash>.json
```

## 🔄 Anpassen

Wenn du Dateien hinzufügen oder ausschließen möchtest, bearbeite den Schritt **„Create plugin ZIP“** in  
`.github/workflows/release.yml` (Kopier‑/`cp`‑Befehle und Dokumenten‑Liste).

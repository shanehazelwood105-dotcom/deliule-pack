# Search Scraper — Desktop App

A lightweight Electron wrapper for [Search Scraper](https://ai-chat-theme--shanehazelwood1.replit.app/search-scraper/), powered by Deliule AI.

> **Requires an internet connection** — the app loads the hosted Search Scraper web app.

---

## Download

Go to the [Releases](../../releases) page and download the latest `Search-Scraper-Setup.exe` for Windows.

---

## Build it yourself

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Steps

```bash
# 1. Go into the electron-app folder
cd electron-app

# 2. Install dependencies
npm install

# 3. Run locally (optional, to test)
npm start

# 4. Build the Windows .exe installer
npm run build:win
```

The installer will be created in `electron-app/dist/`.

---

## GitHub Actions (auto-build)

Every push to `main` automatically builds a Windows `.exe` and attaches it to a GitHub Release. See `.github/workflows/build-exe.yml`.

# Deliule — Desktop App

A lightweight Electron wrapper for [Deliule](https://ai-chat-theme--shanehazelwood1.replit.app), the AI-powered platform.

> **Requires an internet connection** — the app loads the hosted Deliule web app.

---

## Download

Go to the [Releases](../../releases) page and download the latest `Deliule-Setup.exe` for Windows.

---

## Build it yourself

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Steps

```bash
# 1. Go into the deliule-electron folder
cd deliule-electron

# 2. Install dependencies
npm install

# 3. Run locally (optional)
npm start

# 4. Build the Windows .exe installer
npm run build:win
```

The installer will be created in `deliule-electron/dist/`.

const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const APP_URL = "https://ai-chat-theme--shanehazelwood1.replit.app";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Deliule",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#0f0f13",
    show: false,
  });

  win.loadURL(APP_URL);

  win.once("ready-to-show", () => {
    win.show();
  });

  // Open external links in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

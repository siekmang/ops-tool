// @ts-check

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  /** @param {string} url - The URL to open in browser */
  openLink: (url) => ipcRenderer.send('open-link', url),
  /** @param {string} key - signifies what you want open */
  open: (key) => ipcRenderer.send('open', key),
  /** @param {string} key - signifies repo you want open */
  openInIde: (key) => ipcRenderer.send('open-in-ide', key),
  testLxdTools: () => ipcRenderer.send('test-lxd-tools'),
  buildLxdTools: () => ipcRenderer.send('build-lxd-tools'),
  /** @param {string} key - signifies repo you want to see the status of */
  status: (key) => ipcRenderer.send('git-status', key),
});

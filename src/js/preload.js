// @ts-check

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  /** @param {string} key - signifies what you want open */
  open: (key) => ipcRenderer.send('open', key),
  /** @param {string} url - The URL to open in browser */
  openLink: (url) => ipcRenderer.send('open-link', url),
  /** @param {string} key - signifies repo you want open */
  openInIde: (key) => ipcRenderer.send('open-in-ide', key),
  /**
   * Executes a system command in a specific directory.
   * @param {Object} payload - The command configuration.
   * @param {string} payload.command - The binary to run (e.g., 'git', 'npm').
   * @param {string[]} payload.args - Arguments for the command (e.g., ['status'] or ['test']).
   * @param {string} payload.key - The registry key or absolute file path to execute in.
   */
  runCommand: (payload) => ipcRenderer.send('run-command', payload),
  /**
   * Registers a callback for standard command output.
   * @param {function(string): void} callback - Function to handle the received string data.
   */
  onOutput: (callback) =>
    ipcRenderer.on('command-output', (_event, data) => callback(data)),
  /**
   * Registers a callback for standard command output.
   * @param {function(string): void} callback - Function to handle the received string data.
   */
  onError: (callback) =>
    ipcRenderer.on('command-error', (_event, data) => callback(data)),
  getConfig: () => ipcRenderer.invoke('get-config'),
});

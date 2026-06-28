//@ts-check

/** @typedef {keyof typeof PATH_REGISTRY} RegistryKey */

import { app, BrowserWindow, clipboard, dialog, ipcMain } from 'electron';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATH_REGISTRY } from './src/js/main/path.js';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const os = process.platform;

class UnexpectedOsError extends Error {
  constructor(message = 'Not on expected operating system.') {
    super(message);
    this.name = 'UnexpectedOsError';
  }
}

/**
 * @param {Electron.IpcMainEvent} _event
 * @param {RegistryKey} key - The file/app/directory to be opened, in the form the PATH_REGISTRY expects it.
 */
ipcMain.on('open', (_event, key) => {
  // @ts-expect-error Doesn't like that key could not align with one of our keys in PATH_REGISTRY, but we have enough control over that that I'm not worried.
  const item = PATH_REGISTRY[key];

  if (!item) throw new Error(`Unknown item: ${key}.`);

  const path = item[os];
  if (!path) throw new Error(`No path defined for ${key} on ${os}.`);

  if (os === 'darwin') {
    exec(`open "${path}"`);
  } else if (os === 'win32') {
    exec(`start "" "${path}"`);
  } else throw new UnexpectedOsError();
});

/**
 * Opens a link in a browser. Designed to support Mac or Windows. Throws an error if the user isn't on either.
 * @param {Electron.IpcMainEvent} event - The thing that triggers this
 * @param {string} url - The URL to open in browser
 */
ipcMain.on('open-link', (_event, url) => {
  if (os === 'darwin') {
    exec(`open -a "Vivaldi" ${url}`);
  } else if (os === 'win32') {
    exec(
      `start "" "C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe" ${url}`
    );
  } else {
    throw new UnexpectedOsError();
  }
});

/**
 * This function opens the repo in question in editor of choice(right now Zed.) It should be relatively easy to change if I move IDEs again(just change the command,) and I elected for simplicity over flexibility on this. The path registry for this is meant to be expanded if needed, but there is a fallback in here for key to be the path we want open, which I'm thinking will work for the open repo button that let's me select the repo. That should be platform agnostic because the path selection will be happening on the device.
 * @param {Electron.IpcMainEvent} _event
 * @param {RegistryKey | string} key - Either the RegistryKey for the repo we want to open or a string version of the file path to open in the IDE.
 */
ipcMain.on('open-in-ide', (_event, key) => {
  let path;

  // @ts-expect-error Doesn't like that key could not align with one of our keys in PATH_REGISTRY, but we have enough control over that that I'm not worried.
  const item = PATH_REGISTRY[key];

  if (item) {
    path = item[os];
  } else {
    path = key;
  }

  exec(`zed "${path}"`);
});

/** Controls runnings commands(mostly npm and git stuff)
 * @param {Electron.IpcMainEvent} event - The thing that triggers this
 * @param {string} command  - top level command(again, usually npm or git)
 * @param {string[]} args - the args passed on the command
 * @param {string} key - the key associated with the PATH_REGISTRY entry for the thing we want to target
 *
 */
ipcMain.on('run-command', (event, { command, args, key }) => {
  // @ts-expect-error doesn't like implicit any.
  const item = PATH_REGISTRY[key];
  const path = item ? item[process.platform] : key;

  if (!path) {
    event.sender.send('command-error', 'Invalid path or registry key.');
    return;
  }

  // Note: npm requires 'shell: true' because it's a batch/cmd file on Windows.
  // For 'git', you can safely omit it.
  const isNpm = command === 'npm';
  const cmd = spawn(command, args, {
    cwd: path,
    shell: isNpm,
    env: process.env,
  });

  /** @param {Buffer} data */
  const handleData = (data) => {
    event.sender.send('command-output', data.toString());
  };

  cmd.stdout.on('data', handleData);
  cmd.stderr.on('data', handleData);
  cmd.on('error', (err) => event.sender.send('command-error', err.message));
});

/** To get the config file */
ipcMain.handle('get-config', () => {
  const configPath = path.join(__dirname, 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load config:', error);
    return {};
  }
});

ipcMain.handle('resolve-course-id-by-name', async (_event, courseName) => {
  if (!courseName) return null;

  const course = await getSingleCourse(courseName, [169877]);
  return course?.id ?? null;
});

ipcMain.handle('save-to-log', async (_event, formData) => {
  const fileName = 'faqLog.json';
  const entry = {
    ...formData,
    savedAt: new Date().toISOString(),
  };

  const macFilePath =
    '/Users/siekmang/Library/CloudStorage/GoogleDrive-siekman06@gmail.com/My Drive/Ops Tool Files';
  const windowsFilePath = path.join('G:', 'My Drive', 'Ops Tool Files');

  const folderCandidates =
    process.platform === 'darwin'
      ? [macFilePath]
      : process.platform === 'win32'
        ? [windowsFilePath]
        : [];

  const existingFolder = folderCandidates.find((folder) =>
    fs.existsSync(folder)
  );

  if (!existingFolder) {
    const clipboardText = JSON.stringify(entry, null, 2);
    clipboard.writeText(clipboardText);
    return {
      ok: false,
      copiedToClipboard: true,
      message:
        'FAQ log folder was not found. The entry was copied to your clipboard.',
    };
  }

  const filePath = path.join(existingFolder, fileName);
  let logEntries = [];

  try {
    const existingRaw = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, 'utf8')
      : '';

    if (existingRaw.trim()) {
      const parsed = JSON.parse(existingRaw);
      logEntries = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (error) {
    const tempPath = path.join(existingFolder, 'faqLog.temp.json');
    const tempContents = JSON.stringify([entry], null, 2);
    fs.writeFileSync(tempPath, tempContents, 'utf8');
    clipboard.writeText(JSON.stringify(entry, null, 2));
    return {
      ok: false,
      copiedToClipboard: true,
      message:
        'FAQ log exists but could not be read. A temp file was written and the new entry was copied to your clipboard.',
      tempPath,
    };
  }

  logEntries.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(logEntries, null, 2), 'utf8');

  return {
    ok: true,
    copiedToClipboard: false,
    message: `Saved FAQ entry to ${filePath}`,
    filePath,
  };
});

ipcMain.handle('pick-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'src/js/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1000,
    height: 900,
    minWidth: 800,
    minHeight: 720,
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});

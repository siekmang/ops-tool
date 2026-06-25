//@ts-check

/** @typedef {keyof typeof PATH_REGISTRY} RegistryKey */

const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

const os = process.platform;

class UnexpectedOsError extends Error {
  constructor(message = 'Not on expected operating system.') {
    super(message);
    this.name = 'UnexpectedOsError';
  }
}

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

const PATH_REGISTRY = {
  todoist: {
    darwin: '/Applications/Todoist.app',
    win32: 'C:\\Program Files\\Vivaldi\\Application\\todoist.exe',
  },
  'dev-folder': {
    darwin: '/Users/siekmang/Dev',
    win32: 'C:\\Users\\GSiekman\\Documents\\GitHub',
  },
  'lxd-tools': {
    darwin: '/Users/siekmang/Dev/Work/lxd-tools',
    win32: 'C:\\Users\\GSiekman\\Documents\\GitHub\\lxd-tools',
  },
};

/**
 * @param {import('electron').IpcMainEvent} _event
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
 * This function opens the repo in question in editor of choice(right now Zed.) It should be relatively easy to change if I move IDEs again(just change the command,) and I elected for simplicity over flexibility on this. The path registry for this is meant to be expanded if needed, but there is a fallback in here for key to be the path we want open, which I'm thinking will work for the open repo button that let's me select the repo. That should be platform agnostic because the path selection will be happening on the device.
 * @param {import('electron').IpcMainEvent} _event
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

/**
 * This function shows git status of the desired repo. If key is a RegistryKey in PATH_REGISTRY, it pulls from that, if not it defaults to treating key like the path.
 * @param {import('electron').IpcMainEvent} _event
 * @param {RegistryKey | string} key - Either the RegistryKey for the repo we want or a string version of the file path to open in the IDE.
 */
ipcMain.on('git-status', (_event, key) => {
  let path;

  // @ts-expect-error Doesn't like that key could not align with one of our keys in PATH_REGISTRY, but we have enough control over that that I'm not worried.
  const item = PATH_REGISTRY[key];

  if (item) {
    path = item[os];
  } else {
    path = key;
  }

  exec(
    'git status',
    // @ts-expect-error Doesn't like that it could be any.
    { cwd: PATH_REGISTRY['lxd-tools'[os]] },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }
      // TODO Change where this is outputting.
      console.log(`Test Output: ${stdout}`);
    }
  );
});

ipcMain.on('test-lxd-tools', (_event) => {
  exec(
    'npm test',
    // @ts-expect-error Doesn't like that it could be any.
    { cwd: PATH_REGISTRY['lxd-tools'[os]] },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }
      // TODO Change where this is outputting.
      console.log(`Test Output: ${stdout}`);
    }
  );
});

ipcMain.on('build-lxd-tools', (_event) => {
  exec(
    'npm run build:dev',
    // @ts-expect-error Doesn't like that it could be any.
    { cwd: PATH_REGISTRY['lxd-tools'[os]] },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }
      // TODO Change where this is outputting.
      console.log(`Test Output: ${stdout}`);
    }
  );
});

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1000,
    height: 900,
    minWidth: 800,
    minHeight: 720,
  });

  win.loadFile('src/index.html');
};

app.whenReady().then(() => {
  createWindow();
});

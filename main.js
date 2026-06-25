require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 900,
    minWidth: 800,
    minHeight: 720,
  })

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
})

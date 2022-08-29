const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title:"NewPad",
    icon:"./logo.ico",
    frame: false,
    frame:false,
    transparent: true,
    hasShadow:false,
    maximizable: false,
    minimizable: false,
    backgroundColor: "rgba(0,0,0,0.001)",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  Menu.setApplicationMenu(null);
  //mainWindow.webContents.openDevTools()
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

//接收最小化命令
  ipcMain.on('window-min', function() {
    mainWindow.minimize();
  })
//接收最大化命令
  ipcMain.on('window-max', function() {
    mainWindow.restore();
    console.log(mainWindow.isMaximized());
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  })
//接收关闭命令
  ipcMain.on('window-close', function() {
    mainWindow.close();
  })
  var Fpath = 'new'
  if (process.argv[0].indexOf('electron')>-1) {
    if (process.argv.length>=3) {
      var Fpath = process.argv[process.argv.length-1];
    }
  } else {
    if (process.argv.length>=2) {
      var Fpath = process.argv[process.argv.length-1];
    }
  }
  console.log(Fpath)
}
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


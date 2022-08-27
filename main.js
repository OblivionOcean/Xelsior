const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title:"NewPad",
    icon:"./logo.ico",
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  Menu.setApplicationMenu(null);
  //mainWindow.webContents.openDevTools()
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

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
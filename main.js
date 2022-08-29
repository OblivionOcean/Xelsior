const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
const fs = require('fs');
const path = require('path')
//electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> --out=out --icon=assets/app.ico --asar --overwrite --ignore=.git
const exec = require('child_process').exec
function writeRegedit(cmdstr){
    console.log("cmd " + cmdstr)
    exec(cmdstr, {encoding: "gbk"},function (err, stdout, stderr) {

        if (err) {
            console.log("cmd errror"  + stderr)
        }
        console.log("cmd success" )
    })
}

if(process.platform == 'win32'){
    try{
        let exePath = __dirname+'NewPad.exe';//获取exe路径 如 this.remote.process.argv[0]
        let eName = "newpad.t";
        let icoPath ="md.ico";//logo路径

        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+'\\shell\\open\\command /t REG_SZ /d "\\"'+exePath+'\\" \\"%1\\"" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+'\\DefaultIcon /t REG_SZ /d "\\"'+icoPath+'\\" " /f');//logo路径

        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.md /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.markdown /t REG_SZ /d "'+eName +'" /f');
    }
    catch(e){
        console.log("HKEY_CURRENT_USER Applications  error")
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "NewPad",
        icon: "./logo.ico",
        frame: false,
        frame: false,
        transparent: true,
        hasShadow: false,
        maximizable: false,
        minimizable: false,
        backgroundColor: "rgba(0,0,0,0.001)",
        webPreferences: {
            nodeIntegration: true, contextIsolation: false,
        }
    });
    var Fpath = 'new'
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    Menu.setApplicationMenu(null);
    //mainWindow.webContents.openDevTools()
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit()
    })

//接收最小化命令
    ipcMain.on('window-min', function () {
        mainWindow.minimize();
    })
//接收最大化命令
    ipcMain.on('window-max', function () {
        mainWindow.restore();
        console.log(mainWindow.isMaximized());
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    })
    //接收关闭命令
    ipcMain.on('window-close', function () {
        mainWindow.close();
    })
    //打开文件
    ipcMain.on('file-open', function (event, arg) {
        console.log(Fpath)
        dialog.showOpenDialog({
            multiSelections: false,
            openDirectory: false,
            title: '选择文件',
            filters: [{name: 'Markdown文件', extensions: ['md', 'markdown']}, {
                name: 'Markdown格式的文本', extensions: ['txt']
            }]
        }).then(result => {
            if(result.filePaths.length>0) Fpath = result.filePaths[0];
            fs.readFile(result.filePaths[0], 'utf8', function (err, data) {
                if (err) {
                    event.reply('error', '打开失败');
                }
                event.reply('file-return', data);
            })
        })
    })
    //保存文件
    ipcMain.on('file-save', function (event, arg) {
        if (Fpath != 'new') {
            fs.writeFile(Fpath, arg, 'utf8', function (err) {
                if (err) {
                    event.reply('error', '保存失败');
                }
            })
        } else {
            dialog.showSaveDialog({
                multiSelections: false,
                openDirectory: false,
                title: '保存文件',
                filters: [{name: 'Markdown文件', extensions: ['md', 'markdown']}, {
                    name: 'Markdown格式的文本', extensions: ['txt']
                }]
            }).then(r => {
                if (r.filePath) Fpath = r.filePath;
                console.log(Fpath);
                fs.writeFile(Fpath, arg, 'utf8', function (err) {
                    if (err) {
                        event.reply('error', '保存失败');
                    }
                })
            })
        }
    })

    //保存文件
    ipcMain.on('init-file-save', function (event, arg) {
        if (Fpath != 'new') {
            fs.writeFile(Fpath, arg, 'utf8', function (err) {
                if (err) {
                    event.reply('error', '保存失败');
                }
            })
        }
    })
    if (process.argv[0].indexOf('electron') > -1) {
        if (process.argv.length >= 3) {
            Fpath = process.argv[process.argv.length - 1];
        }
    } else {
        if (process.argv.length >= 2) {
            Fpath = process.argv[process.argv.length - 1];
        }
    }
    ipcMain.on('init-file-open', function (event, arg) {
        if (Fpath !== 'new') {
            fs.readFile(Fpath, 'utf8', function (err, data) {
                if (err) {
                    event.reply('error', '打开失败');
                }
                event.reply('file-return', data);
            })
        }
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


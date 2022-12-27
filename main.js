const {app, BrowserWindow, Menu, ipcMain, dialog, screen, remote, Tray} = require('electron')
const fs = require('fs');
const path = require('path')
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
v='1.3.0'
canQuit = false;
if(process.platform == 'win32'){
    try{
        let exePath = path.resolve(__dirname,'../..')+'\\NewPad.exe';//获取exe路径 如 this.remote.process.argv[0]
        let eName = "newpad";
        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+' /t REG_SZ /d Markdown文件 /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+' /v "URL Protocol" /t REG_SZ /d "" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+'\\shell\\open\\command /t REG_SZ /d "\\"'+exePath+'\\" \\"%1\\"" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Classes\\'+eName+'\\DefaultIcon /t REG_SZ /d "\\"'+exePath+'\\",0" /f');

        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.md /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.md\\Shellnew /v "NullFile" /t REG_SZ /d "" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.markdown /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.mdtext /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.mdtxt /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.mdown /t REG_SZ /d "'+eName +'" /f');
        writeRegedit('REG ADD HKEY_CURRENT_USER\\Software\\Classes\\.mdwn /t REG_SZ /d "'+eName +'" /f');
    }
    catch(e){
        console.log("HKEY_CURRENT_USER Applications  error")
    }
}


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "NewPad",
        icon: "./logo.ico",
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
//接收最小化命令
    ipcMain.on('window-min', function () {
        mainWindow.minimize();
    })
    /*mainWindow.on('close', (event) => {
        mainWindow.hide();
        if (!canQuit) {
            event.preventDefault();
        }
    });*/
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
        //mainWindow.hide();
        mainWindow.close()
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
    ipcMain.on('main-win-info', function (event, arg) {
        event.reply('return-main-win-info', {
            max: mainWindow.isMaximized(),
            min: mainWindow.isMinimized(),
        });
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
function tray() {
    // 当托盘最小化时，右击有一个菜单显示，这里进设置一个退出的菜单
    let trayMenuTemplate = [{ // 系统托盘图标目录
        label: '刷新', click: function () {
            //mainWindow.loadFile('inex.html')
            mainWindow.loadFile('index.html')
            //updataFWindows.loadFile('updaFWindow.html')
        }
    },{ // 系统托盘图标目录
        label: '调试', click: function () {
            mainWindow.webContents.openDevTools({mode:'detach'});
        }
    },{ // 系统托盘图标目录
        label: '重启', click: function () {
            app.relaunch()
            app.exit()
        }
    }, { // 系统托盘图标目录
        label: '退出', click: function () {
            canQuit = true;
            app.quit(); // 点击之后退出应用
        }
    }];
    appTray = new Tray(path.join(__dirname, 'logo.ico'));
// 图标的上下文菜单
    contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

// 设置托盘悬浮提示
    appTray.setToolTip('NewPad');
// 设置托盘菜单
    appTray.setContextMenu(contextMenu);
// 单机托盘小图标显示应用
    appTray.on('click', function () {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow()
    //tray()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


import { app, BrowserWindow, ipcMain,Tray } from "electron";
import * as path from "path";
import { setMenu } from "./menu/electron_menu";
import { handleWebStop, } from "./event/bubble";
import { inspectProcedure } from "./event/init";
import register from './event/register'
import logger from './log'
import {getSSHServerInfo,setTrySSHServerInfo} from './event/originForwardLocal'

let win: any = ''
const createWindow = () => {
    win = new BrowserWindow({
        show: false,
        titleBarStyle: process.platform !== 'win32' ? 'default':'hiddenInset',
        width:1300,
        height:1100,
        minWidth: 1300,
        minHeight: 1100,
        icon: path.join(process.cwd(), 'public/favicon.png'), // icon
        webPreferences: {
            devTools: process.env.NODE_ENV === 'development',
            nodeIntegration: true, 
            preload: path.join(__dirname, "./preload.js"),
            webSecurity: false
        }
    });
    if (process.env.NODE_ENV !== 'development') {
        win.loadFile(path.join("dist/index.html"))
    } else {
        win.loadURL("http://localhost:5173")
    }

    win.on('ready-to-show', () => {
        win.show()
        setTimeout(() => { win.webContents.openDevTools() }, 500)
    })
};


const gotTheLock = app.requestSingleInstanceLock({ info: 'two' })
if (!gotTheLock)app.quit()
app.whenReady().then(() => {
    inspectProcedure()
    setMenu()
    createWindow();
    register(win)
    process.env.NODE_ENV == 'development' ?win.maximize() : ''
 
});

app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (win && win.isMinimized) {
        win.isMinimized()? win.restore():''
        win.focus()
    }
})

app.on("before-quit", async (event) => {
    const data = getSSHServerInfo()
    setTrySSHServerInfo(data)
    await handleWebStop()

});

app.on("window-all-closed",async () => {
    try{
        await handleWebStop()
        inspectProcedure()
    }catch(e){
        logger.info(`window-all-closed${e}`);
    }
    app.quit();
});



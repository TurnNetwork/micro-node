import { openUrl, updateElectron } from "./onEvent";
import { ipcMain} from "electron";
import * as constant from '../../utils/conf'

const Fn:any = {
   
}

const register = (win: any) => {
    
    Object.keys(Fn).forEach((v:string)=>{
        ipcMain.on(v, Fn[v])
    })
    ipcMain.on(constant.BROWSER_SEND_UPDATEVERSION, (e, params, name) => updateElectron(e, win, params, name))
    ipcMain.on(constant.BROWSER_SEND_OPENDEVTOOLS, () => win.webContents.openDevTools())
}

export default register



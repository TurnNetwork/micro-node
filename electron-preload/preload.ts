import { contextBridge, ipcRenderer } from 'electron';
import * as constant from '../utils/conf'
import CryptoJS from 'crypto-js'
import * as os from 'os'

const  cryptoJS = (fnName: string, data: any) => {
    return CryptoJS[fnName](data).toString().toUpperCase()
}
const cryptoJS2 = (fnName: any, data: any) => {
    fnName = fnName.split('.')
    let api = CryptoJS
    fnName.forEach((v: string) => {
        api = api[v]
    });
    return api(data)
}

export const getIpAddress = ()=> {
    const Interfaces: any = os.networkInterfaces()
    const addressList = new Set()
    for (let t in Interfaces) {
        let iface = Interfaces[t]
        for (let i = 0; i < iface.length; i++) {
            let { family, address, internal } = iface[i]
            if (family === 'IPv4' || family == '4') {
                addressList.add(address)
            }
        }
    }
    return Array.from(addressList)
}

contextBridge.exposeInMainWorld('electron', {
    version: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron,
    },
    cryptoJS,
    cryptoJS2,
    getIpAddress,
    handleBubbleStop: (obj: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_BUBBLE_STOP, obj)
    },
    initTurnNode: () => {
        ipcRenderer.send(constant.BROWSER_SEND_NODE_INIT)
    },
    getNodeInfo: (callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_QUERYNODEINFO)
        ipcRenderer.on('get-node-info', callback)
    }, 
    openProxy: (data: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_OPENPROXY, data)
    },
    openDevTools: () => {
        ipcRenderer.send(constant.BROWSER_SEND_OPENDEVTOOLS)
    },
    openUrl: ((url: string) => {
        ipcRenderer.send(constant.BROWSER_SEND_OPENEXTERNALLINK, url)
    }),
    downloadNewVersion: (url: string, name: string) => {
        ipcRenderer.send(constant.BROWSER_SEND_UPDATEVERSION, url, name)
    },
    originForwardLocal: (obj: any, callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_STARTSSHSERVER, obj)
        ipcRenderer.on('origin_forward_local', callback)
    },
    queryBlsPubKey: (callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_QUERYBLSPUBKEY)
        ipcRenderer.on('queryBlsPubKey', callback)
    },
    transactionFn: (data: any, callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_PROXYTRANSACTION, data)
        ipcRenderer.on('transactionFn', callback)
    },
    TRYSSHINFO: (callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_QUERYTRY_SSHSERVERINFO)
        ipcRenderer.on('TRY_SSH_INFO', callback)
    },
    SETTRYSSHINFO: (callback: any) => {
        ipcRenderer.send(constant.BROWSER_SEND_SETTRYSSHINFO)
    },
    createBlsNodeIdWatch: (callback: any) => ipcRenderer.on('createBlsNodeIdWatch', callback),
    onOriginPortWatchCall: (callback: any) => ipcRenderer.on('onOriginPortWatch', callback),
    uploadEnd: (callback: any) => ipcRenderer.on('uploadEnd', callback)
})




import { rimraf } from 'rimraf'
import {  execSync, spawnSync} from 'child_process'
import * as path from "path";
import * as fs from "fs";
import * as os from 'os'
import { Store } from "../store";
import logger from './../log'
import { BUBBLE_CHILD_PROCESS_PID } from '../../utils/conf'
import { _writeFile } from '../../utils/indes'
import { stopSSH } from './originForwardLocal'
import {rootPath} from './init'

let bubble: any
let outLog: any

export const handleWebStart = async (event: any, obj: any) => {
    const procedureDirData = '/runData/'
    await handleBubbleStop()
    await deleRunData(procedureDirData)
    let paramsList: any = []
    bubble = null, outLog = null
    outLog = fs.openSync(`${path.join(rootPath, `${procedureDirData}bubble_out.log`)}`, 'a');
    logger.info(JSON.stringify(`bubble isOperator: ${obj?.isOperator}`))
    if (obj?.isOperator)  {
        const d = [ '--op.prikey', obj?.prikey, '--proxy.rpc.port', obj?.port || '']
        paramsList = paramsList.concat(d)  
    } 
    console.log(paramsList);
    handleBubbleStop()

}



export const handleWebStop = async (event?: any) => {
    const webContents = event && event.sender || ''
    try {
       stopSSH()
       await handleBubbleStop()
    } catch (Err) {
        logger.info(JSON.stringify(`bubble all stop： ${JSON.stringify(Err)}`))
    }
}


export const handleBubbleStop = async (event?: any) => {
    const processData = Store.get(BUBBLE_CHILD_PROCESS_PID);
    const platform = os.platform();
    const pid = bubble?.pid || processData?.pid || ''
    try {
        if (pid) {
            let cmdStr = `kill ${pid}`
            if (platform === 'win32') cmdStr = `taskkill /pid ${pid} -f`
            logger.info(`kill pid: ${pid}`)
            execSync(cmdStr);
            if (outLog) {
                fs.closeSync(outLog);
            }
            await new Promise((resolve,rejects)=>{
                if(bubble && bubble.on ){
                    bubble.on('exit', (code: any) => {
                        closeFileStream()
                        resolve(true)
                    });
                    setTimeout(()=>{
                        resolve(true)
                    },30000)
                }else{
                    resolve(true)
                }
            })
        }else{
            closeFileStream()
        }
    } catch (err) {
        Store.set(BUBBLE_CHILD_PROCESS_PID, '');
    }
}

export const closeFileStream = ()=>{
    try {
        if (outLog) fs.closeSync(outLog);
        outLog == null
    } catch (e) {
        console.log(e);
    }
}

export const deleRunData = async (procedureDirData:string)=>{
    try {
        await rimraf(`${path.join(rootPath, procedureDirData)}`);
    } catch (e) {
    }
}
 
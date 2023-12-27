
import { app } from 'electron'
import { spawn} from 'child_process'
import * as fs from 'fs'
import * as path from "path";
import { ethers } from 'ethers'
import { key } from './key'
import logger from './../log'
import { writeFile } from './init'
import { nodeKeyPath,nodeList as BubbleNodeList } from './../../config/index.js'
import { handleWebStart, handleBubbleStop } from './bubble'
import {hexStrBuf,
    sendSystemContractOperation,getNonce,rpc,availablePorts
} from './other'
import { SSHSTARTWATCHINFO,TRYSSHSTARTWATCHINFO } from '../../utils/conf'
import { Store } from "../store";
const { Client } = require('ssh2');
const HttpStatus = JSON.stringify({ status: 200, type: "success" })

let conn = new Client();
let flag = true
let rootPath = process.cwd()
if(process.platform !== 'win32') rootPath = `${process.env.HOME}/Library/Turn_micro`

export const stopSSH = () => {
    try {
        conn?.end();
        conn = null
        conn = new Client();
    } catch (e) {
        console.log(e);
    }
}


const commonOperation = async (params:any,type:string,api?:string)=>{
    let timer:any
    let mark = Date.now()
    let num= 0
    const {chainId,nodeKey,node,url,prikey,hash} = params
    const Difference = 180000
    const fn = async ()=>{
        if(timer) clearTimeout(timer)
        const date = Date.now()
        num++
        return new Promise(async (resolve,reject)=>{
            if(BigInt(date) - BigInt(mark) > Difference){
                logger.info(`${type} Time timeout`);
                if(timer) clearTimeout(timer)
                resolve(false)
                throw Error('Time timeout')
            }
           try{
                if(type == 'available'){
                    const availableData =  await availablePorts({
                        chainId,
                        num:String(1),
                        privateKey:nodeKey.toString() 
                    },api)
                    logger.info(`${type} success`);
                    return  resolve(availableData)
                }

                if(type == 'editCandidate'){
                    const params = [
                        7001,
                        hexStrBuf(node),//nodeID
                        '','','',
                        `http://${url}`
                    ]
                    const networkInfo = BubbleNodeList[0]
                    const wallet =  new ethers.Wallet(prikey)// activeWallet?.value?.address
                    let address = wallet.address
                    address = String(address).toString()
                    let nonce:any = await getNonce(address)
                    nonce = Number(nonce)
                    const otherParams = {
                        privateKey: prikey,
                        provider: networkInfo.netWorkUrl,
                        chainId: +networkInfo.chainId,
                        address: address,
                        nonce
                    }
                    logger.info(`SystemContractOperation${JSON.stringify(otherParams)}`);
                    const data =  await sendSystemContractOperation(params,otherParams)
                    if(!data)  throw Error('false')
                    return resolve(data)
                }

                if(type == 'queryTransaction'){
                    const tx = await rpc('eth_getTransactionReceipt',[hash]);
                    if (!tx) throw Error('false')
                    logger.info(`tx hash:${hash}  Receipt：${JSON.stringify(tx)}`);
                   return resolve(true)
                }

           }catch(e){
              if(timer) clearTimeout(timer)
              timer = setTimeout(async ()=>{
                    logger.info(`${type} setTimeout ${num}`);
                    const data = await fn()
                    resolve(data)
              },3000)
           }
        })
    }

    return await fn()
}

const setSSHServerInfo = (params?:any,data?:any)=>{
    logger.info('set SSH Server params ：'+JSON.stringify(params))
    const d = params && data ?{params,data}:''
    Store.set(SSHSTARTWATCHINFO, d);
}

export const getSSHServerInfo = ()=>{
   return Store.get(SSHSTARTWATCHINFO);
}
export const setTrySSHServerInfo = (data?:any)=>{
   Store.set(TRYSSHSTARTWATCHINFO,data || '');
}


export const getTrySSHServerInfo = (event?: any)=>{
    const info  = Store.get(TRYSSHSTARTWATCHINFO);
    if(event){
        const webContents = event.sender
        webContents.send('TRY_SSH_INFO', {data: !!info})
    }
    return info
}
 
let TRY_SSH_FLAG = true
export const retryNodePrograms = ()=>{
    const {params,data} = getTrySSHServerInfo()
    if(TRY_SSH_FLAG){
        TRY_SSH_FLAG = false
        startFn({},data,  params)
    }
}



export const originForwardLocal = (event: any, params: any) => {
    const webContents = event.sender
    stopSSH()
    try {
        conn.on('ready', () => {
            conn.forwardIn('127.0.0.1', params.origin_prot, (err: any) => {
                if (err) {
                    logger.info(JSON.stringify(`ssh ready error ${err}`))
                    return
                };
                logger.info('ssh ready success , port：' + params.origin_prot)
            });
         
        })
        conn.on('tcp connection', (info: any, accept: any, reject: any) => {
            // try {
                const acpt = accept()
                acpt.on('data', (data: any) => {
                    try {
                        if (flag) {
                            flag = false
                            const res = data.toString()
                            const list = res.split('\r\n')
                            if (list[0].indexOf('POST') > -1) {
                                let data = list[list.length - 1] || list[list.length - 2]
                                setSSHServerInfo(params,data)
                                startFn(event,data,  params)
                            }
                            setTimeout(() => { flag = true}, 2000)
                        }
                        acpt.end();
                    } catch (err: any) {
                        logger.info(`tcp connection data error ${JSON.stringify(`${err}`)}`)
                    }
                })
         
        })
        conn.on('close', (err: any) => {
            logger.info(`ssh close ${JSON.stringify(` ${err}`)}`)
        })
        conn.on('error', (err: any) => {
            logger.info(`ssh error ${JSON.stringify(` ${err}`)}`)
        }).connect({
            host: params.ip,
            username: 'micro',
            privateKey: key
        });

        webContents.send('origin_forward_local', { data: true ,...params})
    } catch (e) {
        logger.info(`ssh connect error,${JSON.stringify(e)}`)
      
    }
}


const updateRPCPort = async (params:any)=>{
    const {chainId,ServerIP,mainUrl,prikey, node} = params
    const nodeKey = fs.readFileSync(`${path.join(rootPath, nodeKeyPath)}`)
    let availableData:any
    return new Promise(async (resolve,reject)=>{
        try{
            logger.info(`availableData start',${JSON.stringify(`${chainId}` )}￥${nodeKey.toString()}`);
            availableData =  await commonOperation({chainId,nodeKey:nodeKey.toString()},'available',mainUrl)
            if(toString.call(availableData) !== '[object Array]') return resolve(false)
            logger.info(`availableData end',${availableData}`);
        } catch(e) {
            return  resolve(false)
        }

        let hash:any
        try{
            logger.info(`editCandidate start data',${ServerIP}:${availableData[0]}`);
            hash =  await commonOperation({
                url:`${ServerIP}:${availableData[0]}`, prikey,node 
            },'editCandidate')
            logger.info(`editCandidate end hash',${JSON.stringify(hash)}`);
            if(!hash) return resolve(false)
        }catch(e){
            resolve(false)
        }

        try{
            logger.info(`queryTransaction start',${JSON.stringify(hash)}`);
            const editFlag =  await commonOperation({hash},'queryTransaction')
            logger.info(`queryTransaction end',${JSON.stringify(hash)}`);
            if(!editFlag) return resolve(false)
            resolve(availableData)
        }catch(e){
            resolve(false)
        }
  })

}

const startFn = async (event: any,data: any,  params: any) => {
    try {
        if(!data) return
        logger.info(`network watch start data ===> ${data}`)
        data = data && JSON.parse(data)
    } catch (e) {
        return
    }
    if (!data || !['0', 0, '1', 1].includes(data.type)) return
    if (['0', 0].includes(data.type)) {
        writeFile(data.data)
    
        handleWebStart(event, {
            isInit: false,
            isOperator: params.IsOperator,
            node: `enode://${params.node}@0.0.0.0:`,
            prikey: params?.prikey || '', //
            proxy_ip: params?.ip || ''
        })
    }
    if ([1, '1'].includes(data.type)) {
        setSSHServerInfo()
        setTrySSHServerInfo()
        handleBubbleStop(event)
    }
}





export const TestOpenProxy = (event: any, params: any) => {
  
}

export const test_micro_node_proxy = async (params: any) => {
    
}







//@ts-ignore
import { nodeList } from '../../config/index.js'
import Web3 from 'Web3Dist'
import { rawTxCall, rawTxSend,rpc,bigNumBuf,hexStrBuf } from './builtInContractCall'
import {
    builtInContractAddress,
    //@ts-ignore
} from '../../config/index.js'
export {
    bigNumBuf,
    hexStrBuf,
    rpc
}


const networkInfo = nodeList[0]
let web3Try
try {
    web3Try = new Web3(networkInfo.netWorkUrl) || undefined
} catch (e) {
    console.log(e);
}

export const web3 = web3Try

export const getBalance:any = async (account: string) => {
    const data = await web3.eth.getBalance(account)
    return String(data)
}

export const getChainId = async () => {
    const data = await web3.eth.getChainId()
    return String(data)
}
export const getGasPrice = async () => {
    const data = await web3.eth.getGasPrice()
    return String(data)
}
export const getNonce = async (address: string) => {
    let nonce = await web3.eth.getTransactionCount(address);
    return nonce
}

export const getVersion = async () => {
    return await web3.eth.getProtocolVersion();
}


function hexToObj(hexStr: string) {
    hexStr = hexStr.toLowerCase().startsWith('0x') ? hexStr.substring(2) : hexStr;
    let str: any = Buffer.from(hexStr, 'hex').toString();
    try {
        str = JSON.parse(str);
        if (typeof str.Data === 'string') {
            try {
                str.Data = JSON.parse(str.Data);
            } catch (error) { }
        }
    } catch (error) { }
    return str;
}

export const getSystemContractInfo = async (params: any) => {
    const data = rawTxCall(params)
    const res = await web3.eth.call({
        to: builtInContractAddress,
        data: data
    })
    return hexToObj(res)
}


export const sendSystemContractOperation = async (params: any, otherParams: any) => {
    try {
        const data = await rawTxSend(params, otherParams)
        if (typeof data == 'object') return data
        return await rpc("bub_sendRawTransaction", [data]);
    } catch (e) {
        return false
    }
}


import Common from 'ethereumjs-common';
import * as RLP from 'rlp';
import axios from 'axios'
import { BN } from 'bn.js'
import {
    builtInContractAddress,
    builtInContractFnName,
    nodeList//@ts-ignore
} from './../../config/index.js'

let ethereumTransaction:any,
ethereumjsUtil:any,
k256:any,
other:any


(async()=>{
    if(!global.window){
        const {Transaction} = await import('ethereumjs-tx')
        ethereumjsUtil = await import('ethereumjs-util')
        other = await import('./init')
        const {keccak256} = await import('ethereum-cryptography/keccak')
        k256 = keccak256
        ethereumTransaction = Transaction
    }
})()



const networkInfo = nodeList[0]
const client = axios.create({ baseURL: networkInfo.netWorkUrl })

export const bigNumBuf = function (intStr: any, radix?: any, byteLen?: any) {
    radix = radix || 10;
    let num = new BN(intStr, radix);
    byteLen = byteLen || Math.ceil(num.byteLength() / 8) * 8; //
    return num.toTwos(byteLen).toBuffer();
};

export const getNonce = async (address: string) => {
    return await rpc('eth_getTransactionCount',[address,'latest']);
}


export const hexStrBuf = function (str: any) {
    if (!str) return ''
    str = str.startsWith('0x') || str.startsWith('0X') ? str.substring(2) : str;
    return Buffer.from(String(str), 'hex');
};


export const getNodeId = (event: any, obj: any) => {
    const data = other.getNodeInfo()
    const webContents = event.sender
    webContents.send('get-node-info', { data: data && data?.toString() })
}

export const getBlsPubkey = (event: any) => {
    const webContents = event.sender
    const data = other.getBlsPubInfo() 
    webContents.send('queryBlsPubKey', { data: data && data?.toString() || '' })
    
}



export const transactionFn = (event: any, data: any) => {
    let rawTransaction
    try {
        const customCommon = Common.forCustomChain(
            'mainnet',
            {
                name: 'my-network',
                networkId: 1,
                chainId: data.chainId,
            },
            'petersburg'
        );

        const tx = new ethereumTransaction(data.rawTx, { common: customCommon });
        tx.sign(Buffer.from(data.privateKey, 'hex'));
        rawTransaction = tx.serialize().toString('hex');
        if (rawTransaction && !rawTransaction.startsWith('0x')) {
            rawTransaction = '0x' + rawTransaction;
        }
    } catch (e) {
        console.log(e);
    }
    const webContents = event?.sender
    if(!webContents) return rawTransaction
    webContents.send('transactionFn', { data: rawTransaction })
}


export const signData = (event: any, data: any,type?:any) => {
    const hash = k256(Buffer.from(data.data));//
    const privateKey = data.privateKey.startsWith('0x') ? data.privateKey.slice(2) : data.privateKey;
    //@ts-ignore
    const signature = ethereumjsUtil.ecsign(hash, 
        Buffer.from(privateKey, 'hex'));
    const r = signature.r.toString('hex');
    const s = signature.s.toString('hex');
    const v = signature.v == 27 ? '00' : '01';
    const obj = { data: {   message: data,
        //@ts-ignore
        messageHash: '0x' + hash.toString('hex'),
        v: '0x' + v,
        r: '0x' + r,
        s: '0x' + s,
        signature: '0x' + r + s + v} }
    return obj
}


export const availablePorts = async (item:any,api?:any)=>{
    //@ts-ignore
    const {data}:any = await signData({},{data:item.num,privateKey:item.privateKey},'availablePorts')
    if(api) api = axios.create({ baseURL: api })
    return await rpc('net_availablePorts', [
        '0x'+BigInt(item.chainId).toString(16),
        +item.num,
        data.signature
    ],api) 
}

export const rpc = async (method: any, params?: any, api?:any) => {
    try {
        params = params || [];
        api = api || client
        const data = { "jsonrpc": "2.0", "method": method, "params": params, "id": new Date().getTime() }
        let replay = await api.post("", data);
        if (replay.status === 200) {
            if (undefined === replay.data.result && undefined != replay.data.error) {
                return Promise.reject(replay.data.error);
            } else {
                return Promise.resolve(replay.data.result);
            }
        } else {
            return Promise.reject("request error");
        }
    } catch (error) {
        console.log(error);
        return Promise.reject(error)
    }
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

export const rawTxSend = async (params: any, other: any) => {
    const privateKey = other.privateKey
    const chainId = other.chainId
    const address = other.address
    let rawTx: any = {}
    let paramsNew = objToParams(params);
    rawTx.data = paramsToData(paramsNew);
    rawTx.from = address;
    rawTx.to = builtInContractAddress;

    rawTx.gasPrice = (other && other.gasPrice) || '0x746a528800';
    rawTx.nonce = other?.nonce
    try {
        rawTx.gas = await rpc("bub_estimateGas", [rawTx])
    } catch (e) {
        return e
    }
    return await signTx(privateKey, chainId, rawTx);

}

const signTx = async (privateKey: String, chainId: number, rawTx: any) => {
    privateKey = privateKey.toLowerCase().startsWith('0x') ? privateKey.substring(2) : privateKey;
    if(global.window) return await forwardTransaction({privateKey, rawTx, chainId})
    return await transactionFn({},{
        privateKey, rawTx, chainId,
    })
}

const forwardTransaction = async (data: any) => {
    const { electron }: any = global.window
    return await new Promise((resolve, reject) => {
        electron.transactionFn(data, (data: any, value: any) => {
            resolve(value?.data)
        }) 
    })
}


export function paramsToData(params: any) {
    const arr: any = []
    for (let v of params) {
        if(!v){ arr.push('');continue;}
        v = RLP.encode(v)
        arr.push(v)
    }
    return '0x' + RLP.encode(arr).toString('hex');
}

export const rawTxCall = (params: any) => {
    return paramsToData(objToParams(params));
}

export function objToParams(params: any) {
    if (!Array.isArray(params)) {
        const data = [params.funcType]
        const order = builtInContractFnName[params.funcType];
        for (const key of order) {
            data.push(params[key])
        }
        return data;
    }
    return params;
}

import * as fs from 'fs'
import * as path from "path";

const isPortAvailable = require('is-port-available');

let rootPath = process.cwd()
if(process.platform !== 'win32'){
    rootPath = `${process.env.HOME}/Library/Turn_micro`
}

export const filterPrivateKey = (str: string): string => {
    let key: any = str
    if(!key) return '' 
    key = key.split('\n')
    key = key.length ? key[0] : ''
    key = key.split('PrivateKey:')
    key = key.length ? key[1] : ''
    key = String(key).trim()
    return key
}

export const filterPublicKey = (str: string): string => {
    let key: any = str
    if(!key) return '' 
    key = key.split('\n')
    key = key.length ? key[1] : ''
    key = String(key).replace(/PublicKey/g, '')
    key = String(key).replace(/\:/g, '')
    key = String(key).trim()
    return key
}



export const _writeFile = (p: string, str: string) => {
    const file = fs.openSync(path.join(rootPath, p), 'w+')
    fs.writeSync(file, filterPrivateKey(str));
    fs.closeSync(file);
}

export const _writePublicFile = (p: string, str: string) => {
     try{
        const file = fs.openSync(path.join(rootPath, p), 'w+')
        fs.writeSync(file, filterPublicKey(str));
        fs.closeSync(file);
     }catch(e){
        console.log(e)
     }
}


export const portAvailable = async (port: number): Promise<any> => {
    const status = await isPortAvailable(port)
    if (!status) {
        return await portAvailable(port + 1)
    }
    return port
}



/**
 *判断字符类型 
 */
export function CharMode(iN: number) {
    if (iN >= 48 && iN <= 57) //数字    
        return 1;
    if (iN >= 65 && iN <= 90) //大写字母    
        return 2;
    if (iN >= 97 && iN <= 122) //小写    
        return 4;
    else
        return 8; //特殊字符    
}
/** 
 * 统计字符类型 
 */
export function bitTotal(num: any) {
    var modes = 0;
    for (let i = 0; i < 4; i++) {
        if (num & 1) modes++;
        num >>>= 1;
    }
    return modes;
}
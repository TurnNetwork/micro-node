import Big from 'big.js'
import Web3 from 'Web3Dist';
const CryptoJS: any = {}

export function CharMode(iN: number) {
    if (iN >= 48 && iN <= 57) //    
        return 1;
    if (iN >= 65 && iN <= 90) //    
        return 2;
    if (iN >= 97 && iN <= 122) //    
        return 4;
    else
        return 8; //    
}
export function bitTotal(num: any) {
    var modes = 0;
    for (let i = 0; i < 4; i++) {
        if (num & 1) modes++;
        num >>>= 1;
    }
    return modes;
}


export const Md5 = (str: string) => {
    if (!str) return
    //@ts-ignore
    const { electron } = window
    const wordArray = electron.cryptoJS2('enc.Utf8.parse', str);
    const md5WordArray = electron.cryptoJS2('MD5', wordArray);
    const md5Str = electron.cryptoJS2('enc.Hex.stringify', md5WordArray);
    return md5Str
}



export const processNum = (balance: string, decimals: string): string => { 
    if (!balance) return '0'
    const num = new Big(balance)
        .div(new Big(10).pow(+decimals))
        .toFixed();
    return num
}

export const processNumTimes = (balance: string, decimals: string): string => {
    if (!balance) return '0'
    const num = new Big(balance)
        .times(new Big(10).pow(+decimals))
        .toFixed()
    return num
}


export const compareVersions = (version1: string, version2: string) => {

    const arr1: any[] = version1.replace(/v/g, '').split('.');
    const arr2: any[] = version2.replace(/v/g, '').split('.');
    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
        const num1 = parseInt(arr1[i] || 0); 
        const num2 = parseInt(arr2[i] || 0);

        if (num1 < num2) {
            return -1; // 
        } else if (num1 > num2) {
            return 1; // 
        }
    }

    return 0; 
}
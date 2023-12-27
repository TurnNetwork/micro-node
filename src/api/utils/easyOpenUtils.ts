// import CryptoJS from 'crypto-js'
const CryptoJS: any = {}
function add0(m: number | string) { return +m < 10 ? '0' + m : m }


export function formatDate(time: Date) {
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}


export function buildSign(postData: any, secret: any) {
    //@ts-ignore
    const { electron } = window
    if (typeof postData === 'string') {
        throw new Error('postData no {}');
    }
    var paramNames = [];
    for (var key in postData) {
        paramNames.push(key);
    }

    paramNames.sort();

    var paramNameValue = [];

    for (var i = 0, len = paramNames.length; i < len; i++) {
        var paramName = paramNames[i];
        paramNameValue.push(paramName);
        paramNameValue.push(postData[paramName]);
    }

    const source = secret + paramNameValue.join('') + secret;
    return electron.cryptoJS('MD5', source)
}
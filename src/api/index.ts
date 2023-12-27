import axios from 'axios'
//@ts-ignore
import {
    versionInfo
} from 'root/config/index.js'



export const versionInfoApi = axios.create({
    baseURL: versionInfo.url,
    timeout: 50000,
    headers: {
    }
})



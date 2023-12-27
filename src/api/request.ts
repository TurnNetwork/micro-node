import axios from 'axios'
import {webHttpConfig} from 'root/config/index.js'
// @ts-ignore
import { buildSign, formatDate } from './utils/easyOpenUtils.js'
import { ElMessage } from 'element-plus'


const easyOpenConfig = {
    app_key: webHttpConfig.appKey,
    secret: webHttpConfig.secret,
    jwt: ''
}


const api = axios.create({
    baseURL: webHttpConfig.url,
    timeout: 50000,
    headers: {}
})


api.interceptors.request.use(
    (config: any) => {
        const postData: any = {}
        postData['app_key'] = easyOpenConfig.app_key;
        postData['format'] = 'json';
        postData['name'] = config?.url?.split('/').join('.');
        postData['timestamp'] = formatDate(new Date());
        postData['version'] = webHttpConfig.version;
        postData['data'] = encodeURIComponent(JSON.stringify(config.data));
        postData['sign'] = buildSign(postData, easyOpenConfig.secret);
        
        config.url = ''
        if (config?.data?.file) {
            postData['data'] = encodeURIComponent(JSON.stringify(config?.data?.other));
            config.data?.data.append('body_data', JSON.stringify(postData))
            config.data = config.data?.data
        } else {
            postData['data'] = encodeURIComponent(JSON.stringify(config.data));
            config.data = postData
        }
        return config
    },
    (error: any) => Promise.reject(error)
)

api.interceptors.response.use(
    (res: any) => {
        const { data, config } = res
        if (data.code == -1) {
            ElMessage.closeAll()
            ElMessage.error(data.msg || `error`)
        }
        if (data.code == -2) {
            ElMessage.closeAll()
            ElMessage.error(data.msg || `error`)
        }
        return data
    },
    (error: any) => Promise.reject(error)
)

export default api
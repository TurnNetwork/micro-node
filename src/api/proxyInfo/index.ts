import api from '../request'


const proxyInfo = {
    queryProxyList: (data: any): Promise<any> => {
        return api({
            method: 'POST',
            url: `bubble.proxy.get.server`,
            data
        })
    },
    queryPort: (data: any): Promise<any> => {
        return api({
            method: 'POST',
            url: `bubble.proxy.get.port`,
            data
        })
    },
    killPort: (data: any): Promise<any> => {
        return api({
            method: 'POST',
            url: `bubble.proxy.kill.by.port`,
            data
        })
    },

}


export default proxyInfo
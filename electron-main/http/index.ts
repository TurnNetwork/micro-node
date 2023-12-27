import * as http from 'node:http'


const parseUrl = (url: string) => {
    try {
        const list = url.split('?')
        let params: any = list[1] || ''
        let newParams = {}
        if (params) {
            params = params.split('&')
            params = params.map((v: string) => {
                let t = v.split('=')
                let obj: any = {}
                obj[t[0]] = t[1]
                return obj
            })

            params.forEach((v: any) => {
                newParams = { ...newParams, ...v }
            });
        }

        return {
            url: list[0],
            ...newParams
        }
    } catch (e) {
        return { url: false }
    }
}


export const httpServer = (port: number | string) => {
    
}
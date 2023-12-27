import * as path from "path";
import logger from './../log'
import { rimraf } from 'rimraf'
const { exec, execSync } = require('child_process');

const AdmZip = require('adm-zip')

let rootPath = process.cwd()
if(process.platform !== 'win32'){
    rootPath = `${process.env.HOME}/Library/Turn_micro`
}


export const unZip = async (name: string) => {
    try {
        const data = await rimraf(`${path.join(rootPath, '/download/unzip')}`);
        logger.info('del unzip file success')
    } catch (e) {
        logger.info('del unzip file error' + JSON.stringify(e))
    }
    try {
        return new Promise((resolve, rejects) => {
            const filePath = path.join(rootPath, '/download/', `${name}`)
            logger.info(filePath)
            const zip = new AdmZip(filePath);
            zip.extractAllToAsync(path.join(rootPath, '/download/unzip'), /*overwrite*/ true, (err: any) => {
                setTimeout(async () => {
                    const data = await copyFn()
                    resolve(data)
                }, 500)

                if (err) {
                    logger.info(`'',${err}`)
                    rejects(false)
                    return
                }
                logger.info(`''`)
            })

        })
    } catch (err) {
        logger.info(`'',${err}`)
    }
}



export const copyFn = () => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(rootPath, '/download/unZip')
        const filePath2 = process.env.NODE_ENV !== 'development' ? rootPath : path.join(rootPath, '/download/updateFile')
        const res = exec(`Xcopy   ${filePath} ${filePath2} /y /e /i /q`);
        if (res.error) {
            logger.info(`copy error${res.error}`)
            resolve(false)
            return
        }
        resolve(true)
        logger.info(`copy success`)
    })
}
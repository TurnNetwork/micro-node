import logger from 'electron-log'
import {execSync} from 'child_process'

logger.transports.file.level = 'debug'
logger.transports.file.maxSize = 1002430 // 
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}' // 
let date: any = new Date()
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
logger.transports.file.fileName = date + '.log' //

const path = require('path')
if(process.platform === 'win32'){
    const exePath = path.join(process.cwd(), '/') 
    logger.transports.file.resolvePath = () => exePath + '\\' + 'log\\' + date + '.log'
}else{
    execSync(`mkdir -p Turn_micro/turn`,{
        cwd: path.join(`${process.env.HOME}/Library/`,'')
    })
    execSync(`mkdir -p Turn_micro/log`,{
        cwd: path.join(`${process.env.HOME}/Library/`,'')
    })
    const exePath = path.join(process.env.HOME, '/Library/Turn_micro/log/') 
    logger.transports.file.resolvePath = () => exePath  + date + '.log'
}

export default {
    info(param: any) {
        logger.info(param)
    },
    warn(param: any) {
        logger.warn(param)
    },
    error(param: any) {
        logger.error(param)
    },
    debug(param: any) {
        logger.debug(param)
    },
    verbose(param: any) {
        logger.verbose(param)
    },
    silly(param: any) {
        logger.silly(param)
    }
}
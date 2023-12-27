import * as path from "path";
import * as fs from 'fs'
import * as os from 'os'
import JSONbig from 'json-bigint'
import {
    spawnSync,execSync
} from 'child_process'
import { erc20_code } from './erc20_code'
import { _writeFile,  _writePublicFile } from '../../utils/indes'
import logger from './../log'
import {
    genesisPath, InITGenesisPath,
    microWindowToolProcedure,
    microMacInterToolProcedure,
    microMacMToolProcedure,
    procedureDir,
    nodeKeyPath,
    nodeIdPath, blsKeyPath,
    blsPubPath
} from './../../config/index.js'
import {cwd} from 'node:process'

let rootPath = cwd()
if(process.platform !== 'win32'){
    rootPath = `${process.env.HOME}/Library/Turn_micro`
}

let procedureRoot = cwd()
if(process.platform !== 'win32' && process.env.NODE_ENV !== 'development'){
    procedureRoot =  path.join(__dirname, '../../../')
}


export {
    procedureRoot,
    rootPath
}

export const nodeInit = (event: any) => {
    const webContents = event.sender
    createNodeKeyOrId()
    createBlsKeyPath()
    webContents.send('createBlsNodeIdWatch', { code: 'createBlsNodeIdWatch' })
}

export const getNodeInfo = () => {
    let str
    try {
        str = fs.readFileSync(`${path.join(rootPath, nodeIdPath)}`)
        logger.info(JSON.stringify('get NodeInfo data:' + str))
    } catch (err) {
        logger.error(JSON.stringify('get  NodeInfo  data error:' + err))
    }
    return str
}

export const getBlsPubInfo = () => {
    let str
    try {
        str = fs.readFileSync(`${path.join(rootPath, blsPubPath)}`)
        logger.info(`get  BlsPubkey  data:${str}`)
    } catch (e) {
        logger.error(`get   BlsPubkey error:${JSON.stringify(e)}`)
    }
    return str
}


export const getGenesisJson = () => {
    let str
    try {
        str = fs.readFileSync(`${path.join(rootPath, InITGenesisPath)}`)
    } catch (err) {
        logger.error(JSON.stringify('get  GenesisJson   err:' + err))
    }
    return String(str)
}


export const createNodeKeyOrId = () => {
    try {
        fs.readFileSync(`${path.join(rootPath, nodeKeyPath)}`)
    } catch (err) {
        logger.error(JSON.stringify('nodePath' + err))
        let procedureName = microWindowToolProcedure
        
        if(process.platform == 'darwin'){
            procedureName = microMacInterToolProcedure 
            if(process.arch == 'arm64')procedureName = microMacMToolProcedure
        }
     

        const childTool = spawnSync(`${path.join(procedureRoot, `${procedureDir}${procedureName}`)}`, ['genkeypair'], { //node key
            cwd: path.join(procedureRoot, procedureDir)
        });

        const str = childTool?.stdout?.toString()
        
        _writeFile(nodeKeyPath, str)
        _writePublicFile(nodeIdPath, str)
        logger.info(JSON.stringify('write node info-success' + str))
    }
}


export const createBlsKeyPath = () => {
    try {
        fs.readFileSync(`${path.join(rootPath, blsKeyPath)}`)
    } catch (err) {
        let procedureName = microWindowToolProcedure
        if(process.platform == 'darwin'){
            procedureName = microMacInterToolProcedure
            if(process.arch == 'arm64')procedureName = microMacMToolProcedure
        }
        logger.error(JSON.stringify('blsKeyPath' + err))
        const childTool = spawnSync(`${path.join(procedureRoot,
            `${procedureDir}${procedureName}`)}`, ['genblskeypair'], { //blskey key
            cwd: path.join(procedureRoot, procedureDir),
        });
        const str = childTool?.stdout?.toString()
        _writeFile(blsKeyPath, str)
        _writePublicFile(blsPubPath, str)
        logger.info(JSON.stringify('write blsKey info-success' + str))
    }
}



export const writeFile = (params: any) => {
    try {

        if (params.config?.chainId) params.config.chainId = BigInt(params.config.chainId)
        if (params.opConfig.mainChain?.balance) params.opConfig.mainChain.balance = BigInt(params.opConfig.mainChain.balance)
        if (params.opConfig?.subChain?.balance) params.opConfig.subChain.balance = BigInt(params.opConfig.subChain.balance)
        if (params.economicModel?.staking?.stakeThreshold) params.economicModel.staking.stakeThreshold = BigInt(params.economicModel.staking.stakeThreshold)
        if (params.economicModel?.staking?.operatingThreshold) params.economicModel.staking.operatingThreshold = BigInt(params.economicModel.staking.operatingThreshold)
        if (params.economicModel?.restricting?.minimumRelease) params.economicModel.restricting.minimumRelease = BigInt(params.economicModel.restricting.minimumRelease)
        if (params.economicModel?.innerAcc?.bubbleFundBalance) params.economicModel.innerAcc.bubbleFundBalance = BigInt(params.economicModel.innerAcc.bubbleFundBalance)
        if (params.economicModel?.innerAcc?.cdfBalance) params.economicModel.innerAcc.cdfBalance = BigInt(params.economicModel.innerAcc.cdfBalance)
        if (params.alloc) params.alloc = {
            ...params.alloc,
            ...erc20_code
        }

        const file = fs.openSync(`${path.join(rootPath, genesisPath)}`, 'w+')
        fs.writeSync(file, Buffer.from(JSONbig.stringify(params)));
        fs.closeSync(file);
        return true
    } catch (e) {
        logger.info(JSON.stringify('writeFile genesisFile catch' + e))
        return false
    }
}


export const inspectProcedure = ()=>{
    const platform = os.platform();
    if(platform === 'win32'){
        try{
            const childTool = spawnSync(`tasklist`, ['/fi',"imagename eq Turn_micro.exe"], {});
            let terminalOut:any = childTool?.stdout?.toString()
            if(!terminalOut) return true
            logger.info(JSON.stringify('tasklist' + terminalOut))
            terminalOut = terminalOut.split('\r\n')
            if(!terminalOut[3])return true
            terminalOut = terminalOut[3]
            terminalOut = terminalOut.split(' ').filter((v:any)=>v).filter((v:any)=>!isNaN(v))
            const spawnData:any = spawnSync('taskkill',['/pid',`${terminalOut[0]}`,'/f']);
            const str1 = spawnData.stdout.toString()
            const str3 = spawnData.stderr.toString()
            if(!str3)return true
        }catch(e){
            logger.error(`inspectProcedure error ${JSON.stringify(e)}`)
        }
    }
}

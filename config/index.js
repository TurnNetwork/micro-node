
export const webHttpConfig = {
    url: '',
    appKey: '',
    secret: "",
    version: ''
}
export const symbol = 'TURN'
export const local_RPCProt = '18511'
export const turn_httpProt = '18711'
export const turn_wsProt = '18811'
export const turn_p2pProt = '18911'

export const procedureDir = '/turn/'
export const microWindowToolProcedure = 'keyTool.exe'
export const microMacInterToolProcedure = 'mac_inter/keyTool'
export const microMacMToolProcedure = 'mac_m/keyTool'
export const microWindow = 'Turn_micro.exe'
export const microMacInter = 'mac_inter/Turn_micro'
export const microMacM = 'mac_m/Turn_micro'
export const nodeKeyPath = `${procedureDir}nodeKey`
export const nodeIdPath = `${procedureDir}nodeId`
export const blsKeyPath = `${procedureDir}blsKey`
export const blsPubPath = `${procedureDir}blsPub`
export const genesisPath = `${procedureDir}genesis.json`
export const InITGenesisPath = `${procedureDir}InItGenesis.json`

export const addr = '0.0.0.0'
export const procedureDirData = process.env.NODE_ENV == 'development' ?
    'bubbleData' : 'data'


export const node_status = {
    '1': 'Unpledged',
    '2': 'Pledged',
    '3': 'Pledged - Not Started'
}

export const nodeList = [
    {
        default: true,
        name: 'Turn test',
        scanUrl: 'https://scan.bubbonet.com/',
        netWorkUrl: 'https://rpc.bubbonet.com/',
        chainId: '2501',
    },

]

export const version = {
    "name": "Turn Micro Node",
    "title": "Turn Micro Node",
    "networkName": "Turn Network",
    "private": true,
    "version": "0.2.1"
}

export const versionInfo = {
    url: ''
}


export const builtInContractAddress = '0x2000000000000000000000000000000000000001'

export const builtInContractFnName = {
    "7000": [
        'nodeID',
        "amount",
        "beneficiary",
        "name",
        "details",
        "electronURI",
        "p2pURI",
        "version",
        "blsPubkey",
        "isOperator"
    ],
    "7001": [
        'nodeID',
        'beneficiary',
        'name',
        'detail',
        'rpcURI'
    ],
    "7003": ['nodeID'],
    "7103": ['nodeID']
}
<template>
    <div v-loading="loading" :element-loading-text="loadingText" :element-loading-background="'rgba(122, 122, 122, 0.8)'"
        class="gradient w-full h-full p-[20px] px-[40px] text-[#fff] leading-[30px]">
        <div class="font-600 text-[18px]">Network</div>
        <div class="mb-[50px] flex items-center justify-between">
            <div class="text-[14px] text-[#D7D7D7]">Select the Trun Network network environment in which the microsection
                runs.</div>
            <el-select v-model="proxySelectUrl" class="m-2 _select" placeholder="Select" size="large">
                <el-option v-for="( item, index ) in  proxyList " :key="index" :label="item.ip" :value="item.ip" />
            </el-select>
        </div>
        <div class="flex items-center justify-between">
            <div>
                <div>
                    <!-- <span class="font-600 text-[18px]">Node </span> - {{ nodeEnum[stakeStatus + 1] }} -->
                    <span class="font-600 text-[18px]">Node </span> - {{ isStart ? 'Pledged' : stakeStatus ? 'UnStakeIng' :
                        'Unpledged' }}
                </div>
                <div class="mt-[20px]">
                    <span class="font-600 text-[16px] inline-block w-[90px]"> Name: </span>
                    <span class="text-[14px]">
                        {{ activeWallet?.name || '' }}
                    </span>
                </div>
                <div>
                    <span class="font-600 text-[16px] inline-block w-[90px]">
                        Address:
                    </span>
                    <span class="text-[14px]"> {{ activeWallet?.address || '' }}</span>
                    <el-icon class="cursor-pointer mt-[5px] ml-[10px]" @click="copyFn(activeWallet?.address)">
                        <CopyDocument />
                    </el-icon>
                </div>
                <div class="flex">
                    <span class="font-600 text-[16px]  inline-block w-[90px]">Node ID :</span>
                    <p class="flex break-all w-[540px]">
                    <div class="text-[14px]">
                        {{ nodeId }}
                    </div>
                    <el-icon class="mt-[8px] ml-[10px] cursor-pointer" @click="copyFn(nodeId)">
                        <CopyDocument />
                    </el-icon>
                    </p>
                </div>
            </div>
            <div @click="startFn"
                :class="`start text-[20px] ${isStart ? 'start_active' : stakeStatus ? 'cursor-none' : ''}`">
                {{ isStart ? 'stop' : stakeStatus ? 'UnStakeIng' : 'start' }}
            </div>
        </div>
        <!-- start ========> 测试使用代码 勿删 -->
        <div v-if="showTestBth" class=" absolute top-[120px] right-[50px] z-10 bg-[#fff]">
            <el-radio-group v-model="TestOperational" class="ml-4">
                <el-radio label="true" size="large">yes</el-radio>
                <el-radio label="false" size="large">No</el-radio>
            </el-radio-group>
            <el-button @click="openTestProxy">测试使用 开启代理</el-button>
        </div>
        <!-- end ========> 测试使用代码 勿删 -->

        <div class="tb mt-[100px] ">
            <div class="text-[#D7D7D7] text-[14px]">
                <span class="font-600  inline-block w-[90px]">Unit: </span>
                {{ SYMBOL }}
            </div>
            <div class="text-[#D7D7D7] text-[14px]">
                <span class="font-600  inline-block w-[90px]">Balance:</span>
                {{ balance }}
            </div>
            <div class="flex items-center justify-between text-[#D7D7D7] text-[14px]">
                <div>
                    <span class="font-600  inline-block w-[90px]">Staking: </span>
                    {{ stakeAmount || '0' }}
                </div>
                <el-button type="text" v-if="nodeId && !stakeStatus && stakeStatus !== 0" class="cursor-pointer"
                    @click="showStakingModal">
                    <span class="text-[16px] text-[#fff]" style="text-decoration: underline solid #ccc;"> Staking</span>
                </el-button>
            </div>
            <div class="flex items-center justify-between text-[#D7D7D7] text-[14px]">
                <div>
                    <!-- Cumulative mining reward: <span class="ml-[10px]">{{ miningReward || 0 }}</span> -->
                </div>
                <el-button type="text" v-if="nodeId && stakeStatus === 0 || stakeStatus && stakeStatus < 2"
                    class="cursor-pointer" @click="unStakeFn">
                    <span class="text-[16px] text-[#fff]" style="text-decoration: underline solid #ccc;"> unStake</span>
                </el-button>
                <el-button type="text" v-if="nodeId && stakeStatus == 2" class="cursor-pointer">
                    <span class="text-[16px] text-[#fff]" style="text-decoration: underline solid #ccc;"> unStake ing</span>
                </el-button>
            </div>
            <!-- <div class="text-[#D7D7D7] text-[14px]">
                Cumulative staking reward:
                <span class="ml-[10px]" style="text-decoration: underline solid #ccc;"> {{ stakingReward || 0 }}</span>
            </div> -->
            <!-- <div class="cursor-pointer text-[#D7D7D7]" style="text-decoration: underline solid #ccc;">
                <span @click="openExternal">Node behavior</span>
            </div> -->
        </div>
        <!-- {{ stakeAmount }} -->
        <Stake v-if="stakeShow" ref="stakeRef" :balance="balance" @close="stakeShow = false" :stakeType="stakeType"
            :activeWallet="activeWallet" :stakeAmount="stakeAmount" @stakIngFn="callBackStartMicro"
            @unStakIngFn="callBackUnStakeNode" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watchEffect, readonly, h, onBeforeUnmount } from 'vue'
import {
    getBalance,
    getSystemContractInfo, getNonce,
    sendSystemContractOperation,
    web3,
    hexStrBuf,
    bigNumBuf, rpc
} from '@/web3Api/index'
import { useWallet } from '@/store/index'
//@ts-ignore
import { node_status, symbol, nodeList as BubbleNodeList } from 'root/config/index.js'
import * as copy from 'copy-to-clipboard'
import { ElMessage, ElMessageBox } from 'element-plus'
import Stake from './Stake.vue'
import { processNum } from '@/utils/index'
import proxyInfo from '@/api/proxyInfo'
import axios from 'axios'

const stakeRef = ref()
const stakeShow = ref(false)
const SYMBOL = readonly<any>(symbol)
const walletStore = useWallet()
const balance = ref('0')
const activeWallet: any = ref({})
const stakingReward = ref('')//累计质押奖励
const miningReward = ref('')//累计挖矿奖励
const isStart = ref(false)
const stakeType = ref('')
const proxyList: any = ref()
const proxySelectUrl: any = ref()
const proxyProtList: any = ref([])
const nodeId: any = ref('')
const sshHeartbeatNum = ref()
const privateData: any = ref({})
const blsPubkey = ref({})
const loading = ref(true)
const loadingText = ref('System self check in progress')
const TestOperational = ref('false')
const stakeAmount: any = ref('')
const stakeStatus: any = ref(false)
const stakeInfo: any = ref({})
const atTimeTimerQueryBalanceNum = ref()
const showTestBth = ref(process.env.NODE_ENV == 'development')
const TRYSSHINFO = ref(false)

const getWallet = async (store: any) => {
    store = store && Object.values(store).filter((v: any) => v.active) || []
    activeWallet.value = store[0]
    if (activeWallet.value?.address) {
        const res = await getBalance(activeWallet.value.address)
        balance.value = processNum(res, '18')
    }
}

const openTestProxy = async () => {
    const { electron }: any = window
    const params: any = {
        origin_prot: proxyProtList.value[0],
        proxy_ip: proxySelectUrl.value,
        p2p_proxy_prot: proxyProtList.value[1],
        IsOperator: false,
        node: nodeId.value
    }
    await killProxy([proxyProtList.value[0]])
    if (TestOperational.value == 'true') {
        await queryProxyPortList()
        params.IsOperator = true
        params.rpc_proxy_port = proxyProtList.value[0]
    }
    sshHeartbeat(`http://${proxySelectUrl.value}:${proxyProtList.value[0]}`)
    electron.openProxy(params)
}

const checkProxy = async () => {
    try {
        let params: any = localStorage.getItem('oldProtOperate')
        params = JSON.parse(params)
        if (params && (stakeStatus.value === 0 || stakeStatus.value && stakeStatus.value < 2)) {
            const { electron }: any = window
            electron.originForwardLocal(params, () => { })
        }
    } catch (e) {
        console.log('checkProxy', e);
    }
}


watchEffect(() => {
    getWallet(walletStore.wallet)
})

const copyFn = async (str?: string) => {
    //@ts-ignore
    const api = process.env.NODE_ENV == 'development' ? copy : copy?.default
    await api(str);
    setTimeout(() => {
        ElMessage.success('copy success')
    }, 500);
}



onMounted(async () => {
    try {
        loadingText.value = "System self check in progress"
        loading.value = true
        // const data = await getChainId()
        atTimerQueryBalance()
        watchElectron()
        await queryNodeId()
        await getBlsPubKey()
        await queryProxyList() //获取代理
        loading.value = false
    } catch (e) {
        loading.value = false
        ElMessage.error('Detection failed')
    }
})

onBeforeUnmount(() => {
    clearTimeout(sshHeartbeatNum.value)
    clearTimeout(atTimeTimerQueryBalanceNum.value)
})


const atTimerQueryBalance = () => {
    if (atTimeTimerQueryBalanceNum.value) clearTimeout(atTimeTimerQueryBalanceNum.value)
    const address = activeWallet.value?.address
    atTimeTimerQueryBalanceNum.value = setTimeout(async () => {
        if (address) {
            try {
                const res = await getBalance(address)
                balance.value = processNum(res, '18')
            } catch (e) {
                console.log('query balance error');
            }
        }
        atTimerQueryBalance()
    }, 10000)
}

//定时查询
const sshHeartbeat = (url: string) => {
    if (sshHeartbeatNum.value) clearTimeout(sshHeartbeatNum.value)
    sshHeartbeatNum.value = setTimeout(async () => {
        try {
            const data = await axios.post(url)
            console.log('success ==> ssh HeartbeatNum', data);
        } catch (e) {
            console.log('error ==>  origin port check:', e);
            //失败断开接口尝试重新链接
            await killProxy([proxyProtList.value[0]])
            setTimeout(() => {
                checkProxy()
            }, 10)
        }
        try {
            await queryStakeIngInfo(hexStrBuf(nodeId.value))
        } catch (e) {
            console.log('error ==>  timer  queryStakeIngInfo:', e);
        }
        sshHeartbeat(url)
    }, (1000 * 60 * 1))
}




const watchElectron = () => {
    const { electron }: any = window
    electron.createBlsNodeIdWatch(() => {
        queryNodeId()
        getBlsPubKey()
    })
    electron.TRYSSHINFO((_: any, value: any) => {
        //   console.log('TRYSSHINFO',value);
        TRYSSHINFO.value = value?.data || false
    })
}

const restart = () => {
    const { electron }: any = window
    electron.SETTRYSSHINFO()
}


const queryProxyPortList = async (number?: any) => {
    ElMessage.closeAll()
    if (!nodeId.value) ElMessage.warning('node id null')
    proxyInfo.queryPort({
        ip: proxySelectUrl.value,
        num: 2,
        nodeId: nodeId.value
    }).then((res) => {
        if (res.code == 0) {
            proxyProtList.value = res.data.map((v: any) => v.port)
        }
    }).catch((err) => {
        console.log('queryProxyPortList', err);
    })
}

const queryProxyList = () => {
    proxyInfo.queryProxyList({}).then((res) => {
        if (res.code == 0) {
            proxyList.value = res.data || []
            proxySelectUrl.value = proxyList.value[0].ip
            queryProxyPortList()
        }
    }).catch((err) => {
        console.log('queryProxyList', err);
    })
}
const killProxy = async (ports: any, flag = false) => {
    await proxyInfo.killPort({
        nodeId: nodeId.value,
        portList: ports,
        deleteRecord: flag
    })
}


const queryNodeId = async () => {
    const { electron }: any = window
    const data = await new Promise((resolve, reject) => {
        electron.getNodeInfo(async (data: any, value: any) => {
            nodeId.value = value?.data
            if (!nodeId.value) {
                electron.initTurnNode()
                return
            }
            const nodeIDHex = nodeId.value && hexStrBuf(nodeId.value)
            nodeIDHex && await queryStakeIngInfo(nodeIDHex)
            resolve(value?.data)
        })
    })
    return data
}



const getBlsPubKey = async () => {
    const { electron }: any = window
    return await new Promise((resolve, reject) => {
        electron.queryBlsPubKey((data: any, value: any) => {
            blsPubkey.value = value?.data
            resolve(value?.data)
        })
    })
}


const queryStakeIngInfo = async (nodeIDHex: any, type?: string) => {
    if (!nodeIDHex) return
    const res = await getSystemContractInfo([7103, nodeIDHex])
    console.log(`query stake info`, res);
    if ([321201, '321201'].includes(res?.Code)) {
        stakeStatus.value = false
        isStart.value = false
        clearTimeout(sshHeartbeatNum.value)
        return false // 没有查询到信息 //质押失败
    }
    const Ret = res?.Ret || {}
    stakeStatus.value = Ret?.Status || Ret?.Status == 0 ? Ret?.Status : false
    stakeAmount.value = Ret?.Shares ? processNum(BigInt(Ret?.Shares).toString(), '18') : 0
    stakeInfo.value = Ret
    if (type == 'unStake') {
        isStart.value = false
        await killProxy([proxyProtList.value[0]])
        clearTimeout(sshHeartbeatNum.value)
        setTimeout(() => {
            queryStakeIngInfo(nodeIDHex)
        }, 30000)
    } else {
        isStart.value = true
        if (!sshHeartbeatNum.value) sshHeartbeat(Ret.ElectronURI)
        if (TRYSSHINFO.value) restart()
    }
    return true
}

const showStakingModal = async () => {
    stakeShow.value = true
    stakeType.value = 'stakeIng'
    setTimeout(() => {
        stakeRef.value.propsStakeType = "stakeIng"
        stakeRef.value.dialogVisible = true
    }, 10)
}
const unStakeFn = async () => {
    stakeShow.value = true
    stakeType.value = 'unStakeIng'
    const ad = stakeInfo.value.StakingAddress && stakeInfo.value.StakingAddress.toLocaleLowerCase() || ''
    if (ad && ad !== activeWallet?.value?.address.toLocaleLowerCase()) {
        ElMessage.warning('The pledged wallet does not match the current linked wallet. Please switch wallets')
        return
    }
    setTimeout(() => {
        stakeRef.value.propsStakeType = "unStakeIng"
        stakeRef.value.dialogVisible = true
    }, 10)

}


const startCall = async () => {
    const data: any = privateData.value
    const nodeIDHex = hexStrBuf(nodeId.value)
    const privateKey = data.privateKey && data.privateKey.substring(2) || ''
    stakeNode(
        nodeId.value,
        nodeIDHex,
        privateKey,
        data.address,
        proxyProtList.value[0],
        proxySelectUrl.value,
        data.account,
        data.isOperator,
        data.gasPrice
    )
}


const stakeNode = async (
    nodeID: string,
    nodeIDHex: any | Buffer,
    privateKey: string,
    address: string,
    origin_prot: string | number,
    proxy_url: string,
    account: string,
    isOperator: any,
    gasPrice: any
) => {
    //这里写成异步调用
    const networkInfo = BubbleNodeList[0]
    const electron_rpcUrl = `http://${proxy_url}:${origin_prot}`
    let programVersionRes
    try {
        programVersionRes = await rpc('admin_getProgramVersion', '')
    } catch (e) {
        console.log('admin_getProgramVersion', e);
    }

    const version = Number(programVersionRes.Version)
    account = account && web3.utils.toWei(account, 'ether')
    isOperator = isOperator ? Buffer.from([1]) : Buffer.from([])  //节点是否运营节点，如果指定为True，则必须要填写RPC字段

    const nonce = await getNonce(address)
    // nonce = Number(nonce) //这里这么转的原因是  旧版本的的Sdk 不支持

    const params = [
        7000,
        nodeIDHex,
        bigNumBuf(account),
        hexStrBuf(address),
        activeWallet.value?.name || 'micro_turn_node_name',//节点名称
        'micro_turn_node_details',//节点描述
        electron_rpcUrl,
        Buffer.from(''),
        `enode://${nodeID}@127.0.0.1:0`,
        version,
        hexStrBuf(blsPubkey.value),
        isOperator,
    ]

    const stakeIngRes = await sendSystemContractOperation(params, {
        privateKey,
        provider: networkInfo.netWorkUrl,
        chainId: +networkInfo.chainId,
        address: address,
        nonce: Number(nonce)
    })

    ElMessage.closeAll()
    if (!stakeIngRes) {
        ElMessage.error('send System Contract stake hash null')
        return false
    }
    if (stakeIngRes.code) {
        ElMessage.error(stakeIngRes?.data?.message)
        return false
    }
    // window.localStorage.setItem('electron_rpcUrl',electron_rpcUrl)
    console.log('nodeIDHex', nodeIDHex);

    queryTransaction(stakeIngRes, nodeIDHex)
}

const queryTransaction = (hash?: string, hex?: any, type?: any) => {
    setTimeout(async () => {
        const data = await rpc('bub_getTransactionReceipt', [hash])
        console.log('queryTransaction', data);
        if (data?.status == '0x0') return ElMessage.error('staking error')
        if (data?.status == '0x1') {
            !type && await protOperate()
            await queryStakeIngInfo(hex, type)
            ElMessage.closeAll()
            ElMessage.success(type ? 'unStaking success' : 'staking success')
            return
        }
        queryTransaction(hash, hex, type)
    }, 2000)
}


const protOperate = async () => {
    const { electron }: any = window
    const proxy_prot = proxyProtList.value[0]
    const data: any = privateData.value
    const privateKey = data.privateKey && data.privateKey.substring(2) || ''
    const params: any = {
        origin_prot: proxy_prot,
        ip: proxySelectUrl.value,
        node: nodeId.value,
        prikey: privateKey,
        p2p_proxy_prot: proxyProtList.value[0],
        IsOperator: false
    }
    await killProxy([proxy_prot])
    if (privateData.value?.isOperator) {
        params.IsOperator = privateData.value?.isOperator
        params.rpc_proxy_port = proxyProtList.value[0]
    }

    await new Promise((resolve, reject) => {//远端端口映射
        localStorage.setItem('oldProtOperate', JSON.stringify(params))
        electron.originForwardLocal(params, (data: any, value: any) => {
            console.log('监控服务开启成功', params);
            resolve(value?.data)
        })
    })
    return true
}



const callBackStartMicro = async (data: any) => {
    privateData.value = data
    startCall()
}


const stopStepModal = async () => {


    const elDom = await ElMessageBox({
        title: 'Tips',
        message: h('div', null, [
            h('p', null, '1.Please confirm if the pledge has been successfully released '),
            h('p', null, '2.Micro nodes that are not pledged or participate in block consensus can be stopped at any time'),
        ]),
        showCancelButton: true,
        confirmButtonText: 'Stop',
        cancelButtonText: 'Cancel',
    })
    if (elDom !== 'confirm') return
    if (stakeStatus.value || stakeStatus.value === 0) {
        const elBoxDom = await ElMessageBox({
            title: 'Tips',
            message: h('div', null, [
                h('p', null, 'You need to release the pledge first to stop the micro node ')
            ]),
            showCancelButton: true,
            confirmButtonText: 'Release the pledge',
            cancelButtonText: 'Cancel',
        })
        if (elBoxDom !== 'confirm') return
        unStakeFn()
    }

}

const callBackUnStakeNode = async (data: any) => {
    const nodeIDHex = hexStrBuf(nodeId.value)
    const params = [7003, nodeIDHex,]
    const privateKey = data.privateKey && data.privateKey.substring(2) || ''
    const networkInfo = BubbleNodeList[0]
    const nonce = await getNonce(data.address)
    const stakeIngRes = await sendSystemContractOperation(params, {
        privateKey,
        provider: networkInfo.netWorkUrl,
        chainId: +networkInfo.chainId,
        address: data.address,
        nonce: Number(nonce),
    })
    ElMessage.closeAll()
    if (!stakeIngRes) {
        ElMessage.error('send System Contract un stake hash null')
        return false
    }
    if (stakeIngRes.code) {
        // console.log('stakeIngRes', stakeIngRes);
        ElMessage.error(stakeIngRes?.message)
        return false
    }
    queryTransaction(stakeIngRes, nodeIDHex, 'unStake')
}



const startFn = async () => {
    if (!isStart.value && stakeStatus.value) return
    if (isStart.value) return stopStepModal()
    if (stakeStatus.value >= 2) return ElMessage.warning('unStakeIng')
    if (stakeStatus.value || stakeStatus.value === 0) return isStart.value = true
    showStakingModal()
}

const openExternal = () => {
    const { electron = undefined }: any = window
    const url = `${BubbleNodeList[0].scanUrl}microNode-details?address=${nodeId.value}`
    electron?.openUrl(url)
}


</script>
<style lang="scss" scoped>
.start {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    cursor: pointer;
}

:deep(._select .el-input__wrapper) {
    background: transparent;

    .el-input__inner,
    .el-select__caret.el-icon {
        color: #fff;
    }
}

.start_active {
    position: relative;

    &::after {
        content: ' ';
        display: inline-block;
        position: absolute;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top: 3px solid #02a7f0;
        border-bottom: 3px solid #02a7f0;
        animation: rotate 2s infinite linear;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
}

.tb {
    line-height: 50px;
    border-top: 1px solid #fff;
    padding-top: 20px;
}
</style>
<template>
    <div :style="{ height: 'calc(100vh - 150px)' }" class="mt-[20px] pr-[10px] overflow-auto">
        <div class="flex justify-end  mb-[20px]">
            <el-button class="_bth" link @click="router.push({ path: '/guide', query: { p: route.path } })">Add
                wallet</el-button>
        </div>
        <div v-for="(item, index) in wallet" :key="index" class="_card mb-[20px]">
            <p> {{ item.name }}</p>
            <div class="flex justify-between">
                <div class="flex items-center">
                    <span>{{ item.address }}</span>
                    <!-- <img class="w-[16px] mx-[20px]" :src="codeIcon" /> -->
                    <el-icon class="cursor-pointer mx-[20px] " @click="copyFn(item.address)">
                        <CopyDocument />
                    </el-icon>
                </div>
                <div class="flex items-center ">
                    <div class="flex items-center" @click="activeItem(index)">
                        <el-icon v-if="item.active" style="font-size: 20px;">
                            <SuccessFilled />
                        </el-icon>
                        <i v-else class="round"></i>
                    </div>
                    <el-dropdown class="_me-dropdown" @command="(e: any) => handleCommand(e, item, index)">
                        <ul class="_more w-[20px] flex justify-center flex-col cursor-pointer">
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="walletName">Wallet name</el-dropdown-item>
                                <el-dropdown-item command="exportWords" v-if="item?.json['x-ethers']">Export
                                    mnemonicPhrase</el-dropdown-item>
                                <el-dropdown-item command="exportPrivate">Export privateKey</el-dropdown-item>
                                <el-dropdown-item command="updatePwd">Change Password</el-dropdown-item>
                                <el-dropdown-item command="resetPwd">Reset Password</el-dropdown-item>
                                <el-dropdown-item command="del" v-if="!item?.active">Delete</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            <div>
                <span class="inline-block w-[80px]">Balance :</span>
                <span class="pl-[20px]">{{ handBalanceList(index) }}</span>
            </div>
        </div>
        <UpdatePwd ref="updatePwdRef" @updateConfirm="updateConfirm" />
        <RestPwd ref="resetPwdRef" @resetConfirm="resetConfirm" />
        <ExportWallet ref="exportWalletRef" />
        <UpdateName ref="updateNameRef" @updateNameConfirm="updateNameConfirm" />
    </div>
</template>
<script setup lang="ts">
import { ref, toRaw, onBeforeUnmount } from 'vue'
import { useWallet } from '@/store/index'
import * as copy from 'copy-to-clipboard'
import { ElMessage, ElMessageBox } from 'element-plus'
import codeIcon from '@/assets/images/codeIcon.svg'
import { useRouter, useRoute } from 'vue-router'
import { watchEffect } from 'vue'
import { getBalance, web3 } from '@/web3Api/index'
import { processNum } from '@/utils/index'
import RestPwd from './components/RestPwd.vue'
import UpdatePwd from './components/UpdatePwd.vue'
import ExportWallet from './components/ExportWallet.vue'
import UpdateName from './components/UpdateName.vue'

const router = useRouter()
const route = useRoute()
const walletStore = useWallet()
const resetPwdRef = ref()
const updatePwdRef = ref()
const exportWalletRef = ref()
const updateNameRef = ref()
const timer = ref()
const balanceList = ref<any[]>([])

const filterData = (data: any) => {
    let list = Object.values(data).map((v: any) => {
        return {
            ...v,
            json: JSON.parse(v.json)
        }
    })
    return list
}
const handBalanceList = (index: any) => {
    return balanceList.value && balanceList.value[index] || '0'
}
const wallet: any = ref(filterData(walletStore.wallet))

const copyFn = async (str: string) => {
    //@ts-ignore
    const api = process.env.NODE_ENV == 'development' ? copy : copy?.default
    console.log(api);
    await api(str);
    setTimeout(() => {
        ElMessage.success('copy success')
    }, 500);
}

const activeItem = (index: any) => {
    let list = wallet.value
    list = list.map((v: any) => {
        v.active = false
        return v
    })
    list[index].active = true
    const obj: any = {}
    list.forEach((v: any) => {
        v.json = JSON.stringify(v.json)
        obj[v.address] = toRaw(v)
    })
    walletStore.increment(obj)
}

const queryBalance = (obj: any) => {
    let list: any = Object.keys(obj)
    list = list.map(async (v: any) => {
        return await getBalance(v)
    })
    Promise.all(list).then(res => {
        balanceList.value = res.map((v: any) => {
            return processNum(v, '18')
        })
    }).catch(console.log).finally(() => {
        if (timer.value) clearTimeout(timer.value)
        timer.value = setTimeout(() => {
            queryBalance(obj)
        }, 2000)
    })

}
onBeforeUnmount(() => {
    clearTimeout(timer.value)
})

watchEffect(() => {
    const list = walletStore.wallet
    wallet.value = filterData(toRaw(walletStore.wallet))
    queryBalance(list)
})





const handleCommand = (key: any, item: any, index: any) => {
    const data = toRaw(item)
    // console.log(data)
    switch (key) {
        case 'del':
            del(item, index)
            break;
        case 'resetPwd':
            resetPwdRef.value.address = item.address
            resetPwdRef.value.dialogVisible = true
            break;
        case 'updatePwd':
            updatePwdRef.value.selectData = { ...data }
            updatePwdRef.value.dialogVisible = true
            break;
        case 'exportPrivate':
        case 'exportWords':
            exportWalletRef.value.selectData = { ...data, handType: key }
            exportWalletRef.value.dialogVisible = true
            break;
        case 'walletName':
            updateNameRef.value.selectData = { ...data }
            updateNameRef.value.dialogVisible = true
            break;

        default:
            break;
    }
}

const del = (item: any, index: any) => {
    if (item.active) {
        ElMessage.warning('Currently cannot be deleted')
        return
    }
    wallet.value.splice(index, 1)
    const obj: any = {}
    wallet.value.forEach((v: any) => {
        v.json = JSON.stringify(v.json)
        obj[v.address] = toRaw(v)
    })
    walletStore.increment(obj)
    ElMessage.warning('remove success')
}

const resetConfirm = (data: any) => {
    commonWalletUpdate(data)
}
const updateConfirm = (data: any) => {
    commonWalletUpdate(data)
}
const updateNameConfirm = (data: any) => {
    commonWalletUpdate(data)
}


const commonWalletUpdate = (data: any) => {
    let list = wallet.value
    list = toRaw(list)
    const obj: any = {}
    console.log(list);

    list.forEach((v: any) => {
        v.json = JSON.stringify(v.json)
        if (v.address == data.address) {
            obj[v.address] = {
                ...v,
                ...data
            }
            return
        }
        obj[v.address] = toRaw(v)
    })
    ElMessage.success('success')
    walletStore.increment(obj)
}


</script>
<style lang="scss" scoped>
._bth {
    :deep(span) {
        color: #fff;
    }
}

._more {
    margin-left: 20px;

    li {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #fff;

        &:nth-child(2) {
            margin: 2px 0;
        }
    }
}



._card {
    border: 1px solid #fff;
    padding: 20px 20px;
    border-radius: 10px;
}

.round {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .2);
    border: 1px solid rgba(255, 255, 255, .2);
}
</style>
<template>
    <div class="gradient w-full h-full p-[20px] px-[40px] text-[#fff] leading-[30px]">
        <div class="mb-[20px] mt-[20px]">
            <span class="inline-block w-[100px] text-[#D7D7D7]">NodeID:</span>
            <span>123456</span>
        </div>
        <div>
            <span class="inline-block w-[100px] text-[#D7D7D7]">Operating wallet:</span>
            <span>
                {{ activeWallet.address }}
            </span>
            <el-icon class="cursor-pointer ml-[20px]" @click="copyFn(activeWallet.address)">
                <CopyDocument />
            </el-icon>
        </div>
        <div>
            <span class="inline-block w-[100px] text-[#D7D7D7]">Earning wallet:</span>
            <span>
                {{ activeWallet.address }}
            </span>
            <el-icon class="cursor-pointer ml-[20px]" @click="copyFn(activeWallet.address)">
                <CopyDocument />
            </el-icon>
        </div>
        <div class="mt-[50px]">
            <span class="inline-block w-[120px] text-[#D7D7D7]">unit:</span>
            <span>{{ SYMBOL }}</span>
        </div>
        <div>
            <span class="inline-block w-[120px] text-[#D7D7D7]">Cumulative mining rewards:</span>
            <span>123456</span>
        </div>

        <div class="mx-[40px] my-[20px]">
            <h1>Reward for block output</h1>
            <div class="flex">
                <div>
                    <span class="inline-block text-[#D7D7D7] w-[110px]">Accumulated blocks:</span>
                    <span>501</span>
                </div>
                <div class="ml-[30px]">
                    <span class="inline-block text-[#D7D7D7] w-[110px]">Cumulative block reward:</span>
                    <span>501</span>
                </div>
            </div>
            <h1 class="mt-[50px]">Consensus reward</h1>
            <div class="flex">
                <div>
                    <span class="inline-block text-[#D7D7D7] w-[110px]">Cumulative participation consensus:</span>
                    <span>501</span>
                </div>
                <div class="ml-[30px]">
                    <span class="inline-block text-[#D7D7D7] w-[110px]">Cumulative consensus reward:</span>
                    <span>501</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watchEffect, onMounted, readonly } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWallet } from '@/store/index'
import * as copy from 'copy-to-clipboard'
//@ts-ignore
import { node_status, symbol, nodeList } from 'root/config/index.js'

const walletStore = useWallet()
const SYMBOL = readonly<any>(symbol)
const activeWallet: any = ref({})
const getWallet = async (store: any) => {
    store = Object.values(store).filter((v: any) => v.active) || []
    activeWallet.value = store[0]
}

watchEffect(() => {
    getWallet(walletStore.wallet)
})

const copyFn = async (str: string) => {
    //@ts-ignore
    const api = process.env.NODE_ENV == 'development' ? copy : copy?.default
    console.log(api);
    await api(str);
    setTimeout(() => {
        ElMessage.success('copy success')
    }, 500);
}


onMounted(async () => {

})





</script>
<style lang="scss" scoped></style>
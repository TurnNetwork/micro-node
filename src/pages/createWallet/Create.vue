<template>
    <div class="main main_l_bg flex  justify-center">
        <div class="z-2 relative pt-[20vh]">
            <el-steps :active="stepActive" align-center>
                <el-step title="Create" />
                <el-step title="Backup" />
                <el-step title="Verify backup" />
            </el-steps>
            <StepOneEl ref="stepOneRef" v-show="stepActive == 1" />
            <StepTwoEl ref="StepTwoElRef" v-if="stepActive == 2" />
            <StepThreeEl @submit="submit" :words="words" ref="StepThreeElRef" v-if="stepActive == 3" />
            <div class="flex justify-center mt-[50px]">
                <el-button v-loading="loading" class="inline-block w-[300px] h-[30px] " round @click="back">Back</el-button>
                <el-button v-loading="loading" :disabled="displayNext" class="inline-block w-[300px] h-[30px] ml-[50px]"
                    type="primary" round @click="next">Next</el-button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import StepOneEl from "./createComponents/StepOne.vue";
import StepTwoEl from "./createComponents/StepTwo.vue";
import StepThreeEl from "./createComponents/StepThree.vue";
import { useWallet } from '@/store/index'
import { ethers } from "ethers";
import { WalletSet, WalletGet } from '@/utils/wallet';
import { Md5 } from '@/utils/index';
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const walletStore = useWallet()
const loading = ref(false)
const stepActive = ref(1)
const words = ref<any>('')
const validatorWord = ref<any>('')
const router = useRouter()
const stepOneRef = ref<InstanceType<typeof StepOneEl> | null>(null)
const StepTwoElRef = ref<InstanceType<typeof StepTwoEl> | null>(null)
const StepThreeElRef: any = ref<InstanceType<typeof StepThreeEl> | null>(null)

const displayNext = computed(() => {
    if (stepActive.value == 1 && stepOneRef.value?.form) {
        const { name, password, confirmPassword } = stepOneRef.value?.form
        if (name && password && confirmPassword) return false
    }
    if (stepActive.value == 2) return false
    if (stepActive.value == 3 && StepThreeElRef.value?.form) {
        const { one = '', two = '', three = '' } = StepThreeElRef.value?.form
        if (one && two && three) return false
    }
    return true
})

const next = async () => {
    if (stepActive.value == 1 && await stepOneRef.value?.submit()) {
        stepActive.value = 2
        words.value = ''
        return
    }
    if (stepActive.value == 2) {
        words.value = StepTwoElRef.value?.listToString()
        return stepActive.value = 3
    }
    if (stepActive.value == 3 && await StepThreeElRef.value?.submit()) {
        validatorWord.value = StepThreeElRef.value?.validatorWord
        submit()
    }
}


const back = () => {
    if (stepActive.value == 1) history.go(-1)
    if (stepActive.value == 2) stepActive.value = 1
    if (stepActive.value == 3) {
        words.value = ''
        stepActive.value = 2
    }
}

const submit = async () => {

    const validatorWords = validatorWord.value.toString().replace(/\,/g, ' ')
    if (validatorWords == words.value) {
        try {
            loading.value = true
            const { name, password }: any = stepOneRef.value?.form
            const wallet = ethers.Wallet?.fromPhrase(words.value);
            const json = await wallet.encrypt(password)
            let oldWallet = WalletGet()
            if (!oldWallet) {
                oldWallet = {}
            }

            const md5Str = Md5(String(password));
            Object.keys(oldWallet).forEach(v => {
                oldWallet[v].active = false
            })
            oldWallet[wallet.address] = {
                name,
                address: wallet.address,
                pwd: md5Str,
                active: true,
                json
            }
            WalletSet(oldWallet)
            walletStore.increment(oldWallet)
            loading.value = false

            const query = route.query?.p ? route.query : undefined
            if (query) {
                router.push({ path: route.query?.p })
                return
            }
            router.push({ path: '/' })
        } catch (err) {
            loading.value = false
        }
    }
}

</script>
<style scoped lang="scss"></style>
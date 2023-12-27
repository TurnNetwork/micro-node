<template>
    <div v-show="show" class="z-10 absolute w-[100vw] h-[100vh] top-0 left-0 gradient">
        <div class="m-auto">
            <H1 class="flex justify-center text-[22px] mt-[10%] text-[#fff]">Unlock</H1>
            <div class="m-auto w-[60vw] text-justify mt-[50px] pb-[30px] pl-[40px] text-[#fff]">
                If you leave for a long time or manually lock it, you will need to enter your wallet password to unlock it
                when you wake it up again.
            </div>
            <div class="flex justify-center mt-[50px] mb-[20px]">{{ activeAccount?.address || '' }}</div>

            <div class="flex flex-col justify-center items-center ">
                <el-input style="width:400px" class="mb-[30px]" maxLength="18" placeholder="Please enter wallet password."
                    v-model="pwd" />
                <el-button class="w-[400px]" style="border:1px solid #fff" type="primary" round
                    @click="submit">Submit</el-button>
            </div>

        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watchEffect, toRaw } from 'vue'
import { useWallet } from '@/store/index'
import { Md5 } from '@/utils/index'
const walletStore = useWallet()
const activeAccount: any = ref({})
const show = ref(false)
watchEffect(() => {
    try {
        const val = walletStore && walletStore.wallet && Object.values(walletStore.wallet) || []
        val.forEach((item: any) => {
            if (item.active) {
                activeAccount.value = item
            }
        });
    } catch (e) {
        console.log(123, e);
    }
})

const pwd = ref('')
const submit = () => {
    const enPwd = Md5(pwd.value)
    if (activeAccount.value.pwd == enPwd) {
        show.value = false
    }

}
</script>
<style lang="scss" scoped></style>
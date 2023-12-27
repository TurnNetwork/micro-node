<script setup  lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
const radio = ref(false)
const router = useRouter()

const cont = () => {
    const { electron }: any = window
    electron.initTurnNode()
    localStorage.setItem('init', 'true')
    router.push({path: '/guide'})

}
</script>

<template>
    <div class="main main_lr_bg">
        <div class="w-[650px] m-auto pt-[10%] z-2">
            <div class="text-[18px] font-bold mb-[100px]">Welcome to the Turn Network Micronode Desktop Program</div>
            <div>
                The Turn Network micro-node program is a completely decentralized micro-node mining management tool. The
                micro-node mnemonic, private key, wallet file, etc. are completely kept by the current micro-node. Before
                using
                the micro-node, please read carefully: "<span class="text-[#409eff] cursor-pointer">Service
                    Agreement</span>"
                and "<span class="text-[#409eff] cursor-pointer">Privacy Policy</span>", and you can use the micro-node
                service only after agreeing and accepting all the terms.
            </div>
            <div class="mt-[35%] flex items-center justify-center flex-col">
                <el-checkbox v-model="radio" size="large">I have read and agree to the above terms</el-checkbox>
                <el-button :disabled="!radio" class="inline-block w-[300px] h-[30px] mt-[30px]" type="primary" round
                    @click="cont">Continue</el-button>
            </div>
        </div>
    </div>
</template>
<style></style>
<template>
    <div class="main main_l_bg flex items-center justify-center flex-col">
        <el-card @click="createFn" class="w-[560px] card_hove cursor-pointer"
            :body-style="{ background: 'rgba(236, 245, 255, 1)', paddingTop: '30px', paddingBottom: '30px' }">
            <div class="text-[18px] text-[#409EFF] font-bold">Create</div>
            <div class="text-[#409EFF]">A new wallet will be created for you</div>
        </el-card>
        <el-card @click="importFn" class="w-[560px]  mt-[20px] card_hove cursor-pointer"
            :body-style="{ background: 'rgba(236, 245, 255, 1)', paddingTop: '30px', paddingBottom: '30px' }">
            <div class="text-[18px] text-[#409EFF] font-bold">Import</div>
            <div class="text-[#409EFF]">Import existing wallets, such as: mnemonic words, private keys</div>
        </el-card>
        <el-card @click="router.go(-1)" v-if="routeParams" class="w-[560px]  mt-[80px] card_hove cursor-pointer"
            :body-style="{ background: 'rgba(236, 245, 255, 1)', paddingTop: '10px', paddingBottom: '10px' }">
            <div class="text-[18px] flex justify-center items-center font-bold text-[#409EFF]">back</div>
        </el-card>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const routeParams: any = ref()

const createFn = () => {
    const query = route.query?.p ? route.query : undefined
    router.push({
        path: '/create',
        query
    })
}
const importFn = () => {
    const query = route.query?.p ? route.query : undefined
    router.push({
        path: '/import',
        query
    })
}

onMounted(() => {
    let query
    query = route.query ? route.query?.p : undefined
    query = query ? query : localStorage.getItem('guide-p')
    if (query) {
        routeParams.value = query
        localStorage.setItem('guide-p', routeParams.value)
    }
})
onUnmounted(() => {
    localStorage.setItem('guide-p', '')
})


</script>
<style scoped lang="scss">
.card_hove {
    &:hover {
        border: 1px solid #409EFF;
    }
}
</style>
<template>
    <div class="gradient w-full h-full p-[20px] px-[40px] text-[#fff] leading-[30px]">
        <el-menu class="_my-page" mode="horizontal" @select="handleSelect" background-color="transparent"
            active-text-color="#fff" text-color="#D7D7D7" :default-active="routePath">
            <el-menu-item index="/me/wallet">Wallet management</el-menu-item>
            <el-menu-item index="/me/about">about</el-menu-item>
        </el-menu>
        <router-view></router-view>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const route = useRoute()
const routePath = route.path


const router = useRouter()
const activeIndex = ref(1)

const handleSelect = (v: any) => {
    let path = v
    router.push({ path })
}
</script>
<style lang="scss" scoped>
._my-page {
    :deep(.el-menu-item) {
        background-color: transparent !important;
    }
}
</style>
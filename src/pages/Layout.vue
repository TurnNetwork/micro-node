<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useWallet } from '@/store/index'
import logo from '@/assets/images/Logo.png'
import { version } from 'root/config/index.js'
const router = useRouter()
const route = useRoute()
const routePath = route.path.split('/')[1]

const select = (v: any) => {
    let path = v
    router.push({ path })
}
</script>

<template>
    <div class="flex w-full h-full">
        <div class="w-[200px] home_menu flex flex-col items-center justify-between py-[30px] px-[30px]">
            <div>
                <img class="w-[80px]  mb-[100px]" :src="logo" />
                <el-menu background-color=" rgba(2, 167, 240, 1)" active-text-color="#fff" text-color="#D7D7D7"
                    :default-active="`/${routePath}`" @select="select">
                    <el-menu-item index="/start">
                        <span class="text-[18px] font-bold">Home</span>
                    </el-menu-item>
                    <el-menu-item index="/me">
                        <span class="text-[18px] font-bold">Me</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="text-[#fff] text-[14px]">
                <p>v{{ version.version }}</p>
                Powered by Turn Network
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<style scoped lang="scss">
.home_menu {
    background-color: rgba(2, 167, 240, 1);
}

// :deep(.el-menu-item) {
//     color: #D7D7D7;
// }

:deep(.el-menu-item.is-active) {
    color: #fff;
}

:deep(.el-menu-item:hover) {
    background-color: transparent;
}

:deep(.el-menu) {
    border-right-color: transparent;
}
</style>

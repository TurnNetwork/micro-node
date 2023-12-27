<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { WalletGet } from "@/utils/wallet";
import Lock from '@/components/Lock.vue';
import { versionInfoApi } from '@/api/index'
import { compareVersions } from '@/utils/index'
import { version } from 'root/config/index.js'
const router = useRouter()
const route = useRoute()

const showBth = ref(process.env.NODE_ENV == 'development')
onMounted(async () => {
    const init = localStorage.getItem('init')
    const wallet = WalletGet()
    versionInfoApi.get('/').then((res) => {
        const { data = {} } = res
        compareVersions(version.version, data.data.version)
    }).catch(err => {
        console.log('', err);
    })

    setTimeout(() => {
        let path = route.path
        if (!init) path = '/welcome'
        if (!wallet && init) path = '/guide'
        router.push({ path })
        const dom: any = document.querySelector('.content')
        dom.style.display = 'none'
    }, 1000)
})

const replace = () => {
    window!.location.reload()
}

const openDevTools = () => {
    const { electron }: any = window
    electron.openDevTools()
}

</script>

<template>
    <router-view></router-view>
    <Lock />
</template>

<style scoped></style>

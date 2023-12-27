<template>
    <div class="mt-[50px]" v-loading="loading" :element-loading-text="loadingText"
        :element-loading-background="'rgba(122, 122, 122, 0.8)'">
        <div class="text-[20px] font-600">Version</div>
        <div class="flex justify-between"><span class="text-[#d7d7d7] cursor-pointer">{{ version.version }} </span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { versionInfoApi } from '@/api/index'
import { compareVersions } from '@/utils/index'
import { version } from 'root/config/index.js'
const loading = ref(false)
const loadingText = ref('download ...')

const update = () => {
    versionInfoApi.get('/').then((res) => {
        let { data = {} } = res
        data = compareVersions(version.version, data.data.version)
        if (data == 0) {
            loading.value = true
            const { electron }: any = window
            console.log(res.data.data.url);

            electron.downloadNewVersion(res.data.data.url, 'newVersion.zip')
            uploadEndCall()
        }
    }).catch(err => {
        console.log(err);
        loading.value = false
    })
}

const uploadEndCall = () => {
    const { electron }: any = window

    electron.uploadEnd((e: any) => {
        console.log('end', e);
        loading.value = false
    })
}
</script>
<style lang="scss" scoped></style>
<template>
    <div class="mt-[50px] pb-[30px]">
        <p class="w-[600px]  text-justify pb-[30px] pl-[40px]">
            Please copy the mnemonic words by hand in the correct order for backup. Once the mnemonic words are lost, the
            assets will not be retrieved; please do not take photos or store the mnemonic words on the network.
        </p>
        <table class="m-auto">
            <tbody>
                <tr v-for="(item, index) in list" :key="item">
                    <td style="border-width: 1px ;" v-for="(v, i) in item" :key="`${item}-${v}`">
                        <div class="p-[10px] ">
                            <span class="inline-block w-[20px] mr-[5px]">{{ (index * 3 + i) + 1 }}. </span>
                            <span>{{ v }} </span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="flex justify-center mt-[30px]">
            <el-button type="primary" @click="copyFn"> <el-icon>
                    <CopyDocument />
                </el-icon>
                <span class="ml-[10px]"> copy</span>
            </el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
// import * as bip39 from 'bip39'
import { ethers } from "ethers";
import { onMounted, ref } from 'vue'
import * as copy from 'copy-to-clipboard'
import { ElMessage } from 'element-plus';
const list = ref<any[]>([])

const copyFn = async () => {
    //@ts-ignore
    const api = process.env.NODE_ENV == 'development' ? copy : copy?.default
    console.log(api);
    await api(listToString());
    setTimeout(() => {
        ElMessage.success('copy success')
    }, 500);
}

onMounted(() => {
    const wallet = ethers.Wallet.createRandom();
    var mnemonic = wallet.mnemonic;
    list.value = String(mnemonic?.phrase).split(' ')
    let newList: any[] = [[], [], [], []]
    list.value.forEach((v: string, i: number) => {
        newList[Math.ceil((i + 1) / 3) - 1].push(v)
    })
    list.value = newList
})

const listToString = (): string => {
    return list.value.toString().replace(/\,/g, ' ')
}
defineExpose({
    listToString
})


</script>
<style scoped lang="scss"></style>
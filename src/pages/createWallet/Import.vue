<template>
    <div class="main main_l_bg flex  justify-center">
        <div class="z-2 relative pt-[10vh]">
            <h1 class="m-auto text-[24px] flex justify-center">import wallet</h1>
            <div class="flex items-center justify-center flex-col w-[800px]">
                <div class="w-[600px]  text-justify mt-[50px] pb-[30px] pl-[40px]">
                    Please use a 12-digit mnemonic or private key to import; Note: Spaces are required to separate adjacent
                    mnemonics.
                </div>
                <el-form ref="formRef" size="large" :label-position="'right'" :rules="rules" label-width="180px"
                    :model="form" class="w-[600px]">

                    <el-form-item label="Mnemonic/Private key:" prop="MP">
                        <el-input type="textarea" v-model="form.MP" :maxLength="150"
                            @keyup="() => form.MP = form.MP.replace(/[\u4E00-\u9FA5]/g, '')"
                            placeholder="please enter Mnemonic/Private key" />
                    </el-form-item>
                    <el-form-item label="Name:" prop="name">
                        <el-input v-model.trim="form.name" :maxLength="20"
                            @keyup="() => form.name = form.name.replace(/[\u4E00-\u9FA5]|\s+/g, '')"
                            placeholder="please enter name" />
                    </el-form-item>
                    <el-form-item label="Password:" prop="password">
                        <el-input type="password" maxLength="18" placeholder="please enter password" show-password
                            v-model.trim="form.password"
                            @keyup="() => form.password = form.password.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />
                    </el-form-item>
                    <el-form-item label="Confirm Password:" prop="confirmPassword">
                        <el-input type="password" placeholder="please enter confirmPassword" maxLength="18" show-password
                            v-model.trim="form.confirmPassword"
                            @keyup="() => form.confirmPassword = form.confirmPassword.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />
                    </el-form-item>
                    <el-form-item label=" ">
                        <ul class="ul">
                            <li v-for="item in 4" :key="item"
                                :style="{ 'background-color': item > gear ? 'transparent' : 'rgba(64, 158, 255, 1)' }"></li>
                            <li><span class=" absolute -top-[16px]  -right-[0]">{{
                                {
                                    0: 'weak',
                                    1: 'weak',
                                    2: 'general',
                                    3: 'strong',
                                    4: 'superstrong',
                                }[gear] || ''
                            }}</span></li>
                        </ul>
                    </el-form-item>

                </el-form>
                <div class="flex justify-center mt-[50px]">
                    <el-button v-loading="loading" class="inline-block w-[300px] h-[30px] " round
                        @click="back">Back</el-button>
                    <el-button :disabled="displayNext" v-loading="loading" class="inline-block w-[300px] h-[30px] ml-[50px]"
                        type="primary" round @click="submit">Submit</el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, ref, toRefs, watch, computed, onMounted } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { ethers } from "ethers";
import { CharMode } from '@/utils/index'
import { WalletSet, WalletGet } from '@/utils/wallet';
import { Md5 } from '@/utils/index';
import { useWallet } from '@/store/index'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const walletStore = useWallet()
const formRef: any = ref<FormInstance>()
const gear = ref(0)
const loading = ref(false)
const form = reactive({
    MP: '',
    name: '',
    password: '',
    confirmPassword: '',
})

const displayNext = computed(() => {
    const { MP, name, password, confirmPassword } = form
    if (MP && name && password && confirmPassword) return false
    return true
})

const rules = {
    MP: {
        required: true,
        message: 'Please input enter Mnemonic/Private key',
        trigger: ['blur', 'change'],
    },
    name: {
        required: true,
        message: 'Please input enter name',
        trigger: ['blur', 'change'],
    },
    password: [
        {
            required: true,
            message: 'Please input enter password',
            trigger: ['blur', 'change'],
        },
        {
            validator(_: any, value: string, callback: any) {
                if (value.length < 6) return callback('Password length is less than 6 digits');
                callback()
            }
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: 'Please input enter confirmPassword',
            trigger: ['change'],
        }, {
            validator(_: any, value: string, callback: any) {
                if (value.length < 6) return callback('Password length is less than 6 digits');
                if (value !== form.password) return callback('The two passwords do not match');
                callback()
            },
            trigger: ['blur']
        }
    ]
}


watch(() => form.password, () => {
    const list = new Set()
    if (!form.password) gear.value = 0
    if (form.password) {
        if (form.password.length < 6) {
            gear.value = 1
            return
        }

        for (let i = 0; i < form.password.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.    
            list.add(CharMode(form.password.charCodeAt(i)))
        }
        const newListLength = [...list].length
        const passwordLength = form.password.length
        if (newListLength == 4 && passwordLength >= 6) {
            gear.value = 4
            return;
        }

        if ((passwordLength > 12 && passwordLength <= 18) ||
            newListLength == 3 && passwordLength >= 6) {
            gear.value = 3
            return;
        }
        if (((passwordLength > 8 && passwordLength <= 12)) ||
            newListLength == 2 && passwordLength >= 6) {
            gear.value = 2
            return;
        }

        if (newListLength == 1 && passwordLength <= 8) {
            gear.value = 1
            return
        }
    }
})


const back = () => {
    router.go(-1)
}


const submit = () => {
    formRef.value.validate(async (values: any) => {
        if (values) {
            console.log(form);
            let key: any = form.MP
            let wallet: any = ''
            let json
            key = key.split(' ')
            if (form.confirmPassword !== form.password) {
                ElMessage.error('The two passwords do not match')
                return
            }
            try {
                loading.value = true
                if (key.length == 12) {
                    wallet = ethers.Wallet?.fromPhrase(form.MP);
                } else {
                    wallet = new ethers.Wallet(form.MP);
                }
                json = await wallet.encrypt(form.password)
            } catch (e) {
                ElMessage.error('Mnemonic/Private key  Error')
                loading.value = false
                return
            }
            if (!json) {
                loading.value = false
                return
            }
            try {
                let oldWallet = WalletGet()
                const md5Str = Md5(form.password);
                if (!oldWallet) {
                    oldWallet = {}
                }
                let flag = true
                Object.keys(oldWallet).forEach(v => {
                    if (wallet == v) {
                        flag = false
                    }
                    oldWallet[v].active = false
                })
                oldWallet[wallet.address] = {
                    name: form.name,
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

            } catch (e) {
                loading.value = false
            }

        }
    })
}




const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
}


</script>
<style scoped lang="scss">
.ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    li {
        display: inline-block;
        width: 15%;
        height: 6px;
        border: 1px solid rgba($color: #999, $alpha: .5);

        &:last-child {
            border: none;
            background-color: transparent;
            position: relative;
        }
    }
}
</style>



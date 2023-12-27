<template>
    <el-dialog class="_dialog" v-model="dialogVisible" :title="'Wallet password'" width="500px">
        <el-form ref="formRef" class="pt-[20px]" require-asterisk-position="right" :rules="formRules"
            :label-position="'top'" :model="form">
            <el-form-item prop="pwd" label="password">
                <el-input type="password" v-model.trim="form.pwd" placeholder="Please Enter"
                    @keyup="() => form.pwd = form.pwd.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />

            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="_message_cancel_button"
                    @click="dialogVisible = false, formRef.resetFields()">Cancel</el-button>
                <el-button class="_message_confirm_button" type="primary" @click="confirm">Confirm</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog class="_dialog" v-model="dialogTwoVisible" :title="selectData.handType == 'exportPrivate' ? 'PrivateKey backup' : 'Mnemonic phrase backup'
        " width="500px">
        <div v-if="selectData.handType == 'exportPrivate'">
            <p>1.Please copy and paste the private key to a safe, offline place;</p>
            <p>2.Do not use the network to transmit private keys to avoid irreparable asset losses.</p>
            <div class="break-all text-center  mt-[20px] Key">
                {{ showData && showData?.Key || '' }}
            </div>
        </div>
        <div v-else>
            <p>Please copy the mnemonic phrase correctly and in order for backup. Once the mnemonic phrase is lost, the
                assets cannot be retrieved; do not copy and take photos of the mnemonic phrase and store them on the
                Internet.</p>
            <div class=" grid grid-cols-3  mt-[20px] border-[1px solid #fff]">
                <div class="flex items-center justify-start pl-[20px] mnemonic-item" v-for="item in 12">{{ item }}.
                    {{ showData?.mnemonic && showData?.mnemonic[item - 1] || '' }}</div>
            </div>
        </div>
        <div class="flex items-center justify-center mt-[20px] text-[#fff] cursor-pointer" @click="copyFn(selectData.handType == 'exportPrivate' ? showData?.Key :
            showData?.mnemonic.join(' ')
        )">copy</div>
        <div class="flex justify-center items-center">
            <el-button class="_message_ok_button" type="primary" @click="close">Backup completed</el-button>
        </div>
    </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { Md5 } from '@/utils/index';
import { ElMessage } from 'element-plus'
import { ethers } from "ethers";
import * as copy from 'copy-to-clipboard'

const dialogTwoVisible = ref(false)
const dialogVisible = ref(false)
const formRef: any = ref(null)
const selectData: any = ref({})
const showData: any = ref({})
const form = reactive({
    pwd: ''
})
const formRules = {
    pwd: [{
        required: true,
        message: 'Please input enter pwd',
        trigger: ['blur', 'change'],
    }]
}
const confirm = () => {
    formRef.value.validate(async (values: any) => {
        if (values) {
            const oldPwdMd5Str = Md5(form.pwd);

            if (oldPwdMd5Str !== selectData.value?.pwd) {
                ElMessage.error('wrong password')
                return
            }
            let json = selectData.value?.json
            json = await ethers.Wallet.fromEncryptedJson(JSON.stringify(json), form.pwd)
            showData.value = {
                Key: json.privateKey,
                mnemonic: json.mnemonic && json.mnemonic.phrase ? String(json.mnemonic.phrase).split(' ') : ''
            }
            dialogTwoVisible.value = true
        }
    })
}
const copyFn = async (str?: string) => {
    //@ts-ignore
    const api = process.env.NODE_ENV == 'development' ? copy : copy?.default
    await api(str);
    setTimeout(() => {
        ElMessage.success('copy success')
    }, 500);
}


const close = () => {
    showData.value = {}
    selectData.value = {}
    formRef.value.resetFields()
    form.pwd = ''
    dialogTwoVisible.value = false
    dialogVisible.value = false
}

defineExpose({
    dialogVisible,
    selectData
})
</script>

<style lang="scss" scoped>
.mnemonic-item {
    border: 1px solid #fff;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #fff inset;
}

._message_ok_button {
    border-radius: 20px;
    border: 1px solid #fff;
    padding: 5px 20px;
    margin-top: 20px;
    background: transparent;
}

.Key {
    border: 1px solid #ccc;
    padding: 20px 30px;
    border-radius: 10px;
}
</style>
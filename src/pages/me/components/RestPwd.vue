<template>
    <el-dialog class="_dialog" v-model="dialogVisible" :title="'Reset Password'" width="500px">
        <el-form ref="formRef" require-asterisk-position="right" :rules="formRules" :label-position="'top'" :model="form">
            <el-form-item prop="Private" label="Mnemonic phrase/private key">
                <el-input type="textarea" v-model="form.Private" placeholder="Please Enter"
                    @keyup="() => form.Private = form.Private.replace(/[\u4E00-\u9FA5]/g, '')" />
            </el-form-item>
            <el-form-item prop="newPwd" label="New Password">
                <el-input type="password" maxLength="18" v-model.trim="form.newPwd" placeholder="Please Enter"
                    @keyup="() => form.newPwd = form.newPwd.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />

            </el-form-item>
            <el-form-item prop="enterPwd" label="Confirm Password">
                <el-input type="password" maxLength="18" v-model.trim="form.enterPwd" placeholder="Please Enter"
                    @keyup="() => form.enterPwd = form.enterPwd.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />
            </el-form-item>
            <el-form-item label=" ">
                <ul class="ul">
                    <li v-for="item in 4" :key="item"
                        :style="{ 'background-color': item > gear ? 'rgba(0,0,0, .1)' : 'rgba(255,255,255, 1)' }">
                    </li>
                </ul>
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
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Md5, CharMode } from '@/utils/index';
import { ElMessage } from 'element-plus'
import { ethers } from "ethers";

const emits = defineEmits(['resetConfirm'])
const dialogVisible = ref(false)
const formRef: any = ref(null)
const address: any = ref('')
const gear = ref(0)
const form = reactive({
    Private: '',
    newPwd: "",
    enterPwd: ""
})


watch(() => form.newPwd, () => {
    const list = new Set()
    if (!form.newPwd) gear.value = 0
    if (form.newPwd) {
        if (form.newPwd.length < 6) {
            gear.value = 1
            return
        }

        for (let i = 0; i < form.newPwd.length; i++) {
            list.add(CharMode(form.newPwd.charCodeAt(i)))
        }
        const newListLength = [...list].length
        const passwordLength = form.newPwd.length
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


const formRules = {
    Private: [{
        required: true,
        message: 'Please input enter Mnemonic/Private key',
        trigger: ['blur', 'change'],
    }],
    newPwd: [{
        required: true,
        message: 'Please input enter password',
        trigger: ['blur', 'change'],
    }],
    enterPwd: [{
        required: true,
        message: 'Please input enter password',
        trigger: ['blur', 'change'],
    }]
}
const confirm = () => {
    formRef.value.validate(async (values: any) => {
        if (values) {
            if (form.newPwd !== form.enterPwd) {
                ElMessage.error('The two passwords do not match')
                return
            }
            let key: any = form.Private
            let wallet: any = ''
            let json
            key = key.split(' ')

            try {
                let tryNum = 0
                if (key.length == 12) {
                    //@ts-ignore
                    try {
                        wallet = ethers.Wallet?.fromPhrase(form.Private);
                    } catch (e) {
                        tryNum += 1
                        console.log('ethers.Wallet.fromPhrase', e);
                    }
                } else {
                    //@ts-ignore
                    try {
                        wallet = new ethers.Wallet(form.Private);
                    } catch (e) {
                        tryNum += 1
                        console.log('ethers.Wallet err', e);
                    }

                }
                console.log(wallet);

                if (tryNum >= 2) throw new Error("wallet error");
                json = await wallet.encrypt(form.newPwd)
            } catch (e) {
                ElMessage.error('Mnemonic/Private key  Error')
                return
            }
            const md5Str = Md5(form.newPwd);
            const data = {
                address: wallet.address,
                pwd: md5Str,
                json
            }
            form.Private = ''
            form.newPwd = ''
            gear.value = 0
            form.enterPwd = ''
            dialogVisible.value = false
            formRef.value.resetFields()
            emits("resetConfirm", data)
        }
    })
}

defineExpose({
    dialogVisible
})
</script>

<style lang="scss" scoped>
.ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;

    li {
        display: inline-block;
        width: 15%;
        height: 6px;
        border: 1px solid rgba($color: #999, $alpha: .5);
    }
}
</style>
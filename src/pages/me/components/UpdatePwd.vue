<template>
    <el-dialog class="_dialog" v-model="dialogVisible" :title="'Upload Password'" width="500px">
        <el-form ref="formRef" require-asterisk-position="right" :rules="formRules" :label-position="'top'" :model="form">
            <el-form-item prop="oldPwd" label="Old password">
                <el-input maxLength="18" type="password" v-model.trim="form.oldPwd" placeholder="Please Enter"
                    @keyup="() => form.oldPwd = form.oldPwd.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />
            </el-form-item>
            <el-form-item prop="newPwd" label="password">
                <el-input maxLength="18" type="password" v-model.trim="form.newPwd" placeholder="Please Enter"
                    @keyup="() => form.newPwd = form.newPwd.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />

            </el-form-item>
            <el-form-item prop="enterPwd" label="enterPassword">
                <el-input maxLength="18" type="password" v-model.trim="form.enterPwd" placeholder="Please Enter"
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
import { reactive, ref, watch, toRaw } from 'vue'
import { Md5 } from '@/utils/index';
import { ElMessage } from 'element-plus'
import { CharMode } from '@/utils/index'
import { ethers } from "ethers";
const emits = defineEmits(['resetConfirm'])
const dialogVisible = ref(false)
const formRef: any = ref(null)
const selectData: any = ref({})
const gear = ref(0)

const form = reactive({
    oldPwd: '',
    newPwd: "",
    enterPwd: ""
})
const formRules = {
    oldPwd: [{
        required: true,
        message: 'Please input enter oldPwd',
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


watch(() => form.newPwd, () => {
    const list = new Set()
    if (!form.newPwd) gear.value = 0
    if (form.newPwd) {
        if (form.newPwd.length < 6) {
            gear.value = 1
            return
        }

        for (let i = 0; i < form.newPwd.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.    
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

const confirm = () => {

    formRef.value.validate(async (values: any) => {
        if (values) {
            if (form.newPwd !== form.enterPwd) {
                ElMessage.error('The two passwords do not match')
                return
            }
            const oldPwdMd5Str = Md5(form.oldPwd);

            if (oldPwdMd5Str !== selectData.value?.pwd) {
                ElMessage.error('输入的旧密码错误')
                return
            }
            let wallet
            let json = toRaw(selectData.value?.json)
            json = await ethers.Wallet.fromEncryptedJson(JSON.stringify(json), form.oldPwd)

            console.log(json);

            try {
                if (json?.mnemonic) {
                    wallet = ethers.Wallet?.fromPhrase(String(json.mnemonic.phrase));
                } else {
                    wallet = new ethers.Wallet(json.privateKey);
                }
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
            //@ts-ignore
            emits("updateConfirm", data)
            gear.value = 0
            form.oldPwd = ''
            form.newPwd = ''
            form.enterPwd = ''
            formRef.value.resetFields()
            dialogVisible.value = false
        }
    })
}

defineExpose({
    dialogVisible,
    selectData
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
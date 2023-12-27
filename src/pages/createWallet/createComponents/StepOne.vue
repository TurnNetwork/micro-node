<template>
    <div class="flex items-center justify-center flex-col w-[800px]">
        <div class="w-[600px]  text-justify mt-[50px] pb-[30px] pl-[40px]">A micronode wallet will be created for you;
            please be sure
            to keep the wallet password safe,
            we cannot help you retrieve it.</div>
        <el-form ref="formRef" size="large" :label-position="'right'" :rules="rules" label-width="150px" :model="form"
            class="w-[600px]">
            <el-form-item label="Name:" prop="name">
                <el-input v-model.trim="form.name" :maxLength="20" placeholder="please enter name"
                    @keyup="() => form.name = form.name.replace(/[\u4E00-\u9FA5]|\s+/g, '')" />
            </el-form-item>
            <el-form-item label="Password:" prop="password">
                <el-input type="password" maxLength="18" placeholder="please enter password" show-password
                    @keyup="() => form.password = form.password.replace(/[\u4E00-\u9FA5]|\s+/g, '')"
                    v-model.trim="form.password" />
            </el-form-item>
            <el-form-item label="Confirm Password:" prop="confirmPassword">
                <el-input type="password" placeholder="please enter confirmPassword" maxLength="18" show-password
                    @keyup="() => form.confirmPassword = form.confirmPassword.replace(/[\u4E00-\u9FA5]|\s+/g, '')"
                    v-model.trim="form.confirmPassword" />
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
    </div>
</template>
<script setup lang="ts">
import { reactive, ref, toRefs, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { CharMode } from '@/utils/index'
const formRef: any = ref<FormInstance>()
const gear = ref(0)
const form = reactive({
    name: '',
    password: '',
    confirmPassword: '',
})
const rules = {
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

const submit = () => {
    return new Promise(async (resolve) => {
        formRef.value.validate((values: any) => {
            if (values) {
                if (form.confirmPassword !== form.password) {
                    ElMessage.error('The two passwords do not match')
                    resolve(false)
                    return
                }
                resolve(true)
            }
            resolve(false)
        })
    })
}

const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
}

defineExpose({
    submit,
    resetForm,
    form
})

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
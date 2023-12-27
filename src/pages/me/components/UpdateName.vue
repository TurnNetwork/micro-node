<template>
    <el-dialog class="_dialog" v-model="dialogVisible" :title="'Wallet Name'" width="500px">
        <el-form ref="formRef" class="pt-[20px]" require-asterisk-position="right" :rules="formRules"
            :label-position="'top'" :model="form">
            <el-form-item prop="name" label="Name">
                <el-input v-model.trim="form.name" placeholder="Please Enter" />
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
const emits = defineEmits(['updateNameConfirm'])
const dialogVisible = ref(false)
const formRef: any = ref(null)
const selectData: any = ref({})
const form = reactive({ name: '' })
const formRules = {
    name: [{
        required: true,
        message: 'Please input enter name',
        trigger: ['blur', 'change'],
    }]
}

watch(() => selectData.value, () => {
    console.log(selectData.value);

    form.name = selectData.value.name
})

const confirm = () => {
    formRef.value.validate(async (values: any) => {
        if (values) {
            const data = {
                name: form.name,
                address: selectData.value?.address
            }
            emits("updateNameConfirm", data)
            close()
        }
    })
}


const close = () => {
    form.name = ''
    formRef.value.resetFields()
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
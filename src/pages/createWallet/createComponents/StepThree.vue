<template>
    <div class="mt-[50px]">
        <div class="flex justify-center items-center flex-col">
            <p class="m-auto w-[400px]  pb-[50px]">Please select the corresponding mnemonic according to the randomly
                assigned serial number.</p>
            <el-form ref="formRef" :inline="true" :rules="rules" :model="form" class="demo-form-inline">
                <el-form-item :label="(selectVerifyList[0]) || ''" prop="one" class="w-[150px]">
                    <el-input class="create_wallet_input_after_dom" :readonly="true" v-model.trim="form.one"
                        placeholder="Please" clearable>
                        <template #append v-if="form.one">
                            <el-button :icon="Delete" @click="del(form.oneIndex, 'one')" />
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="(selectVerifyList[1]) || ''" class="w-[150px]" prop="two">
                    <el-input class="create_wallet_input_after_dom" :readonly="true" v-model.trim="form.two"
                        placeholder="Please" clearable>
                        <template #append v-if="form.two">
                            <el-button :icon="Delete" @click="del(form.twoIndex, 'two')" />
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="(selectVerifyList[2]) || ''" class="w-[150px]" prop="three">
                    <el-input class="create_wallet_input_after_dom" :readonly="true" v-model.trim="form.three"
                        placeholder="Please" clearable>
                        <template #append v-if="form.three">
                            <el-button :icon="Delete" @click="del(form.threeIndex, 'three')" />
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>

        <div class="flex justify-center mt-[50px] pb-[30px]">
            <el-check-tag @click="selectTag(item, index)" v-show="!tagIndexList.includes(index)"
                v-for="(item, index) in randomList" checked style="margin-right: 8px">{{
                    Object.values(item)[0]
                }}</el-check-tag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, toRaw } from 'vue'
import { ElMessage, } from "element-plus";
import { Delete } from '@element-plus/icons-vue'
const props = defineProps({
    words: String,
})
const form = reactive<any>({
    one: '',
    oneIndex: '',
    two: '',
    twoIndex: '',
    three: '',
    threeIndex: ''
})
const emit = defineEmits(['submit'])
const tagIndexList = ref<any>([])
const formRef = ref()
const wordsList = ref<any[]>([])
const randomNumSelectList = ref<Set<Number>>(new Set())
const randomList = ref<string[]>([])
const randomVerifyList = ref<Set<Number>>(new Set())
const selectVerifyList = ref<any>([])
const rules = {
    one: {
        validator(_: any, value: string, callback: any) {
            const num = Number(selectVerifyList.value[0]) - 1
            // console.log(wordsList.value[num]);
            if (wordsList.value[num] !== value) {
                callback('Mnemonic error')
                return
            }
            callback()
        }
    },
    two: {
        validator(_: any, value: string, callback: any) {
            const num = Number(selectVerifyList.value[1]) - 1
            if (wordsList.value[num] !== value) {
                callback('Mnemonic error')
                return
            }
            callback()
        },
    },
    three: {
        validator(_: any, value: string, callback: any) {
            const num = Number(selectVerifyList.value[2]) - 1
            if (wordsList.value[num] !== value) {
                callback('Mnemonic error')
                return
            }
            callback()
        }
    }

}

const del = (num: any, type: string) => {
    const index = tagIndexList.value.indexOf(+num)
    if (index > -1) {
        tagIndexList.value.splice(index, 1)
        form[type] = ''
    }
}

const random = () => {
    if (randomNumSelectList.value.size < 6) {
        randomNumSelectList.value.add(Math.round(Math.random() * 11))
        random()
    }
}

const randomVerify = () => {
    if (randomVerifyList.value.size < 3) {
        randomVerifyList.value.add(Math.round(Math.random() * 5))
        randomVerify()
    }
}

onMounted(() => {
    random()
    randomVerify()
    wordsList.value = props.words ? props.words.split(' ') : []
    const arr = Array.from(wordsList.value)
    randomNumSelectList.value.forEach((v: any) => {
        const obj: any = {}
        obj[v] = arr[v]
        randomList.value.push(obj)
    })

    console.log(toRaw(wordsList.value));
    const list: any[] = []
    randomVerifyList.value.forEach((v: any) => {
        const arr = Object.keys((toRaw(randomList.value[v])))
        list.push(arr[0])
    })
    selectVerifyList.value = [...list].sort((a, b) => a - b).map(v => Number(v) + 1)

})

const selectTag = (item: any, index: number) => {
    let key = toRaw(item)
    if (tagIndexList.value.length < 3) {
        tagIndexList.value.push(index)
    } else {
        return
    }

    key = Object.values(key)[0]
    if (!form.one) {
        form.one = key
        form.oneIndex = String(index)
        return
    }
    if (!form.two) {
        form.two = key
        form.twoIndex = String(index)
        return
    }
    if (!form.three) {
        form.three = key
        form.threeIndex = String(index)
        return
    }

}

const submit = () => {
    return new Promise(async (resolve) => {
        formRef.value.validate((values: any) => {
            if (values) {
                resolve(true)
                return
            }
            ElMessage.error('Mnemonic word verification failed')
            resolve(false)
        })
    })
}

defineExpose({
    form,
    submit,
    validatorWord: wordsList
})


</script>
<style scoped lang="scss"></style>
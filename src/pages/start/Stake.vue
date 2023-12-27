<template>
    <el-dialog class="_dialog" v-model="dialogVisible" :title="stakeType" width="500px">
        <div class="top-line">
            <div class="flex items-center justify-between">
                <p>Pledged：{{ stakeAmount }} {{ symbol }}</p>

                <p>{{ stakeType == 'stakeIng' ? 'available' : 'Release pledge' }}：{{ stakeType == 'stakeIng' ? balance :
                    stakeAmount }}
                    {{ symbol }}</p>
            </div>
            <el-form v-if="stakeType == 'stakeIng'" ref="formStakeRef" require-asterisk-position="right"
                :label-position="'top'" :model="formStake">
                <el-form-item prop="stakeNum" label="Pledge quantity" :rules="stakeNumRules">
                    <el-input v-model="formStake.stakeNum" size="large" placeholder="Please Enter"
                        :suffix-icon="h('div', { onClick: allFn, class: 'text-[#fff] cursor-pointer' }, 'All')">
                    </el-input>
                </el-form-item>
                <el-form-item prop="operationalNodes" label="Operational nodes " :rules="operationalNodesRules">
                    <el-radio-group v-model="formStake.operational" class="ml-4">
                        <el-radio label="true" size="large">yes</el-radio>
                        <el-radio label="false" size="large">No</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div class="flex items-center justify-between">
                <span>Miner's fees: </span>
                <span>≈ {{ expectedGasFee }} {{ symbol }}</span>
            </div>
            <el-row :align="'center'" :justify="'center'" class="mb-[20px]">
                <el-col :span="6">
                    <div @click="gasTypeActive = 1, _gasPrice = processGasNum(gasPrice, '0.8')"
                        :class="`_card ${gasTypeActive == 1 ? '_card-active' : ''}`">
                        <div>Slow</div>
                        <div class="leading-[18px]">
                            <p>Expected</p>
                            <span class="text-[13px]">{{ processGasNum(gasPrice, '0.8') }}</span>
                            <span class="text-[13px]">Gwei</span>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div @click="gasTypeActive = 2, _gasPrice = processGasNum(gasPrice, '1')"
                        :class="`_card ${gasTypeActive == 2 ? '_card-active' : ''}`">
                        <p>Normal</p>
                        <div class="leading-[18px]">
                            <p>Expected</p>
                            <span class="text-[13px]">{{ processGasNum(gasPrice, '1') }}</span>
                            <span class="text-[13px]">Gwei</span>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div @click="gasTypeActive = 3, _gasPrice = processGasNum(gasPrice, '1.2')"
                        :class="`_card ${gasTypeActive == 3 ? '_card-active' : ''}`">
                        Fast
                        <div class="leading-[18px]">
                            <p>Expected</p>
                            <span class="text-[13px]">{{ processGasNum(gasPrice, '1.2') }}</span>
                            <span class="text-[13px]">Gwei</span>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div @click="gasTypeActive = 4" :class="`_card ${gasTypeActive == 4 ? '_card-active' : ''}`">
                        Custom
                    </div>
                </el-col>
            </el-row>
            <p v-if="gasTypeActive == 4">custom</p>
            <el-form v-if="gasTypeActive == 4" ref="fromCustomizeRef" require-asterisk-position="right"
                :label-position="'top'" :model="fromCustomize">
                <el-form-item prop="gas" label="Gas Price（Gwei）" :rules="[
                    {
                        required: true,
                        message: 'Please Enter ',
                        trigger: 'blur',
                    },
                ]">
                    <el-input v-model="fromCustomize.gas" size="large" placeholder="Please Enter">
                    </el-input>
                </el-form-item>
            </el-form>
            <div v-if="stakeType == 'stakeIng'">
                Note: The number of micro-node pledges must be concentrated at xxx TURN to participate in block production
                and voting. The additional pledge amount is concentrated at xxx TURN. For details, please check the
                governance parameters with the lowest micro-node participation in voting.
            </div>
            <div v-else>
                <p>Note：</p>
                <p>1. Nodes can unpledge at any time. If they are participating in the consensus round of block generation,
                    the unpledge needs to wait for the end of the consensus round to be credited;</p>
                <p>2. Please do not stop shutting down the node immediately after unstaking, as the node may be
                    participating in the block consensus round;</p>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="_message_cancel_button" @click="dialogVisible = false">Cancel</el-button>
                <el-button class="_message_confirm_button" type="primary" @click="confirm">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, h, readonly, onMounted, watch, watchEffect } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
//@ts-ignore
import { symbol } from 'root/config/index.js'
import { Md5, processNumTimes, processNum } from '@/utils/index';
import { ethers } from "ethers";
import { getGasPrice } from '@/web3Api/index'
import Big from 'big.js'

const emits = defineEmits(['stakIngFn', "unStakIngFn"])
const { balance, activeWallet, stakeType, stakeAmount } = defineProps(['balance', 'activeWallet', 'stakeType', 'stakeAmount'])


const propsStakeType = ref('')
const dialogVisible = ref(false)
const expectedGasFee = ref<string | number>(0)
const gasPrice = ref()
const _gasPrice = ref()
const formStake: any = reactive({ stakeNum: '200', operational: 'false' })
const fromCustomize = reactive({ gas: '', limit: '' })
const formStakeRef = ref()
const fromCustomizeRef = ref()
const gasTypeActive = ref(2)
// const stakIngNum: any = ref(0)
const minValue = processNumTimes('200', '18')
import { getBalance } from '@/web3Api/index'
const stakeNumRules = readonly([
    {
        required: true,
        message: 'Please Enter ',
        trigger: 'blur',
    },
    {
        validator(_: any, value: string, callback: any) {
            let flag: Boolean = false
            try {
                value = processNumTimes(value, '18')
                if (BigInt(value) < BigInt(minValue)) {
                    return callback(`min 200 ${symbol}`);
                }
            } catch (err) {
                flag = true
            }
            if (flag) return callback('enter error');
            callback()
        }
    },
])
const operationalNodesRules = readonly([
    {
        required: true,
        message: 'Please select ',
        trigger: 'blur',
    },
])

const allFn = () => {
    formStake.stakeNum = balance
}

watch(_gasPrice, () => {
    fromCustomize.gas = _gasPrice.value
    computeGas(fromCustomize.gas)
})

watchEffect(() => {
    if (dialogVisible.value) {
        getBaN()
        // const num: any = Number(stakIngNum.value) || 0
        // stakIngNum.value = processNum(num, '18')
    }
})
watch(
    () => fromCustomize.gas,
    () => computeGas(fromCustomize.gas)
)
const propsBalance = ref()
const getBaN = () => {
    getBalance(activeWallet.address).then((res: any) => {
        propsBalance.value = processNum(res, '18')
    })
}


const confirm = () => {
    const options = {
        cancelButtonText: 'Cancel',
        placeholder: "please password",
        'customClass': '_message-box',
        confirmButtonClass: '_message_confirm_button',
        cancelButtonClass: '_message_cancel_button'
    }


    ElMessageBox.prompt(`${activeWallet.address}`, 'password', {
        ...options,
        inputPattern: /^.{6,10}$/,
        inputType: 'password',
        inputErrorMessage: 'Incorrect password length，min length 6 ,max length 12',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                // console.log(propsBalance.value, formStake.stakeNum, (+(formStake.stakeNum) - (+expectedGasFee.value)));
                // console.log(200 + (+expectedGasFee.value));
                console.log(propsBalance.value, (+(formStake.stakeNum) - (+expectedGasFee.value)));
                const a = processNumTimes(propsBalance.value, '18')
                const d: any = (+(formStake.stakeNum) + (+expectedGasFee.value)).toString()
                const b = processNumTimes(d, '18')
                if (BigInt(a) < BigInt(b) && propsStakeType.value == 'stakeIng') return ElMessage.warning(`There will not be enough to pay the handling fee after all the pledges are made, please reserve the handling fee. `)
                if (propsBalance.value <= 0 && propsStakeType.value == 'stakeIng') return ElMessage.warning(`balance < 0`)
                if (propsBalance.value < (200 + (+expectedGasFee.value)) && propsStakeType.value == 'stakeIng') {
                    ElMessage.warning(`balance  minx ${200 + (+expectedGasFee.value)}`)
                    done()
                    return
                }
                instance.confirmButtonLoading = true
                instance.confirmButtonText = 'Loading...'
                const md5Str = Md5(String(instance.inputValue));
                if (md5Str == activeWallet.pwd) {
                    const data = await ethers.Wallet.fromEncryptedJson(activeWallet.json, instance.inputValue)
                    if (propsStakeType.value == 'stakeIng') stakeIng(data)
                    if (propsStakeType.value == 'unStakeIng') unStake(data)
                } else {
                    ElMessage.error('password error')
                    instance.confirmButtonLoading = false
                    instance.confirmButtonText = 'submit'
                    return
                }
                instance.confirmButtonLoading = false
                instance.confirmButtonText = 'submit'
            }
            done()
        }
    })
}


const stakeIng = async (data: any) => {
    dialogVisible.value = false
    emits('stakIngFn', {
        privateKey: data.privateKey,
        address: data.address,
        account: formStake.stakeNum,
        gasPrice: processNumTimes(fromCustomize.gas, '11'),
        isOperator: formStake.operational == 'true' ? true : false,
    })
}


const unStake = async (data: any) => {
    emits('unStakIngFn', {
        privateKey: data.privateKey,
        address: data.address,
        gasPrice: fromCustomize.gas,
        // account: formStake.stakeNum,
        // isOperator: formStake.operational == 'true' ? true : false,
    })
    dialogVisible.value = false
}


defineExpose({
    dialogVisible,
    propsStakeType
})

onMounted(async () => {
    const res: any = await getGasPrice()
    _gasPrice.value = gasPrice.value = processNum(res, '9')
    computeGas(_gasPrice.value)
})

const computeGas = (value: any) => {
    // value = processNum(value, '18')
    // console.log(value, formStake.stakeNum);
    let gas: any = processGasNum(value, formStake.stakeNum);
    gas = gas * 2.1
    expectedGasFee.value = processNum(String(gas), '4');
}


const processGasNum = (val: string, des: string) => {
    let num
    try {
        num = new Big(val).times(des).toFixed()
        num = isNaN(num) ? '' : num
    } catch (e) {
        num = 0
    }
    return num
}



</script>
<style lang="scss" scoped>
:deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: rgb(0, 255, 123);
    background: rgb(0, 255, 123);
}

:deep(.is-checked .el-radio__label) {
    color: #fff;
}
</style>
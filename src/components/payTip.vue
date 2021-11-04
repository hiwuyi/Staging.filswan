<template>

    <el-dialog title="Pay" :modal="false" :width="widthDia" :visible.sync="payVisible"
        :before-close="closeDia">
        <div class="load" v-if="hashload" v-loading="hashload"></div>
        <el-form :model="ruleForm" ref="ruleForm">
            <el-form-item label="From" prop="from">
                {{metaAddress}} 
            </el-form-item>
            <el-form-item label="Payload CID" prop="cid" :class="{'err': ruleForm.cid_tip}">
                <el-input v-model="ruleForm.cid" placeholder="" @blur="selectFun(2, ruleForm.cid)" @input="selectFun(2, ruleForm.cid)"></el-input>
            </el-form-item>
            <el-form-item label="Recommended Payment Amount" prop="amount" :class="{'err': ruleForm.amount_tip}">
                <el-input v-model="ruleForm.amount" placeholder="" @blur="selectFun(1, ruleForm.amount)" @input="selectFun(1, ruleForm.amount)" maxlength="30" style="width: calc(100% - 50px);"></el-input> USDC
                <p v-if="ruleForm.amount_tip" style="font-size:12px">Amount should be a number</p>
                <p v-if="ruleForm.amount_incorrect" style="font-size:12px">Insufficient balance</p>
                <p v-if="ruleForm.amount_minprice_incorrect" style="font-size:12px">The minimum payment is {{ruleForm.amount_minprice}}</p>
            </el-form-item>
            <!-- <el-form-item label="Gas Limit" prop="gaslimit" :class="{'err': ruleForm.gaslimit_tip}">
                <el-input v-model="ruleForm.gaslimit" @blur="selectFun(4, ruleForm.gaslimit)" @input="selectFun(4, ruleForm.gaslimit)" maxlength="7"></el-input>
                <p v-if="ruleForm.gaslimit_tip" style="font-size:12px">Gas Limit Must Be Between 21000 UNITS And 4928871 UNITS.</p>
            </el-form-item>
            <el-form-item label="Gas Price" prop="gasprice" :class="{'err': ruleForm.gasprice_tip}">
                <el-input v-model="ruleForm.gasprice" @blur="selectFun(5, ruleForm.gasprice)" @input="selectFun(5, ruleForm.gasprice)" maxlength="5"></el-input>
            </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button 
                :disabled="!ruleForm.amount ||!ruleForm.cid || ruleForm.gaslimit_tip || ruleForm.gasprice_tip || ruleForm.amount_tip || 
                            ruleForm.cid_tip || ruleForm.amount_incorrect || ruleForm.amount_minprice_incorrect"
                type="primary" @click="submitForm('ruleForm')">pay</el-button>
        </div>
    </el-dialog>

</template>

<script>
    import NCWeb3 from "@/utils/web3";
    import first_contract_json from "@/utils/swanPayment.json";
    import erc20_contract_json from "@/utils/ERC20.json";
    import axios from 'axios'

    export default {
        name: "pay_tip",
        data() {
            return {
                ruleForm: {
                    amount: '',
                    amount_balance: 0,
                    amount_tip: false,
                    amount_incorrect: false,
                    amount_minprice_incorrect: false,
                    amount_minprice: '0',
                    gaslimit: this.$root.PAY_GAS_LIMIT,
                    gaslimit_tip: false,
                    gasprice: '1',
                    gasprice_tip: false,
                    cid: this.cid,
                    cid_tip: false
                },
                widthDia: document.body.clientWidth<600?'90%':'500px',
                inputAmount: /^\d+(?:\.\d{0,8})?[\s]{0,5}/,
                inputG: /^[1-9]\d*$/,
                hashload: false,
                timer: '',

                gatewayContractAddress: this.$root.SWAN_PAYMENT_CONTRACT_ADDRESS,
                recipientAddress: this.$root.RECIPIENT,
                usdcAddress: this.$root.USDC_ADDRESS,
                one: '1000000000000000000',
                oneThousand: "1000000000000000000000"
            };
        },
        props: ['payVisible', 'cid', 'paymentAmount'],
        components: {},
        computed: {
            metaAddress() {
                return this.$store.getters.metaAddress
            }
        },
        methods: {
            submitForm(formName) {
                let _this = this
                _this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(_this.metaAddress){
                            web3.eth.getBalance(_this.metaAddress).then(balance => {
                                // _this.ruleForm.amount_balance = web3.utils.fromWei(balance, 'ether')
                                let amount_balance = 0.000000000000000001 * balance
                                // if(Number(_this.ruleForm.amount.trim()) > Number(amount_balance)){
                                //     _this.ruleForm.amount_incorrect = true
                                //     return false
                                // }else 
                                if(Number(_this.ruleForm.amount.trim()) < _this.ruleForm.amount_minprice){
                                    _this.ruleForm.amount_minprice_incorrect = true
                                    return false
                                }


                                // 授权代币
                                let contract_erc20 = new web3.eth.Contract( erc20_contract_json );
                                contract_erc20.options.address = _this.usdcAddress

                                // 查询剩余授权余额为：
                                contract_erc20.methods.allowance(_this.gatewayContractAddress, _this.metaAddress).call()
                                .then(resultUSDC => {
                                    console.log('allowance：'+ resultUSDC);
                                    if(resultUSDC < web3.utils.toWei(_this.ruleForm.amount, 'ether')){
                                        contract_erc20.methods.approve(_this.gatewayContractAddress, web3.utils.toWei(_this.ruleForm.amount, 'ether')).send({from:  _this.metaAddress})
                                        .then(receipt => {
                                            // console.log(receipt)
                                        })
                                    }
                                    _this.contractSend()
                                })

                                contract_erc20.methods.balanceOf(_this.metaAddress).call()
                                .then(resultUSDC => {
                                    console.log('查询剩余代币余额为：'+ resultUSDC);
                                })

                            });
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            contractSend(){
                let _this = this
                // 合约转账
                let contract_instance = new web3.eth.Contract( first_contract_json );
                contract_instance.options.address = _this.gatewayContractAddress
                // console.log( 'contract_instance合约实例：', contract_instance );
                // console.log(contract_instance.options.jsonInterface)

                let payObject = {
                    from: _this.metaAddress,
                    gas: web3.utils.toHex(_this.ruleForm.gaslimit),
                    // gasPrice: web3.utils.toHex(web3.utils.toWei(_this.ruleForm.gasprice + '', 'gwei')),
                    // value: web3.utils.toHex(web3.utils.toWei(_this.ruleForm.amount, 'ether')),
                };
                
                let lockObj = {
                    id: _this.ruleForm.cid,
                    minPayment: web3.utils.toWei(_this.ruleForm.amount_minprice, 'ether'),
                    amount: web3.utils.toWei(_this.ruleForm.amount, 'ether'),
                    lockTime: 86400 * Number(_this.$root.LOCK_TIME), // one day
                    recipient: _this.recipientAddress, //todo:
                }
                
                contract_instance.methods.lockTokenPayment(lockObj)
                .send(payObject)
                .on('transactionHash', function(hash){
                    // console.log('hash console:', hash);
                    _this.hashload = true
                })
                .on('confirmation', function(confirmationNumber, receipt){
                    // console.log('confirmationNumber console:', confirmationNumber, receipt);
                })
                .on('receipt', function(receipt){
                    // receipt example
                    // console.log('receipt console:', receipt);
                    _this.checkTransaction(receipt.transactionHash)

                })
                .on('error', function(error){
                    // console.log('error console:', error)
                    console.error
                    _this.hashload = false
                    _this.$message.error('Fail');
                }); 
            },
            checkTransaction(txHash) {
                let _this = this
                web3.eth.getTransactionReceipt(txHash).then(
                    res => {
                        console.log('checking ... ');
                        if (!res) { return _this.timer = setTimeout(() => { _this.checkTransaction(txHash); }, 2000); }
                        else {
                            _this.hashload = false
                            clearTimeout(_this.timer)
                            _this.closeDia()
                            _this.$message({
                                message: 'Success',
                                type: 'success'
                            });
                            _this.$emit('getPay', true, _this.cid)
                        }
                    },
                    err => { console.error(err); }
                );
            },
            closeDia() {
                this.$emit('getDialog', false, false)
            },
            selectFun(index, val){
                if(index == 1){
                    this.ruleForm.amount_tip = !this.inputAmount.test(val) ? true : false
                    this.ruleForm.amount_incorrect = false
                    this.ruleForm.amount_minprice_incorrect = val > this.ruleForm.amount_minprice ? false : true
                }else if(index == 2){
                    this.ruleForm.cid_tip = !val ? true : false
                }else if(index == 4){
                    this.ruleForm.gaslimit_tip = !this.inputG.test(val) || val < 21000 || val > 4928871 ? true : false
                }else if(index == 5){
                    this.ruleForm.gasprice_tip = !this.inputG.test(val) ? true : false
                }
            },
        },
        mounted() {
            // web3.eth.getCode(this.gatewayContractAddress).then(res => {
            //     this.ruleForm.gaslimit = res.toLowerCase() == '0x' ? '21000' : '9999999'
            // })
            if(this.paymentAmount){
                let number = Number(this.paymentAmount).toFixed(18)
                this.ruleForm.amount = String(number)
                this.ruleForm.amount_minprice = String(number)
            }
        },
        watch: {
            'payVisible': function() {
                if(this.payVisible){
                    this.ruleForm.amount = ''
                    this.ruleForm.currencyValue = '3'
                }
            }
        },
        filters: {}
    };
</script>


<style scoped lang="scss">
.el-dialog__wrapper /deep/{
    .load{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        .el-loading-mask{
            .el-loading-spinner{
                height: 100%;
                top: 0;
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
    .el-dialog{
        background: #fafafa;
        box-shadow: 0 0 13px rgba(128,128,128,0.8);
        .el-dialog__header{
            padding: 0.2rem 0.2rem 0.1rem;
            display: flex;
            .el-dialog__title{
                color: #222222;
                font-size: 0.18rem;
                font-weight: 600;
            }
        }
        .el-dialog__body{
            padding: 0.2rem 0.2rem 0;
            .el-form{
                .err{
                    .el-form-item__label{
                    color: red;
                    }
                    .el-input{
                    .el-input__inner{
                        border-color: red;
                    }
                    }
                }
                .el-form-item{
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 0.05rem;
                    .el-form-item__label{
                        width: 100%;
                        color: #000000;
                        line-height: 2.5;
                        word-break: break-word;
                        text-align: left;
                    }
                    .el-form-item__content{
                        width: 100%;
                        display: flex;
                        flex-wrap: wrap;
                        overflow: hidden;
                        font-size: 0.14rem;
                        .el-input{
                            margin: 0 5px 0 0;
                            .el-input__inner{
                                width: 100%;
                            }
                        }
                    }
                    p{
                        width: 100%;
                        margin: 0.05rem 0;
                        font-size: 0.16rem;
                        font-weight: 100;
                        color: red;
                        white-space: normal;
                        word-break: break-all;
                        line-height: 1;
                    }
                }
            }
        }
        .dialog-footer{
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
    }
}
    @media screen and (max-width: 1024px) {
        
    }
    @media screen and (max-width: 999px) {
        
    }
    @media screen and (max-width: 599px){
    .el-dialog__wrapper /deep/{
        .el-dialog{
            .el-dialog__header{
                .el-dialog__title{
                    font-size: 0.16rem;
                }
            }
            .el-dialog__body{
                padding: 0.15rem;
                .el-form{
                    .el-form-item{
                        display: flex;
                        flex-wrap: wrap;
                        margin: 0 0 0.05rem;
                        .el-form-item__label{
                            width: 100%;
                            margin: 0;
                            text-align: left;
                        }
                        .el-form-item__content{
                            width: 100%;
                            margin: 0;
                        }
                    }
                }
            }
        }
    }
        
    }
</style>

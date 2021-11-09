<template>
    <div id="Create">
        <div class="upload" v-loading="loading">
            <div class="upload_form">
                <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="demo-ruleForm">
                    <el-form-item prop="fileList" :label="$t('uploadFile.upload')">
                        <div style="display: flex; align-items: center;">
                            <el-upload
                                class="upload-demo"
                                ref="uploadFileRef"
                                action="customize"
                                :http-request="uploadFile"
                                :file-list="ruleForm.fileList"
                                :on-change="handleChange"
                                :on-remove="handleRemove">
                                <el-button size="small" type="primary" icon="el-icon-plus">{{$t('uploadFile.upload')}}</el-button>
                            </el-upload>
                            <p v-if="ruleForm.fileList.length>0">{{ruleForm.file_size}}</p>
                        </div>
                    </el-form-item>
                    <el-form-item prop="duration" label="Duration">
                        <el-input v-model="ruleForm.duration" type="number" style="max-width:130px"></el-input> &nbsp; days
                    </el-form-item>
                    <el-form-item prop="storage_cost" label="Estimated Storage Cost">
                        <span  style="color:#ce2f21">{{ruleForm.storage_cost | NumStorage}} FIL</span> 
                    </el-form-item>
                </el-form>
                <div class="upload_plan">
                    <div class="title" :style="{'color': ruleForm.lock_plan_tip? '#f67e7e' : '#000'}">* Select Lock Funds Plan</div>
                    <div class="upload_plan_radio">
                        <el-radio-group v-model="ruleForm.lock_plan" @change="agreeChange">
                            <el-radio label="1" border>
                                <div class="title">Low</div>
                                <div class="cont">
                                    {{storage_cost_low}} <br/> USDT
                                </div>
                            </el-radio>
                            <el-radio label="2" border>
                                <div class="title">Average</div>
                                <div class="cont">
                                    {{storage_cost_average}} <br/> USDT
                                </div>
                            </el-radio>
                            <el-radio label="3" border>
                                <div class="title">High</div>
                                <div class="cont">
                                    {{storage_cost_high}} <br/> USDT
                                </div>
                            </el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div class="upload_bot">
                    <el-button type="primary" v-if="!metaAddress||center_fail" @click="centerDialogVisible=true">Connect Wallet</el-button>
                    <el-button type="primary" v-else @click="submitForm('ruleForm')">{{$t('deal.Submit')}}</el-button>
                </div>
            </div>
            
            <el-row class="upload_result" v-if="resultSuc">
                <el-col :span="24">
                    <h5>The following file has been successfully uploaded. You can check it in My Task!</h5>
                </el-col>
                <el-col :span="24">
                    <label for="">File name: </label>
                    <p>{{tableData.file_name}}</p>
                </el-col>
                <el-col :span="24">
                    <label for="">Task name: </label>
                    <p>{{tableData.task_name}}</p>
                </el-col>
                <el-col :span="24">
                    <label for="">Payload CID: </label>
                    <p>{{tableData.payload_cid}}</p>
                </el-col>
            </el-row>
        </div>

        <el-dialog
        :title="$t('transfer.connect_wallet')"
        :visible.sync="centerDialogVisible"
        :width="width"
        custom-class="metaM"
        center>
        <el-row>
            <el-col :span="12">MetaMask</el-col>
            <el-col :span="12"><img src="@/assets/images/metamask.png" alt=""></el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary"  @click="signFun">{{$t('transfer.connect_wallet')}}</el-button>
            <p v-if="center_fail">{{$t('transfer.connected_fail')}}</p>
        </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from "@/components/bus";
    import * as myAjax from "@/api/uploadFile";
    import NCWeb3 from "@/utils/web3";
    import axios from 'axios'
    import first_contract_json from "@/utils/swanPayment.json";
    import erc20_contract_json from "@/utils/ERC20.json";
    let contract_erc20
    let that
    export default {
        name: "uploadFiles",
        data() {
            var validateDuration = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('Please enter the duration'));
                }
                setTimeout(() => {
                    if (value < 180) {
                        callback(new Error('Minimum not less than 180'));
                        callback(that.calculation(1));
                    } else {
                        callback(that.calculation());
                    }
                }, 100);
            };
            return {
                tableData: {
                    file_name: '',
                    task_name: '',
                    payload_cid: ''
                },
                ruleForm: {
                    duration: '180',
                    fileList: [],
                    file_size: '',
                    file_size_byte: '',
                    storage_cost: '',
                    lock_plan: '',
                    lock_plan_tip: false,
                    amount: '',
                    amount_minprice: 0,
                    gaslimit: this.$root.PAY_GAS_LIMIT,
                },
                rules: {
                    duration: [
                        { validator: validateDuration, trigger: 'blur'}
                    ],
                    fileList: [
                        { type: 'array', required: true, message: 'Please choose a file', trigger: 'change' }
                    ]
                },
                loading: false,
                bodyWidth: document.documentElement.clientWidth < 1024 ? true : false,
                resultSuc: false,
                fileListTip: false,
                storage: 0,
                biling_price: 0,
                storage_cost_low: 0,
                storage_cost_average: 0,
                storage_cost_high: 0,
                center_fail: false,
                centerDialogVisible: false,
                width: document.body.clientWidth>600?'400px':'95%',
                gatewayContractAddress: this.$root.SWAN_PAYMENT_CONTRACT_ADDRESS,
                recipientAddress: this.$root.RECIPIENT,
                usdcAddress: this.$root.USDC_ADDRESS,
                hashload: false,
                timer: '',
                usdcAvailable: '',
            };
        },
        components: {},
        watch: {
            'ruleForm.fileList': function(){
                this.$refs['ruleForm'].validate((valid) => {});
                if(this.ruleForm.file_size_byte > 0){
                    this.calculation()
                }
            },
            metaAddress: function(){
                if(this.metaAddress) this.init()
            }
        },
        methods: {
            calculation(type){
                this.ruleForm.storage_cost = type ? '' : this.ruleForm.file_size_byte * this.ruleForm.duration * this.storage
                this.ruleForm.amount_minprice = Number(this.ruleForm.storage_cost * this.biling_price).toFixed(9)
                this.storage_cost_low = Number(this.ruleForm.storage_cost * this.biling_price * 2).toFixed(9)
                this.storage_cost_average = Number(this.ruleForm.storage_cost * this.biling_price * 3).toFixed(9)
                this.storage_cost_high = Number(this.ruleForm.storage_cost * this.biling_price * 5).toFixed(9)
            },
            agreeChange(val){
                switch (val) {
                    case 1:
                        this.ruleForm.amount = this.storage_cost_low
                        break;
                    case 2:
                        this.ruleForm.amount = this.storage_cost_average
                        break;
                    case 3:
                        this.ruleForm.amount = this.storage_cost_high
                        break;
                    default:
                        this.ruleForm.amount = this.storage_cost_low
                        return;
                }
            },
            submitForm(formName) {
                let _this = this;
                _this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(!_this.ruleForm.lock_plan || _this.ruleForm.amount<=0){
                            _this.ruleForm.lock_plan_tip = true
                            return false
                        }

                        if(_this.metaAddress){
                            console.log(_this.ruleForm.amount, _this.usdcAvailable)
                            if(_this.ruleForm.amount > _this.usdcAvailable ){
                                _this.$message.error('Insufficient balance')
                                return false
                            }

                            // 通过 FormData 对象上传文件
                            var formData = new FormData()
                            formData.append('file', _this._file)
                            // formData.append('task_name', _this.ruleForm.task_name)
                            _this.loading = true
                            // 发起请求
                            
                            axios.post(`${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/storage/ipfs/upload `, formData,{
                                headers: {
                                'Authorization': "Bearer "+_this.$store.getters.accessToken
                                },
                            })
                            .then((res) => {
                                // console.log('_RequestUploads_', res)
                                if (res.data.status == "success") {
                                    // this.$message({
                                    //     type: 'success',
                                    //     message: res.data.data
                                    // })
                                    
                                    // _this.tableData = res.data.data

                                    contract_erc20.methods.allowance(_this.gatewayContractAddress, _this.metaAddress).call()
                                    .then(resultUSDC => {
                                        console.log('allowance：'+ resultUSDC);
                                        if(resultUSDC < web3.utils.toWei(_this.ruleForm.amount, 'ether')){
                                            contract_erc20.methods.approve(_this.gatewayContractAddress, web3.utils.toWei(_this.ruleForm.amount, 'ether')).send({from:  _this.metaAddress})
                                            .then(receipt => {
                                                // console.log(receipt)
                                            })
                                        }
                                        _this.contractSend(res.data.data)
                                    })


                                    // _this.$router.push({name: 'Upload_files'})


                                } else {
                                    _this.$message.error(res.data.data)
                                }
                            }).catch(error => {
                                console.log(error)
                                _this.loading = false
                            })

                        }
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            contractSend(cid){
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
                    id: cid,
                    minPayment: web3.utils.toWei(String(_this.ruleForm.amount_minprice), 'ether'),
                    amount: web3.utils.toWei(_this.ruleForm.amount, 'ether'),
                    lockTime: 86400 * Number(_this.$root.LOCK_TIME), // one day
                    recipient: _this.recipientAddress, //todo:
                }
                
                contract_instance.methods.lockTokenPayment(lockObj)
                .send(payObject)
                .on('transactionHash', function(hash){
                    // console.log('hash console:', hash);
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
                    _this.loading = false
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
                            _this.loading = false
                            clearTimeout(_this.timer)
                            _this.$message({
                                message: 'Success',
                                type: 'success'
                            });
                        }
                    },
                    err => { console.error(err); }
                );
            },
            // 文件上传
            uploadFile(params) {
                this._file = params.file;
                const isLt2M = this._file.size / 1024 / 1024 < 2;
                this.ruleForm.file_size = this.sizeChange(this._file.size)
                this.ruleForm.file_size_byte = this.byteChange(this._file.size)
                
                if (!isLt2M) {
                    // this.$message.error(this.$t('deal.upload_form_file_tip'))
                    this.fileListTip = true
                    return false
                }else{
                    this.fileListTip = false
                }
            },
            sizeChange(bytes){
                if (!bytes) return "-";
                if (bytes === 0) return '0 B';
                var k = 1000, // or 1024
                    sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            },
            byteChange(limit){
                var size = "";
                // 只转换成GB
                if(limit <= 0){
                    return '-'
                }else{
                    size = limit/( 1024 * 1024 * 1024)
                }
                return size;
            },
            handleChange(file, fileList) {
                if (fileList.length > 0) {
                    this.ruleForm.fileList = [fileList[fileList.length - 1]]  // 这一步，是 展示最后一次选择的csv文件
                }
            },
            handleRemove(file, fileList) {
                // console.log(file, fileList);
                this.ruleForm.fileList = []
                this.ruleForm.file_size = ''
                this.ruleForm.file_size_byte = ''
            },
            stats(){
                let _this = this
                _this.loading = true
                let stats_api = `${process.env.BASE_API}stats/storage`
                axios.get(stats_api, {
                    headers: {
                        'Authorization': "Bearer "+ _this.$store.getters.accessToken
                    },
                }).then(res => {
                    if(res.data.data){
                        let cost = res.data.data.average_price_per_GB_per_year.split(" ")
                        if(cost[0]) _this.storage = cost[0]
                    }
                    _this.loading = false
                }).catch(error => {
                    console.log(error)
                    _this.loading = false
                })
                
                let billing_api = `${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/billing/price/filecoin`
                axios.get(billing_api, {
                    headers: {
                        'Authorization': "Bearer "+ _this.$store.getters.accessToken
                    },
                }).then(res => {
                    if(res.data.data){
                        _this.biling_price = res.data.data
                    }

                })

            },
            signFun(){
                let _this = this
                if(!_this.metaAddress){
                    NCWeb3.Init(addr=>{
                        _this.$nextTick(() => {
                            _this.$store.dispatch('setMetaAddress', addr)
                            _this.walletInfo()
                        })
                    })
                    return false
                }else{
                    _this.walletInfo()
                }
            },
            walletInfo() {
                let _this = this
                if(!_this.metaAddress){
                    return false
                }
                web3.eth.net.getId().then(netId => {
                    // console.log('network ID:', netId)
                    switch (netId) {
                        case 80001:
                            _this.center_fail = false
                            _this.centerDialogVisible = false
                            break;
                        default:
                            _this.center_fail = true
                            _this.centerDialogVisible = true
                            return;
                    }
                });
            },
            init(){
                // 授权代币
                let _this = this
                contract_erc20 = new web3.eth.Contract( erc20_contract_json );
                contract_erc20.options.address = _this.usdcAddress
                // 查询剩余代币余额为：
                contract_erc20.methods.balanceOf(_this.metaAddress).call()
                .then(resultUSDC => {
                    _this.usdcAvailable = web3.utils.fromWei(resultUSDC, 'ether');
                    console.log('Available:', _this.usdcAvailable)
                })
            }
        },
        mounted() {
            let _this = this
            that = _this
            _this.stats()
            if(_this.metaAddress) _this.init()
            _this.$store.dispatch("setRouterMenu", 0);
            _this.$store.dispatch('setHeadertitle', _this.$t('navbar.Upload_files'))
            document.onkeydown = function(e) {
                if (e.keyCode === 13) {
                }
            }
        },
        filters: {
            NumStorage(value) {
                if (!value) return "-";
                return value.toFixed(8);
            },
        },
        computed: {
            metaAddress() {
                return this.$store.getters.metaAddress
            }
        },
    };
</script>


<style scoped lang="scss">
    .el-dialog__wrapper /deep/ {  
        display: flex;
        align-items: center;
        .metaM{
            .el-dialog__body{
                padding: 0.25rem 0.25rem 0.2rem;
                .el-row{
                border-radius: 0.08rem;
                padding: 0.16rem;
                margin: 0.12rem 0px;
                border: 1px solid rgb(240, 185, 11);
                text-align: center;
                display: flex;
                -webkit-box-pack: justify;
                justify-content: space-between;
                -webkit-box-align: center;
                align-items: center;
                transition: all 0.3s ease 0s;
                background: rgba(240, 185, 11, 0.1);
                position: static;
                .el-col{
                    text-align: left;
                    font-size: 0.14rem;
                    img{
                    float: right;
                    height: 0.24rem;
                    }
                }
                }
            }
            .el-dialog__footer{
                padding: 0 0.25rem 0.3rem;
                .dialog-footer{
                .el-button{
                    width: 100%;
                    font-size: 0.14rem;
                    height: 0.4rem;
                    padding: 0;
                    background: #5c3cd3;
                    color: #fff;
                    border-radius: 0.08rem;
                    &:hover{
                    background: #4326ab;
                    }
                }
                p{
                    font-size: 0.13rem;
                    line-height: 1.5;
                    color: red;
                    margin: 0.1rem 0 0;
                }
                }
            }
        }
    }
    #Create {
        height: calc(100% - 0.6rem);
        padding: 0.3rem 0.2rem;
        font-size: 0.24rem;
        .upload{
            padding: 0.4rem 0.17rem;
            margin: 0 auto 0.2rem;
            background-color: #fff;
            border-radius: 0.1rem;
            overflow: hidden;
            .title{
                width: 100%;
                margin: 0 0 0.1rem;
                text-align: left;
                font-size: 0.1972rem;
                color: #000;
                line-height: 0.42rem;
                text-indent: 0.08rem;
            }
            .upload_form{
                // display: flex;
                // align-items: baseline;
                width: 80%; 
                margin: auto; 
                justify-content: flex-start;
                .el-form /deep/{
                    width: 96%;
                    margin: 0 2%;
                    .el-form-item{
                        display: flex;
                        align-items: center;
                        width: auto;
                        margin: 0.15rem auto;
                        .el-form-item__label{
                            width: 47%;
                            padding: 0 3% 0 0;
                            // max-width: 2rem;
                            line-height: 1.5;
                            text-align: left;
                            font-size: 0.1372rem;
                            white-space: normal;
                            color: #000;
                            font-weight: 500;
                            text-shadow: 0 0 black;
                            text-align: right;
                        }
                        .el-form-item__content{
                            display: flex;
                            align-items: center;
                            font-size: 0.1372rem;
                            white-space: normal;
                            word-break: break-word;
                            line-height: 1.5;
                            color: #666;
                            h4{
                                width: 100%;
                                font-size: 0.1372rem;
                                font-weight: 500;
                                line-height: 1.7;
                            }
                            h5{
                                width: 90%;
                                margin-top: 5px;
                                font-size: 0.11rem;
                                font-weight: 500;
                                line-height: 1.2;
                                color: #737373;
                            }
                            .el-tag, .el-button--small{
                                margin: 0 5px 5px 0;
                            }
                            .el-input{
                                width: auto;
                                .el-input__inner{
                                    height: 0.32rem;
                                    font-size: 0.1372rem;
                                    line-height: 0.32rem;
                                }
                                .el-input__suffix{
                                    display: none;
                                }
                            }
                            .el-form-item__error {
                                padding-top: 0;
                                margin: 0 0.1rem;
                                position: relative;
                                float: right;
                            }
                            .el-textarea{
                                width: 90% !important;
                            }
                            .upload-demo{
                                display:flex;
                                align-items: center;
                                flex-wrap: wrap;
                                .el-upload-list__item:first-child{
                                    margin-top: 0;
                                }
                                .el-upload--text{
                                    float: left;
                                    width: auto;
                                    height: auto;
                                    text-align: left;
                                    border: 0;
                                    .el-button--primary{
                                        height: 0.32rem;
                                        padding: 0 0.2rem;
                                        margin: 0 5px 0 0;
                                        line-height: 0.32rem;
                                        background-color:transparent;
                                        border: 1px solid #2c4c9e;
                                        border-radius: 0.08rem;
                                        color: #2c4c9e;
                                        font-size: 0.1372rem;
                                    }
                                }
                                .el-upload-list{
                                    // width: 100%;
                                    // float: none;
                                    // clear: both;
                                }
                            }
                            .el-upload__tip{
                                // float: left;
                                height: 100%;
                                align-items: center;
                                display: flex;
                                margin: 0 0 0 0.1rem;
                                color: #737373;
                                line-height: 1;
                                font-size: 0.12rem;
                            }
                            .el-radio{
                                .el-radio__inner{
                                    border-color: #d9d9d9;
                                    background-color: #d9d9d9;
                                }
                            }
                            .el-radio.is-checked{
                                .el-radio__inner{
                                    border-color: #0b318f;
                                    background-color: #0b318f;
                                }
                                .el-radio__inner::after{
                                    width: 6px;
                                    height: 6px;
                                }
                            }
                        }
                    }
                }
            }
            .upload_plan{
                width: 80%;
                margin: auto; 
                justify-content: flex-start;
                .title{
                    margin: 0.1rem 0;
                    line-height: 1.5;
                    text-align: center;
                    font-size: 0.1372rem;
                    white-space: normal;
                    color: #000;
                    font-weight: 500;
                    text-shadow: 0 0 black;
                    text-indent: 0;
                }
                .upload_plan_radio{
                    .el-radio-group /deep/{
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        .el-radio{
                            min-width: 20%;
                            height: auto;
                            padding: 0 0.1rem 0.15rem;
                            // line-height:30px;
                            .el-radio__input{
                                display: none;
                            }
                            .el-radio__label{
                                .title{
                                    margin: 0 0 0.05rem;
                                    font-size: 0.13rem;
                                }
                                .cont{
                                    font-size: 0.145rem;
                                    font-weight: bold;
                                    line-height: 1.5;
                                    text-align: center;
                                }
                            }
                        }
                        .el-radio:nth-child(3n+1){
                            .el-radio__label{
                                .cont{
                                    color: #56c4a6;
                                }
                            }
                        }
                        .el-radio:nth-child(3n+2){
                            .el-radio__label{
                                .cont{
                                    color: #4a92d3;
                                }
                            }
                        }
                        .el-radio:nth-child(3n+3){
                            .el-radio__label{
                                .cont{
                                    color: #922b26;
                                }
                            }
                        }
                        .is-checked{
                            position: relative;
                            &:after {
                                content: "";
                                display: block;
                                height: 25px;
                                width: 25px;
                                background-image: url(../assets/images/plan.png);
                                background-size: 100%;
                                position: absolute;
                                right:0;
                                top:0;
                            }
                        }
                        .el-radio:hover{
                            background-color: rgba(64,158,255,0.1);
                        }

                    }

                }
            }
            .upload_bot{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                margin: 0.25rem auto 0.15rem;
                .el-button /deep/{
                    height: 0.35rem;
                    padding: 0 0.4rem;
                    margin-left: 0;
                    background-color: #0b318f;
                    line-height: 0.35rem;
                    font-size: 0.1372rem;
                    color: #fff;
                    border: 0;
                }
            }
            .upload_result /deep/{
                width: 75%; 
                margin: 0.6rem auto 0.2rem; 
                .el-col{
                    display: flex;
                    align-items: flex-start;
                    font-size: 0.12rem;
                    color: #222;
                    margin: 0.15rem 0 0;
                    h5{
                        width: 100%;
                        font-size: 0.14rem;
                        font-weight: 500;
                        line-height: 1.3;
                        color: #000;
                    }
                    label{
                        width: 100px;
                        margin: 0 0 0 0.2rem;
                    }
                    p{
                        word-break: break-word;
                    }
                }
            }
        }


        /deep/ .el-list-enter-active,
        /deep/ .el-list-leave-active {
            transition: none;
        }

        /deep/ .el-list-enter,
        /deep/ .el-list-leave-active {
            opacity: 0;
        }
    }
    // #Create::-webkit-scrollbar-track {
    //     background: #ccc;
    // }
    // #Create::-webkit-scrollbar {
    //     width: 6px;
    //     background: #ccc;
    // }
    // #Create::-webkit-scrollbar-thumb {
    //     background: #f2f2f2;
    //     border-radius: 0.08rem;
    // }
    @media screen and (max-width: 1024px) {
        #Create{
            .upload {
                .upload_form {
                    .el-form {
                        width: 48%;
                    }
                }
            }
        } 
    }
    @media screen and (max-width: 999px) {
        #Create {
            padding: 0.1rem;
            .upload{
                padding: 0.1rem;
                .upload_form{
                    width: 90%;
                    flex-wrap: wrap;
                    .el-form /deep/{
                        width: 95%;
                    }
                }
            }
        }
    }
    @media screen and (max-width: 441px){
        #Create {
            .upload{
                 .title{
                    text-indent: 0;
                    font-size: 0.19rem;
                    line-height: 1.5;
                 }
                 .upload_form {
                     .el-form /deep/{
                         .el-form-item{
                             flex-wrap: wrap;
                             .el-form-item__content{
                                 flex-wrap: wrap;
                             }
                         }
                     }
                 }
                 .upload_result{
                     width: 90%;
                     margin: 0.2rem auto 0;
                     .el-col{
                         flex-wrap: wrap;
                         label{
                            margin: 0 0 5px;
                            width: 100%;
                            font-weight: 600;
                         }
                     }
                 }
            }
        }
    }
</style>

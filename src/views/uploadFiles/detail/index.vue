<template>
    <div id="dealManagement" v-loading="loading">
        <div class="backTo" @click="back">
            <span class="el-icon-back"></span>
            <span style="font-size:0.18rem;margin-left:0.05rem">{{$t('deal.backto')}}</span>
        </div>
        <div class="files_title">
            Deal Detail #{{dealId}}
            <span v-if="dealCont.deal">
                <img src="@/assets/images/dao_success.png" v-if="dealCont.deal.dao_signature_status == 'Success'"/>
                <img src="@/assets/images/dao_waiting.png" v-else-if="dealCont.deal.dao_signature_status == 'Waiting'"/>
                <img src="@/assets/images/error.png" v-else />
                <span v-if="dealCont.deal.dao_signature_status == 'Waiting'">Waiting for signatures to unlock funds</span>
            </span>
        </div>
        <div class="upload">
            <el-row>
                <el-col :span="8">Network:</el-col>
                <el-col :span="16">{{dealCont.deal.network_name | NumFormat}}</el-col>
                <el-col :span="8">Locked funds:</el-col>
                <el-col :span="16">{{dealCont.found.locked_fee | NumFormat}}</el-col>
                <el-col :span="8">Storage Cost:</el-col>
                <el-col :span="16">{{dealCont.deal.storage_price | NumFormat}}</el-col>
                <el-col :span="8">Proposal CID:</el-col>
                <el-col :span="16">{{dealCont.found.payload_cid | NumFormat}}</el-col>
                <el-col :span="8">Create Time:</el-col>
                <el-col :span="16">{{dealCont.found.create_at | NumFormat}}</el-col>
                <el-col :span="8">Message CID:</el-col>
                <el-col :span="16">{{dealCont.deal.message_cid | NumFormat}}</el-col>
                <el-col :span="8">Piece CID:</el-col>
                <el-col :span="16">{{dealCont.deal.piece_cid | NumFormat}}</el-col>
                <el-col :span="8">Client Address:</el-col>
                <el-col :span="16">{{dealCont.found.client_wallet_address | NumFormat}}</el-col>
                <el-col :span="8">Verified Deal:</el-col>
                <el-col :span="16">{{dealCont.deal.verified_deal?'True':'False'}}</el-col>
                <el-col :span="8">Storage Price Per Epoch:</el-col>
                <el-col :span="16">{{dealCont.deal.storage_price_per_epoch | NumFormat}}</el-col>
                <el-col :span="8">Signature Type:</el-col>
                <el-col :span="16">{{dealCont.deal.signature_type | NumFormat}}</el-col>
                <el-col :span="8">Signature:</el-col>
                <el-col :span="16">{{dealCont.deal.signature | NumFormat}}</el-col>
            </el-row>
            <div class="title">
                DAO Signatures
                <el-tooltip effect="dark" content="The signatures are used to unlock funds to provider." placement="top">
                    <img src="@/assets/images/info.png"/>
                </el-tooltip>
            </div>
            <el-table :data="daoCont" stripe style="width: 100%">
                <el-table-column type="index" width="180">
                    <template slot-scope="scope">
                        Signature {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column prop="dao_address" label="DAO RKH Address" min-width="220">
                    <template slot-scope="scope">
                        <div class="hot-cold-box">
                            <el-popover
                                placement="top"
                                trigger="hover"
                                v-model="scope.row.daoAddressVis">
                                <div class="upload_form_right">
                                    <p>{{scope.row.dao_address}}</p>
                                </div>
                                <el-button slot="reference" @click="copyTextToClipboard(scope.row.dao_address)">
                                    <img src="@/assets/images/copy.png" alt="">
                                    {{scope.row.dao_address}}
                                </el-button>
                            </el-popover>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="tx_hash" label="Transaction" min-width="220">
                    <template slot-scope="scope">
                        <div class="hot-cold-box">
                            <el-popover
                                placement="top"
                                trigger="hover" width="200"
                                v-model="scope.row.txHashVis">
                                <div class="upload_form_right">
                                    <p>{{scope.row.tx_hash}}</p>
                                </div>
                                 <!-- :class="{'color': dealCont.network&&dealCont.network.toLowerCase() == 'polygon'}" -->
                                <el-button slot="reference" @click="networkLink(scope.row.tx_hash)" class="color">
                                    <!-- <img src="@/assets/images/copy.png" alt=""> -->
                                    {{scope.row.tx_hash}}
                                </el-button>
                            </el-popover>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="Status">
                    <template slot-scope="scope">
                        <img src="@/assets/images/dao_success.png" v-if="scope.row.status == 'Success'"/>
                        <img src="@/assets/images/error.png" v-else-if="scope.row.status == 'Fail'"/>
                        <img src="@/assets/images/dao_waiting.png" v-else />
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 回到顶部 -->
        <el-backtop target=".content-box" :bottom="40" :right="20"></el-backtop>
    </div>
</template>

<script>
import axios from 'axios'
import moment from "moment";
export default {
    name: 'my_files',
    data() {
      return {
            loading: false,
            bodyWidth: document.documentElement.clientWidth<1024?true:false,
            dealId: '',
            dealCont: {
                deal: {},
                found: {}
            },
            daoCont: []
      };
    },
    computed: {},
    watch: {},
    methods: {
        networkLink(hash, network) {
            window.open('https://mumbai.polygonscan.com/tx/'+hash)
            // if(network && network.toLowerCase() == 'polygon'){
            //     window.open('https://mumbai.polygonscan.com/tx/'+hash)
            // }
        },
        copyTextToClipboard(text) {
            let _this = this
            let saveLang = localStorage.getItem('lang') == 'cn'?"复制成功":"success";
            var txtArea = document.createElement("textarea");
            txtArea.id = 'txt';
            txtArea.style.position = 'fixed';
            txtArea.style.top = '0';
            txtArea.style.left = '0';
            txtArea.style.opacity = '0';
            txtArea.value = text;
            document.body.appendChild(txtArea);
            txtArea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
                if (successful) {
                    _this.$message({
                        message: saveLang,
                        type: 'success'
                    });
                    return true;
                }
            } catch (err) {
                console.log('Oops, unable to copy');
            } finally {
                document.body.removeChild(txtArea);
            }
            return false;
        },
        back(){
            this.$router.go(-1);//返回上一层
        },
        getData() {
            let _this = this
            _this.loading = true

            axios.get(`${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/storage/deal/detail/${_this.dealId}`, {headers: {
            // axios.get(`./static/detail_page_response.json`, {headers: {
                    'Authorization':"Bearer "+ _this.$store.getters.accessToken
            }}).then((response) => {
                let json = response.data
                if (json.status == 'success') {
                    _this.daoCont = json.data.dao
                    _this.daoCont.map(item => {
                        item.daoAddressVis = false
                        item.txHashVis = false
                    })

                    _this.dealCont = json.data
                    _this.dealCont.found.create_at = 
                        _this.dealCont.found.create_at? 
                            moment(new Date(parseInt(_this.dealCont.found.create_at))).format(
                                "YYYY-MM-DD HH:mm:ss"
                            )
                            : "-";
                }else{
                    _this.$message.error(json.message);
                    return false
                }
                _this.loading = false
            }).catch(function (error) {
                console.log(error);
                _this.loading = false
            });


        }
    },
    mounted() {
        let _this = this
        _this.dealId = _this.$route.params.id
        _this.getData()
        document.getElementById("content-box").scrollTop = 0;
        _this.$store.dispatch("setRouterMenu", 1);
        _this.$store.dispatch("setHeadertitle", _this.$t('navbar.deal'));
    },
    filters: {
        priceFilter(value) {
            let realVal = "";
            if (!isNaN(value) && value !== "") {
                let tempVal = parseFloat(value).toFixed(19);
                realVal = tempVal.substring(0, tempVal.length - 1) + " FIL";
            } else {
                realVal = "-";
            }
            return realVal;
        },
        NumFormat (value) {
            if(value == 0) return 0;
            if(!value) return '-';
            return value
        }
    },
};
</script>


<style scoped lang="scss">
#dealManagement{
    padding: 0.25rem 0.2rem 0.5rem;
    .backTo{
        display: flex;
        align-items: center;
        font-size: 0.24rem;
        line-height: 1;
        margin: 0 0 0.2rem;
        cursor: pointer;
    }
    .files_title{
        display: flex;
        align-items: center;
        font-size: 0.16rem;
        font-weight: bold;
        line-height: 2;
        @media screen and (max-width:600px){
            font-size: 16px;
            flex-wrap: wrap;
        }
        img{
            width: 20px;
            height: 20px;
            margin: 0 0 0 15px;
            cursor: pointer;
        }
        span{
            display: flex;
            align-items: center;
            padding-left: 5px;
            color: red;
            font-size: 0.145rem;
            @media screen and (max-width:600px){
                font-size: 14px;
            }
        }
    }
    .upload{
        padding: 0.1rem 0.3rem 0.2rem;
        margin-bottom: 0.2rem;
        background-color: #fff;
        border-radius: 5px;
        overflow: hidden;
        border-top: 3px solid #0b318f;
        .el-row /deep/{
            width: 100%;
            max-width: 800px;
            padding: 0 0 0.15rem;
            .el-col{
                padding: 0.05rem 0;
                font-size: 0.1375rem;
                font-weight: 600;
                line-height: 1.3;
                color: #333;
                word-break: break-word;
                @media screen and (max-width:600px){
                    width: 100%;
                    font-size: 14px;
                }
            }
            .el-col:nth-child(2n+1){
                color: #4b4b4b;
                font-weight: normal;
            }
        }
        .title{
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0.1rem 0;
            line-height: 1.5;
            text-align: center;
            font-size: 0.145rem;
            font-weight: 600;
            white-space: normal;
            color: #333;
            text-shadow: 0 0 black;
            text-indent: 0;
            border-top: 1px solid #e4e4e4;
            @media screen and (max-width:600px){
                font-size: 16px;
            }
            img{
                width: 0.16rem;
                height: 0.16rem;
                margin: 0 0 0 5px;
                cursor: pointer;
            }
        }
        .el-table /deep/{
            td, th{
                .cell{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    word-break: break-word;
                    .hot-cold-box{
                        .el-button{
                            width: 100%;
                            border: 0;
                            padding: 0;
                            margin: 0;
                            background-color: transparent;
                            font-size: 0.1372rem;
                            word-break: break-word;
                            color: #000;
                            text-align: center;
                            line-height: 0.25rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: normal;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            @media screen and (max-width:600px){
                                font-size: 13px;
                            }
                            span{
                                line-height: 0.25rem;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: normal;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                            }
                            img{
                                display: none;
                                float: left;
                                width: 0.17rem;
                                margin-top: 0.03rem;
                            }
                        }
                        .color{
                            color: #4326ab;
                            text-decoration: underline;
                        }
                        .el-button:hover{
                            img{
                                display: inline-block;
                            }
                        }
                    }
                    a{
                        color: #4326ab;
                        &:hover{
                            text-decoration: underline;
                        }
                    }
                    img{
                        width: 30px;
                    }
                }
            }
        }
    }
}


@media screen and (max-width:999px){
    #dealManagement{
        padding: 0.15rem 0.1rem 0.3rem;
        .backTo{
            margin: 0.2rem 0;
        }
        .upload{
            padding: 0.1rem;
            .el-row /deep/{
                
            }
        }
        
    }
}
@media screen and (max-width:640px){
    #dealManagement{
        .upload{
            .el-row /deep/ {
                
            }
        }
    }
}

</style>

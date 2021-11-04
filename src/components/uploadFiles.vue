<template>
    <div id="Create">
        <div class="upload" v-loading="loading">
            <div class="upload_form">
                <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="demo-ruleForm">
                    <el-form-item prop="task_name" :label="$t('uploadFile.task_name')">
                        <el-input v-model="ruleForm.task_name" :placeholder="$t('uploadFile.task_name')"></el-input>
                    </el-form-item>
                    <el-form-item prop="fileList" :label="$t('uploadFile.upload')">
                        <div style="display:flex;justify-content: center;">
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
                        </div>
                    </el-form-item>
                    <el-form-item prop="" label=" ">
                        <div class="upload_bot">
                            <el-button type="primary" @click="submitForm('ruleForm')">{{$t('deal.Submit')}}</el-button>
                        </div>
                    </el-form-item>
                </el-form>
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

    </div>
</template>

<script>
    import bus from "@/components/bus";
    import * as myAjax from "@/api/uploadFile";
    import axios from 'axios'

    export default {
        name: "uploadFiles",
        data() {
            return {
                tableData: {
                    file_name: '',
                    task_name: '',
                    payload_cid: ''
                },
                ruleForm: {
                    task_name: '',
                    fileList: []
                },
                rules: {
                    task_name: [
                        { required: true, message: '', trigger: 'blur' }
                    ],
                    fileList: [
                        { type: 'array', required: true, message: 'Please choose a file', trigger: 'change' }
                    ],
                },
                loading: false,
                bodyWidth: document.documentElement.clientWidth < 1024 ? true : false,
                resultSuc: false,
                fileListTip: false,
            };
        },
        components: {},
        watch: {
            'ruleForm.fileList': function(){
                this.$refs['ruleForm'].validate((valid) => {});
            }
        },
        methods: {
            submitForm(formName) {
                let _this = this;
                _this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // 通过 FormData 对象上传文件
                        var formData = new FormData()
                        formData.append('file', _this._file)
                        formData.append('task_name', _this.ruleForm.task_name)
                        _this.loading = true
                        _this.resultSuc = false
                        // 发起请求
                        
                        axios.post(`${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/storage/ipfs/upload `, formData,{
                            headers: {
                            'Authorization': "Bearer "+_this.$store.getters.accessToken
                            },
                        })
                        .then((res) => {
                            // console.log('_RequestUploads_', res)
                            _this.loading = false
                            if (res.data.status == "success") {
                                this.$message({
                                    type: 'success',
                                    message: res.data.data
                                })
                                
                                _this.tableData = res.data.data
                                _this.$router.push({name: 'Upload_files'})
                                // _this.resultSuc = true


                            } else {
                                _this.$message.error(res.data.data)
                            }
                        }).catch(error => {
                            console.log(error)
                            _this.loading = false
                        })

                        // myAjax.uploadFile(formData).then(res => {
                        //     // console.log('_RequestUploads_', res)
                        //     _this.loading = false
                        //     if (res.status == "success") {
                        //         this.$message({
                        //             type: 'success',
                        //             message: res.message
                        //         })
                                
                        //         _this.tableData = res.data
                        //         _this.resultSuc = true


                        //     } else {
                        //         _this.$message.error(res.message)
                        //     }
                        // }).catch(error => {
                        //     console.log(error)
                        //     _this.loading = false
                        // })
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            // 文件上传
            uploadFile(params) {
                this._file = params.file;
                const isLt2M = this._file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                    // this.$message.error(this.$t('deal.upload_form_file_tip'))
                    this.fileListTip = true
                    return false
                }else{
                    this.fileListTip = false
                }
            },
            handleChange(file, fileList) {
                if (fileList.length > 0) {
                    this.ruleForm.fileList = [fileList[fileList.length - 1]]  // 这一步，是 展示最后一次选择的csv文件
                }
            },
            handleRemove(file, fileList) {
                // console.log(file, fileList);
                this.ruleForm.fileList = []
            },
        },
        mounted() {
            let _this = this
            _this.$store.dispatch("setRouterMenu", 0);
            _this.$store.dispatch('setHeadertitle', _this.$t('navbar.Upload_files'))
            document.onkeydown = function(e) {
                if (e.keyCode === 13) {
                }
            }
        },
        filters: {},
        computed: {},
    };
</script>


<style scoped lang="scss">
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
                display: flex;
                align-items: baseline;
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
                            width: 1.5rem;
                            max-width: 2rem;
                            line-height: 1.5;
                            text-align: left;
                            font-size: 0.1372rem;
                            white-space: normal;
                            color: #000;
                            font-weight: 500;
                            text-shadow: 0 0 black;
                        }
                        .el-form-item__content{
                            display: flex;
                            align-items: center;
                            width: 100%;
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
                                    width: 100%;
                                    float: none;
                                    clear: both;
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
            .upload_bot{
                display: flex;
                justify-content: flex-start;
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

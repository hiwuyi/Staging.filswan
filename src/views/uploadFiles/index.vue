<template>
  <div id="dealManagement">
    <div class="tabTaskStyle">
      <div class="createTask">
        <!-- name: 'Upload_files_create' -->
        <router-link :to="{name: 'Upload_files_create'}">
            Upload More Files
        </router-link>
      </div>
    </div>
    <div class="form">
      <div class="form_top">
        <div class="title">Latest storage requests. Select to see Filecoin deal details.</div>
        <div class="search_file">
          <p>Search by Task Name</p>

          <div class="search_right">
            <el-input
              :placeholder="$t('uploadFile.search_input')"
              prefix-icon="el-icon-search"
              v-model="searchValue"
            >
            </el-input>
            <el-button type="primary" style="background-color: #0b318f" @click="clearAll">
                        {{ $t("deal.Clear_all") }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="form_table">
        <!-- @row-click="tableTrClick" highlight-current-row  -->
        <el-table
          :data="tableData" ref="singleTable"  stripe
          style="width: 100%"
          :empty-text="$t('deal.formNotData')"
          :default-sort = "{prop: 'date', order: 'descending'}" v-loading="loading"
          
          @row-click="clickRowHandle"
          :row-key="getRowKeys"
          :expand-row-keys="expands"
          @expand-change="exChange"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <div class="expandArea" v-for="(item,index) in tableDataChild" :key="index">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="FILE">
                    <span>{{ item.file_name | NumFormat }} &nbsp; {{ item.file_size | formatbytes }} &nbsp;</span>
                    <div class="statusStyle" style="color: #6c757d" v-if="item.pin_status&&item.pin_status.toLowerCase()=='unpinned'">
                        {{item.pin_status}}
                    </div>
                    <div class="statusStyle" style="color: #ff9900" v-if="item.pin_status&&item.pin_status.toLowerCase()=='pinned'">
                        {{item.pin_status}}
                    </div>
                  </el-form-item>
                  <el-form-item :label="$t('deal.detailTable09')">
                      <div class="hot-cold-box">
                            <el-popover
                                v-if="item.payload_cid"
                                placement="top"
                                trigger="hover" width="300"
                                v-model="item.act">
                                <div class="upload_form_right">
                                    <p>{{item.payload_cid}}</p>
                                </div>
                                <el-button slot="reference" @click="copyTextToClipboard(item.payload_cid)">
                                    <img src="@/assets/images/copy.png" alt="">
                                    {{item.payload_cid}}
                                </el-button>
                            </el-popover>
                            <span v-else>-</span>
                      </div>
                  </el-form-item>
                  <el-form-item :label="$t('uploadFile.contract_id')">
                    <div class="hot-cold-box">
                        <el-popover
                            v-if="item.contract_id"
                            placement="top"
                            trigger="hover" width="300"
                            v-model="item.contVisible">
                            <div class="upload_form_right">
                                <p>{{item.contract_id}}</p>
                            </div>
                            <el-button slot="reference" @click="copyTextToClipboard(item.contract_id)">
                                <img src="@/assets/images/copy.png" alt="">
                                {{item.contract_id}}
                            </el-button>
                        </el-popover>
                        <span v-else>-</span>
                    </div>
                  </el-form-item>
                  <el-form-item :label="$t('deal.detailTable01')">
                    <div class="hot-cold-box">
                        <el-popover
                            v-if="item.deal_cid"
                            placement="top"
                            trigger="hover" width="300"
                            v-model="item.dealVisible">
                            <div class="upload_form_right">
                                <p>{{item.deal_cid}}</p>
                            </div>
                            <el-button slot="reference" @click="copyTextToClipboard(item.deal_cid)">
                                <img src="@/assets/images/copy.png" alt="">
                                {{item.deal_cid}}
                            </el-button>
                        </el-popover>
                        <span v-else>-</span>
                    </div>
                          <div class="statusStyle"
                              v-if="item.status == 'Created'"
                              :style="$status_color.Deal_color('Created')">
                              {{ language == 'en' ? 'Created' : '已创建' }}
                          </div>
                          <div class="statusStyle"
                              v-if="item.status == 'DealActive'"
                              :style="$status_color.Deal_color('DealActive')">
                              {{ language == 'en' ? 'DealActive' : '有效交易' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'Waiting'"
                              :style="$status_color.Deal_color('Waiting')">
                              {{ language == 'en' ? 'Waiting' : '等待中' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'ReadyForImport'"
                              :style="$status_color.Deal_color('ReadyForImport')">
                              {{ language == 'en' ? 'ReadyForImport' : '准备导入' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'FileImporting'"
                              :style="$status_color.Deal_color('FileImporting')">
                              {{ language == 'en' ? 'FileImporting' : '文件导入中' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'FileImported'"
                              :style="$status_color.Deal_color('FileImported')">
                              {{ language == 'en' ? 'FileImported' : '文件已导入' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'ImportFailed'"
                              :style="$status_color.Deal_color('ImportFailed')">
                              {{ language == 'en' ? 'ImportFailed' : '导入失败' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'Downloading'"
                              :style="$status_color.Deal_color('Downloading')">
                              {{ language == 'en' ? 'Downloading' : '下载中' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'Downloaded'"
                              :style="$status_color.Deal_color('Downloaded')">
                              {{ language == 'en' ? 'Downloaded' : '已下载' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'DownloadFailed'"
                              :style="$status_color.Deal_color('DownloadFailed')">
                              {{ language == 'en' ? 'DownloadFailed' : '下载失败' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'Completed'"
                              :style="$status_color.Deal_color('Completed')">
                              {{ language == 'en' ? 'Completed' : '已完成' }}
                          </div>
                          <div class="statusStyle"
                              v-else-if="item.status == 'Failed'"
                              :style="$status_color.Deal_color('Failed')">
                              {{ language == 'en' ? 'Failed' : '已失败' }}
                          </div>
                          <div class="statusStyle" v-else style="display:none;color: rgb(255, 184, 34)">
                              {{ item.status }}
                          </div>
                  </el-form-item>
                  <el-form-item :label="$t('deal.detailTable06')">
                    <span>{{item.updated_at}}</span>
                  </el-form-item>
                </el-form>

                <div class="storageStyle">
                  <div class="costTitle">Estimated Storage Cost</div>
                  <div class="costPrice">{{ item.storage_cost | NumStorage }}</div>
                  <div class="costDesc">*Calculated by filesize and average price per year.</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="task_name" :label="$t('deal.formTable01')" sortable min-width="120">
            <template slot-scope="scope">
              {{ scope.row.task_name }}
            </template>
          </el-table-column>
          <el-table-column prop="miner_id" label="PROVIDER ID" sortable min-width="120">
            <template slot-scope="scope">
              <div class="hot-cold-box">
                {{ scope.row.miner_id | NumFormat }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" sortable label="TASK STATUS" min-width="120">
            <template slot-scope="scope">
              <div
                class="statusStyle"
                v-if="scope.row.status == 'Created'"
                :style="$status_color.Task_color('Created')">
                {{ language == "en" ? "Created" : "已创建" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Assigned'"
                :style="$status_color.Task_color('Assigned')"
              >
                {{ language == "en" ? "Assigned" : "已分配" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Accepted'"
                :style="$status_color.Task_color('Accepted')"
              >
                {{ language == "en" ? "Accepted" : "已接受" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Completed'"
                :style="$status_color.Task_color('Completed')"
              >
                {{ language == "en" ? "Completed" : "已完成" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Failed'"
                :style="$status_color.Task_color('Failed')"
              >
                {{ language == "en" ? "Failed" : "已失败" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Cancelled'"
                :style="$status_color.Task_color('Cancelled')"
              >
                {{ language == "en" ? "Cancelled" : "已取消" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Closed'"
                :style="$status_color.Task_color('Closed')"
              >
                {{ language == "en" ? "Closed" : "已关闭" }}
              </div>
              <div
                class="statusStyle"
                v-else-if="scope.row.status == 'Expired'"
                :style="$status_color.Task_color('Expired')"
              >
                {{ language == "en" ? "Expired" : "已过期" }}
              </div>
              <div
                  class="statusStyle"
                  v-else-if="scope.row.status == 'ActionRequired'"
                  :style="$status_color.Task_color('ActionRequired')">
                  {{ language == 'en' ? 'ActionRequired' : '需要操作' }}
              </div>
              <div
                  class="statusStyle"
                  v-else-if="scope.row.status == 'DealSent'"
                  :style="$status_color.Task_color('DealSent')">
                  {{ language == 'en' ? 'DealSent' : '交易已发送' }}
              </div>
              <!-- <div class="scoreStyle" @click="openScore(scope.row)" v-show="scope.row.status == 'Completed'">Score</div> -->
            </template>
          </el-table-column>
          <el-table-column prop="deals" sortable :label="$t('deal.table_th_04')" min-width="120">
            <template slot-scope="scope">
                ({{ scope.row.successful_deal_count }}/{{
                  scope.row.deal_count
                }})
            </template>
          </el-table-column>
          <el-table-column prop="created_on" :label="$t('deal.formTable08')" sortable min-width="120"></el-table-column>
          <el-table-column prop="active" width="180" label="ACTION" sortable>
            <template slot-scope="scope">
              <div class="hot-cold-box">
                <el-button class="uploadBtn blue"
                  :class="{'opacity': (tableData[scope.$index].status.toLowerCase() != 'created' && tableData[scope.$index].status.toLowerCase() != 'actionRequired' && tableData[scope.$index].status.toLowerCase() != 'assigned')}"
                  :disabled="(tableData[scope.$index].status.toLowerCase() != 'created' && tableData[scope.$index].status.toLowerCase() != 'actionRequired' && tableData[scope.$index].status.toLowerCase() != 'assigned')" 
                  @click.stop="payClick(scope.row)">
                  PAY
                </el-button>
                <el-button 
                  :class="{'opacity':tableData[scope.$index].status.toLowerCase() == 'cancelled'}"
                  :disabled="tableData[scope.$index].status.toLowerCase() == 'cancelled'"
                  class="uploadBtn grey" @click="cancelClick(scope.row.uuid)">CANCEL</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="form_pagination">
          <div class="pagination">
            <el-pagination
              :total="parma.total"
              :page-size="parma.limit"
              :current-page="parma.offset"
              :pager-count="bodyWidth ? 5 : 7"
              background
              :layout="
                bodyWidth
                  ? 'prev, pager, next'
                  : 'total, prev, pager, next, jumper'
              "
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

    </div>

    <pay-tip v-if="payVisible" :payVisible="payVisible"
                :cid="payment.cid" :paymentAmount="payment.amount"
                @getDialog="getDialog" @getPay="getPay"></pay-tip>


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

    <el-dialog
    title="Tips"
    :visible.sync="wrongVisible" :show-close="false"
    :width="width" custom-class="wrongNet">
    <span>Please wait until the task is assigned to a storage provider.</span>
    </el-dialog>
    <!-- 回到顶部 -->
    <el-backtop target=".content-box" :bottom="40" :right="20"></el-backtop>
  </div>
</template>

<script>
import bus from "@/components/bus";
import axios from 'axios'
import * as myAjax from "@/api/uploadFile";
import moment from "moment";
import payTip from "@/components/payTip"
import NCWeb3 from "@/utils/web3";

export default {
  name: "uploadFiles",
  data() {
    return {
      tableData: [],
      tableDataChild: [],
      tableDataAll: [],
      parma: {
        limit: 10,
        offset: 0,
        locationValue: "",
        total: 0,
      },
      parmaChild: {
        limit: 10,
        offset: 0,
        locationValue: "",
        total: 0,
      },
      searchValue: "",
      loading: false,
      loadingChild: false,
      bodyWidth: document.documentElement.clientWidth < 1024 ? true : false,
      expands: [],
      getRowKeys: (row) => {
        return row.uuid
      },
      exChangeList: [],
      payVisible: false,
      toAddress: '',
      storage: 0,
      centerDialogVisible: false,
      center_fail: false,
      width: document.body.clientWidth>600?'400px':'95%',
      payment: {
        cid: '',
        amount: '',
        biling_price: 0
      },
      wrongVisible: false,
      paySuccess: false,
      timer: '',
      timeIndex: 0
    };
  },
  computed: {
    language() {
      return this.$store.state.app.language;
    },
    metaAddress() {
        return this.$store.getters.metaAddress
    }
  },
  components: {
      payTip
  },
  watch: {
    'searchValue': function(){
      let _this = this
      _this.parma.limit = 10
      _this.parma.offset = 0
      _this.parmaChild.limit = 10
      _this.parmaChild.offset = 0
      _this.getData()
    }
  },
  created() {
    if (this.$route.query.status !== undefined) {
      this.parma.limit = this.$route.query.limit;
      this.parma.searchValue = this.$route.query.task_name;
    }
  },
  methods: {
    clickRowHandle(row, column, event) {
      if (this.expands.includes(row.uuid)) {
        // this.expands = this.expands.filter(val => val !== row.uuid);
        this.expands = []
      } else {
        this.expands = []
        if (row) {
          this.expands.push(row.uuid)
        }
        this.tableTrClick(row)
      }
    },
    payClick(row){
      let _this = this
      if(row.status.toLowerCase() == 'created' || row.status.toLowerCase() == 'actionRequired'){
        _this.wrongVisible = true
        return false
      }
      if(!_this.metaAddress){
        _this.centerDialogVisible = true
      }else{
        if(_this.expands.indexOf(row.uuid) > -1){
          _this.walletInfo()
        }else{
          _this.expands = []
          _this.expands.push(row.uuid)
          _this.tableTrClick(row, 1)
        }
      }
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

            if(!_this.center_fail){
              _this.payVisible = true
            }
        });
    },
    getDialog(dialog, rows){
        this.payVisible = dialog
        if(rows) this.getData()
    },
    exChange(row, rowList) {
      var that = this
      if (rowList.length) {
        that.expands = []
        if (row) {
          that.expands.push(row.uuid)
          //open
        }
        that.tableTrClick(row)
      } else {
        that.expands = []
        //retract
      }
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
    tableTrClick(row, type) {
      let _this = this
      _this.loadingChild = true
      _this.tableDataChild = []
      myAjax
        .getTasksListDetails(row.uuid)
        .then((response) => {
          if (response.status == "success" || response.status == 'Success') {
            const data = response.data;
            _this.tableDataChild = response.data.deal;
            _this.tableDataChild.map((item, index) => {
              item.file_size_gb = _this.byteChange(item.file_size)
              item.storage_cost = item.file_size_gb * _this.storage
              item.dealVisible = false
              item.act = false
              item.contVisible = false
              item.updated_at = item.updated_at
                ? item.updated_at.length < 13
                  ? moment(new Date(parseInt(item.updated_at * 1000))).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : moment(new Date(parseInt(item.updated_at))).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                : "-";

              if(index == 0){
                _this.payFun(item.payload_cid)
                _this.toAddress = item.contract_id
                _this.payment.cid = item.payload_cid
                if(item.storage_cost && _this.payment.biling_price) _this.payment.amount = String(item.storage_cost * _this.payment.biling_price * _this.$root.PAY_WITH_MULTIPLY_FACTOR)
                if(type) _this.walletInfo()
              } 
            });
            // console.log(_this.tableDataChild)
          } else {
            // _this.$message.error(response.message);
          }
          _this.loadingChild = false;
        })
        .catch((error) => {
          console.log(error);
          _this.loadingChild = false;
        });
    
    },
    cancelClick(uuid){
      let _this = this;
      const h = _this.$createElement;
      _this
        .$msgbox({
          title: 'Tips',
          message: h("p", null, [
            h("span", null, 'Are you sure you want to modify the status to '),
            h("i", { style: "color: teal;font-style: normal" }, 'Cancel'),
          ]),
          showCancelButton: true,
          beforeClose: (action, instance, done) => {
            if (action === "confirm") {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = 'Executing...';

              let cancelDeal_api = `${process.env.BASE_API}tasks/${uuid}/paymentgateway/cancel`
              axios.put(cancelDeal_api, {}, {
                  headers: {
                      'Authorization': "Bearer "+ _this.$store.getters.accessToken
                  },
              }).then(res => {
                  if(res.data.status == 'success'){
                      _this.$message({
                          message: 'Cancel Success',
                          type: 'success'
                      });
                      done();
                      setTimeout(() => {
                        instance.confirmButtonLoading = false;
                      }, 300);
                      _this.getData()
                  }else{
                      _this.$message.error(res.data.message);
                  }
              }).catch(error => {
                  console.log(error)
                  done();
                  instance.confirmButtonLoading = false;
              })

            } else {
              done();
              instance.confirmButtonLoading = false;
            }
          },
        })
        .then((action) => {})
        .catch((action) => {});
    },
    payFun(cid, type){
      let _this = this
      let pay_api = `${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/events/logs/lock/${cid}`

      axios.get(pay_api, {
          headers: {
            'Authorization': "Bearer "+ _this.$store.getters.accessToken
          },
      })
      .then((json) => {
          if(json.data.status == 'success'){
            if(type){
                if(json.data.data.polygon.length>0 || json.data.data.goerli.length>0) {
                  clearTimeout(_this.timer)
                  _this.sendDeal()
                  _this.timeIndex = 0
                }
            }
            _this.paySuccess = json.data.data.polygon.length>0 || json.data.data.goerli.length>0 ? true : false
          }else{
            _this.paySuccess = true
          }
      }).catch(error => {
          console.log(error)
      })
    },
    getPay(status, cid){
      if(!status) return false
      let _this = this
      _this.timeIndex = 0
      _this.timer = setInterval(() => { 
        _this.timeIndex += 1
        _this.payFun(cid, 1); 
        if(_this.timeIndex > 9) clearTimeout(_this.timer)
      }, 5000);
    },
    sendDeal(){
        let _this = this
        let sendDeal_api = `${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/storage/lotus/deal/${_this.expands[0]}`
        axios.get(sendDeal_api, {
            headers: {
                'Authorization': "Bearer "+ _this.$store.getters.accessToken
            },
        }).then(res => {
            if(res.data.status == 'success'){
                _this.$message({
                    message: 'Send Deal Success',
                    type: 'success'
                });
                _this.getData()
            }else{
                _this.$message.error('Send Deal Fail');
            }
        }).catch(error => {
            console.log(error)
        })

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
    //查询
    search() {
      let _this = this;
      _this.parma.limit = 10;
      _this.paginationShow = true;
      _this.parma.offset = 0;
      _this.getData();
    },
    clearAll() {
      let _this = this;
      _this.searchValue = "";
      _this.parma.limit = 10;
      _this.parma.offset = 0;
      _this.getData();
    },
    handleCurrentChange(val) {
      this.parma.offset = val;
      this.getData();
    },
    stats(){
      let _this = this
      _this.loading = true;
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
        _this.getData()
      }).catch(error => {
          console.log(error)
          _this.getData()
      })
      
      let billing_api = `${process.env.BASE_PAYMENT_GATEWAY_API}api/v1/billing/price/filecoin`
      axios.get(billing_api, {
          headers: {
            'Authorization': "Bearer "+ _this.$store.getters.accessToken
          },
      }).then(res => {
        if(res.data.data){
          _this.payment.biling_price = res.data.data
        }

      })

    },
    getData() {
      let _this = this;
      _this.loading = true;
      let offset =
        _this.parma.offset > 0 ? _this.parma.offset - 1 : _this.parma.offset;
      let parma = {
        limit: _this.parma.limit,
        offset: offset * _this.parma.limit,
        task_name: _this.searchValue,
        source_id: 4
      };

      _this.tableData = []
      myAjax
        .getTasksList(parma)
        .then((response) => {
          if (response.status == "success") {
            const data = response.data;
            _this.expands = []
            // _this.tableData = Array.from(new Set(response.data.task));
            _this.parma.total = response.data.total_items;
            response.data.task.map((item,s) => {
              item.conIDvisible = false
              item.cIDvisible = false
              item.namevisible = false
              item.created_on = item.created_on
                ? item.created_on.length < 13
                  ? moment(new Date(parseInt(item.created_on * 1000))).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : moment(new Date(parseInt(item.created_on))).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                : "-";
              item.act = false;
              if(s == 0){
                _this.expands.push(item.uuid)
              }
            });

            _this.tableData = response.data.task;
            _this.tableDataAll = JSON.parse(JSON.stringify(_this.tableData))
            if(_this.tableData[0]){
              _this.$refs.singleTable.setCurrentRow(_this.tableData[0]);
              _this.tableTrClick(_this.tableData[0])
            }
            _this.loading = false
          } else {
            _this.$message.error(response.message);
            _this.loading = false;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    unique(arr) {
      const res = new Map();
      return arr.filter((arr) => !res.has(arr.value) && res.set(arr.value, 1));
    },
  },
  mounted() {
    let _this = this;
    document.getElementById("content-box").scrollTop = 0;
    _this.$store.dispatch("setRouterMenu", 1);
    _this.$store.dispatch("setHeadertitle", _this.$t('navbar.deal'));
    _this.stats()
    document.onkeydown = function (e) {
      if (e.keyCode === 13) {
      }
    };

  },
  filters: {
    NumFormat(value) {
      if (!value) return "-";
      return value;
    },
    NumStorage(value) {
      if (!value) return "- FIL";
      return value.toFixed(8) + ' FIL';
    },
    formatbytes: function (bytes) {
      if (!bytes) return "-";
      if (bytes === 0) return '0 B';
      var k = 1000, // or 1024
          sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
  },
};
</script>


<style scoped lang="scss">
#dealManagement {
  position: relative;
  padding: 0.25rem 0.2rem 0.5rem;

  .tabTaskStyle {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 0.2rem;
    overflow: hidden;
    .createTask {
      padding: 0.14rem 0;
      background-color: #fff;
      border-radius: 0.1rem;
      a {
        display: block;
        height: 0.35rem;
        padding: 0 0.1rem;
        margin: 0 0.27rem;
        background-color: #ffb822;
        line-height: 0.35rem;
        border-radius: 0.08rem;
        text-align: center;
        color: #fff;
        font-size: 0.1972rem;
        border: 0;
        outline: none;
      }
    }
  }
  .upload {
    padding: 0 0.17rem;
    margin: 0.2rem auto;
    background-color: #fff;
    border-radius: 0.1rem;
    overflow: hidden;

    .title {
      width: 100%;
      text-align: left;
      font-size: 0.1972rem;
      color: #000;
      line-height: 0.42rem;
      text-indent: 0.08rem;
    }

    .upload_form {
      display: flex;
      justify-content: center;
      // align-items: center;
      align-items: baseline;

      .el-form /deep/ {
        width: 42%;
        margin: 0;

        .el-form-item {
          display: flex;
          align-items: center;
          width: auto;
          margin: 0.08rem auto;

          .el-form-item__label {
            width: auto;
            max-width: 2rem;
            line-height: 1.5;
            text-align: left;
          }

          .el-form-item__content {
            display: flex;
            align-items: center;
            flex-wrap: wrap;

            h4 {
              width: 100%;
              font-size: 0.1372rem;
              font-weight: 500;
              line-height: 1.7;
            }

            h5 {
              width: 90%;
              margin-top: 5px;
              font-size: 10px;
              font-weight: 500;
              line-height: 1.2;
              color: #737373;
            }

            .el-tag,
            .el-button--small {
              margin: 0 5px 5px 0;
            }

            .el-input {
              width: auto;

              .el-input__inner {
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

            .upload-demo {
              .el-upload--text {
                float: left;
                width: auto;
                height: auto;
                text-align: left;
                border: 0;

                .el-button--primary {
                  height: 0.32rem;
                  padding: 0 0.2rem;
                  line-height: 0.32rem;
                  background-color: transparent;
                  border: 1px solid #2c4c9e;
                  border-radius: 0.08rem;
                  color: #2c4c9e;
                  font-size: 0.1372rem;
                }
              }

              .el-upload-list {
                width: 100%;
                float: none;
                clear: both;
              }
            }

            .el-upload__tip {
              // float: left;
              margin: 0 0 0 0.1rem;
              color: #737373;
              line-height: 1;
            }

            .el-radio {
              .el-radio__inner {
                border-color: #d9d9d9;
                background-color: #d9d9d9;
              }
            }

            .el-radio.is-checked {
              .el-radio__inner {
                border-color: #0b318f;
                background-color: #0b318f;
              }

              .el-radio__inner::after {
                width: 6px;
                height: 6px;
              }
            }
          }
        }
      }
    }

    .upload_bot {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0.25rem 0.3rem 0.15rem;

      .el-button /deep/ {
        height: 0.35rem;
        padding: 0 0.4rem;
        margin-left: 0.3rem;
        background-color: #0b318f;
        line-height: 0.35rem;
        font-size: 0.1372rem;
        color: #fff;
        border: 0;
      }
    }
  }

  .readme_cont {
    height: 4.1rem;
    padding: 0.1rem 0.1rem;
    background-color: #fff;
    border-radius: 0.1rem;

    #content {
      width: calc(100% - 0.34rem);
      height: calc(100% - 0.2rem);
      padding: 0.1rem 0.17rem;
      font-size: 0.1372rem;
      overflow-y: auto;
    }

    #content::-webkit-scrollbar-track {
      background: #fff;
    }

    #content::-webkit-scrollbar {
      width: 6px;
      background: #fff;
    }

    #content::-webkit-scrollbar-thumb {
      background: #f2f2f2;
      border-radius: 0.08rem;
    }
  }

  .form {
    padding: 0 0.17rem 0.2rem;
    background-color: #fff;
    border-radius: 0.1rem;

    .form_top {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .title {
        width: 100%;
        margin: 0;
        text-align: left;
        font-size: 0.12rem;
        font-weight: 600;
        color: #000;
        line-height: 0.42rem;
        text-indent: 0;
      }

      .search {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 0.42rem;

        .search_right {
          display: flex;
          align-items: center;
          // margin-left: 0.3rem;
        }

        span {
          margin: auto 0.05rem auto 0.35rem;
          font-size: 0.1372rem;
          color: #000;
          white-space: nowrap;
        }

        .el-button /deep/ {
          height: 0.34rem;
          padding: 0 0.4rem;
          margin: 0 0.1rem;
          color: #fff;
          line-height: 0.34rem;
          font-size: 0.1372rem;
          border: 0;
          border-radius: 0.08rem;
        }

        .el-input /deep/ {
          float: left;
          width: auto;

          .el-input__inner {
            width: 100%;
            max-width: 3rem;
            border-radius: 0.08rem;
            border: 1px solid #f8f8f8;
            color: #737373;
            font-size: 0.12rem;
            height: 0.24rem;
            line-height: 0.24rem;
            padding: 0 0.27rem;
          }

          .el-input__icon {
            line-height: 0.24rem;
          }
        }

        .el-select /deep/ {
          float: right;
          // width: 30%;
          .el-input__inner {
            border-radius: 0.08rem;
            border: 1px solid #f8f8f8;
            color: #737373;
            font-size: 0.12rem;
            height: 0.24rem;
            line-height: 0.24rem;
            padding: 0 0.1rem;
          }

          .el-input__icon {
            line-height: 0.24rem;
          }
        }
      }
      .search_file{
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 0.42rem;
        p{
          font-size: 0.13rem;
          color: #222;
        }
        .search_right {
          display: flex;
          align-items: center;
          width: 50%;
          // margin-left: 0.3rem;
          .el-button /deep/ {
              height: 0.3rem;
              padding: 0 0.15rem;
              margin: 0;
              color: #fff;
              line-height: 0.3rem;
              font-size: 0.1372rem;
              border: 0;
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
          }
        }
        .el-input /deep/ {
          float: left;

          .el-input__inner {
            width: 100%;
            color: #737373;
            font-size: 0.12rem;
            height: 0.3rem;
            line-height: 0.3rem;
            padding: 0 0.27rem;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }

          .el-input__icon {
            line-height: 0.3rem;
          }
        }
      }
    }

    .datasetStyle{
      padding: 0 0 0 20px;
      margin: 0.1rem 0 0;
      background: url(../../assets/images/download.png) no-repeat left center;
      background-size: 15px;
      font-size: 0.14rem;
      span{
        color: rgb(10, 49, 142);
        cursor: pointer;
      }
    }

    .form_table {
      margin: 0.1rem 0 0.1rem;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
      .statusStyle {
        display: inline-block;
        border: 1px solid;
        padding: 0 0.05rem;
        border-radius: 0.05rem;
        line-height: 0.28rem;
        // color: inherit !important;
      }

      .el-table /deep/ {
        overflow: visible;
        overflow-x: scroll;
        .el-table__body-wrapper,
        .el-table__header-wrapper {
          overflow: visible;
        }

        tr {
          cursor: pointer;
          th {
            height: 0.5rem;
            padding: 0;
            background-color: #f2f2f2 !important;
            text-align: center;

            .cell {
              word-break: break-word;
              font-weight: 500;
              color: #737373;
              text-transform: uppercase;
              .caret-wrapper{
                display: none;
              }
            }
          }

          .descending{
              position: relative;
              &::after{
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background-color: #0a318e;
              }
          }

          .ascending{
              position: relative;
              &::after{
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background-color: #0a318e;
              }
          }

          th.is-leaf {
            border-bottom: 0;
          }

          // th:first-child {
          //   border-top-left-radius: 4px;
          //   border-bottom-left-radius: 4px;
          // }

          // th:last-child {
          //   border-top-right-radius: 4px;
          //   border-bottom-right-radius: 4px;
          // }

          td {
            padding: 0.15rem 0.1rem;
            border-bottom: 1px solid #f2f2f2;

            .cell {
              padding: 0;
              font-size: 0.1372rem;
              word-break: break-word;
              color: #000;
              text-align: center;
              line-height: 0.25rem;
              overflow: visible;

              .el-rate__icon {
                font-size: 0.16rem;
                margin-right: 0;
              }
              .el-icon-arrow-right{
                font-weight: bold;
                font-size: 0.13rem;
              }
              .rightClick {
                color: #0c3090;
                cursor: pointer;
              }

              .hot-cold-box {
                position: relative;
                .cidLink{
                    line-height: 0.25rem;
                    overflow: hidden;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    color: inherit;
                }
                // .el-button {
                //   width: 100%;
                //   border: 0;
                //   padding: 0;
                //   background-color: transparent;
                //   font-size: 0.1372rem;
                //   word-break: break-word;
                //   color: #000;
                //   text-align: center;
                //   line-height: 0.25rem;
                //   overflow: hidden;
                //   text-overflow: ellipsis;
                //   white-space: normal;
                //   display: -webkit-box;
                //   -webkit-line-clamp: 1;
                //   -webkit-box-orient: vertical;
                //   span, a{
                //     line-height: 0.25rem;
                //     overflow: hidden;
                //     text-overflow: ellipsis;
                //     white-space: normal;
                //     display: -webkit-box;
                //     -webkit-line-clamp: 1;
                //     -webkit-box-orient: vertical;
                //     color: inherit;
                //   }
                // }
                .cidMore{
                  position: absolute;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  background-color: #fff;
                  width: 0.22rem;
                  padding: 0;
                    &::before{
                      content: '···';
                      font-weight: bold;
                      color: #0a318e;
                    }
                }
                .el-button{
                    width: 100%;
                    border: 0;
                    padding: 0;
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
                .el-button:hover{
                    img{
                        display: inline-block;
                    }
                }
                .uploadBtn{
                  width: auto;
                  padding: 0 0.1rem;
                  margin: auto;
                  color: #5a5a5a;
                  box-shadow: 0 0 0.06rem rgba(191, 191, 191, 0.32);
                  border-radius: 4px;
                  border: 1px solid #DCDFE6;
                  white-space: nowrap;
                  display: inline-block;
                  &:hover{
                    background-color: #fff;
                  }
                }
                .opacity{
                  box-shadow: none;
                  color: #b8b8b8;
                }
              }

              .el-button.el-icon-upload {
                padding: 0 0.03rem;
                line-height: 0.25rem;
                font-size: 0.1372rem;
              }

              .scoreStyle {
                width: 100%;
                clear: both;
                text-align: center;
                color: #ffb822;
                cursor: pointer;
              }

              .scoreStyle:hover {
                text-decoration: underline;
              }
            }
          }

          // td.el-table_1_column_1 {
          //   .cell {
          //     color: #0c3090;
          //   }
          // }
          .expandArea{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin: 0.2rem auto;
            width: 100%;
            max-width: 1200px;
            .demo-table-expand {
              font-size: 0;
            }
            .demo-table-expand label {
              width: 140px;
              font-size: 0.13rem;
              font-weight: 600;
              color: #737373;
              text-align: right;
            }
            .demo-table-expand .el-form-item {
              display: flex;
              align-items: center;
              margin-right: 0;
              margin-bottom: 0;
              width: 100%;
              .hot-cold-box {
                position: relative;
                float: left;
                margin-right: 0.1rem;
                .cidLink{
                    line-height: 0.25rem;
                    overflow: hidden;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    color: inherit;
                }
                .cidMore{
                  position: absolute;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  background-color: #fff;
                  width: 0.22rem;
                  padding: 0;
                    &::before{
                      content: '···';
                      font-weight: bold;
                      color: #0a318e;
                    }
                }
                .uploadBtn{
                  width: auto;
                  padding: 0.06rem 0.1rem;
                  margin: auto;
                  color: #5a5a5a;
                  box-shadow: 0 0 0.06rem rgba(191, 191, 191, 0.32);
                  border-radius: 4px;
                  border: 1px solid #DCDFE6;
                  white-space: nowrap;
                  &:hover{
                    background-color: #fff;
                  }
                }
                .el-button{
                    width: 100%;
                    border: 0;
                    padding: 0;
                    background-color: transparent;
                    font-size: 0.1372rem;
                    word-break: break-word;
                    color: #000;
                    text-align: left;
                    line-height: 0.25rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
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
                .el-button:hover{
                    img{
                        display: inline-block;
                    }
                }
              }
            }
            .el-table__expanded-cell{
              // padding: 0;
              .el-descriptions{
                overflow: auto;
                line-height: 0.25rem;
                z-index: 999;
                .el-descriptions__body{
                  padding: 0.2rem;
                  .el-descriptions__table{
                    tr{
                      background: transparent !important;
                      th, td{
                        height: auto;
                        padding: 0.1rem;
                        text-align: left;
                        border: 0;
                      }
                      th{
                        text-transform: uppercase;
                        background: #fafafa !important;
                        &::after{
                          display: none;
                        }
                      }
                      
                      .hot-cold-box {
                        position: relative;
                        .cidLink{
                            line-height: 0.25rem;
                            overflow: hidden;
                            white-space: normal;
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            color: inherit;
                        }
                        .cidMore{
                          position: absolute;
                          top: 0;
                          right: 0;
                          bottom: 0;
                          background-color: #fff;
                          width: 0.22rem;
                          padding: 0;
                            &::before{
                              content: '···';
                              font-weight: bold;
                              color: #0a318e;
                            }
                        }
                        .uploadBtn{
                          width: auto;
                          padding: 0.06rem 0.1rem;
                          margin: auto;
                          color: #5a5a5a;
                          box-shadow: 0 0 0.06rem rgba(191, 191, 191, 0.32);
                          border-radius: 4px;
                          border: 1px solid #DCDFE6;
                          white-space: nowrap;
                          &:hover{
                            background-color: #fff;
                          }
                        }
                        .el-button{
                            width: 100%;
                            border: 0;
                            padding: 0;
                            background-color: transparent;
                            font-size: 0.1372rem;
                            word-break: break-word;
                            color: #000;
                            text-align: left;
                            line-height: 0.25rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: normal;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
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
                        .el-button:hover{
                            img{
                                display: inline-block;
                            }
                        }
                      }
                    }
                  }
                }
              }
            }
            .storageStyle{
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              width: 40%;
              max-width: 350px;
              border: 2px solid #cecece;
              border-radius: 0.1rem;
              padding: 0.2rem;
              font-size: 0.16rem;
              text-align: center;
              div{
                width: 100%;
                line-height: 2;
                margin: 0 auto;
              }
              .costTitle{
                font-size: 0.18rem;
                font-weight: 600;
                color: #000;
              }
              .costPrice{
                margin: 0.1rem 0;
                font-size: 0.18rem;
                font-weight: 600;
                color: #e00000;
              }
              .costDesc{
                width: 80%;
                font-size: 0.14rem;
                color: #000;
                line-height: 1;
              }
            }
          }
          &:hover{
            td{
              .cell {
                .hot-cold-box {
                  .cidMore{
                    background-color: #F5F7FA;
                  }
                }
              }
            }
          }
        }
        .current-row{
          td{
            background-color: #F5F7FA;
            .cell {
              .hot-cold-box {
                .cidMore{
                  background-color: #F5F7FA;
                }
              }
            }
          }
        }
      }

      .el-select /deep/ {
        position: relative;
        cursor: pointer;
        color: transparent;

        .el-input {
          background: transparent;
          color: transparent;

          .el-input__inner {
            height: 0.27rem;
            line-height: 0.27rem;
            padding: 0 0.07rem;
            background: transparent;
            color: transparent;
            border-color: #f7f7f7;
            border-radius: 0.08rem;
          }

          .el-input__suffix {
            display: none;
          }

          input::-webkit-input-placeholder {
            color: transparent;
          }

          input::-moz-placeholder {
            /* Mozilla Firefox 19+ */
            color: transparent;
          }

          input:-moz-placeholder {
            /* Mozilla Firefox 4 to 18 */
            color: transparent;
          }

          input:-ms-input-placeholder {
            /* Internet Explorer 10-11 */
            color: transparent;
          }
        }
      }

      .actionStyle {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .actionBtn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 0.4rem;
          padding: 0.1rem 0;
          margin: auto;
          border-radius: 0.08rem;
          background-color: #d5d7de;
          border: 1px solid #f7f7f7;

          span {
            display: block;
            // width: 9px;
            // height: 9px;
            // margin: 0 0.04rem;
            width: 3px;
            height: 3px;
            margin: 0 0.01rem;
            background-color: #767c92;
            border-radius: 100%;
          }

          // span:nth-child(2){
          //     background-color: #fd397a;
          // }
          // span:nth-child(3){
          //     background-color: #1dc9b7;
          // }
          // span:nth-child(4){
          //     background-color: #404040;
          // }
        }

        .actStatus {
          // display: none;
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          background: #fff;
          border: 1px solid #f7f7f7;
          border-radius: 0.08rem;
          z-index: 1002;

          p {
            padding: 0.1rem 0;
            border-top: 1px solid #f7f7f7;
            font-size: 0.1372rem;
            color: #ffb822;
            line-height: 1;
          }

          p:nth-child(1) {
            border: 0;
            color: #1dc9b7;
          }

          p:nth-child(2) {
            // color: #fd397a;
            color: #404040;
          }

          p:nth-child(3) {
            color: #1dc9b7;
          }

          // p:nth-child(4){
          //     color: #404040;
          // }
          p:hover {
            font-size: 0.14rem;
          }
        }
      }

      .actionStatus {
        display: inline-block;
        padding: 0 0.05rem;
        background-color: #1dc9b7;
        font-size: 0.135rem;
        color: #fff;
        border-radius: 0.08rem;
        line-height: 2.2;
        white-space: nowrap;
      }
    }

    .form_pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 0.35rem;
      text-align: center;
      margin: 0.05rem 0;
      .pagination {
        display: flex;
        align-items: center;
        font-size: 0.1372rem;
        color: #000;

        .pagination_left {
          width: 0.24rem;
          height: 0.24rem;
          margin: 0 0.2rem;
          border: 1px solid #f8f8f8;
          border-radius: 0.04rem;
          text-align: center;
          line-height: 0.24rem;
          font-size: 0.16rem;
          color: #959494;
          cursor: pointer;
        }
      }
    }
  }

  .createStyle {
    position: absolute;
    top: -0.5rem;
    right: 0.2rem;
    padding: 0.08rem 0.2rem;
    background-color: #ffb822;
    border: 0;
    font-size: 0.17rem;
    z-index: 1003;
  }

  .el-dialog__wrapper /deep/ {    
    display: flex;
    align-items: center;
    .scoreCont {
      text-align: center;
      outline: none;

      .el-rate {
        outline: none;
      }
    }

    .el-dialog {
      .el-dialog__header {
        display: flex;
      }

      .el-dialog__footer {
        padding: 0.2rem 0.2rem;
        overflow: hidden;

        .el-button {
          float: right;
          margin-left: 0.2rem;
          padding: 0.07rem 0.2rem;
          border-radius: 0.08rem;
          font-size: 0.1372rem;
        }

        .el-button--primary {
          background-color: #0b318f;
          border-color: #0b318f;
        }

        .el-button--default {
          background-color: #fff;
          border-color: #0b318f;
          color: #0b318f;
        }

        .is-disabled {
          opacity: 0.5;
        }
      }
    }

    
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

    .wrongNet{
        margin: auto !important;
        background: #fff url(../../assets/images/tip_bg.png) no-repeat;
        background-size: 1.45rem;
        background-position: -0.2rem -0.3rem;
        border-radius: 4px;
        .el-dialog__header{
            display: flex;
            color: #000;
            font-size: 18px;
            padding: 0.15rem 0.15rem 0.1rem;
            .el-dialog__headerbtn{
                i{
                    color: #000;
                    font-weight: 600;
                }
            }
        }
        .el-dialog__body {
            padding: 0.2rem 0.2rem 0.3rem;
            span{
              word-break: break-word;
              line-height: 1.5;    
              color: #606266;
              font-size: 14px;
            }
        }
    }

  }
}
@media screen and (max-width: 1024px) {
  #dealManagement {

    .form {
      .form_top {
        .search {
          flex-wrap: wrap;
          height: auto;

          .el-input /deep/ {
            width: 100%;
            margin: 0.1rem 0;

            .el-input__inner {
              width: 100%;
              font-size: 0.1372rem;
            }
          }

          span {
            margin-left: 0;
          }

          .search_right {

            .el-select /deep/ {
              .el-input__inner {
                font-size: 0.1372rem;
              }
            }

            .el-button /deep/ {
              padding: 0 0.2rem;
              font-size: 0.1372rem;
            }
          }
        }
      }

      .form_table {
        overflow-x: scroll;

        .el-table /deep/ {
          width: 1024px !important;

          tr {
            td {
              .cell {
                .cellFileName {
                  display: -webkit-box;
                  -webkit-line-clamp: 3;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
              }
            }
          }
        }
      }
    }
  }
}
@media screen and (max-width: 999px) {
  #dealManagement {
    padding: 0.15rem 0.1rem 0.3rem;

    .tabTaskStyle {
      .createTask {
        a {
          font-size: 0.17rem;
        }
      }
    }
    .upload {
      padding: 0.1rem;

      .upload_form {
        flex-wrap: wrap;

        .el-form /deep/ {
          width: 95%;
        }
      }
    }
  }
}
@media screen and (max-width: 470px) {
  #dealManagement{
    .tabTaskStyle {
      .createTask {
        a {
          font-size: 0.15rem;
        }
      }
    }
    .form{
      .form_top{
        .search_file{
          flex-wrap: wrap;
          .search_right{
            width: 100%;
            margin: 0.05rem 0 0.2rem;
          }
        }
      }
    }
  }
}
@media screen and (max-width: 341px) { 
}
</style>

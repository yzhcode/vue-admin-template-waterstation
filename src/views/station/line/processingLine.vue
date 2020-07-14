<template>
    <div class="processingLineMain">
        <div class="alarmContainer">
            <div class="modal-c-bor" @click="showAlarmTb()">
                <div v-if="alarmTotal > 0">
                    <img class="alarmImg" src="~@/assets/img/line/alarm_bottom.png">
                    <img class="alarmImgAnima" src="~@/assets/img/line/alarm_top.png">
                </div>
                <div v-else>
                     <img class="alarmImg" src="~@/assets/img/line/alarm_normal.png">
                </div>
                <span :class="[alarmTotal > 0 ? 'alarmTitle_red' : 'alarmTitle_black']">报警</span>
                <span :class="[alarmTotal > 0 ? 'color_red':'color_black']">{{alarmTotal}}</span>
            </div>
            <!-- 自定义流水线组件 -->
            <!-- <assemblyLine
            :waterid="sid"
            v-model="activeID">
            </assemblyLine> -->
        </div>

        <div class="processingLineContainer">

            <!-- 设备状态 -->
            <div class="device-status-view">
                <div :class="[deviceIsOnLine == false ? 'water-c-2' : 'water-c-5']">设备状态：{{deviceIsOnLine ? "在线" : "离线"}}</div>
                <div v-show="deviceIsOnLine == false">设备最后在线时间：{{deviceLastOnlineTime}}</div>
                <div>页面刷新时间： {{pageRefreshTime}}</div>
            </div>


            <div class="shuixiantu-container">
                <div class="diceng-yewei-jiayao-normal" v-show="jiayaoIsLow == false"></div>
                <div class="diceng-yewei-jiayao-low" v-show="jiayaoIsLow == true"></div>

                <div class="diceng-yewei-xiaodu-normal" v-show="xiaoduIsLow == false"></div>
                <div class="diceng-yewei-xiaodu-low" v-show="xiaoduIsLow == true"></div>

                <div class="diceng-yewei-chushui-normal" v-show="chushuiIsLow == false"></div>
                <div class="diceng-yewei-chushui-low" v-show="chushuiIsLow == true"></div>

                <div class="shuixiantu-picture">

                    <div class="shuixiantu-text-ellipsis jiayaobeng-frequcy-title">加药泵频率：{{jiayaofrequcy}}</div>
                    <div class="shuixiantu-text-ellipsis xiaobeng-frequcy-title">消毒泵频率：{{xiaodufrequcy}}</div>


                    <div class="shuixiantu-tishi-jiayao-normal" v-show="jiayaoIsLow == false"></div>
                    <div class="shuixiantu-tishi-jiayao-low" v-show="jiayaoIsLow == true"></div>

                    <div class="shuixiantu-tishi-fanxi-off" v-show="fanxiIsOn == false"></div>
                    <div class="shuixiantu-tishi-fanxi-on" v-show="fanxiIsOn == true"></div>

                    <div class="shuixiantu-tishi-xiaodu-normal" v-show="xiaoduIsLow == false"></div>
                    <div class="shuixiantu-tishi-xiaodu-low" v-show="xiaoduIsLow == true"></div>

                    <div class="shuixiantu-tishi-chushui-normal" v-show="chushuiIsLow == false"></div>
                    <div class="shuixiantu-tishi-chushui-low" v-show="chushuiIsLow == true"></div>

                    <div class="shuixiantu-tishi-jinshuifa-on" v-show="jinshuifa == true"></div>
                    <div class="shuixiantu-tishi-jinshuifa-on-normal" v-show="jinshuifa == true"></div>
                    <div class="shuixiantu-tishi-jinshuifa-off" v-show="jinshuifa == false"></div>
                    <div class="shuixiantu-tishi-jinshuifa-off-normal" v-show="jinshuifa == false"></div>

                    <div class="shuixiantu-tishi-paiwu-on" v-show="paiwuIsOn == true"></div>
                    <div class="shuixiantu-tishi-paiwu-on-normal" v-show="paiwuIsOn == true"></div>
                    <div class="shuixiantu-tishi-paiwu-off" v-show="paiwuIsOn == false"></div>
                    <div class="shuixiantu-tishi-paiwu-off-normal" v-show="paiwuIsOn == false"></div>

                    <div class="shuixiantu-PAC"></div>
                    <div class="shuixiantu-NaClO"></div>

                    <div class="jiayaodiyewei-text" v-show="jiayaoIsLow == true">{{lowliquidLevel}}</div>
                    <div class="xiaodudiyewei-text" v-show="xiaoduIsLow == true">{{lowliquidLevel}}</div>
                    <div class="chushuidiyewei-text" v-show="chushuiIsLow == true">{{lowliquidLevel}}</div>
                    <!-- <div class="paiwukaiqi" v-show="paiwuIsOn == true">{{bengStatusIsOnText}}</div>
                    <div class="fanxikaiqi" v-show="fanxiIsOn == true">{{bengStatusIsOnText}}</div> -->
                    <div class="shuixiantu-text-ellipsis paiwu-total-time-text">排污累计时间：{{paiwushijian}}</div>
                    <div class="shuixiantu-fontsizetowidth shuixiantu-text-ellipsis yuanshuizhuodu">原水浊度：{{yuanshuizhuodu}}</div>
                    <div class="shuixiantu-fontsizetowidth shuixiantu-text-ellipsis chushuizhuodu">出水浊度：{{chushuizhuodu}}</div>
                    <div class="shuixiantu-fontsizetowidth shuixiantu-text-ellipsis chushuiyulv">出水余氯：{{chushuiyulv}}</div>

                    <!-- 动画 -->
                    <div class="jiayaobengbg1"></div>
                    <img src="~@/assets/img/line/waterlinebengAnimation.png" class="jiayaobeng1" id="jiayaobeng1">
                    <div class="jiayaobengbg2"></div>
                    <img src="~@/assets/img/line/waterlinebengAnimation.png" class="jiayaobeng2" id="jiayaobeng2">
                    <div class="xiaodubengbg1"></div>
                    <img src="~@/assets/img/line/waterlinebengAnimation.png" class="xiaodubeng1" id="xiaodubeng1">
                    <div class="xiaodubengbg2"></div>
                    <img src="~@/assets/img/line/waterlinebengAnimation.png" class="xiaodubeng2" id="xiaodubeng2">

                </div>
            </div>

            <p class="emptyItem" v-show="lineData.length == 0">
                暂无数据
            </p>

            <div class="lineCenterContent" v-show="lineData.length > 0">
                <div class="lineDataContainer">
                    <div class="progresslineDataItem" v-if="lineData.length > 0" v-for="(items, indexs) in lineData">
                        <div class="lineDataItemTitle font-s-16 water-n-1">{{items.work_part_name}}</div>
                        <div class="lineDataItemContent">
                            <div v-for="(item, index) in items.status_list" :class="{'alarm':item.is_alarming==1}" >
                                <template v-if="item.unit&&item.unit.length">
                                    <label>{{item.describe+" "+global_.unitShow(item.unit)}}</label>
                                    <span>{{deviceIsOnLine? (typeof(item.value) == "number" ? global_.roundFun(item.value,2) : item.value):'--'}}</span>
                                </template>
                                <template v-else>
                                    <label>{{item.describe}}</label>
                                    <template v-if="item.show_enum&&item.show_enum.length">
                                        <span>{{item.desc}}</span>
                                    </template>
                                    <template v-else>
                                        <span>{{deviceIsOnLine?(typeof(item.value) == "number" ? global_.roundFun(item.value,2) : item.value):'--'}}</span>
                                    </template>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="title color2 font-s-16" v-show="lineControl.length > 0">设备控制</div>
                <div v-show="lineControl.length > 0" class="switchControl">
                    <el-select v-model="controlValue" style="width:120px">
                        <el-option label="自动控制" value="1"></el-option>
                        <el-option label="手动控制" value="0"></el-option>
                    </el-select>
                </div>

                <div v-show="lineControl.length > 0" class="lineControlContainer">
                    <div v-for="(items, indexs) in lineControl" @click="modifyControl(items, indexs)">
                        <div :class="['controlItem',{'controlOff':items.value=='0'}]">
                            <div class="controlItemTitle font-s-16">{{items.work_part_name+" "+items.describe}}</div>
                            <div class="controlItemInfo font-s-24">{{items.desc}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 水站报警信息 -->

        <el-dialog title="报警记录" :visible.sync="dialogTableVisible" width="1000px" top="50px">
            <el-table v-show="waterAlarmData.length > 0" :data="waterAlarmData" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
              <el-table-column type="index" min-width="7%" align="center" :index="indexMethod">
              </el-table-column>
              <el-table-column label="时间" min-width="15%">
                <template slot-scope="scope">
                  {{global_.getTimeByFilter(scope.row.alarm_time)}}
                </template>
              </el-table-column>
              <el-table-column label="概述" prop="alarm_reason">
              </el-table-column>
              <!-- <el-table-column label="状态" min-width="15%">
                <template slot-scope="scope">
                  <div v-if="scope.row.process_time != null || userRole != 3">
                      {{scope.row.process_time != null ? '已处理' : '未处理'}}
                  </div>
                  <div v-else>
                    <el-button type="primary" @click="processingAlarm(scope.row)">处理</el-button>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="处理人" min-width="19%">
                <template slot-scope="scope">
                  {{scope.row.process_time == null ? "-" : scope.row.processor}}
                </template>
              </el-table-column>
              <el-table-column label="处理时间" min-width="18%">
                <template slot-scope="scope">
                  {{scope.row.process_time == null ? "-" : global_.getTimeByFilter(scope.row.process_time)}}
                </template>
              </el-table-column> -->
            </el-table>

            <el-pagination v-show="waterAlarmData.length > 0"
                @current-change="handleCurrentChange"
                :total="pageAlarmTotal"
                layout="total, prev, pager, next">
            </el-pagination>
            <p class="emptyItem-top-16 " v-show="waterAlarmData.length == 0">
                    暂无数据
            </p>
        </el-dialog>

        <!-- 报警处理确认框 -->
        <el-dialog :title="alarmTitle" :visible.sync="alarmProcessDialogVisible" width="30%" @close='closeDialog'>
            <el-form ref="form" label-width="125px">
                <el-form-item label="处理详情">
                    <el-input v-model.trim="alarmDetail"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload
                        accept=".jpg, .jpeg, .png, .gif, .json, .JPG, .JPEG, .PBG, .GIF, .JSON"
                        ref="upload"
                        :class="{hide:hideUpload}"
                        action="#"
                        list-type="picture-card"
                        :auto-upload="false"
                        :on-change="handleChange"
                        :on-remove="handleRemove"
                        :before-upload="beforeAvatarUpload">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button @click="clearAlarmInfo()">取 消</el-button>
                    <el-button type="primary" @click="alarmProcess()">处理</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    //import assemblyLine from "@/components/assemblyLine";
    import '@/assets/js/wavify.js';
    import { searchanim } from '@/assets/js/rotaAnimation.js';
    export default {
        data(){
            return{
                controlValue             : "1", //自动控制、手动控制标志
                userRole                 : this.$store.getters["siteConfig/renderUserRole"],//账号角色
                sid                      : this.$route.query.sid,//水站ID
                activeID                 : "1",//选中水线ID
                lineData                 : [],
                lineControl              : [],
                alarmTotal               : '0',
                waterAlarmData           : [],
                itemsOnPage              : 10,//分页基数
                currentPage              : 1,//当前页
                in_water_onoff           : false,
                pageAlarmTotal           : 0,
                dialogTableVisible       : false, // 报警弹框表格标志
                alarmProcessDialogVisible:false,//报警处理确认提示框
                processAlarmId           : 0,
                imageUrl                 : '',
                alarmDetail              : '',
                hideUpload               : false,
                alarmTitle               : '',
                //水线图
                jiayaoIsLow    : false,//加药桶低液位
                xiaoduIsLow    : false,//消毒剂低液位
                chushuiIsLow   : false,//出水口低液位
                fanxiIsOn      : false,//反洗指示是否打开
                paiwuIsOn      : false,//排污阀是否打开
                jinshuifa      : false,//进水阀是否打开

                jiayaobeng1    : searchanim,//加药泵1
                jiayaobeng2    : searchanim,//加药泵2
                xiaodubeng1    : searchanim,//消毒泵1
                xiaodubeng2    : searchanim,//消毒泵2

                yuanshuizhuodu : '--',//原水浊度
                chushuizhuodu  : '--',//出水浊度
                chushuiyulv    : '--',//出水余氯
                jiayaofrequcy  : '--',//加药频率
                xiaodufrequcy  : '--',//消毒频率
                paiwushijian   : '--',//排污累计时间

                jiayaobeng1State : false,
                jiayaobeng2State : false,
                xiaodubeng1State : false,
                xiaodubeng2State : false,

                lowliquidLevel      : '低液位',
                bengStatusIsOnText  : '开',
                deviceIsOnLine      : false,//设备是否在线 1：在线 0：离线
                deviceLastOnlineTime: '--',//最近一次上报数据的时间
                pageRefreshTime     : '--',//页面刷新时间
            }
        },
        components:{
            //assemblyLine,
        },
        watch:{
            /**
             * [监控value变化，处理异步情况]
             * @param  {[type]} newValue [description]
             * @param  {[type]} oldValue [description]
             * @return {[type]}          [description]
             */
            activeID(){
                // 切换查询
                this.queryWaterAffairsDetail();
            },
            jiayaobeng1State(){
                if (this.jiayaobeng1State == true) {
                    this.jiayaobeng1.startanim();
                } else {
                    this.jiayaobeng1.stopanim()
                }
            },
            jiayaobeng2State(){
                if (this.jiayaobeng2State == true) {
                    this.jiayaobeng2.startanim();
                } else {
                    this.jiayaobeng2.stopanim()
                }
            },
            xiaodubeng1State(){
                if (this.xiaodubeng1State == true) {
                    this.xiaodubeng1.startanim();
                } else {
                    this.xiaodubeng1.stopanim()
                }
            },
            xiaodubeng2State(){
                if (this.xiaodubeng2State == true) {
                    this.xiaodubeng2.startanim();
                } else {
                    this.xiaodubeng2.stopanim()
                }
            },
            in_water_onoff(){

            },
            // controlValue(){
            //     localStorage.setItem("controlType", controlValue);
            // }
        },
        mounted(){
            // let controlType = window.localStorage.getItem("controlType");
            // if (!controlType) {
            //     controlValue = '1';
            // } else {
            //     controlValue = controlType;
            // }
            this.$nextTick(()=>{
                // 初始化滚动容器
                this.initPerfectScrollbar();
                // 初始化波浪动画效果
                this.initWavify();
            });

            // 加载水线详情
            this.queryWaterAffairsDetail();
            //定时刷新
            this.dataRefreh();
        },
        beforeDestroy(){
            this.clear();
        },
        methods:{
            handleRemove(file, fileList) {
                this.imageUrl = null;
                this.hideUpload = fileList.length >= 1;
            },
            handleChange(file, fileList) {
                this.imageUrl = file.url;
                this.hideUpload = fileList.length >= 1;
            },
            beforeAvatarUpload(file) {
                const isImage = file.type === 'image/jpg'||'image/jpeg'||'image/gif'||'image/png'||'image/json'
                                            ||'image/JPG'||'image/JPEG'||'image/GIF'||'image/PBG'||'image/JSON';
                const isLt29M = file.size / 1024 / 1024 < 29;

                if (!isImage) {
                  this.$toast('上传文件只能是图片格式!');
                }
                if (!isLt29M) {
                  this.$toast('上传文件大小不能超过 2MB!');
                }
                return isImage && isLt29M;
            },
            indexMethod(index) {
                return (this.currentPage-1)*this.itemsOnPage+index+1;
            },
            //实时获取监控数据
            // 定时刷新数据函数
            dataRefreh() {
              // 计时器正在进行中，退出函数
              if (this.intervalId != null) {
                return;
              }
              // 计时器为空，操作
              this.intervalId = setInterval(() => {
                this.queryWaterAffairsDetail();
              }, 5000);
            },
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
            handleCurrentChange(val){
                this.currentPage = val;
                this.queryWaterAffairsAlarmDetail();
            },
            showAlarmTb()
            {
                this.needCreatePage = true;
                this.queryWaterAffairsAlarmDetail();
                this.dialogTableVisible = true;
            },
            // 初始化动画效果
            initWavify(){
                this.jiayaobeng1 = new searchanim({
                    elemid : 'jiayaobeng1',
                    delay : 10,
                });
                if (this.jiayaobeng1State == true) {
                    this.jiayaobeng1.startanim();
                } else {
                    this.jiayaobeng1.stopanim()
                }

                this.jiayaobeng2 = new searchanim({
                    elemid : 'jiayaobeng2',
                    delay : 10,
                });
                if (this.jiayaobeng2State == true) {
                    this.jiayaobeng2.startanim();
                } else {
                    this.jiayaobeng2.stopanim()
                }

                this.xiaodubeng1 = new searchanim({
                    elemid : 'xiaodubeng1',
                    delay : 10,
                });
                if (this.xiaodubeng1State == true) {
                    this.xiaodubeng1.startanim();
                } else {
                    this.xiaodubeng1.stopanim()
                }

                this.xiaodubeng2 = new searchanim({
                    elemid : 'xiaodubeng2',
                    delay : 10,
                });
                if (this.xiaodubeng2State == true) {
                    this.xiaodubeng2.startanim();
                } else {
                    this.xiaodubeng2.stopanim()
                }
            },
            /**
             * [查询水线详细信息]
             * @return {[type]}         [description]
             */
            queryWaterAffairsDetail(){
                this.pageRefreshTime = this.global_.dateformatToString(new Date()).split(':').slice(0, 2).join(':');
                // 重置滚动条位置
                $("#scrollContainer").scrollTop(0);

                try{
                    this.$fetch({
                        url: "/Web/WaterAffairs/processing_line_info?action=get",
                        method: "get",
                        data:{
                            wateraffairs_id: this.sid,
                            line_num       : this.activeID,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data.config_list) {
                                this.lineControl = jsonData.data.config_list;
                            } else {
                                 this.lineControl = [];
                            }
                            if (this.lineControl.length > 0) {
                                this.in_water_onoff = this.lineControl[0].value;
                            } else {
                                this.in_water_onoff = false;
                            }
                            if (jsonData.data.hasOwnProperty("is_online")) {
                                this.deviceIsOnLine = jsonData.data.is_online == 1 ? true : false;
                            }
                            let tempLastTime = '--';
                            if (jsonData.data.hasOwnProperty("last_online_time")) {
                                tempLastTime =jsonData.data.last_online_time.split(':').slice(0, 2).join(':');
                            }
                            this.deviceLastOnlineTime = tempLastTime;
                            if (tempLastTime.length == 0) {
                                this.deviceLastOnlineTime = '--';
                            }
                            if (jsonData.data.work_part_list) {
                                this.lineData    = jsonData.data.work_part_list;
                            } else {
                                 this.lineData = [];
                            }
                            this.getWaterlineDataDisplay(this.lineData);
                            this.alarmTotal  = jsonData.data.alarm_total;
                            // this.alarmTotal  = '0';
                            this.initPerfectScrollbar("update");
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                    });
                }catch(e){
                    console.log("queryWaterAffairsDetail: "+e);
                };
            },
            /**
             * [获取水线图上的数据]
             * @param  {[type]} DataArray [原始数据]
             * @return {[type]}          [description]
             */
            getWaterlineDataDisplay(dataArray){
                let partCount = dataArray.length;
                if (this.deviceIsOnLine) {
                    this.lowliquidLevel = '低液位';
                    this.bengStatusIsOnText = '开';
                } else {
                    this.lowliquidLevel = '--';
                    this.bengStatusIsOnText = '--';
                }
                if (partCount > 0) {
                    for (var i = 0; i < partCount; i++) {
                        let partItem = dataArray[i];
                        if (partItem.work_part_id == 1) {//进水管
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 2) {//浊度
                                    if (this.deviceIsOnLine) {
                                        this.yuanshuizhuodu = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.yuanshuizhuodu = '--';
                                    }
                                } else if (statusItem.items_id == 7) {//进水阀
                                    if (this.deviceIsOnLine) {
                                        this.jinshuifa = statusItem.value == '是' ? true : false;
                                    } else {
                                        this.jinshuifa = false;
                                    }
                                }
                            }
                        } else if (partItem.work_part_id == 2) {//沉淀池
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 3) {//1#排污阀
                                    if (this.deviceIsOnLine) {
                                        this.paiwuIsOn = statusItem.value == '是' ? true : false;
                                    } else {
                                        this.paiwuIsOn = false;
                                    }
                                } else if (statusItem.items_id == 5) {//2#排污阀

                                } else if (statusItem.items_id == 26) {//排污累计时间
                                    if (this.deviceIsOnLine) {
                                        this.paiwushijian = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.paiwushijian = '--';
                                    }
                                }
                            }
                        } else if (partItem.work_part_id == 3) {//过滤池
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 14) {//反洗装置
                                    if (this.deviceIsOnLine) {
                                        this.fanxiIsOn = statusItem.value == '开' ? true : false;
                                    } else {
                                        this.fanxiIsOn = false;
                                    }
                                }
                            }
                        } else if (partItem.work_part_id == 4) {//加药
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 9) {//加药桶低液位 1
                                    this.jiayaoIsLow = statusItem.value == '低液位' ? true : false;
                                } else if (statusItem.items_id == 19) {//1#加药泵
                                    if (this.deviceIsOnLine) {
                                        this.jiayaobeng1State = statusItem.value == '开' ? true : false;
                                    } else {
                                        this.jiayaobeng1State = false;
                                    }
                                } else if (statusItem.items_id == 20) {//2#加药泵
                                    if (this.deviceIsOnLine) {
                                        this.jiayaobeng2State = statusItem.value == '开' ? true : false;
                                    } else {
                                        this.jiayaobeng2State = false;
                                    }
                                } else if (statusItem.items_id == 24) {//加药泵频率
                                    if (this.deviceIsOnLine) {
                                        this.jiayaofrequcy = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.jiayaofrequcy = '--';
                                    }
                                }
                            }
                        } else if (partItem.work_part_id == 5) {//消毒
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 10) {//消毒剂低液位 1
                                    this.xiaoduIsLow = statusItem.value == '低液位' ? true : false;
                                } else if (statusItem.items_id == 21) {//消毒泵
                                    if (this.deviceIsOnLine) {
                                        this.xiaodubeng1State = statusItem.value == '开' ? true : false;
                                    } else {
                                        this.xiaodubeng1State = false;
                                    }
                                }
                            }
                        } else if (partItem.work_part_id == 6) {//清水池
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 11) {//清水池低液位 1
                                    this.chushuiIsLow = statusItem.value == '低液位' ? true : false;
                                }
                            }
                        } else if (partItem.work_part_id == 7) {//供水装置
                            for (var j = 0; j < partItem.status_list.length; j++) {
                                var statusItem = partItem.status_list[j];
                                if (statusItem.items_id == 1) {//出水余氯
                                    if (this.deviceIsOnLine) {
                                        this.chushuiyulv = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.chushuiyulv = '--';
                                    }
                                } else if (statusItem.items_id == 23) {//出水浊度
                                    if (this.deviceIsOnLine) {
                                        this.chushuizhuodu = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.chushuizhuodu = '--';
                                    }
                                } else if (statusItem.items_id == 25) {//消毒泵频率
                                    if (this.deviceIsOnLine) {
                                        this.xiaodufrequcy = this.global_.roundFun(statusItem.value,2) +' ' + statusItem.unit;
                                    } else {
                                        this.xiaodufrequcy = '--';
                                    }
                                }
                            }
                        }
                    }
                } else {
                    //console.log('没有数据');
                }
            },
            /**
             * 报警处理
             * @return {[type]} [description]
             */
            processingAlarm(transItem) {
                this.alarmTitle = transItem.alarm_reason;
                this.alarmProcessDialogVisible = true;
                this.processAlarmId = transItem.id;;
            },
            closeDialog(){
              this.clearAlarmInfo();
            },
            clearAlarmInfo(){
                this.alarmTitle = null;
                this.alarm_id = 0;
                this.alarmDetail = '';
                this.alarmProcessDialogVisible = false;
                if(this.hideUpload){
                    this.imageUrl = null;
                    this.$refs.upload.clearFiles();
                    this.hideUpload = false;
                }
            },

            alarmProcess(){
                this.$loading.show("处理中");
                this.alarmProcessDialogVisible = false;
                try{
                    this.$fetch({
                        url   : '/Web/WaterAffairs/alarm_processing?action=post',
                        method: "post",
                        data  : {
                                    alarm_id: this.processAlarmId,//处理的报警消息ID
                                    alarm_image: this.imageUrl,//图片url
                                    process_detail: this.alarmDetail,//处理详情
                                }
                    }).then(res => {
                        let json = res.data,
                            data = json.data;
                        if(json.result == 'success'){
                            this.queryWaterAffairsAlarmDetail();
                            this.$toast('处理成功');
                        }else{
                            this.$toast(json.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                        this.clearAlarmInfo();
                    })
                }catch(e){
                    this.$loading.hide();
                    this.clearAlarmInfo();
                    this.$toast('处理失败');
                    console.log("processingAlarm: "+e);
                };
            },
            /**
             * [查询水线报警记录详细信息]
             * @return {[type]}         [description]
             */
            queryWaterAffairsAlarmDetail(){
                try{
                    this.$fetch({
                        url: "Web/WaterAffairs/get_alarm_history?action=get",
                        method: "get",
                        data:{
                            wateraffairs_id: this.sid,
                            line_num       : this.activeID,
                            // 水线弹框不做分页查询
                            page           : this.currentPage,
                            page_size      : this.itemsOnPage,
                         }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.waterAlarmData = jsonData.data.history_list;
                            if (jsonData.data.hasOwnProperty("total_num")) {
                                let num = jsonData.data.total_num;
                                this.pageAlarmTotal = parseInt(num);
                            }
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                    });
                }catch(e){
                    console.log("queryWaterAffairsAlarmDetail: "+e);
                };
            },
            /**
             * [修改控制参数]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            modifyControl(transData, indexs){
                // 自动控制模式下面，不能手动控制
                if (this.controlValue == '1') {
                    this.$toast('请切换到手动控制模式，再点击控制按钮');
                    return;
                }
                let _config_enum = transData.config_enum;
                let _value = transData.value;
                let _index = 0,_countIndex;
                _config_enum.forEach((item,index)=>{
                    if(_value == item.value){
                        _index = index;
                        return;
                    }
                });
                _countIndex = (_index+1);
                if(_countIndex == _config_enum.length){
                    _countIndex = 0;
                }
                transData.value = _config_enum[_countIndex].value;
                transData.desc  = _config_enum[_countIndex].desc;

                this.$loading.show("请稍等");

                try{
                    this.$fetch({
                        url: "/Web/PLCDevice/plc_device_variable_modify_value?action=post",
                        data:{
                            box_sn             : transData.sn,
                            var_item_type_id   : transData.items_id,
                            var_item_type_value: transData.value,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (indexs == 0) {
                                this.in_water_onoff = transData.value;
                            }
                            this.$toast("操作成功");
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    console.log("modifyControl: "+e);
                };
            },
            /**
             * [初始化滚动插件]
             * @return {[type]} [description]
             */
            initPerfectScrollbar(command){
                $('#scrollContainer').perfectScrollbar(command);
            }
        }
    }
</script>

<style scope>
    .switchControl{
        margin-bottom: 15px;
        margin-left: 100px;
        margin-top: -41px;
    }
    .alarmContainer{
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .alarmContainer .modal-c-bor{
        display: flex;
        width: 165px;
        height: 48px;
        margin: 0px 16px 0px 0px;
        align-items: center;
    }
    .alarmImg{
        height: 25px;
        width: 25px;
        margin-left: 10px;
        margin-top: -2px;
    }
    .alarmImgAnima{
        height: 25px;
        width: 25px;
        left: 25px;
        top: 24px;
        position: absolute;
        animation: hiddenAnima 0.5s infinite;
    }
    @keyframes hiddenAnima{
        0%{opacity: 0;}
        100%{opacity: 1;}
    }
    .alarmTitle_red{
        margin-left: 10px;
        color: red;
    }
    .alarmTitle_black{
        margin-left: 10px;
        color: black;
    }
    .color_red{
        flex-grow: 1;
        text-align: right;
        margin-right: 20px;
        color: red;
    }
    .color_black{
        flex-grow: 1;
        text-align: right;
        margin-right: 20px;
        color: black;
    }
    .switchControl .el-input__inner {
        height: 35px;
        line-height: 48px;
    }
    @media screen and (min-width: 20px) and (max-width: 1281px){
        .processingLineContainer{
        }
        .lineContainerLeft{
            width: 80rem;
            position: relative;
            float: left;
        }
        .lineContainerLeft .lineLegendContainer{
            height: 16.428571rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner{

        }
        .lineContainerLeft .lineLegendContainer .pContaner div{
            height: 155px;
            position: relative;
            float: left;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave1{
            width: 100px;
            height: 130px;
            position: absolute;
            top: 25px;
            left: 25px;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave4{
            width: 150px;
            height: 130px;
            position: absolute;
            top: 1.585714rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave5{
            width: 140px;
            height: 165px;
            position: absolute;
            top: -9px;
            left: 0.657143rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave7{
            width: 95px;
            height: 140px;
            position: absolute;
            top: 10px;
            left: 30px;
        }
        .lineContainerLeft .lineLegendContainer .lineContainer{
            position: absolute;
            z-index: 2;
        }
        .lineContainerLeft .lineLegendContainer .lineContainer div{
            height: 155px;
            position: relative;
            float: left;
        }
        .lineCenterContent{
            margin-top: 30px;
            width: 100%;
            position: relative;
            float: left;
        }

        .lineDataContainer{
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;

        }
        .progresslineDataItem{
            width: 15.257143rem;
            min-height: 15.714286rem;
            padding: 1.428571rem;
            margin: 0 1.571429rem 1.071429rem 0;
            border-radius:8px;
            background: #FFFFFF;
            box-shadow:0px 4px 12px 0px rgba(37,130,247,0.2);
        }
        .progresslineDataItem .lineDataItemTitle{
            width: 100%;
            margin: 0 0 1.428571rem 0;
        }
        .progresslineDataItem .lineDataItemContent{
            width: 100%;
        }
        .progresslineDataItem .lineDataItemContent div{
            color: #757D88;
            display: flex;
            justify-content: space-between;
            margin: 0 0 0.714286rem 0;
        }
        .progresslineDataItem .lineDataItemContent div.alarm{
            color: #F83D3D;
        }

        .lineControlContainer{
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
        }

        .controlItem{
            width: 15.0rem;
            height: 7.857143rem;
            padding: 1.428571rem;
            margin: 0 1.071429rem 1.071429rem 0;
            color: #FFFFFF;
            cursor: pointer;
            border-radius:8px;
            background: #2582F7;
            box-shadow:0px 4px 12px 0px rgba(37,130,247,0.2);
        }
        .controlItem .controlItemTitle,.controlItem .controlItemInfo{
            width: 100%;
            text-align: center;
        }
        .controlItem .controlItemTitle{
            margin: 0 0 0.714286rem 0;
        }
        .controlOff{
            color: #21252B;
            background: #C3C8D0;
        }
        .padding-0-24{
            padding: 0px 24px;
        }
        .alrt-top-quite{
            margin-top: 10px;
            margin-left: calc(100% - 40px);
            margin-bottom: 40px;
        }
    }
    @media screen and (min-width: 1281px){
        .processingLineContainer{
        }
        /*.lineContainerLeft*/
        .lineContainerLeft{
            width: 96.428571rem;
            position: relative;
            float: left;
        }
        .lineContainerLeft .lineLegendContainer{
            height: 16.428571rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner{

        }
        .lineContainerLeft .lineLegendContainer .pContaner div{
            height: 208px;
            position: relative;
            float: left;
        }
        .p1,.p4,.p5,.p7{
            width: 208px;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave1{
            width: 126px;
            height: 140px;
            position: absolute;
            top: 4.285714rem;
            left: 2.857143rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave4{
            width: 200px;
            height: 170px;
            position: absolute;
            top: 2.285714rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave5{
            width: 190px;
            height: 170px;
            position: absolute;
            top: 2.285714rem;
            left: 0.857143rem;
        }
        .lineContainerLeft .lineLegendContainer .pContaner div.wave7{
            width: 124px;
            height: 140px;
            position: absolute;
            top: 4.285714rem;
            left: 3.0rem;
        }
        .lineContainerLeft .lineLegendContainer .lineContainer{
            position: absolute;
            z-index: 2;
        }
        .lineContainerLeft .lineLegendContainer .lineContainer div{
            height: 208px;
            position: relative;
            float: left;
        }
        .lineCenterContent{
            margin-top: 30px;
            width: 100%;
            position: relative;
            float: left;
        }

        .lineDataContainer{
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;

        }
        .progresslineDataItem{
            width: 15.257143rem;
            min-height: 15.714286rem;
            padding: 1.428571rem;
            margin: 0 1.571429rem 1.071429rem 0;
            border-radius:8px;
            background: #FFFFFF;
            box-shadow:0px 4px 12px 0px rgba(37,130,247,0.2);
        }
        .progresslineDataItem .lineDataItemTitle{
            width: 100%;
            margin: 0 0 1.428571rem 0;
        }
        .progresslineDataItem .lineDataItemContent{
            width: 100%;
        }
        .progresslineDataItem .lineDataItemContent div{
            color: #757D88;
            display: flex;
            justify-content: space-between;
            margin: 0 0 0.714286rem 0;
        }
        .progresslineDataItem .lineDataItemContent div.alarm{
            color: #F83D3D;
        }

        .lineControlContainer{
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
        }

        .controlItem{
            width: 15.0rem;
            height: 7.857143rem;
            padding: 1.428571rem;
            margin: 0 1.071429rem 1.071429rem 0;
            color: #FFFFFF;
            cursor: pointer;
            border-radius:8px;
            background: #2582F7;
            box-shadow:0px 4px 12px 0px rgba(37,130,247,0.2);
        }
        .controlItem .controlItemTitle,.controlItem .controlItemInfo{
            width: 100%;
            text-align: center;
        }
        .controlItem .controlItemTitle{
            margin: 0 0 0.714286rem 0;
        }
        .controlOff{
            color: #21252B;
            background: #C3C8D0;
        }
        .padding-0-24{
            padding: 0px 24px;
        }
        .alrt-top-quite{
            margin-top: 10px;
            margin-left: calc(100% - 40px);
            margin-bottom: 40px;
        }
    }
        /*水线图*/
        .shuixiantu-container{
            margin-left: 5%;
            width: 90%;
            min-width: 800px;
            /*background: orange;*/
            position: relative;
        }
        .diceng-yewei-jiayao-normal{
            margin-left: 0.8%;
            margin-top: 15%;
            width: 4.95%;
            padding-bottom: 6%;
            background: #F8ED4F;
            position: absolute;
        }
        .diceng-yewei-jiayao-low{
            margin-left: 0.8%;
            margin-top: 20%;
            width: 4.95%;
            padding-bottom: 1%;
            background: #F8ED4F;
            position: absolute;
        }
        .diceng-yewei-xiaodu-normal{
            margin-left: 54.8%;
            margin-top: 15%;
            width: 4.95%;
            padding-bottom: 6%;
            background: #FDC360;
            position: absolute;
        }
        .diceng-yewei-xiaodu-low{
            margin-left: 54.8%;
            margin-top: 20%;
            width: 4.95%;
            padding-bottom: 1%;
            background: #FDC360;
            position: absolute;
        }
        .diceng-yewei-chushui-normal{
            margin-left: 66.6%;
            margin-top: 25%;
            width: 23.9%;
            padding-bottom: 14.4%;
            background: #E1F1F9;
            position: absolute;
        }
        .diceng-yewei-chushui-low{
            margin-left: 66.6%;
            margin-top: 32.4%;
            width: 23.9%;
            padding-bottom: 7.5%;
            background: #E1F1F9;
            position: absolute;
        }
        .shuixiantu-picture{
            width: 100%;
            padding-bottom: 43%;
            background: url("~@/assets/img/line/waterline.png") no-repeat;
            background-size: 100%;
            position: relative;
        }
        .shuixiantu-tishi-jiayao-normal{
            margin-left: 1.1%;
            width: 0.8%;
            height: 1.895%;/*width * 2.368*/
            margin-top: 20.1%;
            position: absolute;
            background: #0f0;
            position: absolute;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-jiayao-low{
            margin-left: 1.1%;
            width: 0.8%;
            height: 1.895%;/*width * 2.368*/
            margin-top: 20.1%;
            position: absolute;
            background: red;
            position: absolute;
        }
        .shuixiantu-tishi-fanxi-off{
            margin-left: 41%;
            width: 1.5%;
            height: 3.55%;/*width * 2.368*/
            margin-top: 5.7%;
            background: #F8ED4F;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
            position: absolute;
        }
        .shuixiantu-tishi-fanxi-on{
            margin-left: 41%;
            width: 1.5%;
            height: 3.55%;/*width * 2.368*/
            margin-top: 5.7%;
            background: #0f0;
            position: absolute;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-xiaodu-normal{
            margin-left: 55%;
            width: 0.8%;
            height: 1.895%;/*width * 2.368*/
            margin-top: 20.1%;
            position: absolute;
            background: #0f0;
            position: absolute;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-xiaodu-low{
            margin-left: 55%;
            width: 0.8%;
            height: 1.895%;/*width * 2.368*/
            margin-top: 20.1%;
            position: absolute;
            background: red;
        }
        .shuixiantu-tishi-chushui-normal{
            margin-left: 69.5%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 32.7%;
            position: absolute;
            background: #0f0;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-chushui-low{
            margin-left: 69.5%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 32.7%;
            position: absolute;
            background: red;
        }
        .shuixiantu-tishi-paiwu-on{
            margin-left: 21.2%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 35.3%;
            position: absolute;
            background: #0f0;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-paiwu-on-normal{
            margin-left: 24.7%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 35.3%;
            position: absolute;
            background: #FFF;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        .shuixiantu-tishi-paiwu-off{
            margin-left: 24.7%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 35.3%;
            position: absolute;
            background: #F8ED4F;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        .shuixiantu-tishi-paiwu-off-normal{
            margin-left: 21.2%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 35.3%;
            position: absolute;
            background: #FFF;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        .shuixiantu-tishi-jinshuifa-on{
            margin-left: 16%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 26.2%;
            position: absolute;
            background: #0f0;
            border-width: 2px;
            border-style: solid;
            border-color: #00B750;
        }
        .shuixiantu-tishi-jinshuifa-on-normal{
            margin-left: 16%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 28.1%;
            position: absolute;
            background: #FFF;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        .shuixiantu-tishi-jinshuifa-off{
            margin-left: 16%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 28.1%;
            position: absolute;
            background: #F8ED4F;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        .shuixiantu-tishi-jinshuifa-off-normal{
            margin-left: 16%;
            width: 1%;
            height: 2.368%;/*width * 2.368*/
            margin-top: 26.2%;
            position: absolute;
            background: #FFF;
            border-width: 2px;
            border-style: solid;
            border-color: #8D8741;
        }
        /*PAC*/
        .shuixiantu-PAC{
            margin-left: 0.85%;
            margin-top: 15%;
            width: 4.8%;
            height: 14.45%;/*width * 3.01*/
            background: url("~@/assets/img/line/waterlinePAC.png") no-repeat;
            /*background: red;*/
            background-size: 100%;
            position: absolute;
        }
        /*NaClO*/
        .shuixiantu-NaClO{
            margin-left: 54.8%;
            margin-top: 15%;
            width: 4.8%;
            height: 14.45%;/*width * 3.01*/
            background: url("~@/assets/img/line/waterlineNaClO.png") no-repeat;
            background-size: 100%;
            position: absolute;
        }

        /*1#加药泵*/
        .jiayaobeng1{
            margin-left: 9%;
            width: 1.5%;
            margin-top: 15%;
            position: absolute;
        }
        /*1#加药泵背景图片*/
        .jiayaobengbg1{
            margin-left: 9%;
            margin-top: 15%;
            width: 1.5%;
            height: 4%;
            background: url("~@/assets/img/line/waterlinebeng.png") no-repeat;
            background-size: 100%;
            position: absolute;
        }
        /*2#加药泵*/
        .jiayaobeng2{
            margin-left: 11.2%;
            width: 1.5%;
            margin-top: 15%;
            position: absolute;
        }
        /*2#加药泵背景图片*/
        .jiayaobengbg2{
            margin-left: 11.2%;
            margin-top: 15%;
            width: 1.5%;
            height: 4%;
            background: url("~@/assets/img/line/waterlinebeng.png") no-repeat;
            background-size: 100%;
            position: absolute;
        }
        .jiayaobeng-frequcy-title{
            width: 16%;
            height: 20px;
            font-size: 12px;
            line-height: 20px;
            margin-top: calc(11.5% - 20px);
            text-align: right;
            color: red;
            position: absolute;
        }
        .xiaobeng-frequcy-title{
            margin-left: 35%;
            width: 20%;
            height: 20px;
            font-size: 12px;
            line-height: 20px;
            margin-top: calc(11.5% - 20px);
            text-align: right;
            color: red;
            position: absolute;
        }
        /*1#消毒泵*/
        .xiaodubeng1{
            margin-left: 48.8%;
            width: 1.5%;
            margin-top: 15%;
            position: absolute;
        }
        /*1#消毒泵背景图片*/
        .xiaodubengbg1{
            margin-left: 48.8%;
            margin-top: 15%;
            width: 1.5%;
            height: 4%;
            background: url("~@/assets/img/line/waterlinebeng.png") no-repeat;
            background-size: 100%;
            position: absolute;
        }
        /*2#消毒泵*/
        .xiaodubeng2{
            margin-left: 51%;
            width: 1.5%;
            margin-top: 15%;
            position: absolute;
        }
        /*2#消毒泵背景图片*/
        .xiaodubengbg2{
            margin-left: 51%;
            margin-top: 15%;
            width: 1.5%;
            height: 4%;
            background: url("~@/assets/img/line/waterlinebeng.png") no-repeat;
            background-size: 100%;
            position: absolute;
        }
        /*反洗装置开启提示*/
        .fanxikaiqi{
            margin-left: 43.5%;
            width: 14%;
            margin-top: calc(6.5% - 15px);
            color: red;
            line-height: 30px;
            position: absolute;
        }
        /*加药低液位文字*/
        .jiayaodiyewei-text{
            margin-left: 2%;
            width: 5%;
            line-height: 20px;
            margin-top: calc(20.55% - 10px);
            color: red;
            font-size: 8px;
            position: absolute;
        }
        .xiaodudiyewei-text{
            margin-left: 55.9%;
            width: 5%;
            line-height: 20px;
            margin-top: calc(20.55% - 10px);
            color: red;
            font-size: 8px;
            position: absolute;
        }
        .chushuidiyewei-text{
            margin-left: 70.8%;
            width: 8%;
            line-height: 20px;
            margin-top: calc(33.25% - 10px);
            color: red;
            font-size: 8px;
            position: absolute;
        }
        .paiwukaiqi{
            margin-left: 22.2%;
            line-height: 20px;
            margin-top: calc(37.65% - 10px);
            color: red;
            font-size: 8px;
            position: absolute;
        }
        .device-status-view{
            margin-left: calc(100% - 332px);
            width: 300px;
            height: 90px;
            line-height: 30px;
            font-size: 16px;
            color: #757D88;
            position: absolute;
        }
        .paiwu-total-time-text{
            margin-left: 20%;
            width: 20%;
            margin-top: 41%;
            color: #2C0011;
            position: absolute;
        }
        /*原水浊度*/
        .yuanshuizhuodu{
            width: 17%;
            text-align: right;
            margin-top: calc(35% - 15px);
            line-height: 30px;
            position: absolute;
        }
        /*出水浊度*/
        .chushuizhuodu{
            margin-left: 70%;
            /*height: 25px;*/
            margin-top: calc(39.3% - 40px);
            width: 20%;
            line-height: 20px;
            position: absolute;
        }
        /*出水余氯*/
        .chushuiyulv{
            margin-left: 70%;
            width: 20%;
            /*height: 25px;*/
            margin-top: calc(39.3% - 20px);
            line-height: 20px;
            position: absolute;
        }
        .shuixiantu-text-ellipsis{
            overflow:hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
        @media screen and (min-width: 1100px) {
            .shuixiantu-fontsizetowidth {
                font-size: 8px;
            }
        }
        @media screen and (min-width: 1200px) {
            .shuixiantu-fontsizetowidth {
                font-size: 10px;
            }
        }
        @media screen and (min-width: 1300px) {
            .shuixiantu-fontsizetowidth {
                font-size: 12px;
            }
        }
        @media screen and (min-width: 1400px) {
            .shuixiantu-fontsizetowidth {
                font-size: 14px;
            }
        }
        @media screen and (min-width: 1500px) {
            .shuixiantu-fontsizetowidth {
                font-size: 16px;
            }
        }
        @media screen and (min-width: 1600px) {
            .shuixiantu-fontsizetowidth {
                font-size: 18px;
            }
        }
</style>

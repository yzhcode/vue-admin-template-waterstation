<template>
    <div class="alarmMonitoringMain">
        <div class="lineDataContainer">
            <div class="stationMonitorDataItem" v-for="(items, index) in todayAlarmList">
                <div :class="['statisticsUnit water-c-3', {'water-n-1':items==todayAlarmList[1]}]"> 
                    <label>{{items}}</label>
                    <p>{{items == todayAlarmList[0] ? todayAlarmTotal : todayUnprocessAlarmTotal}}</p>
                </div>
            </div>
        </div>
        <table class="table-fixed mt-15">
            <thead>
                <tr>
                    <th width="10%"></th>
                    <th width="15%">时间</th>
                    <th width="30%">概述</th>
                    <th width="15%">处理状态</th>
                    <th width="15%">处理人</th>
                    <th width="15%">处理时间</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in alarmList">
                    <td>{{(currentPage-1)*itemsOnPage+index+1}}</td>
                    <td>{{global_.getTimeByFilter(item.alarm_time)}}</td>
                    <td>{{item.alarm_reason}}</td>
                    <td v-if="item.process_time != null || userRole != 3">
                        <div v-show="item.process_time">已处理</div>
                        <div class="color-disabled" v-show="!item.process_time">待处理</div>
                    </td>
                    <td v-else><button type="button" class="confirm-btn" @click="confirm(item.id)">处理</button></td>
                    <td>{{item.process_time == null ? "-" : item.processor}}</td>
                    <td>{{item.process_time == null ? "-" : global_.getTimeByFilter(item.process_time)}}</td>
                </tr>
                <tr class="noData" v-if="alarmList.length==0">
                    <td colspan="7" style="text-align: center;">
                        {{queryDataInfo}}
                    </td>
                </tr>
            </tbody>
        </table>

        <div id="alarmMonitoringPage" class="paginationManage"></div>

        <!-- 弹框 -->
        <div id="alarmModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle">
            <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
                <div class="modal-content border-0 modal-c-bor ">
                    <div class="modal-header">
                        <span class="modal-title">温馨提示</span>
                        <button type="button" class="close m-0 p-0" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="definedForm">
                            <div>
                                <span class="font-s-16">确定要处理吗？</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer-btn m-t-0" @click="processingAlarm()">确定</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    //import assemblyLine from "@/components/assemblyLine";
    export default {
        data(){
            return{
                userRole         : this.$store.getters["siteConfig/renderUserRole"],//账号角色
                sid              : this.$route.query.sid,//水站ID
                activeID         : "1",//选中水线ID
                alarmList        : [],
                itemsOnPage      : 10,//每次请求条数
                currentPage      : 1,//请求页
                totalNum         : 0,//数据总条数
                queryDataInfo    : "查询中",
                todayAlarmTotal  : 0,
                todayUnprocessAlarmTotal  : 0,
                todayAlarmList :['今日报警总数', '今日待处理报警数'],
                needCreatedPages : true,
                alarm_id         : 0,
            } 
        },
        components:{
            //assemblyLine,
        },
        watch:{
        },
        mounted(){
            this.getAlarmData();
            //this.timerStart();
        },
        beforeDestroy(){
            this.$loading.hide();
            //计时器
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        methods:{
            // 定时刷新
            timerStart() {
                if (this.intervalId != null) {
                    return;
                }
                this.intervalId = setInterval(() => {
                    this.getAlarmData();
                }, 5000);
            },
            getAlarmData() {
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url   : '/Web/Additional/get_alarm_monitor?action=get',
                        method: "get",
                        data  : {
                                wateraffairs_id : this.sid,//水站ID
                                line_num        : this.activeID,//水线id
                                page            : this.currentPage,//请求第几页
                                page_size       : this.itemsOnPage,//每一页最大个数
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data) {
                                var data = jsonData.data;
                                if(data.hasOwnProperty("today_alarm_total")){
                                    this.todayAlarmTotal = data.today_alarm_total;
                                }
                                if(data.hasOwnProperty("today_unprocess_alarm_total")){
                                    this.todayUnprocessAlarmTotal = data.today_unprocess_alarm_total;
                                }
                                if(data.hasOwnProperty("total_num")){
                                    this.totalNum = data.total_num;
                                }
                                if (data.history_list instanceof Array) {
                                    this.alarmList = data.history_list;
                                    if (this.alarmList.length > this.itemsOnPage) {
                                        this.alarmList = this.alarmList.slice(0, this.itemsOnPage);
                                    }
                                } else {
                                    this.alarmList = [];
                                }
                                if (this.alarmList.length == 0) {
                                    this.queryDataInfo = "暂无数据";
                                }
                                this.createPage(this.alarmList);
                            }
                        } else {
                            this.$loading.hide();
                            this.$toast('数据获取失败');
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    })
                }catch(e){
                    this.$loading.hide();
                    this.$toast('数据获取失败');
                };
            },
            /* 
             *确认处理
             */
            confirm(alarmId){
                this.alarm_id = alarmId;
                $('#alarmModal').modal('show');
            },
            //报警处理
            processingAlarm() {
                this.$loading.show("处理中");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/alarm_processing?action=post',
                        method: "post",
                        data: {
                            alarm_id: this.alarm_id
                        }
                    }).then(res => {
                        let json = res.data;
                        if(json.result == 'success'){
                            $('#alarmModal').modal('hide');
                            this.$toast('处理成功');
                            this.getAlarmData();
                        }else{
                            $('#alarmModal').modal('hide');
                            this.$toast('处理失败');
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    })
                }catch(e){
                    this.$loading.hide();
                    $('#alarmModal').modal('hide');
                    this.$toast('处理失败');
                };
            },

            createPage(tmpData) {
                if (!this.needCreatedPages) {
                    return;
                }
                this.needCreatedPages = false;
                let _t = this;
                $("#alarmMonitoringPage").pagination({
                    items      : _t.totalNum,
                    itemsOnPage: _t.itemsOnPage,
                    onPageClick:function(pageNumber,index,basicNumber,event){
                        _t.itemsOnPage     = basicNumber;//分页基数修改后，重置
                        _t.currentPage     = pageNumber;
                        _t.getAlarmData();
                    },
                    onInit:function(basicNumber){
                        _t.currentPage = 1;
                    }
                });
            },
        }
    }
</script>

<style scope>

</style>
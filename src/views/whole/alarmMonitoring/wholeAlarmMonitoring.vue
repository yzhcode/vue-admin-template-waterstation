<template>
    <div>
        <div class="query-block clearfix">
            <QueryWaterSelect :waterid.sync="sid" :waterlineid.sync="activeID"/>
        </div>

        <div class="whole_alarm_monitor">
            <div class="whole_alarm_monitor_item" v-for="(items, index) in todayAlarmList">
                <div :class="['monitorDataItemUnit water-c-3', {'water-n-1':items==todayAlarmList[1]}]"> 
                    <label>{{items}}</label>
                    <p>{{items == todayAlarmList[0] ? todayAlarmTotal : todayUnprocessAlarmTotal}}</p>
                </div>
            </div>
        </div>
        
        <!-- <div class="query-line clearfix bar_item_miss_padding" v-if="sid == 'all'">
            <div class="line-block">
                <div class="line-inner clearfix">
                    <div class="line-title fl">
                        <span>今日报警数据</span>
                    </div>
                    <div class="line-leng fr">
                        <span class="line-leng-al al-2">报警数</span>
                        <span class="line-leng-op op-2">已处理数</span>
                    </div>
                </div>
                <div class="line-item">
                    <echart :options="global_.initECharts(xData, erCharNames, erCharDatas, erCharColors,'bar',30)" :auto-resize="true" autoresize/>
                </div>
            </div>
        </div> -->

        <table class="table-fixed mt-15">
            <thead>
                <tr>
                    <th width="5%"></th>
                    <th width="15%">时间</th>
                    <th width="15%">水站</th>
                    <th width="8%">水处理线</th>
                    <th width="22%">概述</th>
                    <th width="10%">处理状态</th>
                    <th width="10%">处理人</th>
                    <th width="15%">处理时间</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in alarmList">
                    <td>{{(currentPage-1)*itemsOnPage+index+1}}</td>
                    <td>{{global_.getTimeByFilter(item.alarm_time)}}</td>
                    <td>{{item.wateraffairs_name}}</td>
                    <td>{{item.line_num}}</td>
                    <td>{{item.alarm_reason}}</td>
                    <td>
                        <div v-show="item.process_time">已处理</div>
                        <div class="color-disabled" v-show="!item.process_time">待处理</div>
                    </td>
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

        <div id="wholeAlarmMonitoringPage" class="paginationManage"></div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                sid              : "all",//水站ID
                activeID         : "1",//选中水线ID
                alarmList        : [],
                itemsOnPage      : 10,//每页显示条数
                currentPage      : 1,//当前页
                totalNum         : 0,
                queryDataInfo    : "查询中",
                todayAlarmTotal  : 0,
                todayUnprocessAlarmTotal  : 0,
                needCreatedPages :true,
                xData            : [],
                erCharNames      : ["报警数", "已处理数"],
                todayAlarmList   : ['今日报警总数', '今日待处理报警数'],
                erCharDatas      : [],
                erCharColors     : [["#F5833E","#FF6C15"], ["#4893F2","#2582F7"]],
            }
        },
        components:{
        },
        watch:{
            sid(){
                this.needCreatedPages = true;
                this.currentPage = 1;
                this.getAlarmData();
            },
            activeID(){
                this.needCreatedPages = true;
                this.currentPage = 1;
                this.getAlarmData();
            },
        },
        mounted(){
            this.getAlarmData();
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        methods:{
            getAlarmData(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url   : "/Web/Additional/get_alarm_monitor?action=get",
                        method: "get",
                        data  : {
                            wateraffairs_id : this.sid,//all:表示查询全部
                            line_num        : this.activeID,//水线id wateraffairs_id=all时忽略
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
                                } else {
                                    this.alarmList = [];
                                }
                                if (this.alarmList.length == 0) {
                                    this.queryDataInfo = "暂无数据";
                                }
                                this.createPage();

                                //柱状图数据
                                // if (data.alarm_trend) {
                                //     var alarm_trend = data.alarm_trend;
                                //     this.erCharDatas = [];
                                //     if (alarm_trend.wateraffairs_name instanceof Array) {
                                //         this.xData = alarm_trend.wateraffairs_name;
                                //     }
                                //     if (alarm_trend.alarm_count instanceof Array) {
                                //         this.erCharDatas.push(alarm_trend.alarm_count);
                                //     }
                                //     if (alarm_trend.alarm_treated_count instanceof Array) {
                                //         this.erCharDatas.push(alarm_trend.alarm_treated_count);
                                //     }
                                // }
                            }
                        } else {
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    this.$toast('数据获取失败');
                };
            },
            createPage(tmpData) {
                if (!this.needCreatedPages) {
                    return;
                }
                this.needCreatedPages = false;
                let _t = this;
                $("#wholeAlarmMonitoringPage").pagination({
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
/* .bar_item_miss_padding{
    min-width: 900px;
    padding-left: 16px;
} */
.whole_alarm_monitor {
    padding: 0 120px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
}
.whole_alarm_monitor_item{
    padding: 1rem;
    margin: 1rem auto;
    border-radius: 8px;
    background: #FFFFFF;
    -webkit-box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
}
</style>
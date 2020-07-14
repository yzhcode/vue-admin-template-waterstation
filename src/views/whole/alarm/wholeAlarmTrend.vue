<template>
    <div>
        <div class="query-block clearfix">
            <!-- 自定义水站组件 -->
            <QueryWaterSelect :waterid.sync="sid" :waterlineid.sync="activeID"/>
            <!-- 自定义流水线组件 -->
            <!-- <assemblyLine class="fl m-r-20" :waterid="sid" v-model="activeID"/> -->
            <label class="query-time-title fl">查询日期</label>
            <TimePicker :times.sync="waterTime" :types.sync="types"/>
            <button class="query-btn ml-3" @click="queryWaterAlarm">查询</button>
        </div>

        <!-- 饼图 -->
        <div class="query-sector-block">
            <p class="emptyItem" v-show="sectorDatas.length == 0">暂无数据</p>
            <div class="query-sector-flex clearfix">
                <div class="query-sector clearfix" v-show="sectorDatas.length > 0">
                    <div class="sector-title fl clearfix">
                        <div v-for="item in sectorDatas">
                            <titleColor :title=item.name :color="item.color"/>
                        </div>
                    </div>
                    <div class="sector-item ml-15">
                        <echart :options="global_.initSector(sectorColors,sectorDatas)" :auto-resize="true" autoresize/>
                    </div>
                </div>
            </div>
        </div>

        <!-- 曲线图 -->
        <div class="query-line margin-t-24 clearfix" v-show="lineYdata.length > 0">
            <div class="line-block ml-15">
                <div class="line-inner">
                    <div class="line-title fl">
                        <div>报警趋势图</div>
                    </div>
                    <!-- <div class="line-title fr">
                        <li class="fl ml-15" v-for="item in sectorDatas">
                            <titleColor :title=item.name :color="item.color"/>
                        </li>
                    </div> -->
                </div>
                <div class="line-item">
                    <echart :options="global_.initECharts(lineXdata, lineName, lineYdata, lineColors,'line',12)" :auto-resize="true" autoresize/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import assemblyLine from "@/components/assemblyLine";
    import titleColor from "@/components/titleColor";

    export default {
        data(){
            return{
                sid             : 'all',
                activeID        : "1",//选中水线ID
                types           : {
                    item: {day: '日', month: '月', year: '年' },
                    active: 'day' //日期选中状态key
                },
                waterTime       : ['2020', '05', '01'], //this.global_.dataChartTime().t.split("-"),
                sectorColors    : [],
                sectorDatas     : [],
                historyList     : [],
                lineXdata       : [],
                lineName        : [],
                lineYdata       : [],
                lineColors      : [],
            }
        },
        watch: {
            '$store.state.siteConfig.waterData'(data) {
                this.waterData = data;
                this.queryWaterAlarm();
            },
            location_alarm () {
                this.$nextTick(() => {
                    $('.query-pie-block').perfectScrollbar();
                });
            }
        },
        components:{
            assemblyLine,
            titleColor,
        },
        mounted(){
        
        },
        created() {
        },
        beforeDestroy(){
            $('.modal').modal('hide');
            this.$loading.hide();
        },
        methods:{
            /**
             * [查询报警信息]
             * @return {[type]} [description]
             */
            queryWaterAlarm() {
                try{
                   if(!this.waterData.length){
                        this.$toast("无水站信息");
                        return;
                    }

                    if(this.sid != 'all' && !this.activeID){
                        this.$toast("无水线信息");
                        return;
                    }

                    this.$loading.show("请稍等");

                    this.$fetch({
                        url: "Web/Additional/get_alarm_trend?action=get",
                        method: "get",
                        data: {
                            wateraffairs_id     : this.sid, //水站ID，all:表示查询全部
                            line_num            : this.activeID, //水线    wateraffairs_id=all时忽略
                            select_type         : this.types.active, //查询报表类型 day:日报表  month:月报表 year：年报表
                            date_time           : this.global_.timePickerToStr(this.waterTime), //时间    day => 2020-05-13  month => 2020-05   year=> 2020
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        console.log("station whole alarmLog alarmInfo: "+jsonData);
                        if(jsonData.result == "success"){
                            if(jsonData.data.history_list){
                                this.historyList     = jsonData.data.history_list;
                            }else{
                                this.historyList     = [];
                            }
                            
                            this.initPercentData();
                        }else{
                            this.clearData();
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    this.clearData();
                    console.log("station whole alarmLog alarmInfo: "+e);
                };
            },
            initPercentData(){
                this.clearData();
                
                // if(this.historyList.length <= 0){
                //     this.$toast("本次查询无数据");
                //     return;
                // }

                for (var i = 0; i < this.historyList.length; i++) {
                    var j;
                    for(j = 0; j < this.sectorDatas.length; j++){
                        if (this.sectorDatas[j].id == this.historyList[i].items_id) {
                            this.sectorDatas[j].value += this.types.active == 'day'?1 : parseInt(this.historyList[i].alarm_total);
                            this.addAlramData(j,i);
                            break;
                        }
                    }
                    if (j >= this.sectorDatas.length) {
                        if(this.historyList[i].work_part_name && this.historyList[i].items_id){
                            var color = this.global_.getColor(j);
                            this.sectorColors.push(color);
                            this.sectorDatas.push({value: this.types.active == 'day'?1 : parseInt(this.historyList[i].alarm_total) , name: this.historyList[i].work_part_name + this.historyList[i].describe, id: this.historyList[i].items_id, alramnum : this.getAlarmNum(), color:color});
                            this.addAlramData(j,i);
                        }
                    }
                }
                for(var i = 0; i < this.sectorDatas.length; i++){
                    this.lineName.push(this.sectorDatas[i].name);
                    this.lineColors.push([this.sectorDatas[i].color, this.sectorDatas[i].color]);
                    this.lineYdata.push(this.sectorDatas[i].alramnum);
                }
            },
            addAlramData(index,h_index){
                if(this.types.active == 'day'){
                    var hour = this.global_.timestampToHour(this.historyList[h_index].alarm_time);
                    this.sectorDatas[index].alramnum[hour] += 1;
                }else if(this.types.active == 'month'){
                    this.sectorDatas[index].alramnum[this.historyList[h_index].day_int - 1] += parseInt(this.historyList[h_index].alarm_total);
                }else if(this.types.active == 'year'){
                    this.sectorDatas[index].alramnum[this.historyList[h_index].month_int - 1] += parseInt(this.historyList[h_index].alarm_total);
                }
            },
            getAlarmNum(){
                var num = 24;
                var datas = [];
                this.lineXdata = [];
                if(this.types.active == 'day'){
                    num = 24;
                }else if(this.types.active == 'month'){
                    num = this.global_.getDateLength(this.waterTime[0],this.waterTime[1]);
                }else if(this.types.active == 'year'){
                    num = 12;
                }
                for (var i = 0; i < num; i++) {
                    if(this.types.active == 'day'){
                        this.lineXdata = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",];
                    }else{
                        this.lineXdata.push(i+1);
                    }
                    datas.push(0);
                }
                return datas;
            },
            clearData(){
                this.sectorColors = [];
                this.sectorDatas  = [];
                this.lineName     = [];
                this.lineColors   = [];
                this.lineYdata    = [];
            },
        }
    }
</script>

<style lang="less" scope>
</style>
<template>
    <div class="wholeDataMonitoring">
        
        <div class="title color2 font-s-16" v-if="todayAlarmList.length > 0">实时统计</div>

        <div class="whole_data_monitoring_show">
            <div v-for="(items, index) in todayAlarmList">
                <CardSimple :title="items" :content="todayValueList[index]"></CardSimple>
                <!-- <div :class="[todayColorList[index]]"> 
                    <label>{{items}}</label>
                    <p :title="todayValueList[index]=='--'?'暂无数据，请添加传感器':todayValueList[index]">{{todayValueList[index]}}</p>
                </div> -->
            </div>
        </div>
 
        <div class="title color2 font-s-16" v-if="eachAffairsData.length > 0">水站概况</div>
        <el-row>
            <el-col :span="8" class="card_item_out" v-for="item in eachAffairsData" :key="item.wateraffairs_id">
                <div id="configContainer" class="font-s-16">
                    <label class="water-n-1 font-s-20">{{item.wateraffairs_name}}</label> 
                    <span title="点击进入水站" class="a-btn" style="float: right;margin-top: 6px;" 
                        @click="processingLine(item.wateraffairs_id, item.wateraffairs_name)">查看详情</span>
                    <div v-for="(childItem,index) in handleStatusList(item.status_list,item.order_today_pending_count,item.alarm_today_pending_count)">
                        <label class="card_item_inner water-n-1 font-s-18"> {{childItem.name}}</label>
                        <div  class="card_item_sollapse font-s-16">
                            <div v-for="(par, idx) in childItem.values">
                                <label :class="{'water-c-3':index ==3 && parseInt(par.value) > 0}">{{par.describe}}</label>
                                <span :class="{'water-c-3':index ==3 && parseInt(par.value) > 0}">{{resolveDesc(par)}}</span>
                            </div>
                        </div> 
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    import titleColor from "@/components/titleColor";
    export default {
        data(){
            return{
                trendDataList     : [],
                trendName         : ["原水","产水"],
                barColorList      : [["#F5833E","#FF6C15"], ["#4893F2","#2582F7"]],
                barTitleColorList : ['#FF6C15','#2582F7'],
                colorList         : [[ '#A6FF36','#33BA06'],['#4CB8FC','#2582F7']],
                colorLuList       : [['#4CB8FC','#2582F7']],
                waterAffirdID     : "1",
                waterLineId       : "1",
                waterStationList  : [],
                hisGroupName      : [],
                hisGroupUnit      : [],
                hisDiscribe       : [],
                hisCHildName      : ["","","",""],
                hisTimeList       : [],
                hisValueList      : [],

                todayAlarmList    : ['今日原水总量（吨）', '今日产水总量（吨）','出水比','今日用药总量（L）'],
                todayAlarmUnit    : [' m³',' m³',' ',' L'],
                todayValueList    : [],
                todayColorList    : ['water-n-1','water-n-1','water-n-1','water-n-1'],
                eachAffairsData   : [],
            }
        },
        components:{
            titleColor,
        },
        mounted(){
            this.$nextTick(()=>{
                // 初始化滚动容器
                this.initPerfectScrollbar();
                this.$loading.show();
            });
            // DOM操作
            this.bindDom();
            //定时刷新
            this.dataRefreh();
            this.$loading.show("请稍等");
            //获取各个水站数据
            this.queryDataHistory();
        },
        destroyed(){
            this.clear();
            this.$loading.hide();
        },
        watch:{
             
        },
        methods:{
            bindDom() {
                /*$('#wholeSettingModal').on('show.bs.modal', () => {
                    // 重置滚动条位置
                    $("#configContainer").scrollTop(0);
                });
                $('#wholeSettingModal').on('hidden.bs.modal', () => {
                    $("#configContainer").scrollTop(0);
                });*/
            },
            /**
             * [初始化滚动插件]
             * @return {[type]} [description]
             */
            initPerfectScrollbar(command){
                $('#configContainer').perfectScrollbar(command);
            },
            handleTotalData(transdatas) {
                this.todayValueList = [];
                if (transdatas.inlet_total_handle == "null") {
                    this.todayValueList.push('--');
                } else {
                    this.todayValueList.push(transdatas.inlet_total_handle);
                }
                if (transdatas.outlet_total_handle=='null' ){
                    this.todayValueList.push('--');
                } else {
                    this.todayValueList.push(transdatas.outlet_total_handle);
                }
                if (transdatas.outlet_total_handle=='null' || transdatas.inlet_total_handle == "null") {
                   this.todayValueList.push('--');
                } else {
                    var tempvalue = this.global_.roundFun(parseFloat(transdatas.effluent_rate) * 100,2); 
                    this.todayValueList.push(tempvalue+"%");
                }
                if (transdatas.dosage_total=="null") {
                    this.todayValueList.push('--');
                } else {
                    this.todayValueList.push(transdatas.dosage_total);
                }
            },
            parseyData(transData){
                var result = [];
                if (transData.length > 0) {
                    result.push(transData.map(obj=> obj.inlet_total_handle));
                    result.push(transData.map(obj=> obj.outlet_total_handle));
                    return result;
                }
                return [];
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
                this.queryDataHistory();
              }, 5000);
            }, 
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
            queryDataHistory() {
                try{
                    this.$fetch({
                        url: "/Web/WaterAffairs/region_realtime_data_new?action=get",
                        method:"get"
                    }).then(res => {
                        let jsonData = res.data;
                        if (jsonData.result == "success") {
                            this.$loading.hide();
                            if (!jsonData.data.each_status || jsonData.data.each_status.length < 1) {
                                this.$toast("暂无数据");
                            } else {
                                this.eachAffairsData = jsonData.data.each_status;
                                this.handleTotalData(jsonData.data);
                            }
                        } else {
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e) {
                    this.$loading.hide();
                };
            },
            handleStatusList(transData,gongdan,baojing) {
                var result = [];
                var orderItem = {
                        name  : "工单",
                        // par.work_part_name + par.describe
                        values: [{work_part_name:"",describe:"待处理工单",value:gongdan,unit:""}],
                    };
                var alarmItem = {
                        name  : "报警",
                        values: [{work_part_name:"",describe:"今日报警",value:baojing,unit:""}],
                    };
                var waterItem = {
                        name  : "水质",
                        values: [],
                    };
                var deviceItem = {
                        name  : "设备",
                        values: [],
                    };
                if (transData && transData.length > 0) {
                    let length = transData.length;
                    var otherItem = {
                            name  : "其他",
                            values: [],
                        };
                    for (var i = 0; i < length; i++) {
                        var item = transData[i];
                        if (item.work_part_id == "7" && this.isNumber(item.value)) {//水质
                            waterItem.values.push(item);
                        } else if (item.value == "开" || item.value=="关") {//设备
                            deviceItem.values.push(item);
                        } else { //其他
                            otherItem.values.push(item);
                        }
                    };
                     // result.push(otherItem);
                }
                result.push(waterItem);
                result.push(deviceItem);
                result.push(orderItem);
                result.push(alarmItem);
                return result;
            },
            isNumber(transValue) {
                var result = transValue == 0 | (transValue != "" && transValue  != 'null' && !isNaN(transValue));
                return result;//transValue != "" && transValue  != 'null' && !isNaN(transValue);
            },
            resolveDesc(transItem) {
                var result = "";
                if (transItem.value == "开" || transItem.value=="关") {//设备相关参数 需要解析
                   result = transItem.value;
                } else if (this.isNumber(transItem.value)) {
                   result = this.global_.roundFun(transItem.value,2)+this.global_.unitShow(transItem.unit);
                }
                return result;
            },
            /*
             *点击进入水站管理
             */
            processingLine(id,name) {
                this.$store.dispatch('siteConfig/invokeFullScreen', false);
                this.$store.dispatch('siteConfig/invokeSiteOldName', name);
                this.$store.dispatch('siteConfig/invokeSiteName', name);
                this.$router.push({name:'entrance',query:{'sid': id}});
            },
        }
    }
</script>

<style scoped>
.whole_data_monitoring_show{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
}
.card_item_out{
    width: 380px;
    min-height: 200px;
    margin: 24px 20px;
    flex-direction: column;
    display: flex;
    flex-wrap: wrap;
    padding: 1.071429rem;
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.4);
    border-radius: 8px;  
    overflow: hidden;
}

.card_item_inner{
    width: 340px;
    padding-top: 8px;
    padding-bottom: 8px;
}
.card_item_sollapse div{
    padding-top: 4px;
}
.card_item_sollapse div span{
    float: right;
}
</style>
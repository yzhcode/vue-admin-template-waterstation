<template>
    <div class="wholeDataMonitoring">
        <!-- <div style="display: flex;flex-direction: row;">
            <div class="whole_data_show water-c-3">
                <label>今日原水总量（吨）</label>
                <p>{{oldWaterNum}}</p>
            </div>
            <div class="whole_data_show water-n-1">
                <label>今日产水总量（吨）</label>
                <p>{{ProductWater}}</p>
            </div>

        </div> -->

        <div class="lineDataContainer">
            <div class="monitorDataItem" v-for="(items, index) in todayAlarmList">
                <div :class="['monitorDataItemUnit ',todayColorList[index]]"> 
                    <label>{{items}}</label>
                    <p>{{todayValueList[index]}}</p>
                </div>
            </div>
        </div>


        <div class="query-line margin-t-24 clearfix bar_item_miss_padding">
            <div class="line-block">
                <div class="line-inner clearfix">
                    <div class="line-title fl">
                        <span>今日水量数据(单位：吨)</span>
                    </div>
                    <div class="line-leng fr whole_bar">
                            <titleColor class="whole_bar_item" :title="trendName[0]" :color="barTitleColorList[0]"/>
                            <titleColor class="whole_bar_item" :title="trendName[1]" :color="barTitleColorList[1]"/>
                    </div>
                </div>
                <div class="line-item">
                    <echart :options="global_.initECharts(trendDataList.map(obj=> obj.wateraffairs_name), trendName,parseyData(trendDataList),barColorList,'bar',26)" :auto-resize="true" autoresize/>
                </div>
            </div>
        </div>

         <div class="query-block clearfix miss_margin_top">
            <QueryWaterSelect :type.sync="no_all" :waterid.sync="waterAffirdID" :waterlineid.sync="waterLineId"/>
            <!-- <button class="query-btn ml-3" @click="queryDataHistory">查询</button> -->
        </div>
        <ul class="query-line margin-t-24 clearfix">
            <li v-for="(item,index) in hisGroupName">
                <div class="line-block">
                    <div class="line-inner clearfix">
                        <div class="line-title fl">
                            {{item}}<span>{{ global_.unitShow(hisGroupUnit[index]) }}</span>
                        </div>
                        <div class="line-leng fr">
                            <span class="line-leng-al al-3" v-show="hisCHildName[index].length > 1">{{hisCHildName[index][0]}}</span>
                            <span class="line-leng-op op-2">{{hisCHildName[index].length > 1 ? hisCHildName[index][1] : hisCHildName[index][0]}}</span>
                        </div>
                    </div>
                    <div class="line-item">
                        <echart :options="global_.initECharts(hisTimeList[index][0], hisCHildName[index],hisValueList[index],
                        hisCHildName[index].length > 1 ? colorList : colorLuList,'line',6)" :auto-resize="true" autoresize/>
                    </div>
                </div>
            </li>
        </ul>
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
                hisCHildName      : [],
                hisTimeList       : [],
                hisValueList      : [],
                no_all            : "one",
                todayAlarmList    : ['今日原水总量（吨）', '今日产水总量（吨）','出水比','今日用药总量（L）'],
                todayValueList    : [],
                todayColorList    : ['water-c-3','water-n-1','water-c-4','water-c-2'],
            }
        },
        components:{
            titleColor,
        },
        mounted(){
            //获取区域水站数据
            this.queryAreaDataList();
            //定时刷新
            // this.dataRefreh();

            this.$loading.show("请稍等");
        },
        destroyed(){
            // this.clear();
            // this.$loading.hide();
        },
        watch:{
             waterAffirdID(newValue,oldValue){
                this.queryDataHistory();
            },
            waterLineId(newValue,oldValue){
                this.queryDataHistory();
            },
        },
        methods:{
            queryAreaDataList(){
                try{
                    this.$fetch({
                        url         : "/Web/WaterAffairs/get_region_realtime_data?action=get",
                        method      : "get",
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success") {
                            this.handleTotalData(jsonData.data);
                            this.trendDataList = jsonData.data.alarm_trend;
                        }else{
                            // this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                    this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    console.log("queryWaterAffairsDetail: "+e);
                };
            },
            handleTotalData(transdatas) {
                this.todayValueList.push(transdatas.inlet_total_handle);
                this.todayValueList.push(transdatas.outlet_total_handle);
                var tempvalue = parseFloat(transdatas.effluent_rate) * 100; 
                this.todayValueList.push(tempvalue+"%");
                this.todayValueList.push(transdatas.dosage_total);
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
                this.queryAreaDataList();
              }, 5000);
            }, 
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
            queryDataHistory() {
                this.$loading.show();
                try{
                    this.$fetch({
                        url: "/Web/WaterAffairs/get_realtime_trend?action=get",
                        method:"get",
                        data:{
                            wateraffairs_id: this.waterAffirdID,
                            line_num       : this.waterLineId,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if (jsonData.result == "success") {
                            this.$loading.hide();
                            if (!jsonData.data.show_data || jsonData.data.show_data.length < 1) {
                                this.$toast("暂无数据");
                            } else {
                                this.handleHisData(jsonData.data.show_data);
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
            groupBy(array, f) {
            let groups = [];
                array.forEach(function (o){
                    var group =  JSON.stringify(f(o));
                    groups[group] = groups[group] || [];
                    groups[group].push(o);
                });
                return Object.keys(groups).map(function(group) {
                    return groups[group];
                });
            },
            arrayGroupBy(list, groupId) {
                 let sorted = this.groupBy(list, function(item) {
                    return [item[groupId]];
                });
                return sorted;
            },
            handleHisData(transData) {
                this.hisGroupName = [];
                this.hisGroupUnit = [];
                this.hisDiscribe  = [];
                this.hisCHildName = [];
                this.hisTimeList  = [];
                this.hisValueList = [];
                var gouplist = this.arrayGroupBy(transData,'items_group_id');
                gouplist.sort(function(a, b){return a[0].items_group_id - b[0].items_group_id});
                let destlen = gouplist.length;
                for (var i = 0; i < destlen; i++) {
                    var childGroupList = this.arrayGroupBy(gouplist[i],'work_part_id');
                    var groupTime = [],groupValue = [],itemName="",itemUnit="",itemDesc="",childValueName=[];
                    for (var j = 0; j < childGroupList.length; j++) {
                        var childGroup = childGroupList[j],childTimeList = [],childValueList = [],lastTime = 0;
                        for (var k = 0; k < childGroup.length; k++) {
                            var temp = childGroup[k];
                            var tempTime = this.global_.timestampToShortTime(temp.push_time);
                            var tempValue = this.global_.roundFun(temp.value,2);
                            var jump = this.timeUtil.getTimeSpan(lastTime,temp.push_time);
                            //这里断点处理
                            for (var l = 0; l < jump; l++) {
                                var emptyTime = this.timeUtil.timestampToShortTime(parseInt(lastTime) + 300 * (l+1));
                                childTimeList.push(emptyTime);
                                childValueList.push(null);
                            }
                            childTimeList.push(tempTime);
                            childValueList.push(tempValue);
                            lastTime = temp.push_time;
                        }
                        groupTime.push(childTimeList);
                        groupValue.push(childValueList);
                        if (childGroup.length > 0) {
                            itemName = childGroup[0].items_group;
                            itemUnit = childGroup[0].unit;
                            itemDesc = childGroup[0].describe;
                            childValueName.push(childGroup[0].work_part_name);
                        } else {
                            itemName = "";
                            itemUnit = "";
                            itemDesc = "";
                            childValueName.push("");
                        }
                    }
                    this.hisGroupName.push(itemName);
                    this.hisGroupUnit.push(itemUnit);
                    this.hisDiscribe.push(itemDesc);
                    this.hisCHildName.push(childValueName);
                    this.hisTimeList.push(groupTime);
                    this.hisValueList.push(groupValue);
                }
            },
            roundFun(numberRound,roundDigit) { 
            if (numberRound>=0) { 
                 var tempNumber = parseInt((numberRound * Math.pow(10,roundDigit)+0.5))/Math.pow(10,roundDigit); 
                 return tempNumber; 
             } else { 
                 numberRound1=-numberRound 
                 var tempNumber = parseInt((numberRound1 * Math.pow(10,roundDigit)+0.5))/Math.pow(10,roundDigit); 
                 return -tempNumber; 
                }
            },
            // queryWaterStation() {
            //     try{
            //         this.$fetch({
            //             url: "/Web/WaterAffairs/all_water_station?action=get",
            //             method:"get",
            //         }).then(res => {
            //             let jsonData = res.data;
            //             this.$loading.hide();
            //             if (jsonData.result == "success") {
            //                 this.waterStationList = jsonData.data;
            //                 if (this.waterStationList.length > 0) {
            //                     this.waterAffirdID = this.waterStationList[0].id;
            //                 }
            //             } else {
            //                 this.$toast(jsonData.errmsg);
            //             }
            //         })
            //     }catch(e) {
            //         this.$loading.hide();
            //     };
            // }
        }
    }
</script>

<style scope>
.whole_data_show{
    min-width: 150px;
    min-height: 3.0rem;
    position: center;
    margin: 0 auto;
    padding: 1.071429rem;
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.4);
    border-radius: 8px;  
    overflow: hidden;
}
.whole_data_show label{
    font-size: 1.428571rem;
}
.whole_data_show p{
    text-align: center;
    font-size: 3.428571rem;
    font-weight: bolder;
}
.query-line li{
    width: 100%;
    padding: 1.071429rem;
}
.bar_item_miss_padding{
    min-width: 900px;
    padding-left: 16px;
}
.miss_margin_top{
    margin-top: 24px;
}
.bar_style_inter_water{
    background: #08B4AF;
}
.bar_style_outer_water{
    background-color: #95790D;
}
.whole_bar{
    display: flex;
    flex-direction: row;
}
.whole_bar_item{
    margin-left: 6px;
    margin-right: 6px;
}
</style>
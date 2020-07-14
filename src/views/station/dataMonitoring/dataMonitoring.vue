<template>
    <div class="dataMonitoringMain">

        <!-- 自定义流水线组件 -->
        <!-- <assemblyLine
            :waterid="sid"
            v-model="activeID">
        </assemblyLine> -->
        <div class="title color2 font-s-16" v-if="dataValue.length > 0">实时统计</div>
        <div class="lineDataContainer">
            <!-- <div class="stationMonitorDataItem" v-for="(items, index) in dataValue">
                <div :class="['data_monitoring_total_item water-n-2']"
                    v-for="(childItem,idx) in items">
                    <label>{{todayAlarmList[index][idx]}}</label>
                    <P :title="childItem=='--'?'暂无数据，请添加传感器':childItem">{{childItem}} <label :style="index == 0 ? 'width: 24px;':'width: 42px;'">{{todayAlarmUnit[index][idx]}}</label></P>
                </div>
            </div> -->
            <div class="stationMonitorDataItem">
                <div :class="['data_monitoring_total_item water-n-2']">
                    <label>今日产水总量</label>
                    <P>{{currentWaterTotal > 0 ? global_.roundFun(currentWaterTotal,2) : '--'}} <label>吨</label></P>
                </div>
            </div>
            <div class="stationMonitorDataItem">
                <div :class="['data_monitoring_total_item water-n-2']">
                    <label>今日用药总量</label>
                    <P>{{currentDrugTotal > 0 ? global_.roundFun(currentDrugTotal,2) : '--'}} <label>L</label></P>
                </div>
            </div>
        </div>

        <div class="title color2 font-s-16" v-show="hisGroupName.length==0">实时参数</div>
        <p class="emptyItem" v-show="hisGroupName==0">
            {{empty_notice}}
        </p>
        <div class="title color2 font-s-16" v-if="hisGroupName.length > 0">实时参数</div>
        <div class="stationStatistics">
            <div class="lineDataContainer" v-show="hisGroupName.length > 0">
                <div class="lineDataItem" v-for="(item, index) in hisGroupName">
                    <div class="lineDataItemTitle font-s-16 water-n-1">
                        {{item}}
                        <span v-if="hisGroupUnit[index] !=0 && item != '药液'">{{global_.unitShow(hisGroupUnit[index])}}</span>
                    </div>
                    <div class="lineDataItemContent">
                        <div v-for="(par, idx) in hisCHildName[index]">
                            <label>{{hisDiscribe[index][idx]}}</label>
                            <span>{{hisValueList[index][idx][hisValueList[index][idx].length-1]}} {{item == '药液' ? hisGroupUnit[index]:""}}</span>
                        </div>
                        <div v-show="item == '药液'">
                            <label>药液价格</label>
                            <input type="tel" maxlength="5" v-show="dosagePrice!='--'" v-model.trim="dosagePrice"/>元/L
                        </div>
                    </div>
                </div>
            </div>

            <!-- <div class="statisticsParam">
                <ul>
                    <li v-for="(item,index) in hisGroupName">
                        <div class="params_tital">
                            <label>{{item}} </label> <span>{{ global_.unitShow(hisGroupUnit[index]) }}</span>
                        </div>
                        <ul>
                            <li v-for="(par,idx) in hisCHildName[index]">
                                <label>{{par+hisDiscribe[index]}}</label> <span>{{hisValueList[index][idx][hisValueList[index][idx].length-1]}}</span>
                            </li>
                        </ul>

                    </li>
                </ul>
            </div> -->
        </div>

        <div class="title color2 font-s-16" v-show="hisGroupName.length==0">数据曲线</div>
        <p class="emptyItem" v-show="hisGroupName==0">
            {{empty_notice}}
        </p>
        <div class="title color2 font-s-16" v-if="hisGroupName.length > 0">数据曲线</div>
        <ul class="query-line clearfix">
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
      <div class="mt-50"></div>
      <div class="title color2 font-s-16">阀门开关统计</div>
      <ul class="query-line clearfix">
        <li v-for="(item,index) in progressData" v-if="item.itemList.length>0 || item.lineValues.length>0">
          <div class="line-block">
            <div class="line-title fl">
              {{item.groupName}}
            </div>
            <div v-if="item.is_col" class="line-inner clearfix">
              <div class="line-leng fr ml-15">
                  <span class="water-n-1 curPoint" @click="showDevHisBoolDetail(item)">查看详情</span>
              </div>
              <div class="line-leng fr">
                <span class="line-leng-al dmonitor-col-on">开启时间段</span>
                <span class="line-leng-al dmonitor-col-off">关闭时间段</span>
              </div>
              <div class="col-contains">
                <div v-for="(sigle,sigleIndex) in item.itemList">
                  <div class="col-bg" :style="{width: sigle.dwidth+'%'}">
                    <template v-if='sigleIndex<item.itemList.length-1'>
                      <div class="desc" :style="{width: '100%',height: '80px','background-color':sigle.backgroundcolor}">
                        <span  v-if="sigle.dwidth>3">{{sigle.value == 1 ? '开启':'关闭'}}</span>
                      </div>
                      <!-- <el-tooltip effect="dark" :content="sigle.timedesc" placement="top-start">
                      </el-tooltip> -->
                      <span v-if="sigle.dwidth>3" class="time">{{timeUtil.timestampToShortTime(sigle.time)}}</span>
                    </template>
                    <template v-else>
                      <div :style="{width: '100%',height: '80px','background-color':sigle.backgroundcolor}">
                      </div>
                      <span class="time">{{timeUtil.timestampToShortTime(sigle.time)}}</span>
                      <span v-if="sigle.dwidth>3" class="last-time">23:59</span>
                    </template>
                  </div>
                </div>
                <div class="col-item-desc">
                  <div style="margin-top: 115px">
                    开启时间总计:{{getTotalTimeStr(item.onTotalTime)}}
                  </div>
                  <div style="margin-top: 3px">
                    关闭时间总计:{{getTotalTimeStr(item.offTotalTime)}}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class= "mt-50">
<!--              <div class="line-leng fr">-->
<!--                <span class="line-leng-al dmonitor-col-on">开启时间段</span>-->
<!--              </div>-->
              <div class="line-item">
                <echart :options="global_.initECharts(item.xValus, [[item.groupName]],[item.lineValues],colorLuList,'line',6)" :auto-resize="true" autoresize/>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <el-dialog :title="devHisBoolDetailName" :visible.sync="dialogDevHisBoolDetailVisible" width="800px">
          <el-table :data="devHisBoolDetailList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class="tableBox">
             <el-table-column
                 type="index"
                 min-width="5%"
                 align="center"
              >
             </el-table-column>

             <el-table-column
                  label="时间"
                  min-width="15%">
                  <template slot-scope="scope">
                      {{timeUtil.timestampToShortSecTime(scope.row.time)}}
                  </template>
             </el-table-column>

             <el-table-column
                  label="描述"
                  min-width="20%">
                  <template slot-scope="scope">
                      {{scope.row.value == 1 ? '开启':'关闭'}}
                  </template>
             </el-table-column>
         </el-table>
      </el-dialog>
    </div>

    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogDevHisBoolDetailVisible:false,
                sid             : this.$route.query.sid,
                activeID        : "1",//选中查看的流水线ID
                lineSecelted    : 0,// 选中的流水线ID
                dosagePrice     : 10,
                totalParams     : [],
                dataHisList     : [],
                hisGroupName    : [],
                hisGroupUnit    : [],
                hisCHildName    : [],
                hisTimeList     : [],
                hisValueList    : [],
                hisDiscribe     : [],
                hisLastValue    : [],
                todayAlarmList  : [['今日原水总量', '今日产水总量', '出水比'],
                                   ['今日用药总量','今日用药总成本','每吨用药成本']],
                todayAlarmUnit  : [" 吨", " L"],
                dataValue       : [],
                colorList       : [['#9D5E62','#9D5E62'],['#A1B668','#A1B668']],
                colorLuList     : [['#A1B668','#A1B668']],
                totalData       : [],
                empty_notice    : "加载中...",
                progressData    : [],
                currentWaterTotal: 0,
                currentDrugTotal: 0,
                devHisBoolDetailList:[],
                devHisBoolDetailName:'',
            }
        },
        components:{
        },
        watch:{
            activeID(){
                // 切换查询
                this.getTotalRealData();
            },
            dosagePrice(){
                this.handleTotalData(this.totalData);
            }
        },
      computed:{
      },
        mounted(){
            // 实时数据 轮询
            this.dataRefreh();
            //获取统计数据
            this.queryBoolStatus();
            this.queryDataHistory();
            this.$nextTick(() => {
                    $('.statisticsParam').perfectScrollbar();
                });
            //加载框
            this.$loading.show();
        },
        beforeDestroy(){
            this.clear();
            this.$loading.hide();
        },
        methods:{
            getTotalTimeStr(timeInterval){
              if (timeInterval==0) {
                return ' 0';
              } else {
                var hour = 0;
                var min = 0;
                var sec = 0;
                hour = parseInt(timeInterval / (60*60));
                min = parseInt((timeInterval % (60*60))/60);
                sec = parseInt(timeInterval % (60*60)%60);
                var rStr = ' ';
                if (hour > 0) {
                  rStr += (hour+'小时');
                }
                if (min > 0) {
                  rStr += (min+'分');
                }
                if (hour == 0 && min == 0 & sec > 0) {
                  rStr += (sec+'秒');
                }
                return rStr;
              }
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
                this.queryBoolStatus();
                this.queryDataHistory();
              }, 5000);
            },
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
            queryDataHistory(){
                try{
                    this.$fetch({
                        url: "/Web/WaterAffairs/get_realtime_trend?action=get",
                        method:"get",
                        data:{
                            wateraffairs_id: this.sid,
                            line_num       : this.activeID,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if (jsonData.result == "success") {
                            this.totalData=jsonData.data;
                            this.handleTotalData(this.totalData);
                            this.handleHisData(jsonData.data.show_data);
                            if (jsonData.data.show_data.length == 0) {
                                this.empty_notice = "暂无数据";
                                // this.$toast("暂无数据");
                            }
                        }else {
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e) {

                };
            },
          queryBoolStatus(){
            try{
              this.$fetch({
                url: "/Web/Additional/get_dev_history_bool?action=get",
                method:"get",
                data:{
                  wateraffairs_id: this.sid,
                }
              }).then(res => {
                let jsonData = res.data;
                if (jsonData.result == "success") {
                  this.handleDevHisBool(jsonData.data);
                }else {
                  this.global_.showToastErrmsg(jsonData.errmsg,"");
                }
              }).finally(() => {
                this.$loading.hide();
              });
            }catch(e) {

            };
          },
          handleDevHisBool(data){
            let historyBoolData = data.show_data;
            let bgOn = '#2582F7';
            let bgOff = '#9AA2AC';
            var tempProgressData = [];
            for (var i = 0; i < historyBoolData.length; i++) {
              var tempItem = historyBoolData[i];
              // console.log("historyBoolData:",tempItem);
              var group = {
                groupName:'',
                items_id:-1,
                is_col:true,//是否为柱状图
                onTotalTime:0,
                offTotalTime:0,
                itemList:[],
                lineValues:[],
                xValus:[],
              };
              group.groupName = tempItem.name;
              group.items_id = tempItem.items_id;
              group.is_col = (tempItem.is_bool == 1);

              if (group.is_col) {
                var tempItemList = tempItem.list;
                // console.log('tempItemListtempItemList:',tempItemList.length);
                let currentTime = new Date(new Date().toLocaleDateString()).getTime()/1000;
                // console.log('currentTime:',currentTime);
                if (tempItemList.length > 0) {
                  let firstObj = tempItem.list[0];
                  if (firstObj.time > currentTime) {
                    let tmpValue = (firstObj.value == 1) ? 0 : 1;
                    tempItemList.splice(0, 0, {isAdd:true, id:firstObj.id, time:currentTime,value:tmpValue});
                  }
                }

                var itemList = [];
                var sumWidth = 0;
                for (var j = 0; j < tempItem.list.length; j++) {
                  let tempObj = tempItem.list[j];
                  // console.log("tempObjtempObj:",tempObj);
                  if (itemList.length > 0) {
                    let end = itemList[itemList.length-1];
                    if (end.value === tempObj.value){
                      if (j == tempItem.list.length - 1) {
                        let endTime = tempObj.time-end.time;
                        var dwidth = endTime/(24*60*60) * 100;
                        if (dwidth < 0.1) {dwidth=0.1};
                        end.dwidth = dwidth;
                        if (end.value == 1) {
                          group.onTotalTime+=endTime;
                        } else {
                          group.offTotalTime+=endTime;
                        }
                        sumWidth+=dwidth;
                        // console.log("dwidthdwidth:",dwidth);
                        // console.log("kkkkkkk:",100-sumWidth);
                      }
                      continue;
                    } else {
                      let endTime = tempObj.time-end.time;
                      var dwidth = endTime/(24*60*60) * 100;
                      if (dwidth < 0.1) {dwidth=0.1};
                      // console.log("++++++++++++++:",group.groupName);
                      // console.log("=============:",dwidth);
                      sumWidth+=dwidth;
                      end.dwidth = dwidth;
                      if (end.value == 1) {
                        group.onTotalTime+=endTime;
                      } else {
                        group.offTotalTime+=endTime;
                      }
                    }
                  }

                  var listObj = {
                    isAdd:false,
                    dwidth:0,
                    time:'',
                    value:0,
                    backgroundcolor:'',
                  };
                  if (tempObj.isAdd) {
                    listObj.isAdd = tempObj.isAdd;
                  }
                  listObj.value = tempObj.value;
                  listObj.backgroundcolor = (tempObj.value == '1' ? bgOn:bgOff);
                  listObj.time = tempObj.time;
                  itemList.push(listObj);
                }
                let currentDateInterval = (new Date()).getTime()/1000;
                if (itemList.length > 0) {
                  let currentLast = itemList[itemList.length-1];
                  if (currentLast.time < currentDateInterval) {
                    let endTime = currentDateInterval - currentLast.time;
                    var currentWidth = endTime/(24*60*60) * 100;
                    if (currentWidth < 0.1) {currentWidth=0.1};
                    // console.log('currentWidth:',currentWidth);
                    if (currentLast.value == 1) {
                      group.onTotalTime+=endTime;
                    } else {
                      group.offTotalTime+=endTime;
                    }
                    sumWidth+=currentWidth;
                    let backColor = (currentLast.value == 1) ? bgOn:bgOff;
                    itemList.push({isAdd:true,dwidth:currentWidth,time:currentLast.time,value:currentLast.value,backgroundcolor:backColor});
                  }
                } else {
                  let startValue = tempItem.start_value;
                  let totalTime = currentDateInterval - currentTime;
                  var tempColor = (startValue == 1 ? bgOn : bgOff);
                  if (startValue == 1) {
                    group.onTotalTime = totalTime;
                  } else {
                    group.offTotalTime = totalTime;
                  }
                  sumWidth = totalTime/(24*60*60) * 100;
                  itemList.push({
                    isAdd:true,
                    dwidth:sumWidth,
                    time:currentTime,
                    value:startValue,
                    backgroundcolor:tempColor,
                  });
                }
                if (sumWidth < 95) {
                  itemList.push({
                    isAdd:true,
                    dwidth:(100-sumWidth),
                    time:currentDateInterval,
                    value:0,
                    backgroundcolor:'#EBEEF5',
                  });
                }
                group.itemList = itemList;
              } else {
                // var tempTime = this.timeUtil.timestampToShortTime(tempObj.time);
                // var tempValue = this.global_.roundFun(tempObj.value,2);
                for (var j = 0; j < tempItem.list.length; j++) {
                  let lineSigle = tempItem.list[j];
                  group.lineValues.push(lineSigle.value);
                  group.xValus.push(this.timeUtil.timestampToShortTime(lineSigle.time));
                }
              }
              tempProgressData.push(group);
            }
            // console.log("================:",tempProgressData);
            for (var i = 0; i < tempProgressData.length; i++) {
              let groupItem = tempProgressData[i];
              if (groupItem.items_id === 7) {
                // 计算进水总量
                this.currentWaterTotal = groupItem.onTotalTime/(60*60)*data.water_production;
                // console.log('currentWaterTotalcurrentWaterTotal:',this.currentWaterTotal);
              }

              if (groupItem.items_id === 24) {
                var sumValue = 0;
                for (var j = 0; j < groupItem.lineValues.length; j++) {
                  sumValue+=groupItem.lineValues[j];
                }
                // 计算用药总量
                this.currentDrugTotal = (sumValue*5*data.drug_dose)/1000;
                // console.log('currentDrugTotal:',this.currentDrugTotal);
              }
            }
            this.progressData = tempProgressData;
          },
          showDevHisBoolDetail(item){
            // console.log('detailItem:',item);
            var objAry = [];
            for (var i = 0; i < item.itemList.length; i++) {
              let obj = item.itemList[i];
              if (!obj.isAdd) {
                objAry.push(obj);
              }
            }
            this.devHisBoolDetailList = objAry;
            this.devHisBoolDetailName = item.groupName;
            this.dialogDevHisBoolDetailVisible = true;
          },
            handleTotalData(transdatas) {
                var tempGroup = [];
                this.dataValue = [];
                var tempvalue = 0;
                if (transdatas.inlet_total_handle=="null") {
                    tempGroup.push('--');
                } else {
                    tempGroup.push(transdatas.inlet_total_handle);
                }
                if (transdatas.outlet_total_handle=="null") {
                    tempGroup.push('--');
                } else {
                    tempGroup.push(transdatas.outlet_total_handle);
                }
                if (transdatas.outlet_total_handle=="null" ||transdatas.inlet_total_handle=="null") {
                    tempvalue = '--';
                } else {
                    tempvalue = this.global_.roundFun(parseFloat(transdatas.effluent_rate) * 100,2);
                }
                tempGroup.push(tempvalue);
                this.dataValue.push(tempGroup);
                tempGroup = [];
                if (transdatas.dosage_total=="null") {
                    tempGroup.push("--");
                    tempGroup.push("--");
                    tempGroup.push("--");
                    this.dosagePrice = "--";
                } else {
                    tempGroup.push(this.global_.roundFun(parseFloat(transdatas.dosage_total),2));
                    tempvalue = this.global_.roundFun(parseFloat(transdatas.dosage_total) * this.dosagePrice,2);
                    tempGroup.push(tempvalue);
                    if (parseFloat(transdatas.outlet_total_handle) > 0) {
                        tempvalue = tempvalue / parseFloat(transdatas.outlet_total_handle);
                    }
                    tempGroup.push(this.global_.roundFun(tempvalue,2));
                }
                this.dataValue.push(tempGroup);
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
                    var groupTime = [],groupValue = [],itemName="",itemUnit="",itemDesc=[],childValueName=[];
                    for (var j = 0; j < childGroupList.length; j++) {
                        var childGroup = childGroupList[j],childTimeList = [],childValueList = [],lastTime = 0;
                        for (var k = 0; k < childGroup.length; k++) {
                            var temp = childGroup[k];
                            var tempTime = this.timeUtil.timestampToShortTime(temp.push_time);
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
                            itemName = childGroup[j].items_group;
                            itemUnit = childGroup[j].unit;
                            itemDesc.push(childGroup[j].describe);
                            childValueName.push(childGroup[j].work_part_name);
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

        }
    }
</script>

<style scoped>
.stationMonitorDataItem {
    padding: 0.571429rem 1rem;
    margin-right: 2.071429rem;
    margin-top: 12px;
    margin-bottom: 20px;
    border-radius: 8px;
    background: #FFFFFF;
    -webkit-box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
}
.lineDataItem{
    height: 9rem;
}
.data_monitoring_total_item{
    min-width: 20.857143rem;
    display: flex;
    justify-content: space-between;
    flex-direction:row;
    align-items: center;
}
.data_monitoring_total_item label{
    font-size: 1.142857rem;
    color:#313131;
}
.data_monitoring_total_item p{
    font-size: 2.0rem;
    color:#2582F7;
    font-weight: normal;
}
..data_monitoring_total_item p label{
    width: 24px;
}
.splite_line{
    width: 0.025rem;
    height: 7.0rem;
    color: #000;
}
.query-line li{
    width: 100%;
    padding: 1.071429rem;
}
.bg-off {
  float: left;
  width: 20%;
  height: 100%;
  background: #0000FF;
}

.col-contains{
  padding-top: 50px;
  height: 100px;
}
.col-item-desc{
  margin-top: 110px;
  height: 60px;
}
.col-contains .col-bg {
  float: left;
  height: 80%;
}
.col-contains .desc{
  text-align: center;
  color: #FFFFF0;
  line-height: 80px;
}
.col-contains .last-time{
  float: right;
  color: #757D88;
}
.col-contains .time{
  color: #757D88;
}
  .mt-50{
    margin-top: 50px;
  }
  .eChartEmpty{
    color: #757D88;
    font-size: 20px;
    margin-top: 30px;
    text-align: center;
    line-height: 150px;
  }
</style>

<template>
    <div>
        <div class="query-block clearfix">
            <!-- 自定义流水线组件 -->
            <!-- <assemblyLine class="fl m-r-20" :waterid="sid" v-model="activeID"/> -->
            <label class="query-time-title fl">查询类型</label>
            <!-- <TimePicker :times.sync="waterTime" :types.sync="types"/> -->
            <datePicker class="mt-1" :dateType.sync="type" :date.sync="date"/>
            <el-button class="mt-1 ml-15" type="primary" @click="queryWaterAffairsDataTrend()">查询</el-button>
        </div>

        <!-- <div class="lineDataContainer mt-15" v-show="!isShowEmpty">
            <div class="lineDataItem" v-for="(item, index) in groupItems">
                <div class="lineDataItemTitle font-s-16 water-n-1">
                    {{item.items_group}}
                    <span v-if="item.unit.length !=0">（{{item.unit}}）</span>
                </div>
                <div class="lineDataItemContent">
                    <div v-for="(workPart, idx) in item.work_parts">
                        <label>{{workPart.work_part_name+workPart.describe}}</label>
                        <span>{{getValueInterval(erCharDatas[index][idx])}}</span>
                    </div>
                </div>
            </div>
        </div> -->
        <ul class="query-line margin-t-24 clearfix" v-show="!isShowEmpty">
            <li v-for="(item,index) in groupItems" class="allwidth">
                <div class="line-block">
                    <div class="line-inner clearfix">
                        <div class="line-title fl">
                            {{ item.items_group }}<span>{{ global_.unitShow(item.unit) }}</span>
                        </div>
                        <div v-if="type=='day'">
                            <div class="line-leng fr ml-15">
                                <span class="curPoint water-n-1" @click="querGroupDetail(item.items_group_id)">查看详情</span>
                            </div>
                            <div class="line-leng fr" v-for="(linItem, partIndex) in item.work_parts">
                                <span :class="['line-leng-al', todayColorList[partIndex]]">{{linItem.work_part_name}}</span>
                            </div>
                        </div>

                        <div v-else>
                            <div class="line-leng fr ml-15">
                                <span class="curPoint water-n-1" @click="querGroupDetail(item.items_group_id)">查看详情</span>
                            </div>

                            <div class="line-leng fr" v-for="(linItem, typeIndex) in work_parts_types[index]">
                                <span :class="['line-leng-al',todayColorList[typeIndex]]">{{linItem.work_part_name+(linItem.data_type=='2' ? "峰值":"谷值")}}</span>
                            </div>
                        </div>

                    </div>
                    <div class="line-item">
                        <echart :options="global_.initECharts(timeUtil.isArray(erCharXdatas[0]) ? erCharXdatas[index] : erCharXdatas, erCharNames[index], erCharDatas[index], erCharColors[index],'line',4)" :auto-resize="true" autoresize/>
                    </div>
                </div>
            </li>
        </ul>
        <p class="emptyItem" v-show="isShowEmpty">
            {{empty_notice}}
        </p>
        <div class="mt-50" v-show="type=='day'"></div>
        <div class="title color2 font-s-16" v-show="type=='day'">阀门开关统计</div>
        <ul v-show="type=='day'" class="query-line clearfix">
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
                        <template v-if='sigle.value != -100'>
                          <div class="desc" :style="{width: '100%',height: '80px','background-color':sigle.backgroundcolor}">
                            <span  v-if="sigle.dwidth>3">{{sigle.value == 1 ? '开启':'关闭'}}</span>
                          </div>
                          <!-- <el-tooltip effect="dark" :content="sigle.timedesc" placement="top-start">
                          </el-tooltip> -->
                          <span v-if="sigle.dwidth>3" class="time">{{timeUtil.timestampToShortTime(sigle.time)}}</span>
                          <span v-show="!isToday && sigleIndex == item.itemList.length-1" class="last-time">23:59</span>
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
                    <echart :options="global_.initECharts(item.xValus, [[item.groupName]],[item.lineValues],[['#A1B668','#A1B668']],'line',6)" :auto-resize="true" autoresize/>
                  </div>
                </div>
              </div>
            </li>
        </ul>
        <el-dialog :title="detailGroupTitle" :visible.sync="dialogGroupDetailVisible" width="1000px" top="10px">
            <el-table :data="detailGroup" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class="tableBox">
               <el-table-column
                   type="index"
                   min-width="5%"
                   align="center"
                   :index="indexMethod"
                >
               </el-table-column>

               <el-table-column
                    label="日期"
                    min-width="15%">
                    <template slot-scope="scope">
                        {{getGroupDetailTimeShow(scope.row)}}
                    </template>
               </el-table-column>

               <el-table-column
                    label="名称"
                    min-width="20%">
                    <template slot-scope="scope">
                        {{scope.row.work_part_name+scope.row.describe}}
                    </template>
               </el-table-column>

               <el-table-column
                    label="描述"
                    min-width="35%" v-if="type!='day'">
                    <template slot-scope="scope">
                        {{scope.row.data_type=="1"?"谷值":"峰值"}}
                    </template>
               </el-table-column>

                <el-table-column
                    :label="'数值'+detailItemUnit"
                    min-width="25%">
                    <template slot-scope="scope">
                        <span>
                            {{global_.roundFun(scope.row.value,2)}}
                        </span>
                    </template>
               </el-table-column>
               
           </el-table>
            <el-pagination
                @current-change="handleCurrentChange"
                :total="filterGroupDatas.length"
                :current-page="currentPage"
                layout="total, prev, pager, next">
            </el-pagination>
        </el-dialog>

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

</template>
<script>
    import assemblyLine from "@/components/assemblyLine";
    import datePicker from "@/components/datePicker";

    export default {
        data(){
            return{
                dialogGroupDetailVisible : false,
                isShowEmpty       : false,
                sid               : this.$route.query.sid,//水站ID
                activeID          : "1",//选中水线ID
                date                 : this.timeUtil.getDateByType(new Date(),'day'),
                type                 : "day",
                show_data         : [],
                groupList         :[],
                groupItems        :[], // 解析后的数据
                erCharNames       :[],
                filterGroupDatas  :[],
                detailGroup       :[],
                detailGroupTitle  : "",
                detailItemUnit    : "",
                erCharColorNames  :[],
                erCharDatas       :[],
                erCharXdatas      :[],
                erCharColors      :[],
                time_list         :[],
                work_parts_types  :[],

                itemsOnPage       : 10,//分页基数
                currentPage       : 1,//当前页
                waterQuerTimerChange: false,
                todayColorList    : ['in-water-high','in-water-low','out-water-high','out-water-low','out-water-high','out-water-low','in-water-high','in-water-low'],
                constColors       : [["#9D5E62","#9D5E62"], ["#A1B668","#A1B668"], ["#DF9250","#DF9250"], ["#55ABBC","#55ABBC"]],
                empty_notice      : '加载中...',
                progressData      : [],
                devHisBoolDetailList:[],
                devHisBoolDetailName:'',
                dialogDevHisBoolDetailVisible:false,
                isToday:true,
            }
        },
        components:{
            assemblyLine,
            datePicker,
        },
        watch:{
            waterTime(){
                this.waterQuerTimerChange = true;
                // console.log("waterTimewaterTimewaterTime",this.waterTime);
            }
        },
        mounted(){
            this.queryWaterAffairsDataTrend();
        },
        created() {
        },
        beforeDestroy(){
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
        	two(val) {
                return val.toString().replace(/^(\d)$/, '0$1');
            },
            indexMethod(index) {
                return (this.currentPage-1)*this.itemsOnPage+index+1;
            },
            getGroupDetailTimeShow(item){
                let timeDesc = '';
                if (this.type=='day') {
                    timeDesc = this.global_.getTimeByFilter(item.push_time);
                } else {
                    timeDesc = this.global_.dateformatToDayString(item.date_time,this.type);
                }
                return timeDesc;
            },

            handleCurrentChange(val){
                let tmpSliceNumber = (val-1)*this.itemsOnPage;
                this.currentPage = val;
                this.detailGroup = this.filterGroupDatas.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            queryWaterAffairsDataTrend(){
                if (this.waterQuerTimerChange) {
                    this.currentPage = 1;
                }
                this.waterQuerTimerChange = false;
                // console.log("queryWaterAffairsDataTrend:"+this.waterTime);
                // console.log("Active:"+this.types.active);
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: "Web/Additional/get_data_trend?action=get",
                        method: "get",
                        data:{
                            wateraffairs_id: this.sid,
                            line_num       : this.activeID,
                            select_type    : this.type,
                            date_time      : this.date,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            let show_data = jsonData.data.show_data;
                            this.show_data = show_data;
                            if (show_data.length) {
                                this.handleShowData(show_data);
                                this.isShowEmpty = false;
                            } else {
                                this.empty_notice = '暂无数据';
                                this.isShowEmpty = true;
                            }
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    // console.log("queryWaterAffairsDetail: "+e);
                };
                if (this.type =='day') {
                    this.queryBoolStatus();
                }
            },

            queryBoolStatus(){
                try{
                  this.$fetch({
                    url: "/Web/Additional/get_dev_history_bool?action=get",
                    method:"get",
                    data:{
                      wateraffairs_id: this.sid,
                      date:this.date
                    }
                  }).then(res => {
                    let jsonData = res.data;
                    if (jsonData.result == "success") {
                        // console.log('=====================:',jsonData.data.show_data);
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
            let currentSelectedDate = this.date.replace(/-/g,'/'); //必须把日期'-'转为'/'
            let currentTime = new Date(currentSelectedDate).getTime()/1000;

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
                // console.log('currentTime:',currentTime);
                if (tempItemList.length > 0) {
                  let firstObj = tempItem.list[0];
                  if (firstObj.time > currentTime) {
                    // console.log('++++++++++++++=:',group.groupName);
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
                let todayTime = (new Date()).getTime()/1000;
                if (itemList.length > 0) {
                  let currentLast = itemList[itemList.length-1];
                  if (todayTime - currentTime > 24*60*60) {
                    // 判断是否选中时间为当天
                    this.isToday = false;
                    let backColor = (currentLast.value == 1) ? bgOn:bgOff;
                    if (itemList.length == 1) {
                      currentLast.dwidth = 100;
                      if (currentLast.value == 1) {
                        group.onTotalTime=24*60*60;
                      } else {
                        group.offTotalTime=24*60*60;
                      }
                    } else {
                      if (currentLast.value == 1) {
                        group.onTotalTime=(24*60*60 - group.offTotalTime);
                      } else {
                        group.offTotalTime+=(24*60*60 - group.onTotalTime);
                      }
                      var tempSum = 0;
                      for (var t = 0; t < itemList.length - 1; t++) {
                         tempSum+=itemList[t].dwidth;
                      }
                      currentLast.dwidth = (100-tempSum);
                    }
                  } else {
                      this.isToday = true;
                      if (currentLast.time < todayTime) {
                        let endTime = todayTime - currentLast.time;
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
                      if (sumWidth < 95) {
                        itemList.push({
                          isAdd:true,
                          dwidth:(100-sumWidth),
                          time:todayTime,
                          value:-100,
                          backgroundcolor:'#EBEEF5',
                        });
                      }
                  }
                } else {
                  let startValue = tempItem.start_value;
                  var tempColor = (startValue == 1 ? bgOn : bgOff);
                  if (todayTime - currentTime > 24*60*60) {
                    if (startValue == 1) {
                      group.onTotalTime = 24*60*60;
                    } else {
                      group.offTotalTime = 24*60*60;
                    }
                    itemList.push({
                      isAdd:true,
                      dwidth:100,
                      time:currentTime,
                      value:startValue,
                      backgroundcolor:tempColor,
                    });
                  } else {
                    let totalTime = todayTime - currentTime;
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
                    if (sumWidth < 95) {
                        itemList.push({
                          isAdd:true,
                          dwidth:(100-sumWidth),
                          time:todayTime,
                          value:-100,
                          backgroundcolor:'#EBEEF5',
                        });
                      }
                  }
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

            // 处理json原始数据
            handleShowData(tmpData){
                this.groupList = this.arrayGroupBy(tmpData,'items_group_id');
                this.handleJsonData(this.groupList, this.type);
                this.dealEchartDatas(this.groupItems);
                this.erCharXdatas = this.querEchartXvalue();
            },

            getValueInterval(obj){
                var maxValue = 0, minValue = 220;
                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i] > maxValue) {
                            maxValue = obj[i]; 
                        }
                        if (obj[i] < minValue) {
                            minValue = obj[i];
                        }
                    }
                    //  obj.sort((item1,item2) => {
                    //     return item1 > item2;
                    // })
                return this.global_.roundFun(minValue,4)+"-"+this.global_.roundFun(maxValue,4);
            },

            handleJsonData(groupList, queryType){
                var groupItems = [];
                for(var i = 0; i < groupList.length; i++) {
                    let groupItem = groupList[i];
                    var group = {
                                    items_group_id:0,
                                    unit:'',
                                    items_group:'',
                                    work_parts:[]
                                };

                    var workParts = [];
                    let work_parts = this.arrayGroupBy(groupItem, 'work_part_id');
                    for(var j = 0; j < work_parts.length; j++) {
                        var workPartItem = work_parts[j];
                        var work_part = {
                            work_part_id : '',
                            work_part_name : '',
                            describe : '',
                            status : [],
                        };
                        work_part.work_part_id = workPartItem[0].work_part_id;
                        work_part.work_part_name = workPartItem[0].work_part_name;
                        work_part.describe = workPartItem[0].describe;
                        if(queryType != 'day') {
                            var status = []; 
                            let data_types = this.arrayGroupBy(workPartItem, 'data_type');
                            for(var k = 0; k < data_types.length; k++) {
                                var dataItem = {
                                    data_type : '',
                                    datas : [],
                                };
                                let dataArray = data_types[k];
                                dataItem.data_type = dataArray[0].data_type;
                                dataItem.datas = dataArray;
                                status.push(dataItem);
                            }
                            work_part.status = status;
                        } else {
                            work_part.status = workPartItem;
                        }
                        // console.log("work_partswork_partswork_parts:",work_part);
                        workParts.push(work_part);
                    }

                    group.items_group_id = groupItem[0].items_group_id;
                    group.items_group = groupItem[0].items_group;
                    group.unit = groupItem[0].unit;
                    group.describe = groupItem[0].describe
                    group.work_parts =  workParts;
                    groupItems.push(group);
                }
                // var tempGroups = [];
                // for (let i = 0; i < array.length; i++) {
                //     const element = array[i];
                //     if (tempGroups.length) {
                        
                //     } else {
                //         tempGroups.push(element);
                //     }
                // }
                groupItems.sort(function(a, b){return parseInt(a.items_group_id) - parseInt(b.items_group_id)}); 

                this.groupItems = groupItems;
                //console.log('groupItemsgroupItemsgroupItems:',groupItems);
            },

            getEchartValues(partInfo){
                var resultObj = {
                    isDayValues : false,
                    data_typeInfo : [],
                    partValues  : [],
                    partTimes   : [],
                    partTypes   : [],
                };
                if (!partInfo.status.length) {
                    return;
                }
                var partValues = [];
                var partTimes = [];
                var partTypes = [];
                if (this.type == 'day') {
                    resultObj.isDayValues = true;
                    var lastTime = 0;
                    for (var i = 0; i < partInfo.status.length; i++) {
                         var partIem = partInfo.status[i];
                         var jump = this.timeUtil.getTimeSpan(lastTime,partIem.push_time);
                            //这里断点处理
                            for (var l = 0; l < jump; l++) {
                                var emptyTime = this.timeUtil.timestampToShortTime(parseInt(lastTime) + 300 * (l+1));
                                partTimes.push(emptyTime);
                                partValues.push(null);
                            }
                        partValues.push(this.global_.roundFun(partIem.value,2));
                        partTimes.push(this.global_.timestampToShortTime(partIem.push_time));
                        lastTime = partIem.push_time;
                    }
                } else {

                    for (var i = 0; i < partInfo.status.length; i++) {
                        var partIem = partInfo.status[i];
                        // console.log('groupItemsgroupItemsgroupItems:',partIem);

                        var moreValues = [];
                        var moreTimes = [];
                        // console.log('partInfopartInfopartInfopartInfo',partIem);
                        partTypes.push(partIem.data_type);
                        if (partIem.datas.length > 0) {
                            if (this.type == "month") {
                                var startDay = this.global_.getDayByTimeStamp(partIem.datas[0].date_time);
                                if (startDay > 1) {
                                    for (var k = 0; k < startDay - 1; k++) {
                                    moreValues.push(null);
                                    }
                                }
                            } else {
                                var startMonth = this.global_.getMonthByTimeStamp(partIem.datas[0].date_time);
                                if (startMonth > 1) {
                                    for (var k = 0; k < startMonth - 1; k++) {
                                    moreValues.push(null);
                                    }
                                }
                            }
                        }
                        for (var j = 0; j < partIem.datas.length; j++) {
                            var dataType = partIem.datas[j]
                            moreValues.push(this.global_.roundFun(dataType.value,2));
                            moreTimes.push(this.global_.timestampToShortTime(dataType.date_time));
                        }
                        partValues.push(moreValues);
                        partTimes.push(moreTimes);
                    }
                }
                resultObj.partValues = partValues;
                resultObj.partTimes = partTimes;
                resultObj.partTypes = partTypes;
                // console.log('resultObj.partValues:',partValues);
                // console.log('resultObj.partTimes:',partTimes);
                return resultObj;
            },

            dealEchartDatas(tempData){
                var sumNames = [];
                var sumDatas = [];
                var sumTimes = [];
                var sumColors = [];
                var sumTypes = [];
                // console.log('this.erCharNames'+tempData[0].items_group);
                for (var i = 0; i < tempData.length; i++) {
                    // console.log('tempData.length:',tempData.length);
                    var names = [];
                    var types = [];
                    var datas = [];
                    var colors = [];

                    let tempItem = tempData[i];
                    for (var k = 0; k < tempItem.work_parts.length; k++) {
                        var partInfo = tempItem.work_parts[k];

                        let resultObj = this.getEchartValues(partInfo);
                        if (resultObj) {
                            if (resultObj.isDayValues) {
                                datas.push(resultObj.partValues);
                                sumTimes.push(resultObj.partTimes);
                            } else {
                                resultObj.partValues.forEach( function(element, index) {
                                    datas.push(element);
                                });
                                resultObj.partTimes.forEach( function(element, index) {
                                    sumTimes.push(element);
                                });
                            }
                        }

                        var name = partInfo.work_part_name+tempItem.items_group;
                        if (resultObj.isDayValues) {
                            names.push(name);
                            // console.log('work_part_namework_part_name:',partInfo.work_part_name);
                            colors.push(this.constColors[k]);
                        } else {
                            for (var j = 0; j < resultObj.partTypes.length; j++) {
                                let partType = resultObj.partTypes[j];
                                let tmpName = name + (partType=="1"?"谷值":"峰值");
                                names.push(tmpName);
                                var type = {
                                    work_part_name:partInfo.work_part_name,
                                    data_type:partType,
                                };
                                types.push(type);
                                let colorIndex = k*resultObj.partTypes.length + j;
                                // console.log("colorIndex:",colorIndex);
                                if (colorIndex < this.constColors.length) {
                                    colors.push(this.constColors[colorIndex]);
                                } else {
                                    colors.push(this.constColors[0]);
                                }
                            }
                        }
                    }
                    sumNames.push(names);
                    sumTypes.push(types);
                    // console.log("sumDatassumDatas add:",datas);
                    sumDatas.push(datas);
                    sumColors.push(colors);
                }

                this.erCharNames = sumNames;
                this.erCharDatas = sumDatas;
                this.erCharColors = sumColors;
                this.time_list = sumTimes;
                this.work_parts_types = sumTypes;
                // console.log("erCharNames:",sumNames);
                // console.log("sumDatas:",sumDatas);
                // console.log("erCharColors:",sumColors);
                // console.log("sumTypessumTypessumTypes:",sumTypes);
                // console.log("sumTypessumTypessumTypes:",sumTypes);
            },
            querEchartXvalue(){
                if (this.type == 'day') {
                    return this.time_list;
                } else if(this.type == 'month') {
                    var backValues = [];
                    let sum = this.global_.getDateLength(this.timeUtil.getYearByFilter(this.date), this.timeUtil.getMonthByFilter(this.date));
                    for (var i = 1; i <= sum; i++) {
                        backValues.push(i);
                    }
                    return backValues;
                } else {
                    var backValues = [];
                    for (var i = 1; i <= 12; i++) {
                        backValues.push(i);
                    }
                    return backValues;
                }
            },
            querGroupDetail(items_group_id){
                // console.log("items_group_id:",this.show_data);
                this.filterGroupDatas = this.show_data.filter(function(value){
                    return value.items_group_id == items_group_id;
                });
                if (this.type == 'day') {
                    this.filterGroupDatas.sort(function(a, b){return parseInt(b.push_time) - parseInt(a.push_time)}); 
                } else {
                    this.filterGroupDatas.sort(function(a, b){return parseInt(b.date_time) - parseInt(a.date_time)}); 
                }
                // console.log("items_group_id",fDatas);
                this.detailGroupTitle = this.filterGroupDatas[0].items_group;
                this.detailItemUnit = this.filterGroupDatas[0].unit;
                if (this.detailItemUnit.length > 0) {
                    this.detailItemUnit = '('+this.detailItemUnit+')';
                }
                this.detailGroup  = this.filterGroupDatas.slice(0,this.itemsOnPage);
                this.dialogGroupDetailVisible = true;
            },
        }


    }
</script>

<style>
.query-line li{
    width: 100%;
    padding: 1.071429rem;
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
</style>
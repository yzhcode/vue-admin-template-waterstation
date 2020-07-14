<template>
    <div>
        <div class="query-block clearfix">
            <!-- 自定义水站组件 -->
            <QueryWaterSelect :waterid.sync="sid" :waterlineid.sync="activeID"/>
            <!-- 自定义流水线组件 -->
            <!-- <assemblyLine class="fl m-r-20" :waterid="sid" v-model="activeID"/> -->
            <label class="query-time-title fl ml-15">查询类型</label>
            <!-- <TimePicker :times.sync="waterTime" :types.sync="types"/> -->
            <datePicker class="mt-1" :dateType.sync="type" :date.sync="date"/>
            <el-button class="mt-1 ml-15" type="primary" @click="queryWaterAlarm()">查询</el-button>
        </div>

        <!-- 饼图 -->
        <!-- <div class="query-sector-block clearfix" v-show="percentDatas.length > 0">
            <div class="query-sector-flex clearfix">
                <div class="query-sector clearfix" v-show="sectorDatas.length > 0">
                    <div class=" sector-title clearfix" >
                        <li v-for="item in sectorDatas">
                            <titleColor :title=item.name :color="item.color"/>
                        </li>
                    </div>
                    <div class="sector-item ml-15">
                        <echart :options="global_.initSector(sectorColors,sectorDatas)" :auto-resize="true" autoresize/>
                    </div>
                </div>
                <div class="query-sector clearfix" style="width:400px" v-show="typeDatas.length > 0">
                    <div class="sector-title clearfix">
                        <li v-for="item in typeDatas">
                            <titleColor :title=item.name :color="item.color"/>
                        </li>
                    </div>
                    <div class="sector-item ml-15">
                        <echart :options="global_.initSector(typeColors,typeDatas)" :auto-resize="true" autoresize/>
                    </div>
                </div>
            </div>
        </div> -->

        <el-table :data="waterAlarmData" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class=" mt-15" v-show="totalNum > 0 && waterAlarmData.length > 0">
          <el-table-column
            type="index"
            width="70px"
            align="center"
            :index="indexMethod">
          </el-table-column>

          <el-table-column
            label="时间"
            min-width="18%">
            <template slot-scope="scope">
              {{global_.getTimeByFilter(scope.row.alarm_time) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="水站"
            min-width="15%">
            <template slot-scope="scope">
              {{getWaterName(scope.row.wateraffairs_name) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="概述"
            min-width="35%">
            <template slot-scope="scope">
              <div :class="scope.row.alarm_level=='emergency' ? 'color-disabled' : ''" > {{scope.row.alarm_reason | nullValueFormat}}</div>
            </template>
          </el-table-column>

        </el-table>

        <p class="emptyItem" v-show="totalNum == 0 || waterAlarmData.length == 0">{{empty_notice}}</p>

        <el-pagination v-show="totalNum > 0 && waterAlarmData.length > 0 "
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="parseInt(totalNum)"
            layout="total,  prev, pager, next">
        </el-pagination>

    </div>
</template>
<script>
    import assemblyLine from "@/components/assemblyLine";
    import titleColor from "@/components/titleColor";
    import datePicker from "@/components/datePicker";

    export default {
        data(){
            return{
                sid                  : 'all',
                waterName            : '',//水站名称
                activeID             : "1",//选中水线ID
                waterOldTime         : [],
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                totalNum             : 0,
                waterAlarmData       : [],
                waterData            : [],//水站
                sectorColors         : [],
                sectorDatas          : [],
                percentDatas         : [],//饼状图报警数据
                typeColors           : ['#2582F7','#FF6C15'],
                typeDatas            : [],
                percentTypeData      : {},//饼状图已处理和未处理对比数据
                date                 : this.timeUtil.getDateByType(new Date(),'day'),
                type                 : "day",
                empty_notice         : '加载中...',
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
            datePicker,
        },
        filters:{
            /**
             * [数据回显格式化]
             * @param  {[type]} transValue [description]
             * @return {[type]}            [description]
             */
            nullValueFormat(transValue){
                return transValue ? transValue : "--";
            },
        },
        mounted(){
            
        },
        created() {
        },
        methods:{
            indexMethod(index) {
                return (this.currentPage-1)*this.itemsOnPage+index+1;
            },
            handleSizeChange(val) {
                this.itemsOnPage = val;
                this.queryWaterAlarm();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.queryWaterAlarm();
            },
            getCurWaterName(){
                if(this.sid == 'all'){
                    this.waterName = "";
                }else{
                    for(var i = 0; i < this.waterData.length;i++){
                        if(this.waterData[i].id == this.sid){
                            this.waterName = this.waterData[i].wateraffairs_name;
                            return;
                        }
                    }
                }
            },
            getWaterName(name){
                if(name){
                    return name;
                }else{
                    return this.waterName;
                }
            },
            /**
             * [查询报警信息]
             * @return {[type]} [description]
             */
            queryWaterAlarm() {
                try{
                    if(!this.waterData.length){
                        this.global_.showToastErrmsg("无水站信息");
                        return;
                    }

                    if(this.sid != 'all' && !this.activeID){
                        this.global_.showToastErrmsg("无水线信息");
                        return;
                    }

                    // this.$loading.show("请稍等");

                    this.$fetch({
                        url: "Web/Additional/get_alarm_history?action=get",
                        method: "get",
                        data: {
                            wateraffairs_id: this.sid, //水站ID，all:表示查询全部
                            line_num       : this.activeID, //水线    wateraffairs_id=all时忽略
                            select_type    : this.type, //查询报表类型 day:日报表  month:月报表 year：年报表
                            date_time      : this.date, //时间    day => 2020-05-13  month => 2020-05   year=> 2020
                            page           : this.currentPage, //请求第几页
                            page_size      : this.itemsOnPage, //每一页最大个数
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if(jsonData.data.page){
                                this.currentPage           = parseInt(jsonData.data.page);
                            }else{
                                this.currentPage           = 1;
                            }
                            if(jsonData.data.history_list){
                                this.waterAlarmData     = jsonData.data.history_list;
                            }else{
                                this.currentPage           = 1;
                                this.waterAlarmData     = [];
                            }
                            if(jsonData.data.total_num){
                                this.totalNum           = parseInt(jsonData.data.total_num);
                            }else{
                                this.totalNum           = 0;
                            }
                            if(jsonData.data.percent_data){
                                this.percentDatas       = jsonData.data.percent_data;
                            }else{
                                this.percentDatas       = [];
                            }
                            if(jsonData.data.percent_type_data){
                                this.percentTypeData    = jsonData.data.percent_type_data;
                            }else{
                                this.percentTypeData    = [];
                            }
                            this.getCurWaterName();
                            if (this.waterAlarmData.length == 0) {
                                this.empty_notice = '暂无数据';
                            }
                            // this.initPercentData();
                            // this.initProcessData();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                            this.clearData();
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    this.$loading.hide();
                    this.clearData();
                    console.log("whole alarmLog alarmInfo: "+e);
                };
            },
            initPercentData(){
                this.sectorColors = [];
                this.sectorDatas  = [];
                for (var i = 0; i < this.percentDatas.length; i++) {
                    if(this.percentDatas[i].work_part_name && this.percentDatas[i].items_id){
                        var color = this.global_.getColor(i);
                        this.sectorColors.push(color);
                        this.sectorDatas.push({value: this.percentDatas[i].alarm_total, name: this.percentDatas[i].work_part_name +this.percentDatas[i].describe, color: color});
                    }
                }
            },
            initProcessData(){
                this.typeDatas = [];
                this.typeDatas.push({value: this.percentTypeData.alarm_process_total, name: "已处理",color:'#2582F7'});
                this.typeDatas.push({value: this.percentTypeData.alarm_unprocess_total, name: "未处理",color:'#FF6C15'});
            },
            clearData(){
                this.waterAlarmData     = [];
                this.sectorColors       = [];
                this.sectorDatas        = [];
                this.typeDatas          = [];
            },
        }
    }
</script>

<style lang="less" scope>
</style>
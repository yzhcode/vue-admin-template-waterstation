<template>
    <div class="deviceMonitoringMain">
        <!-- 自定义流水线组件 -->
        <!-- <assemblyLine
            :waterid="sid"
            v-model="activeID">
        </assemblyLine> -->

        <div class="stationStatistics">
            <div class="deviceMonitorUnit water-n-1">
                <label>今日生产时长（小时）</label>
                <p>{{workTime}}</p>
            </div>

            <div class="lineDataContainer" v-show="switchList.length > 0">
                <div class="devicelineDataItem" v-for="(item, index) in switchList">
                    <div class="lineDataItemTitle">
                        <label>{{item.work_part_name + item.describe}}</label>
                    </div>
                    <div class="lineDataItemContent">
                        <label class="font-s-16 water-n-1">{{splitDesc(item.config_enum,item.value)}}</label>
                    </div>
                </div>
            </div>
            
        </div>

        <table class="table-fixed mt-15">
            <thead>
                <tr>
                    <th width="7%"></th>
                    <th width="30%">时间</th>
                    <!-- <th width="20%">水处理线</th> -->
                    <th width="40%">参数配置</th>
                    <th width="20%">状态</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in monitorHisList">
                    <td>{{(curPage -1) * pageSize + index + 1}}</td>
                    <td>{{global_.getTimeByFilter(item.push_time) | nullValueFormat}}</td>
                    <td>{{item.work_part_name + item.describe}}</td>
                    <td>{{splitDesc(item.config_enum,item.value) | nullValueFormat}}</td>
                </tr>
                <tr class="noData" v-if="monitorHisList.length==0">
                    <td colspan="4" style="text-align: center;">
                        {{queryDataInfo}}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 分页 -->
        <div id="monitorPage" class="paginationManage"></div>
    </div>
</template>
<script>
     import assemblyLine from "@/components/assemblyLine";
    export default {
        data(){
            return{
                sid : this.$route.query.sid,
                activeID          : "1",//选中水线ID
                queryDataInfo     : "查询中",
                monitorHisList    : [],
                workTime          : 0,
                switchList        : [],
                curPage           : 1,
                pageSize          : 10,
                totalNum          : 0,
            }
        },
        components:{
            assemblyLine,
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
        watch:{
            /**
             * [监控value变化，处理异步情况]
             * @param  {[type]} newValue [description]
             * @param  {[type]} oldValue [description]
             * @return {[type]}          [description]
             */
            activeID(){
                // 切换查询
                this.queryWaterDeviceMonitorList();

            },
            curPage(){
                this.queryWaterDeviceMonitorList();
            },
            totalNum(numValue,oldValue){
                this.createPage(numValue);
            }
        },
        mounted(){
            //加载设备数据
            this.queryWaterDeviceMonitorList();
            //实时查询（轮询）
            // this.dataRefreh();
            
            this.bindDom();
        },
        destroyed(){
            this.$loading.hide();
            // this.clear();
        },
        methods:{
            bindDom(){
                
            },
            /**
             * [查询设备监控数据]
             * @return {[type]}         [description]
             */
            queryWaterDeviceMonitorList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url         : "/Web/WaterAffairs/get_device_monitor?action=get",
                        method      : "get",
                        data        : {
                            page             : this.curPage,
                            page_size        : this.pageSize,
                            wateraffairs_id  : this.sid,
                            line_num         : this.activeID,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success") {
                            this.switchList     = jsonData.data.switch_list;
                            this.monitorHisList = jsonData.data.history_list;
                            this.workTime       = jsonData.data.runtime_total;
                            this.totalNum       = jsonData.data.total_num;
                            if (this.totalNum == 0) {
                                this.queryDataInfo = "暂无数据";
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                    this.$loading.hide();
                });
                }catch(e){
                    this.$loading.hide();
                    console.log("queryWaterAffairsDetail: "+e);
                };
            },
            /**
             * [分页]
             * @param  {[type]} tmpData [description]
             * @return {[type]}         [description]
             */
            createPage(totalNum) {
                if(totalNum == 0){
                    this.queryDataInfo = "暂无数据";
                }
                let _t = this;

                $("#monitorPage").pagination({
                    items      : totalNum,
                    itemsOnPage: _t.pageSize,
                    onPageClick:function(pageNumber,index,basicNumber,event){
                        _t.pageSize          = basicNumber;//分页基数修改后，重置
                        let tmpSliceNumber   = (pageNumber-1)*basicNumber;
                        _t.curPage           = pageNumber;
                    },
                    onInit:function(basicNumber){
                        _t.curPage           = 1;
                    }
                });
            },
            // 定时刷新数据函数
            dataRefreh() {
              // 计时器正在进行中，退出函数
              if (this.intervalId != null) {
                return;
              }
              // 计时器为空，操作
              this.intervalId = setInterval(() => {
                
              }, 5000);
            }, 
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
            splitDesc(configEnum,numValue){
                var result = "";
                if (configEnum.length > 0) {
                    for (var i = 0; i < configEnum.length; i++) {
                        var temp = configEnum[i];
                        if (temp.value == parseInt(numValue)) {
                            result = temp.desc;
                        }
                    }
                }
                return result;
            },
        }
    }
</script>

<style scope>
.stationStatistics{
    display: flex;
    flex-direction: column;
}
.deviceMonitorUnit {

    min-width: 250px;
}
.deviceMonitorUnit p {
    font-size: 3.428571rem;
    font-weight: bolder;
}
.deviceMonitorUnit label {
    font-size: 1.428571rem;
}
.devicelineDataItem {
    width: 14.857143rem;
    height: 8rem;
    padding: .728571rem;
    margin: 1rem 1.071429rem 1.071429rem 0;
    border-radius: 8px;
    background: #FFFFFF;
    -webkit-box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
}

.lineDataContainer{
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
}
.devicelineDataItem .lineDataItemTitle{
        width: 100%;
        margin: 0 0 2.428571rem 0;
}
.devicelineDataItem .lineDataItemContent{
        width: 100%;
}
.devicelineDataItem .lineDataItemContent div{
        color: #757D88;
        display: flex;
        justify-content: space-between;
        margin: 0 0 0.714286rem 0;
}
.devicelineDataItem .lineDataItemContent div.alarm{
    color: #F83D3D;
}
</style>
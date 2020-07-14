<template>
    <div>
        <div class="query-block">
            <QueryWaterSelect :type="'one'" :waterid.sync="waterId" :waterlineid.sync="activeID"/>
            <label class="query-time-title fl">查询日期</label>
            <TimePicker :times.sync="waterTime" :types.sync="types"/>
            <button class="query-btn ml-3" @click="queryWaterAffairsHistory">查询</button>
        </div>
        <div class="lineDataContainer mt-15">
            <div class="lineDataItem" v-for="(item, index) in groupList">
                <div class="lineDataItemTitle font-s-16 water-n-1">
                    {{item.items_group}}<span>{{ global_.unitShow(item.unit) }}</span>
                </div>
                <div class="lineDataItemContent">
                    <div v-for="(statusItem, index) in item.status_list">
                        <label>{{statusItem.work_part_name+statusItem.describe}}</label>
                        <span>{{global_.roundFun(statusItem.min_value,4)+"-"+global_.roundFun(statusItem.max_value,4)}}</span>
                    </div>
                </div>
            </div>
        </div>

        <table class="table-fixed mt-15">
            <thead>
                <tr>
                    <th width="5%"></th>
                    <th width="15%">时间</th>
                    <th width="20%">水处理线</th>
                    <th width="30%">参数配置</th>
                    <th width="30%">数值</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(itemHis, index) in historyList">
                    <td>{{(currentPage-1)*itemsOnPage+index+1}}</td>
                    <td>{{global_.getTimeByFilter(itemHis.push_time)}}</td>
                    <td>{{activeID}}</td>
                    <td>{{itemHis.work_part_name+itemHis.describe}}</td>
                    <td v-if="itemHis.unit.length!=0">{{global_.roundFun(itemHis.value,4)+itemHis.unit}}</td>
                    <td v-else>{{global_.roundFun(itemHis.value,4)}}</td>
                </tr>
                <tr class="noData" v-if="historyList.length==0">
                    <td colspan="6" style="text-align: center;">
                        {{queryDataInfo}}
                    </td>
                </tr>
            </tbody>
        </table>
        <div id="accountManagePage" class="paginationManage"></div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                queryDataInfo   : "查询中",
                itemsOnPage     : 10,//分页基数
                currentPage     : 1,//当前页
                waterId         : "",//水站ID
                activeID        : "1",//选中水线ID
                created         : false,
                types           : {
                                item: {day: '日', month: '月', year: '年' },
                                active: 'day' //日期选中状态key
                },
                waterTime       : ['2020', '05', '01'], //this.global_.dataChartTime().t.split("-"),

                groupList:[
                    {
                        "items_group":"PH值",
                        "items_group_id":1,
                        "unit":"",//单位
                        "status_list":[{
                            "items_id":1,
                            "work_part_id":1,
                            "work_part_name":"进水",
                            "describe":"PH值",
                            "max_value":7.7,    //峰值
                            "min_value":6.7 //谷值
                        },
                        {
                            "items_id":1,
                            "work_part_id":1,
                            "work_part_name":"出水",
                            "describe":"PH值",
                            "max_value":5.7,    //峰值
                            "min_value":3.7 //谷值
                        }]
                    },
                    {
                        "items_group":"浊度",
                        "items_group_id":1,
                        "unit":"NTU",//单位
                        "status_list":[{
                            "items_id":1,
                            "work_part_id":1,
                            "work_part_name":"进水",
                            "describe":"浊度",
                            "max_value":7.7,    //峰值
                            "min_value":6.7 //谷值
                        },
                        {
                            "items_id":1,
                            "work_part_id":1,
                            "work_part_name":"出水",
                            "describe":"浊度",
                            "max_value":7.7,    //峰值
                            "min_value":6.7 //谷值
                        }]
                    },
                    {
                        "items_group":"余氯",
                        "items_group_id":1,
                        "unit":"mg/L",//单位
                        "status_list":[{
                            "items_id":1,
                            "work_part_id":1,
                            "work_part_name":"出水",
                            "describe":"余氯",
                            "max_value":7.7,    //峰值
                            "min_value":6.7 //谷值
                        }]
                    },
                ],
                historyList:[
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    },
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    },
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    },
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    },
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    },
                    {//数据历史记录
                        "push_time":"2020-05-13 12:34:22",
                        "items_id":1,
                        "work_part_id":1,
                        "work_part_name":"进水",
                        "describe":"PH值",
                        "unit":"",//单位,
                        "value":7.2
                    }
                ]
            }
        },
        components:{

        },
        created() {
        },
        mounted(){
        },
        watch:{
            waterId(){
                // 加载数据详情
                this.created = false;
                this.currentPage = 1;
                this.queryWaterAffairsDataHistory();
            }
        },
        methods:{

            queryWaterAffairsHistory(){
                // 加载数据详情
                this.created = false;
                this.currentPage = 1;
                this.queryWaterAffairsDataHistory();
            },
            queryWaterAffairsDataHistory(){
                var time;
                if (this.waterTime.length > 1) {
                  time = this.waterTime.join('-');
                } else {
                  time = this.waterTime[0];
                }
                //console.log("46465464time:"+this.waterTime);
                //console.log("46465464select_type:"+this.types.active);
                try{
                    this.$fetch({
                        url: "/Web/Additional/get_data_history?action=get",
                        method: "get",
                        data:{
                            wateraffairs_id: this.waterId,
                            line_num       : this.activeID,
                            select_type    : this.types.active,
                            date_time      : time,
                            page           : this.currentPage,
                            page_size      : this.itemsOnPage,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if(jsonData.data.hasOwnProperty("total_num")){
                                this.totalNum = jsonData.data.total_num;
                            }

                            if (jsonData.data.group_list instanceof Array) {
                                this.groupList = jsonData.data.group_list;
                            }
                            if (jsonData.data.history_list instanceof Array) {
                                this.historyList = jsonData.data.history_list;
                                this.createPage(this.historyList);
                            } else {
                                this.historyList = [];
                            }
                            if (this.historyList.length == 0) {
                                this.queryDataInfo = "暂无数据";
                            }
                        }else{
                            this.$toast(jsonData.errmsg);
                        }

                    });
                }catch(e){
                    console.log("queryWaterAffairsDetail: "+e);
                };
            },
            createPage(tempData){
                if (this.created) {
                    return;
                }
                this.created = true;
                $("#accountManagePage").pagination({
                    items      : this.totalNum,
                    itemsOnPage: this.itemsOnPage,
                    onPageClick:(pageNumber,index,basicNumber,event) => {
                        this.itemsOnPage = basicNumber;
                        this.currentPage = pageNumber;
                        this.queryWaterAffairsDataHistory();
                    },
                    onInit:(basicNumber) => {
                        this.currentPage = 1;
                    }
                });
            },
        }
    }
</script>

<style>

</style>
<template>
    <div class="staionWorkOrderMain">
        <div class="query-block station-order-list mb-15">
            <label class="query-time-title fl">查询日期</label>
            <el-date-picker
                style="max-width:150px"
                v-model="querWorkOrder.beginTime"
                type="date"
                :clearable="false"
                placeholder="起始时间">
            </el-date-picker>
            <span>至</span>
            <el-date-picker
                style="max-width:150px"
                v-model="querWorkOrder.endTime"
                type="date"
                :clearable="false"
                placeholder="结束时间">
            </el-date-picker>
            <el-button class="mt-1 ml-15" type="primary" @click="queryMyWorkOrder()">查询</el-button>
        </div>

        <p class="emptyItem" v-show="workOrderList.length == 0">
            {{emptyHintStr}}
        </p>

        <el-table :data="workOrderList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" v-show="workOrderList.length > 0">
	       <el-table-column
	            label="工单编号"
	            min-width="8%">
	            <template slot-scope="scope">
	                <div :class="[{'water-c-2':scope.row.order_type == 2}]">{{global_.getWorkOrderCode(scope.row.id, scope.row.order_type)}}</div>
	            </template>
	       </el-table-column>

	       <el-table-column
		        label="名称"
		        min-width="12%"
		        prop="name">
	       </el-table-column>

			<el-table-column
		        label="概述"
		        min-width="15%">
		        <template slot-scope="scope">
		        	<div class="curPoint" :title="scope.row.describe">{{scope.row.describe}}</div>
		       	</template>
	       </el-table-column>

	       <el-table-column
	            label="派发时间"
	            min-width="15%">
	            <template slot-scope="scope">
	                {{global_.getTimeByFilter(scope.row.ctime)}}
	            </template>
	       </el-table-column>
	       <el-table-column
	            label="处理时间段"
	            min-width="20%">
	            <template slot-scope="scope">
                    {{global_.getTimeByFilter(scope.row.start_time) + ' ~ ' + global_.getTimeByFilter(scope.row.end_time)}}
	            </template>
	       </el-table-column>

	       <el-table-column
	            label="状态"
	            min-width="15%">
	            <template slot-scope="scope">
	                <div :title="unprocessOrder" class="curPoint color-disabled" @click="processWorkOeder()" v-if="scope.row.order_status == 0">
						待处理
	                </div>
	                <div v-else>
						已处理    <span class="curPoint color-primary station-detail-font" @click="detailWorkOeder(scope.row.id)">查看详情</span>
	                </div>
	            </template>
	       </el-table-column>

	       <el-table-column
	            label="处理时间"
	            min-width="15%">
	            <template slot-scope="scope">
	            	{{global_.getTimeByFilter(scope.row.process_time)}}
	            </template>
	       </el-table-column>
        </el-table>
        <el-pagination v-show="totalNum > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="parseInt(totalNum)"
            layout="total, prev, pager, next">
        </el-pagination>

        <!-- 工单详情 -->
        <el-dialog title="工单详情" :visible.sync="dialogTableVisible" width="600px">
            <el-form ref="form" label-width="100px" v-for="title in detailTitles" :key="title" style="margin-bottom:-20px">
                <el-form-item :label="title">
                    <label v-if="title=='工单编号:'">{{global_.getWorkOrderCode(workOrderDetailItem.id, workOrderDetailItem.order_type)}}</label>
                    <label v-if="title=='名称:'">{{workOrderDetailItem.name}}</label>
                    <label v-if="title=='派发时间:'">{{global_.getTimeByFilter(workOrderDetailItem.ctime)}}</label>
                    <label v-if="title=='派发人员:'">{{workOrderDetailItem.create_user_name}}</label>
                    <label v-if="title=='任务概述:'">{{workOrderDetailItem.describe}}</label>
                    <label v-if="title=='处理时间段:'">{{global_.getTimeByFilter(workOrderDetailItem.start_time) + ' ~ ' + global_.getTimeByFilter(workOrderDetailItem.end_time)}}</label>
                    <label v-if="title=='处理人:'">{{workOrderDetailItem.processor}}</label>
                    <label v-if="title=='处理时间:'">{{global_.getTimeByFilter(workOrderDetailItem.process_time)}}</label>
                    <label v-if="title=='处理位置:'">{{workOrderDetailItem.location}}</label>
                    <label v-if="title=='处理结论:'">{{workOrderDetailItem.process_detail}}</label>
                    <img v-if="title=='照片:'" class="station-order-detail-img" :src="workOrderDetailItem.pic_url">
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                detailTitles        : [],
                dialogTableVisible  : false,
                sid                 : this.$route.query.sid,//水站ID
                querWorkOrder       : {
                                        beginTime:this.getCurrentMonthFirst(),
                                        endTime:this.getCurrentMonthLast(),
                                      },
                itemsOnPage         : 10,//分页基数
                currentPage         : 1,//当前页
                totalNum            : 0,
                workOrderList       : [],//工单列表
                workOrderDetailItem : '',//工单详情
                emptyHintStr        : '加载中...',
                unprocessOrder      : "请在手机上处理此工单",//未处理工单提示信息

            }
        },
        components:{
        },
        watch:{
        },
        mounted(){
            this.getworkOrderData();
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        methods:{
            handleSizeChange(val) {
                this.itemsOnPage = val;
                this.getworkOrderData();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getworkOrderData();
            },
            queryMyWorkOrder(){
                this.currentPage = 1;
                this.getworkOrderData();
            },
            getworkOrderData(){
                if (this.querWorkOrder.beginTime == null || this.querWorkOrder.endTime == null) {
                    this.$toast("请选择时段");
                    return;
                }
                this.$loading.show("请稍等");
                var cstartTime = this.getTimeToString(this.querWorkOrder.beginTime)+" 00:00:00";
                var cendTime = this.getTimeToString(this.querWorkOrder.endTime)+" 23:59:59";
                // console.log('开始时间:', cstartTime);
                // console.log('结束时间:', cendTime);
                try{
                    this.$fetch({
                        url   : "Web/Additional/work_order_list?action=get",
                        method: "get",
                        data  : {
                            wateraffairs_id : this.sid,
                            start_time      : cstartTime,
                            end_time        : cendTime,
                            page            : this.currentPage,
                            page_size       : this.itemsOnPage,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data) {
                                var data = jsonData.data;
                                if(data.hasOwnProperty("total_num")){
                                    this.totalNum = data.total_num;
                                }
                                if (data.order_list instanceof Array) {
                                    this.workOrderList = data.order_list;
                                } else {
                                    this.workOrderList = [];
                                }
                                if (this.workOrderList.length == 0) {
                                    this.emptyHintStr = '暂无数据';
                                }
                            }
                        } else {
                            if (jsonData.errmsg) {
                                this.$toast(jsonData.errmsg);
                            } else {
                                this.$toast('数据获取失败');
                            }
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    this.$toast('数据获取失败');
                };
            },
            detailWorkOeder(id){
                this.detailTitles = ['工单编号:','名称:','派发时间:','派发人员:','任务概述:','处理时间段:','处理人:','处理时间:'];
                this.dialogTableVisible = true;
                try{
                    this.$fetch({
                        url   : "Web/Additional/work_order_detail?action=get",
                        method: "get",
                        data  : {
                                    id : id,
                                },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.workOrderDetailItem = jsonData.data;
                            if(this.workOrderDetailItem.location){
                                this.detailTitles.push('处理位置:');
                            }
                            this.detailTitles.push('处理结论:');
                            if(this.workOrderDetailItem.pic_url){
                                this.detailTitles.push('照片:');
                            }
                        }
                    }).finally(() => {

                    });
                }catch(e){

                };
            },
            processWorkOeder(){
                this.$toast(this.unprocessOrder);
            },
            /**
             * [获取当前时间的前30天]
             * @return {[type]} [description]
             */
            getCurrentMonthFirst(){
                var date = new Date();
                var oneDay=1000*60*60*24*30;
                return new Date(date - oneDay);
            },
            /**
             * 获取当前时间
             */
            getCurrentMonthLast(){
                return new Date();
            },
            getTimeToString(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                return y + '-' + m + '-' + d;
            },
        }
    }
</script>

<style scope>
.station-detail-font{
    font-size: 12px;
}
.station-order-detail-img{
    max-width: 300px;
}
</style>
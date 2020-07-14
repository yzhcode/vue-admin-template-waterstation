<template>
    <div class="wholeOrderlMain">

        <el-button class="mb-15" type="primary" @click="addWorkOrder()">添加工单</el-button>

        <p class="emptyItem" v-show="workOrderList.length == 0">
            {{emptyHintStr}}
        </p>

        <el-table :data="workOrderList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" v-show="workOrderList.length > 0">
            <el-table-column
                label="工单编号"
                min-width="8%">
                <template slot-scope="scope">
                    {{global_.getWorkOrderCode(scope.row.id, 1)}}
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
                label="水站"
                min-width="22%">
                <!-- <template slot-scope="scope">
                    <div class="curPoint" :title = "scope.row.wateraffairs_name">{{scope.row.wateraffairs_name}}</div>
                </template> -->

                <template slot-scope="scope">
                    <a v-if="scope.row.wateraffairs_name.split(',').length == 1">{{scope.row.wateraffairs_name}}</a>
                    <div v-else v-for="(item, indexs) in scope.row.wateraffairs_name.split(',')">
                        <li :class="indexs!=0?'mt-15':''">{{item}}</li>
                        <span v-if="indexs!=scope.row.wateraffairs_name.split(',').length-1&&scope.row.wateraffairs_name.split(',').length>1" class="lineSpan"></span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column
                label="操作"
                min-width="8%">
                <template slot-scope="scope">
                    <el-button type="danger" @click="sureDeleteWorkOrder(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination v-show="totalNum > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="parseInt(totalNum)"
            layout="total,  prev, pager, next">
        </el-pagination>
        <el-dialog title="新建工单" :visible.sync="dialogTableVisible" width="480px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="工单名称" required>
                    <el-input v-model.trim="formName"></el-input>
                </el-form-item>
                <el-form-item label="分配水站" required>
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                    <div style="margin: 5px 0;"></div>

                    <el-checkbox-group v-model="formSelectedWater"  @change="handleCheckedWaterChange">
                        <el-checkbox v-for="(item, index) in waterData" :label="item.id" :key="item.id">{{item.wateraffairs_name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item label="起始时间" required>
                    <el-row>
                      <el-col :span="11">
                        <el-date-picker type="date" placeholder="选择日期" v-model="formStartDate" @change="changedOrderStartTime" style="width: 100%;" :clearable="false" :picker-options="expireTimeOption"></el-date-picker>
                      </el-col>
                      <el-col :span="2"><div style="text-align: center">-</div></el-col>
                      <el-col :span="11">
                        <el-time-select
                          style="width: 168px"
                          v-model="formStartTime"
                          :clearable="false"
                          :picker-options="{
                            start: '00:00',
                            step: '01:00',
                            end: '23:00'
                          }"
                          placeholder="选择时间">
                        </el-time-select>
                      </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item label="结束时间" required>
                    <el-col :span="11">
                    <el-date-picker type="date" placeholder="选择日期" v-model="formEndDate" @change="changedOrderEndTime" style="width: 100%;" :clearable="false" :picker-options="expireTimeOption"></el-date-picker>
                    </el-col>
                    <el-col :span="2"><div style="text-align: center">-</div></el-col>
                    <el-col :span="11">
                      <el-time-select
                        style="width: 168px"
                        v-model="formEndTime"
                        :clearable="false"
                        :picker-options="{
                            start: '00:00',
                            step: '01:00',
                            end: '23:00'
                          }"
                        placeholder="选择时间">
                      </el-time-select>
                  </el-col>
                </el-form-item>
                <el-form-item label="任务描述" required>
                    <el-input type="textarea" v-model.trim="formDesc"></el-input>
                </el-form-item>

                <el-form-item label="上报位置" required>
                    <el-select v-model="formLocation">
                    <el-option label="需要" value="1"></el-option>
                    <el-option label="不需要" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addOrderSave">立即添加</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="提示" :visible.sync="deleteDialogVisible" width="30%">
            <span>确定要删除吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteWorkOrder()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogTableVisible  : false,
                deleteDialogVisible : false,
                deleteId            : 0,
                checkAll            : false,
                isIndeterminate     : false,

                //新建工单
                orderWaterid        : 0,
                orderStartTime      : '',
                orderEndTime        : '',
                formName            : '',
                formSelectedWater   : [],
                formStartDate       : '',
                formStartTime       : '',
                formEndDate         : '',
                formEndTime         : '',
                formDesc            : '',
                formLocation        : '',

                emptyHintStr        : '加载中...',
                itemsOnPage         : 10,//分页基数
                currentPage         : 1,//当前页
                totalNum            : 0,
                workOrderList       : [],//工单列表

                //工单详情
                workOrderDetailItem : '',
                waterData           : [],//水站列表
                waterIdList         : [],
                expireTimeOption    : {
                                        disabledDate(date) {
                                            //disabledDate 设置禁用状态，参数为当前日期，要求返回 Boolean
                                            return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
                                        }
                                      },
            }
        },
        components:{
        },
        watch:{
        },
        mounted(){
            this.getworkOrderData();
            this.global_.waterListload();
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        methods:{
            changedOrderStartTime(date){
                if (!this.formStartTime) {
                    this.formStartTime = "00:00";
                }
            },
            changedOrderEndTime(date){
                if (!this.formEndTime) {
                    this.formEndTime = "23:00";
                }
            },
            handleSizeChange(val) {
                this.itemsOnPage = val;
                this.getworkOrderData();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getworkOrderData();
            },
            initWaterIdList(){
                var tempList = [];
                for (let i = 0; i < this.waterData.length; i++) {
                    let waterItem = this.waterData[i];
                    tempList.push(waterItem.id);
                }
                this.waterIdList = tempList;
            },
            handleCheckAllChange(val) {
                this.formSelectedWater = val ? this.waterIdList : [];
                this.isIndeterminate = false;
            },
            handleCheckedWaterChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount == this.waterIdList.length;
                this.isIndeterminate = (checkedCount > 0 &&  checkedCount < this.waterIdList.length);
            },
            getworkOrderData(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url   : "Web/Additional/work_order_distribute_list?action=get",
                        method: "get",
                        data  : {
                                    page        : this.currentPage,
                                    page_size   : this.itemsOnPage,
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
            sureDeleteWorkOrder(id){
                this.deleteDialogVisible = true;
                this.deleteId = id;
            },
            deleteWorkOrder(){
                this.deleteDialogVisible = false;
                try{
                    this.$fetch({
                        url   : "Web/Additional/work_order_distribute_delete?action=post",
                        method: "post",
                        data  : {
                                    work_order_id : this.deleteId,
                                },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.getworkOrderData();
                            this.$toast("删除成功");
                        } else {
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {

                    });
                }catch(e){
                    this.$toast('删除失败');
                };
            },
            addWorkOrder(){
                this.waterData = this.$store.getters["siteConfig/renderWaterData"];
                //重置数据
                this.formName            = '';
                this.formSelectedWater   = [];
                this.formStartDate       = '';
                this.formStartTime       = '';
                this.formEndDate         = '';
                this.formEndTime         = '';
                this.formDesc            = '';
                this.formLocation        = '';
                this.checkAll = false;
                this.isIndeterminate = false;

                this.initWaterIdList();
                this.dialogTableVisible = true;
            },
            addOrderSave(){
                if(!this.formName){
                    this.$toast("请填写名称");
                    return;
                }

                if (this.formSelectedWater.length == 0) {
                    this.$toast("请选择水站");
                    return;
                }
                var wateridStr = '';
                var selectedWaterCount = this.formSelectedWater.length;
                for (var i = 0; i < selectedWaterCount; i++) {
                    var selectedId = this.formSelectedWater[i];
                    wateridStr += (selectedId.toString()+',');
                }
                this.orderWaterid = wateridStr.slice(0, wateridStr.length - 1);
                if(!this.formStartDate){
                    this.$toast("请填写开始时间");
                    return;
                }
                this.orderStartTime = this.changeStr(this.global_.dateformatToString(this.formStartDate), 11, this.formStartTime);

                if(!this.formEndDate){
                    this.$toast("请填写结束时间");
                    return;
                }
                this.orderEndTime = this.changeStr(this.global_.dateformatToString(this.formEndDate), 11, this.formEndTime);

                let dateStart = this.changeTimeStrToDate(this.orderStartTime).getTime();
                let dateEnd = this.changeTimeStrToDate(this.orderEndTime).getTime();
                if (dateEnd < dateStart || dateEnd == dateStart){
                  this.$toast("请选择合理的结束时间");
                  return;
                }
                if(!this.formDesc){
                    this.$toast("请填写任务描述");
                    return;
                }
                if(!this.formLocation){
                    this.$toast("请选择是否需要上报位置");
                    return;
                }
                // console.log('名称:', this.formName);
                // console.log('水站ID:', this.orderWaterid);
                // console.log('开始时间:', this.orderStartTime);
                // console.log('结束时间:', this.orderEndTime);
                // console.log('描述:', this.formDesc);
                // console.log('上报位置:', this.formLocation);
                this.dialogTableVisible = false;
                try{
                    this.$fetch({
                        url   : "Web/Additional/work_order_distribute?action=post",
                        method: "post",
                        data  : {
                            wateraffairs_id     : this.orderWaterid,
                            start_time          : this.orderStartTime,
                            end_time            : this.orderEndTime,
                            name                : this.formName,
                            describe            : this.formDesc,
                            need_location       : this.formLocation,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.getworkOrderData();
                            this.$toast("添加成功");
                        } else {
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {

                    });
                }catch(e){
                    this.$toast('添加失败');
                };
            },
            changeTimeStrToDate(timeStr){
                var newTimeStr = timeStr;
                newTimeStr = newTimeStr.substring(0,19);
                newTimeStr = newTimeStr.replace(/-/g,'/'); //必须把日期'-'转为'/'
                return new Date(newTimeStr);
            },
            changeStr(str,index,changeStr){
                if (changeStr == null) {
                    changeStr = '00:00';
                }
              return str.substr(0, index) + changeStr+ str.substr(index + changeStr.length);
            },
        }
    }
</script>

<style scope>
</style>
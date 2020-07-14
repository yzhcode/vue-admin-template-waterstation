<template>
    <div>
        <div class="query-block clearfix">
            <!-- 自定义水站组件 -->
            <!-- <QueryWaterSelect :waterid.sync="sid" :waterlineid.sync="activeID"/> -->
            <!-- 自定义流水线组件 -->
            <!-- <assemblyLine class="fl m-r-20" :waterid="sid" v-model="activeID"/> -->
            <label class="query-time-title fl">查询类型</label>
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

        <el-table v-show="totalNum > 0 && waterAlarmData.length > 0" :data="waterAlarmData" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class="mt-15">
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
            label="概述"
            min-width="30%">
            <template slot-scope="scope">
              <div :class="scope.row.alarm_level=='emergency' ? 'color-disabled' : ''" > {{scope.row.alarm_reason | nullValueFormat}}</div>
            </template>
          </el-table-column>

          <!-- <el-table-column
            label="状态"
            min-width="10%">
            <template slot-scope="scope">
                <div v-if="scope.row.process_time != null">已处理
                    <span class="curPoint color-primary whole-detail-font" @click="detailAlarmInfo(scope.row.id)">查看详情</span>
                </div>
                <div v-else>
                    <el-button v-if="userRole == 3" type="primary" @click="confirm(scope.row)">处理</el-button>
                    <div v-else class="color-disabled" >待处理</div>
                </div>
            </template>
          </el-table-column>

          <el-table-column
            label="处理人"
            min-width="20%">
            <template slot-scope="scope">
              {{getProcessor(scope.row) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="处理时间"
            min-width="15%">
            <template slot-scope="scope">
              {{global_.getTimeByFilter(scope.row.process_time) | nullValueFormat}}
            </template>
          </el-table-column> -->

        </el-table>

        <p class="emptyItem" v-show="totalNum == 0 || waterAlarmData.length == 0">{{empty_notice}}</p>
        
        <el-pagination v-show="totalNum > 0 && waterAlarmData.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="parseInt(totalNum)"
            layout="total, prev, pager, next">
        </el-pagination>

        <!-- 弹框 -->
        <el-dialog :title="alarmTitle" :visible.sync="alarmDialogVisible" width="30%" @close='closeDialog'>
            <el-form ref="form" label-width="125px">
                <el-form-item label="处理详情">
                    <el-input v-model.trim="alarmDetail"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload
                        accept=".jpg, .jpeg, .png, .gif, .json, .JPG, .JPEG, .PBG, .GIF, .JSON"
                        ref="upload"
                        :class="{hide:hideUpload}"
                        action="#"
                        list-type="picture-card"
                        :auto-upload="false"
                        :on-change="handleChange"
                        :on-remove="handleRemove"
                        :before-upload="beforeAvatarUpload">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button @click="clearAlarmInfo()">取 消</el-button>
                    <el-button type="primary" @click="processingAlarm()">处理</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="报警详情" :visible.sync="alarmDetailVisible" width="600px">
            <el-form ref="form" label-width="100px" v-for="title in detailTitles" :key="title" style="margin-bottom:-20px">
                <el-form-item :label="title">
                    <label v-if="title=='报警时间:'">{{global_.getTimeByFilter(alarmInfo.alarm_time) | nullValueFormat}}</label>
                    <label v-if="title=='概述:'">{{alarmInfo.alarm_reason | nullValueFormat}}</label>
                    <label v-if="title=='处理人:'">{{alarmInfo.processor | nullValueFormat}}</label>
                    <label v-if="title=='处理时间:'">{{global_.getTimeByFilter(alarmInfo.process_time) | nullValueFormat}}</label>
                    <label v-if="title=='处理详情:'">{{alarmInfo.process_detail}}</label>
                    <img v-if="title=='照片:'" class="whole-order-detail-img" :src="alarmInfo.alarm_image">
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import assemblyLine from "@/components/assemblyLine";
    import titleColor from "@/components/titleColor";
    import datePicker from "@/components/datePicker";

    export default {
        data(){
            return{
                userRole             : this.$store.getters["siteConfig/renderUserRole"],//账号角色
                sid                  : this.$route.query.sid,//水站ID
                activeID             : "1",//选中水线ID
                date                 : this.timeUtil.getDateByType(new Date(),'day'),
                type                 : "day",
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                totalNum             : 0,
                waterAlarmData       : [],//当前页报警数据
                waterData            : [],//水站
                sectorColors         : [],
                sectorDatas          : [],
                percentDatas         : [],//饼状图报警数据
                typeColors           : ['#2582F7','#FF6C15'],
                typeDatas            : [],
                percentTypeData      : {},//饼状图已处理和未处理对比数据
                alarm_id             : "",
                imageUrl             : '',
                alarmTitle           : "",
                alarmDetail          : "",
                alarmDialogVisible   : false,
                alarmDetailVisible   : false,
                detailTitles         : ['报警时间:','概述:','处理人:','处理时间:','处理详情:','照片:'],
                alarmInfo            : "",
                hideUpload           : false,
                empty_notice         : '加载中...',
            }
        },
        watch: {
            '$store.state.siteConfig.waterData'(data) {

                this.waterData = data;
                this.queryWaterAlarm();
                console.log("水站："+this.waterData);
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
                return transValue ? transValue : "-";
            },
        },
        mounted(){
            // 加载数据详情
            this.queryWaterAlarm();
        },
        created() {
        },
        methods:{
            handleRemove(file, fileList) {
                this.imageUrl = null;
                this.hideUpload = fileList.length >= 1;
            },
            handleChange(file, fileList) {
                this.imageUrl = file.url;
                this.hideUpload = fileList.length >= 1;
            },
            beforeAvatarUpload(file) {
                const isImage = file.type === 'image/jpg'||'image/jpeg'||'image/gif'||'image/png'||'image/json'
                                            ||'image/JPG'||'image/JPEG'||'image/GIF'||'image/PBG'||'image/JSON';
                const isLt29M = file.size / 1024 / 1024 < 29;

                if (!isImage) {
                  this.global_.showToastErrmsg('上传文件只能是图片格式!');
                }
                if (!isLt29M) {
                  this.global_.showToastErrmsg('上传文件大小不能超过 2MB!');
                }
                return isImage && isLt29M;
            },
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
            /* 
             *报警详情
             */
            detailAlarmInfo(id){
                try{
                    this.$fetch({
                        url   : "/Web/Additional/get_alarm_history_detail?action=get",
                        method: "get",
                        data  : {
                                    id : id,

                                },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.alarmInfo = jsonData.data;
                            this.alarmDetailVisible = true;
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    }).finally(() => {

                    });
                }catch(e){
                    console.log("detailAlarmInfo: "+e);
                };
            },
            /* 
             *确认处理
             */
            confirm(alarmInfo){
                this.alarmTitle             = alarmInfo.alarm_reason;
                this.alarm_id               = alarmInfo.id;
                this.alarmDialogVisible     = true;
                this.imageUrl               = "";
                this.alarmDetail            = "";
            },
            closeDialog(){
              this.clearAlarmInfo();
            },
            clearAlarmInfo(){
                this.alarmTitle = null;
                this.alarm_id = 0;
                this.alarmDialogVisible = false;
                if(this.hideUpload){
                    this.imageUrl = null;
                    this.$refs.upload.clearFiles();
                    this.hideUpload = false;
                }
            },
            getProcessor(item){
                if(item.process_time && item.processor){
                    return item.processor;
                }
            },
            //报警处理
            processingAlarm() {
                this.$loading.show("处理中");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/alarm_processing?action=post',
                        method: "post",
                        data: {
                            alarm_id            : this.alarm_id,
                            alarm_image         : this.imageUrl,//图片url
                            process_detail      : this.alarmDetail,//处理详情
                        }
                    }).then(res => {
                        let json = res.data;
                        if(json.result == 'success'){
                            this.global_.showToastErrmsg('处理成功');
                            this.queryWaterAlarm();
                        }else{
                            this.global_.showToastErrmsg(json.errmsg,"处理失败");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                        this.clearAlarmInfo();
                    })
                }catch(e){
                    this.$loading.hide();
                    this.clearAlarmInfo();
                    this.global_.showToastErrmsg('处理失败');
                    console.log("processingAlarm: "+e);
                };
            },
            /**
             * [查询报警信息]
             * @return {[type]} [description]
             */
            queryWaterAlarm() {
                try{
                    if(!this.activeID){
                        this.global_.showToastErrmsg("无水线信息");
                        return;
                    }

                    this.$loading.show("请稍等");

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
                                this.waterAlarmData     = [];
                                this.currentPage        = 1;
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
                this.currentPage        = 1;
                this.waterAlarmData     = [];
                this.sectorColors       = [];
                this.sectorDatas        = [];
                this.typeDatas          = [];
            },
        },
        beforeDestroy(){
            this.$loading.hide();
        },
    }
</script>

<style lang="less" scope>
.hide .el-upload--picture-card {
    display: none;
}
</style>
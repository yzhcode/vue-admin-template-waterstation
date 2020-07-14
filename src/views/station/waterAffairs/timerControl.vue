<template>
    <div class="timerControlMain">
        <el-button class="mb-15" type="primary" @click="timerManage()">添加定时</el-button>
        <p class="emptyItem" v-show="showTimerList.length == 0">
            暂无数据
        </p>
        <el-table :data="showTimerList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" v-show="showTimerList.length > 0">
          <el-table-column
            type="index"
            min-width="10%"
            align="center">
          </el-table-column>

          <el-table-column
            label="时间"
            min-width="15%">
            <template slot-scope="scope">
              {{global_.getTimeByFilter(scope.row.time)}}
            </template>
          </el-table-column>

          <el-table-column
            label="规则描述"
            min-width="35%"
            prop="desc">
          </el-table-column>

          <el-table-column
            label="状态"
            min-width="20%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.status" @change="modifyTimerStatus(scope.$index, scope.row.status)">
                <el-option value="1" label="启用"></el-option>
                <el-option value="0" label="禁用"></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            min-width="20%">
            <template slot-scope="scope">
              <el-button type="primary" @click="timerManage(scope.$index)">编辑</el-button>
              <el-button type="danger" @click="sureTimerDelete(scope.$index)">删除</el-button>
            </template>
          </el-table-column>

        </el-table>

        <el-pagination v-show="showTimerList.length > 0"
            @current-change="handleCurrentChange"
            layout="total, prev, pager, next"
            :total="timerList.length">
        </el-pagination>

        <!-- 定时器配置 -->
        <el-dialog :title="timerManageTitle" :visible.sync="dialogTableVisible" width="500px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="时间" required>
                    <el-date-picker
                        v-model="time"
                        type="datetime"
                        placeholder="起始时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="规则描述" required>
                    <el-input type="textarea" v-model.trim="desc"></el-input>
                </el-form-item>

                <el-form-item label="状态">
                    <el-select v-model="timerStatus">
                    <el-option label="启用" value="1"></el-option>
                    <el-option label="禁用" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 删除确认框 -->
        <el-dialog title="提示" :visible.sync="deleteTimerDialogVisible" width="30%">
            <span>确定要删除吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteTimerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteTimer()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogTableVisible   :false,
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                timerList            : [],//定时器列表
                showTimerList        : [],//显示当前页的列表
                timerManageFlag      : "add",
                timerManageTitle     : "添加定时",
                time                 : new Date(),
                desc                 :"",
                timerStatus          : "1",
                editIndex            : 0,
                time                 : '',
                deleteTimerDialogVisible : false,
                deleteTimerIndex     : 0,
            }
        },
        components:{
        },
        watch:{
        },
        mounted(){
            //获取定时器列表
            this.getTimerList();
        },
        methods:{
            /**
             * [点击分页事件]
             * @param  {[type]} val [第几页]
             */
            handleCurrentChange(val){
                this.currentPage = val;
                let tmpSliceNumber = (this.currentPage - 1) * this.itemsOnPage;
                this.showTimerList = this.timerList.slice(tmpSliceNumber, (tmpSliceNumber + this.itemsOnPage));
            },
            /**
             * [获取定时器列表]
             */
            getTimerList(){
                let dataStr   = window.localStorage.getItem("localTimeListData");
                var localData = JSON.parse(dataStr);
                if (localData == null || localData.length == 0) {
                    // 默认数据
                    var defaultData = [{"time":"2020-05-01 08:00:00", "desc":"08:00开启水压检测", "status":"1"},
                                       {"time":"2020-05-01 08:15:00", "desc":"08:15开启PH检测", "status":"1"},
                                       {"time":"2020-05-02 08:30:00", "desc":"08:30开启浊度检测", "status":"0"},
                                       {"time":"2020-05-02 09:00:00", "desc":"09:00开启余氯检测", "status":"1"}];
                    localData = defaultData;
                }
                this.timerList = localData;
                this.refreshLocalData(this.timerList);
            },
            /**
             * [修改本地数据]
             * @param  {[type]} tmpData [数据源]
             */
            refreshLocalData(tmpData) {
                if(tmpData.length == 0){
                    this.queryDataInfo = "无数据项";
                }
                let dataStr = JSON.stringify(tmpData);
                localStorage.setItem("localTimeListData", dataStr);

                let tmpSliceNumber = (this.currentPage - 1) * this.itemsOnPage;
                this.showTimerList = this.timerList.slice(tmpSliceNumber, (tmpSliceNumber + this.itemsOnPage));
            },
            /**
             * [添加/修改 定时器]
             * @param  {[type]} index [编辑那一行的index]
             */
            timerManage(index){
                if ("undefined" == typeof index) {
                    this.timerManageTitle    = "添加定时";
                    this.timerManageFlag     = "add";
                    this.time                = "";
                    this.desc                = "";
                    this.timerStatus         = "1";
                } else {
                    this.editIndex = (this.currentPage - 1) * this.itemsOnPage + index;
                    let transData = this.timerList[this.editIndex];
                    this.timerManageTitle    = "修改定时";
                    this.timerManageFlag     = "modify";
                    this.time                = transData.time;
                    this.desc                = transData.desc;
                    this.timerStatus         = transData.status;
                }
                this.dialogTableVisible=true;
            },
            /**
             * [确定删除弹出框]
             * @param  {[type]} index [删除那一行的index]
             */
            sureTimerDelete(index){
                this.deleteTimerDialogVisible = true;
                this.deleteTimerIndex = (this.currentPage - 1) * this.itemsOnPage + index;
            },
            /**
             * [删除定时器]
             */
            deleteTimer(){
                this.deleteTimerDialogVisible = false;
                let transData = this.timerList[this.deleteTimerIndex];
                this.timerList.splice(this.deleteTimerIndex, 1);
                if ((this.deleteTimerIndex % this.itemsOnPage == 0) && (this.showTimerList.length == 1)) {
                    if (this.currentPage > 1) {
                        this.currentPage -= 1;
                    }
                }
                this.refreshLocalData(this.timerList);
            },
            /**
             * [保存定时器设置]
             */
            onSubmit(){
                if(!this.time){
                    this.$toast("请填写时间");
                    return;
                }
                if(!this.desc && this.timerManageFlag=="add"){
                    this.$toast("请填写规则描述");
                    return;
                }
                this.timerManageSaveCallback();
            },
            /**
             * [保存定时器回调函数]
             */
            timerManageSaveCallback(){
                this.dialogTableVisible = false;
                // 添加
                var tempTime = '';
                if (typeof this.time == 'string') {
                  tempTime = this.time;
                } else {
                  tempTime = this.global_.dateformatToString(this.time);
                }
                if(this.timerManageFlag=="add"){
                    let timer = {"time":tempTime, "desc":this.desc, "status":this.timerStatus};
                    this.timerList.push(timer);
                }else{
                    // 修改
                    let timer = {"time":tempTime, "desc":this.desc, "status":this.timerStatus};
                    this.timerList.splice(this.editIndex, 1, timer);
                }

                this.$toast("保存成功");
                this.refreshLocalData(this.timerList);
            },
            /**
             * [启用/禁用定时器]
             * @param  {[type]} index      [操作那一行的index]
             * @param  {[type]} transValue [编辑后的新值]
             */
            modifyTimerStatus(index,transValue){
                let modifyIndex = (this.currentPage - 1) * this.itemsOnPage + index;
                let timer = this.timerList[modifyIndex];
                timer.status = transValue;
                this.timerList.splice(modifyIndex, 1, timer);
                this.$toast("保存成功");
                this.refreshLocalData(this.timerList);
            },
        }
    }
</script>

<style scope>
</style>
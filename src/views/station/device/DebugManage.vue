<!-- 云盒子调试页面
     @auther : 李凌云
     @modify-time 2020年6月17日 15:22:09 -->
<template>
    <div class="plcManageMain">
        <el-button class="mb-15 ml-15" title="上一页" icon="el-icon-arrow-left" circle @click="goback()"></el-button>
        <el-row>
            <el-col :lg="8" :md="10" :sm="14" :xs="24">
            <el-card class="card_item_out">
                <div slot="header" class="clearfix">
                    <span>远程配置</span>
                </div>
                <div class="card_in_flex">
                    <el-button class="width_98" type="primary" @click="sureReOpenDialog()">远程重启</el-button>
                    <el-form class="mt-15" ref="form" label-width="105px">
                        <el-form-item label="自动重启" required>
                            <el-select v-model="autoReboot" placeholder="请选择">
                                 <el-option
                                   v-for="item in autoOptions"
                                   :key="item.value"
                                   :label="item.label"
                                   :value="item.value">
                                 </el-option>
                            </el-select>
                         </el-form-item>

                        <el-form-item :class="[autoReboot==1?'show':'hide']" label="重启时间点" required>
                            <el-time-picker
                                v-model="RebootTime"
                                :picker-options="{
                                  selectableRange: '00:00:01 - 23:59:59'
                                }"
                                format="HH:mm"
                                value-format="HH:mm"
                                placeholder="任意时间点">
                          </el-time-picker>
                        </el-form-item>

                        <el-form-item :class="[autoReboot==1?'show':'hide']" label="重启周期" required>
                            <el-input v-model="RebootRepeat" type="text" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))" maxlength="3" placeholder="如3 表示每3天执行一次"></el-input>
                        </el-form-item>
                    </el-form>
                      
                   <el-button class="mt-15 width_98" type="primary" @click="autoRebootSet()">保存配置</el-button>
                </div>
                    
                </el-card>
            </el-col>

            <el-col :lg="8" :md="10" :sm="14" :xs="24">
                <el-card class="card_item_out">
                    <div slot="header" class="clearfix">
                        <span>服务器配置</span>
                    </div>
                    <div class="card_in_flex">
                       <el-form class="margin-top" ref="form" label-width="115px">
                            <el-form-item label="服务器配置" required>
                                <el-select v-model="serviceType" placeholder="请选择">
                                     <el-option
                                       v-for="item in serviceTypes"
                                       :key="item.value"
                                       :label="item.label"
                                       :value="item.value">
                                     </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item :class="[serviceType != 3?'show':'hide']" :label="showServieTips()" required>
                                <el-input v-model.trim="serviceDomain"></el-input>
                            </el-form-item>

                            <el-form-item :class="[serviceType != 3?'show':'hide']" label="端口" required>
                                <el-input v-model.trim="servicePort" placeholder="服务器端口"></el-input>
                            </el-form-item>
                        </el-form>
                        <el-button class="mt-15 width_98" type="primary" @click="serviceSet()">保存配置</el-button>
                    </div>
                </el-card>
            </el-col>

            <el-col :lg="8" :md="10" :sm="14" :xs="24">
                <el-card class="card_item_out">
                    <div slot="header" class="clearfix">
                        <span>远程调试配置</span>
                    </div>
                    <div class="card_in_flex">
                       <el-form class="mt-15" ref="form" label-width="95px">
                            <el-form-item label="telnet开关" required>
                                <el-tooltip :content="telnetStatus =='1' ?'开启':'关闭'" placement="top">
                                    <el-switch
                                        v-model="telnetStatus"
                                        active-color="#13ce66"
                                        inactive-color="#9D9D9D"
                                        active-value='1'
                                        @change="telnetOnOff()"
                                        inactive-value='0'>
                                    </el-switch>
                                </el-tooltip>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row class="mt-15">
            <el-col :lg="24" :md="24" :sm="24" :xs="24">
                <el-card class="mt-15 card_item_out">
                    <div slot="header" class="clearfix">
                         <span>日志系统</span>
                    </div>
                    <div>
                       <el-select v-model="curLogType" placeholder="请选择类型">
                            <el-option
                              v-for="item in LogTypes"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                            </el-option>
                        </el-select>
                        <el-button class="ml-15" type="primary" @click="queryLogList()">查询日志</el-button>
                        <el-button class="ml-15" type="primary" @click="updateLogList()">同步日志</el-button>
                        <div class="card_in_flex">
                            <el-table v-show="curPageList.length > 0" :data="curPageList" border stripe :header-cell-style="{color:'#100'}"  class="mt-15">
                                <el-table-column
                                    type="index"
                                    min-width="5%"
                                    align="center"
                                    :index="indexMethod"
                                 >
                                </el-table-column>
                                <el-table-column
                                     label="日志时间"
                                     min-width="25%">
                                     <template slot-scope="scope" >
                                         {{scope.row.time  | nullValueFormat}}
                                     </template>
                                </el-table-column>
                                <el-table-column
                                     label="名称"
                                     min-width="55%">
                                     <template slot-scope="scope" >
                                         {{splitName(scope.row.url)  | nullValueFormat}}
                                     </template>
                                </el-table-column>
                                <el-table-column
                                     label="操作"
                                     min-width="15%">
                                     <template slot-scope="scope" >
                                        <span class="a-btn" @click="downloadFile(scope.row.url)">下载</span>
                                     </template>
                                </el-table-column>
               
                            </el-table>
                             <!-- <div id="deviceManagePage" class="paginationManage"></div> -->
                            <el-pagination v-show="curPageList.length > 0"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="currentPage"
                                :total="LogList.length"
                                layout="total,  prev, pager, next">
                            </el-pagination>
                            <p class="log_list_empty" v-show="curPageList.length==0">
                                {{empty_notice}}
                            </p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 删除重启框 -->
        <el-dialog title="提示" :visible.sync="reOpenDialogVisible" width="30%">
            <span>确定要重启吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="reOpenDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="remoteReboot()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- <p class="emptyItem" v-show="LogList.length==0">
            {{empty_notice}}
        </p> -->
    </div>
</template>
<script>
    export default {
        data(){
            return{
                reOpenDialogVisible : false,
                boxSn        : this.$route.query.bsn,
                LogTypeList  : [],
                autoReboot   : 0,
                autoOptions  : [{label:"开启",value:1},{label:"关闭",value:0}],
                RebootTime   : new Date(),
                RebootRepeat : "0",
                serviceDomain: "",
                servicePort  : "",
                telnetStatus : '0',
                empty_notice : "请点击查询",
                serviceType  : 3,
                serviceTypes : [{label:"自定义域名",value:1},{label:"自定义IP",value:2},{label:"默认",value:3}],

                curLogType   : "plc_gw",
                LogTypes     : [{label:"PLC日志",value:"plc_gw"},{label:"4G连接日志",value:"monet"},{label:"设备监控日志",value:"device_monitor"}],
                LogList      : [],
                curPageList  : [],
                currentPage  : 1,
                itemsOnPage  : 10,
                refresh_flag : false,
                last_Time    : "",
            }
        },
        components:{
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
        watch:{
            
        },
        mounted(){
            // DOM操作
            this.bindDom();
            // 获取设备的调试信息
            this.getBoxDebugInfo();
        },
        beforeDestroy(){
            this.$loading.hide();
            this.clear();
        },
        methods:{
            bindDom() {
                
            },
            goback(){
                this.$router.back(-1);
            },
            indexMethod(index) {
                return (this.currentPage-1)*this.itemsOnPage+index+1;
            },
            handleSizeChange(val) {
                this.itemsOnPage = val;
                this.getData();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getData();
            },
            getData() {
                let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
                this.curPageList = this.LogList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            showServieTips(){
                if (this.serviceType == 1) {
                    return "服务器域名";
                } else if (this.serviceType == 2) {
                    return "服务器IP地址"
                }
            },
            getBoxDebugInfo(){
                this.$loading.show('请稍等');
                
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_one?action=get',
                        method : "get",
                        data   :{
                            sn          : this.boxSn
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.telnetStatus  = ''+jsonData.data.remote_telnet;
                            this.serviceType   = jsonData.data.server_type;
                            this.serviceDomain = jsonData.data.server_addr;
                            this.servicePort   = jsonData.data.server_port;

                            this.autoReboot    = jsonData.data.reboot_auto_enable;
                            this.RebootTime    = jsonData.data.reboot_auto_time;
                            this.RebootRepeat  = jsonData.data.reboot_auto_period;

                            this.RebootTime    = parseInt(this.RebootTime / 60) +":" +this.RebootTime % 60;
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                        if(this.serviceType == null || parseInt(this.serviceType) <= 0 || parseInt(this.serviceType) > 3){
                            this.serviceType                = 3;
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            /**
             * [服务器配置接口]
             * @return {[type]} [description]
             */
            serviceSet(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_server?action=post',
                        method : "post",
                        data   :{
                            sn          : this.boxSn,
                            server_type : this.serviceType,
                            server_addr : this.serviceDomain,
                            server_port : this.servicePort
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("操作成功");
                            this.getBoxDebugInfo();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            sureReOpenDialog(index){
                this.reOpenDialogVisible = true;
            },
            /**
            *  [远程重启]
            */
            remoteReboot(){
                this.$loading.show("请稍等");
                this.reOpenDialogVisible = false;
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_reboot?action=post',
                        method : "post",
                        data   : {
                            sn  : this.boxSn,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("操作成功");
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            /**
            *  [远程重启配置]
            */
            autoRebootSet(){
                this.$loading.show("请稍等");
                var time = 0;
                if (this.RebootTime) {
                    let tempTime = this.RebootTime.toString().split(":");
                    if (tempTime.length > 1) {
                        time = parseInt(tempTime[0]) * 60 + parseInt(tempTime[1]);
                    }
                }
                let period = this.RebootRepeat ? this.RebootRepeat : 1;
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_reboot_auto?action=post',
                        method : "post",
                        data   : {
                            sn                 : this.boxSn,
                            reboot_auto_enable : this.autoReboot,
                            reboot_auto_time   : time,
                            reboot_auto_period : period
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("操作成功");
                            this.getBoxDebugInfo();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            /**
            *  [远程telnet开关]
            */
            telnetOnOff(){
                
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_telnet?action=post',
                        method : "post",
                        data   : {
                            sn      : this.boxSn,
                            enable  : this.telnetStatus
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("操作成功");
                            this.getBoxDebugInfo();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            testReadText(transFile){
               
            },
            queryLogList(){
                this.$loading.show("请稍等");

                this.empty_notice = "加载中...";
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_log?action=get',
                        method : "get",
                        data   : {
                            sn      : this.boxSn,
                            type    : this.curLogType
                        }
                    }).then(res => {
                        this.currentPage = 1;
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.LogList = jsonData.data;
                            let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
                            this.curPageList = this.LogList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
                            if (this.refresh_flag) {
                                this.refresh_flag = false;
                                this.clear();
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.empty_notice = "暂无数据";
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                };
            },
            /**
            * [同步日志]
            */
            updateLogList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url    : '/Web/WaterAffairs/device_log_upload?action=post',
                        method : "post",
                        data   : {
                            sn      : this.boxSn,
                            type    : this.curLogType
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.refresh_flag = true;
                            this.dataRefreh();
                        }else{
                            this.$loading.hide();
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                    });
                }catch(e){
                };
            },
            /**
            *  [下载文件]
            */
            downloadFile(url){
                let tempUrl = "/"+url;
                let encode = encodeURI(tempUrl);
                window.open(encodeURI(tempUrl));
            },
            splitName(path) {
                let nameGroup = path.split("/");
                return nameGroup[nameGroup.length-1];
            },
            // 定时刷新数据函数
            dataRefreh() {
              // 计时器正在进行中，退出函数
              if (this.intervalId != null) {
                return;
              }
              // 计时器为空，操作
              this.intervalId = setInterval(() => {
                if (this.refresh_flag) {
                    this.queryLogList();
                }
              }, 5000);
            }, 
            // 停止定时器
            clear() {
              clearInterval(this.intervalId); //清除计时器
              this.intervalId = null; //设置为null
            },
        }
    }
</script>

<style scope>
.card_in_flex{
    display: flex;
    flex-direction: column;
    height: 300px;
    /*align-items: center;*/
}
.card_item_out{
    margin: 0px 5px;
    flex-direction: column;
    display: flex;
    flex-wrap: wrap;
    border-radius: 8px;  
    overflow: hidden;
}
.width_98{
    width: 104px;
}
.log_list_empty{
    width: 100%;
    height: 3rem;
    text-align: center;
    margin-top: 42px;
    color: #757D88;
    font-size: 20px;
}
.hide{
    visibility: hidden;
}
.show{
    visibility: visible;
}
.margin-top{
    margin-top: 54px;
}

</style>
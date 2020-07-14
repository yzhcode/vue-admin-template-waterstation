<template>
    <div class="settingMain">
        <!-- <el-button class="btn-primary mb-15" type="primary"  @click="editmonitor()">添加变量</el-button> -->
        <el-table v-show="monitorConfigList.length > 0" :data="monitorConfigList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
                <el-table-column
                   type="index"
                   min-width="5%"
                   align="center"
                   :index="indexMethod"
                >
                </el-table-column>
               <el-table-column
                    label="变量名称"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.describe  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="地址类型"
                    min-width="8%"
                    property="addr_type_name">
               </el-table-column>
               <el-table-column
                    label="数据类型"
                    min-width="8%"
                    property="data_type_name">
               </el-table-column>
               <el-table-column
                    label="读写类型"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.is_config=='1'?"可写":"只读"  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="变量单位"
                    min-width="8%">
                    <template slot-scope="scope">
                        {{scope.row.unit  | nullValueFormat}}
                    </template>
               </el-table-column>
               <!-- <el-table-column
                    label="创建时间"
                    min-width="13%">
                    <template slot-scope="scope">
                        {{global_.getTimeByFilter(scope.row.c_time) | nullValueFormat}}
                    </template>
               </el-table-column> -->
           </el-table>
        <el-pagination
            v-show="monitorConfigList.length > 0"
            @current-change="handleCurrentChange"
            layout="total, prev, pager, next"
            :total="monitorTotalList.length">
        </el-pagination>

        <p class="emptyItem" v-show="monitorConfigList.length==0">
            {{empty_notice}}
        </p>
       

        <!-- 添加/编辑检测配置 弹出框HTML代码 -->
        <el-dialog :title="monitorTitle" :visible.sync="dialogAddBoxVisible" width="680px">
            <el-form ref="form" label-width="85px">
                <el-form-item label="监测点" required>
                    <el-select v-model="monitorWorkPartId" :disabled="monitorFlag=='modify'">
                        <el-option v-for="item in monitorList" :label="item.work_part_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="变量名称" required>
                    <el-input v-model.trim="monitorName" :disabled="monitorFlag=='modify'"></el-input>
                </el-form-item>

                <el-form-item label="变量分组" required>
                    <el-select v-model="monitorGroupId" :disabled="monitorFlag=='modify'">
                        <el-option label="未分组" value='0'></el-option>
                        <el-option v-for="item in groupList" :label="item.group_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="变量描述" required>
                    <el-input type="textarea" v-model.trim="monitordesc" :disabled="monitorFlag=='modify'"></el-input>
                </el-form-item>

                <el-form-item label="地址类型" required>
                    <el-select v-model="monitorAddrId" :disabled="monitorFlag=='modify'">
                        <el-option label="未分组" value="0"></el-option>
                        <el-option v-for="item in mAddrTypeList" :label="item.type_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="数据类型" required>
                    <el-select v-model="monitorDataId" :disabled="monitorFlag=='modify'&& monitorAddrId !='0'">
                        <el-option v-for="item in mDataByAddrList" :label="item.type_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="变量单位" required>
                    <el-input v-model.trim="monitorUnit" :disabled="monitorFlag=='modify'"></el-input>
                </el-form-item>

                <el-form-item label="是否启用" required>
                    <el-select v-model="monitorEnable" :disabled="monitorFlag=='modify'">
                        <el-option label="启用" value="1"></el-option>
                        <el-option label="禁用" value="0"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="读写类型" required>
                    <el-select v-model="monitorConfig" :disabled="monitorFlag=='modify'">
                        <el-option label="只读" value="0"></el-option>
                        <el-option label="可写" value="1"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="配置列表" v-show="monitorConfig == '1'">
                    <el-button plain @click="addRule()" v-show="monitorFlag!='modify'">添加</el-button>
                    <div v-for="(items, index) in monitorConfigEnum">
                        <el-form :inline="true" class="demo-form-inline mt-15">
                            <el-form-item label="值" required>
                                <el-input v-model.trim="items.value" placeholder="值" :disabled="monitorFlag=='modify'"></el-input>
                            </el-form-item>
                            <el-form-item label="描述" required>
                                <el-input v-model.trim="items.desc" placeholder="描述" :disabled="monitorFlag=='modify'"></el-input>
                            </el-form-item>
                                <el-form-item>
                                <el-button plain @click="decRule(index)" icon="el-icon-delete"></el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="monitorSave()" v-show="monitorFlag!='modify'">立即添加</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogAddBoxVisible : false,
                queryDataInfo     :"查询中",
                monitorList       :[],
                monitorConfigList :[],
                monitorTotalList  :[],
                addrDataTypeList  :[],
                currentPage       :1,
                itemsOnPage       :10,
                index             :0,

                mDataByAddrList   :[],
                mAddrTypeList     :[],
                groupList         :[],

                monitorTitle      :"",
                monitorId         :"",
                monitorGroupId    :"0",
                monitordesc       :"",
                monitorWorkPartId :"",
                monitorUnit       :"",
                monitorConfig     :"1",
                monitorEnable     :"1",
                monitorName       :"",
                monitorConfigEnum :[{"value":"","desc":""}],
                monitorAddrId     :"0",
                monitorDataId     :"",
                monitorFlag       :"add",
                empty_notice      :"加载中...",
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
                return transValue ? transValue : "--";
            },
        },
        watch:{
            monitorAddrId(newid, oldid) {
                this.splitDataTypeListByAddrId(newid);
            }
        },
        mounted(){
            this.$nextTick(()=>{
                // 初始化滚动容器
                this.initPerfectScrollbar();
            });
            // DOM操作
            this.bindDom();
            // 获取监测点信息
            this.getMonitorList();
            // 获取检测参数列表
            this.getMonitorParamsList();
            //获取地址类型和数据类型关联列表
            this.getAddrDataTypeList();
            //获取分组列表
            this.getGroupList();
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        methods:{
            bindDom() {
                $('#wholeSettingModal').on('show.bs.modal', () => {
                    // 重置滚动条位置
                    $("#configContainer").scrollTop(0);
                });
                $('#wholeSettingModal').on('hidden.bs.modal', () => {
                    $("#configContainer").scrollTop(0);
                });
            },
            indexMethod(index) {
                return (this.currentPage-1)*this.itemsOnPage+index+1;
            },
            getMonitorList(){
                try{
                    this.$fetch({
                        url: '/Web/Config/monitor_location_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.filterMonitorData(jsonData.data);
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    });
                }catch(e){
                    console.log("getMonitorList: "+e);
                };
            },
            getMonitorParamsList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/Config/monitor_config_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.monitorTotalList = jsonData.data;
                            //根据ID 升序排序
                            this.monitorTotalList.sort(function(a, b){return a.id - b.id}); 
                            this.handleCurrentChange(this.currentPage);
                            if (jsonData.data.length == 0) {
                                this.empty_notice = "暂无数据";
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    console.log("getMonitorParamsList: "+e);
                };
            },
            getAddrDataTypeList(){
                try{
                    this.$fetch({
                        url: '/Web/Config/addrdata_type_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.addrDataTypeList = jsonData.data;
                            this.splitAddrTypeList(jsonData.data);
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    });
                }catch(e){
                    console.log("getMonitorParamsList: "+e);
                };
            },
            getGroupList(){
                try{
                    this.$fetch({
                        url    : 'Web/Config/monitor_group_list?action=get',
                        method : 'get'
                    }).then(res=>{
                        let jsonData = res.data;
                        if (jsonData.result == "success") {
                            this.groupList = jsonData.data;
                        } else {
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    });
                }catch(e){
                        console.log("getGroupList :"+ e);
                    }
            },
            editmonitor(transData){
                if (!transData) {
                    this.monitorTitle      = "添加变量";
                    this.monitorFlag       = "add";
                    this.monitorId         = "";
                    this.monitorGroupId    = "0";
                    this.monitordesc       = "";
                    this.monitorName       = "";
                    this.monitorWorkPartId = "";
                    this.monitorUnit       = "";
                    this.monitorConfig     = "0";
                    this.monitorEnable     = "1";
                    this.monitorConfigEnum = [{"value":"","desc":""}];
                    this.monitorAddrId     = "0";
                    this.monitorDataId     = "";
                } else {
                    this.monitorTitle      = "查看变量详情";
                    this.monitorFlag       = "modify";
                    this.monitorId         = transData.id;
                    this.monitorGroupId    = transData.group_id;
                    this.monitordesc       = transData.desc_info;
                    this.monitorName       = transData.describe;
                    this.monitorWorkPartId = transData.work_part_id;
                    this.monitorUnit       = transData.unit;
                    this.monitorConfig     = transData.is_config;
                    this.monitorEnable     = transData.enable;
                    this.monitorConfigEnum = [].concat(transData.config_enum);
                    this.monitorAddrId     = transData.addr_type_id;
                    this.monitorDataId     = transData.data_type_id;
                }
                this.dialogAddBoxVisible = true;
            },
            modifyMonitorStatus(transData,enable) {
                this.monitorFlag   = "modify";
                this.monitorId     = transData.id;
                this.monitorEnable = enable;
                this.monitorSave();
            },
            filterMonitorData(transList) {
                this.monitorList = [];
                for (var i = 0; i < transList.length; i++) {
                    if(transList[i].enable == "1") {
                        this.monitorList.push(transList[i]);
                    }
                }
            },
            handleCurrentChange(val){
                let tmpSliceNumber = (val-1)*this.itemsOnPage;
                this.currentPage = val;
                this.monitorConfigList = this.monitorTotalList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            /**
             * [分页]
             * @param  {[type]} tmpData [description]
             * @return {[type]}         [description]
             */
            createPage(tmpData) {
                if(tmpData.length == 0){
                    this.queryDataInfo = "无数据项";
                }
                let _t = this;

                $("#monitorPage").pagination({
                    items      : tmpData.length,
                    itemsOnPage: _t.itemsOnPage,
                    onPageClick:function(pageNumber,index,basicNumber,event){
                        _t.itemsOnPage       = basicNumber;//分页基数修改后，重置
                        let tmpSliceNumber   = (pageNumber-1)*basicNumber;
                        _t.currentPage       = pageNumber;
                        _t.monitorConfigList = tmpData.slice(tmpSliceNumber,(tmpSliceNumber+basicNumber));
                    },
                    onInit:function(basicNumber){
                        _t.currentPage        = 1;
                        _t.monitorConfigList  = tmpData.slice(0,basicNumber);
                    }
                });
            },
            /**
             * [保存配置]
             * @return {[type]} [description]
             */
            monitorSave() {
                let _configer = {
                    url :"",
                    data:""
                };

                if (this.monitorFlag == "add") {
                    if (!this.checkParams()) {
                        return;
                    }

                    _configer.url  = "/Web/Config/monitor_config_create?action=post";
                    _configer.data = {
                        work_part_id      :this.monitorWorkPartId,
                        describe          :this.monitorName,
                        unit              :this.monitorUnit,
                        addr_type_id      :this.monitorAddrId,
                        data_type_id      :this.monitorDataId,
                        desc_info         :this.monitordesc,
                        enable            :this.monitorEnable,
                        is_config         :this.monitorConfig,
                        config_enum       :JSON.stringify(this.monitorConfigEnum),
                        group_id          :this.monitorGroupId,
                    }
                } else {
                    _configer.url  = "/Web/Config/monitor_config_enable?action=post";
                    _configer.data = {
                        id     :this.monitorId,
                        enable :this.monitorEnable
                    }
                }
                try{
                    this.$fetch({
                        url   : _configer.url,
                        data  : _configer.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("保存成功");
                            this.dialogAddBoxVisible = false;
                            // 更新数据
                            this.getMonitorParamsList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
                        }
                    });
                }catch(e){
                    console.log("monitorSave: "+e);
                };

            },
            checkParams() {
                if(!this.monitorWorkPartId){
                    this.$toast("请选择监测点");
                    return false;
                }
                if(!this.monitorName){
                    this.$toast("请填写变量名称");
                    return false;
                }
                if(!this.monitorAddrId){
                    this.$toast("请选择地址类型");
                    return false;
                }
                if(!this.monitorDataId){
                    this.$toast("请选择数据类型");
                    return false;
                }

                if(this.monitorConfigEnum.length > 0){
                    let _valueCount = 0,_descCount = 0;
                    for (var i = this.monitorConfigEnum.length - 1; i >= 0; i--) {
                        if(!this.monitorConfigEnum[i]["value"]){
                            _valueCount++;
                        }
                        if(!this.monitorConfigEnum[i]["desc"]){
                            _descCount++;
                        }
                    }
                    if(_valueCount>0){
                        this.$toast("请填写值");
                        return;
                    }
                    if(_descCount>0){
                        this.$toast("请填写描述");
                        return;
                    }
                }
                return true;
            },
            addRule(){
                let _configEnum = {"value":"","desc":""};
                this.monitorConfigEnum.push(_configEnum);
            },
            decRule(transIndex){
                this.monitorConfigEnum.splice(transIndex,1);
            },
            /**
             * [初始化滚动插件]
             * @return {[type]} [description]
             */
            initPerfectScrollbar(command){
                $('#configContainer').perfectScrollbar(command);
            },
            /**
            *[过滤出地址类型ID]
            */
            splitAddrTypeList(transList){
                if (transList.length <= 0) {
                   this.mAddrTypeList = "";
                } else {
                    let length = transList.length;
                    for (var i = 0; i < length; i++) {
                        if(transList[i].pid == 0){//如果PID==0 那么这个就是地址类型ID
                            this.mAddrTypeList.push(transList[i]);
                        }
                    }
                }

            },
            /**
            *[根据上级选项选出的地址类型的ID，查找对应的数据类型的列表]
            */
            splitDataTypeListByAddrId(newDataId) {
                this.mDataByAddrList = [];
                let length = this.addrDataTypeList.length;
                for (var i = 0; i < length; i++) {
                    if (this.addrDataTypeList[i].pid != 0 && this.addrDataTypeList[i].pid == newDataId) {
                        this.mDataByAddrList.push(this.addrDataTypeList[i]);
                    }
                }
            },
            /**
            * 列表显示 根据groupID查找groupName 并返回
            */
            findNameByGroupID(transData) {
                if (this.groupList.length > 0) {
                    let length = this.groupList.length;
                    for (var i = 0; i < length; i++) {
                        if(this.groupList[i].id == transData) {
                            return this.groupList[i].group_name;
                        }
                    }
                }
                return "";
            }
        }
    }
</script>

<style scoped>
    .width500{
        width: 35.714286rem;
    }
    .descWidth{
        width: 150px;
    }
    .modal-body{
        position: relative;
        height: 28.571429rem;
        flex: none;
    }
    .modal-body div.definedForm{
        max-height: 148.571429rem;
    }
    .modal-body div.definedForm div.rule_layout {
        width: 100%;
        display: flex;
        flex-direction: row;
    }
    .modal-body div.definedForm div.rule_layout div{
        display: flex;
        flex-direction: column;
    }
    .modal-body div.definedForm div.rule_layout div.rule_config{
        width: 45%;
        margin: 0 0.714286rem 0 0;
    }
    .modal-body div.definedForm div.rule_layout div.rule_op{
        width: 10%;
        margin: 2.142857rem 0 0 0;
    }
</style>
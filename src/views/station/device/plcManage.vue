<template>
    <div class="plcManageMain">
        <el-button title="上一页" icon="el-icon-arrow-left" circle @click="goback()"></el-button>
        <el-button v-show="!global_.isSupportRole()" type="primary" class="mr-15"  @click="plcManage()">添加PLC</el-button>
        <el-button type="primary" class="mr-15"  @click="plcApplication()">下发配置</el-button>
        <el-button type="primary" class="mr-15" @click="plcexport">PLC配置导出</el-button>
        <el-upload class="inline-block ml-15"
            accept=".json,.JSON"
            ref="upload"
            action="/Web/PLCDevice/import_plc_config?action=post"
            :show-file-list="false"
            :auto-upload="true"
            :data="box_data"
            name="box_config"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :before-upload="beforeAvatarUpload">
            <el-button type="primary">PLC配置导入</el-button>
        </el-upload>

        <el-row class="plcContaner mt-15" v-show="plcList.length > 0">
            <el-col :lg="6" :md="8" :sm="14" :xs="20" class="plcItem" v-for="(item, index) in plcList" :key="item.id">
                <div class="plcLeft">
                    <div class="plcName">{{item.device_name}}</div>
                        <span>{{item.product_name}}</span>
                        <span :class="{'water-c-2':item.is_online=='0'&&item.vpn_enable=='0'}">{{getPlcStatus(item)}}</span>
                    <div class="plcContent">
                        <div>
                            <label>设备 IP：</label> 
                            <span>{{item.plc_ip}}</span>
                        </div>
                        <div>
                            <label v-show="item.vpn_enable!='0'&&item.vpn_remote_ip">编程 IP：</label>
                            <span v-show="item.vpn_enable!='0'&&item.vpn_remote_ip">{{item.vpn_remote_ip}}</span>
                        </div>
                    </div>
                </div>
                <div class="plcRight">
                    <div>
                        <span class="curPoint iconfont icon-change mr-15" title="编辑PLC" @click="plcManage(item)"></span>
                        <span v-show="!global_.isSupportRole()" class="curPoint iconfont icon-del mr-15" title="删除PLC" @click="plcDel(item)"></span>
                        <span class="curPoint iconfont icon-menu-set" title="变量管理" @click="variableManage(item)"></span>
                    </div>
                    
                    <el-tooltip style="margin-top: 32px" content="远程开关" placement="top">
                        <el-switch
                            v-model="item.vpn_enable"
                            @change="plcChangeStatus(item)"
                            active-value="1"
                            inactive-value="0"
                            inactive-text="">
                        </el-switch>
                    </el-tooltip>
                </div>
            </el-col>
        </el-row>    
        <p class="emptyItem" v-show="plcList.length==0">
            {{empty_notice}}
        </p>

        <!-- plc配置 -->
        <el-dialog :title="plcTitle" :visible.sync="dialogPlcManagerVisible" width="480px">
            <el-form ref="form" label-width="120" label-position="top" size="mini" style="margin-top=-20px">
                <el-form-item required>
                    <div class="title color2">基本配置</div>
                </el-form-item>
                <el-form-item label="设备名称" required>
                    <el-input v-model.trim="device_name"></el-input>
                </el-form-item>
                <el-form-item label="设备品牌" required>
                    <el-select v-model="product_name">
                        <el-option v-for="item in product_list" :label="item.name" :value="item.name" :key="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="设备型号" required>
                    <el-select v-model="product_type">
                        <el-option v-for="item in product_list" :label="item.value" :value="item.value" :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="PLC设备IP" required>
                    <el-input v-model.trim="plc_ip"></el-input>
                </el-form-item>
                <el-form-item label="PLC设备端口" required>
                    <el-input v-model.trim="plc_port"></el-input>
                </el-form-item>
                <el-form-item label="说明" required>
                    <el-input v-model.trim="info"></el-input>
                </el-form-item>
                <el-form-item label="详细参数" required>
                    <el-input v-model.trim="paramter"></el-input>
                </el-form-item>
                <el-form-item required>
                    <div class="title color2 mb-15">高级配置</div>
                </el-form-item>
                <el-form-item label="位组包最大寄存器个数" required>
                    <el-input v-model.trim="plc_max_register_bit"></el-input>
                </el-form-item>
                <el-form-item label="字组包最大寄存器个数" required>
                    <el-input v-model.trim="plc_max_register_byte"></el-input>
                </el-form-item>
                <el-form-item label="失败重试次数" required>
                    <el-input v-model.trim="plc_communicate_retry"></el-input>
                </el-form-item>
                <el-form-item label="通讯超时时间（s）" required>
                    <el-input v-model.trim="plc_communicate_timeout"></el-input>
                </el-form-item>
                <el-form-item label="通讯间隔时间（ms）" required>
                    <el-input v-model.trim="plc_communicate_interval"></el-input>
                </el-form-item>
                 <el-form-item label="尝试恢复间隔（s）" required>
                    <el-input v-model.trim="plc_communicate_retry_interval"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="plcSave()">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 变量列表 -->
        <el-dialog title="变量管理" :visible.sync="dialogVarListVisible" width="680px">
            <div class="modal-body">
                <div class="definedForm" id="scrollContainer2">
                    <button class="btn btnSmall btn-primary" type="button"  @click="variableAdd()">添加变量</button>
                    <table class="table-fixed mt-15">
                        <thead>
                            <tr>
                                <th width="10%"></th>
                                <th width="35%">变量名称</th>
                                <th width="35%">报警配置（条）</th>
                                <th width="20%">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="variableList.length > 0" v-for="(item, index) in variableList">
                                <td>{{(currentPage-1)*itemsOnPage+index+1}}</td>
                                <td>{{getVariableName(item.var_item_type_id)}}</td>
                                <td>{{item.alarm_list.length}}</td>
                                <td>
                                    <span class="curPoint iconfont icon-change mr-15" title="编辑变量" @click="variableAdd(item)"></span>
                                    <span class="curPoint iconfont icon-del" title="删除变量" @click="variableDel(item)"></span>
                                </td>
                            </tr>
                            <tr class="noData" v-if="variableList.length==0">
                                <td colspan="4" style="text-align: center;">
                                    {{queryDataInfo}}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </el-dialog>
        
        <!-- 变量管理 -->
        <el-dialog title="变量管理" :visible.sync="dialogVarManagerVisible" width="1080px">
            <div class="modal-body">
                <div class="definedForm" id="scrollContainer3">
                    <div class="containerGroupTitle">
                        <div :class="[{'activeTitle':containerGroupSelected == 0}]" @click="switchContanerGroup(0)">变量配置</div>
                        <div :class="[{'activeTitle':containerGroupSelected == 1}]" @click="switchContanerGroup(1)">报警配置</div>
                    </div>
                    <div class="contanerGroupMain">
                        <div v-show="containerGroupSelected==0">
                            <div>
                                <label><span class="must">*</span>{{" "}}关联变量</label>
                                <select v-model="var_item_type_id" :disabled="variableFlag=='modify'">
                                    <option v-for="(item,index) in ruleList" :value="item.id">{{item.describe}}</option>
                                </select>
                            </div>
                            <div>
                                <label><span class="must">*</span>{{" "}}地址偏移</label>
                                <input type="text" maxlength="12" v-model.trim="addr_offset1"/>
                            </div>

                        </div>
                        <div v-show="containerGroupSelected==1">
                            <button type="button" class="btn btnSmall btn-primary mb-15" @click="alarmAdd()">添加</button>
                            <div class="plcAlarmItem mt-15" v-for="(item, index) in plc_alarm_list">
                                <div class="alarmConfigItem">
                                    <label><span class="must">*</span>{{" "}}报警详情</label>
                                    <input type="text" maxlength="12" v-model.trim="item.alarm_name"/>
                                </div>
                                <div class="alarmConfigItem6">
                                    <label><span class="must">*</span>{{" "}}报警规则</label>
                                    <select v-model="item.alarm_rule">
                                        <option v-for="(item, index) in alarm_rule_list" :value="item.alarm_rule">{{item.name}}</option>
                                    </select>
                                </div>
                                <div class="alarmConfigItem5" v-show="lvalConfig(item.alarm_rule)">
                                    <label><span class="must">*</span>{{" "}}报警值</label>
                                    <input type="text" maxlength="4" v-model.trim="item.alarm_lval"/>
                                </div>
                                <div class="alarmConfigItem5" v-show="hvalConfig(item.alarm_rule)">
                                    <label><span class="must">*</span>{{" "}}报警值</label>
                                    <input type="text" maxlength="4" v-model.trim="item.alarm_hval"/>
                                </div>
                                <div class="alarmConfigItem2">
                                    <label><span class="must">*</span>{{" "}}严重性</label>
                                    <select v-model="item.alarm_level" @change="changeAlarmLevel(item)">
                                        <option v-for="(item, index) in alarm_level_list" :value="item.alarm_level">{{item.name}}</option>
                                    </select>
                                </div>
                                <div class="alarmConfigItem7">
                                    <label style="margin-left: 11px;">配置动作</label>
                                    <div class="alarmConfigItem4" >
                                        <el-checkbox v-model="item.rule_alarm" label="报警"></el-checkbox>
                                        <el-checkbox v-model="item.rule_push" label="推送"></el-checkbox>
                                        <el-checkbox v-model="item.rule_order" label="生成工单"></el-checkbox>
                                    </div>
                                </div>
                                <el-button class="alarmConfigItem3" type="danger" icon="el-icon-delete" circle @click="alarmDel(index)"></el-button>
                                <!-- <div class="alarmConfigItem3">
                                    <el-button type="danger" icon="el-icon-delete" circle @click="alarmDel(index)"></el-button>
                                    <span class="curPoint iconfont icon-del marginT40" @click="alarmDel(index)"></span>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <div class="modal-footer-btn m-t-0" @click="variableSave()">确定</div>
        </el-dialog>

        <div id="variableManageModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle">
            <div class="modal-dialog modal-dialog-centered width800" role="document">
                <div class="modal-content border-0 modal-c-bor ">
                    <div class="modal-header">
                        <h5 class="modal-title">{{variableTitle}}</h5>
                        <button type="button" class="close m-0 p-0" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>

        <!-- 删除plc -->
        <el-dialog title="提示" :visible.sync="deletPlcDialogVisible" width="30%">
            <span>是否删除此PLC</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deletPlcDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="plcDelCallback()">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除变量 -->
        <el-dialog title="提示" :visible.sync="deletVarDialogVisible" width="30%">
            <span>是否删除此变量</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deletVarDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="variableDelCallback()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogVarListVisible       : false,
                dialogVarManagerVisible    : false,
                deletVarDialogVisible      : false,
                deletPlcDialogVisible      : false,
                dialogPlcManagerVisible : false,
                queryDataInfo         : "查询中",
                itemsOnPage           : 10,//分页基数
                currentPage           : 1,//当前页
                bsn                   : this.$route.query.bsn,
                ruleList              : [],//全局环境变量列表
                plcTitle              : "添加PLC",
                variableTitle         : "变量管理",
                plcFlag               : "add",
                variableFlag          : "add",
                containerGroupSelected: 0,//选项卡默认值
                product_list: [
                    {"name":"西门子","value":"Smart"}
                ],
                alarm_rule_list: [
                    {"name":"值等于","alarm_rule":"1"},       //x = lval
                    {"name":"值不等于","alarm_rule":"2"},     //x != lval
                    {"name":"值小于","alarm_rule":"3"},       //x < lval
                    {"name":"值小于等于","alarm_rule":"4"},   //x <= lval
                    {"name":"值大于","alarm_rule":"5"},       //x > hval
                    {"name":"值大于等于","alarm_rule":"6"},   //x >= hval
                ],
                alarm_level_list: [
                    {"name":"一般的","alarm_level":"general"},
                    {"name":"重要的","alarm_level":"important"},
                    {"name":"严重的","alarm_level":"emergency"},
                ],
                plcList                       : [],//当前设备下的plc列表
                /*plc管理*/
                plc_device_id                 : "",//PLC ID
                device_name                   : "",//设备名称
                product_name                  : "西门子",//设备品牌
                product_type                  : "Smart",//设备型号
                plc_ip                        : "",//设备IP
                plc_port                      : "",//设备端口
                info                          : "",//说明
                paramter                      : "",//详细参数
                plc_max_register_bit          : "100",//位组包最大寄存器个数
                plc_max_register_byte         : "100",//字组包最大寄存器个数
                plc_communicate_timeout       : "5",//通讯超时时间
                plc_communicate_interval      : "1000",//通讯间隔时间
                plc_communicate_retry_interval: "2",//尝试恢复间隔
                plc_communicate_retry         : "3",//失败重试次数
                /*变量管理*/
                variableList                  : [],//变量配置-PLC变量列表
                plc_device_variable_id        : "",//变量id
                var_item_type_id              : "",//关联变量
                addr_offset1                  : "",//变量配置-地址偏移1
                /*报警管理*/
                plc_alarm_list                : [],//操作报警列表数据
                refresh_flag                  : true,
                box_data                      :{"box_id": this.$route.query.bsn},
                empty_notice                  : "加载中...",
            }
        },
        components:{
        },
        watch:{
        },
        mounted(){
            this.$nextTick(()=>{
                // 初始化滚动容器
                this.initPerfectScrollbar();
            });
            // DOM操作
            this.bindDom();
            // 获取全局环境变量列表
            this.getRuleList();
            // 获取PLC列表
            this.getPlcList();
            //定时刷新
            this.dataRefreh();
        },
        beforeDestroy(){
            this.$loading.hide();
            this.clear();
        },
        methods:{
            bindDom() {
                $('#variableManageModal').on('hidden.bs.modal', () => {
                    // 重置数据
                    this.plc_alarm_list.length = 0;
                });
            },
            goback(){
                this.$router.back(-1);
            },
            /**
             * [根据全局环境变量ID查询名称]
             * @param  {[type]} transID [description]
             * @return {[type]}         [description]
             */
            getVariableName(transID){
                let _name = "-";
                if(this.ruleList.length == 0){
                    return _name;
                }
                for (var i = this.ruleList.length - 1; i >= 0; i--) {
                    if(transID == this.ruleList[i]["id"]){
                        // 只显示描述
                        // _name = this.ruleList[i]["work_part_name"]+" - "+this.ruleList[i]["describe"];
                         _name = this.ruleList[i]["describe"];
                    }
                }
                return _name;
            },
            /**
             * [获取可配置的规则信息]
             * @return {[type]} [description]
             */
            getRuleList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/Config/monitor_config_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.ruleList = jsonData.data;
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    console.log("getRuleList: "+e);
                };
            },
            /**
             * [查询当前盒子下的PLC]
             * @return {[type]} [description]
             */
            getPlcList(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    this.$fetch({
                        url: '/Web/PLCDevice/plc_device_list',
                        method: "get",
                        data:{
                            action:"get",
                            box_id:this.bsn
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.plcList = jsonData.data;
                        }else{
                            this.$toast(jsonData.errmsg);
                        }
                        if (jsonData.data.length == 0) {
                            this.empty_notice = "暂无数据,请添加PLC";
                        }
                    });
                }catch(e){
                    console.log("getPlcList: "+e);
                };
            },
            /**
             * [添加/修改 PLC]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            plcManage(transData){
                if(!transData){
                    this.plcTitle = "添加PLC";
                    this.plcFlag  = "add";
                    this.plc_device_id                  = "";
                    this.device_name                    = "";
                    this.product_name                   = "西门子";
                    this.product_type                   = "Smart";
                    this.plc_ip                         = "";
                    this.plc_port                       = "102";
                    this.info                           = "";
                    this.paramter                       = "";
                    this.plc_max_register_bit           = "100";
                    this.plc_max_register_byte          = "100";
                    this.plc_communicate_timeout        = "5";
                    this.plc_communicate_interval       = "1000";
                    this.plc_communicate_retry_interval = "2";
                    this.plc_communicate_retry          = "3";
                }else{
                    this.plcTitle = "编辑PLC";
                    this.plcFlag  = "modify";
                    this.plc_device_id                  = transData.id;
                    this.device_name                    = transData.device_name;
                    this.product_name                   = transData.product_name;
                    this.product_type                   = transData.product_type;
                    this.plc_ip                         = transData.plc_ip;
                    this.plc_port                       = transData.plc_port;
                    this.info                           = transData.info;
                    this.paramter                       = transData.paramter;
                    this.plc_max_register_bit           = transData.plc_max_register_bit;
                    this.plc_max_register_byte          = transData.plc_max_register_byte;
                    this.plc_communicate_timeout        = transData.plc_communicate_timeout;
                    this.plc_communicate_interval       = transData.plc_communicate_interval;
                    this.plc_communicate_retry_interval = transData.plc_communicate_retry_interval;
                    this.plc_communicate_retry          = transData.plc_communicate_retry;
                }
                this.dialogPlcManagerVisible = true;
            },
            /**
             * [保存PLC]
             * @return {[type]} [description]
             */
            plcSave(){

                if(!this.device_name){
                    this.$toast("请填写设备名称");
                    return;
                }
                if(!this.product_name){
                    this.$toast("请选择设备品牌");
                    return;
                }
                if(!this.product_type){
                    this.$toast("请选择设备型号");
                    return;
                }
                if(!this.plc_ip){
                    this.$toast("请填写设备IP");
                    return;
                }
                if(!this.plc_port){
                    this.$toast("请填写设备端口");
                    return;
                }
                if(!this.plc_max_register_bit){
                    this.$toast("请填写位组包最大寄存器个数");
                    return;
                }
                if(!this.plc_max_register_byte){
                    this.$toast("请填写字组包最大寄存器个数");
                    return;
                }
                if(!this.plc_communicate_retry){
                    this.$toast("请填写失败重试次数");
                    return;
                }
                if(!this.plc_communicate_timeout){
                    this.$toast("请填写通讯超时时间");
                    return;
                }
                if(!this.plc_communicate_interval){
                    this.$toast("请填写通讯间隔时间");
                    return;
                }
                if(!this.plc_communicate_retry_interval){
                    this.$toast("请填写尝试恢复间隔");
                    return;
                }
                this.plcSaveCallback();
            },
            /**
             * [保存PLC 回调函数]
             * @return {[type]} [description]
             */
            plcSaveCallback(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    let _tmpDataJson = {
                        url: '',
                        data:{
                            box_id                        : this.bsn,
                            device_name                   : this.device_name,//设备名称
                            product_name                  : this.product_name,//设备品牌
                            product_type                  : this.product_type,//设备型号
                            plc_ip                        : this.plc_ip,//设备IP
                            plc_port                      : this.plc_port,//设备端口
                            info                          : this.info,//说明
                            paramter                      : this.paramter,//详细参数
                            plc_max_register_bit          : this.plc_max_register_bit,//位组包最大寄存器个数
                            plc_max_register_byte         : this.plc_max_register_byte,//字组包最大寄存器个数
                            plc_communicate_timeout       : this.plc_communicate_timeout,//通讯超时时间
                            plc_communicate_interval      : this.plc_communicate_interval,//通讯间隔时间
                            plc_communicate_retry_interval: this.plc_communicate_retry_interval,//尝试恢复间隔
                            plc_communicate_retry         : this.plc_communicate_retry,//失败重试次数
                        }
                    };
                    // 添加
                    if(this.plcFlag=="add"){
                        _tmpDataJson.url  = "/Web/PLCDevice/plc_device_add?action=post";
                    }else{
                    // 修改
                        _tmpDataJson.url  = "/Web/PLCDevice/plc_device_change?action=post";
                        _tmpDataJson.data.plc_device_id = this.plc_device_id;
                    }
                    this.$fetch({
                        url   : _tmpDataJson.url,
                        method: "post",
                        data  : _tmpDataJson.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("保存成功");
                            this.dialogPlcManagerVisible = false;
                            // 更新数据
                            this.getPlcList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.global_.showToastErrmsg("保存失败");
                    });
                }catch(e){
                    this.global_.showToastErrmsg("保存失败");
                    console.log("plcSaveCallback: "+e);
                };
            },
            /**
             * [删除PLC]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            plcDel(transData){
                this.plc_device_id = transData.id;
                this.deletPlcDialogVisible = true;
            },
            /**
             * [删除PLC 回调函数]
             * @return {[type]} [description]
             */
            plcDelCallback(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    this.refresh_flag = false;
                    this.$fetch({
                        url   : "/Web/PLCDevice/plc_device_delete?action=post",
                        method: "post",
                        data  : {
                            box_id       : this.bsn,
                            plc_device_id: this.plc_device_id,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("删除成功");
                            this.deletPlcDialogVisible = false;
                            // 更新数据
                            this.getPlcList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                        this.refresh_flag = true;
                    }).finally(() => {
                        this.global_.showToastErrmsg("删除失败");
                    });
                }catch(e){
                    this.global_.showToastErrmsg("删除失败");
                    console.log("plcDelCallback: "+e);
                };
            },
            beforeAvatarUpload(file) {
                const isJson = file.type === 'image/json'||'image/JSON';
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJson) {
                  this.global_.showToastErrmsg('上传文件只能是json类型!');
                }
                if (!isLt2M) {
                  this.global_.showToastErrmsg('上传文件大小不能超过 2MB!');
                }
                return isJson && isLt2M;
            },
            /*
            上传成功
             */
            handleAvatarSuccess(res, file) {
                if(res.result == "success"){
                    this.global_.showToastErrmsg("导入PLC配置成功");
                }else{
                    this.global_.showToastErrmsg(res.errmsg,"");
                }
            },
            /*
            上传失败
             */
            handleAvatarError(err, file) {
                this.global_.showToastErrmsg(err,"导入PLC配置失败");
            },
            /**
             * [导出]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            plcexport(){
                try{
                    this.$fetch({
                        url: '/Web/PLCDevice/export_plc_config?action=get',
                        method: "get",
                        data:{
                            box_id: this.bsn,
                        }
                    }).then(res => {
                        console.log(res.data);
                        let jsonData = res.data;
                        let fileName = this.timeUtil.getCurTime() + '.json';
                        let content = JSON.stringify(jsonData);
                        let downLink = document.createElement('a');
                        downLink.download = fileName;
                        //字符内容转换为blod地址
                        let blob = new Blob([content]);
                        downLink.href = URL.createObjectURL(blob);
                        // 链接插入到页面
                        document.body.appendChild(downLink);
                        downLink.click();
                        // 移除下载链接
                        document.body.removeChild(downLink);
                    }).finally(() => {
                        this.global_.showToastErrmsg("导出PLC配置成功");
                    });
                }catch(e){
                    this.global_.showToastErrmsg("导出PLC配置失败");
                    console.log("plcexport: "+e);
                };
            },
            /**
             * [获取指定PLC的变量列表]
             * @return {[type]} [description]
             */
            getVariableList(){
                try{
                    this.$fetch({
                        url: '/Web/PLCDevice/plc_device_variable_list?action=get',
                        method: "get",
                        data:{
                            plc_device_id: this.plc_device_id
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.variableList = jsonData.data;
                            if(this.variableList.length==0){
                                this.queryDataInfo = "暂无数据";
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    });
                }catch(e){
                    console.log("getVariableList: "+e);
                };
            },
            /**
             * [变量列表 弹出框]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            variableManage(transData){
                this.plc_device_id = transData.id;
                this.getVariableList();
                this.dialogVarListVisible = true;
            },
            /**
             * [变量 新增/编辑]
             * @return {[type]} [description]
             */
            variableAdd(transData){
                if(!transData){
                    this.variableTitle          = "添加变量";
                    this.variableFlag           = "add";
                    this.plc_device_variable_id = "";
                    this.var_item_type_id       = "";
                    this.addr_offset1           = "";
                    this.plc_alarm_list         = [];
                }else{
                    this.variableTitle          = "编辑变量";
                    this.variableFlag           = "modify";
                    this.plc_device_variable_id = transData.plc_device_variable_id;
                    this.var_item_type_id       = transData.var_item_type_id;
                    this.addr_offset1           = transData.addr_offset1;
                    this.plc_alarm_list         = this.resovleRuleList(transData.alarm_list);
                }
                this.dialogVarManagerVisible = true;
            },
            /**
            *  解析报警记录 主要是对alarm_do字段解析一下
            */
            resovleRuleList(transList){
                var result =[];
                for (var i = 0; i < transList.length; i++) {
                    let tempItem = {
                        alarm_id:transList[i].alarm_id,
                        alarm_name:transList[i].alarm_name,
                        alarm_rule:transList[i].alarm_rule,
                        alarm_lval:transList[i].alarm_lval,
                        alarm_hval:transList[i].alarm_hval,
                        alarm_level:transList[i].alarm_level,
                        mtime:transList[i].mtime,
                        rule_push:transList[i].alarm_do.indexOf("push") >= 0 ? true : false,
                        rule_alarm:transList[i].alarm_do.indexOf("alarm") >= 0 ? true : false,
                        rule_order:transList[i].alarm_do.indexOf("order") >= 0 ? true : false,
                    }
                    result.push(tempItem);
                }
                return result;
            },
            /**
             * [报警 临时新增]
             * @return {[type]} [description]
             */
            alarmAdd(){
                let _tempConfig = {"id":"","alarm_name":"","alarm_rule":"1","alarm_level":"general","alarm_lval":"","alarm_hval":"","mtime":"","alarm_do":"","rule_push":false,"rule_alarm":true,"rule_order":false};
                this.plc_alarm_list.push(_tempConfig);
            },
            changeAlarmLevel(transItem) {
                if (transItem.alarm_level=="general") {
                    transItem.rule_alarm = true;
                    transItem.rule_push=false;
                    transItem.rule_order = false;
                } else if (transItem.alarm_level=="important"){
                    transItem.rule_alarm = true;
                    transItem.rule_push=true;
                    transItem.rule_order = false;
                }else if (transItem.alarm_level=="emergency") {
                    transItem.rule_alarm = true;
                    transItem.rule_push=true;
                    transItem.rule_order = true;
                }
            },
            /**
             * [报警 临时删除]
             * @param  {[type]} transIndex [description]
             * @return {[type]}            [description]
             */
            alarmDel(transIndex){

                this.plc_alarm_list.splice(transIndex,1);
            },
            /**
             * [变量保存]
             * @return {[type]} [description]
             */
            variableSave(){
                if(!this.var_item_type_id){
                    this.$toast("请选择关联变量");
                    return;
                }
                if(!this.addr_offset1){
                    this.$toast("请填写地址偏移");
                    return;
                }
                if(this.plc_alarm_list.length > 0){
                    let _count = 0,_lvalCount = 0,_hvalCount = 0;
                    for (var i = this.plc_alarm_list.length - 1; i >= 0; i--) {
                        if(!this.plc_alarm_list[i]["alarm_name"]){
                            _count++;
                        }
                        let _alarm_rule = Number(this.plc_alarm_list[i]["alarm_rule"]);
                        // 要填报警下限
                        if(_alarm_rule!=5&&_alarm_rule!=6){
                            if(!this.plc_alarm_list[i]["alarm_lval"]){
                                _lvalCount++;
                            }
                        }
                        // 要填报警上限
                        if(_alarm_rule!=1&&_alarm_rule!=2&&_alarm_rule!=3&&_alarm_rule!=4){
                            if(!this.plc_alarm_list[i]["alarm_hval"]){
                                _hvalCount++;
                            }
                        }
                        var tempValue = "";
                        if (this.plc_alarm_list[i].rule_push) {
                            tempValue = "push";
                        }
                        if (this.plc_alarm_list[i].rule_order) {
                            tempValue += "|order";
                        }
                        if (this.plc_alarm_list[i].rule_alarm) {
                            tempValue += "|alarm";
                        }
                        delete this.plc_alarm_list[i].rule_push;
                        delete this.plc_alarm_list[i].rule_order;
                        delete this.plc_alarm_list[i].rule_alarm;
                        this.plc_alarm_list[i].alarm_do = tempValue;
                    }
                    if(_count>0){
                        this.$toast("请填写报警详情");
                        return;
                    }
                    if(_lvalCount>0){
                        this.$toast("请填写报警值");
                        return;
                    }
                    if(_hvalCount>0){
                        this.$toast("请填写报警上限");
                        return;
                    }
                }
                this.variableSaveCallback();
            },
            /**
             * [变量保存 回调函数]
             * @return {[type]} [description]
             */
            variableSaveCallback(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    let _tmpDataJson = {
                        url: '',
                        data:{
                            box_id          : this.bsn,
                            plc_device_id   : this.plc_device_id,
                            var_item_type_id: this.var_item_type_id,//全局环境变量id
                            addr_offset1    : this.addr_offset1,//地址偏移
                            alarm_list      : JSON.stringify(this.plc_alarm_list),//关联的报警配置数组
                        }
                    };
                    // 添加
                    if(this.variableFlag=="add"){
                        _tmpDataJson.url  = "/Web/PLCDevice/plc_device_variable_add?action=post";
                    }else{
                    // 修改
                        _tmpDataJson.url  = "/Web/PLCDevice/plc_device_variable_change?action=post";
                        _tmpDataJson.data.plc_device_variable_id = this.plc_device_variable_id;
                    }
                    this.$fetch({
                        url   : _tmpDataJson.url,
                        method: "post",
                        data  : _tmpDataJson.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("保存成功");
                            this.dialogVarManagerVisible = false;
                            // 更新数据
                            this.getVariableList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.global_.showToastErrmsg("保存失败");
                    });
                }catch(e){
                    this.global_.showToastErrmsg("保存失败");
                    console.log("variableSaveCallback: "+e);
                };
            },
            /**
             * [变量删除]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            variableDel(transData){
                this.plc_device_id          = transData.plc_device_id;
                this.plc_device_variable_id = transData.plc_device_variable_id;
                this.deletVarDialogVisible = true;
            },
            /**
             * [变量删除 回调函数]
             * @return {[type]} [description]
             */
            variableDelCallback(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    this.$fetch({
                        url   : "/Web/PLCDevice/plc_device_variable_delete?action=post",
                        data  : {
                            box_id                : this.bsn,
                            plc_device_id         : this.plc_device_id,
                            plc_device_variable_id: this.plc_device_variable_id,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.deletVarDialogVisible = false;
                            this.$toast("删除成功");
                            // 更新数据
                            this.getVariableList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.global_.showToastErrmsg("删除失败");
                    });
                }catch(e){
                    this.global_.showToastErrmsg("删除失败");
                    console.log("variableDelCallback: "+e);
                };
            },
            /**
             * [对一个云盒子下发完整的配置]
             * @return {[type]} [description]
             */
            plcApplication(){
                try{
                    if(!this.bsn){
                        this.$toast("无云盒子ID，请返回重试");
                        return;
                    }
                    this.$loading.show("请稍等");
                    this.refresh_flag = false;
                    this.$fetch({
                        url   : "/Web/PLCDevice/plc_device_update_config?action=post",
                        data  : {
                            box_id : this.bsn,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("操作成功");
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.global_.showToastErrmsg("操作失败");
                        this.refresh_flag = true;
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg("操作失败");
                    console.log("plcApplication: "+e);
                };
            },
            /**
             * [切换选项卡]
             * @param  {[type]} transIndex [description]
             * @return {[type]}            [description]
             */
            switchContanerGroup(transIndex){
                this.containerGroupSelected = transIndex;
            },
            /**
             * [报警下限值]
             * @param  {[type]} transValue [description]
             * @return {[type]}           [description]
             */
            lvalConfig(transValue){
                let _value = Number(transValue);
                if(_value !=5 && _value !=6){
                    return true;
                }
                return false;
            },
            /**
             * [报警上限值]
             * @param  {[type]} transValue [description]
             * @return {[type]}           [description]
             */
            hvalConfig(transValue){
                let _value = Number(transValue);
                if(_value !=1 && _value !=2 && _value !=3 && _value !=4){
                    return true;
                }
                return false;
            },
            /**
             * [初始化滚动插件]
             * @return {[type]} [description]
             */
            initPerfectScrollbar(command){
                $('#scrollContainer1,#scrollContainer2,#scrollContainer3').perfectScrollbar(command);
            },
            /**
            *  plc设备启动/停止接口方法
            */
            plcChangeStatus(transItem,isStart){
                try{
                    this.refresh_flag = false;
                    this.$loading.show("请稍等");

                    this.$fetch({
                       url   : "/Web/PLCDevice/plc_device_vpn_config?action=post",
                    data  : {
                           box_id        : this.bsn,
                           plc_device_id : transItem.id,
                           vpn_enable    : transItem.vpn_enable
                       },
                   }).then(res => {
                       let jsonData = res.data;
                       if(jsonData.result == "success"){
                           this.$toast("操作成功");
                           this.getPlcList();
                       }else{
                           this.getPlcList();
                           this.global_.showToastErrmsg(jsonData.errmsg,"");
                       }
                   }).finally(() => {
                    this.global_.showToastErrmsg("操作失败");
                    this.refresh_flag = true;
                    this.$loading.hide();
                  });
                }catch(e){
                    this.global_.showToastErrmsg("操作失败");
                    console.log("plcApplication: "+e);
                };
            },
            /**
            * 获取PLC状态并返回
            */
            getPlcStatus(transItem) {
                var status = "离线";
                if (transItem.vpn_enable=="1"&&transItem.vpn_remote_ip) {
                    status = "远程中";
                } else if (transItem.is_online=="1") {
                    status = "在线";
                } else {
                    status = "离线";
                }
                return status;
            },
            //实时获取监控数据
            // 定时刷新数据函数
            dataRefreh() {
              // 计时器正在进行中，退出函数
              if (this.intervalId != null) {
                return;
              }
              // 计时器为空，操作
              this.intervalId = setInterval(() => {
                if (this.refresh_flag) {
                    this.getPlcList();
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
    .width100{
        width: 100px;
    }
    .width500{
        width: 35.714286rem;
    }
    .width800{
        width: 57.142857rem;
    }
    .btnSmall{
        width: 7.142857rem;
        height: 1.571429rem;
        padding: 0;
        font-size: 1.0rem;
        border-radius: 8px;
        text-align: center;
    }
    .modal-body div.definedForm{
        min-height: 21.428571rem;
        overflow: hidden;
    }
    .modal-body div.definedForm div.title{
        flex-direction: row;
    }
    .plcContaner .el-col-6 {
        min-width: 20.5rem;
        width: 20%;
    }
    .plcItem{
        min-width:22.5rem;
        float: left;
        margin: 0 1.071429rem 1.071429rem 0;
        padding: 2.428571rem 2.714286rem;
        color: #757D88;
        background:#FFFFFF;
        box-shadow:0px 4px 6px 0px rgba(37,130,247,0.2);
        border-radius:8px;
        display: flex;
    }
    .plcItem .plcLeft{
        width: 70%;
    }
    .plcItem .plcLeft .plcName{
        color: #21252B;
        margin: 0 0 0.871429rem 0;
    }
    .plcItem .plcLeft .plcContent div {
        display: flex;
        margin: 8px 0;
        flex-direction: row;
    }
    .plcItem .plcLeft .plcContent span{
        margin: 0 0.57143rem 0 0;
    }
    .plcItem .plcRight{
        width: 30%;
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: flex-start;
    }

    .plcItem .plcRight .bottomIcon{
        margin-top: 1rem;
        margin-left: 26px;
    }
    .bottomStatus{
        margin-right: 4px;
    }
    .modal-body div.definedForm div.containerGroupTitle{
        display: flex;
        flex-direction: row;
        text-align: center;
        margin: 0 0 1.071429rem 0;
    }
    .containerGroupTitle div{
        width: 50%;
        height: 2.142857rem;
        line-height: 2.142857rem;
        padding: 0 0 0 0.714286rem;
        color: #21252B;
        cursor: pointer;
        border: 1px solid #2582F7;
        background: #FFFFFF;
    }
    .containerGroupTitle div:nth-child(1){
        border-right: 0 none;
    }
    .containerGroupTitle div.activeTitle{
        background: #2582F7;
        color: #FFFFFF;
    }
    .modal-body div.definedForm div.plcAlarmItem{
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem{
        width: 350px;
        margin: 0 0.714286rem 0 0;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem2{
        width: 90px;
        margin: 0 0.714286rem 0 0;
        flex: none;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem4{
        width: 250px;
        height: 48px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
    }
    .alarmConfigItem3{
        width: 40px;
        height: 40px;
        margin-top: 18px;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem5{
        width: 100px;
        margin: 0 0.714286rem 0 0;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem6{
        width: 150px;
        margin: 0 0.714286rem 0 0;
    }
    .modal-body div.definedForm div.plcAlarmItem .alarmConfigItem7{
        width: 250px;
        margin: 0 0.714286rem 0 0;
    }
    .marginT40{
        margin-top: 13px;
    }
    .alarmConfigItem3 .el-button--danger {
        color: #606266; 
        background-color: #ffffff; 
        border-color: #606266; 
    }
    .alarmConfigItem4 .el-checkbox__input.is-checked+.el-checkbox__label {
        color: #606266;
    }
    .inline-block {
        display: inline-block;
    }
</style>
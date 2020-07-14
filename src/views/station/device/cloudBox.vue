<!-- 云盒子页面
     @auther : 唐绪华
     @modify : 李凌云
     @modify-time 2020年5月19日 11:50:21 -->
<template>
    <div class="cloudbox_main">
        <el-button v-show="!global_.isSupportRole()" type="primary"  @click="deviceManage()">添加云盒子</el-button>
        <el-table v-show="curPageList.length > 0" :data="curPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class="mt-15">
               <el-table-column
                   type="index"
                   min-width="5%"
                   align="center"
                   :index="indexMethod"
                >
               </el-table-column>
               <el-table-column
                    label="云盒子SN"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.sn  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="名称"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.device_name  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="归属水站 / 水线"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.wateraffairs_name  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="PLC口IP地址 / 子网掩码"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.boxlan_ip | nullValueFormat}}/{{scope.row.boxlan_netmask | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="PLC数量"
                    min-width="8%">
                    <template slot-scope="scope">
                        {{scope.row.plc_count  | nullValueFormat}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="操作"
                    min-width="13%">
                    <template slot-scope="scope">
                        <span v-show="!global_.isSupportRole()" class="curPoint color-primary mr-15" @click="deviceManage(scope.row)">编辑</span>
                        <span v-show="!global_.isSupportRole()" class="curPoint color-primary mr-15" @click="versionManage(scope.row.sn)">版本管理</span>
                        <span class="curPoint color-primary mr-15" @click="devicePLCManage(scope.row)">PLC管理</span>
                        <span v-show="!global_.isSupportRole()" class="curPoint color-primary mr-15" @click="debugManage(scope.row)">调试信息</span>
                    </template>
               </el-table-column>
           </el-table>
        <!-- <div id="deviceManagePage" class="paginationManage"></div> -->
        <el-pagination v-show="couldDevList.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="couldDevList.length"
            layout="total,  prev, pager, next">
        </el-pagination>

        <p class="emptyItem" v-show="couldDevList.length==0">
            {{empty_notice}}
        </p>

        <el-dialog :title="cloudBoxTitle" :visible.sync="dialogAddBoxVisible" width="480px">
            <el-form ref="form" label-width="125px">
                <el-form-item label="云盒子SN" required>
                    <el-input v-model.trim="cloudBoxSn" :readonly="cloudBoxFlag=='modify'"></el-input>
                </el-form-item>
                <el-form-item label="名称" required>
                    <el-input v-model.trim="cloudBoxName"></el-input>
                </el-form-item>

                <el-form-item label="归属水站" required>
                    <el-select v-model="waterafirrsId" :disabled="cloudBoxFlag=='modify'">
                        <el-option v-for="item in waterAffairsList" :label="item.wateraffairs_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>

                 <el-form-item label="归属水线" required>
                    <el-select v-model="lineNum" :disabled="cloudBoxFlag=='modify'">
                        <el-option value=1></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="PLC口IP地址" required>
                    <el-input v-model.trim="cloudBoxIP"></el-input>
                </el-form-item>
                <el-form-item label="PLC口子网掩码" required>
                    <el-input v-model.trim="cloudBoxMask"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="cloudDevSave">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog :title="cloudBoxSn" :visible.sync="dialogVersionVisible" width="480px">
            <el-form ref="form" label-width="125px">
                <el-form-item >
                    <label>{{needUpdata ? '有新版本可升级' : '已是最新版本无需升级'}}</label>
                </el-form-item>
                <el-form-item label="设备版本号：">
                    <label>{{version}}</label>
                </el-form-item>
                <el-form-item label="可升级版本号：" v-show="needUpdata">
                    <label>{{updataVersion}}</label>
                </el-form-item>

                <el-form-item v-show="needUpdata">
                    <el-button type="primary" @click="dialogVersionVisible = false">取消</el-button>
                    <el-button type="primary" @click="updata">升级</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogAddBoxVisible  : false,
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                couldDevList         : [],//云盒子列表
                waterAffairsList     : [],//水站列表
                curPageList          : [],
                cloudBoxFlag         : "add",
                cloudBoxTitle        : "添加云盒子",
                cloudBoxId           : "",
                cloudBoxInfo         : "",
                cloudBoxSn           : "",
                cloudBoxName         : "",
                cloudBoxIP           : "",
                cloudBoxMask         : "",
                waterafirrsId        : 8,
                lineNum              : 1,
                dialogVersionVisible : false,
                version              : "1.0",
                needUpdata           : false,
                updataVersion        : "1.0",
                intervalId           : null,
                empty_notice         : "加载中...",
            }
        },
        components:{
        },
        watch:{
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
            this.$nextTick(()=>{
                // 初始化滚动容器
                this.initPerfectScrollbar();
            });
            // DOM操作
            this.bindDom();
            //获取全站水站数据
            this.getWaterList();
            // 获取已配置的云盒子列表
            this.getCouldDevList();
        },
        beforeDestroy(){
            $('.modal').modal('hide');
            this.$loading.hide();
        },
        methods:{
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
                this.curPageList = this.couldDevList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            bindDom() {
                $('#deviceManageModal').on('show.bs.modal', () => {
                    // 重置滚动条位置
                    $("#scrollContainer").scrollTop(0);
                });
                // $('#deviceManageModal').on('hidden.bs.modal', () => {
                // });
            },
            /**
             * [获取全站水站数据]
             * @return {[type]} [description]
             */
            getWaterList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/all_water_station?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.waterAffairsList = jsonData.data;
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    console.log("getWaterList: "+e);
                };
            },
            /**
             * [获取云盒子列表]
             * @return {[type]} [description]
             */
            getCouldDevList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/device_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.couldDevList = jsonData.data;
                            let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
                            this.curPageList = this.couldDevList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
                            // this.createPage(jsonData.data);
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
                    console.log("getCouldDevList: "+e);
                };
            },
            /**
             * [分页]
             * @param  {[type]} tmpData [description]
             * @return {[type]}         [description]
             */
            createPage(tmpData) {
                if(tmpData.length==0){
                    this.queryDataInfo = "无数据项";
                }
                let _t = this;

                $("#deviceManagePage").pagination({
                    items      : tmpData.length,
                    itemsOnPage: _t.itemsOnPage,
                    onPageClick:function(pageNumber,index,basicNumber,event){
                        _t.itemsOnPage     = basicNumber;//分页基数修改后，重置
                        let tmpSliceNumber = (pageNumber-1)*basicNumber;
                        _t.currentPage     = pageNumber;
                        _t.couldDevList    = tmpData.slice(tmpSliceNumber,(tmpSliceNumber+basicNumber));
                    },
                    onInit:function(basicNumber){
                        _t.currentPage  = 1;
                        _t.couldDevList = tmpData.slice(0,basicNumber);
                    }
                });
            },
            /**
             * [添加/修改 账号信息]
             * @param  {[type]} transData [description]
             * @return {[type]}            [description]
             */
            deviceManage(transData){
                if(!transData){
                    this.cloudBoxTitle = "添加云盒子";
                    this.cloudBoxFlag  = "add";
                    this.cloudBoxSn    = "";
                    this.cloudBoxName  = "";
                    this.waterafirrsId = "";
                    this.lineNum       = 1;
                    this.cloudBoxIP    = "";
                    this.cloudBoxMask  = "";
                }else{
                    this.cloudBoxTitle = "编辑云盒子";
                    this.cloudBoxFlag  = "modify";
                    this.cloudBoxId    = transData.id;
                    this.cloudBoxSn    = transData.sn;
                    this.cloudBoxName  = transData.device_name;
                    this.waterafirrsId = transData.wateraffairs_id;
                    this.lineNum       = transData.line_num;
                    this.cloudBoxIP    = transData.boxlan_ip;
                    this.cloudBoxMask  = transData.boxlan_netmask;
                }
                this.dialogAddBoxVisible = true;
            },
            /**
             * [保存账号设置]
             * @return {[type]} [description]
             */
            cloudDevSave(){
                if(!this.cloudBoxSn){
                    this.$toast("请填写云盒子SN");
                    return;
                }
                if(!this.cloudBoxName){
                    this.$toast("请填写云盒子名称");
                    return;
                }
                if(!this.waterafirrsId){
                    this.$toast("请选择归属水站");
                    return;
                }
                if(!this.lineNum){
                    this.$toast("请选择归属水线");
                    return;
                }
                if(!this.cloudBoxIP){
                    this.$toast("请填写IP地址");
                    return;
                }
                if(!this.cloudBoxMask){
                    this.$toast("请填写子网掩码");
                    return;
                }
                this.cloudDevSaveCallback();
            },
            /**
             * [保存账号设置回调函数]
             * @return {[type]} [description]
             */
            cloudDevSaveCallback(){
                try{
                    let _tmpDataJson = {
                        url: '',
                        data:{
                            sn             : this.cloudBoxSn,
                            device_name    : this.cloudBoxName,
                            wateraffairs_id: this.waterafirrsId,
                            line_num       : this.lineNum,
                            boxlan_ip      : this.cloudBoxIP,
                            boxlan_netmask : this.cloudBoxMask,                        }
                    };
                    // 添加
                    if(this.cloudBoxFlag=="add"){
                        _tmpDataJson.url  = "/Web/WaterAffairs/device_add?action=post";
                    }else{
                    // 修改
                        _tmpDataJson.url  = "/Web/WaterAffairs/device_change?action=post";
                        _tmpDataJson.data.id = this.cloudBoxId;
                    }
                    this.$fetch({
                        url   : _tmpDataJson.url,
                        method: "post",
                        data  : _tmpDataJson.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("保存成功");
                            this.dialogAddBoxVisible = false;
                            // 更新数据
                            this.getCouldDevList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
                        }
                    });
                }catch(e){
                    console.log("deviceManageSaveCallback: "+e);
                };
            },
            /**
             * [编辑PLC]
             * @param  {[type]} transData [description]
             * @return {[type]}           [description]
             */
            devicePLCManage(transData){
                this.$router.push({name:"plcManage",query:{"bsn":transData.id}});
            },
            /**
            *  [设备调试信息页面]
            */
            debugManage(transData){
                this.$router.push({name:"debugManage",query:{"bsn":transData.sn}});
            },
            /**
             * [初始化滚动插件]
             * @return {[type]} [description]
             */
            initPerfectScrollbar(command){
                $('#scrollContainer').perfectScrollbar(command);
            },
            versionManage(cloudBoxSn){
                try{
                    this.cloudBoxSn = cloudBoxSn;
                    if(this.intervalId == null){
                        this.$loading.show("正在查询...");
                    }

                    this.$fetch({
                        url: '/Web/Additional/box_info?action=get',
                        method: "get",
                        data: {
                            sn              : this.cloudBoxSn, //云盒子sn
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if(jsonData.data.is_online == "1"){
                                if(this.intervalId == null){
                                    this.dialogVersionVisible = true;
                                }
                                this.version = jsonData.data.soft_ver;
                                this.needUpdata = jsonData.data.need_upgrade == "1" ? true : false;
                                this.updataVersion = jsonData.data.upgrade_ver;
                            }else{
                                if(this.intervalId == null){
                                    this.$toast("设备离线，无法获取版本信息");
                                }
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        if(this.intervalId == null){
                            this.$loading.hide();
                        }
                    });
                }catch(e){
                    if(this.intervalId == null){
                        this.$loading.hide();
                    }
                    console.log("versionManage: "+e);
                };
            },
            updata(){
                try{
                    this.$loading.show("请稍等");
                    this.$fetch({
                        url: '/Web/Additional/doing_upgrade?action=get',
                        method: "get",
                        data: {
                            sn              : this.cloudBoxSn, //云盒子sn
                            ver             : this.updataVersion,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.dialogVersionVisible = false;
                            this.$loading.hide();
                            this.$loading.show("正在升级...");
                            var myDate = new Date();
                            console.log("start updata "+myDate.toLocaleString());
                            setTimeout(function(){
                                this.checkUpdata();
                            },3*60*1000);//三分钟查询升级是否成功
                        }else{
                            this.$loading.hide();
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                    });
                }catch(e){
                    this.$loading.hide();
                    console.log("updata: "+e);
                };
            },
            checkUpdata(){
                var num = 0;
                this.intervalId = setInterval(() => {
                    var myDate = new Date();
                    console.log("checkUpdata num = "+num+" Time = "+myDate.toLocaleString( ));
                    num ++;
                    this.versionManage(this.cloudBoxSn);
                    if(!this.needUpdata){
                        clearInterval(this.intervalId); //清除计时器
                        this.intervalId = null; //设置为null
                        this.$loading.hide();
                        this.$toast("升级成功");
                    }else if(num > 6*7){//七分钟还未升级成功则认为升级失败
                        clearInterval(this.intervalId); //清除计时器
                        this.intervalId = null; //设置为null
                        this.$loading.hide();
                        this.$toast("升级失败，请稍后重试");
                    }
                },10*1000);
            },

        }
    }
</script>

<style scope>
    .width500{
        width: 35.714286rem;
    }
    .modal-body div.definedForm div.title{
        flex-direction: row;
    }
</style>
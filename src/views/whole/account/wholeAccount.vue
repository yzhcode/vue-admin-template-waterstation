<template>
    <div class="wholeAccountMain">
       <el-button type="primary" class="mb-15" @click="accountManage()">添加账号</el-button>
       <el-table v-show="curPageList.length > 0" :data="curPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
	       <el-table-column
	           type="index"
	           min-width="5%"
	           align="center"
	           :index="indexMethod"
	        >
	       </el-table-column>

	       <el-table-column
	            label="账号名称"
	            min-width="15%">
	            <template slot-scope="scope">
	                {{scope.row.username | nullValueFormat}}
	            </template>
	       </el-table-column>

           <el-table-column
                label="联系电话"
                min-width="10%">
                <template slot-scope="scope">
                    {{scope.row.telephone | nullValueFormat}}
                </template>
           </el-table-column>

           <el-table-column
                label="账号状态"
                min-width="10%">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.status" @change="modifyAccountStatus(scope.row, scope.row.status)">
                    <el-option
                        v-for="item in statusArray"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </template>
           </el-table-column>

           <el-table-column
                label="管理水站"
                min-width="15%">
                <template slot-scope="scope">
                    <a v-if="!scope.row.wateraffairs_name">-</a>
                    <li v-else v-for="(item,indexs) in getWateraffairsName(scope.row.wateraffairs_name)" :class="indexs!=0?'mt-15':''">
                        {{item | nullValueFormat}}
                    </li>
                </template>
           </el-table-column>

           <el-table-column
                label="职位描述"
                min-width="15%">
                <template slot-scope="scope">
                    {{scope.row.describe | nullValueFormat}}
                </template>
           </el-table-column>

            <!-- <el-table-column
                label="联系人"
                min-width="10%">
                <template slot-scope="scope">
                    {{scope.row.contacts | nullValueFormat}}
                </template>
           </el-table-column> -->

	       <el-table-column
	            label="最后登录时间"
	            min-width="15%">
	            <template slot-scope="scope">
	                {{global_.getTimeByFilter(scope.row.lastlogintime) | nullValueFormat}}
	            </template>
	       </el-table-column>
	       <el-table-column
	            label="操作"
	            min-width="8%">
	            <template slot-scope="scope">
	            	<el-button type="primary" @click="accountManage(scope.row)">编辑</el-button>
	            </template>
	       </el-table-column>
        </el-table>
        <p class="emptyItem" v-show="curPageList.length == 0">{{empty_notice}}</p>
        <el-pagination v-show="accountList.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="accountList.length"
            layout="total,prev, pager, next">
        </el-pagination>

        <!-- 账号配置 -->
        <el-dialog :title="accountManageTitle" :visible.sync="dialogTableVisible" width="500px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="账号名称" required>
                  <el-input type="text" v-model.trim="accountName" :readonly="accountManageFlag=='modify'" maxlength='20'></el-input>
                </el-form-item>
                 <el-form-item label="账号密码" required>
                  <el-input type="password" v-model.trim="accountPwd" maxlength='12'></el-input>
                </el-form-item>
                <el-form-item label="联系电话" required>
                  <el-input type="text" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))" v-model.trim="telephone" maxlength='11'></el-input>
                </el-form-item>
                <el-form-item label="账号状态">
                    <el-select v-model="accountStatus">
                        <el-option
                            v-for="item in statusArray"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="管理水站" v-show="accountType == '3'">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                    <div style="margin: 5px 0;"></div>
                    <el-checkbox-group v-model="accountWaterAffairsID"  @change="handleCheckedWaterChange">
                        <el-checkbox v-for="(item, index) in waterAffairsList" :key="item.id" :label="item.id">{{item.wateraffairs_name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="职位描述">
                  <el-input type="text" v-model.trim="describe"></el-input>
                </el-form-item>
                <!-- <el-form-item label="联系人">
                  <el-input type="text" v-model.trim="contacts"></el-input>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="accountManageSave">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                waterAffairsList     : [],
                accountList          : [],//账号列表
                accountManageFlag    : "add",
                accountManageTitle   : "添加账号",
                accountManageInfo    : "",
                accountID            : "",
                accountName          : "",
                accountPwd           : "",
                accountStatus        : "1",
                accountType          : "3",//[3|4 单站账号|设备账号]
                accountWaterAffairsID: [],
                dialogTableVisible   : false,
                curPageList          : [],
                describe             : "",
                contacts             : "",//联系人名字
                telephone            : "",//联系人电话
                checkAll             : false,
                isIndeterminate      : false,
                waterIdList          : [],
                empty_notice         : '加载中...',
                statusArray            : [{value: "1",label: '启用'},
                                        {value: "0",label: '禁用'}],
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
            /**
             * [账号类型格式化]
             * @param  {[type]} transValue [description]
             * @return {[type]}            [description]
             */
            accountTypeFormat(transValue){
                let _info = "-";
                if(transValue == "3"){
                    _info = "水站管理员";
                }else if(transValue == "4"){
                    _info = "设备管理员";
                }
                return _info;
            },
        },
        mounted(){
            // 获取当前账号可见水站列表
            this.getWaterAffairsList();
            // 获取三级账号列表
            this.getAccountList();
            // DOM操作
            this.bindDom();
        },
        beforeDestroy(){
            $('.modal').modal('hide');
            this.$loading.hide();
        },
        methods:{
            getWateraffairsName(wateraffairs_name){
                return wateraffairs_name.split(",");
            },
        	indexMethod(index){
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
                this.curPageList = this.accountList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            initWaterNameList(){
                var tempList = [];
                for (let i = 0; i < this.waterAffairsList.length; i++) {
                    const element = this.waterAffairsList[i];
                    tempList.push(element.id);
                }
                this.waterIdList = tempList;
            },
            handleCheckAllChange(val) {
                this.accountWaterAffairsID = val ? this.waterIdList : [];
                this.isIndeterminate = false;
            },
            handleCheckedWaterChange(value) {
                let checkedCount = this.accountWaterAffairsID.length;
                this.checkAll = checkedCount === this.waterIdList.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.waterIdList.length;
            },
            bindDom() {
                // $('#accountManageModal').on('show.bs.modal', () => {
                //
                // });
                // $('#accountManageModal').on('hidden.bs.modal', () => {
                //
                // });
            },
            /**
             * [获取当前账号可见水站列表]
             * @return {[type]} [description]
             */
            getWaterAffairsList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/all_water_station?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.waterAffairsList = jsonData.data;
                            this.initWaterNameList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    this.global_.showToastErrmsg();
                    console.log("getWaterAffairsList: "+e);
                };
            },
            /**
             * [获取三级账号列表]
             * @return {[type]} [description]
             */
            getAccountList(){
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/user_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.accountList = [];
                            for(var i=0;i< jsonData.data.length;i++){
                                if(jsonData.data[i].role == "3"){
                                    this.accountList.push(jsonData.data[i]);
                                }
                            }
                            this.getData();
                            if (this.curPageList.length == 0) {
                                this.empty_notice = '暂无数据，请添加账号';
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    console.log("getAccountList: "+e);
                };
            },
            /**
             * [添加/修改 账号信息]
             * @param  {[type]} transData [description]
             * @return {[type]}            [description]
             */
            accountManage(transData){
                if(!transData){
                    this.accountManageTitle    = "添加账号";
                    this.accountManageFlag     = "add";
                    this.accountID             = "";
                    this.accountName           = "";
                    this.accountPwd            = "";
                    this.describe              = "";
                    this.contacts              = "";
                    this.telephone             = "";
                    this.accountType           = "3";
                    this.accountStatus         = "1";
                    this.accountWaterAffairsID = [];
                    this.checkAll              = false;
                    this.isIndeterminate       = false;
                }else{
                    this.accountManageTitle    = "修改账号";
                    this.accountManageFlag     = "modify";
                    this.accountID             = transData.user_id;
                    this.accountName           = transData.username;
                    this.accountPwd            = "";
                    this.describe              = transData.describe;
                    this.contacts              = transData.contacts;
                    this.telephone             = transData.telephone;
                    this.accountType           = transData.role;
                    this.accountStatus         = String(transData.status);
                    this.accountWaterAffairsID = transData.manage_wateraffairs_id != "" ? transData.manage_wateraffairs_id.split(",") : [];
                    this.checkAll = this.accountWaterAffairsID.length === this.waterIdList.length;
                    this.isIndeterminate       = this.accountWaterAffairsID.length > 0 && this.accountWaterAffairsID.length < this.waterIdList.length;
                }
                this.dialogTableVisible = true;
            },
            /**
             * [保存账号设置]
             * @return {[type]} [description]
             */
            accountManageSave(){
                if(!this.accountName){
                    this.global_.showToastErrmsg("请填写账号名称");
                    return;
                }
                if(!this.accountPwd && this.accountManageFlag=="add"){
                    this.global_.showToastErrmsg("请填写账号密码");
                    return;
                }
                if(!this.checkTel(this.telephone)){
                    this.global_.showToastErrmsg("请填写正确的联系电话");
                    return;
                }
                // if(this.accountWaterAffairsID.length == 0 && this.accountType=="3"){
                //     this.$toast("请选择管理水站");
                //     return;
                // }
                this.dialogTableVisible = false;
                this.accountManageSaveCallback();
            },
            checkTel(tel)
            {
                var mobile = /^1\d{10}$/ , phone = /^0\d{2,3}-?\d{7,8}$/;
                return mobile.test(tel) || phone.test(tel);
            },
            /**
             * [保存账号设置回调函数]
             * @return {[type]} [description]
             */
            accountManageSaveCallback(){
                try{
                    let _tmpDataJson = {
                        url: '',
                        data:{

                        }
                    };
                    // 添加
                    if(this.accountManageFlag=="add"){
                        if(this.accountType == "3"){
                            _tmpDataJson.url  = "/Web/WaterAffairs/region_user_create?action=post";
                            _tmpDataJson.data = {
                                username       :this.accountName,
                                password       :this.$md5(this.accountPwd),
                                wateraffairs_id:this.accountWaterAffairsID.join(","),
                                status         :this.accountStatus,
                                describe       :this.describe,
                                contacts       : this.contacts,
                                telephone      : this.telephone,
                            }
                        }else{
                            _tmpDataJson.url  = "/Web/WaterAffairs/region_deviceuser_create?action=post";
                            _tmpDataJson.data = {
                                username       :this.accountName,
                                password       :this.$md5(this.accountPwd),
                                status         :this.accountStatus,
                            }
                        }
                    }else{
                    // 修改
                        if(this.accountType == "3"){
                            _tmpDataJson.url  = "/Web/WaterAffairs/region_user_change?action=post";
                            _tmpDataJson.data = {
                                user_id        :this.accountID,
                                password       :this.accountPwd ? this.$md5(this.accountPwd) : "",//空字符串不修改密码
                                wateraffairs_id:this.accountWaterAffairsID.join(","),
                                status         :this.accountStatus,
                                describe       :this.describe,
                                contacts       : this.contacts,
                                telephone      : this.telephone,
                            }
                        }else{
                            _tmpDataJson.url  = "/Web/WaterAffairs/region_deviceuser_change?action=post";
                            _tmpDataJson.data = {
                                user_id        :this.accountID,
                                password       :this.accountPwd ? this.$md5(this.accountPwd) : "",//空字符串不修改密码
                                status         :this.accountStatus,
                            }
                        }
                    }

                    this.$fetch({
                        url   : _tmpDataJson.url,
                        method: "post",
                        data  : _tmpDataJson.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.global_.showToastErrmsg("保存成功");
                            // $('#accountManageModal').modal('hide');
                            // 更新数据
                            this.getAccountList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
                        }
                    });
                }catch(e){
                    this.global_.showToastErrmsg("保存失败");
                    console.log("accountManageSaveCallback: "+e);
                };
            },
            /**
             * [启用/禁用账号]
             * @param  {[type]} transData  [description]
             * @param  {[type]} transValue [description]
             * @return {[type]}            [description]
             */
            modifyAccountStatus(transData,transValue){
                let _tmpDataJson = {
                    url: '',
                    data:{

                    }
                };
                if(transData.role == "3"){
                    _tmpDataJson.url  = "/Web/WaterAffairs/region_user_change?action=post";
                    _tmpDataJson.data = {
                        user_id        : transData.user_id,
                        password       : "",
                        wateraffairs_id: transData.manage_wateraffairs_id,
                        status         : transValue,
                    }
                }else{
                    _tmpDataJson.url  = "/Web/WaterAffairs/region_deviceuser_change?action=post";
                    _tmpDataJson.data = {
                        user_id        : transData.user_id,
                        password       : "",
                        status         : transValue,
                    }
                }
                try{
                    this.$fetch({
                        url   : _tmpDataJson.url,
                        method: "post",
                        data  : _tmpDataJson.data,
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.global_.showToastErrmsg("保存成功");
                            // 更新数据
                            this.getAccountList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
                        }
                    });
                }catch(e){
                    this.global_.showToastErrmsg("保存失败");
                    console.log("modifyAccountStatus: "+e);
                };
            },
        }
    }
</script>

<style scope>
    .width500{
        width: 35.714286rem;
    }
</style>
<template>
    <div class="wholeAccountMain">
        <el-button type="primary" class="mb-15" @click="accountManage()">添加区域账号</el-button>
        
        <el-table v-show="currentPageList.length > 0" :data="currentPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
          <el-table-column
            type="index"
            min-width="5%"
            align="center"
            :index="indexMethod">
          </el-table-column>

          <el-table-column
            label="账号名称"
            min-width="20%">
            <template slot-scope="scope">
              {{scope.row.username | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="账号类型"
            min-width="10%">
            <template slot-scope="scope">
              {{global_.getRoleType(scope.row.role_type) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="账号状态"
            min-width="15%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.status" @change="modifyAccountStatus(scope.$index, scope.row.status)">
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
            label="区域名称"
            min-width="20%">
            <template slot-scope="scope">
                {{queryRegionName(scope.row.region_id) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
                label="职位描述"
                min-width="15%">
                <template slot-scope="scope">
                    {{scope.row.describe | nullValueFormat}}
                </template>
           </el-table-column>

          <el-table-column
            label="最后登录时间"
            min-width="15%">
            <template slot-scope="scope">
              {{global_.getTimeByFilter(scope.row.lastlogintime) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            min-width="10%">
            <template slot-scope="scope">
                <el-button type="primary" @click="accountManage(scope.$index)">编辑</el-button>
            </template>
          </el-table-column>

        </el-table>

        <p class="emptyItem" v-show="currentPageList.length == 0">{{empty_notice}}</p>

        <el-pagination v-show="accountList.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="accountList.length"
            layout="total, prev, pager, next">
        </el-pagination>
        <!-- <div id="accountManagePage" class="paginationManage"></div> -->

        <!-- 账号配置 -->
        <el-dialog :title="accountManageTitle" :visible.sync="dialogTableVisible" width="500px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="账号名称" required>
                  <el-input type="text" v-model.trim="accountName" :readonly="accountManageFlag=='modify'" maxlength='20'></el-input>
                </el-form-item>
                <el-form-item label="账号密码" required>
                  <el-input type="password" v-model.trim="accountPwd" maxlength='12'></el-input>
                </el-form-item>
                <el-form-item label="账号类型" >
                    <el-select v-model="roleType" :disabled="accountManageFlag!='add'">
                        <el-option
                            v-for="item in roleArray"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
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
                <el-form-item label="区域名称" required>
                    <el-select v-model="regionID" :disabled="isEditRegion">
                        <el-option v-for="(item,index) in regionList" :label="item.region" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="职位描述">
                  <el-input type="text" v-model.trim="describe"></el-input>
                </el-form-item>

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
                dialogTableVisible   : false,
                queryDataInfo        : "查询中",
                itemsOnPage          : 10,//分页基数
                currentPage          : 1,//当前页
                regionList     		 : [{'id':'1', 'region':'成都市青羊区', 'ctime':'2020-04-20 08:39:08'}, {'id':'2', 'region':'成都市龙泉驿区', 'ctime':'2020-04-21 08:39:08'}],//区域列表
                accountList          : [],//账号列表
                currentPageList      : [],
                accountManageFlag    : "add",
                accountManageTitle   : "添加区域账号",
                accountManageInfo    : "",
                accountID            : "",
                accountName          : "",
                accountPwd           : "",
                describe             : "",
                accountStatus        : "1",
                regionID             : "",
                roleType             : "1",
                isEditRegion         : false,
                empty_notice         : '加载中...',
                statusArray          : [{value: "1",label: '启用'},
                                        {value: "0",label: '禁用'}],
                roleArray            : [{value: "1",label: '水站生产管理'},
                                        {value: "2",label: '水站技术支持'}],
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
            // 获取区域列表
            this.getRegionList();
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
            queryRegionName(id){
                for (var i = 0; i < this.regionList.length; i++) {
                    if(this.regionList[i].id == id){
                        return this.regionList[i].region;
                    }
                }
                return null;
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
                this.currentPageList = this.accountList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
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
             * [获取区域列表]
             * @return {[type]} [description]
             */
            getRegionList(){
                
                try{
                    this.$fetch({
                        url: '/Web/Manage/region_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.regionList = jsonData.data;
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                       }
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    console.log("getRegionList: "+e);
                };
            },
            /**
             * [获取二级账号列表]
             * @return {[type]} [description]
             */
            getAccountList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: '/Web/WaterAffairs/user_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                        	var tempList = [];
                        	for (var i = 0; i < jsonData.data.length; i++) {
                        		let obj = jsonData.data[i];
                        		if (obj.role == "2") {
                        			tempList.push(obj);
                        		}
                        	}
                            this.accountList = tempList;
                            this.getData();
                            
                            if (this.currentPageList.length == 0) {
                                this.empty_notice = '暂无数据';
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg("获取账号数据失败");
                    this.$loading.hide();
                    console.log("getAccountList: "+e);
                };
            },
            /**
             * [添加/修改 账号信息]
             * @param  {[type]} transData [description]
             * @return {[type]}            [description]
             */
            accountManage(index){
                var transData = this.currentPageList[index];
                if(!transData){
                    this.accountManageTitle    = "添加区域账号";
                    this.accountManageFlag     = "add";
                    this.accountID             = "";
                    this.accountName           = "";
                    this.accountPwd            = "";
                    this.roleType              = "1";
                    this.describe              = "";
                    this.accountStatus         = "1";
                    this.regionID              = "";
                    this.isEditRegion          = false;
                }else{
                    this.accountManageTitle    = "修改区域账号";
                    this.accountManageFlag     = "modify";
                    this.accountID             = transData.user_id;
                    this.accountName           = transData.username;
                    this.accountPwd            = "";
                    this.describe              = transData.describe;
                    this.roleType              = String(transData.role);
                    this.accountStatus         = String(transData.status);
                    this.regionID              = transData.region_id == 0 ? "" : transData.region_id;
                    this.isEditRegion          = this.regionID != "";
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
                if(!this.regionID){
                    this.global_.showToastErrmsg("请选择区域名称");
                    return;
                }
                this.accountManageSaveCallback();
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
                        _tmpDataJson.url  = "/Web/Manage/user_create?action=post";
                        _tmpDataJson.data = {
                            username       :this.accountName,
                            password       :this.$md5(this.accountPwd),
                            status         :this.accountStatus,
                            region_id      :this.regionID,
                            describe       :this.describe,
                            role_type       :this.roleType,
                        }
                    }else{
                    // 修改
                        _tmpDataJson.url  = "/Web/Manage/user_change?action=post";
                        _tmpDataJson.data = {
                            user_id        :this.accountID,
                            password       :this.accountPwd ? this.$md5(this.accountPwd) : "",//空字符串不修改密码
                            status         :this.accountStatus,
                            region_id      :this.regionID,
                            describe       :this.describe,
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
                            this.dialogTableVisible = false;
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
            modifyAccountStatus(index,transValue){
                let _tmpDataJson = {
                    url: '',
                    data:{

                    }
                };
                var transData = this.currentPageList[index];
                _tmpDataJson.url  = "/Web/Manage/user_change?action=post";
                    _tmpDataJson.data = {
                        user_id        : transData.user_id,
                        password       : "",
                        status         : transValue,
                        region_id      : transData.region_id,
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
<template>
    <div class="areaMange">
        <el-button type="primary" class="mb-15" @click="addArea()">添加区域</el-button>
        <p class="emptyItem" v-show="currentPageList.length == 0">{{empty_notice}}</p>
        <el-table v-show="currentPageList.length > 0" :data="currentPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
          <el-table-column
            type="index"
            min-width="10%"
            align="center"
            :index="indexMethod">
          </el-table-column>

          <el-table-column
            label="区域名称"
            min-width="20%">
            <template slot-scope="scope">
              {{scope.row.region | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="区域类型"
            min-width="20%">
            <template slot-scope="scope">
              {{getAreaType(scope.row.type) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="最后修改时间"
            min-width="50%">
            <template slot-scope="scope">
              {{global_.getTimeByFilter(scope.row.ctime) | nullValueFormat}}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            min-width="25%">
            <template slot-scope="scope">
                <el-button type="primary" @click="addArea(scope.row)">编辑</el-button>
            </template>
          </el-table-column>

        </el-table>
        
        <el-pagination v-show="areaList.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="areaList.length"
            layout="total, prev, pager, next">
        </el-pagination>

        <!-- 区域配置 -->
        <el-dialog :title="areaManageTitle" :visible.sync="dialogTableVisible" width="400px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="区域名称" required>
                  <el-input type="text" v-model.trim="areaName" maxlength='20'></el-input>
                </el-form-item>
                <el-form-item label="区域类型">
                    <el-select v-model="areaType"  :disabled="areaManageFlag!='add'">
                        <el-option
                            v-for="item in areaArray"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="areaManageSave()">确定</el-button>
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
                areaList             : [],//区域列表
                currentPageList      : [],//区域列表
                areaManageFlag       : "add",
                areaManageTitle      : "添加区域",
                areaID               : "",
                areaOldName          : "",
                areaName             : "",
                areaType             : "1",
                empty_notice         : '加载中...',
                areaArray            : [{value: "1",label: '政府区域'},
                                        {value: "2",label: '华晨区域'}],
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
            // 获取admin账号的区域列表
            this.getAreaList();
            // DOM操作
            this.bindDom();
            //先显示加载框
            this.$loading.show("请稍等");
        },
        beforeDestroy(){
            $('.modal').modal('hide');
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
                this.currentPageList = this.areaList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            getAreaType(type){
                if(type == "1"){
                    return "政府区域";
                }else if(type == "2"){
                    return "华晨区域";
                }
            },
            bindDom() {
            },
            /**
             * [获取admin账号的区域列表]
             * @return {[type]} [description]
             */
            getAreaList(){
                try{
                    this.$fetch({
                        url: '/Web/Manage/region_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.areaList = jsonData.data;
                            this.getData();
                            if (this.currentPageList.length == 0) {
                                this.empty_notice = '暂无数据,请添加区域';
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    console.log("getAreaList: "+e);
                };
            },

            addArea(data){
                if(!data){
                    this.areaManageTitle    = "添加区域";
                    this.areaManageFlag     = "add";
                    this.areaID             = "";
                    this.areaName           = "";
                    this.areaType           = "1";
                }else{
                    this.areaManageTitle    = "修改区域";
                    this.areaManageFlag     = "modify";
                    this.areaID             = data.id;
                    this.areaName           = data.region;
                    this.areaOldName        = data.region;
                    this.areaType           = String(data.type);
                }
                this.dialogTableVisible = true;
            },
            /**
             * [保存区域设置]
             * @return {[type]} [description]
             */
            areaManageSave(){
                if(!this.areaName){
                    this.global_.showToastErrmsg("请填写区域名称");
                    return;
                }
                if(this.areaManageFlag == "modify" && this.areaName == this.areaOldName){
                    this.global_.showToastErrmsg("区域名称未作修改");
                    return;
                }
                this.areaManageSaveCallback();
            },
            /**
             * [保存区域设置回调函数]
             * @return {[type]} [description]
             */
            areaManageSaveCallback(){
                try{
                    let _tmpDataJson = {
                        url: '',
                        data:{

                        }
                    };
                    // 添加
                    if(this.areaManageFlag=="add"){
                        _tmpDataJson.url  = "/Web/Manage/region_create?action=post";
                        _tmpDataJson.data = {
                            region       :this.areaName,
                            type         :this.areaType,
                        }
                    }else{
                    // 修改
                        _tmpDataJson.url  = "/Web/Manage/region_change?action=post";
                        _tmpDataJson.data = {
                            id           :this.areaID,
                            region       :this.areaName,
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
                            this.getAreaList();
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
                        }
                    });
                }catch(e){
                    this.global_.showToastErrmsg("保存失败");
                    console.log("areaManageSaveCallback: "+e);
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
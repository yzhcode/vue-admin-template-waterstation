<template>
    <div class="cloudbox_main">
        <el-button v-show="!global_.isSupportRole()" class="btn-primary" type="primary"  @click="videomanage()">添加摄像头</el-button>
        <el-table v-show="curPageList.length > 0" :data="curPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" class="mt-15">
               <el-table-column
                   type="index"
                   min-width="5%"
                   align="center"
                   :index="indexMethod"
                >
               </el-table-column>
               <el-table-column
                    label="摄像头SN"
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
                    label="在线状态"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.online == "1" ? "在线" : "离线"}}
                    </template>
               </el-table-column>
               <el-table-column
                    label="水站名称"
                    min-width="8%">
                    <template slot-scope="scope" >
                        {{scope.row.wateraffairs_name | nullValueFormat}}
                    </template>
               </el-table-column>
           </el-table>
        <p class="emptyItem" v-show="videoList.length==0">
            {{empty_notice}}
        </p>
           <!-- <p class="emptyItem" v-show="curPageList.length == 0">暂无数据，请添加摄像头</p> -->
        <!-- <div id="accountManagePage" class="paginationManage" v-show="videoList.length>0"></div> -->
        <el-pagination v-show="videoList.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="videoList.length"
            layout="total, prev, pager, next">
        </el-pagination>

        <!-- 设备配置 -->
        <el-dialog title="添加摄像头" :visible.sync="dialogAddVideoVisible" width="480px">
            <el-form ref="form" label-width="85px">
                <el-form-item label="摄像头SN" required>
                    <el-input v-model.trim="videoDevSn"></el-input>
                </el-form-item>
                <el-form-item label="名称" required>
                    <el-input v-model.trim="videoDevName"></el-input>
                </el-form-item>

                <el-form-item label="归属水站" required>
                    <el-select v-model="waterafirrsId">
                        <el-option v-for="item in waterAffairsList" :label="item.wateraffairs_name" :value="item.id" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>

                 <el-form-item label="归属水线" required>
                    <el-select v-model="lineNum">
                        <el-option value=1></el-option>
                        <el-option value=2></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="cloudDevSave">立即添加</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                dialogAddVideoVisible : false,
                sid             : this.$route.query.sid,
                itemsOnPage     : 10,//分页基数
                currentPage     : 1,//当前页
                videoList       : [],
                // [{id:1,sn:"854300010002",device_name:"输水管流量监测",line_num:"1",online:"1",wateraffairs_name:"成都市岷江水站"},
                // {id             : 2,sn:"854300010022",device_name:"输水管水压监测",line_num:"1",online:"1",wateraffairs_name:"成都市岷江水站"}],
                waterAffairsList: this.$store.getters["siteConfig/renderWaterData"],
                waterafirrsId   : "",
                activeID        : "all",//选中查看的流水线ID
                assemblyLineData: this.$store.getters["siteConfig/renderProcessingLineList"],//该站下流水线列表
                timer           : "",//定时器
                timerValue      : 5000,//定时器时间,毫秒数
                videoTitle      : "添加摄像头",
                videoDevSn      : "",
                videoDevName    : "",
                videoFlag       : "add",
                lineNum         : "",
                curPageList     : [],
                empty_notice    : "暂无视频，请添加摄像头",
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
            // this.getVideoList();
            // let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
            // this.curPageList = this.videoList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            // this.createPage(this.videoList);
        },
        beforeDestroy() {
            this.$loading.hide();
            // 页面注销清理定时器
            clearInterval(this.timer);
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
                this.curPageList = this.videoList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
            /**
             * [获取视频数据]
             * @return {[type]} [description]
             */
            getVideoList(){
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url: "",
                        method: "get",
                        data:{
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.videoList  = jsonData.data;
                            let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
                            this.curPageList = this.videoList.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
                            // this.createPage(jsonData.data);
                        }else{
                            // this.$toast(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.empty_notice = "暂无数据";
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$toast("获取数据失败");
                    this.$loading.hide();
                };
            },

             /**
             * [分页]
             * @param  {[type]} tmpData [description]
             * @return {[type]}         [description]
             */
            createPage(tmpData) {
                if(tmpData.length==0){
                    this.empty_notice = "暂无数据";
                }
                let _t = this;

                $("#accountManagePage").pagination({
                    items      : tmpData.length,
                    itemsOnPage: _t.itemsOnPage,
                    onPageClick:function(pageNumber,index,basicNumber,event){
                        _t.itemsOnPage     = basicNumber;//分页基数修改后，重置
                        let tmpSliceNumber = (pageNumber-1)*basicNumber;
                        _t.currentPage     = pageNumber;
                        _t.videoList       = tmpData.slice(tmpSliceNumber,(tmpSliceNumber+basicNumber));
                    },
                    onInit:function(basicNumber){
                        _t.currentPage = 1;
                        _t.videoList  = tmpData.slice(0,basicNumber);
                    }
                });
            },

            videomanage(transItem){
                this.dialogAddVideoVisible = true;
            },
            cloudDevSave(){
                this.dialogAddVideoVisible = false;
            }
        }
    }
</script>

<style scope>
    .width500{
        width: 35.714286rem;
    }
</style>
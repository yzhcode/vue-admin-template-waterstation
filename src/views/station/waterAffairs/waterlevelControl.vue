<template>
  <div class="waterlevelControlMain">
    <el-button class="mb-15" type="primary" @click="waterLevelManage()">添加水位</el-button>
    <p class="emptyItem" v-show="showWaterLevelList.length == 0">
            暂无数据
        </p>
    <el-table :data="showWaterLevelList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}" v-show="showWaterLevelList.length > 0">
          <el-table-column
            type="index"
            min-width="10%"
            align="center"
          >
          </el-table-column>

          <el-table-column
            label="水位"
            min-width="15%"
            prop="waterlevel">
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
              <el-select v-model="scope.row.status" @change="modifyWaterLevelStatus(scope.$index, scope.row.status)">
                <el-option value="1" label="启用"></el-option>
                <el-option value="0" label="禁用"></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            min-width="20%">
            <template slot-scope="scope">
              <el-button type="primary" @click="waterLevelManage(scope.$index)">编辑</el-button>
              <el-button type="danger" @click="sureWaterLevelDelete(scope.$index)">删除</el-button>
            </template>
          </el-table-column>

        </el-table>

    <el-pagination v-show="showWaterLevelList.length > 0"
      @current-change="handleCurrentChange"
      layout="total, prev, pager, next"
      :total="waterLevelList.length">
    </el-pagination>
    <div id="waterlevelManagePage" class="paginationManage"></div>

    <!-- 水位 -->
    <el-dialog :title="waterLevelManageTitle" :visible.sync="dialogTableVisible" width="500px">
            <el-form ref="form" label-width="80px">
                <el-form-item label="水位" required>
                  <el-input type="text" v-model.trim="waterlevel"></el-input>
                </el-form-item>
                <el-form-item label="规则描述" required>
                    <el-input type="textarea" v-model.trim="desc"></el-input>
                </el-form-item>

                <el-form-item label="状态">
                    <el-select v-model="waterlevelStatus">
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
      <el-dialog title="提示" :visible.sync="deleteWaterDialogVisible" width="30%">
          <span>确定要删除吗？</span>
          <span slot="footer" class="dialog-footer">
              <el-button @click="deleteWaterDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="deleteWaterLever()">确 定</el-button>
          </span>
      </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialogTableVisible    : false,
      queryDataInfo         : "查询中",
      itemsOnPage           : 10, //分页基数
      currentPage           : 1, //当前页
      waterLevelList        : [], //水位控制列表
      showWaterLevelList    : [],
      waterLevelManageFlag  : "add",
      waterLevelManageTitle : "添加水位控制",
      waterlevel            : "",
      desc                  : "",
      waterlevelStatus      : '1',
      editIndex             : 0,
      deleteWaterDialogVisible : false,
      deleteWaterIndex      : 0,
    }
  },
  components: {},
  watch: {},
  mounted() {
    // 获取水位控制列表
    this.getwaterlevelList();
  },
  methods: {
    /**
     * [点击分页事件]
     * @param  {[type]} val [第几页]
     */
    handleCurrentChange(val){
      this.currentPage = val;
      let tmpSliceNumber = (this.currentPage - 1) * this.itemsOnPage;
      this.showWaterLevelList = this.waterLevelList.slice(tmpSliceNumber, (tmpSliceNumber + this.itemsOnPage));
    },
    /**
     * [获取水位控制列表]
     */
    getwaterlevelList() {
      let dataStr = window.localStorage.getItem("localWaterlevelData");
      var localData = JSON.parse(dataStr);
      if (localData == null || localData.length == 0) {
        // 默认数据
        var defaultData = [{"waterlevel":"10米", "desc":"水位低于10米开启水闸", "status":"1"},
                           {"waterlevel":"15米", "desc":"水位达到15米检测PH值、余氯值", "status":"1"},
                           {"waterlevel":"18米", "desc":"水位达到18米检测浊度值", "status":"0"},
                           {"waterlevel":"20米", "desc":"水位达到20米检测PH值", "status":"1"},
                           {"waterlevel":"27米", "desc":"水位达到27米检测浊度值", "status":"0"},
                           {"waterlevel":"29米", "desc":"水位达到29米关闭水闸", "status":"1"}];

        localData = defaultData;
      }
      this.waterLevelList = localData;
      this.refreshLocalData(this.waterLevelList);
    },
    /**
     * [修改本地数据]
     * @param  {[type]} tmpData [数据源]
     */
    refreshLocalData(tmpData) {
      if (tmpData.length == 0) {
        this.queryDataInfo = "无数据项";
      }

      let dataStr = JSON.stringify(tmpData);
      localStorage.setItem("localWaterlevelData", dataStr);

      let tmpSliceNumber = (this.currentPage - 1) * this.itemsOnPage;
      this.showWaterLevelList = this.waterLevelList.slice(tmpSliceNumber, (tmpSliceNumber + this.itemsOnPage));
    },
    /**
     * [添加/修改 水位控制]
     * @param  {[type]} index [编辑那一行的index]
     */
    waterLevelManage(index) {
      if ("undefined" == typeof index) {
        this.waterLevelManageTitle = "添加水位控制";
        this.waterLevelManageFlag = "add";
        this.waterlevel = "";
        this.desc = "";
        this.waterlevelStatus = "1";
      } else {
        this.editIndex = (this.currentPage - 1) * this.itemsOnPage + index;
        let transData = this.waterLevelList[this.editIndex];
        this.waterLevelManageTitle = "修改水位控制";
        this.waterLevelManageFlag = "modify";
        this.waterlevel = transData.waterlevel;
        this.desc = transData.desc;
        this.waterlevelStatus = transData.status;
      }
      this.dialogTableVisible = true;
    },
    /**
    * [确定删除弹出框]
    * @param  {[type]} index [删除那一行的index]
    */
    sureWaterLevelDelete(index){
      this.deleteWaterDialogVisible = true;
      this.deleteWaterIndex = (this.currentPage - 1) * this.itemsOnPage + index;
    },
    /**
    * [删除水位控制]
    */
    deleteWaterLever() {
      this.deleteWaterDialogVisible = false;
      let transData = this.waterLevelList[this.deleteWaterIndex];
      this.waterLevelList.splice(this.deleteWaterIndex, 1);
      if ((this.deleteWaterIndex % this.itemsOnPage == 0) && (this.showWaterLevelList.length == 1)) {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
      }
      this.refreshLocalData(this.waterLevelList);
    },
    /**
     * [保存水位设置]
     */
    onSubmit() {
      if (!this.waterlevel) {
        this.$toast("请填写水位");
        return;
      }
      if (!this.desc && this.waterLevelManageFlag == "add") {
        this.$toast("请填写规则描述");
        return;
      }
      this.waterLevelManageSaveCallback();
    },

    /**
     * [保存水位回调函数]
     */
    waterLevelManageSaveCallback() {
      this.dialogTableVisible = false;
      // 添加
      if (this.waterLevelManageFlag == "add") {
        let waterlevel = { "waterlevel": this.waterlevel, "desc": this.desc, "status": this.waterlevelStatus };
        this.waterLevelList.push(waterlevel);
      } else {
        // 修改
        let waterLevel = { "waterlevel": this.waterlevel, "desc": this.desc, "status": this.waterlevelStatus };
        this.waterLevelList.splice(this.editIndex, 1, waterLevel);
      }

      this.$toast("保存成功");
      this.refreshLocalData(this.waterLevelList);
    },
    /**
     * [启用/禁用水位控制]
     * @param  {[type]} index  [操作那一行的index]
     * @param  {[type]} transValue [编辑后的新值]
     */
    modifyWaterLevelStatus(index, transValue) {
      let modifyIndex = (this.currentPage - 1) * this.itemsOnPage + index;
      let waterLevel = this.waterLevelList[modifyIndex];
      waterLevel.status = transValue;
      this.waterLevelList.splice(modifyIndex, 1, waterLevel);
      this.$toast("保存成功");
      this.refreshLocalData(this.waterLevelList);
    },
  }
}

</script>

<style scope>
</style>

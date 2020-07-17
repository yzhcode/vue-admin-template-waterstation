<template>
  <div class="areaMange">
    <el-button type="primary" class="mb-15" @click="addArea()">添加区域</el-button>
    <p class="emptyItem" v-show="dataSource.length == 0">{{empty_notice}}</p>
    <el-table v-loading="listLoading" element-loading-text="努力加载中..." :data="dataSource" border stripe
      :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
      <el-table-column type="index" min-width="10%" align="center" :index="indexMethod">
      </el-table-column>

      <el-table-column label="区域名称" min-width="20%">
        <template slot-scope="scope">
          {{scope.row.region | nullValueFormat}}
        </template>
      </el-table-column>

      <el-table-column label="区域类型" min-width="20%">
        <template slot-scope="scope">
          {{scope.row.type | filterAreaType}}
        </template>
      </el-table-column>

      <el-table-column label="最后修改时间" min-width="50%">
        <template slot-scope="scope">
          {{$timer.getTimeByFilter(scope.row.ctime) | nullValueFormat}}
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="25%">
        <template slot-scope="scope">
          <el-button type="primary" @click="addArea(scope.row)">编辑</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-pagination v-show="allData.length > 0" @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="currentPage" :total="allData.length" layout="total, prev, pager, next">
    </el-pagination>

    <!-- 区域配置 -->
    <el-dialog :title="editRowDialogTitle" :visible.sync="editRowDialogVisible" width="400px">
      <el-form ref="form" label-width="80px">
        <el-form-item label="区域名称" required>
          <el-input type="text" v-model.trim="areaName" maxlength='20'></el-input>
        </el-form-item>
        <el-form-item label="区域类型">
          <el-select v-model="areaType" :disabled="!editRowIsAdd">
            <el-option v-for="item in areaArray" :key="item.value" :label="item.label" :value="item.value">
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
let that;
export default {
  data() {
    return {
      listLoading: true,

      editRowForm: {
        areaID: "",
        areaOldName: "",
        areaName: "",
        areaType: "1",
      },
      editRowDialogVisible: false,
      editRowIsAdd: true,

      itemsOnPage: 10, //分页基数
      currentPage: 1, //当前页

      allData: [], //区域列表全部数据
      dataSource: [], //当前页面区域列表数据

      empty_notice: '加载中...',
      areaArray: [{
          value: "1",
          label: '政府区域'
        },
        {
          value: "2",
          label: '华晨区域'
        }
      ],
    }
  },
  computed: {
    editRowDialogTitle: function() {
      return this.editRowIsAdd?"添加区域":"修改区域";
    }
  },
  components: {},
  watch: {},
  filters: {
    nullValueFormat(transValue) {
      return transValue ? transValue : "-";
    },
    filterAreaType(type) {
      let typename = null;

      let find = that.areaArray.find(function(element) {
        return element.value == type;
      });

      if (find) {
        typename = find.label;
      }

      return typename | that.nullValueFormat;
    }
  },
  mounted() {
    // 获取admin账号的区域列表
    this.getAreaList();
  },
  beforeCreate() {
    that = this;
  },

  beforeDestroy() {
    // $('.modal').modal('hide');
  },
  methods: {
    indexMethod(index) {
      return (this.currentPage - 1) * this.itemsOnPage + index + 1;
    },
    handleSizeChange(val) {
      this.itemsOnPage = val;
      this.getDataSource();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDataSource();
    },
    getDataSource() {
      let tmpSliceNumber = (this.currentPage - 1) * this.itemsOnPage;
      this.dataSource = this.allData.slice(tmpSliceNumber, (tmpSliceNumber + this.itemsOnPage));
    },
    /**
     * [获取admin账号的区域列表]
     * @return {[type]} [description]
     */
    getAreaList() {
      try {
        this.listLoading = true
        this.$fetch({
          url: '/Web/Manage/region_list?action=get',
          method: "get"
        }).then(res => {
          let jsonData = res.data;
          if (jsonData.result == "success") {
            this.allData = jsonData.data;
            this.getDataSource();
            if (this.dataSource.length == 0) {
              this.empty_notice = '暂无数据,请添加区域';
            }
          } else {
            this.$popup.showToastErrmsg(jsonData.errmsg);
          }
        }).finally(() => {
          this.listLoading = false
        });
      } catch (e) {
        this.$popup.showToastErrmsg();
        console.log("getAreaList: " + e);
      };
    },

    addArea(data) {
      if (!data) {
        // this.editRowTitle = "添加区域";
        this.editRowIsAdd = true;

        this.editRowForm.areaID = "";
        this.editRowForm.areaName = "";
        this.editRowForm.areaType = "1";

      } else {
        // this.editRowTitle = "修改区域";
        this.editRowIsAdd = false;

        this.editRowForm.areaID = data.id;
        this.editRowForm.areaName = data.region;
        this.editRowForm.areaOldName = data.region;
        this.editRowForm.areaType = String(data.type);
      }

      this.editRowDialogVisible = true;
    },
    /**
     * [保存区域设置]
     * @return {[type]} [description]
     */
    areaManageSave() {
      if (!this.editRowForm.areaName) {
        this.$popup.showToastErrmsg("请填写区域名称");
        return;
      }
      if (!this.editRowIsAdd && this.editRowForm.areaName == this.areaOldName) {
        this.$popup.showToastErrmsg("区域名称未作修改");
        return;
      }
      this.areaManageSaveCallback();
    },
    /**
     * [保存区域设置回调函数]
     * @return {[type]} [description]
     */
    areaManageSaveCallback() {
      try {
        let _tmpDataJson = {
          url: '',
          data: {

          }
        };
        // 添加
        if (this.editRowIsAdd) {
          _tmpDataJson.url = "/Web/Manage/region_create?action=post";
          _tmpDataJson.data = {
            region: this.editRowForm.areaName,
            type: this.editRowForm.areaType,
          }
        } else {
          // 修改
          _tmpDataJson.url = "/Web/Manage/region_change?action=post";
          _tmpDataJson.data = {
            id: this.editRowForm.areaID,
            region: this.editRowForm.areaName,
          }
        }
        this.$fetch({
          url: _tmpDataJson.url,
          method: "post",
          data: _tmpDataJson.data,
        }).then(res => {
          let jsonData = res.data;
          if (jsonData.result == "success") {
            this.$popup.showToastErrmsg("保存成功");
            this.editRowDialogVisible = false;
            // 更新数据
            this.getAreaList();
          } else {
            this.$popup.showToastErrmsg(jsonData.errmsg, "保存失败");
          }
        });
      } catch (e) {
        this.$popup.showToastErrmsg("保存失败");
        console.log("areaManageSaveCallback: " + e);
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
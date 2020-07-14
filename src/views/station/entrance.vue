<template>
    <div class="entrance">
        <div class="side-bar">
            <el-menu v-if="userRole=='2' || userRole=='3'"
                :default-active="$route.name"
                @select="handleSelect">

                <el-submenu index="1">
                  <template slot="title">
                    <span class="font-s-18 iconfont icon-menu-smart"></span>
                    <span>实时监控</span>
                  </template>

                  <el-menu-item-group>
                    <el-menu-item index="processingLineManage">水线图</el-menu-item>
                    <el-menu-item index="dataMonitoring">水质监控</el-menu-item>
                    <el-menu-item index="videoMonitoring">实时视频</el-menu-item>
                  </el-menu-item-group>
                </el-submenu>

                <el-submenu index="2">
                  <template slot="title">
                    <span class="font-s-18 iconfont icon-menu-statistics"></span>
                    <span>数据分析</span>
                  </template>

                  <el-menu-item-group>
                    <el-menu-item index="alarmLog">报警日志</el-menu-item>
                    <el-menu-item index="statisticsTrend">历史数据</el-menu-item>
                  </el-menu-item-group>
                </el-submenu>

                <el-menu-item index="workOrderManager">
                  <span class="font-s-18 iconfont icon-menu-whole"></span>
                  <span slot="title">我的工单</span>
                </el-menu-item>

                <el-menu-item index="attendance">
                  <span class="font-s-18 iconfont icon-menu-account"></span>
                  <span slot="title">巡查统计</span>
                </el-menu-item>
              </el-menu>
        </div>
        <div class="main">
            <div class="main-position">
                <div class="main-container">
                    <router-view v-if="refreshNowPage===false"></router-view>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            sid                   : this.$route.query.sid,
            userRole              : this.$store.getters["siteConfig/renderUserRole"],//账号角色
            refreshNowPage        : false,
        }
    },
    components:{
    },
    watch:{
      '$route.query.sid'(newval,oldval){
        this.sid = newval;
      },
      '$route' (to, from) { //监听路由是否变化
        if (to.path === from.path) {
          this.refreshNowPage = true;
          // $nextTick() 将回调延迟到下次 DOM 更新循环之后执行
          this.$nextTick(() => {
            this.refreshNowPage = false;
          });
        }
      },
    },
    created(){
    },
    mounted(){
    },
    methods:{
        handleSelect(key, keyPath) {
            this.$router.push({name:key,query:{'sid': this.sid}});
        }
    }
}

</script>
<style lang="less" scoped>
  .el-menu-item{
    font-size: 16px;
    color: #000000;
    height: 60px;
  }
  .el-menu-item.is-active {
    color: #FFFFFF;
    background-color: #2582F7;
    span.iconfont{
      color: #FFFFFF;
      margin-right: 5px;
    }
  }
  .el-menu-item span.iconfont{
    color: #2582F7;
    margin-right: 5px;
  }
  .el-submenu__title{
    span.iconfont{
      color: #2582F7;
      margin-right: 5px;
    }
  }
  .el-submenu .el-menu-item{
    height: 60px;
    line-height: 60px;
    padding-left: 50px !important;
  }

</style>

<style>
  .el-submenu .el-submenu__title {
    font-size: 16px;
  }
  .el-menu-item-group__title {
    padding: 0 !important;
  }
</style>

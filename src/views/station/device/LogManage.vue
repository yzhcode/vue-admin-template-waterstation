<template>
    <div class="plcManageMain">
        <el-button title="上一页" icon="el-icon-arrow-left" circle @click="goback()"></el-button>

        <p class="emptyItem" v-show="LogTypeList.length==0">
            {{empty_notice}}
        </p>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                LogTypeList  : [],
                empty_notice : "暂无数据",
            }
        },
        components:{
        },
        watch:{
        },
        mounted(){
            // DOM操作
            this.bindDom();
            // 获取全局环境变量列表
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        methods:{
            bindDom() {
                
            },
            goback(){
                this.$router.back(-1);
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
        }
    }
</script>

<style scope>
    
</style>
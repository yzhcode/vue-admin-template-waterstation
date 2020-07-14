<template>
    <div class="assemblyLine" v-if="assemblyLineData.length != 0">
        <div class="btn-group" role="group" aria-label="Basic example">
            <button type="button"
            v-for="(items, indexs) in assemblyLineData"
            :class="['btn','width100',selectID == items.line_num ? 'btn-primary' : 'btn-secondary']"
            @click="setActive(items.line_num)">
                {{"水线"+items.line_num}}
            </button>
        </div>
    </div>
</template>
<script>
    export default {
        name: "assemblyLine",
        data(){
            return{
                selectID        : this.activeID,
                assemblyLineData:[],
            }
        },
        model: {
            prop: "activeID",
            event: "click"
        },
        props: {
            waterid: {
                type: String
            },
            activeID: {
                type: String
            },
        },
        watch: {
            /**
             * [监控value变化，处理异步情况]
             * @param  {[type]} newValue [description]
             * @param  {[type]} oldValue [description]
             * @return {[type]}          [description]
             */
            activeID(newValue,oldValue){
                this.selectID = newValue;
            },
            /**
             * [监控水线数据变化]
             */
            '$store.state.siteConfig.waterAffairsLine'(data) {
                this.assemblyLineData = data;
            },
        },
        computed: {
        },
        created(){
            this.global_.getWaterAffairsLine(this.waterid);
        },
        mounted(){
        },
        methods:{
            /**
             * [通知父组件，修改v-model]
             * @param {[type]} transValue [description]
             */
            setActive(transValue){
                this.$emit("click",transValue);
            },
        },
    }
</script>

<style scoped>
    .assemblyLine{
        font-size: 1.142857rem;
        margin: 0 0 1.071429rem 0;
        display: flex;
    }
</style>
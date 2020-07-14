<template>
    <div class="datePicker" >
        <el-select
            v-model="type"
            style="max-width:80px"
            placeholder="请选择"
            @change="changeSelectValue">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        <el-date-picker
            style="max-width:150px"
            @change="changeDate"
            v-model="time"
            :clearable=false
            :type=type
            placeholder="选择日期">
        </el-date-picker>
    </div>
</template>
<script>
export default {
    name: "datePicker",
    data(){
        return{
            time                 : new Date(this.date),
            type                 : this.dateType == "day" ? "date" : this.dateType,
            options              : [{value: 'date',label: '按日'},
                                    {value: 'month',label: '按月'},
                                    {value: 'year',label: '按年'}],
        }
    },
    props: {
        date: { // 日期类型
            type: String,
            default: () => {
                return this.timeUtil.getDateByType(new Date(),'day')
            }
        },
        dateType:{
            type:String,
            default:() => {
                return 'date'
            }
        },
    },
    methods:{
        changeSelectValue(){
            if(this.type === "date"){
                this.$emit('update:dateType', 'day');
            }else{
                this.$emit('update:dateType', this.type);
            }
            this.changeDate();
        },
        changeDate(){
            this.$emit('update:date', this.timeUtil.getDateByType(this.time, this.type == "date" ? "day" : this.type),);
        },
    },
}
</script>

<style lang="less" scoped>
.datePicker{
    float: left;
}
</style>
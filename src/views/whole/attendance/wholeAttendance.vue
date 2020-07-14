<template>
    <div class="whole-attendance">
        <ul class="whole-attendance-table">
            <li v-for="(items, index) in attendanceList">
                <div class="whole-wateraffairs-item-view">
                    <div class="whole-wateraffairs-name water-n-1 font-s-20">{{items.water.wateraffairs_name}}</div>

                    <div class="whole-attendance-month-statistic">
                        <div class="whole-attendance-month-title">{{dateformatToYearMonthStr(items.defaultDate) + '巡查统计'}}</div>

                        <div class="whole-attendance-month-statistic-data">
                            <div class="whole-attendance-month-statistic-unit">
                                <div>已打卡</div>
                                <div>{{items.attendanceArray.length}}</div>
                            </div>
                            <div class="whole-attendance-month-statistic-unit whole-month-attendance-absence">
                                <div>未打卡</div>
                                <div>{{items.monthDays - items.attendanceArray.length}}</div>
                            </div>
                        </div>
                        <div class="whole-total-dotted-line"></div>
                    </div>

                    <el-calendar class="whole-wateraffairs-calendar" v-model="items.defaultDate">
                        <template slot="dateCell" slot-scope="{data}">
                            <div>
                                <div v-for="(attendanceItem, attendanceIndex) in items.attendanceArray">
                                    <div class="whole-calendar-is-attending-flag" v-if="(attendanceItem.record_time.split(' ').slice(0, 1).join('')) == data.day"></div>
                                </div>
                                <div class="whole-calendar-day-selected-flag" ></div>
                                <div class="whole-calendar-day-text" @click="currentMonthDayClick(items, data.day)">{{data.day.split('-').slice(2).join('-')}}</div>
                            </div>
                        </template>
                    </el-calendar>
                </div>
                <div class="whole-change-month-btn-group">
                    <div class="previousMonthBtn" @click="previousMonthClick(items)">上个月</div>
                    <div class="change-month-btn-group-line"></div>
                    <div class="currentMonthBtn"  @click="currentMonthClick(items)">本月</div>
                    <div class="change-month-btn-group-line"></div>
                    <div class="nextMonthBtn"     @click="nextMonthClick(items)">下个月</div>
                </div>

                <div class="whole-attendance-detail">
                    <div :class="['whole-attendance-flag', items.isAttending ? 'whole-attendance-normal' : 'whole-attendance-absence']">
                        {{items.isAttending ? '正常打卡' : '无记录'}}
                    </div>
                    <div>{{items.attendanceTime}}</div>
                </div>

            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                attendanceList : [],
            }
        },
        components:{
        },
        watch:{
        },
        beforeDestroy(){
            this.$loading.hide();
        },
        mounted(){
            this.global_.waterListload();
            this.createCalendar();
            // 查询所有水站考勤
            this.queryAllAttendance();
        },
        methods:{
            /**
             * [根据水站个数创建默认UI]
             * @return {[type]} [description]
             */
            createCalendar(){
                var waterData = this.$store.getters["siteConfig/renderWaterData"];//水站列表
                var waterAffCount = waterData.length;
                var tempData = [];
                let defaultDate = new Date();
                let monthDays = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                for (var i = 0; i < waterAffCount; i++) {
                    var water = waterData[i];
                    var item = {"water":water, "attendanceArray":[], "defaultDate":defaultDate, "monthDays":monthDays, "isAttending":false, "attendanceTime":"当天没有打卡记录"};
                    tempData.push(item);
                }
                this.attendanceList = tempData;
            },
            currentMonthDayClick(items, day){
                let attendanceCount = items.attendanceArray.length;
                items.isAttending = false;
                items.attendanceTime = '当天没有打卡记录';
                for (var i = 0; i < attendanceCount; i++) {
                    let attendanceItem = items.attendanceArray[i];
                    if (attendanceItem.record_time.split(' ').slice(0, 1).join('') == day) {
                        items.isAttending = true;
                        items.attendanceTime = '打卡时间：' + attendanceItem.record_time;
                        break;
                    }
                }
            },
            previousMonthClick(items){
                var date              = items.defaultDate;
                var currentMonth      = date.getMonth();
                var nextMonth         = --currentMonth;
                var previousMonth = new Date(date.getFullYear(), nextMonth, 1);
                items.defaultDate     = previousMonth;
                items.monthDays       = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
                var endDate           = this.getMonthLastDay(previousMonth);
                let startDayStr       = this.global_.dateformatToString(previousMonth);
                let endDayStr         = this.global_.dateformatToString(endDate);
                this.querySingleWaterAttendance(items, startDayStr, endDayStr);
            },
            currentMonthClick(items){
                let startDay      = this.getMonthFirst(new Date());
                let endDay        = new Date();
                items.defaultDate = startDay;
                items.monthDays   = new Date(startDay.getFullYear(), startDay.getMonth() + 1, 0).getDate();
                let startDayStr   = this.global_.dateformatToString(startDay);
                let endDayStr     = this.global_.dateformatToString(endDay);
                this.querySingleWaterAttendance(items, startDayStr, endDayStr);
            },
            nextMonthClick(items){
                var date              = items.defaultDate;
                var currentMonth      = date.getMonth();
                var nextMonth         = ++currentMonth;
                var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
                items.defaultDate     = nextMonthFirstDay;
                items.monthDays       = new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth() + 1, 0).getDate();
                var endDate           = this.getMonthLastDay(nextMonthFirstDay);
                let startDayStr       = this.global_.dateformatToString(nextMonthFirstDay);
                let endDayStr         = this.global_.dateformatToString(endDate);
                let dateSelected = nextMonthFirstDay.getTime();
                let dateNow = new Date().getTime();
                if (dateSelected > dateNow){
                    items.attendanceArray = [];
                    var selectedDay = startDayStr.split(' ').slice(0, 1).join('');
                    this.currentMonthDayClick(items, selectedDay);
                } else {
                    this.querySingleWaterAttendance(items, startDayStr, endDayStr);
                }
            },
            /**
             * [查询单个水站的考勤记录]
             * @param  {[type]} item      [description]
             * @param  {[type]} startTime [开始时间]
             * @param  {[type]} endTime   [结束时间]
             * @return {[type]}           [description]
             */
            querySingleWaterAttendance(item, startTime, endTime){
                try{
                    this.$fetch({
                        url   : "Web/Additional/attendance_waterstation_history?action=get",
                        method: "get",
                        data  : {
                            wateraffairs_id : item.water.id,
                            start_time      : startTime,
                            end_time        : endTime,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data) {
                                var data = jsonData.data;
                                if (data.attendance_list instanceof Array) {
                                    item.attendanceArray = data.attendance_list;
                                } else {
                                    item.attendanceArray = [];
                                }
                                var selectedDay = startTime.split(' ').slice(0, 1).join('');
                                this.currentMonthDayClick(item, selectedDay);
                            }
                        } else {
                            if (jsonData.errmsg) {
                                this.$toast(jsonData.errmsg);
                            } else {
                                this.$toast('数据获取失败');
                            }
                        }
                    }).finally(() => {

                    });
                }catch(e){
                    this.$toast('数据获取失败');
                };
            },
            /**
             * [查询所有水站考勤记录]
             * @return {[type]} [description]
             */
            queryAllAttendance(){
                let startDay    = this.getMonthFirst(new Date());
                let endDay      = new Date();
                let startDayStr = this.global_.dateformatToString(startDay);
                let endDayStr   = this.global_.dateformatToString(endDay);
                this.$loading.show("请稍等");
                try{
                    this.$fetch({
                        url   : "Web/Additional/attendance_all_history?action=get",
                        method: "get",
                        data  : {
                            start_time: startDayStr,
                            end_time  : endDayStr,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data) {
                                var data = jsonData.data;
                                var allAttendance = [];
                                if (data.attendance_list instanceof Array) {
                                    allAttendance = data.attendance_list;
                                }
                                var waterData = this.$store.getters["siteConfig/renderWaterData"];//水站列表
                                var waterAffCount = waterData.length;
                                var tempsData = [];
                                let defaultDate = new Date();
                                let monthDays = new Date(defaultDate.getFullYear(), defaultDate.getMonth() + 1, 0).getDate();
                                for (var i = 0; i < waterAffCount; i++) {
                                    var water = waterData[i];
                                    var kaoqininArray = this.filerAttendanceItem(allAttendance, water.id);
                                    var item = {"water":water, "attendanceArray":kaoqininArray, "defaultDate":defaultDate, "monthDays":monthDays, "isAttending":false, "attendanceTime":"当天没有打卡记录"};
                                    tempsData.push(item);
                                }
                                this.attendanceList = tempsData;

                                //更新下默认的打卡记录
                                for (var i = 0; i < this.attendanceList.length; i++) {
                                    let item = this.attendanceList[i];
                                    var selectedDay = endDayStr.split(' ').slice(0, 1).join('');
                                    this.currentMonthDayClick(item, selectedDay);
                                }
                            }
                        } else {
                            if (jsonData.errmsg) {
                                this.$toast(jsonData.errmsg);
                            } else {
                                this.$toast('数据获取失败');
                            }
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.$loading.hide();
                    this.$toast('数据获取失败');
                };
            },
            //整理数据分类
            filerAttendanceItem(allData, waterId){
                var filterArray = [];
                let itemCount = allData.length;
                for (var i = 0; i < itemCount; i++) {
                    var allAttendanceItem = allData[i];
                    if (allAttendanceItem.wateraffairs_id == waterId) {
                        filterArray.push(allAttendanceItem);
                    }
                }

                return filterArray;
            },
            /**
             * [获取某月的第一天]
             * @param  {[type]} date [日期 Date类型]
             * @return {[type]}      [description]
             */
           getMonthFirst(date){
                var month    = date.getMonth();
                var firstDay = new Date(date.getFullYear(), month, 1);

                return firstDay;
           },
           /**
            * 获取某月的最后一天
            */
           getMonthLastDay(date){
                var month             = date.getMonth();
                var nextMonth         = ++month;
                var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
                //下个月第一天减去1秒就是当月的最后
                return new Date(nextMonthFirstDay - 1);
            },
            /**
            * 获取年月字符串
            */
            dateformatToYearMonthStr(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                return y + '年' + m + '月';
            },
        }
    }
</script>
<style lang="less" scope>
.whole-attendance-table{
    li {
        float: left;
        width: 450px;
        padding-left: 0px;
        margin-bottom: 16px;
        height: 645px;
    }
}
.attendance-month-statistic{
    width: 400px;
    height: 100px;
    margin-bottom: 5px;
}
.whole-attendance-month-title{
    margin-left:22px;
    color: gray;
    font-size: 18px;
}
.whole-attendance-month-statistic-data{
    margin-top: 10px;
    width: 600px;
    height: 60px;
    padding-top: 1px;
    text-align: center;
}
.whole-attendance-month-statistic-unit{
    margin-left: 30px;
    width: 70px;
    height: 58px;
    text-align: center;
    color: #40A1FD;
    padding: 2px 0px;
    font-size: 18px;
    border-style: solid; border-width: 1px; border-color: #E2EAFF;
    float: left;
}
.whole-month-attendance-absence{
    color: #FF2642;
}
.whole-total-dotted-line{
    margin-top: 15px;
    height: 1px;
    width: 400px;
    border-top: dashed; border-width: 1px; border-color: #EBEEF5;
}
.whole-change-month-btn-group{
    margin-top: 172px;
    margin-left: 186px;
    height: 28px;
    width: 196px;
    font-size: 12px;
    color: #606266;
    text-align: center;
    line-height: 28px;
    border-radius: 3px;
    position: absolute;
    float: left;
    border-style: solid; border-width: 1px; border-color: #606266;
}
.whole-change-month-btn-group .change-month-btn-group-line{
    height: 26px;
    width: 1px;
    background: #606266;
    float: left;
}
.whole-change-month-btn-group .previousMonthBtn{
    cursor: pointer;
    width: 68px;
    height: 26px;
    float: left;
}
.whole-change-month-btn-group .previousMonthBtn:hover{
    background: #EDF5FE;
}
.whole-change-month-btn-group .currentMonthBtn{
    cursor: pointer;
    width: 56px;
    height: 26px;
    float: left;
}
.whole-change-month-btn-group .currentMonthBtn:hover{
    background: #EDF5FE;
}
.whole-change-month-btn-group .nextMonthBtn{
    cursor: pointer;
    width: 68px;
    height: 26px;
    float: left;
}
.whole-change-month-btn-group .nextMonthBtn:hover{
    background: #EDF5FE;
}
.whole-attendance-detail{
    margin-left: 22px;
    margin-top: 585px;
    height: 60px;
    width: 350px;
    position: absolute;
}
.whole-attendance-flag{
    height: 26px;
    line-height: 26px;
    text-align: center;
    width: 80px;
    border-radius: 13px;
    margin-bottom: 5px;
    color: white;
}
.whole-attendance-normal{
    background: #40A1FD;
}
.whole-attendance-absence{
    background: #FF2642;
}
.whole-wateraffairs-item-view{
    width: 400px;
    height: 645px;
    background: white;
    box-shadow: 0px 2px 4px 0px rgba(37,130,247,0.2);
    border-radius: 0.571428rem;
    position: absolute;
}
.whole-wateraffairs-name{
    margin-left: 22px;
    line-height: 50px;
}
.whole-wateraffairs-calendar{
    width: 400px;
    height: 460px;
    border-radius: 0.571428rem;
}
.whole-wateraffairs-calendar .el-calendar-table thead th {
    text-align: center;
}
.whole-wateraffairs-calendar .el-calendar-table .el-calendar-day {
    padding: 0px;
    height: 50px;
    line-height: 50px;
}
.whole-wateraffairs-calendar table tbody tr td {
    padding-top: 0rem;
    padding-bottom: 0rem;
    height: 50px;
    padding-left: 0rem;
    padding-right: 0rem;
    text-align: center;
}

.whole-wateraffairs-calendar .el-calendar-table .el-calendar-day:hover {
    background: transparent;
    .whole-calendar-day-selected-flag{
        background: #1DB084;
    }
}
.whole-wateraffairs-calendar .el-calendar-table td.is-selected {
    background: transparent;
    .whole-calendar-day-selected-flag{
        background: #1DB084;
    }
}
//显示样式-日期
.whole-calendar-day-text{
    width: 50px;
    height: 50px;
    margin-left: 0px;
    margin-top: 0px;
    position: absolute;
    color: black;
}
.whole-wateraffairs-calendar .el-calendar__header .el-calendar__button-group{
    display: none;
}
//是否考勤标记
.whole-calendar-is-attending-flag{
    width: 6px;
    height: 6px;
    margin-left: 22px;
    margin-top: 42px;
    position: absolute;
    border-radius: 3px;
    background: #40A1FD;
}
.whole-calendar-day-selected-flag{
    background: transparent;
    width: 30px;
    height: 30px;
    margin-left: 10px;
    margin-top: 10px;
    position: absolute;
    border-radius: 15px;
}
//非当月的取消点击事件
.el-calendar-table:not(.is-range) td.next, .el-calendar-table:not(.is-range) td.prev{
    pointer-events: none;
    .whole-calendar-day-text{
        color: gray;
    }
}
</style>
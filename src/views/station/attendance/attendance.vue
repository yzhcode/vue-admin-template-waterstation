<template>
    <div class="station-attendance">
        <div class="station-wateraffairs-item-view">

            <div class="attendance-month-statistic">
                <div class="attendance-month-statistic-title">{{lastyearMonth + '巡查统计'}}</div>
                <div class="attendance-month-statistic-data">
                    <div class="attendance-month-statistic-unit">
                        <div>已打卡</div>
                        <div>{{attendanceList.length}}</div>
                    </div>
                    <div class="attendance-month-statistic-unit station-attendance-absence">
                        <div>未打卡</div>
                        <div>{{monthDays - attendanceList.length}}</div>
                    </div>
                </div>
                <div class="attendance-dotted-line"></div>
            </div>

            <el-calendar class="station-wateraffairs-calendar" v-model="timeDate" id="calendar">
                <template slot="dateCell" slot-scope="{data}">
                    <div class="calendar-show-custom">
                        <div class="station-calendar-day-selected"></div>
                        <div class="stationa-calendar-day-text">{{data.day.split('-').slice(2).join('-')}}</div>
                        <div v-for="(items, index) in attendanceList">
                            <div class="is-attending-flag" v-if="(items.record_time.split(' ').slice(0, 1).join('')) == data.day"></div>
                        </div>
                    </div>
                </template>
            </el-calendar>

            <div class="station-change-month-btn-group">
                <div class="previousMonthBtn" @click="previousMonthClick()">上个月</div>
                <div class="change-month-btn-group-line"></div>
                <div class="currentMonthBtn"  @click="currentMonthClick()">本月</div>
                <div class="change-month-btn-group-line"></div>
                <div class="nextMonthBtn"     @click="nextMonthClick()">下个月</div>
            </div>

            <div class="station-attendance-detail">
                <div :class="['attendance-flag', isAttending ? 'attendance-normal' : 'attendance-absence']">
                    {{isAttending ? '正常打卡' : '无记录'}}
                </div>
                <div>{{isAttending ? attendanceTime : '当天没有打卡记录'}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                sid           : this.$route.query.sid,//水站ID
                timeDate      : new Date(),
                attendanceList: [],
                lastyearMonth : this.dateformatToYearMonthStr(new Date()),
                attendanceTime: '',
                isAttending   :  false,//是否打卡
                monthDays     :  0,
            }
        },
        components:{
        },
        watch:{
            timeDate(){
                var newYearMonth = this.dateformatToYearMonthStr(this.timeDate);
                if (newYearMonth != this.lastyearMonth) {
                    this.lastyearMonth = newYearMonth;
                }
                this.whetherIsAttending();
            }
        },
        mounted(){
            this.monthDays = new Date(this.timeDate.getFullYear(), this.timeDate.getMonth() + 1, 0).getDate();
            this.getAttendanceList();
        },
        methods:{
            previousMonthClick(){
                var date              = this.timeDate;
                var currentMonth      = date.getMonth();
                var nextMonth         = --currentMonth;
                var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
                this.timeDate         = nextMonthFirstDay;
                this.getAttendanceList();
                this.monthDays = new Date(this.timeDate.getFullYear(), this.timeDate.getMonth() + 1, 0).getDate();
            },
            currentMonthClick(){
                var oldYearMonth = this.dateformatToYearMonthStr(this.timeDate);
                var currentYearMonth = this.dateformatToYearMonthStr(new Date());
                if (oldYearMonth != currentYearMonth) {
                    this.timeDate = new Date();
                    this.getAttendanceList();
                }
                this.monthDays = new Date(this.timeDate.getFullYear(), this.timeDate.getMonth() + 1, 0).getDate();
            },
            nextMonthClick(){
                var date              = this.timeDate;
                var currentMonth      = date.getMonth();
                var nextMonth         = ++currentMonth;
                var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
                this.timeDate         = nextMonthFirstDay;

                let dateSelected = this.timeDate.getTime();
                let dateNow = new Date().getTime();
                if (dateSelected > dateNow){
                    this.attendanceList = [];
                } else {
                    this.getAttendanceList();
                }
                this.monthDays = new Date(this.timeDate.getFullYear(), this.timeDate.getMonth() + 1, 0).getDate();
            },
            /**
             * [考勤查询]
             * @return {[type]} [description]
             */
            getAttendanceList(){
                var startDay = this.getCurrentMonthFirst(this.timeDate);
                var endDay = this.getCurrentMonthLast(this.timeDate);
                var startDayStr = this.global_.dateformatToString(startDay);
                var endDayStr = this.global_.dateformatToString(endDay);
                // console.log(startDayStr, ' ~ ', endDayStr);
                // return;
                try{
                    this.$fetch({
                        url   : "Web/Additional/attendance_waterstation_history?action=get",
                        method: "get",
                        data  : {
                            wateraffairs_id : this.sid,
                            start_time      : startDayStr,
                            end_time        : endDayStr,
                        },
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            if (jsonData.data) {
                                var data = jsonData.data;
                                if (data.attendance_list instanceof Array) {
                                    this.attendanceList = data.attendance_list;
                                } else {
                                    this.attendanceList = [];
                                }
                                this.whetherIsAttending();
                            }
                        }
                    }).finally(() => {

                    });
                }catch(e){
                    this.$toast('数据获取失败');
                };
            },
            /**
             * [判断某天是否打卡了]
             * @return {[type]} [description]
             */
            whetherIsAttending(){
                this.isAttending = false;
                for (var i = 0; i < this.attendanceList.length; i++) {
                    var item = this.attendanceList[i];
                    var itemDayStr = item.record_time.split(' ').slice(0, 1).join('');
                    var selectedDayStr = this.global_.dateformatToString(this.timeDate).split(' ').slice(0, 1).join('');
                    if (itemDayStr == selectedDayStr) {
                        this.isAttending = true;
                        this.attendanceTime = '打卡时间: ' + item.record_time;
                        break;
                    }
                }
            },
            /**
            * [获取当月的第一天]
            * @return {[type]} [description]
            */
            getCurrentMonthFirst(date){
                var month    = date.getMonth();
                var firstDay = new Date(date.getFullYear(), month, 1);

                return firstDay;
           },
           /**
            * 获取当前月的最后一天
            */
           getCurrentMonthLast(date){
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
                let y = date.getFullYear();
                let m = date.getMonth() + 1;
                return y + '年' + m + '月';
            },
        }
    }
</script>

<style lang="less" scope>
.station-wateraffairs-item-view{
    width: 800px;
    height: 660px;
    background: white;
    box-shadow: 0px 2px 4px 0px rgba(37,130,247,0.2);
    border-radius: 0.571428rem;
    margin: 0px auto;
}
.attendance-month-statistic{
    height: 116px;
    position: absolute;
}
.attendance-month-statistic-title{
    margin-top: 10px;
    margin-left:22px;
    color: gray;
    height: 25px;
    font-size: 18px;
    line-height: 25px;
}
.attendance-month-statistic-data{
    margin-top: 10px;
    width: 600px;
    height: 60px;
    padding-top: 1px;
    text-align: center;
}
.attendance-month-statistic-unit{
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
.attendance-month-statistic .attendance-dotted-line{
    margin-top: 5px;
    height: 1px;
    width: 800px;
    border-top: dashed; border-width: 1px; border-color: #E2EAFF;
}
.station-wateraffairs-calendar{
    width: 800px;
    height: 500px;
    position: absolute;
    margin-top: 116px;
    border-radius: 0.571428rem;
}
.station-attendance-detail{
    margin-top: 600px;
    margin-left: 16px;
    height: 60px;
    width: 400px;
    position: absolute;
}
.station-attendance-detail .attendance-flag{
    height: 26px;
    line-height: 26px;
    text-align: center;
    width: 80px;
    border-radius: 13px;
    margin-bottom: 5px;
    color: white;
}
.station-attendance-detail .attendance-normal{
    background: #40A1FD;
}
.station-attendance-absence{
    color: #FF2642;
}
.station-attendance-detail .attendance-absence{
    background: #FF2642;
}
.station-wateraffairs-calendar .el-calendar-table .el-calendar-day:hover {
    background: transparent;
    .station-calendar-day-selected{
        background: #1DB084;
    }
}
.el-calendar-table td.is-selected {
    background: transparent;
    .station-calendar-day-selected{
        background: #1DB084;
    }
}
.station-wateraffairs-calendar .el-calendar-table thead th {
    text-align: center;
}
.station-wateraffairs-calendar table tbody tr td {
    padding: 0px;
    height: 60px;
    text-align: center;
}
.station-wateraffairs-calendar .el-calendar-table .el-calendar-day {
    height: 60px;
    padding: 0px;
}
.station-wateraffairs-calendar .calendar-show-custom{
    height: 60px;
    width: 60px;
    margin: auto;
    position: relative;
}
.station-wateraffairs-calendar .is-attending-flag{
    height: 10px;
    width: 10px;
    border-radius: 5px;
    margin: 20px auto;
    background: #40A1FD;
}
.stationa-calendar-day-text{
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    top: 15px;
    color : black;
    position: relative;
}
.station-calendar-day-selected{
    height: 60%;
    width: 60%;
    margin-left: 20%;
    margin-top: 20%;
    position: absolute;
    background: transparent;
    border-radius: 60%;
}
.station-wateraffairs-calendar .el-calendar__header .el-calendar__button-group{
    display: none;
}
.station-change-month-btn-group{
    margin-top: 122px;
    margin-left: 586px;
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
.station-change-month-btn-group .change-month-btn-group-line{
    height: 26px;
    width: 1px;
    background: #606266;
    float: left;
}
.station-change-month-btn-group .previousMonthBtn{
    cursor: pointer;
    width: 68px;
    height: 26px;
    float: left;
}
.station-change-month-btn-group .previousMonthBtn:hover{
    background: #EDF5FE;
}
.station-change-month-btn-group .currentMonthBtn{
    cursor: pointer;
    width: 56px;
    height: 26px;
    float: left;
}
.station-change-month-btn-group .currentMonthBtn:hover{
    background: #EDF5FE;
}
.station-change-month-btn-group .nextMonthBtn{
    cursor: pointer;
    width: 68px;
    height: 26px;
    float: left;
}
.station-change-month-btn-group .nextMonthBtn:hover{
    background: #EDF5FE;
}
//非当月的取消点击事件
.el-calendar-table:not(.is-range) td.next, .el-calendar-table:not(.is-range) td.prev{
    pointer-events: none;
    .stationa-calendar-day-text{
        color: gray;
    }
}
</style>
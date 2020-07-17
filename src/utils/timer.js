/*
 * @Author: your name
 * @Date: 2020-07-16 15:44:54
 * @LastEditTime: 2020-07-16 16:02:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/utils/timer.js
 */

export default {
  millisecondsForDate(transData, transFlag) {
    var oldTime = (new Date(transData)).getTime(); //得到毫秒数
    var newTime = new Date(oldTime); //得到普通的时间
    var tmpYear = newTime.getFullYear();
    var tmpMonth = newTime.getMonth() + 1;
    var tmpDay = newTime.getDate();

    var tmpCycleTime = {
      "year": tmpYear,
      "month": tmpMonth < 10 ? "0" + (tmpMonth) : tmpMonth,
      "day": tmpDay < 10 ? "0" + (tmpDay) : tmpDay
    };

    if (typeof transFlag == "undefined" || transFlag == false) {
      return (tmpCycleTime.year) + "-" + (tmpCycleTime.month) + "-" + (tmpCycleTime.day);;
    } else {
      return tmpCycleTime;
    }
  },
  getPreMonth(date, type) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
      year2 = parseInt(year2) - 1;
      month2 = 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
      day2 = days2;
    }
    if (type == "end") {
      day2 = days2;
    }
    if (month2 < 10) {
      month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
  },
  getDaysInMonthFrist(year, month) {
    var new_year = year; //取当前的年份
    var new_month = month++;
    if (month > 12) {
      new_month -= 12; //月份减
      new_year++; //年份增
    }
    return new Date(new_year, new_month - 1, 1);
  },
  getDaysInMonthLast(year, month) {
    var new_year = year; //取当前的年份
    var new_month = month++;
    if (month > 12) {
      new_month -= 12; //月份减
      new_year++; //年份增
    }
    var new_date = new Date(new_year, new_month, 1);
    return new Date(new_date.getTime() - 1000 * 60 * 60 * 24);
  },
  dataChartTime() {
    let data = new Date(),
      time = data.getTime(),
      vDate = new Date(time),
      tmpFullYear = vDate.getFullYear(),
      tmpMonth = vDate.getMonth() + 1;

    return {
      s: this.millisecondsForDate(this.getDaysInMonthFrist(tmpFullYear, tmpMonth)),
      e: this.millisecondsForDate(this.getDaysInMonthLast(tmpFullYear, tmpMonth)),
      t: this.millisecondsForDate(new Date()),
    }
  },
  /**
   * [获取某一月有多少天, month为实际月份，一月即为1]
   * @param  {[type]} year  [description]
   * @param  {[type]} month [description]
   * @return {[type]}       [description]
   */
  getDateLength(year, month) {
    return new Date(year, month, 0).getDate();
  },
  /**
   * [TimePicker时间转为字符串]
   * @param  {[type]} waterTime [description]
   * @return {[type]}           [description]
   */
  timePickerToStr(waterTime) {
    var time;
    if (waterTime.length > 1) {
      time = waterTime.join('-');
    } else {
      time = waterTime[0];
    }
    return time;
  },
  /**
   * 获取时间 
   * @param 传入 时间值 或者 时间戳
   * 返回 如果为当年 则返回 月-日 时：分：秒 如果为其他年份 显示 年-月-日 时：分：秒
   */
  getTimeByFilter(time) {
    if (time == null) {
      return '-';
    }
    if (typeof time == 'number') {
      time = time.toString();
    }
    var newTimeStr = time;

    if (time.length > 10) { //年月日 "2020-01-01 00:00:00"
      var yearStr = time.substring(0, 4);
      var curYear = new Date().getFullYear(); //四位数2020
      if (curYear.toString() == yearStr) {
        newTimeStr = time.substring(5, time.length);
      } else {
        newTimeStr = time;
      }
    } else if (time.length == 10) { //时间戳 "1588262400"
      var date = new Date(time * 1000);
      var dateStr = this.dateformatToString(date);
      newTimeStr = this.getTimeByFilter(dateStr);
    }
    return newTimeStr;
  },
  /**
   *  获取当月第几天
   */
  getDayByTimeStamp(timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var M = date.getDate();
    return M;
  },
  /**
   *  获取当年第几月
   */
  getMonthByTimeStamp(timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var M = date.getMonth() + 1;
    return M;
  },

  /**
   * Date转字符串
   * @param  {[type]} date 时间Date
   * @return {[type]}      返回字符串 2020-01-01 00:00:00
   */
  dateformatToString(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  dateformatToDayString(time, type) {
    var numTime = 0;
    if (typeof time == 'string') {
      numTime = parseInt(time);
    } else {
      numTime = time;
    }
    var date = new Date(time * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    // console.log("m:", m);
    // console.log("d:", d);
    var rDateStr = '';
    var curYear = new Date().getFullYear();
    if (curYear == y) {
      if (type == "year") {
        rDateStr = m;
      } else {
        rDateStr = m + '-' + d;
      }
    } else {
      if (type == "year") {
        rDateStr = y + '-' + m;
      } else {
        rDateStr = y + '-' + m + '-' + d;
      }
    }
    return rDateStr;
  }
}

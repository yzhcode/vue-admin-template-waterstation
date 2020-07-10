/*
 * @Author: your name
 * @Date: 2020-07-07 13:56:34
 * @LastEditTime: 2020-07-07 15:01:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/api/water-station.js
 */

export function loadWaterStationList() {
  return request({
    url: '/Web/WaterAffairs/overall2_index?action=get',
    method: 'get'
  }).then(res => {
    let json = res.data,
      // data = json.data;

      if (json.result == 'success') {
        //   this.wateraffairs_count = data.wateraffairs_count;
        //   this.wateraffairs_alarm_count = data.wateraffairs_alarm_count;
        //   // this.realtime_alarm_count = data.realtime_alarm_count;  用错字段 lly处理
        //   this.realtime_alarm_count = data.today_alarm_count;

        //   this.waterIndexData = data.wateraffairs_list;

        //添加标注
        //   this.createMarker();
      } else {
        //   this.global_.showToastErrmsg(jsonData.errmsg, "");
      }
  })
}

export function loadRegionList() {
  return request({
    url: '/Web/Manage/region_list?action=get',
    method: 'get'
  }).then(res => {

  })
}

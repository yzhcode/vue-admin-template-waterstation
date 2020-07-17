/*
 * @Author: your name
 * @Date: 2020-07-14 11:45:14
 * @LastEditTime: 2020-07-14 13:48:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/api/admin.js
 */
import request from '@/utils/request'

export function loadWaterStationList() {
  return request({
    url: '/Web/WaterAffairs/overall2_index?action=get',
    method: 'get'
  }).then(res => {
    let json = res.data;
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
        //   this.$showToastErrmsg(jsonData.errmsg, "");
      }
  })
}

export function loadRegionList() {
    return new Promise((resolve, reject) => {
        let url = '/Web/Manage/region_list?action=get'
        return request({
            url: url,
            method: 'get'
          }).then(res => {
            console.log('request 成功 :>> ', res.data);
            resolve(res.data);
          }).catch((error) => {
            console.log('request 失败 :>> ', error);
          })
    });
}

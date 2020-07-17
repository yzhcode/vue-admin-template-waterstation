/*
 * @Author: your name
 * @Date: 2020-07-14 17:56:53
 * @LastEditTime: 2020-07-16 15:58:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/utils/alert.js
 */

import {
  Message,
  messageBox
} from 'element-ui';

// import { Alert, Confirm, Toast, Loading } from 'wc-messagebox';

// $alert(message, title, options) 或 $alert(message, options)
// $confirm(message, title, options) 或 $confirm(message, options)
// $prompt(message, title, options) 或 $prompt(message, options)

// const popup = {}

// popup.install = function (Vue, options) {
//   // 假如这个是发送get请求的封装，具体得看个人需求进行封装
  // Vue.prototype.$toast = function (options) {
  //   this.$message(options);
  // }

  // Vue.prototype.$alert = function (message, title, options) {
  //   return this.$alert(message, title, options);
  // }

  // Vue.prototype.$confirm = function (message, title, options) {
  //   return this.$alert(message, title, options);
  // }

//   Vue.prototype.$showToastErrmsg = function (errmsg,defultmsg){
//     console.log('errmsg :>> ', errmsg);
//     if(errmsg != null && errmsg != ""){
//       this.$message.error(errmsg);
//     }else if(defultmsg != null && defultmsg != ""){
//       this.$message.error(defultmsg);
//     }else{
//       this.$message.error("获取数据失败");
//     }
//   }
// }

// export default popup

export default {
  showToastErrmsg(errmsg, defultmsg) {
    console.log('errmsg :>> ', errmsg);
    Message({
      message: (errmsg || defultmsg || "获取数据失败"),
      type: 'error',
      duration: 3 * 1000
    })
  },
  toast(options) {
    Message(options)
  },
  alert(message, title, options) {
    // return this.$alert(message, title, options);
  },
  confirm(message, title, options) {
    // return this.$alert(message, title, options);
  }
}

/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-09 14:12:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/api/user.js
 */
import request from '@/utils/request'
import md5 from 'js-md5'
import store from 'store'
import router from 'router'
import { resetRouter } from 'router'
import {
  USER_ID,
  USER_NAME,
  USER_ROLE,
  USER_ROLE_TYPE,
  USER_MANAGER_ID,
  USER_LOGIN_TIME
} from '@/store/modules/user';

/**
 * @description: 用户登录
 * @param {username: 用户名, password: 密码(输入的字符串)} 
 * @return: Promise
 */
export function userLogin(username, password) {
  let md5password = '';
  let specialRegExp = /^[a-z0-9]{32,32}$/; //特殊用途密码
  if (specialRegExp.test(password)) {
    md5password = password;
  } else {
    md5password = md5(password);
  }

  return new Promise((resolve, reject) => {
    return request({
      url: '/Web/WaterAffairs/login?action=post',
      method: 'post',
      data: {
        username: username,
        password: md5password,
        cgi_type: 1
      }
    }).then(res => {
      var jsonData = res.data;
      if (jsonData.result == "success") {
        let data = jsonData.data;
        if (loginSuccessResponseDataValid(data)) {
          // 登陆成功
          // this.global_.lset("username", data.username);
          // 缓存登陆用户详情
          let commitdata = [
            [USER_ID, data.user_id],
            [USER_NAME, data.username],
            [USER_ROLE, data.role],
            [USER_ROLE_TYPE, data.role_type],
            [USER_LOGIN_TIME, data.lastlogintime]
          ];
  
          store.dispatch('user/commitUserAttr2', {
            value: commitdata,
            success() {
              resolve();
            }
          });
        } else {
          reject("登陆失败")
        }
      } else {
        reject(jsonData.errmsg)
      }
    })
  });
}

/**
 * @description: 用户注销
 * @param {无} 
 * @return: Promise
 */
export function userLogout() {
  console.log("开始登出...");
  return new Promise((resolve, reject) => {
    return request({
      url: '/Web/WaterAffairs/login_out?action=delete',
      method: 'get'
    }).then(res => {
      let json = res.data;
      console.log("登出结束 >> ",json);
      if (json.result == "success") {
        store.dispatch('user/removeUserAttr');
        router.push(`/login?redirect=${router.fullPath}`)
        resetRouter();
        resolve();
      } else {
        reject(json.errmsg)
      }
    })
  });
}

/**
 * @description: 检查登录成功返回的数据是否合法
 * @param {res: 登录成功返回的json} 
 * @return: Bool
 */
function loginSuccessResponseDataValid(res) {
  console.log("登录成功，检查返回数据合法性 = " + JSON.stringify(res));
  if (res.username && (0 < parseInt(res.role) < 4)) {
    if (parseInt(res.role) == 2 || parseInt(res.role) == 3) {
      if (parseInt(res.role_type) == 1 || parseInt(res.role_type) == 2) {
        console.log("账号有效，站点账号");
        return true;
      }
    } else {
      console.log("账号有效");
      return true;
    }
  }
  console.log("账号无效");
  return false;
}


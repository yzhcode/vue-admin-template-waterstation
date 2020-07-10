import axios from 'axios'
import {
  MessageBox,
  Message
} from 'element-ui'
import store from '@/store'
import {
  USER_ID,
  USER_NAME,
  USER_ROLE,
  USER_ROLE_TYPE,
  USER_MANAGER_ID,
  USER_LOGIN_TIME
} from '@/store/modules/user';

import {
  getToken
} from '@/utils/auth'

import qs from 'qs';

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  method: "post",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  },
  credentials: "include",
  withCredentials: true, //允许跨域域名设置cookie
  timeout: 30 * 1000 // 30秒超时
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if ((config.method).toLowerCase() === 'post') {
      config.data = qs.stringify(config.data, {
        arrayFormat: 'brackets'
      })
    } else if ((config.method).toLowerCase() === 'get') {
      config.params = {
        timestamp: new Date().getTime(), //时间戳
        ...config.data
      }
    }

    // console.log('userid :>> ', USER_ID);
    let idd = store.getters['user/renderUserAttr'](USER_NAME);
    console.log('userid2 :>> ', idd);

    // if (store.getters.token) {
    //   // let each request carry token
    //   // ['X-Token'] is a custom headers key
    //   // please modify it according to the actual situation
    //   config.headers['X-Token'] = getToken()
    // }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (response.status === 200) {
      if (response.data.result == "noauth") {
        Message({
          message: '请重新登录',
          type: 'error',
          duration: 5 * 1000
        })
        // 清除登陆信息
        // vm.global_.removeLoginInfo();
        // 重定向
        // vm.$router.replace({
        //   name: "login"
        // }).catch(data => {});
        //关闭bootstrap弹出框
        // $('.modal').modal('hide');
        //关闭load加载提示
        // vm.$loading.hide();
        // return Promise.reject(response);
        MessageBox.confirm('登录信息过期', '确认重新登录吗?', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  error => {
    // console.log('err' + error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)

    console.log("错误回调", error);
    if (error.message.includes('timeout')) { // 判断请求异常信息中是否含有超时timeout字符串
      // vm.$loading.hide();
      Message({
        message: '登录超时',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error); // reject这个错误信息
    }
    if (error.response) {
      if (error.response.status >= 400) { //服务器、客户端错误处理
        Message({
          message: error.message,
          type: 'error',
          duration: 5 * 1000
        })
      }
      /*  switch (error.response.status) {
          case 404:
              this.$router.push({ path: "/error/404"});
          break;
          case 500:
              this.$router.push({ path: "/error/500"});
          break;
          case 502:
              this.$router.push({ path: "/error/502"});
          break;
          case 504:
              this.$router.push({ path: "/error/504"});
          break;
      } */
    }
    return Promise.reject(error.response.data)
  }
)

export default service

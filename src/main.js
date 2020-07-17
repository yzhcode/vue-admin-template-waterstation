/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-16 15:47:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/main.js
 */ 
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon

import popup from '@/utils/popup'
Vue.use(popup)
Vue.prototype.$popup = popup

import dom from '@/utils/dom'
Vue.use(dom)
Vue.prototype.$dom = dom

import server from '@/utils/request'
Vue.use(server)

import user from '@/utils/user'
Vue.use(user)
Vue.prototype.$user = user

import timer from '@/utils/timer'
Vue.use(timer)
Vue.prototype.$timer = timer

// import $ from 'jquery';
// import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

// import "@/assets/js/perfect-scrollbar.jquery";
// import "@/assets/css/perfect-scrollbar.css";
// import '@/assets/js/jquery.simplePagination.js';
// import "@/assets/css/simplePagination.css";


new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

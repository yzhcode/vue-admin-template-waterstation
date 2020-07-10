/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-09 18:30:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/index.js
 */ 
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import persistedState from 'vuex-persistedstate'

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters,
  plugins: [persistedState()]
})
export default store


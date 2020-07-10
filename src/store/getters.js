/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-09 11:05:32
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/getters.js
 */ 
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,

  size: state => state.app.size,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters

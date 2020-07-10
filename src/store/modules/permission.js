/*
 * @Author: your name
 * @Date: 2020-07-09 11:02:15
 * @LastEditTime: 2020-07-09 17:11:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/modules/permission.js
 */ 
import { asyncRoutes, staticRoutes } from '@/router'
import router from '@/router'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  
  // console.log('check route :>> ', route.meta.title, ' roles: ', roles);
  if (route.meta && route.meta.roles) {
    console.log('check route :>> ', route.meta.title, ' roles: ', roles, 'metaroles:', route.meta.roles);
    if (roles instanceof Array) {
      return route.meta.roles.some(role => roles.includes(role));
    } else {
      return route.meta.roles.includes(roles);
    }
  } else {
    console.log('check path :>> ', route.path, ' roles: ', roles);
    return true;
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, roles) => {
    console.log('roles :>> ', roles);
    let accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    console.log('accessedRoutes :>> ', accessedRoutes);
    console.log('staticRoutes :>> ', staticRoutes);
    state.addRoutes = accessedRoutes
    let allrouter = staticRoutes.concat(accessedRoutes);
    console.log('allrouter :>> ', allrouter);
    router.addRoutes(accessedRoutes)
    router.options.route
    state.routes = staticRoutes.concat(accessedRoutes)

  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

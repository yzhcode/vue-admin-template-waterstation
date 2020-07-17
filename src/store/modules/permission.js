/*
 * @Author: your name
 * @Date: 2020-07-09 11:02:15
 * @LastEditTime: 2020-07-15 16:55:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/modules/permission.js
 */ 
import { asyncRoutes, staticRoutes } from '@/router'
import { resetRouter } from '@/router'
import router from '@/router'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(userRole, route) {
  console.log('check route : >>', route);
  if (route.meta && route.meta.roles) {
    console.log('check route :>> ', route.meta.title, ' userRole: ', userRole, 'metaroles:', route.meta.roles);
    if (userRole instanceof Array) {
      console.log('check ret1 :>> ', route.meta.roles.some(role => userRole.includes(role)));
      return route.meta.roles.some(role => userRole.includes(role));
    } else {
      console.log('check ret2 :>> ', route.meta.roles.includes(userRole));
      return route.meta.roles.includes(userRole);
    }
  } else {
    console.log('check route :>> ', route.path, ' userRole: ', userRole);
    console.log('check ret3 :>> ', true);
    return true;
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, userRole) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(userRole, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, userRole)
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
  setRoute: (state, userRole) => {
    console.log('----------------setRoute start----------------');
    console.log('resetRouter...');
    resetRouter();
    console.log('userRole :>> ', userRole);
    let accessedRoutes = filterAsyncRoutes(asyncRoutes, userRole)
    console.log('accessedRoutes :>> ', accessedRoutes);
    console.log('staticRoutes :>> ', staticRoutes);
    state.addRoutes = accessedRoutes
    let allrouter = staticRoutes.concat(accessedRoutes);
    console.log('allrouter :>> ', allrouter);
    router.options.route = accessedRoutes;
    router.addRoutes(accessedRoutes)
    state.routes = staticRoutes.concat(accessedRoutes);
    console.log('----------------setRoute end----------------');
  }
}

const actions = {
  generateRoutes({ commit }, userRole) {
    return new Promise(resolve => {
      commit('setRoute', userRole)
      resolve(userRole)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

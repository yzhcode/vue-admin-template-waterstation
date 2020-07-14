/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-14 09:39:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/modules/user.js
 */

import store from 'router'

export const USER_ID = "user_id";
export const USER_NAME = "username";
export const USER_ROLE = "role";
export const USER_ROLE_TYPE = "role_type";
export const USER_MANAGER_ID = "manage_wateraffairs_id";
export const USER_LOGIN_TIME = "lastlogintime";

export const USER_ROLE_UNKNOW = 0; //  未知角色
export const USER_ROLE_GALAXYWIND = 1; //  银河风云运维
export const USER_ROLE_GOV_AREA = 2; //  政区域管理
export const USER_ROLE_HC_AREA = 3; //  华晨区域管理
export const USER_ROLE_GOV_STATION = 4; //  政单站管理
export const USER_ROLE_HC_STATION = 5; //  华晨单站管理

const state = {};
state[USER_ID] = "";
state[USER_NAME] = "";
state[USER_ROLE] = "";
state[USER_ROLE_TYPE] = "";
state[USER_MANAGER_ID] = "";
state[USER_LOGIN_TIME] = "";

/**
 * [getter]
 * @type {Object}
 */
const getters = {
  renderUserAttr: (state) => (key) => {
    console.log('get user attr :>> ', [key, state[key]]);
    return state[key];
  },
  
  // role 1-银河风云运维 2-区域 3-站点管理
  // role_type 1-政府 2-华晨
  currentUserRole: (state) => () => {
    let role = state[USER_ROLE];
    let role_type = state[USER_ROLE_TYPE];

    if (role == "1") {
      return USER_ROLE_GALAXYWIND;
    } else if (role == "2") {
      if (role_type == '1') {
        return USER_ROLE_GOV_AREA;
      } else if (role_type == '2') {
        return USER_ROLE_HC_AREA;
      }
    } else if (role == '3') {
      if (role_type == '1') {
        return USER_ROLE_GOV_STATION;
      } else if (role_type == '2') {
        return USER_ROLE_HC_STATION;
      }
    }

    return USER_ROLE_UNKNOW;
  }
}

/**
 * [同步提交]
 * @type {Object}
 */
const mutations = {
  pushUserAttr(state, [key, value]) {
    console.log('push user attr :>> ', [key, value]);
    if (state.hasOwnProperty(key)) {
      state[key] = value;
    } else {
      console.log('push user attr :>> 没有这个key属性', key);
    }
  },
  removeUserAttr(state) {
    state[USER_ID] = "";
    state[USER_NAME] = "";
    state[USER_ROLE] = "";
    state[USER_ROLE_TYPE] = "";
    state[USER_MANAGER_ID] = "";
    state[USER_LOGIN_TIME] = "";
  }
}

/**
 * [异步提交]
 * @type {Object}
 */
const actions = {
  removeUserAttr(context) {
    return new Promise((resolve, reject) => {
      console.log('remove user attr');
      context.commit('removeUserAttr');
      console.log('user roles change:>> ', USER_ROLE_UNKNOW);
      context.commit('permission/setRoute', USER_ROLE_UNKNOW, {
        root: true
      });
      resolve();
    });
  },
  invalidUserAttr(context) {
    return new Promise((resolve, reject) => {
      console.log('remove user attr');
      context.commit('removeUserAttr');
      console.log('user roles change:>> ', USER_ROLE_UNKNOW);
      context.commit('permission/setRoute', USER_ROLE_UNKNOW, {
        root: true
      });
      resolve();
    });
  },
  commitUserAttr (context, payload) {
    return new Promise((resolve, reject) => {
      console.log('commitUserAttr payload :>> ', payload);
      
      if ((payload instanceof Array) && payload.length > 0) {
        let needResetRoute = false;
        if (payload[0] instanceof Array) {
          payload.forEach(element => {
            context.commit('pushUserAttr', element);
            let [key, value] = element;
            if (key == USER_ROLE || key == USER_ROLE_TYPE) {
              needResetRoute = true;
            }
          });
        } else {
          context.commit('pushUserAttr', payload);
          let [key, value] = element;
            if (key == USER_ROLE || key == USER_ROLE_TYPE) {
              needResetRoute = true;
            }
        }

        if (needResetRoute) {
          let roles = context.getters['currentUserRole']();
          console.log('user roles change:>> ', roles);
          context.commit('permission/setRoute', roles, {
            root: true
          });
        }
        
        resolve(payload)
      } else {
        console.log('commitUserAttr 提交payload无效');
        reject(payload)
      }
    });
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};


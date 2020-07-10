/*
 * @Author: your name
 * @Date: 2020-07-06 15:11:36
 * @LastEditTime: 2020-07-09 15:02:28
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
  pushUserAttrArray(state, keyValueArray) {
    console.log('pushUserAttrArray :>> ', keyValueArray);
    keyValueArray.forEach(element => {
      let [key, value] = element;
      console.log('push user attr :>> ', [key, value]);
      if (state.hasOwnProperty(key)) {
        state[key] = value;
      } else {
        console.log('push user attr :>> 没有这个key属性', key);
      }
    });
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
  commitUserAttr(context, item) {
    console.log('commit user attr :>> ', item);
    if ((item instanceof Array) && item.length > 0) {
      // console.log('提交item是数组');
      if (item[0] instanceof Array) {
        // console.log('提交item是二维数组');
        context.commit('pushUserAttrArray', item);
      } else {
        // console.log('提交item是一维数组');
        context.commit('pushUserAttr', item);
      }
    } else {
      // console.log('提交item不是数组');
    }
  },
  removeUserAttr(context, item) {
    context.commit('removeUserAttr', item);
  },
  commitUserAttr2 (context, payload) {
    let item = payload.value;
    console.log('commit user attr :>> ', item);
    if ((item instanceof Array) && item.length > 0) {
      // console.log('提交item是数组');
      if (item[0] instanceof Array) {
        // console.log('提交item是二维数组');
        context.commit('pushUserAttrArray', item);
      } else {
        // console.log('提交item是一维数组');
        context.commit('pushUserAttr', item);
      }
    } else {
      console.log('提交item不是数组');
      return;
    }

    let roles = context.getters['currentUserRole']();
    console.log('roles2 :>> ', roles);
    context.commit('permission/SET_ROUTES', roles, { root: true })
    if (payload.success) {
      payload.success();
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};


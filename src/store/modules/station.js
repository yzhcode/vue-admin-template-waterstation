/*
 * @Author: your name
 * @Date: 2020-07-07 15:14:45
 * @LastEditTime: 2020-07-07 18:56:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/store/modules/station.js
 */

export const STATION_NAME = "site_name";
export const STATION_OLD_NAME = "site_old_name";
export const STATION_LIST = "site_list";
export const STATION_LINE_LIST = "site_line_list";

const state = {};
state[STATION_NAME] = "";
state[STATION_OLD_NAME] = "333";
state[STATION_LIST] = [];
state[STATION_LINE_LIST] = [];


/**
 * [getter]
 * @type {Object}
 */
const getters = {
  renderStationAttr: (state) => (key) => {
    return state[key];
  }
}

/**
 * [同步提交]
 * @type {Object}
 */
const mutations = {
  pushStationAttr(state, [key, value]) {
    if (state.hasOwnProperty(key)) {
      state[key] = value;
    }
  },
  pushStationAttrArray(state, keyValueArray) {
    keyValueArray.forEach(element => {
      [key, value] = element;
      if (state.hasOwnProperty(key)) {
        state[key] = value;
      }
    });
  }
}

/**
 * [异步提交]
 * @type {Object}
 */
const actions = {
  commitStationAttr(context, item) {
    if ((item instanceof Array) && item.length > 0) {
      if (item[0] instanceof Array) {
        context.commit('pushStationAttrArray', item);
      } else {
        context.commit('pushStationAttr', item);
      }
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

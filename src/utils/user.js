/*
 * @Author: your name
 * @Date: 2020-07-15 17:51:28
 * @LastEditTime: 2020-07-16 15:06:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/utils/user.js
 */

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

export default {
  getUserRole(role, role_type) {
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
  },
  getUserRoleTypeName(role_type) {
    if (type == "1") {
      return "水站生产管理";
    } else if (type == "2") {
      return "水站技术支持";
    }
  },

}

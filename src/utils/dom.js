/*
 * @Author: your name
 * @Date: 2020-07-16 09:13:34
 * @LastEditTime: 2020-07-16 15:40:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/utils/dom.js
 */

// const dom = {}

// dom.install = function (Vue, options) {
//   Vue.prototype.$getElement = function (string) {
//     if (typeof(string) != 'string') {
//       return null;
//     }

//     let first = string.substr(0, 1);
//     let element = null;
//     if (first == '.') {
//       element = document.getElementById(string);
//     } else if (first == '#') {
//       element = document.getElementsByClassName(string);
//     } else {
//       element = document.getElementsByTagName(string)
//     }

//     console.log('element :>> ', element);
//     return element;
//   }
// }

// export default dom

export default {
  getElement(string) {
    if (typeof (string) != 'string') {
      return null;
    }

    let first = string.substr(0, 1);
    let element = null;
    if (first == '.') {
      element = document.getElementById(string);
    } else if (first == '#') {
      element = document.getElementsByClassName(string);
    } else {
      element = document.getElementsByTagName(string)
    }

    console.log('element :>> ', element);
    return element;
  }
}


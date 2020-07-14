/*
 * @Author: your name
 * @Date: 2020-07-14 11:34:05
 * @LastEditTime: 2020-07-14 13:30:23
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /elementui/Users/admin/vuestudy/vue-admin-template-waterstation/src/api/article.js
 */ 
import request from '@/utils/request'

// export function fetchList(query) {
//   return request({
//     url: '/vue-element-admin/article/list',
//     method: 'get',
//     params: query
//   })
// }

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}

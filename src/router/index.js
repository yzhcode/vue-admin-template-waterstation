import Vue from 'vue'
import Router from 'vue-router'
import store from 'store'
import {
  Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

import {
  USER_ID,
  USER_NAME,
  USER_ROLE,
  USER_ROLE_TYPE,
  USER_MANAGER_ID,
  USER_LOGIN_TIME
} from 'store/modules/user';

import {
  USER_ROLE_UNKNOW,
  USER_ROLE_GALAXYWIND,
  USER_ROLE_GOV_AREA,
  USER_ROLE_HC_AREA,
  USER_ROLE_GOV_STATION,
  USER_ROLE_HC_STATION
} from 'store/modules/user';

import {
  getUserRole
} from 'store/modules/user'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
// import { from } from 'core-js/fn/array'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */


export const staticRoutes = [{
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true,
    meta: {
      title: '登录'
    }
  },

  {
    path: '/404',
    name: 'error404',
    component: () => import('@/views/404'),
    hidden: true,
    meta: {
      title: '错误'
    }
  },

  {
    path: '/',
    name: 'index',
    component: Layout
  }
];

export const asyncRoutes = [{
    path: '/dashboard',
    component: Layout,
    children: [{
      path: '',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: 'Dashboard',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA]
      }
    }]
  },
  {
    path: '/wholeMap',
    component: Layout,
    children: [{
      path: '',
      name: 'wholeMap',
      component: () => import('@/views/table/index'),
      meta: {
        title: '水站地图',
        icon: 'dashboard',
        roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    }]
  },
  {
    path: '/realtimeMonitor',
    name: 'realtimeMonitor',
    component: Layout,
    meta: {
      title: '实时监控',
      icon: 'dashboard',
      roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    },
    children: [{
        path: '/wholeDataMonitoring',
        name: 'wholeDataMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '水站监控',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      },
      {
        path: '/wholeVideoMonitoring',
        name: 'wholeVideoMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '实时视频',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      }
    ]
  },
  {
    path: '/dataAnalysis',
    name: 'dataAnalysis',
    component: Layout,
    meta: {
      title: '数据分析',
      icon: 'dashboard',
      roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    },
    children: [{
        path: '/wholeDataMonitoring',
        name: 'wholeDataMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '报警日志',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      },
      {
        path: '/wholeVideoMonitoring',
        name: 'wholeVideoMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '历史数据',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      }
    ]
  },
  {
    path: '/workOrder',
    name: 'workOrder',
    component: Layout,
    meta: {
      title: '工单管理',
      icon: 'dashboard',
      roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    },
    children: [{
        path: '/wholeDataMonitoring',
        name: 'wholeDataMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '工单派发',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      },
      {
        path: '/wholeVideoMonitoring',
        name: 'wholeVideoMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '工单状态',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      }
    ]
  },
  {
    path: '/deviceManager',
    name: 'deviceManager',
    component: Layout,
    meta: {
      title: '设备管理',
      icon: 'dashboard',
      roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    },
    children: [{
        path: '/wholeDataMonitoring',
        name: 'wholeDataMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '云盒子',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      },
      {
        path: '/wholeVideoMonitoring',
        name: 'wholeVideoMonitoring',
        component: () => import('@/views/table/index'),
        meta: {
          title: '摄像头',
          icon: 'dashboard',
          roles: [USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
        },
      }
    ]
  },
  {
    path: '/inspection',
    component: Layout,
    children: [{
      path: '',
      name: 'inspection',
      component: () => import('@/views/table/index'),
      meta: {
        title: '巡查统计',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    }]
  }
];

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: staticRoutes.concat(asyncRoutes)
})

const router = createRouter()

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  // document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const username = store.getters['user/renderUserAttr'](USER_NAME);
  const role = store.getters['user/currentUserRole']();
  let islogin = (role != USER_ROLE_UNKNOW);

  console.log('---------------beforeEach start----------------');
  console.log('beforeEach username >> ', username, 'role', role);
  console.log('will from (', from.path, ') to (', to.path, ')');
  if (islogin) {

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    // next({ ...to, replace: true })

    if (to.name === 'login') {
      // 已经登录了，重定向到首页
      next({
        path: '/'
      })
      NProgress.done()
    } else if (to.name === 'index') {
      // 这里根据不同角色重定向不同页面
      next({
        path: '/dashboard'
      })
      NProgress.done()
    } else {
      next()
    }
  } else {
    /* has no token*/
    console.log('no login, want to >> ', to.path);
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      console.log('go to white list item >> ', to.path);
      next()
    } else {
      console.log('go to login and redirect >> ', to.path);
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }

  console.log('---------------beforeEach end----------------');
})

router.afterEach((to, from) => {
  if (to.name == "login") {
    document.title = "登录";
  } else if (to.name == "register") {
    document.title = "注册";
  } else {
    document.title = "智慧水务管理平台";
  }
  NProgress.done()
})

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

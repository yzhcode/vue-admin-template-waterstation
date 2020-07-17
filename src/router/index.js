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
} from '@/utils/user';

import {
  USER_ROLE_UNKNOW,
  USER_ROLE_GALAXYWIND,
  USER_ROLE_GOV_AREA,
  USER_ROLE_HC_AREA,
  USER_ROLE_GOV_STATION,
  USER_ROLE_HC_STATION
} from 'utils/user';


Vue.use(Router)

/* Layout */
import Layout from '@/layout'
// import { push } from 'core-js/fn/array'
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

const asyncRoutesConfig = [{
    name: 'dashboard',
    component: () => import('@/views/dashboard/index'),
    title: 'Dashboard',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA]
  },
  {
    name: 'areaManage',
    component: () => import('@/views/adminView/areaManager'),
    title: '区域管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },
  {
    name: 'wholeManage',
    // component: () => import('@/views/whole/manage/wholeManage'),
    component: () => import('@/views/adminView/areaManager'),
    title: '水站管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },
  {
    name: 'regionAccountManager',
    // component: () => import('@/views/whole/account/regionAccountManager'),
    component: () => import('@/views/adminView/areaManager'),
    title: '区域账号管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },
  {
    title: '设备管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    children: [{
        name: 'cloudBox',
        // component: () => import('@/views/station/device/cloudBox'),
        component: () => import('@/views/adminView/areaManager'),
        title: '云盒子',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      },
      {
        name: 'videoManage',
        // component: () => import('@/views/station/device/videoManage'),
        component: () => import('@/views/adminView/areaManager'),
        title: '摄像头',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    ]
  },
  {
    name: 'monitorLocation',
    // component: () => import('@/views/station/setting/monitorLocation'),
    component: () => import('@/views/adminView/areaManager'),
    title: '应用管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },

  {
    name: 'wholeMap',
    // component: () => import('@/views/whole/map/wholeMap'),
    component: () => import('@/views/adminView/areaManager'),
    title: '水站地图',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },  /*
  {
    title: '实时监控',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    children: [{
        name: 'wholeDataMonitoring',
        component: () => import('@/views/whole/dataMonitoring/wholeDataMonitoring1'),
        title: '水站监控',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      },
      {
        name: 'wholeVideoMonitoring',
        component: () => import('@/views/whole/videoMonitoring/wholeVideoMonitoring'),
        title: '实时视频',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    ]
  },*/
  {
    title: '数据分析',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    children: [{
        name: 'wholeAlarmLog',
        // component: () => import('@/views/whole/alarm/wholeAlarmLog'),
        component: () => import('@/views/adminView/areaManager'),
        title: '报警日志',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      },
      {
        name: 'wholeStatisticsTrend',
        // component: () => import('@/views/whole/statistics/wholeStatisticsTrend'),
        component: () => import('@/views/adminView/areaManager'),
        title: '历史数据',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    ]
  },
  {
    name: 'wholeAttendance',
    // component: () => import('@/views/whole/attendance/wholeAttendance'),
    component: () => import('@/views/adminView/areaManager'),
    title: '巡查统计',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
  },
  /*
  {
    title: '工单管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    children: [{
        name: 'wholeWorkOrderManager',
        component: () => import('@/views/whole/workOrder/wholeworkOrderManagement'),
        title: '工单派发',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      },
      {
        name: 'wholeWorkOrderHis',
        component: () => import('@/views/whole/workOrder/wholeWorkOrderHis'),
        title: '工单状态',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    ]
  },
  */
  {
    title: '系统管理',
    icon: 'dashboard',
    roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
    children: [{
        name: 'wholeManage1',
        // component: () => import('@/views/whole/manage/wholeManage'),
        component: () => import('@/views/adminView/areaManager'),
        title: '水站管理',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      },
      {
        name: 'wholeAccount',
        // component: () => import('@/views/whole/account/wholeAccount'),
        component: () => import('@/views/adminView/areaManager'),
        title: '账号管理',
        icon: 'dashboard',
        roles: [USER_ROLE_GALAXYWIND, USER_ROLE_GOV_AREA, USER_ROLE_HC_AREA],
      }
    ]
  },
];

function createRoutesWithConfig(routesConfig) {
  const routes = [];
  routesConfig.forEach(element => {
    if (element.children && element.children.length) {
      let newelement = {
        name: element.title,
        path: '/'+element.title,
        component: Layout,
        meta: {
          title: element.title,
          icon: element.icon,
          roles: []
        },
        children:[]
      };

      element.children.forEach(element => {
        newelement.children.push({
          path: '/'+element.name,
          name: element.name,
          component: element.component,
          meta: {
            title: element.title,
            icon: element.icon,
            roles: element.roles
          }
        });

        newelement.meta.roles = Array.from(new Set(newelement.meta.roles.concat(element.roles)))
      });

      routes.push(newelement);

    } else {
      let newelement = {
        name: element.title,
        path: '/'+element.title,
        component: Layout,
        meta: {
          roles: element.roles
        },
        children:[]
      };

      newelement.children.push({
        path: '/'+element.name,
        name: element.name,
        component: element.component,
        meta: {
          title: element.title,
          icon: element.icon,
          roles: element.roles
        }
      });

      routes.push(newelement)
    }
  });

  console.log('routes :>> ', routes);

  return routes;
}

export const asyncRoutes = createRoutesWithConfig(asyncRoutesConfig);

const createRouter = (first) => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: first?staticRoutes.concat(asyncRoutes):staticRoutes
})

const router = createRouter(true)

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
  const newRouter = createRouter(false)
  router.matcher = newRouter.matcher // reset router
}

export default router

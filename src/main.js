// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import Dexie from 'dexie'
import VueMomentLib from 'vue-moment-lib'
import bytes from 'bytes'
import _ from 'lodash'
import VModal from 'vue-js-modal'

import App from './App'
import router from './router'
import xutils from './xutils'

// http request 请求拦截器，有token值则配置上token值
axios.interceptors.request.use(
  config => {
    let token = localStorage.getItem('token')
    if (token) {
      // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// http response 服务器响应拦截器，这里拦截401错误，并重新跳入登页重新获取token
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 清除token
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          router.replace({
            path: '/login',
            query: { redirect: router.currentRoute.fullPath } //登录成功后跳入浏览的当前页面
          })
      }
    }
    return Promise.reject(error.response.data)
  }
)

Vue.use(VModal, { dialog: true, dynamic: true, injectModalsContainer: true })
Vue.use(VueMomentLib)
Vue.prototype.$xutils = xutils
Vue.prototype.$axios = axios

Vue.config.productionTip = false

/* database setup */
var db = new Dexie('power-inspection')
db.version(1).stores({
  tasks: 'id',
  inspects: 'id',
  config: 'name'
})
Vue.prototype.$db = db
Vue.prototype.$_ = _

Vue.filter('datetime', x => {
  return Vue.moment(x).format('YYYY-MM-DD HH:mm')
})

Vue.filter('bytes', n => {
  return bytes(n)
})
Vue.prototype.$bytes = bytes

router.beforeEach((to, from, next) => {
  // console.info(22, window.location.href)
  // console.info(to,from,next)
  // 对路由变化作出响应...
  // console.log(router,to)
  // console.log(router,to.query, from)
  // console.log(to,$.param( to.query ),window.location.href)

  //全局拦截器的
  if (to.meta.login) {
    // 判断该路由是否需要登录权限
    if (xutils.getToken()) {
      // 通过store获取当前的token是否存在
      next()
    } else {
      alert('未登录，请先登录') //promise
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})

// 故障类型
Vue.prototype.$faults = [
  '悬挂异物',
  '瓷瓶破损',
  '扎线松脱',
  '接头放弧',
  '弧垂过大',
  '保险熔断'
]

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

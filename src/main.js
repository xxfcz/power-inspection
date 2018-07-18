// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import xutils from './xutils'

import axios from 'axios'
import Dexie from 'dexie'
import VueMomentLib from 'vue-moment-lib'
import bytes from 'bytes'
import _ from 'lodash'

Vue.use(VueMomentLib)
Vue.prototype.$xutils = xutils
Vue.prototype.$axios = axios

Vue.config.productionTip = false

/* database setup */
var db = new Dexie('power-inspection')
db.version(1).stores({
  tasks: '++id',
  inspects: 'device,time',
  config: 'name'
})
Vue.prototype.$db = db
Vue.prototype.$_ = _

Vue.filter('datetime', x=>{
  return Vue.moment(x).format('YYYY-MM-DD HH:mm')
})

Vue.filter('bytes', (n)=>{
  return bytes(n)
})
Vue.prototype.$bytes = bytes

// 故障类型
Vue.prototype.$faults = ['悬挂异物', '瓷瓶破损', '扎线松脱', '接头放弧', '弧垂过大', '保险熔断']

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

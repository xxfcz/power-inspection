// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import utils from './utils'

import axios from 'axios'
import Dexie from 'dexie'
import VueMomentLib from 'vue-moment-lib'

Vue.use(VueMomentLib)
Vue.prototype.$utils = utils
Vue.prototype.$axios = axios

Vue.config.productionTip = false

/* database setup */
var db = new Dexie('power-inspection')
db.version(1).stores({
  tasks: '++id,device',
  inspects: 'device,createTime',
  config: 'name'
})
Vue.prototype.$db = db

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

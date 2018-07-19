import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Inspect from '@/pages/Inspect'
import LocalRecords from '@/pages/LocalRecords'
import RemoteRecords from '@/pages/RemoteRecords'
import MyTasks from '@/pages/MyTasks'
import AddDevice from '@/pages/AddDevice'
import Login from '@/pages/Login'
import DeviceReport from '@/pages/reports/DeviceReport'
import InspectReport from '@/pages/reports/InspectReport'
import DisposalReport from '@/pages/reports/DisposalReport'
import AddSchedule from '@/pages/AddSchedule.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/inspect',
      name: 'inspect',
      component: Inspect,
      meta:{
        login: true
      }
    },
    {
      path: '/my-tasks',
      name: 'my-tasks',
      component: MyTasks,
      meta:{
        login: true
      }
    },
    {
      path: '/local-records',
      name: 'local-records',
      component: LocalRecords
    },
    {
      path: '/remote-records',
      name: 'remote-records',
      component: RemoteRecords
    },
    {
      path: '/add-device',
      name: 'add-device',
      component: AddDevice
    },
    {
      path: '/add-schedule',
      name: 'add-schedule',
      component: AddSchedule
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/device-report',
      name: 'device-report',
      component: DeviceReport,
      meta:{
        login: true
      }
    },
    {
      path: '/inspect-report',
      name: 'inspect-report',
      component: InspectReport,
      meta:{
        login: true
      }
    },
    {
      path: '/disposal-report',
      name: 'disposal-report',
      component: DisposalReport,
      meta:{
        login: true
      }
    }
  ]
})

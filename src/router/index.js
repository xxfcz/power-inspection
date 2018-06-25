import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Inspect from '@/pages/Inspect'
import LocalRecords from '@/pages/LocalRecords'
import RemoteRecords from '@/pages/RemoteRecords'
import Tasks from '@/pages/Tasks'
import AddTask from '@/pages/AddTask'
import Login from '@/pages/Login'
import DeviceReport from '@/pages/reports/DeviceReport'
import InspectReport from '@/pages/reports/InspectReport'

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
      component: Inspect
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks
    },
    {
      path: '/local_records',
      name: 'local_records',
      component: LocalRecords
    },
    {
      path: '/remote_records',
      name: 'remote_records',
      component: RemoteRecords
    },{
      path: '/add_task',
      name: 'add_task',
      component: AddTask
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/device_report',
      name: 'device_report',
      component: DeviceReport
    },
    {
      path: '/inspect_report',
      name: 'inspect_report',
      component: InspectReport
    }
  ]
})

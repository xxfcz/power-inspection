import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Inspect from '@/pages/Inspect'
import LocalRecords from '@/pages/LocalRecords'
import RemoteRecords from '@/pages/RemoteRecords'
import Tasks from '@/pages/Tasks'
import AddTask from '@/pages/AddTask'
import Login from '@/pages/Login'

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
      path: '/local-records',
      name: 'local-records',
      component: LocalRecords
    },
    {
      path: '/remote-records',
      name: 'remote-records',
      component: RemoteRecords
    },{
      path: '/add-task',
      name: 'add-task',
      component: AddTask
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

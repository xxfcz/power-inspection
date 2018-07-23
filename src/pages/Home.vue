<template>
  <div>
    <div v-if="user">
      <div>当前用户：{{ user.name }} （{{user.workshop.name}}）</div>
    </div>
    <ul>
      <li>
        <button @click="logout" v-if="user">注销</button>
        <router-link to="login" v-else>登录</router-link>
      </li>
      <li>
        <router-link to="my-tasks">我的任务</router-link>
      </li>
      <li>
        <router-link to="inspect">巡检</router-link>
      </li>
      <li>
        <router-link to="local-records">本地暂存的巡检记录</router-link>
      </li>
      <li>
        <router-link to="remote-records">服务器上的巡检记录</router-link>
      </li>
      <!--
      <li>
        <router-link to="add-device">添加设备</router-link>
      </li>
      <li>
        <router-link to="add-schedule">添加巡检计划</router-link>
      </li>
      <li>
        <button @click="clearCache">清理数据缓存</button>
      </li> -->
      <li>
        巡检计划
        <ul>
          <li><router-link to="query-schedule">查询巡检计划</router-link></li>
        </ul>
        <!-- <ul>
          <li><router-link to="add-schedule">新建巡检计划</li>
        </ul> -->
      </li>
      <li>
        报表
        <ul>
          <li>
            <router-link to="device-report">设备清单</router-link>
          </li>
          <li>
            <router-link to="inspect-report">巡检记录</router-link>
          </li>
          <li>
            <router-link to="disposal-report">销号记录</router-link>
          </li>
          <!-- <li>
            <router-link to="fault-report">问题库</router-link>
          </li> -->
        </ul>
      </li>

    </ul>
  </div>
</template>

<style>
li {
  margin: 8px 0 8px;
}
</style>


<script>
export default {
  data() {
    return {
      user: null
    }
  },
  mounted() {
    this.initUser()
  },
  methods: {
    initUser() {
      let user = this.getUser()
      this.user = user
    },
    getUser() {
      return JSON.parse(localStorage.getItem('user'))
    },
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.initUser()
    },
    clearCache() {
      if (!confirm('若有未上传之巡检记录，将一并丢失。确定要清除？')) return
      this.$db
        .delete()
        .then(r => {
          alert('数据缓存已清除')
        })
        .catch(e => {
          alert(e)
        })
    }
  }
}
</script>

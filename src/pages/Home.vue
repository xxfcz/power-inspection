<template>
  <div>
    <ul>
      <li>
        <router-link to="tasks">任务清单</router-link>
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
      <li>
        <router-link to="add-task">添加任务</router-link>
      </li>
      <!-- <li>
        <button @click="clearCache">清理数据缓存</button>
      </li> -->
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
  methods: {
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

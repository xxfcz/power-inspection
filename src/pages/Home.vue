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
    </ul>
  </div>
</template>

<style>
  li {
    margin: 8px 0 8px
  }
</style>


<script>
export default {
}
</script>

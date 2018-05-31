<template>
  <div>
    <ul>
      <li>
        <router-link to="inspect">巡检</router-link>
      </li>
      <li>
        <router-link to="tasks">任务清单</router-link>
      </li>
      <li>
        <router-link to="local-records">本地巡检记录</router-link>
      </li>
      <li>
        <router-link to="remote-records">远端巡检记录</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
}
</script>

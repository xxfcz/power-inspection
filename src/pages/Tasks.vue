<template>
  <div>
    <h1>任务清单</h1>
    <div v-if="!onLine">您已离线，无法下载</div>
    <button @click="download" :disabled="!onLine">重新下载</button>
    <span>最后更新时间：{{lastUpdateTime | moment().format('MM-DD HH:mm')}}</span>
    <ul>
      <div v-for="task in tasks">
        {{task.id}}. {{task.device}} @({{task.longitude}},{{task.latitude}})
        <span v-if="task.finished">已检</span>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
      lastUpdateTime: new Date()
    }
  },
  computed: {
    onLine() {
      return navigator.onLine
    }
  },
  mounted() {
    if (navigator.onLine) {
      this.download()
    } else {
      this.$db.tasks.toArray(a => {
        this.tasks = a
      })
      this.$db.config.get('tasks.lastUpdateTime').then(r => {
        this.lastUpdateTime = new Date(r.value)
      })
    }
  },
  methods: {
    download() {
      if (!navigator.onLine) {
        alert('您已离线，无法下载')
        return
      }
      this.$axios
        .get('/api/tasks')
        .then(resp => {
          var tasks = resp.data
          this.tasks = tasks
          this.lastUpdateTime = new Date()
          this.$db.tasks.bulkPut(tasks)
          this.$db.config.put({
            name: 'tasks.lastUpdateTime',
            value: this.lastUpdateTime
          })
        })
        .catch(function(response) {
          console.error(response)
        })
    }
  }
}
</script>

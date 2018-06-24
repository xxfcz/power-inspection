<template>
  <div>
    <h1>任务清单</h1>
    <div v-if="!onLine">您已离线，无法下载</div>
    <button @click="download" :disabled="!onLine">重新下载</button>
    <span>最后更新时间：{{lastUpdateTime | moment().format('MM-DD HH:mm')}}</span>
    <ul>
      <div v-for="task in tasks">
        <div>
          {{task.id}}.
          <span style="font-weight:bold">{{task.device}}</span>
          <span v-if="task.finished">已检</span>
        </div>
        <div style="margin-left:2em">
          坐标：{{task.longitude}},{{task.latitude}}<br> 区段：{{task.sectionName}}
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: this.getUser(),
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
      this.$db.tasks
        .toArray(a => {
          this.tasks = a
          return this.$db.config.get('tasks.lastUpdateTime')
        })
        .then(r => {
          this.lastUpdateTime = new Date(r.value)
        })
        .catch(e => {
          alert(e)
        })
    }
  },
  methods: {
    getUser() {
      return JSON.parse(localStorage.getItem('user'))
    },

    download() {
      if (!navigator.onLine) {
        alert('您已离线，无法下载')
        return
      }
      this.$axios
        .get('/api/tasks', {
          params: { userid: this.user.id }
        })
        .then(resp => {
          var tasks = resp.data
          this.tasks = tasks
          this.lastUpdateTime = new Date()
          this.$db.tasks
            .clear()
            .then(() => {
              return this.$db.tasks.bulkPut(tasks)
            })
            .then(r => {
              return this.$db.config.put({
                name: 'tasks.lastUpdateTime',
                value: this.lastUpdateTime
              })
            })
            .catch(e => {
              alert('保存失败！原因是：' + e)
            })
        })
        .catch(function(response) {
          console.error(response)
        })
    }
  }
}
</script>

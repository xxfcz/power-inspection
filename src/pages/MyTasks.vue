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
          <span style="font-weight:bold">{{task.name}}</span>
          <span v-if="task.finished" style="color: red">已检</span>
        </div>
        <div style="margin-left:2em">
          坐标：{{task.longitude}},{{task.latitude}}<br> 区段：{{task.section.name}}
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
      // 在数据库中标记已完成的任务
      this.$db.inspects
        .each(ins => {
          this.$db.tasks.update(ins.id, { finished: true })
        })
        .then(() => {
          // 加载任务表
          this.$db.tasks.toArray(a => {
            this.tasks = a
          })
        })
        .then(() => {
          return this.$db.config.get('tasks.lastUpdateTime').then(r => {
            this.lastUpdateTime = new Date(r.value)
          })
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
      return new Promise((resolve, reject) => {
        if (!navigator.onLine) {
          alert('您已离线，无法下载')
          reject()
          return
        }

        let tasks
        let url = `/api/schedules/user/${this.user.id}/todo`
        this.$axios
          .get(url)
          .then(resp => {
            let date = resp.data.date
            if (!date || date > this.$moment().format('YYYY-MM-DD')) {
              alert('今天没有任务！')
              resolve(false)
              return
            }
            tasks = resp.data.devices
            this.lastUpdateTime = new Date()
            return this.$db.inspects.each(ins => {
              let task = tasks.find(e => {
                return e.id == ins.id
              })
              if (task) task.finished = true
            })
          })
          .then(() => {
            this.tasks = tasks
            return this.$db.tasks.clear().then(() => {
              this.$db.tasks.bulkPut(tasks)
            })
          })
          .then(() => {
            return this.$db.config.put({
              name: 'tasks.lastUpdateTime',
              value: this.lastUpdateTime
            })
          })
          .catch(e => {
            alert('保存失败！原因是：' + e)
          })
      })
    }
  }
}
</script>

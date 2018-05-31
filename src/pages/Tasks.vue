<template>
  <div>
    <h1>任务清单</h1>
    <button @click="download">重新下载</button>
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
      tasks: []
    }
  },
  created() {
    this.$db.tasks.toArray(a =>{
      this.tasks = a
    })
  },
  methods: {
    download() {
      this.$axios
        .get('/api/tasks')
        .then(resp => {
          var tasks = resp.data
          this.$db.tasks.bulkPut(tasks)
          this.tasks = tasks
        })
        .catch(function(response) {
          console.error(response)
        })
    }
  }
}
</script>

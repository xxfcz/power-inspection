<template>
  <div>
    <!-- 输入面板 -->
    <div>
      <label>车间：
        <select v-model="selectedWorkshop">
          <option v-for="w in workshops" :value="w">{{w.name}}</option>
        </select>
      </label>
    </div>
    <div style="text-align:center">
      <button @click="onQuery">查询</button>
      <button @click="onExport">导出</button>
    </div>
    <!-- 结果网格 -->
    <div style="overflow-x: scroll">
      <table style="width: 800px;">
        <thead>
          <tr>
            <th>ID</th>
            <th>区段</th>
            <th>名称</th>
            <th>坐标</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks">
            <th>{{t.id}}</th>
            <th>{{t.sectionName}}</th>
            <th>{{t.device}}</th>
            <th>{{t.latitude}},{{t.longitude}}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      workshops: [],
      selectedWorkshop: null,
      tasks: []
    }
  },
  mounted() {
    this.loadWorkshops()
  },
  methods: {
    loadWorkshops() {
      this.$axios.get('/api/workshops').then(r => {
        this.workshops = r.data
      })
    },

    onQuery() {
      let wid = this.selectedWorkshop.id
      this.$axios.get('/api/tasks', { params: { wid: wid } }).then(r => {
        this.tasks = r.data
      })
    },
    onExport() {
      let wid = this.selectedWorkshop.id
      let url = `/api/tasks?wid=${wid}&_export=true`
      window.open(url, '_blank')
    }
  }
}
</script>

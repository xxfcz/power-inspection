<template>
  <div>
    <h2>报表：设备清单</h2>
    <!-- 输入面板 -->
    <div>
      <label>车间：
        <select v-model="selectedWorkshop">
          <option v-for="w in workshops" :value="w">{{w.name}}</option>
        </select>
      </label>
    </div>
    <div style="text-align:center;margin-top: 12px">
      <button @click="onQuery">查询</button>
      <button @click="onExport">导出</button>
    </div>
    <!-- 结果网格 -->
    <div style="overflow-x: scroll">
      <table style="min-width: 480px;">
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
            <td>{{t.id}}</td>
            <td>{{t.section.name}}</td>
            <td>{{t.name}}</td>
            <td>{{t.latitude}},{{t.longitude}}</td>
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
      }).catch(ex => {
        alert('取车间列表时出错：' + ex)
      })
    },

    onQuery() {
      let wid = this.selectedWorkshop.id
      this.$axios.get('/api/devices', { params: { wid: wid } }).then(r => {
        this.tasks = r.data
      })
    },
    onExport() {
      let wid = this.selectedWorkshop.id
      let url = `/api/devices?wid=${wid}&_export=true`
      window.open(url, '_blank')
    }
  }
}
</script>

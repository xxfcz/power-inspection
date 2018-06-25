<template>
  <div>
    <h2>报表：巡检记录</h2>
    <!-- 输入面板 -->
    <div>
      <label>车间：
        <select v-model="selectedWorkshop">
          <option v-for="w in workshops" :value="w">{{w.name}}</option>
        </select>
      </label>
    </div>
    <div>
      <label>起始日期：
        <input type="date" v-model="startDate">
      </label>
    </div>
    <div>
      <label>截止日期：
        <input type="date" v-model="endDate">
      </label>
    </div>
    <div style="text-align:center;margin-top: 12px">
      <button @click="onQuery">查询</button>
      <button @click="onExport">导出</button>
    </div>
    <!-- 结果网格 -->
    <div style="overflow-x: scroll">
      <table style="width: 800px;">
        <thead>
          <tr>
            <th>区段</th>
            <th>设备</th>
            <th>状态</th>
            <th>缺陷</th>
            <th>巡检时间</th>
            <th>巡检人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in inspects">
            <th>{{i.section}}</th>
            <th>{{i.device}}</th>
            <th>{{i.deviceStatus}}</th>
            <th>{{i.fault || '无'}}</th>
            <th>{{i.createTime | datetime}}</th>
            <th>{{i.user}}</th>
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
      startDate: this.$moment()
        .subtract(7, 'days')
        .format('YYYY-MM-DD'),
      endDate: this.$moment()
        .format('YYYY-MM-DD'),
      inspects: []
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
      this.$axios
        .get('/api/inspects', {
          params: {
            w: this.selectedWorkshop.name,
            d1: this.startDate,
            d2: this.endDate
          }
        })
        .then(r => {
          this.inspects = r.data
        })
    },
    onExport() {
      let url = `/api/inspects?w=${this.selectedWorkshop.name}&d1=${this.startDate}&d2=${this.endDate}&_export=true`
      window.open(url, '_blank')
    }
  }
}
</script>

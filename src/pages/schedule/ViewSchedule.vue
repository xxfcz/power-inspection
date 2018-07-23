<template>
  <div>
    <h2>查看巡检计划</h2>
    <div>
      <label>车间：
        <select v-model="selectedWorkshop">
          <option v-for="w in workshops" :value="w">{{w.name}}</option>
        </select>
      </label>
    </div>
    <div>
      <label>巡检日期：
        <input type="date" v-model="inspectDate">
      </label>
    </div>
    <div>
      <button @click="query">查询</button>
    </div>

    <div>
      <table>
        <thead>
          <th></th>
        </thead>
      </table>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ViewSchedule.vue",
    data() {
      return {
        selectedWorkshop: null,
        inspectDate: this.$moment().format('YYYY-MM-DD'),
        workshops: []
      }
    },
    mounted(){
      this.$axios.get('/api/workshops').then(r => {
        this.workshops = r.data
      })
    },
    methods:{
      query (){

      }
    }
  }
</script>

<style scoped>

</style>

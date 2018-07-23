<template>
  <div>
    <h2>查询巡检计划</h2>
    <div>
      <label>车间：
        <select v-model="selectedWorkshop">
          <option v-for="w in workshops" :value="w">{{w.name}}</option>
        </select>
      </label>
    </div>
    <div>
      <label>月份：
        <input type="text" v-model="month">
      </label>
    </div>
    <div>
      <label>标题：
        <input type="text" v-model="title">
      </label>
    </div>
    <div>类型：
      <label>
        <input type="radio" v-model="category" value="monthly">月度计划
      </label>
      <label>
        <input type="radio" v-model="category" value="temporary">临时计划
      </label>
    </div>
    <div>
      <button @click="query">查询</button>
    </div>

    <div style="overflow-x:scroll">
      <table style=";min-width: 480px">
        <thead>
          <tr>
            <th>车间</th>
            <th>月份</th>
            <th>计划标题</th>
            <th>计划种类</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sch in schedules" @click="select(sch)" :class="{selected: selectedSchedule===sch}">
            <td>{{sch.workshop.name}}</td>
            <td>{{sch.month}}</td>
            <td>{{sch.title}}</td>
            <td>{{sch.category}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 计划详情 -->
    <div v-for="i in items" class="detail">
      <div>
        <span class="label">区段</span>
        <span>{{i.section.name}}</span>
      </div>
      <div>
        <span class="label">日期</span>
        <span>{{i.date}}</span>
      </div>
      <div>
        <span class="label">人员</span>
        <span v-for="u in i.users" style="margin-right:8px">{{u.name}}</span>
      </div>
      <div style="text-align:center">
        <button>修改</button><button style="color:red">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected {
  color: white;
  background-color: blue;
}
.detail{
  border-top: solid blue 1px;
  margin-top: 6px;
  margin-bottom: 6px;
}
.label {
  display: inline-block;
  width: 4em;
}
button{
  margin-right: 16px;
}
</style>


<script>
export default {
  name: 'QuerySchedule',
  data() {
    return {
      selectedWorkshop: null,
      month: this.$moment().format('YYYY.MM'),
      category: 'monthly',
      title: '',
      workshops: [],
      schedules: [],
      selectedSchedule: null,
      items: []
    }
  },
  mounted() {
    this.$axios.get('/api/workshops').then(r => {
      this.workshops = r.data
      if (this.workshops.length > 0) this.selectedWorkshop = this.workshops[0]
    })
  },
  methods: {
    query() {
      this.$axios
        .get('/api/schedules', {
          params: {
            w: this.selectedWorkshop.id,
            m: this.month,
            t: this.title,
            c: this.category
          }
        })
        .then(r => {
          this.schedules = r.data
        })
        .catch(ex => {
          alert(ex)
        })
    },

    select(sch) {
      this.selectedSchedule = sch
      this.$axios.get('/api/schedules/' + sch.id).then(r => {
        this.items = r.data
      })
    }
  }
}
</script>

<style scoped>
</style>

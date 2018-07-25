// 显示、编辑一个计划细项：区段、日期、人员
<template>
  <div v-show="visible">
    <div class="detail">
      <div>
        <label class="label">区间：</label>
        <select v-model="section">
          <option v-for="s in sections" :value="s">{{s.name}}</option>
        </select>
      </div>
      <div>
        <label class="label">日期：</label>
        <input type="date" v-model="date">
      </div>
      <div>
        <label class="label">人员：</label>
        <select v-model="user1">
          <option v-for="u in users" :value="u">{{u.name}}</option>
        </select>
        <select v-model="user2">
          <option v-for="u in users" :value="u">{{u.name}}</option>
        </select>
      </div>
      <div style="position: absolute; top: 6px; right: 12px; text-align:center">
        <button @click="ok()">保存</button><br/>
        <button @click="hide()">放弃</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
  border-top: solid blue 1px;
  border-bottom: solid blue 1px;
  padding-bottom: 6px;
  margin-top: 6px;
  margin-bottom: 6px;
}
.label {
  display: inline-block;
  width: 4em;
}
button {
  margin-right: 16px;
  margin-top: 8px;
}
</style>

<script>
export default {
  name: 'ScheduleItem',
  /**
   * sch-item: {
   *  sectionId: 7,
   *  date: '2018-07-25',
   *  users: [1,3]
   * }
   */
  props: ['sections', 'users', 'sch-item'],
  data() {
    return {
      date: this.$moment()
        .add(1, 'days')
        .format('YYYY-MM-DD'),
      section: null,
      user1: null,
      user2: null,
      visible: false
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
    loadData() {
      // this.$axios.get('/api/users').then(r => {
      //   this.users = r.data
      // })
    },
    ok() {
      let params = {
        sectionId: this.section.id,
        date: this.date,
        userIds: [this.user1.id, this.user2.id]
      }
      this.$emit('ok', params)
    }
  }
}
</script>

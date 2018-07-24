// 显示、编辑一个计划细项：区段、日期、人员
<template>
  <div v-show="visible">
    <div class="detail">
      <div>
        <label class="label">区段</label>
        <select v-model="section">
          <option v-for="s in sections" :value="s">{{s.name}}</option>
        </select>
      </div>
      <div>
        <label class="label">日期</label>
        <input type="date" v-model="date">
      </div>
      <div>
        <label class="label">人员1</label>
        <select v-model="user1">
          <option v-for="u in users" :value="u">{{u.name}}</option>
        </select>
      </div>
      <div>
        <label class="label">人员2</label>
        <select v-model="user2">
          <option v-for="u in users" :value="u">{{u.name}}</option>
        </select>
      </div>
      <div style="text-align:center">
        <button @click="ok()">保存</button>
        <button @click="hide()">放弃</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  border-top: solid blue 1px;
  margin-top: 6px;
  margin-bottom: 6px;
}
.label {
  display: inline-block;
  width: 4em;
}
button {
  margin-right: 16px;
}
</style>

<script>
export default {
  name: 'ScheduleItem',
  props: ['sections'],
  data() {
    return {
      date: this.$moment()
        .add(1, 'days')
        .format('YYYY-MM-DD'),
      section: null,
      user1: null,
      user2: null,
      users: [],
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
      this.$axios.get('/api/users').then(r => {
        this.users = r.data
      })
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

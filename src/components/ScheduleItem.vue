// 显示、编辑一个计划细项：区段、日期、人员
<template>
  <div class="detail">
    <div>
      <label class="label">区间：</label>
      <select v-model="sectionId_">
        <option v-for="s in sections" :value="s.id">{{s.name}}</option>
      </select>
    </div>
    <div>
      <label class="label">日期：</label>
      <input type="date" v-model="date_">
    </div>
    <div>
      <label class="label">人员：</label>
      <select v-model="userId1">
        <option v-for="u in users" :value="u.id">{{u.name}}</option>
      </select>
      <select v-model="userId2">
        <option v-for="u in users" :value="u.id">{{u.name}}</option>
      </select>
    </div>
    <div style="position: absolute; top: 6px; right: 12px; text-align:center">
      <button @click="ok()">保存</button><br/>
      <button @click="cancel()">放弃</button>
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
  margin-bottom: 8px;
}
</style>

<script>
export default {
  name: 'ScheduleItem',
  /**
   * schItem: {
   *  sectionId: 7,
   *  date: '2018-07-25',
   *  users: [1,3]
   * }
   */
  props: ['sections', 'users', 'date', 'sectionId', 'userIds'],
  data() {
    let o = {
      sectionId_: this.sectionId,
      date_: this.date
    }
    if(this.userIds.length>0)
      o.userId1 = this.userIds[0]
    if(this.userIds.length>0)
      o.userId2 = this.userIds[1]

    return o
  },
  methods: {
    ok() {
        if(!this.userId1 || !this.userId2){
          alert('请选择两个人员！')
          return
        }
      if(this.userId1 == this.userId2){
        alert('两个人员不能是同一人！')
        return
      }

      let params = {
        sectionId: this.sectionId_,
        date: this.date_,
        userIds: [this.userId1, this.userId2]
      }
      this.$emit('ok', params)
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

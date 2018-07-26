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
    <div style="text-align: center">
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
    <div v-for="i in items" class="details">
      <div v-if="itemEdited===i">
        <schedule-item :sections="availableSections" :users="users" @ok="updateItem($event)" @cancel="itemEdited=null" :date.sync="itemEdited.date" :sectionId.sync="itemEdited.sectionId" :userIds="itemEdited.userIds"></schedule-item>
      </div>
      <div v-else="itemEdited===i">
        <div class="actions">
          <button @click="showEditPanel(i)">修改</button><br/>
          <button @click="deleteItem(i)" style="color:red">删除</button>
        </div>
        <div>
          <span class="label">区间</span>
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
      </div>
    </div>
    <div style="text-align:center;border-top: solid blue 1px;">
      <button @click="showAddPanel">添加更多区间</button>
    </div>
    <schedule-item v-if="itemAdded" :sections="availableSections" :users="users" @ok="addItem($event)" @cancel="itemAdded=null" :date.sync="itemAdded.date" :sectionId.sync="itemAdded.sectionId" :userIds="itemAdded.userIds"></schedule-item>
  </div>
</template>

<style scoped>
.selected {
  color: white;
  background-color: blue;
}
.details {
  position: relative;
  border-top: solid blue 1px;
  margin-top: 6px;
  margin-bottom: 6px;
}
.actions {
  position: absolute;
  top: 2px;
  right: 0;
}
.label {
  display: inline-block;
  width: 4em;
}
button {
  margin-right: 16px;
  margin-top: 6px;
}
</style>


<script>
import ScheduleItem from '@/components/ScheduleItem'

export default {
  name: 'QuerySchedule',
  components: { 'schedule-item': ScheduleItem },
  data() {
    return {
      selectedWorkshop: null,
      month: this.$moment().format('YYYY.MM'),
      category: 'monthly',
      title: '',
      workshops: [],
      schedules: [],
      selectedSchedule: null,
      items: [],
      isAdding: false,
      allSections: [],
      availableSections: [],
      users: [],
      itemEdited: null,
      itemAdded: null
    }
  },
  mounted() {
    this.$axios.get('/api/users').then(r => {
      this.users = r.data
    })
    this.$axios.get('/api/sections').then(r => {
      this.allSections = r.data
    })
    this.$axios.get('/api/workshops').then(r => {
      this.workshops = r.data
      if (this.workshops.length > 0) this.selectedWorkshop = this.workshops[0]
    })
  },
  methods: {
    query() {
      this.isAdding = false
      this.selectedSchedule = null
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

    reloadItems() {
      return this.$axios
        .get('/api/schedules/' + this.selectedSchedule.id)
        .then(r => {
          this.items = r.data
        })
    },

    select(sch) {
      this.selectedSchedule = sch
      this.reloadItems()
    },

    deleteItem(item) {
      let s = `确实要删除计划区间 ${item.section.name} ？`
      if (!confirm(s)) return
      let url = `/api/schedules/${this.selectedSchedule.id}/items/${item.id}`
      this.$axios
        .delete(url)
        .then(r => {
          if (r.data.ok) {
            this.reloadItems(this.selectedSchedule).then(r => {
              alert('成功删除')
            })
          } else alert(r.data.msg)
        })
        .catch(ex => {
          alert(ex.message)
        })
    },

    showAddPanel() {
      // 更新可用的区段列表
      this.availableSections = this.allSections.filter(sec => {
        return !this.items.find(i => {
          return i.sectionId == sec.id
        })
      })
      if (this.availableSections.length == 0) {
        alert('没有可用的区间了')
        return
      }

      let defUserIds=[null, null]
      if(this.items.length>0){
        defUserIds = this.items[this.items.length-1].userIds
      }
      
      this.itemAdded = {
        date: this.$moment().add(1, 'days').format('YYYY-MM-DD'),
        sectionId: this.availableSections[0].id,
        userIds: defUserIds
      }
    },

    showEditPanel(item) {
      this.availableSections = this.allSections.filter(sec => {
        return !this.items.find(i => {
          return i.sectionId == sec.id
        })
      })
      // 加上自己的区间
      this.availableSections.push(item.section)
      if (this.availableSections.length == 0) {
        alert('没有可用的区间了')
        return
      }
      this.itemEdited = item
    },

    addItem(evt) {
      evt.scheduleId = this.selectedSchedule.id
      let url = `/api/schedules/${this.selectedSchedule.id}/items`
      this.$axios
        .post(url, evt)
        .then(r => {
          if (r.data.ok) {
            this.reloadItems().then(() => {
              this.itemAdded = null
              alert('保存成功')
            })
          } else {
            alert('保存失败')
          }
        })
        .catch(ex => {
          alert(ex.message)
        })
    },
    updateItem(evt) {
      let url = `/api/schedules/${this.selectedSchedule.id}/items/${
        this.itemEdited.id
      }`
      this.$axios
        .put(url, evt)
        .then(r => {
          if (r.data.ok) {
            this.reloadItems().then(() => {
              this.itemEdited = null
              alert('保存成功')
            })
          } else {
            alert('保存失败')
          }
        })
        .catch(ex => {
          alert(ex.message)
        })
    }
  }
}
</script>

<style scoped>
</style>

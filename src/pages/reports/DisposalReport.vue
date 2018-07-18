<template>
  <div>
    <h2>报表：销号记录</h2>
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
    <div>状态：
      <label>
        <input type="radio" v-model="status" value="requested">待审
      </label>
      <label>
        <input type="radio" v-model="status" value="approved">通过
      </label>
      <label>
        <input type="radio" v-model="status" value="rejected">不通过
      </label>
    </div>
    <div style="text-align:center;margin-top: 12px">
      <button @click="onQuery">查询</button>
      <button @click="onExport">导出</button>
    </div>
    <!-- 结果网格 -->
    <div style="overflow-x: scroll" class="section">
      <table style="min-width: 560px;">
        <thead>
          <tr>
            <th>区段</th>
            <th>设备</th>
            <th>状态</th>
            <th>缺陷</th>
            <th>销号申请时间</th>
            <th>申请人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in disposals" @click="selectedDisposal=d" :class="{selected: selectedDisposal===d}">
            <td>{{d.inspect.section}}</td>
            <td>{{d.inspect.device}}</td>
            <td>{{d.inspect.deviceStatus}}</td>
            <td>{{d.inspect.fault || '无'}}</td>
            <td>{{d.inspect.createTime | datetime}}</td>
            <td>{{d.inspect.user}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectedDisposal" class="section">
      <div>销号照片</div>
      <div>
        <div style="float:left;width:33%" v-for="i in selectedDisposal.images">
          <img style="width:100%;" :src="i" @click="selectedImage=i">
        </div>
      </div>
    </div>

    <!-- 大照片 -->
    <div v-if="selectedImage" style="position: fixed; left:0; top:0; right:0;bottom:0; background-color: gray; overflow:scroll">
      <img :src="selectedImage" style="width:100%" @click="selectedImage=null">
    </div>

    <!-- 销号处理 -->
    <div class="section" style="clear: both; text-align:center" v-if="selectedDisposal && selectedDisposal.status == 'requested'">
      <button @click="onApprove">审核通过</button>&nbsp;
      <button @click="onReject">审核不通过</button>
    </div>
  </div>
</template>

<style scoped>
.selected {
  color: white;
  background-color: blue;
}
.section {
  border-top: 1px solid blue;
  /* border-bottom: 1px solid blue; */
  margin: 16px 0 16px;
  padding-top: 8px;
}
</style>


<script>
export default {
  data() {
    return {
      workshops: [],
      selectedWorkshop: null,
      startDate: this.$moment()
        .subtract(7, 'days')
        .format('YYYY-MM-DD'),
      endDate: this.$moment().format('YYYY-MM-DD'),
      status: 'requested',
      disposals: [],
      selectedDisposal: null,
      selectedImage: null
    }
  },
  mounted() {
    this.loadWorkshops()
  },
  methods: {
    loadWorkshops() {
      this.$axios.get('/api/workshops').then(r => {
        this.workshops = r.data.filter(e => {
          return e.id > 1
        })
        if (this.workshops.length > 0) {
          this.selectedWorkshop = this.workshops[0]
        }
      })
    },

    onQuery() {
      this.selectedDisposal = null
      this.selectedImage = null
      this.disposals = []
      this.$axios
        .get('/api/disposals', {
          params: {
            w: this.selectedWorkshop.id,
            d1: this.startDate,
            d2: this.endDate,
            s: this.status
          }
        })
        .then(r => {
          this.disposals = r.data
        })
    },
    onExport() {
      let url = `/api/inspects?w=${this.selectedWorkshop.name}&d1=${
        this.startDate
      }&d2=${this.endDate}&_export=true`
      window.open(url, '_blank')
    },
    fileChanged(e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      this.$_.forEach(files, f => {
        this.disposal.files.push(f)
        this.$xutils.readImage(f).then(data => {
          this.disposal.images.push({
            name: f.name,
            size: f.size,
            lastModified: f.lastModified,
            type: f.type,
            data: data // Base64
          })
        })
      })
    },
    onRequestDisposal(event) {
      event.preventDefault()
      let user = JSON.parse(localStorage.getItem('user'))
      let iid = this.selectedInspect.id
      let url = `/api/disposals/request/${iid}/${user.id}`
      let formData = new FormData()
      this.disposal.files.forEach((f, i) => {
        formData.append('file' + i, f)
      })

      let config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      this.$axios
        .post(url, formData, config)
        .then(res => {
          if (res.status === 200) {
            this.selectedDisposal.files = []
            this.selectedDisposal.images = []
            this.selectedDisposal.can = false
            alert('提交成功！')
          } else {
            throw '提交失败'
          }
        })
        .catch(ex => {
          alert(ex.message)
        })
    },
    onApprove() {
      let d = this.selectedDisposal
      let user = this.$xutils.getUser()
      let url = `/api/disposals/${d.id}/approved/by/${user.id}`
      this.$axios
        .post(url)
        .then(r => {
          if (!r.data.ok) throw r.data.msg
          this.onQuery()
          alert('该销号申请审核通过！')
        })
        .catch(ex => {
          alert('服务器处理失败：\n' + ex)
        })
    },
    onReject() {
      let d = this.selectedDisposal
      let user = this.$xutils.getUser()
      let url = `/api/disposals/${d.id}/rejected/by/${user.id}`
      this.$axios
        .post(url)
        .then(r => {
          if (!r.data.ok) throw r.data.msg
          this.onQuery()
          alert('该销号申请审核不通过！')
        })
        .catch(ex => {
          alert('服务器处理失败：\n' + ex)
        })
    }
  }
}
</script>

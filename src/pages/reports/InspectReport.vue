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
    <div>设备状态：
      <label>
        <input type="radio" v-model="normality" value="normal">正常
      </label>
      <label>
        <input type="radio" v-model="normality" value="abnormal">异常
      </label>
    </div>
    <div>销号状态：
      <label>
        <input type="radio" v-model="disposalStatus" value="_all_">全部
      </label>
      <label>
        <input type="radio" v-model="disposalStatus" value="none">待申请
      </label>
      <label>
        <input type="radio" v-model="disposalStatus" value="requested">待审核
      </label>
      <label>
        <input type="radio" v-model="disposalStatus" value="approved">已通过
      </label>
      <label>
        <input type="radio" v-model="disposalStatus" value="rejected">不通过
      </label>
    </div>
    <div style="text-align:center;margin-top: 12px">
      <button @click="onQuery">查询</button>
      <button @click="onExport">导出</button>
    </div>
    <!-- 结果网格 -->
    <div style="overflow-x: scroll" class="section">
      <table style="min-width: 600px;">
        <thead>
          <tr>
            <th>区段</th>
            <th>设备</th>
            <th>缺陷</th>
            <th>巡检时间</th>
            <th>巡检人</th>
            <th>销号状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in inspects" @click="selectedInspect=i" :class="{selected: selectedInspect===i}">
            <td>{{i.section.name}}</td>
            <td>{{i.device.name}}</td>
            <td>{{i.fault || '无'}}</td>
            <td>{{i.time | datetime}}</td>
            <td>{{i.user.name}}</td>
            <td>{{i.disposalStatus}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectedInspect" class="section">
      <div>巡检照片</div>
      <div>
        <div style="float:left;width:33%" v-for="i in selectedInspect.images">
          <img style="width:100%;" :src="i.url" @click="selectedImage=i">
        </div>
      </div>
    </div>

    <!-- 大照片 -->
    <div v-if="selectedImage" style="position: fixed; left:0; top:0; right:0;bottom:0; background-color: gray; overflow:scroll">
      <img :src="selectedImage.url" style="width:100%" @click="selectedImage=null">
    </div>

    <!-- 销号申请 -->
    <div style="clear:both" class="section" v-if="canRequestDisposal">
      <button @click="disposal.visible=!disposal.visible">我要申请销号
        <span v-if="disposal.visible">▲</span>
        <span v-else="disposal.visible">▼</span>
      </button>
      <div v-if="disposal.visible">
        <label>选择照片：
          <input type="file" accept="image/*" multiple @change="fileChanged">
        </label>
        <div v-for="i in disposal.images" style="text-align:center">
          <img :src="i.data" style="max-width: 60%; max-height:160px">
          <div style="position:relative">
            <div style="float:left">{{ i.size | bytes() }}</div>
            <div style="margin-left: 120px; text-align:right">拍摄于 {{new Date(i.lastModified) | moment().format('YYYY-MM-DD hh:mm')}}</div>
          </div>
        </div>
        <div>
          <button @click="onRequestDisposal($event)">提交销号申请</button>
        </div>
      </div>
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
      normality: 'abnormal',
      disposalStatus: '_all_',
      inspects: [],
      selectedInspect: null,
      selectedImage: null,
      // 销号相关
      disposal: {
        visible: false,
        images: [],
        files: []
      }
    }
  },
  mounted() {
    this.loadWorkshops()
  },
  computed: {
    canRequestDisposal() {
      return (
        this.selectedInspect && this.selectedInspect.disposalStatus == 'none'
      )
    }
  },
  methods: {
    loadWorkshops() {
      this.$axios.get('/api/workshops').then(r => {
        this.workshops = r.data
        if (this.workshops.length > 0) {
          this.selectedWorkshop = this.workshops[0]
        }
      })
    },

    onQuery() {
      this.selectedInspect = null
      this.$axios
        .get('/api/inspects', {
          params: {
            w: this.selectedWorkshop.id,
            d1: this.startDate,
            d2: this.endDate,
            n: this.normality,
            ds: this.disposalStatus
          }
        })
        .then(r => {
          this.inspects = r.data
        })
    },
    onExport() {
      let token = localStorage.getItem('token')
      let url = `/api/inspects?w=${this.selectedWorkshop.id}&ds=${
        this.disposalStatus
      }
        &d1=${this.startDate}&d2=${this.endDate}&_export=true&_token=${token}`
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
          if (res.data.ok) {
            this.disposal.files = []
            this.disposal.images = []
            this.selectedInspect = null
            this.onQuery()
            alert('提交成功！')
          } else {
            throw '提交失败：' + res.data.msg
          }
        })
        .catch(ex => {
          console.error(ex)
          alert(ex)
        })
    }
  }
}
</script>

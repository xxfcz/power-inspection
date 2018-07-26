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
          <tr v-for="t in tasks" @click="selectDevice(t)" :class="{selected: selectedDevice===t}">
            <td>{{t.id}}</td>
            <td>{{t.section.name}}</td>
            <td>{{t.name}}</td>
            <td>{{t.latitude}},{{t.longitude}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr>
    <div v-if="selectedDevice">
      <div>设备名称：{{selectedDevice.name}}</div>
      <div>
        <label>设备坐标：<input type="text" v-model="devCoords"></label>
      </div>
      <div>当前坐标：
        <span v-if="curCoords">{{curCoords.latitude}}, {{curCoords.longitude}}</span>
        <span v-else="curCoords">正在定位中...</span>
      </div>
      <div>计算距离：{{distance}} 米</div>
      <div class="button-bar">
        <button @click="fillIn">填入当前坐标</button>
        <button @click="save">保存设备坐标</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.selected {
  color: white;
  background-color: blue;
}
.button-bar {
  text-align: center;
}
button {
  margin-right: 8px;
}
button:last-child {
  margin-right: 0;
}
</style>

<script>
export default {
  data() {
    return {
      workshops: [],
      selectedWorkshop: null,
      tasks: [],
      selectedDevice: null,
      devCoords: '',
      curCoords: null
    }
  },
  mounted() {
    this.loadWorkshops()
  },
  computed: {
    distance() {
      if (this.selectedDevice && this.curCoords) {
        let d = this.$xutils.calcDistance(
          this.selectedDevice.latitude,
          this.selectedDevice.longitude,
          this.curCoords.latitude,
          this.curCoords.longitude
        )
        return parseInt(d)
      }
    }
  },
  methods: {
    loadWorkshops() {
      this.$axios
        .get('/api/workshops')
        .then(r => {
          this.workshops = r.data
          if (this.workshops.length > 0)
            this.selectedWorkshop = this.workshops[0]
        })
        .catch(ex => {
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
      let token = localStorage.getItem('token')
      let wid = this.selectedWorkshop.id
      let url = `/api/devices?wid=${wid}&_export=true&_token=${token}`
      window.open(url, '_blank')
    },
    selectDevice(dev) {
      this.selectedDevice = dev
      this.devCoords = `${dev.latitude}, ${dev.longitude}`
      this.$xutils.getCurrentPosition().then(pos => {
        this.curCoords = {
          latitude: pos.latitude,
          longitude: pos.longitude
        }
      })
    },
    fillIn() {
      this.devCoords = [this.curCoords.latitude, this.curCoords.longitude].join(
        ','
      )
    },
    save() {
      debugger
      let coords = this.devCoords.split(',')
      coords = {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1])
      }
      this.$axios
        .put('/api/devices/' + this.selectedDevice.id, coords)
        .then(r => {
          if (r.data.ok) {
            this.onQuery()
            this.selectedDevice = null
            alert('坐标保存成功')
          } else alert(r.data.msg)
        })
        .catch(ex => {
          alert(ex.message || ex)
        })
    }
  }
}
</script>

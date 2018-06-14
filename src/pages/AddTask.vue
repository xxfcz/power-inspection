<template>
  <div>
    <h1>添加任务/设备</h1>
    <div>
      <label>设备名称：
        <input name="name" v-model="device.name">
      </label>
    </div>
    <div>
      <button @click="useCurrentPosition" class="useCurPos">使用当前位置</button>
      <label>经度：
        <input name="longitude" v-model="device.longitude" @change="calcDistance">
      </label><br>
      <label>纬度：
        <input name="latitude" v-model="device.latitude" @change="calcDistance">
      </label>
    </div>
    <div>与当前位置相距：{{distance}}米</div>
    <div>
      <button class="upload" @click="upload">上传</button>
    </div>
  </div>
</template>

<style>
button.useCurPos {
  float: right;
  height: 4em;
  width: 5em;
  margin: 0;
}
button.upload {
  display: block;
  margin: 8px auto 8px;
}
</style>


<script>
export default {
  data() {
    return {
      device: {
        name: '自装设备A',
        longitude: null,
        latitude: null
      },
      curPos: {
        longitude: null,
        latitude: null
      },
      distance: 0
    }
  },
  // computed: {
  //   distance() {
  //     if (!this.device.longitude || !this.device.latitude) return null
  //     return this.$utils.calcDistance(
  //       this.device.latitude,
  //       this.device.longitude
  //     )
  //   }
  // },
  methods: {
    useCurrentPosition() {
      this.$utils
        .getCurrentPosition()
        .then(coords => {
          this.curPos.longitude = coords.longitude
          this.curPos.latitude = coords.latitude
          this.device.longitude = coords.longitude
          this.device.latitude = coords.latitude
          this.distance = 0
        })
        .catch(error => {
          alert(error)
        })
    },
    calcDistance() {
      this.distance = this.$utils.calcDistance(
        this.device.latitude,
        this.device.longitude,
        this.curPos.latitude,
        this.curPos.longitude
      )
    },
    upload() {
      this.$axios
        .post('/api/tasks', {
          device: this.device.name,
          longitude: this.device.longitude,
          latitude: this.device.latitude
        })
        .then(r => {
          alert('上传成功!')
        })
        .catch(error => {
          alert(error)
        })
    }
  }
}
</script>

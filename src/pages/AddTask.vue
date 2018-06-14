<template>
  <div>
    <h1>添加任务/设备</h1>
    <div v-if="!onLine" style="color:red">您已离线，无法添加</div>
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
    <div class="distance">与当前位置相距：{{distance}}米</div>
    <div>
      <button class="submit" @click="submit" :disabled="!onLine">提交</button>
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
button.submit {
  display: block;
  margin: 8px auto 8px;
}
label {
  position: relative;
  display: inline-block;
  margin: 6px 0 0 6px;
}
label input {
  position: absolute;
  left: 6em;
  top: 0em;
}
.distance {
  margin-top: 4px;
  margin-left: 36px;
  font-size: smaller;
  text-align: center;
}
</style>

<script>
export default {
  data() {
    return {
      device: {
        name: null,
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
  computed: {
    onLine() {
      return navigator.onLine
    }
  },
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
      if (isNaN(this.device.longitude) || isNaN(this.device.latitude)) {
        return
      }
      let lat1 = parseFloat(this.device.latitude)
      let lng1 = parseFloat(this.device.longitude)
      let lat2 = parseFloat(this.curPos.latitude)
      let lng2 = parseFloat(this.curPos.longitude)
      this.distance = this.$utils.calcDistance(lat1, lng1, lat2, lng2)
    },
    submit() {
      if (
        !this.device.name ||
        !this.device.longitude ||
        !this.device.latitude
      ) {
        alert('请填写完整再提交')
        return
      }
      this.$axios
        .post('/api/tasks', {
          device: this.device.name,
          longitude: this.device.longitude,
          latitude: this.device.latitude
        })
        .then(r => {
          alert('上传成功!')
          this.$router.go(-1)
        })
        .catch(error => {
          alert(error)
        })
    }
  }
}
</script>

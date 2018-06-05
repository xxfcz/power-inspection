<template>
  <div>
    <h1>巡检</h1>
    <div>当前坐标：{{longitude}},{{latitude}}
      <button @click="relocate">刷新</button>
    </div>
    <div class="section">
      <button @click="scanDevices">搜索附近设备</button>
      <select v-model="selectedDeviceId" @change="deviceChanged()">
        <option value="">请选择设备</option>
        <option v-for="d in devices" :value="d.id" :data-distance="d.distance" :disabled="d.distance>500">
          {{d.name}} - {{d.distance}}m</option>
      </select>
    </div>
    <div class="section">
      <label>选择照片：
        <input type="file" @change="fileChanged">
      </label>
      <img :src="image" style="width: 60%">
      <div>拍摄于 {{imageTime}}</div>
    </div>
    <div class="section">
      <label>正常
        <input type="radio" value="normal" v-model="deviceStatus">
      </label>
      <br>
      <label>异常
        <input type="radio" value="abnormal" v-model="deviceStatus">
      </label>
      <br>
    </div>

    <div class="section">
      <button @click="save">保存</button>
    </div>

  </div>
</template>

<style>
.section {
  margin-top: 18px;
  padding-top: 6px;
  border-top: solid blue 1px;
}
</style>


<script>
import utils from '@/utils'

export default {
  data() {
    return {
      longitude: null,
      latitude: null,
      selectedDeviceId: '',
      // 附近的设备
      devices: [],
      // 拍摄的照片
      image: null,
      imageTime: null,
      // 设备状态
      deviceName: '',
      deviceStatus: 'normal',

      picked: 'One'
    }
  },
  created() {
    this.relocate()
  },
  methods: {
    relocate() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          this.longitude = pos.coords.longitude
          this.latitude = pos.coords.latitude
        })
      } else {
        alert('您的浏览器不支持地理定位！')
      }
    },
    scanDevices() {
      this.devices = []
      this.$db.tasks.toArray(tasks => {
        tasks.forEach(t => {
          let d = this.$utils.getDistance(
            t.latitude,
            t.longitude,
            this.latitude,
            this.longitude
          )
          console.log(d)
          this.devices.push({
            id: t.id,
            name: t.device,
            distance: parseInt(d)
          })
        })
      })
    },
    deviceChanged() {
      console.log(this.selectedDeviceId)
      let theDevice = this.devices.find(e => {
        return e.id == this.selectedDeviceId
      })
      this.deviceName = theDevice.name
    },
    fileChanged(e) {
      console.log(e)
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      this.createImage(files[0])
      this.imageTime = files[0].lastModifiedDate
    },
    createImage(file) {
      let image = new Image()
      let reader = new FileReader()
      let vm = this
      reader.onload = e => {
        vm.image = e.target.result
      }
      reader.readAsDataURL(file)
    },
    save(e) {
      this.$db.inspects
        .add({
          device: this.deviceName,
          deviceStatus: this.deviceStatus,
          imageData: this.image,
          imageTime: this.imageTime,
          longitude: this.longitude,
          latitude: this.latitude,
          createTime: new Date()
        })
        .then(e => {
          alert('保存成功！')
        })
        .catch(e => {
          alert('保存失败！' + e)
        })
    }
  }
}
</script>

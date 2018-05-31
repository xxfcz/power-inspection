<template>
  <div>
    <h1>巡检</h1>
    <div>当前坐标：{{longitude}},{{latitude}}
      <button @click="relocate">刷新</button>
    </div>
    <button @click="scanDevices">搜索附近设备</button>
    <div>
      <select v-model="selectedDeviceId" @change="deviceChanged()">
        <option value="" selected>请选择设备</option>
        <option v-for="d in devices" :value="d.id" :data-distance="d.distance" :disabled="d.distance>500">
          {{d.name}} - {{d.distance}}m</option>
      </select>
    </div>
  </div>
</template>

<script>
import utils from '@/utils'

export default {
  data() {
    return {
      longitude: null,
      latitude: null,
      selectedDeviceId: null,
      // 附近的设备
      devices: []
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
    deviceChanged(){
      console.log(this.selectedDeviceId)
    }
  }
}
</script>

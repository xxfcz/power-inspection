<template>
  <div>
    <h1>巡检</h1>
    <div>当前坐标：{{longitude}},{{latitude}}
      <button @click="refresh(false)">刷新坐标</button>
    </div>
    <div class="section">
      <button @click="scanDevices">刷新附近设备</button>
      <select v-model="selectedDevice">
        <option value="" disabled> -- 请选择设备 -- </option>
        <option v-for="d in devices" :value="d" :data-distance="d.distance" :disabled="d.disabled">
          {{d.section.name}} {{d.name}} - {{d.distance}}m {{d.disabled?'（不可选）':''}}</option>
      </select>
    </div>
    <div class="section">
      <label>选择照片：
        <input type="file" accept="image/*" multiple @change="fileChanged">
      </label>
      <div v-for="i in images" style="text-align:center">
        <img :src="i.data" style="max-width: 60%; max-height:160px">
        <div style="position:relative">
          <div style="float:left">{{ i.size | bytes() }}</div>
          <div style="margin-left: 120px; text-align:right">拍摄于 {{new Date(i.lastModified) | moment().format('YYYY-MM-DD hh:mm')}}</div>
        </div>
      </div>
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
    <div class="section" v-if="deviceStatus=='abnormal'">
      <select v-model="selectedFault">
        <option value="" disabled selected> -- 请选择故障类型 -- </option>
        <option v-for="f in faults" :value="f">
          {{f}}</option>
        <option value="自定义">自定义</option>
      </select>
      <div v-if="selectedFault=='自定义'">
        <label>
          <input type="text" v-model="customFault"></label>
        </label>
      </div>
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
option:disabled {
  color: red;
}
</style>


<script>
import utils from '@/utils'
import _ from 'lodash'

const DIST_LIMIT = 500 // 不显示距离超过500米的设备

export default {
  data() {
    return {
      // 预定义缺陷
      faults: this.$faults,
      // 附近的设备
      devices: [],
      // 选中的设备
      selectedDevice: null,
      deviceStatus: 'normal',
      selectedFault: '',
      customFault: '',
      user: {},
      longitude: null,
      latitude: null,
      // 拍摄的照片
      images: []
    }
  },
  mounted() {
    let u = JSON.parse(localStorage.getItem('user'))
    if (u) this.user = u
    this.refresh(true)
  },
  methods: {
    relocate() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              this.longitude = pos.coords.longitude
              this.latitude = pos.coords.latitude
              resolve(`取到坐标为：${this.longitude}, ${this.latitude}`)
            },
            err => {
              reject(`${err.code}: ${err.message}`)
            }
          )
        } else {
          reject('您的浏览器不支持地理定位！')
        }
      })
    },
    scanDevices() {
      this.devices = []
      this.$db.tasks.toArray(tasks => {
        tasks.forEach(t => {
          // 计算每个设备到当前位置的距离
          let dist = this.$utils.calcDistance(
            t.latitude,
            t.longitude,
            this.latitude,
            this.longitude
          )
          // 添加到显示用的设备列表
          t.distance = parseInt(dist)
          t.disabled = dist > DIST_LIMIT
          this.devices.push(t)
          // 按距离升序排列
          this.devices.sort((a, b) => {
            return a.distance - b.distance
          })
        })
      })
    },
    refresh(silent = true) {
      this.relocate(true)
        .then(r => {
          silent || alert(r)
          this.scanDevices()
        })
        .catch(s => {
          alert(s)
        })
    },
    fileChanged(e) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      _.forEach(files, f => {
        this.createImage(f).then(data => {
          /*
            {
              lastModified,
              lastModifiedDate,
              name,
              size,
              type
            }
          */
          this.images.push({
            name: f.name,
            size: f.size,
            lastModified: f.lastModified,
            type: f.type,
            data: data // Base64
          })
        })
      })
    },
    createImage(file) {
      return new Promise((resolve, reject) => {
        let image = new Image()
        let reader = new FileReader()
        reader.onload = e => {
          resolve(e.target.result)
        }
        reader.readAsDataURL(file)
      })
    },
    // 保存到本地
    save() {
      let fault =
        this.deviceStatus == 'normal'
          ? ''
          : this.selectedFault == '自定义'
            ? this.customFault
            : this.selectedFault
      let dev = this.selectedDevice
      this.$db.inspects
        .add({
          workshop: this.user.workshop.name,
          section: dev.section.name,
          device: dev.name,
          deviceStatus: this.deviceStatus,
          fault: fault,
          images: this.images,
          longitude: this.longitude,
          latitude: this.latitude,
          user: this.user.name,
          time: new Date()
        })
        .then(e => {
          alert('保存成功！')
          this.$router.go(-1)
        })
        .catch(e => {
          alert('保存失败！' + e)
        })
    }
  }
}
</script>

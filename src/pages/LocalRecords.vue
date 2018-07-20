<template>
  <div>
    <h1>本地暂存的巡检记录</h1>
    <button @click="upload" :disabled="uploadDisabled">上传</button>
    <div v-for="item in items" style="padding-top: 8px; border-top: blue solid 1px">
      <div v-if="item.percent">{{item.percent}}</div>
      <div style="color:red" v-if="item.error">{{item.error}}</div>
      <dl>
        <dt>区段：</dt>
        <dd>{{item.r.sectionName}}</dd>
      </dl>
      <dl>
        <dt>设备：</dt>
        <dd>{{item.r.deviceName}}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{item.r.time | datetime}}</dd>
      </dl>
      <dl>
        <dt>巡检位置：</dt>
        <dd>{{item.r.longitude}}，{{item.r.latitude}}</dd>
      </dl>
      <dl>
        <dt>巡检人：</dt>
        <dd>{{item.r.userName}}</dd>
      </dl>
      <dl>
        <dt>设备状态：</dt>
        <dd>{{item.r.deviceStatus}}</dd>
      </dl>
      <dl v-if="item.r.deviceStatus=='abnormal'">
        <dt>故障类型：</dt>
        <dd>{{item.r.fault}}</dd>
      </dl>
      <div>
        <div v-for="i in item.r.images" style="text-align:center">
          <img :src="i.data" style="max-width: 60%; max-height:160px">
          <div style="position:relative">
            <div style="float:left">{{ i.size | bytes() }}</div>
            <div style="margin-left: 120px; text-align:right">拍摄于 {{new Date(i.lastModified) | datetime}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
dt {
  float: left;
}
</style>


<script>
import config from '../../config'

const MAX_BODY_SIZE = process.env.NODE_ENV === 'production' ? config.build.max_body_size : config.dev.max_body_size

export default {
  data() {
    return {
      isUploading: false,
      items: []
    }
  },
  created() {
    this.reloadInspects()
  },
  computed: {
    uploadDisabled() {
      return this.items.length == 0 || this.isUploading
    }
  },
  methods: {
    reloadInspects() {
      this.$db.inspects.toArray(array => {
        array.sort((a, b) => {
          return b.createTime - a.createTime
        })
        this.items = array.map(e=>{
          return {
            r: e,
            percent: 0
          }
        })
      })
    },
    upload() {
      // 上传巡检记录(包括照片)
      this.isUploading = true
      let count = this.items.length
      let results = []
      this.items.forEach((item) => {
        // 检查数据大小
        let size = JSON.stringify(item.r).length
        if (size > MAX_BODY_SIZE) {
          item.error = `记录过大，无法上传：${this.$bytes(size)}>${this.$bytes(MAX_BODY_SIZE)}`
          return
        }
        item.percent = '开始上传'
        this.$axios
          .post('/api/inspects', item.r, {
            onUploadProgress: progress => {
              let p = parseInt(progress.loaded / progress.total * 100)
              if (p) item.percent = p + ' %'
            }
          })
          .then(() => {
            this.$db.inspects.delete(item.r.id).then(() => {
              this.reloadInspects()
              let msg = `上传成功：${item.r.device}`
              console.info(msg)
              //alert(msg)
            })
          })
          .catch(error => {
            item.error = `上传时出错：${error}`
          })
          .finally(() => {
            count--
            console.log('count=', count)
            if (!count) this.isUploading = false
          })
      })
    }
  }
}
</script>

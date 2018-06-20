<template>
  <div>
    <h1>本地暂存的巡检记录</h1>
    <button @click="upload" :disabled="uploadDisabled">上传</button>
    <div v-for="r in records" style="padding-top: 8px; border-top: blue solid 1px">
      <div v-if="r.percent">{{r.percent}}</div>
      <div style="color:red" v-if="r.error">{{r.error}}</div>
      <dl>
        <dt>设备：</dt>
        <dd>{{r.device}}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{r.createTime | datetime}}</dd>
      </dl>
      <dl>
        <dt>巡检位置：</dt>
        <dd>{{r.longitude}}，{{r.latitude}}</dd>
      </dl>
      <dl>
        <dt>设备状态：</dt>
        <dd>{{r.deviceStatus}}</dd>
      </dl>
      <div>
        <div v-for="i in r.images" style="text-align:center">
          <img :src="i.data" style="max-width: 60%; max-height:160px">
          <div style="position:relative">
            <div style="float:left">{{ i.size | bytes() }}</div>
            <div style="margin-left: 120px; text-align:right">拍摄于 {{new Date(i.lastModified) | moment().format('YYYY-MM-DD hh:mm')}}</div>
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
import _ from 'lodash'
import config from '../../config'

const MAX_BODY_SIZE = process.env.NODE_ENV === 'production' ? config.build.max_body_size : config.dev.max_body_size

export default {
  data() {
    return {
      isUploading: false,
      records: []
    }
  },
  created() {
    this.reloadInspects()
  },
  computed: {
    uploadDisabled() {
      return this.records.length == 0 || this.isUploading
    }
  },
  methods: {
    reloadInspects() {
      this.$db.inspects.toArray(array => {
        array.sort((a, b) => {
          return b.createTime - a.createTime
        })
        array.forEach(e => {
          e.percent = 0
        })
        this.records = array
      })
    },
    upload() {
      // 上传巡检记录(包括照片)
      this.isUploading = true
      let count = this.records.length
      let results = []
      this.records.forEach((rec, i) => {
        // 检查数据大小
        let size = JSON.stringify(this.records[0]).length
        if (size > MAX_BODY_SIZE) {
          rec.error = `记录过大，无法上传：${this.$bytes(size)}>${this.$bytes(MAX_BODY_SIZE)}`
          return
        }
        rec.percent = '开始上传'
        this.$axios
          .post('/api/inspects', rec, {
            onUploadProgress: progress => {
              let p = parseInt(progress.loaded / progress.total * 100)
              if (p) rec.percent = p + ' %'
            }
          })
          .then(() => {
            this.$db.inspects.delete(rec.device).then(() => {
              this.reloadInspects()
              let msg = `上传成功：${rec.device}`
              console.info(msg)
              //alert(msg)
            })
          })
          .catch(error => {
            rec.error = `上传时出错：${error}`
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

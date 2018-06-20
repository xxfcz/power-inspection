<template>
  <div>
    <h1>本地暂存的巡检记录</h1>
    <button @click="upload" :disabled="records.length==0">上传</button>
    <div v-for="r in records" style="padding-top: 16px; border-top: blue solid 1px">
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

export default {
  data() {
    return {
      records: []
    }
  },
  created() {
    this.reloadInspects()
  },
  methods: {
    reloadInspects() {
      this.$db.inspects.toArray(array => {
        array.sort((a, b) => {
          return b.createTime - a.createTime
        })
        this.records = array
      })
    },
    upload() {
      // 上传巡检记录(包括照片)
      let results = []
      this.records.forEach((e, i) => {
        this.$axios
          .post('/api/inspects', e)
          .then(r => {
            this.$db.inspects.delete(e.device).then(r2 => {
              this.reloadInspects()
              let msg = `上传成功：${e.device}`
              console.info(msg)
              alert(msg)
            })
          })
          .catch(error => {
            alert(`上传${e.name}时出错：${error}`)
          })
      })
    }
  }
}
</script>

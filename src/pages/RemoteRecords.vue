<template>
  <div>
    <h1>服务器上的巡检记录</h1>
    <div v-if="!onLine">您已离线，无法查看</div>
    <div v-for="r in records" style="padding-top: 16px; border-top: blue solid 1px">
      <img :src="r.imageData" style="float:right;max-width:25%;max-height:150px">
      <dl>
        <dt>设备：</dt>
        <dd>{{ r.device }}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{ r.createTime | datetime }}</dd>
      </dl>
      <dl>
        <dt>巡检位置：</dt>
        <dd>{{ r.longitude }}，{{ r.latitude }}</dd>
      </dl>
      <dl>
        <dt>设备状态：</dt>
        <dd>{{r.deviceStatus}}</dd>
      </dl>
      <dl v-if="r.deviceStatus=='abnormal'">
        <dt>故障类型：</dt>
        <dd>{{r.fault}}</dd>
      </dl>
      <div v-for="i in r.images" style="text-align:center">
        <img :src="i.url" style="max-width: 60%; max-height:160px">
        <div style="position:relative">
          <div style="float:left">{{ i.size | bytes() }}</div>
          <div style="margin-left: 120px; text-align:right">拍摄于 {{new Date(i.lastModified) | moment().format('YYYY-MM-DD hh:mm')}}</div>
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
export default {
  data() {
    return {
      records: []
    }
  },
  computed: {
    onLine() {
      return navigator.onLine
    }
  },
  created() {
    if (navigator.onLine) this.loadInspects()
  },
  methods: {
    loadInspects() {
      if (!navigator.onLine) {
        alert('您已离线，无法查看服务器上的巡检记录')
        return
      }
      this.$axios
        .get('/api/inspects')
        .then(r => {
          this.records = r.data
          this.records.forEach(e => {
            e.createTime = new Date(e.createTime)
          })
          this.records.sort((a, b) => {
            return b.createTime - a.createTime
          })
        })
        .catch(error => {
          alert('加载数据时出错：' + error)
        })
    }
  }
}
</script>

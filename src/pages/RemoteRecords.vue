<template>
  <div>
    <h1>服务器上的巡检记录</h1>
    <div v-for="r in records" style="padding-top: 16px; border-top: blue solid 1px">
      <img :src="r.imageData" style="float:right;max-width:25%;max-height:150px">
      <dl>
        <dt>设备：</dt>
        <dd>{{ r.device }}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{ r.createTime | moment().format('YYYY-MM-DD HH:mm') }}</dd>
      </dl>
      <dl>
        <dt>拍照时间：</dt>
        <dd>{{ r.imageTime | moment().format('YYYY-MM-DD HH:mm')}}</dd>
        <!--   -->
      </dl>
      <dl>
        <dt>巡检位置：</dt>
        <dd>{{ r.longitude }}，{{ r.latitude }}</dd>
      </dl>
      <dl>
        <dt>设备状态：</dt>
        <dd>{{r.deviceStatus}}</dd>
      </dl>
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
  created() {
    this.loadInspects()
  },
  methods: {
    loadInspects (){
      this.$axios.get('/api/inspects').then(r => {
        this.records = r.data
        this.records.forEach(e => {
          e.createTime = new Date(e.createTime)
          e.imageTime = new Date(e.imageTime)
        })
      }).catch(error => {
        alert('加载数据时出错：' + error)
      })
    }
  }
}
</script>

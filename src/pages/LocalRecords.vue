<template>
  <div>
    <h1>本地存储的巡检记录，尚未上传</h1>
    <div v-for="r in records" style="padding-top: 16px; border-top: blue solid 1px">
      <dl>
        <dt>设备：</dt>
        <dd>{{r.device}}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{r.createTime}}</dd>
      </dl>
      <dl>
        <dt>巡检位置：</dt>
        <dd>{{r.longitude}}，{{r.latitude}}</dd>
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
    this.$db.inspects.toArray(array => {
      this.records = array
    })
  }
}
</script>

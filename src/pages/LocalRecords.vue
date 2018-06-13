<template>
  <div>
    <h1>本地存储的巡检记录</h1>
    <button @click="upload" :disabled="records.length==0">上传</button>
    <div v-for="r in records" style="padding-top: 16px; border-top: blue solid 1px">
      <img :src="r.imageData" style="float:right;max-width:25%;max-height:150px">
      <dl>
        <dt>设备：</dt>
        <dd>{{r.device}}</dd>
      </dl>
      <dl>
        <dt>巡检时间：</dt>
        <dd>{{r.createTime | moment().format('YYYY-MM-DD HH:mm')}}</dd>
      </dl>
      <dl>
        <dt>拍照时间：</dt>
        <dd>{{r.imageTime | moment().format('YYYY-MM-DD HH:mm')}}</dd>
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
  },
  methods: {
    upload() {
      let posts = this.records.map(e => {
        return this.$axios.post('/api/inspects', e)
      })
      this.$axios
        .all(posts)
        .then(r => {
          this.$db.inspects.clear()
          this.records = []
          alert('上传成功！')
        })
        .catch(error => {
          alert('上传时出错：' + error)
        })
    }
  }
}
</script>

<template>
  <section>
    <h2>Dexie</h2>
    <ul>
      <li @click="updateRecord">更新记录</li>
    </ul>
  </section>
</template>

<script>
export default {
  methods: {
    updateRecord() {
      this.$db.tasks.update(2, {finished: true}).then(updated => {
        if(updated)
          alert('更新成功！')
        else
          throw '更新失败'
      }).catch(ex => {
        alert(ex)
      })
    }
  }
}
</script>

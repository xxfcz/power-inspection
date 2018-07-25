<template>
  <div>
    <button @click="popupDialog">对话框！</button>
    <modal name="hello-world">
      hello, world!
    </modal>
  </div>
</template>

<script>

export default {
  methods: {
    popupDialog() {
      this.$modal.show('hello-world')
    }
  }
}
</script>

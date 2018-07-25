<template>
  <div id="app" style="margin-top: 8px; margin-bottom: 16px">
    <div @click="urlVisible=!urlVisible" v-if="urlVisible" style="position:fixed; bottom:0; right:0; font-size: small">{{url}}</div>
    <router-view/>
    <v-dialog></v-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      urlVisible: true
    }
  },
  computed: {
    url() {
      return document.location.href
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

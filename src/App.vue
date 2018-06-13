<template>
  <div id="app" style="margin-top: 8px">
    <div>程序地址：{{url}}</div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    url (){
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

<template>
  <div>
    <h3>Hello, {{title}}</h3>
    <div>{{msg}}</div>
    <div>
      <label>年龄？
        <input type="number" v-model="age">
      </label>
    </div>
    <div style="text-align: center">
      <button @click="$emit('ok', age)">确定</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'World'
    },
    msg: {
      type: String,
      default: '默认信息'
    }
  },
  data() {
    return {
      age: null
    }
  }
}
</script>


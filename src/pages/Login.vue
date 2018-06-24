<template>
  <div>
    <h2>登录</h2>
    <div>
      <label>账号：
        <input type="text" name="userid" v-model="userid">
      </label>
    </div>
    <div>
      <label>密码：
        <input type="password" name="password" v-model="password">
      </label>
    </div>
    <div style="text-align: center">
      <button @click="login">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userid: '',
      password: ''
    }
  },
  methods: {
    login() {
      if (!this.userid || !this.password) {
        alert('请输入您的账号及密码')
        return
      }
      this.$axios
        .get('/api/users', {
          params: { name: this.userid, password: this.password }
        })
        .then(r => {
          if (r.data.length == 0) throw '找不到对应的账号！'

          alert('登录成功！')
          let user = r.data[0]
          localStorage.setItem('user', JSON.stringify(user))
          this.$router.go(-1)
        })
        .catch(err => {
          alert(err)
        })
    }
  }
}
</script>

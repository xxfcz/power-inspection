<template>
  <div>
    <h2>登录</h2>
    <div>
      <label>账号：
        <input type="text" name="account" v-model.trim="account">
      </label>
    </div>
    <div>
      <label>密码：
        <input type="password" name="password" v-model.trim="password">
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
      account: '',
      password: ''
    }
  },
  methods: {
    login() {
      if (!this.account || !this.password) {
        alert('请输入您的账号及密码')
        return
      }
      this.$axios
        .post('/api/users/token', {
          account: this.account,
          password: this.password
        })
        .then(r => {
          if (!r.data.ok) throw r.data.msg

          let user = r.data.user
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('token', r.data.token)
          alert('登录成功！')
          this.$router.go(-1)
        })
        .catch(err => {
          alert(err)
        })
    }
  }
}
</script>

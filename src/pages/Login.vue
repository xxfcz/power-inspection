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
      userid: "",
      password: ""
    }
  },
  methods: {
    login() {
      if (!this.userid || !this.password) {
        alert("请输入您的账号及密码")
        return
      }

      alert("登录成功！")
      let user = {
        id: 2,
        name: "Xiao",
        workshopId: 4,
        workshopName: "西渡供电车间"
      }
      localStorage.setItem("user", JSON.stringify(user))
      this.$router.go(-1)
    }
  }
}
</script>

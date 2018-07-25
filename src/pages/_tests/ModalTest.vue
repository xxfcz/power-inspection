<template>
  <div>
    <h3>对话框 vue-js-modal 测试</h3>
    <button @click="showDialog1">简单</button>
    <modal name="dialog1">
      hello, world!
    </modal>
    <button @click="showDialog2">传参</button>
    <modal name="dialog2" @before-open="dialog2_before_open">
      传入的参数值：{{dlg2_params}}
    </modal>
    <button @click="showDialog3">对话框</button>
    <button @click="showDialog4">动态：使用组件</button>
    <button @click="showDialog5">嵌入组件</button>
    <modal name="dialog5" @before-open="dialog5_before_open">
      <hello :msg="msg" :title="title" @ok="dialog5_ok"></hello>
    </modal>
  </div>
</template>

<script>
import Hello from '@/pages/_tests/Hello'

export default {
  components: {
    hello: Hello
  },
  data() {
    return {
      dlg2_params: '',
      msg: '',
      title: '',
    }
  },
  methods: {
    showDialog1() {
      this.$modal.show('dialog1')
    },
    showDialog2() {
      this.$modal.show('dialog2', { msg: '这是要显示的文字。' })
    },
    dialog2_before_open(evt) {
      this.dlg2_params = evt.params.msg
    },
    showDialog3() {
      this.$modal.show('dialog', {
        title: '你猜',
        text: '猜猜我今年多大了？',
        buttons: [
          {
            title: '干它',
            handler: () => {
              alert('Woot!')
              this.$modal.hide('dialog')
            }
          },
          {
            title: '别了', // Button title
            default: true, // Will be triggered by default if 'Enter' pressed.
            handler: () => {
              alert('别了')
              this.$modal.hide('dialog')
            } // Button click handler
          },
          {
            title: 'Close'
          }
        ]
      })
    },
    showDialog4() {
      this.$modal.show(
        Hello,
        {
          msg: '从外面传入的文本',
          ok: event => {
            console.log('ok:', event)
          }
        },
        {
          height: 'auto'
        },
        {
          closed: event => {
            console.log('closed:', event)
          }
        }
      )
    },
    showDialog5() {
      this.$modal.show('dialog5', { msg: '动态文字', title: '标题' })
    },
    dialog5_before_open(evt){
      this.msg = evt.params.msg
      this.title = evt.params.title
    },
    dialog5_ok(age){
      console.log(age)
      if(age>=18){
        this.$modal.hide('dialog5')
      }
      else{
        alert('年龄不能小于18岁！')
      }
    }
  }
}
</script>

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
  </div>
</template>

<script>
import Hello from '@/pages/_tests/Hello'

export default {
  components: {
    hello: Hello
  },
  data (){
    return {
      dlg2_params: ''
    }
  },
  methods: {
    showDialog1() {
      this.$modal.show('dialog1')
    },
    showDialog2(){
      this.$modal.show('dialog2', {msg: '这是要显示的文字。'})
    },
    dialog2_before_open (evt){
      this.dlg2_params = evt.params.msg
    },
    showDialog3(){
      this.$modal.show('dialog',{
        text: '猜猜我今年多大了？'
      })
    }

  }
}
</script>

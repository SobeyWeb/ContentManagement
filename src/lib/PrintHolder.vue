<template>
  <div v-show="false">
    <component ref="tmp" :is="template" :json="incommingJson" />
  </div>
</template>

<script>
import CheckoutReceipt from '@/views/Print/Templates/CheckoutReceipt'
import CheckinReceipt from '@/views/Print/Templates/CheckinReceipt'
import printer from '@/utils/printer'

export default {
  name: 'print-holder',
  components: {
    CheckoutReceipt,
    CheckinReceipt
  },
  props: {
    template: { type: String, required: true },
    layout: { type: String, required: true }
  },
  data () {
    return {
      incommingJson: {}
    }
  },
  methods: {
    print (data) {
      return new Promise(resolve => {
        this.incommingJson = data
        console.log(this.incommingJson)
        this.$nextTick(() => {
          let html = this.$refs.tmp.$el.innerHTML
          printer.print(this.layout, {
            REPLACEMENT_CONTENT: html
          }, true)
          resolve()
        })
      })
    }
  }
}
</script>

<style lang="scss">
</style>

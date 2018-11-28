<template>
  <div class="datetime_filter" @mousedown.stop>
    <el-time-picker is-range arrow-control :picker-options="pickerOptions" v-model="header.values" range-separator="To" start-placeholder="Start" end-placeholder="End">
    </el-time-picker>
  </div>
</template>

<script>
export default {
  name: 'time_filter_ctrl',
  data () {
    return {
      value: []
    }
  },
  methods: {},
  props: {
    header: Object
  },
  created () {
    window['_filter' + this.header.attr] = this
  },
  computed: {
    materials () {
      return this.$store.getters.displayMaterials
    },
    pickerOptions () {
      let self = this
      let dates = self.materials.map(item => +new Date(item[self.header.attr]))
      let min = +new Date(Math.min(...dates))
      let max = +new Date(Math.max(...dates))
      return {
        minTime: new Date(min).format('hh:mm'),
        maxTime: new Date(max).format('hh:mm')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<template>
  <div class="datetime_filter" @mousedown.stop>
    <el-date-picker :time-arrow-control="true" v-model="header.values" :type="header.type||'datetimerange'" :picker-options="pickerOptions" range-separator="To" start-placeholder="Start" end-placeholder="End" align="right"></el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'date-time-filter',
  data () {
    return {
      value: [],
      show: false
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
      return {
        disabledDate (date) {
          let dates = self.materials.map(item => +new Date(item[self.header.attr]))
          let min = +new Date(Math.min(...dates) - 3600 * 1000 * 24)
          let max = +new Date(Math.max(...dates) + 3600 * 1000 * 24)
          return date.getTime() < min || date.getTime() > max
        },
        shortcuts: [{
          text: 'Recent Day',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: 'Recent Week',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: 'Recent Month',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

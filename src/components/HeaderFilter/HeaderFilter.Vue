<template>
  <div class="filter-container" :style="{left: Math.max(0,operatingFilterData.position.x-operatingFilterData.header.width) + 'px', opacity:operatingFilterData.visible?1:0}" @contextmenu.prevent.stop @drop.stop.prevent @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent @mousedown.stop.prevent @mouseup.prevent>
    <component v-show="header===operatingFilterData.header" :ref="header.attr+'_filter'" class="filter_item fl" :style="{width: header.width+'px'}" :is="header.ctrl" :header="header" v-for="header in filterHeaders" :key="header.key">
    </component>
  </div>
</template>

<script>
import DateTimeFilter from './DateTimeFilter'
import TimeFilter from './TimeFilter'
import TextFilter from './TextFilter'
export default {
  name: 'header_filter',
  components: {
    'date-time-filter': DateTimeFilter,
    'time-filter': TimeFilter,
    'text-filter': TextFilter
  },
  data () {
    return {
    }
  },
  methods: {},
  created () {
    console.log(this.headers)
  },
  watch: {
    headers () {
      let newHeaders = []
      this.headers.forEach(item => {
        var same = this.filterHeaders.find(i => i.attr === item.attr) || JSON.parse(JSON.stringify(item))
        var ctrl = 'text-filter'
        // todo more logic more ctrl
        if (['modificationDate', 'formatDate'].indexOf(item.attr) > -1) {
          ctrl = 'date-time-filter'
        } else if (['Date', 'DateTime'].indexOf(item.fieldtype) > -1) {
          ctrl = 'date-time-filter'
          if (item.fieldtype === 'Date') {
            same.type = 'daterange'
          } else {
            same.type = 'datetimerange'
          }
        } else if (item.fieldtype === 'Time') {
          ctrl = 'time-filter'
        } else if (this.materials.groupBy(item.attr).length < 5) {
          ctrl = 'text-filter'
        }
        if (same.ctrl !== ctrl) {
          same.ctrl = ctrl
          same.values = []
          // todo reset
        }
        newHeaders.push(same)
      })
      this.filterHeaders = newHeaders
    }
  },
  computed: {
    operatingFilterData () {
      return this.$store.state.operatingFilterData
    },
    filterHeaders: {
      get () {
        return this.$store.state.filterHeaders
      },
      set (val) {
        return this.$store.state.filterHeaders = val
      }
    },
    filter () {
      let self = this
      return function (material) {
        let flag = true
        for (let key in self.$refs) {
          let comp = self.$refs[key]
          if (comp[0].filter) {
            flag = comp[0].filter(material)
            if (!flag) {
              break;
            }
          }
        }
        return flag
      }
    },
    materials () {
      return this.$store.getters.displayMaterials
    },
    headers () {
      return this.$store.state.headers.filter(item => item.checked)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

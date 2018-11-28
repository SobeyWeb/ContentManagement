<template>
  <div class="text_filter">
    <el-select v-model="header.values" multiple filterable allow-create default-first-option placeholder="" no-match-text="No Matched Data" no-data-text="No Data">
      <el-option v-for="(item, index) in options" :key="index" :label="item.label" :value="item">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'text-filter',
  data () {
    return {
      options: [],
      show: false
    }
  },
  methods: {},
  props: {
    header: Object
  },
  watch: {
    materials (val) {
      let oldOptions = this.options || []
      let values = []
      let defalutGroupedOptions = [{
        label: '0-9',
        value: '0-9',
        type: 'group',
        reg: '^\\d+'
      },
      {
        label: 'A-H',
        value: 'A-H',
        type: 'group',
        reg: '^[A-H]+'
      },
      {
        label: 'I-P',
        value: 'I-P',
        type: 'group',
        reg: '^[I-P]+'
      },
      {
        label: 'Q-Z',
        value: 'Q-Z',
        type: 'group',
        reg: '^[Q-Z]+'
      },
      {
        label: 'Other',
        value: 'Other',
        type: 'group',
        reg: '^[^A-Z\\d]+'
      }];
      let options
      let valGroups = val.groupBy(this.header.attr)
      if (valGroups.length > 5) {
        options = defalutGroupedOptions
        // todo 可以根据分组信息分更细 排除不存在的组
      } else {
        options = valGroups.map(item => {
          let temp = item[0]
          let value = temp[this.header.attr]
          let label = value
          let v
          let same = oldOptions.find(i => i.value === value)
          if (/^\s*$/.test(value) || value === void 0 || value === null) {
            v = {
              label: 'None',
              value: '^(\\s*|undefined|null)$',
              type: 'value',
              select: true
            }
          } else {
            v = {
              label: label,
              value: '^' + value.replace(/[\\|&^*+?$[\](){}]/g, '\\$&').replace(/\s+/, '\\s+'),
              type: 'value',
              select: true
            }
          }
          if (same && same.selected) {
            values.push(v)
            return v
          } else {
            return v
          }
        })
      }
      this.options = options
    }
  },
  created () {
    window['_filter' + this.header.attr] = this
    console.log(this.materials)
  },
  computed: {
    filter () {
      let self = this
      return function (material) {
        if (self.header.values.length) {
          return self.header.values.some(item => {
            var condition
            if (item.type === 'group') {
              condition = item.reg
            } else {
              var regStr = '^'
              var condArr = item.split('*')
              condArr.forEach((item, index) => {
                if (item !== '' || !index) {
                  regStr += item.replace(/[\\|&^*+?$[\](){}]/g, '\\$&').replace(/\s+/, '\\s+');
                  regStr += '.*'
                }
              })
              condition = new RegExp(regStr, 'i')
            }
            return condition.test(material[self.header.attr])
          })
        } else {
          return true
        }
      }
    },
    materials () {
      return this.$store.getters.displayMaterials
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

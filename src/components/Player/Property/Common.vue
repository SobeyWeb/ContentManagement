<template>
  <div class="property_table">
    <div class="property_row" v-for="data in options" :key="data.name">
      <span class="prop_span" :title="data.name">{{data.name}}</span>
      <div class="prop_div">
        <component v-if="Object.prototype.toString.call(data.value) !== '[object Array]'" @change="changeToAll(data)" :is="data.ctrl" :highlight="isHighLight" :textfield="data" :limit="data.limit" :select="data" :radio="data.value" :number="data.value" :checkbox="data.value" :date="data" :options="data.value" v-model="data.value" :format="data.format" :dis="data.disabled"></component>
        <component v-else :is="v.ctrl||data.ctrl" :checkbox="v" :value="v.value" v-for="v in data.value" :key="v.text"></component>
      </div>
      <div class="apply_all_container" v-if="data.multiplable&&materials.length>1">
        <rd-checkbox :checkbox="data.multiOption" @change="applyToAll(data)"></rd-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import OriginalList from './OriginalList'
export default {
  name: 'basic_prop_page_ctrl',
  props: {
    options: {
      type: Array,
      required: true
    },
    tab: Object,
    materials: Array,
    material: Object
  },
  data () {
    return {
      bak: []
    }
  },
  components: {
    'original-list-ctrl': OriginalList
  },
  methods: {
    applyToAll (data) { //
      this.materials.filter(item => item !== this.material).forEach(item => {
        var tab = item.properties.find(i => i.name === this.tab.name || (['Basic Info', 'Folder', 'PGM Info'].indexOf(i.name) > -1 && ['Basic Info', 'Folder', 'PGM Info'].indexOf(this.tab.name) > -1))
        var kv
        if (tab) {
          kv = tab.keyValues.find(i => i.name === data.name)
          if (kv) {
            if (data.multiOption.checked) {
              kv.multiBakValue = kv.value
              kv.value = data.value
            } else {
              kv.value = kv.multiBakValue
            }
            kv.multiOption.checked = data.multiOption.checked
          }
        }
      })
    },
    changeToAll (data) {
      if (data.multiplable && data.multiOption.checked) {
        this.materials.filter(item => item !== this.material).forEach(item => {
          var tab = item.properties.find(i => i.name === this.tab.name || (['Basic Info', 'Folder', 'PGM Info'].indexOf(i.name) > -1 && ['Basic Info', 'Folder', 'PGM Info'].indexOf(this.tab.name) > -1))
          var kv
          if (tab) {
            kv = tab.keyValues.find(i => i.name === data.name)
            if (kv) {
              kv.value = data.value
            }
          }
        })
      }
    }
  },
  computed: {
    currentCtrl () {
      return ''
    },
    isHighLight () {
      return this.$store.getters.isHighLight
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

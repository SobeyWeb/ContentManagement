<template>
  <div class="rights_container">
    <rd-radio-group :radios="values.radio" v-on:change="change" @change="changeToAll(values)"></rd-radio-group>
    <rd-radio-group :radios="values.access" @change="changeToAll(values)" v-show="false"></rd-radio-group>
    <tab-header-ctrl class="rights_tab" :headers="headers" v-show="accessSymbol"></tab-header-ctrl>
    <div v-if="accessSymbol" class="dept_selection" :style="{height: material.type==='folder'?'calc(100% - 75px)':'calc(100% - 40px)'}">
      <div class="dept_tips">Please select departments:</div>
      <vue-nice-scrollbar :speed="150" style="height:calc(100% - 30px);">
        <rd-tree :tree-data="deptTree" @change="changeToAll(values)"></rd-tree>
      </vue-nice-scrollbar>
    </div>
    <rd-checkbox class="apply_to_all_user" :checkbox="values.checkbox" v-if="values.type==='folder'&&materials.filter(i=>i.type=='folder').length === 1" @change="changeToAll(values)"></rd-checkbox>
    <div class="apply_all_container apply_to_all_materials" v-if="values.multiplable&&materials.length>1">
      <rd-checkbox :checkbox="values.multiOption" @change="applyToAll(values)"></rd-checkbox>
    </div>
  </div>
</template>

<script>
import TabHeader from '../../common/TabHeader'
export default {
  name: 'rights_prop_ctrl',
  props: {
    options: {
      type: Object,
      required: true
    },
    tab: Object,
    materials: Array,
    editing: {
      type: Boolean,
      required: true
    },
    material: Object
  },
  data () {
    return {
      headers: [
        {
          name: 'Access',
          attr: 'filename',
          width: 300,
          dragging: false,
          checked: true,
          resizable: false,
          callback: this.accessClick
        },
        {
          name: 'Access&Write',
          attr: 'displayQuality',
          width: 300,
          dragging: false,
          checked: true,
          resizable: false,
          callback: this.writeClick
        }]
    }
  },
  components: {
    'tab-header-ctrl': TabHeader
  },
  computed: {
    values () {
      return this.options
    },
    deptTree () {
      var checkedAC = this.values.access.find(item => item.checked)
      return checkedAC && checkedAC.deptTree || []
    },
    accessSymbol () {
      return this.values.access.some(item => !item.disabled) && this.editing
    }
  },
  methods: {
    accessClick () {
      this.values.access[0].checked = true
      this.values.access[1].checked = false
      this.changeToAll(this.values)
    },
    writeClick () {
      this.values.access[1].checked = true
      this.values.access[0].checked = false
      this.changeToAll(this.values)
    },
    change (data) {
      if (data.value === 'Condition') {
        this.values.access.forEach(item => item.disabled = false)
        if (this.values.access.every(i => !i.checked)) {
          this.values.access[0].checked = true
        }
      } else {
        this.values.access.forEach(item => item.disabled = true)
      }
    },
    applyToAll (data) {
      this.materials.filter(item => item !== this.material).forEach(item => {
        var tab = item.properties.find(i => i.name === this.tab.name || (['Basic Info', 'Folder', 'PGM Info'].indexOf(i.name) > -1 && ['Basic Info', 'Folder', 'PGM Info'].indexOf(this.tab.name) > -1))
        if (tab) {
          if (data.multiOption.checked) {
            tab.multiBakValue = JSON.stringify(tab.keyValues)
            tab.keyValues = data
          } else {
            tab.keyValues = JSON.parse(tab.multiBakValue)
          }
          tab.keyValues.multiOption.checked = data.multiOption.checked
        }
      })
    },
    changeToAll (data) {
      if (data.multiplable && data.multiOption.checked) {
        this.materials.filter(item => item !== this.material).forEach(item => {
          var tab = item.properties.find(i => i.name === this.tab.name || (['Basic Info', 'Folder', 'PGM Info'].indexOf(i.name) > -1 && ['Basic Info', 'Folder', 'PGM Info'].indexOf(this.tab.name) > -1))
          if (tab) {
            tab.keyValues = data
          }
        })
      }
    }
  },
  watch: {
    'editing': function () {
      if (this.values.radio.find(i => i.checked).value === 'Condition') {
        this.values.access.forEach(item => item.disabled = false)
      } else {
        this.values.access.forEach(item => item.disabled = true)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

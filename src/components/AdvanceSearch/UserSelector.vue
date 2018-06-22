<template>
  <div class="user_selector_container">
    <input v-model="textfield.username" class="user_input" type="text" readonly @mousedown="dropdown=true">
    <span class="markSearchclose userclose" v-if="textfield.value" @click.stop.prevent="clear" @mousedown.stop>&nbsp;×</span>
    <div class="search_input_container" @mousedown.stop v-show="userData.length&&dropdown">
      <input type="text" class="search_input rd-textfield-input" v-model="searchKeyword" placeholder="Input words to filter" />
    </div>
    <vue-nice-scrollbar class="user_box" :speed="150" style="height: 240px;position:absolute;" v-show="userData.length&&dropdown">
      <user-tree-ctrl :callback="userSelected" :data="n" v-for="n in userData" :search="searchKeyword" :key="n.deptname" :default-value="defaultValue"></user-tree-ctrl>
    </vue-nice-scrollbar>
  </div>
</template>

<script>
import $ from 'jquery'

import UserTree from '../common/UserTree'
export default {
  name: 'user_selector_ctrl',
  props: {
    textfield: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dropdown: false,
      userData: [],
      defaultValue: [],
      searchKeyword: ''
    }
  },
  components: {
    'user-tree-ctrl': UserTree
  },
  methods: {
    userSelected (data) {
      this.textfield.username = data.nickname || data.loginname.replace(/.*\\(.*)/g, '$1')
      this.textfield.value = data.usercode
      this.dropdown = false
      if (this.textfield.userdata && this.textfield.userdata !== data) {
        this.textfield.userdata.checked = false
      }
      this.textfield.userdata = data
    },
    clear () {
      this.textfield.username = ''
      this.textfield.value = ''
      this.textfield.userdata.checked = false
      this.textfield.userdata = null
    }
  },
  computed: {
    userDept () {
      return this.$store.state.userDept
    }
  },
  watch: {
    userDept (v) {
      this.userData = JSON.parse(JSON.stringify(v))
    },
    'textfield.userdata': function (v) {
      v && this.defaultValue.splice(0)
      v && this.defaultValue.add(v)
    }
  },
  mounted () {
    this.textfield.userdata && this.defaultValue.push(this.textfield.userdata)
    this.userData = JSON.parse(JSON.stringify(this.$store.state.userDept)) // for particular case
    window.addEventListener('mousedown', (e) => {
      if ($(e.target).parents().is(this.$el)) {
      } else {
        this.dropdown = false
      }
    }, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

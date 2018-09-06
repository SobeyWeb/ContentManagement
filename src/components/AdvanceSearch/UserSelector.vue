<template>
  <div class="user_selector_container">
    <input v-model="textfield.username" class="user_input" type="text" readonly @mousedown="dropdown=true">
    <span class="markSearchclose userclose" v-if="textfield.value" @click.stop.prevent="clear" @mousedown.stop>&nbsp;×</span>
    <div class="search_input_container" @mousedown.stop v-show="userData.length&&dropdown">
      <input type="text" class="search_input rd-textfield-input" v-model="searchKeyword" placeholder="Input words to filter" />
    </div>
    <vue-nice-scrollbar class="user_box" :speed="150" style="height: 240px;position:absolute;" v-show="userData.length&&dropdown">
      <user-tree-ctrl :callback="userSelected" :data="n" v-for="n in userData" :search="searchKeyword" :key="n.deptid" :default-value="defaultValue"></user-tree-ctrl>
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
.user_selector_container {
  position: relative;
}

.rd-textfield-input.search_input {
  border-top: 1px #3e3e3e solid;
  background: #222222;
  border-bottom: 1px #3e3e3e solid;
}

.user_box {
  /* top: 29px; */
  left: 0;
  width: 100%;
  z-index: 122;
  overflow: hidden;
  background: #222222;
  bottom: -272px;
}
.userclose {
  float: right;
  font-weight: bold;
  line-height: 1;
  text-shadow: 0 1px 0 #ffffff;
  opacity: 0.2;
  filter: alpha(opacity=20);
  font-size: 1.6em;
  line-height: 0.5;
  color: #ffffff;
  cursor: pointer;
  position: absolute;
  top: 12px;
  right: 5px;
}
.markSearchclose {
  font-size: 21px;
  font-weight: bold;
  line-height: 1;
  color: #000000;
  text-shadow: 0 1px 0 #ffffff;
  opacity: 0.2;
  filter: alpha(opacity=20);
  font-size: 1.6em;
  line-height: 0.75;
  color: #ffffff;
  cursor: pointer;
}
.search_input_container {
  position: absolute;
  bottom: -32px;
  width: 100%;
  z-index: 122;
  background: #222222;
}
</style>

<template>
  <div class="member_selector_container">
    <div class="logingmarkpar">
      <div id="txtMarkerLMMember" class="logingmarkcondition" @mousedown="dropdown=true">
        <!-- v-bind="data.marker.searchModel.member" -->
        <span v-for="action in textfield.checkedValue" :key="action.nickname||action.name" class="btn-xs">
          <span class="loginSearchText" :title="action.nickname">{{action.nickname||action.name}}</span>
          <span class="markSearchclose" @click.stop.prevent="removeAction(action,$event)">&nbsp;×</span>
        </span>
        <input type="text" class="rd-textfield-input" v-model="textfield.value">
      </div>
      <div class="search_input_container" @mousedown.stop v-show="actionData.length&&dropdown">
        <input type="text" class="search_input rd-textfield-input" v-model="searchKeyword" placeholder="Input words to filter" />
      </div>
      <vue-nice-scrollbar class="member_box" :speed="150" style="height: 240px;position:absolute;" v-show="actionData.length&&dropdown">
        <user-tree-ctrl :callback="actionselected" :data="i" v-for="i in actionData" :search="searchKeyword" :multiplable="true" :key="i.deptname" :default-value="defaultValue"></user-tree-ctrl>
      </vue-nice-scrollbar>
    </div>
  </div>
</template>

<script>
import * as util from '../../lib/util.js'
import TYPES from '../../dicts/mutationTypes.js'
import { SortLikeWin } from '../../lib/sort.js'
import $ from 'jquery'

import UserTree from '../common/UserTree'
export default {
  name: 'action_selector_ctrl',
  props: {
    textfield: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dropdown: false,
      rootAction: {
        deptname: 'Action Set',
        icon: 'folder',
        floor: 0,
        open: true,
        userlist: [],
        childdept: []
      },
      defaultValue: [],
      searchKeyword: ''
    }
  },
  components: {
    'user-tree-ctrl': UserTree
  },
  methods: {
    actionselected (data) {
      if (data.checked) {
        var same = this.textfield.checkedValue.find(i => i.id === data.id)
        same && same !== data && this.textfield.checkedValue.remove(same)
        this.textfield.checkedValue.add(data)
      } else {
        this.textfield.checkedValue.remove(data)
      }
    },
    removeAction (data) {
      data.checked = false
      this.textfield.checkedValue.remove(data)
    }
  },
  watch: {
    'textfield.checkedValue': function (v, ov) {
      ov.forEach(item => item.checked = false)
      this.defaultValue.splice(0)
      this.defaultValue.push(...v)
    }
  },
  computed: {
    actionData () {
      return [this.rootAction]
    }
  },
  created () {
    this.defaultValue = this.textfield.checkedValue.slice()
    window.addEventListener('mousedown', (e) => {
      if ($(e.target).parents().is(this.$el)) {
      } else {
        this.dropdown = false
      }
    })
    this.$store.dispatch({
      type: TYPES.GET_ACTIONLIST_INFO,
      data: {}
    }).then(result => {
      var getFolder = (sourceArr, target) => {
        sourceArr.forEach(item => {
          item.deptname = item.name
          item.floor = target.floor + 1
          item.childdept = []
          item.open = false
          item.icon = 'folder'
          item.type = 'folder'
          item.checked = false
          if (item.trees && item.trees.forEach) {
            getFolder(item.trees, item)
          }
          if (item.groups && item.groups.forEach) {
            getAction(item.groups, item)
          }
          target.childdept.push(item)
          item.childdept = util.sortBy(item.childdept, 'title', true, true)
        })
        target.childdept = util.sortBy(target.childdept, 'title', true, true)
      }
      var getAction = (sourceArr, target) => {
        sourceArr.forEach(item => {
          item.deptname = item.name
          item.floor = target.floor + 1
          item.childdept = []
          item.open = false
          item.userlist = item.actions && item.actions.map(i => {
            i.nickname = i.loginname = i.name = i.ObjectName
            i.floor = item.floor + 1
            i.icon = 'action'
            i.id = i.ObjectID
            i.checked = false
            if (this.textfield.checkedValue.some(v => v.ObjectID === i.ObjectID && v.LangID === i.LangID)) {
              var k = this.textfield.checkedValue.find(v => v.ObjectID === i.ObjectID)
              this.textfield.checkedValue.add(i)
              i.checked = true
              this.textfield.checkedValue.remove(k)
            }
            return i
          }) || []
          item.userlist = item.userlist.filter(i => i.LangID === this.$store.state.defaultLanguage)
          item.userlist.sort(SortLikeWin)
          item.open = false
          item.icon = 'group'
          item.checked = false
          target.childdept.push(item)
        })
        target.childdept = util.sortBy(target.childdept, 'title', true, true)
      }
      // 解析action
      var actionData = JSON.parse(result)
      actionData.trees && actionData.trees.forEach && getFolder(actionData.trees, this.rootAction)
      actionData.groups && actionData.groups.forEach && getAction(actionData.groups, this.rootAction)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logingmarkpar {
  width: 100%;
  min-height: 29px;
  background: rgb(17, 17, 17);
  overflow: hidden;
  overflow-x: auto;
}
.search_input_container {
  position: absolute;
  bottom: -32px;
  width: 100%;
  z-index: 122;
  background: #222222;
}
.member_box {
  left: 0;
  bottom: -272px;
  width: 100%;
  z-index: 122;
  overflow: hidden;
  background: #222222;
}
.rd-textfield-input.search_input {
  border-top: 1px #3e3e3e solid;
  background: #222222;
  border-bottom: 1px #3e3e3e solid;
}
</style>

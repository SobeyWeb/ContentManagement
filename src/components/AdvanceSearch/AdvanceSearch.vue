<template>
  <div class="advance_search_container">
    <div class="advance_search_top" @mousedown.prevent>
      <tab-header ref="advanceHeader" :headers="headers" @hswap="hswap" @hresize="hresize"></tab-header>
      <span class="config_btn fr" :class="{config_btn_active:isConfig}" @click.stop="enterConfig"></span>
    </div>
    <div class="advance_search_content">
      <basic-search-page :options="v.keyValues" v-show="!isConfig&&v.keyValues===values" v-for="v in headers" :key="v.name"></basic-search-page>
      <div class="advance_config_container" @mousedown.prevent v-show="isConfig">
        <div class="control_text_container clearfix">
          <span class="control_text fr">Condition for Search</span>
          <span class=" control_text fl">Metadata List</span>
        </div>
        <div class="control_config_container clearfix">
          <div class="showing_items fr" :class="{focused_items: !focused}" @mousedown.prevent="focused = false">
            <vue-nice-scrollbar :speed="150" style="height: 500px;" v-if="values.length">
              <tab :headers="values" :can-drag="true"></tab>
            </vue-nice-scrollbar>
          </div>
          <div class="control_container">
            <span class="control_btn to_right_btn" @click="addCondition"></span>
            <span class="control_btn to_left_btn" @click="removeCondition"></span>
          </div>
          <div class="hide_items fl" :class="{focused_items: focused}" @mousedown.prevent="focused = true">
            <vue-nice-scrollbar :speed="150" style="height: 500px;" v-if="hideValues.length">
              <tab :headers="hideValues" :can-drag="false"></tab>
            </vue-nice-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <div class="advance_search_bottom clearfix">
      <template v-if="!isConfig">
        <rd-checkbox :checkbox="rememberCheckbox" v-show="!isModifyCondtion"></rd-checkbox>
        <rd-button type="" @click="reset">Reset</rd-button>
        <div class="fr advance_btn_group">
          <rd-button type="" @click="packageSearchCondition">Search</rd-button>
          <rd-button type="" @click="cancel">Cancel</rd-button>
        </div>
      </template>
      <div class="fr advance_btn_group" v-else>
        <rd-button type="" @click="saveConfig">Save</rd-button>
        <rd-button type="" @click="cancelConfig">Cancel</rd-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '../../lib/util.js'
import TYPES from '../../dicts/mutationTypes.js'

import BasicSearchPage from './BasicSearchPage'
import Tab from '../common/Tab'
import TabHeader from '../common/TabHeader'
export default {
  name: 'advance_search_ctrl',
  data () {
    return {
      curIndex: 0,
      focused: true
    }
  },
  components: {
    'basic-search-page': BasicSearchPage,
    'tab': Tab,
    'tab-header': TabHeader
  },
  computed: {
    isConfig: {
      get () {
        return this.$store.state.isAdvanceConfig
      },
      set (val) {
        this.$store.state.isAdvanceConfig = val
      }
    },
    isModifyCondtion () {
      return this.$store.state.isModifyCondtion
    },
    rememberCheckbox: {
      get () {
        return this.$store.state.isRemember
      },
      set (val) {
        this.$store.state.isRemember = val
      }
    },
    headers () {
      return this.$store.state.advanceSearchHeaders
    },
    isPremiere () {
      return this.$store.state.system
    },
    curTab () {
      var header = this.headers && this.headers.filter(item => item.selected)[0]
      if (!header && this.headers && this.headers.length && this.$refs.advanceHeader && this.headers === this.$refs.advanceHeader.headers) {
        this.$refs.advanceHeader.selectHeader(0)
        this.$refs.advanceHeader.init()
      }
      return header || this.headers && this.headers[0] || {}
    },
    values () {
      var kvs = this.curTab && this.curTab.keyValues || []
      return kvs
    },
    hideValues () {
      var kvs = this.curTab && this.curTab.hideKeyValues || []
      return kvs
    }
  },
  methods: {
    checkAll (e) {
      if (this.$store.state.advanceSearchWindow.visible && this.isConfig && e.ctrlKey && e.keyCode === 65) {
        e.preventDefault()
        if (this.focused) {
          this.hideValues.forEach(item => item.checked = true)
        } else {
          this.values.forEach(item => item.checked = true)
        }
      }
    },
    enterConfig () {
      this.isConfig = !this.isConfig
      if (this.isConfig) {
        this.$store.state.advanceSearchHeaders.forEach(h => {
          var kvs = h.keyValues
          kvs.forEach && kvs.forEach((k, i) => {
            k.order = i // 记录顺序和是否显示
            k.isShow = true
          })
          var hkvs = h.hideKeyValues
          hkvs.forEach && hkvs.forEach((k, i) => {
            k.order = i
            k.isShow = false
          })
        })
      } else {
        this.cancelConfig()
      }
    },
    saveConfig () {
      this.isConfig = false
      if (this.$store.state.isModifyCondtion) return
      this.$store.dispatch({
        type: TYPES.GET_SEARCH_QUERY
      }).then(res => {
        var temp = res.find(item => item.templateName === ('default' + this.$store.state.userInfo.usercode))
        var condition
        if (temp) {
          condition = temp.condition
          condition.headers = this.$store.getters.currentSearchCondition.headers
          condition.node = this.$store.getters.currentSearchCondition.node
        } else {
          condition = this.$store.getters.currentSearchCondition
        }
        this.$store.dispatch({
          type: TYPES.MODIFY_SEARCH_QUERY,
          data: {
            templateID: this.$store.state.templateID,
            json: {
              templateName: 'default' + this.$store.state.userInfo.usercode,
              condition: condition
            }
          }
        }).then(res => {
          // 重新备份
          this.$store.state.advanceSearchHeaders.forEach(h => {
            var kvs = h.keyValues.concat(h.hideKeyValues)
            kvs.forEach && kvs.forEach(k => {
              if (k.isRange) {
                k.from.bakValue = k.from.value
                k.to.bakValue = k.to.value
              } else if (k.ctrl === 'rd-select') {
                k.bakOptions = JSON.parse(JSON.stringify(k.options))
              } else {
                k.bakValue = k.value
                k.bakUserdata = k.userdata
                if (k.checkedValue) {
                  k.bakCheckedValue = k.checkedValue.slice()
                }
              }
            })
          })
          console.log(res)
        }).catch(res => {
          util.Notice.failed('Failed to save search template', '', 3000)
        })
      })
    },
    cancelConfig () {
      this.isConfig = false
      this.$store.state.advanceSearchHeaders.forEach(h => {
        let kvs = h.keyValues
        let tempKeyValues = []
        let tempHideKeyValues = []
        kvs.forEach && kvs.forEach((k, i) => {
          !k.isShow && tempHideKeyValues.add(k) // 还原显示
        })
        var hkvs = h.hideKeyValues
        hkvs.forEach && hkvs.forEach((k, i) => {
          k.isShow && tempKeyValues.add(k)
        })
        kvs.remove(...tempHideKeyValues)
        kvs.add(...tempKeyValues)
        hkvs.remove(...tempKeyValues)
        hkvs.add(...tempHideKeyValues)
        kvs.sort((i1, i2) => i1.order - i2.order) // 还原顺序
        hkvs.sort((i1, i2) => i1.order - i2.order)
      })
    },
    packageSearchCondition () {
      this.$store.state.isSearched = true
      if (this.$store.state.isModifyCondtion) { // MODIFY
        this.$store.dispatch({
          type: TYPES.GET_SEARCHRESULT,
          source: this.$store.getters.currentNode,
          condition: this.$store.getters.currentNode.bakCondition
        })
        this.$store.state.advanceSearchWindow.hide()
        return
      }
      var data = util.getAdvanceSearchCondition(this.curTab, this.$store.getters.currentNode)
      this.$store.dispatch({
        type: TYPES.ADVANCE_SEARCH_MATERIALS,
        data: data,
        source: this.$store.getters.searchResult,
        showWaiting: true
      }).then(res => {
        this.$store.commit({
          type: TYPES.SET_MATERIALS,
          target: this.$store.getters.searchResult,
          data: res
        })
        this.$store.commit({
          type: TYPES.GET_NAVPATH,
          target: this.$store.getters.searchResult,
          data: []
        })
      })
      this.$store.state.searchNode = this.$store.getters.currentNode
      this.$store.state.searchType = 1
      this.$store.getters.searchResult.condition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.$store.getters.searchResult.bakCondition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.$store.state.advanceSearchWindow.hide()
      if (this.$store.state.isRemember.checked) {
        this.saveConfig() // 保存默认搜索模板
        // save on air
      }
    },
    addCondition () {
      this.values.push(...this.hideValues.filter(item => item.checked))
      this.hideValues.remove(...this.hideValues.filter(item => item.checked))
    },
    removeCondition () {
      this.hideValues.push(...this.values.filter(item => item.checked))
      this.values.remove(...this.values.filter(item => item.checked))
    },
    reset () {
      // this.headers.forEach(t => {
      this.curTab.keyValues.forEach(kv => {
        if (kv.isRange) {
          kv.from.value = kv.to.value = ''
        } else if (kv.ctrl === 'rd-select') {
          if (kv.multiple) {
            kv.value = []
            kv.options.forEach(o => o.selected = false)
          } else {
            kv.options.forEach(o => o.selected = false)
            kv.options[0].selected = true
          }
        } else {
          kv.value = ''
          kv.username && (kv.username = '', kv.userdata.checked = false, kv.userdata = null)
          kv.checkedValue && (kv.checkedValue.forEach(cv => cv.checked = false), kv.checkedValue = [])
        }
      })
      //  })
    },
    selectHeader (name) {
      var header = this.headers.find(item => item.name === name)
      this.$refs.propertyHeader.selectHeader(this.headers.indexOf(header))
    },
    hswap (data) {
      console.log(data)
      //  util.setCookie('props_headers' + _userToken, JSON.stringify(data.headers))
    },
    hresize (data) {
      console.log(data)
    },
    cancel () {
      this.$store.state.advanceSearchWindow.hide()
    },
    initialize () {
      window.addEventListener('keydown', this.checkAll, false)
    },
    dispose () {
      this.$refs.propertyHeader.selectHeader(0)
    }
  },
  watch: {
  },
  mounted () {
    this.initialize()
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.checkAll, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.advance_search_container {
  width: 578px;
  background: #222;
}

.advance_search_top .tab_header_container {
  position: relative;
}

.advance_search_top .list_header_item {
  cursor: pointer;
  border-left: none;
  background: #222;
}

.advance_search_top .list_header_item_checked {
  border-bottom: 2px solid #f5a623;
  background: #1b1b1b;
  color: #fff;
}

.advance_search_content {
  height: 550px;
  background: #1b1b1b;
  overflow: auto;
  padding: 0 10px;
}

.showing_items {
  width: 240px;
  height: 500px;
  background: #464646;
}

.control_container {
  width: 58px;
  height: 500px;
  position: absolute;
  top: 0;
  left: 240px;
}

.control_config_container {
  position: relative;
}

.control_btn {
  display: block;
  height: 30px;
  width: 30px;
  margin: 100px 14px;
  cursor: pointer;
}

.to_left_btn {
  background: url(../../assets/images/arrow_left.png) 9px 13px no-repeat;
}

.to_right_btn {
  background: url(../../assets/images/arrow_right3.png) 9px 13px no-repeat;
}

.tab_container {
  position: relative;
}

.control_text {
  width: 240px;
  text-align: center;
  display: inline-block;
}

.hide_items {
  width: 240px;
  height: 500px;
  background: #464646;
}

.advance_config_container {
  overflow: hidden;
  position: relative;
  padding: 10px;
}

.advance_search_content .dragging_item {
  height: 30px;
  line-height: 30px;
}

.advance_search_content .list_header_item {
  height: 30px;
  line-height: 30px;
}

.from_span {
  margin: 0 5px;
}

.from_container {
  width: 200px;
  display: inline-block;
}

.user_selector_container {
  position: relative;
}

.user_input {
  font-size: 0.9rem;
  line-height: 1.7rem;
  color: #cfd2d4;
  background-color: #000;
  background-image: none;
  border: none;
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  width: 100%;
  height: 32px;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.member_selector_container {
  position: relative;
}

.rd-textfield-input.search_input {
  border-top: 1px #3e3e3e solid;
  background: #222222;
  border-bottom: 1px #3e3e3e solid;
}

.member_box {
  left: 0;
  bottom: -272px;
  width: 100%;
  z-index: 122;
  overflow: hidden;
  background: #222222;
}
.tab_header_container .list_header_item,
.advance_search_container .list_header_item {
  line-height: 38px;
  height: 38px;
}

.advance_search_container .list_header_item {
  padding-left: 18px;
  text-align: left;
  border-left: none;
}
.advance_search_bottom {
  line-height: 50px;
  padding: 0 20px;
}
.split_span {
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.config_btn {
  position: absolute;
  top: 0;
  right: 10px;
  /* height: 30px; */
  line-height: 38px;
}
.config_btn {
  display: inline-block;
  border: none;
  outline: none;
  width: 20px;
  height: 39px;
  cursor: pointer;
  background: url(../../assets/images/config_1.png) center center no-repeat;
  background-size: 100%;
}

.config_btn:hover {
  background: url(../../assets/images/config_2.png) center center no-repeat;
  background-size: 100%;
}

.config_btn_active {
  background: url(../../assets/images/config_2.png) center center no-repeat;
  background-size: 100%;
}
.control_text_container {
  line-height: 30px;
}
.control_text {
  width: 240px;
  text-align: center;
  display: inline-block;
}
.advance_search_bottom {
  line-height: 50px;
  padding: 0 20px;
}
.tab_header_container .list_header_item,
.advance_search_container .list_header_item {
  line-height: 38px;
  height: 38px;
}

.advance_search_container .list_header_item {
  padding-left: 18px;
  text-align: left;
  border-left: none;
}
</style>

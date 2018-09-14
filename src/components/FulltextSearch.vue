<template>
  <div class="fulltext_container">
    <input placeholder="Keywords..." class="fulltext_input" v-model="fulltext.keywords" @keydown.enter="fulltextSearch" type="text" :disabled="disabled" />
    <button class="search_btn fr" @click="fulltextSearch" v-show="!disabled"></button>
    <span class="toggle_btn fr" :class="{up_toggle_btn: dropdown}" @click="dropdown=!dropdown" v-show="!disabled"></span>
    <span class="fulltext_clear_btn fr" v-show="fulltext.keywords&&!disabled" @click="fulltext.keywords=''"></span>
    <div class="dropdown_container animated2" v-show="dropdown" :class="[dropdown?'slideInDown':'slideOutUp']">
      <div class="fulltext_filter_container">
        <div class="time_filter_container clearfix">
          <label class="filter_text fl" :style="{height:Math.round(fulltext.timeFilter && fulltext.timeFilter.length/4)*30+'px'}">Time</label>
          <span class="check_span fl" :class="{checked_span: time.checked}" @click.stop="timeFilter(time)" v-for="time in fulltext.timeFilter" :key="time.name">{{time.name}}</span>
        </div>
        <div class="content_filter_container clearfix">
          <label class="filter_text fl" :style="{height:Math.round(fulltext.typeFilter && fulltext.typeFilter.length/4)*30+'px'}">Content</label>
          <span class="check_span fl" :class="{checked_span: type.checked}" @click.stop="type.checked=!type.checked" v-for="type in fulltext.typeFilter" :key="type.name">{{type.name}}</span>
        </div>
        <div class="btn_container clearfix">
          <span class="fulltext_btn fr" @click.stop="resetFilter">Reset</span>
          <span class="fulltext_btn fr" @click.stop="saveFilter">Save As Default</span>
        </div>
      </div>
      <div class="boolean_container">
        <div class="top_btn_container clearfix">
          <span class="fl">Boolean Search</span>
          <button class="search_btn fr" @click="booleanSearch"></button>
        </div>
        <div class="boolean_content">
          <div class="boolean_item" v-for="c in fulltext.booleanCondition" :key="c.name">
            <span class="boolean_span">{{c.name}}</span>
            <input class="boolean_input" type="text" v-model="c.value" />
          </div>
        </div>
        <div class="btn_container">
          <span class="fulltext_btn fr" @click.stop="resetBoolean">Reset</span>
          <span class="fulltext_btn fr" @click.stop="saveBoolean">Save As Default</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import $ from 'jquery'

export default {
  name: 'fulltext_search_ctrl',
  data () {
    return {
      dropdown: false
    }
  },
  methods: {
    fulltextSearch () {
      var json = util.getFulltextSearchCondtion(this.fulltext, this.$store.getters.currentNode, true)
      this.$store.dispatch({
        type: TYPES.FULLTEXT_SEARCH_MATERIALS,
        data: {
          json: json
        },
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
      this.$store.state.searchType = 2
      this.$store.getters.searchResult.condition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.$store.getters.searchResult.bakCondition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.dropdown = false
    },
    timeFilter (t) {
      var old = t.checked
      this.fulltext.timeFilter.forEach(i => i.checked = false)
      t.checked = !old
    },
    saveFilter () {
      this.$store.dispatch({
        type: TYPES.GET_SEARCH_QUERY
      }).then(res => {
        var temp = res.find(item => item.templateName === ('default' + this.$store.state.userInfo.usercode))
        var condition
        if (temp) {
          condition = temp.condition
          this.$store.state.templateID = temp.templateId
          condition.timeFilter = this.fulltext.timeFilter
          condition.typeFilter = this.fulltext.typeFilter
          condition.keywords = this.fulltext.keywords
        } else {
          condition = {
            timeFilter: this.fulltext.timeFilter,
            typeFilter: this.fulltext.typeFilter,
            keywords: this.fulltext.keywords
          }
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
          this.$store.state.templateCondition = condition
          console.log(res)
        }).catch(res => {
          util.Notice.failed('Failed to save search template', '', 3000)
        })
      })
    },
    resetFilter (t) {
      this.fulltext.timeFilter.forEach(i => i.checked = false)
      this.fulltext.typeFilter.forEach(i => i.checked = false)
    },
    booleanSearch () {
      var json = util.getFulltextSearchCondtion(this.fulltext, this.$store.getters.currentNode, false)
      this.$store.dispatch({
        type: TYPES.FULLTEXT_SEARCH_MATERIALS,
        data: {
          json: json
        },
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
      this.$store.state.searchType = 3
      this.$store.getters.searchResult.condition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.$store.getters.searchResult.bakCondition = JSON.parse(JSON.stringify(this.$store.getters.currentSearchCondition))
      this.dropdown = false
    },
    saveBoolean () {
      this.$store.dispatch({
        type: TYPES.GET_SEARCH_QUERY
      }).then(res => {
        var temp = res.find(item => item.templateName === ('default' + this.$store.state.userInfo.usercode))
        var condition
        if (temp) {
          condition = temp.condition
          this.$store.state.templateID = temp.templateId
          condition.booleanCondition = this.fulltext.booleanCondition
        } else {
          condition = {
            booleanCondition: this.fulltext.booleanCondition
          }
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
          this.$store.state.templateCondition = condition
          console.log(res)
        }).catch(res => {
          util.Notice.failed('Failed to save search template', '', 3000)
        })
      })
    },
    resetBoolean () {
      this.fulltext.booleanCondition.forEach(i => i.value = '')
    }
  },
  computed: {
    fulltext () {
      return this.$store.state.fulltextSearchCondition
    },
    disabled () {
      return [1, 2, -1, 0].indexOf(this.$store.getters.currentNode.guid) > -1
    }
  },
  mounted () {
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
.fulltext_container {
  width: 380px;
  color: #999999;
  background-color: #212121;
  font-family: 'proximanova', 'pro_text', 'micorsoft yahei', 'sans-serif',
    'Arial';
  font-weight: lighter;
  font-size: 13px;
  overflow: hidden;
  border-radius: 5px;
}
.fulltext_input {
  width: 310px;
  line-height: 24px;
  background-color: #292929;
  border: 0px;
  padding: 2px 4px 2px 10px;
  float: left;
  color: #d5d5d5;
  outline: none;
  font-weight: lighter;
  font-size: 14px;
}
.search_btn {
  margin: 0;
  outline: none;
  border: none;
  width: 25px;
  height: 30px;
  cursor: pointer;
  background: url(../assets/images/search.png) no-repeat center;
  border-style: none;
}
.toggle_btn {
  width: 15px;
  height: 30px;
  cursor: pointer;
  display: inline-block;
  background: url(../assets/images/search_box_down_nor.png) no-repeat center;
}
.up_toggle_btn {
  background: url(../assets/images/search_box_up_nor.png) no-repeat center;
}
.fulltext_clear_btn {
  background: url(../assets/images/searchbox_clean_nor.png) no-repeat center;
  display: inline-block;
  width: 12px;
  height: 30px;
}
.dropdown_container {
  width: 378px;
  position: absolute;
  top: 29px;
  left: 0px;
  border: 1px solid #000;
  z-index: 10002;
  background-color: #1b1b1b;
}
.fulltext_filter_container {
  background-color: #222222;
  padding-top: 5px;
  overflow: hidden;
}
.boolean_container {
  background: #222222;
  border-top: 1px solid #000;
  overflow: hidden;
}
.top_btn_container {
  padding: 0 10px;
  line-height: 30px;
}
.btn_container {
  line-height: 32px;
}
.fulltext_btn {
  text-decoration: underline;
  cursor: pointer;
  color: #ffffff;
  margin-right: 10px;
}
.boolean_item {
  padding: 0 10px;
  line-height: 32px;
}
.boolean_span {
  width: 100px;
  display: inline-block;
}
.boolean_input {
  width: 239px;
  min-width: 239px;
  line-height: 24px;
  background-color: #1b1b1b;
  margin-left: 5px;
  border: none;
  border-radius: 0;
  color: #fff;
  padding: 0 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.filter_text {
  width: 50px;
  margin: 0 5px 0 10px;
}
.check_span {
  display: inline-block;
  background-color: #303030;
  margin: 3px 2px 3px 2px;
  width: 70px;
  line-height: 24px;
  text-align: center;
  border: 1px solid #303030;
  cursor: pointer;
  color: #fff;
  z-index: 1;
  position: relative;
  overflow: hidden;
  transition: color 0.3s;
}
.check_span::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  background: #f5a623;
  -webkit-transition: -webkit-transform 0.3s, opacity 0.3s;
  transition: transform 0.3s, opacity 0.3s;
  -webkit-transform: translate3d(-115%, 0, 0) skewX(40deg);
  transform: translate3d(-115%, 0, 0) skewX(40deg);
}
.content_filter_container {
  position: relative;
}
.btn_container {
  line-height: 32px;
}
.checked_span.check_span::before{
  opacity: 1;
  -webkit-transform: translate3d(0,0,0) skewX(0deg);
  transform: translate3d(0,0,0) skewX(0deg);
}
</style>

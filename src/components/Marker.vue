<template>
  <div class="list_marker_container" :class="{marker_selected:material.selected}" :data-id="material.guid" @mousedown.stop.capture="mousedown" @mouseup="mouseup" v-on:dblclick="dblclick" @dragstart.stop="dragstart" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent>
    <div class="marker_icon_box">
      <div class="marker_color" :style="material.bgcolor"></div>
      <div class="marker_icon">
        <img draggable="false" class="marker_img" :src="material.icon||material.iconfilename||'./images/nostamp.png'" @error="imageLoadError" />
      </div>
      <span class="marker_typename">{{material.typeName}}</span>
    </div>
    <div class="marker_pos">
      <ul v-if="material.isSMarker">
        <li>
          <span class="timeCodeSpan">In</span>
          <input class="markTimeCode" readonly="readonly" type="text" :value="material.inPoint">
        </li>
        <li>
          <span class="timeCodeSpan">Out</span>
          <input class="markTimeCode" readonly="readonly" type="text" :value="material.outPoint">
        </li>
      </ul>
      <ul v-else>
        <li>
          <span class="timeCodeSpan">Pos</span>
          <input class="markTimeCode" readonly="readonly" type="text" :value="material.pos">
        </li>
        <li style="visibility: hidden;">
          <span class="timeCodeSpan">Pos</span>
          <input class="markTimeCode" readonly="readonly" type="text" :value="material.pos">
        </li>
      </ul>
    </div>
    <div class="lomark_comment marker_comment nonebg" v-if="material.isLMarker">
      <div class="left_part fl">
        <div v-for="i in material._extendinfo" :key="i[0].itemtype">
          <span class="logging_icon" :class="'logging_icon_'+i[0].itemtype" :title="titles[i[0].itemtype]"></span>
          <input v-if="i[0].itemtype<2" class="logging_input" type="text" readonly="readonly" :title="i.map(function(item){return item.itemvalue.map&&item.itemvalue.map(function(item){return item.itemvalue}).join('/')||''}).join('/')" :value="i.map(function(item){return item.itemvalue.map&&item.itemvalue.map(function(item){return item.itemvalue}).join('/')||''}).join('/')" />
          <input v-else class="logging_input" type="text" readonly="readonly" :title="i.map(function(item){return item.itemvalue.filter&&item.itemvalue.filter(function(i){return i.languageid==lmLanguage}).map(function(i){return i.itemvalue}).join('/')||''}).join('/')" :value="i.map(function(item){return item.itemvalue.filter&&item.itemvalue.filter(function(i){return i.languageid==lmLanguage}).map(function(i){return i.itemvalue}).join('/')||''}).join('/')" />
        </div>
      </div>
      <div class="right_part fr">
        <textarea readonly="readonly" :title="material.note" class="logging_comment" disabled v-model="material.note"></textarea>
        <input class="logging_input logging_creator_search" type="text" readonly="readonly" :title="material.creatorName" :value="material.creatorName" />
      </div>
    </div>
    <textarea v-else readonly="readonly" :title="material.note" class="marker_comment" disabled v-model="material.note"></textarea>
  </div>
</template>

<script>
import TYPES from '../dicts/mutationTypes'
import appSetting from '../config/appSetting'
import * as util from '../lib/util'
import EVENT from '../dicts/eventTypes.js'

export default {
  props: {
    data: Object
  },
  data: function () {
    return {
      nostampUrl: require('../assets/images/nostamp.png'),
      titles: ['Title', 'Member', 'Action']
    }
  },
  methods: {
    imageLoadError (event) {
      event.target.src = this.nostampUrl
    },
    mouseup (event) {
      if (event.button !== 0 || this.$store.state.dragSymbol) {
        return
      }
      var children
      if (!event.ctrlKey && !event.shiftKey) {
        if (this.$store.state.selectedMaterials.length > 1) {
          this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDITEMS
          })
          this.material.selected = true
          this.$store.commit({
            type: TYPES.ADD_SELECTEDITEM,
            data: this.material
          })
          children = this.$store.getters.displayMaterials
          this.$store.commit({
            type: TYPES.SET_SIGNMATERIAL,
            data: children.indexOf(this.material)
          })
        }
        // ctrl shilft都没按下  先清空选中的
      } else if (event.ctrlKey && !event.shiftKey) {
        // 按下ctrl  没按shilft   取消选中  选中未选中
        this.material.selected = !this.material.selected
        if (this.material.selected) {
          this.$store.commit({
            type: TYPES.ADD_SELECTEDITEM,
            data: this.material
          })
          children = this.$store.getters.displayMaterials
          this.$store.commit({
            type: TYPES.SET_SIGNMATERIAL,
            data: children.indexOf(this.material)
          })
        } else {
          this.$store.commit({
            type: TYPES.REMOVE_SELECTEDITEM,
            data: this.material
          })
        }
      } else if (event.ctrlKey && event.shiftKey) {
        // 按下ctrl  并按下shilft  多选
        this.$store.dispatch({
          type: TYPES.MULTI_SELECTITEMS,
          data: this.$store.getters.displayMaterials.indexOf(this.material)
        })
      } else {
        // 只按下shilft
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
        this.$store.dispatch({
          type: TYPES.MULTI_SELECTITEMS,
          data: this.$store.getters.displayMaterials.indexOf(this.material)
        })
      }
    },
    mousedown (event) {
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          status: false
        }
      })
      if (event.button !== 0) {
        return
      }
      if (!event.ctrlKey && !event.shiftKey && this.$store.state.selectedMaterials.length < 2 && !this.material.selected) {
        // ctrl shilft都没按下  先清空选中的
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
        this.material.selected = true
        this.$store.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: this.material
        })
        var children = this.$store.getters.displayMaterials
        this.$store.commit({
          type: TYPES.SET_SIGNMATERIAL,
          data: children.indexOf(this.material)
        })
      }
    },
    dblclick: function (event) {
      if (this.material.type === 'marker') {
        this.$store.dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            contentid: this.material.objectguid,
            type: '32',
            pathtype: 'http'
          }
        }).then(res => {
          var pathList
          if (appSetting.USEROOTPATH) {
            pathList = res.data.ext.entity.folderpath.split('/')
          } else {
            pathList = res.data.ext.entity.folderpath.split('/').slice(1)
          }
          util.locateFolder(this.$store, pathList,
            {
              children: this.$store.getters.folderTree
            }, {
              materialGuids: [this.material.objectguid],
              isPreview: true,
              isShowWaiting: true
            })
        })
      }
    },
    dragstart (event) {
      this.$app.emit(EVENT.MARKER_DRAGSTART, event, this.material)
    }
  },
  computed: {
    userInfo () {
      return this.$store.state.userInfo
    },
    isPremiere () {
      return this.$store.state.system !== 'WEBCM'
    },
    lmLanguage () {
      return this.$store.state.lmLanguage
    },
    material () {
      return this.data
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.marker_container {
  cursor: pointer;
  color: #cfd2d4;
  background: #171717;
  width: 100%;
  height: 16px;
  position: relative;
  white-space: nowrap;
  z-index: 1;
  overflow: hidden;
}

.list_marker_container {
  display: flex;
  color: #cfd2d4;
  background: #252525;
  width: 440px;
  height: 80px;
  position: relative;
  white-space: nowrap;
  border: 1px solid #000;
  margin: 10px 0px 0px 10px;
  z-index: 1;
  float: left;
  padding: 10px;
}

.list_marker_container:hover {
  border: 1px solid #ff9000;
}

.marker_typename {
  position: relative;
  bottom: 2px;
}

.marker_icon_box {
  width: 130px;
  height: 81px;
  background: #222;
  text-align: center;
  display: inline-block;
}

.marker_color {
  width: 10px;
  height: 80px;
  position: absolute;
  top: 10px;
  border: 1px #000 solid;
}

.marker_icon {
  margin-top: 4px;
  height: 60px;
  line-height: 60px;
}

.marker_img {
  max-width: 107px;
  max-height: 60px;
  position: relative;
  margin-left: 12px;
  vertical-align: middle;
}

.marker_icon_box span {
  line-height: 24px;
}

.marker_comment {
  overflow: hidden;
  height: 74px;
  color: #b3b3b3;
  background: #1b1b1b;
  display: inline-block;
  width: calc(100% - 136px);
  border: none;
  resize: none;
  outline: none;
  padding: 5px 0px 0px 5px;
}

.marker_pos {
  width: 135px;
  top: -14px;
  position: relative;
  background: #222;
  display: inline-block;
  display: none;
}

.markTimeCode {
  font-size: 12px;
  color: #7f7f7f;
  background: #1b1b1b;
  border: none;
  resize: none;
  outline: none;
  font-family: Arial;
  text-align: center;
  width: 75px;
  margin-left: 5px;
  height: 25px;
}

.timeCodeSpan {
  font-size: 12px;
  display: inline-block;
  width: 25px;
  margin: 0 5px;
}
.left_part {
  height: 75px;
  text-align: left;
  width: 140px;
}

.left_part div {
  margin-bottom: 3px;
}

.right_part {
  width: 160px;
}

.logging_icon {
  width: 21px;
  height: 21px;
  display: inline-block;
  vertical-align: middle;
}

.logging_input {
  font-size: 12px;
  line-height: 16px;
  color: #cfd2d4;
  background-color: #1b1b1b;
  border: none;
  width: 90px;
  outline: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.logging_input:read-only {
  margin-top: 1px;
  font-size: 14px;
  line-height: 19px;
  color: #cfd2d4;
  background-color: #1b1b1b;
  border: none;
  width: 105px;
  outline: none;
  height: 21px;
  margin-left: 5px;
  padding-left: 5px;
}

.logging_icon_0 {
  background: url(../assets/images/General.png) no-repeat;
  float: left;
}

.nonebg {
  top: -3px;
  background: none;
  left: 243px;
}

.logging_icon_1 {
  background: url(../assets/images/Member.png) no-repeat;
  float: left;
}

.logging_icon_2 {
  background: url(../assets/images/Action.png) no-repeat;
  float: left;
}

.logging_comment {
  height: 42px;
  width: 155px;
  font-size: 14px;
  line-height: 16px;
  color: #cfd2d4;
  background-color: #1b1b1b;
  border: none;
  outline: none;
  resize: none;
  padding: 5px 0px 0px 5px;
  margin-left: 5px;
}

.logging_creator {
  width: 155px !important;
}

.logging_creator_search {
  width: 155px !important;
  float: left;
}
</style>

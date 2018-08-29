<template>
  <div class="sv_marker_container" :class="{marker_selected:material.selected}" @click="click(material)" @mousedown.stop="mousedown" @mouseup="mouseup" @dragstart.stop="dragstart" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent>
    <div class="sv_marker_icon_box">
      <div class="sv_marker_color fl" @mousedown.stop="showColorPicker" :style="material.bgcolor">
        <div class="marker_color_picker" v-show="!disabled && isShowColor">
          <div v-for="c in colors" :key="c" :style="{'background':'rgb(' + (c&0x0000ff) + ',' + ((c&0x00ff00)>>8) + ',' + ((c&0xff0000)>>16) + ')'}" class="marker_color_item fl" @click.stop.prevent @mousedown.stop.prevent="setColor(c)"></div>
        </div>
      </div>
      <div class="sv_marker_icon fl">
        <img :class="{Videodefault:m.type == 'video',fullscreen:(m.is16_9sd && m.type == 'video')}" draggable="false" class="sv_marker_img" :src="material.icon||material.iconfilename||'./images/nostamp.png'" onerror="this.src='./images/nostamp.png'" style="max-width: 100px;max-height: 56px;vertical-align: middle;" />
      </div>
      <div class="sv_marker_pos fl">
        <div v-if="material.isSMarker">
          <div class="fr" style="margin-bottom: 5px">
            <span class="sv_timeCodeSpan">{{dict.in}}</span>
            <input class="sv_markTimeCode" readonly="readonly" type="text" :value="material.inPoint" tabindex="-1">
          </div>
          <div class="fr">
            <span class="sv_timeCodeSpan">{{dict.out}}</span>
            <input class="sv_markTimeCode" readonly="readonly" type="text" :value="material.outPoint" tabindex="-1">
          </div>
        </div>
        <div v-else-if="material.isLMarker">
          <div class="fr" style="margin-bottom: 5px">
            <span class="sv_timeCodeSpan">POS</span>
            <input class="sv_markTimeCode" readonly="readonly" type="text" :value="material.pos" tabindex="-1">
          </div>
          <div class="fr">
            <span class="sv_timeCodeSpan">DUR</span>
            <input class="sv_markTimeCode" readonly="readonly" type="text" :value="material.duration" tabindex="-1">
          </div>
        </div>
        <div v-else>
          <div class="fr">
            <span class="sv_timeCodeSpan">{{dict.pos}}</span>
            <input class="sv_markTimeCode" readonly="readonly" type="text" :value="material.pos" tabindex="-1">
          </div>
        </div>
      </div>
    </div>
    <div class="sv_marker_title_container">
      <span>{{material.typeName}}</span>
    </div>
    <div class="lomark_comment sv_marker_comment nonebg" v-if="material.isLMarker">
      <div class="left_part fl">
        <div v-for="(i,index) in material._extendinfo" :key="index">
          <span class="logging_icon" :class="'logging_icon_'+i[0].itemtype" :title="titles[i[0].itemtype]"></span>
          <input v-if="i[0].itemtype<2" class="logging_input" type="text" readonly="readonly" :title="i.map(function(item){return item.itemvalue.map&&item.itemvalue.map(function(item){return item.itemvalue}).join('/')||''}).join('/')" :value="i.map(function(item){return item.itemvalue.map&&item.itemvalue.map(function(item){return item.itemvalue}).join('/')||''}).join('/')" />
          <input v-else class="logging_input" type="text" readonly="readonly" :title="i.map(function(item){return item.itemvalue.filter&&item.itemvalue.filter(function(i){return i.languageid==lmLanguage}).map(function(i){return i.itemvalue}).join('/')||''}).join('/')" :value="i.map(function(item){return item.itemvalue.filter&&item.itemvalue.filter(function(i){return i.languageid==lmLanguage}).map(function(i){return i.itemvalue}).join('/')||''}).join('/')" />
        </div>
      </div>
      <div class="right_part fr">
        <textarea :title="material.note" class="logging_comment" v-model="material.note" @keyup="volidInput" :disabled="modifyFlag" @mousedown.stop @click.stop></textarea>
        <input class="logging_input logging_creator" type="text" readonly="readonly" :title="material.creatorName" :value="material.creatorName" />
      </div>
    </div>
    <textarea v-else :title="material.note" class="sv_marker_comment" v-model="material.note" @keyup="volidInput" :disabled="modifyFlag" @mousedown.stop @click.stop></textarea>
    <input type="button" class="marker_delete_icon fr" :disabled="disabled||material.type == 65536" v-on:click.stop="deleteMarker" />
  </div>
</template>

<script>
import { volidInput, getUrl, convertPath4Mac } from '../lib/util'
import $ from 'jquery'
import TYPES from '../dicts/mutationTypes'
import appSetting from '../config/appSetting'
export default {
  props: {
    data: Object,
    m: Object,
    markers: Array,
    disabled: Boolean
  },
  data: function () {
    return {
      colors: [
        13684944,
        6844660,
        6730483,
        6418415,
        10152321,
        15460225,
        15839589,
        15888307,
        11497715,
        22414
      ],
      titles: ['Title', 'Member', 'Action'],
      isShowColor: false
    }
  },
  methods: {
    mouseup (event) {
      if (event.button !== 0 || this.$store.state.dragSymbol) {
        return
      }
      var children
      if (!event.ctrlKey && !event.shiftKey) {
        if (this.$store.state.selectedMarkers.length > 1) {
          this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDMARKERS
          })
          this.material.selected = true
          this.$store.commit({
            type: TYPES.ADD_SELECTEDMARKER,
            data: this.material
          })
          children = this.markers
          this.$store.commit({
            type: TYPES.SET_SIGNMARKER,
            data: children.indexOf(this.material)
          })
        }
        // ctrl shilft都没按下  先清空选中的
      } else if (event.ctrlKey && !event.shiftKey) {
        // 按下ctrl  没按shilft   取消选中  选中未选中
        this.material.selected = !this.material.selected
        if (this.material.selected) {
          this.$store.commit({
            type: TYPES.ADD_SELECTEDMARKER,
            data: this.material
          })
          children = this.markers
          this.$store.commit({
            type: TYPES.SET_SIGNMARKER,
            data: children.indexOf(this.material)
          })
        } else {
          this.$store.commit({
            type: TYPES.REMOVE_SELECTEDMARKER,
            data: this.material
          })
        }
      } else if (event.ctrlKey && event.shiftKey) {
        // 按下ctrl  并按下shilft  多选
        this.$store.dispatch({
          type: TYPES.MULTI_SELECTMARKERS,
          data: this.markers.indexOf(this.material),
          markers: this.markers
        })
      } else {
        // 只按下shilft
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDMARKERS
        })
        this.$store.dispatch({
          type: TYPES.MULTI_SELECTMARKERS,
          data: this.markers.indexOf(this.material),
          markers: this.markers
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
      if (!event.ctrlKey && !event.shiftKey && this.$store.state.selectedMarkers.length < 2 && !this.material.selected) {
        // ctrl shilft都没按下  先清空选中的
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDMARKERS
        })
        this.material.selected = true
        this.$store.commit({
          type: TYPES.ADD_SELECTEDMARKER,
          data: this.material
        })
        var children = this.markers
        this.$store.commit({
          type: TYPES.SET_SIGNMARKER,
          data: children.indexOf(this.material)
        })
      }
    },
    volidInput (event) {
      this.material.note = volidInput(event.target.value, 1000, event.target, true)
    },
    showColorPicker () {
      if (!this.modifyFlag) {
        this.isShowColor = !this.isShowColor
      } else {
        this.isShowColor = false
      }
    },
    setColor (c) {
      this.$emit('color', c, this.material)
      this.material.color = c
      this.material.bgcolor = {
        background: 'rgb(' + (c & 0x0000ff) + ',' + ((c & 0x00ff00) >> 8) + ',' + ((c & 0xff0000) >> 16) + ')'
      }
    },
    click: function (marker) {
      this.$emit('marker', marker)
    },
    deleteMarker: function () {
      this.$emit('delete', this.material)
    },
    saveMarker: function () {
      this.$emit('save', this.material)
    },
    dragstart (event) {
      // for premiere
      event.dataTransfer.dropEffect = 'copy'
      event.dataTransfer.effectAllowed = 'copy'

      var isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')
      var _this = this
      var markers = _this.markers.filter(item => item.selected)
      // if (markers.length !== _this.markers.filter(item => item.selected).length) {
      //   //util.Notice.warning('Essence marker(s) or change marker(s) cannot be imported.', '', 3000)
      //   window.parent.postMessage({
      //     type: 'showMessage',
      //     data: {
      //       content: 'Essence marker(s) or change marker(s) cannot be imported.',
      //       type: 'warning',
      //       time: 3000,
      //     },
      //     auth: _this.$store.state.userInfo,
      //   }, '*')
      // }

      markers.forEach((item, index) => {
        var url = getUrl(appSetting.CMAPI + (isWin ? '/CMApi/api/entity/program/getscenemarkfcp7xmlpath' : '/CMApi/api/entity/program/getscenemarkfcp7xmlpathformac'), {
          userToken: _this.$store.state.userInfo.usertoken,
          guid: item.objectguid,
          markguid: item.markguid
        })
        $.ajax({
          type: 'post',
          url: '/Handler/MaterialList.ashx',
          data: {
            OperationType: 'ForwardRequest',
            usertoken: _this.$store.state.userInfo.usertoken,
            url: url,
            type: 'get',
            body: ''
          },
          dataType: 'json',
          async: false,
          success: function (data) {
            if (data.R) {
              var res = JSON.parse(data.R)
              event.dataTransfer.setData('com.adobe.cep.dnd.file.' + index, isWin ? res.ext.xmlpath : convertPath4Mac(res.ext.xmlpath))
              window.parent.postMessage({
                type: 'sceneMarkDragStart',
                data: item,
                ext: res.ext,
                auth: _this.$store.state.userInfo
              }, '*')
            }
          }
        })
      })
    }
  },
  mounted () {
    window.addEventListener('mousedown', () => this.isShowColor = false, true)
  },
  computed: {
    focused () {
      return this.$store.state.isFocusPlayer
    },
    isPremiere () {
      return this.$store.state.system
    },
    lmLanguage () {
      return this.$store.state.defaultLanguage
    },
    material () {
      return this.data
    },
    modifyFlag () {
      if (this.material.type === 131072) {
        return true
      } else {
        return this.disabled
      }
    },
    dict () {
      return this.$store.state.dict
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.sv_marker_box {
  width: 600px;
}

.sv_marker_container {
  height: 86px;
  padding: 0 4px;
  background: #404040;
  border: 1px solid transparent;
  margin-bottom: 2px;
  position: relative;
}

.sv_marker_container:hover {
  border: 1px solid #f89b39;
}

.sv_marker_title_container {
  line-height: 30px;
  color: #fff;
  padding-left: 3px;
}

.sv_marker_icon_box {
  position: relative;
  height: 56px;
  margin: 2px 4px;
}

.sv_marker_color {
  width: 10px;
  height: 56px;
}

.sv_marker_icon {
  vertical-align: middle;
  text-align: center;
  width: 100px;
  height: 56px;
  background: #2e2e2e;
  line-height: 56px;
}

.sv_marker_pos {
  width: 118px;
}

.sv_markTimeCode {
  font-size: 12px;
  color: #fff;
  background: #212121;
  border: 1px #161616 solid;
  border: none;
  resize: none;
  outline: none;
  font-family: Arial;
  text-align: center;
  width: 80px;
  margin-left: 5px;
  height: 25px;
}

.sv_marker_comment {
  overflow: hidden;
  height: 68px;
  color: #fff;
  padding: 5px;
  /* margin-top: 5px; */
  font-family: inherit;
  background: #212121;
  border: 1px #161616 solid;
  display: block;
  width: 300px;
  border: none;
  position: absolute;
  resize: none;
  top: 3px;
  left: 250px;
}

.sv_marker_comment:disabled {
  background: #212121;
}

.marker_delete_icon {
  display: inline-block;
  width: 15px;
  height: 17px;
  border: none;
  outline: none;
  cursor: pointer;
  background: url(../images/btn_delObj.png) no-repeat;
  background-position: 0 0;
  position: absolute;
  top: 35px;
  right: 12px;
}

.marker_delete_icon:hover {
  background-position: -17px 0;
}
</style>

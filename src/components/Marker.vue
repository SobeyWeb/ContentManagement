<template>
  <div class="list_marker_container" :class="{marker_selected:material.selected}" :data-id="material.guid" @mousedown.stop.capture="mousedown" @mouseup="mouseup" v-on:dblclick="dblclick" @dragstart.stop="dragstart" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent>
    <div class="marker_icon_box">
      <div class="marker_color" :style="material.bgcolor"></div>
      <div class="marker_icon">
        <img draggable="false" class="marker_img" :src="material.icon||material.iconfilename||'./images/nostamp.png'" onerror="this.src='./images/nostamp.png'" />
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
import $ from 'jquery'

export default {
  props: {
    data: Object
  },
  data: function () {
    return {
      titles: ['Title', 'Member', 'Action']
    }
  },
  methods: {
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
      // for premiere
      event.dataTransfer.dropEffect = 'copy'
      event.dataTransfer.effectAllowed = 'copy'

      var isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')

      var _this = this
      var markers = _this.$store.state.selectedMaterials // .filter(item => item.flag == 'smarker' || item.flag === 'lmarker')
      // if (markers.length !== _this.$store.state.selectedMaterials.length) {
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
      // if (false) { // 插件采用以前的方式拖拽上bin
      //   markers.forEach((item, index) => {
      //     var port = (document.location.protocol == "https:") ? 9065 : 9064,
      //       url = document.location.protocol + '//localhost:' + port + '/getFcpMarkXml',
      //       path = isWin ? 'C:\\\\\ProgramData\\Temp\\' + Guid.NewGuid().ToString("N") + '.xml' : '/Volumes/Temp/' + Guid.NewGuid().ToString("N") + '.xml'
      //     event.dataTransfer.setData("com.adobe.cep.dnd.file." + index, path);
      //     $.ajax({
      //       type: "post",
      //       url: url,
      //       data: {
      //         type: item.flag,
      //         markguid: item.markguid,
      //         usertoken: _userToken,
      //         contentid: item.objectguid,
      //         path: path,
      //         system: isWin ? 'Windows' : 'Mac'
      //       },
      //       dataType: "json",
      //       async: true,
      //       success: function (data) {
      //         if (data.ext) {
      //           window.parent.postMessage({
      //             type: 'sceneMarkDragStart',
      //             data: item,
      //             ext: data.ext,
      //             auth: _this.$store.state.userInfo,
      //           }, '*')
      //         }
      //       },
      //     })
      //   })
      // } else {
      markers.forEach((item, index) => {
        var url = util.getUrl(appSetting.CMAPI + (isWin ? '/CMApi/api/entity/program/getscenemarkfcp7xmlpath' : '/CMApi/api/entity/program/getscenemarkfcp7xmlpathformac'), {
          userToken: _this.userInfo.usertoken,
          guid: item.objectguid,
          markguid: item.markguid
        })
        $.ajax({
          type: 'post',
          url: '/Handler/MaterialList.ashx',
          data: {
            OperationType: 'ForwardRequest',
            usertoken: _this.userInfo.usertoken,
            url: url,
            type: 'get',
            body: ''
          },
          dataType: 'json',
          async: false,
          success: function (data) {
            if (data.R) {
              var res = JSON.parse(data.R)
              event.dataTransfer.setData('com.adobe.cep.dnd.file.' + index, isWin ? res.ext.xmlpath : util.convertPath4Mac(res.ext.xmlpath))
              window.parent.postMessage({
                type: 'sceneMarkDragStart',
                data: item,
                ext: res.ext,
                auth: _this.userInfo
              }, '*')
            }
          }
        })
      })
      // }
    }
  },
  computed: {
    userInfo () {
      return this.$store.state.userInfo
    },
    isPremiere () {
      return this.$store.state.system
    },
    lmLanguage () {
      return this.$store.state.lmLanguage
    },
    material () {
      return this.data
    },
    dict () {
      return this.$store.state.dict
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

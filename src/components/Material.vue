<template>
  <div class="material fl" :class="[material.type, material.clipping ? 'material_clipping' : '', material.selected ? 'material_selected' : '', material.dragOvering ? 'material_dragOver' : '']" @dblclick="dblclick" @touchstart="dblclick" @dragstart.stop="dragStart" @dragend.stop="dragEnd" @mousedown.stop.capture="mousedown" @mouseup="mouseup" @contextmenu.stop.prevent="contextMenu" @drop.prevent.stop="drop" @dragover.stop.prevent="dragover" @dragenter.prevent="dragenter" @dragleave.prevent="dragleave" :data-id="material.guid" :style="thumbnailStyle" :draggable="material.selected&&!material.renaming&&(material.operations.some(function(item){return ['Cut', 'Copy', 'Delete'].indexOf(item)>-1})||isPremiere)">
    <div class="material_status">
      <div v-if="material.type==='video'||material.type==='image'">
        <span class="status_item hq" :class="{hq1:!material.HQ}" v-show="material.HQ"></span>
        <span class="status_item lq" :class="{lq1:!material.LQ}" v-show="material.LQ"></span>
        <span class="status_item i" :class="{i1:!material.I}" :title="material.Ititle" v-if="material.I&&!material.isAudio" v-show="material.I"></span>
        <span class="status_item p" :class="{p1:!material.P}" :title="material.Ptitle" v-else-if="!material.isAudio" v-show="material.P"></span>
        <span class="status_item wa" :class="{wa1:!material.WA}" v-if="!material.isAudio" v-show="material.WA"></span>
        <span class="status_item db" :class="{db1:!material.DB}" v-if="!material.isAudio" v-show="material.DB"></span>
        <span class="status_item online" :class="{online1:material.onlinstatus != 'Online'}" v-if="material.father.guid&&material.onlinstatus"></span>
      </div>
    </div>
    <div v-on:mousemove="mousemove" class="material_icon_container" :class="material.cutting ? 'material_cutting' : ''">
      <img draggable="false" class="material_icon drag_icon" :class="{Videodefault:material.type == 'video',fullscreen:(material.is16_9sd && material.type == 'video')}" @load="getImginfo($event,material)" v-if="material.iconfilename" :src="material.iconfilename" @error="imageLoadError">
      <span class="drag_icon material_icon_span" :class="[material.icon, material.bgtype]" v-else></span>
      <img draggable="false" v-if="material.type =='video'&&!material.isAudio&&material.previewicon" class="preview_img" :src="material.previewicon" :style="{top:top+'px'}">
      <div draggable="false" v-if="material.type =='video'&&!material.isAudio&&material.previewicon" class="preview_cell" :style="{left:left+'px'}">
      </div>
      <div class="material_more_icon" @click="more"></div>
    </div>
    <div class="material_icon_container" v-if="material.uploading">
      <rd-progress-circle :progress="progressData"></rd-progress-circle>
    </div>
    <div class="material_info" @dragstart.stop>
      <span class="material_name_span" v-if="!material.renaming" @dblclick.stop.left="activeInput" :title="material.name" v-html="showSearch?material.name.replace(regExp, search?'<mark>$&</mark>':'$&'):isHighLight && material.name_hl && material.name === material.name_hl.replace(/<[^>]+>/g, '') ? material.name_hl : material.name"></span>
      <input class="rename_input" v-focus :val="material.name" maxlength="255" v-else type="text" @keyup="volidInput" @keydown.enter.stop="rename" @blur.stop.prevent="rename" @dblclick.stop @contextmenu.stop @dragstart.stop @selectstart.stop @mousedown.stop @keydown.tab.prevent />
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import EVENT from '../dicts/eventTypes'
import APPSETTING from '../config/appSetting.js'
import { getRepository } from '../data/repository'
import $ from 'jquery'
export default {
  props: {
    data: Object
  },
  data: function () {
    return {
      nostampUrl: require('../assets/images/nostamp.png'),
      intervalId: -1,
      top: 0,
      left: 0
    }
  },
  methods: {
    imageLoadError (event) {
      event.target.src = this.nostampUrl
    },
    getImginfo (event, material) {
      this.$nextTick(() => {
        if (material.imagetype === 4) {
          var imgH = event.currentTarget && event.currentTarget.naturalHeight
          var imgW = event.currentTarget && event.currentTarget.naturalWidth
          if (imgW > imgH) {
            material.is16_9sd = true
          }
        }
      })
    },
    more (event) {
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          event: event,
          status: true
        }
      })
    },
    drop (event) {
      var arr
      if (this.material.cutting) {
        return
      }
      if (this.material.type === 'folder') {
        this.material.dragOvering = false
        if (event.dataTransfer.files.length > 0) {
          if (this.material.operations.indexOf('Upload') === -1) {
            util.Notice.warning('Can not upload clip to this folder', '', 3000)
            return
          }
          var files = event.dataTransfer.files
          this.$store.dispatch({
            type: TYPES.GET_MATERIALS,
            source: this.material
          }).then(res => {
            this.$store.dispatch({
              type: TYPES.UPLOAD_FILES,
              data: {
                files: files
              },
              source: this.material
            })
          })
        } else if (event.ctrlKey) {
          if (this.material.operations.indexOf('Paste') === -1) {
            util.Notice.warning('Can not copy object to this folder', '', 3000)
            return
          }
          arr = this.$store.state.selectedMaterials
          if (arr.some(item => item.operations.indexOf('Copy') === -1)) {
            util.Notice.warning('Some Objects can not be copied', '', 3000)
            return
          }
          util.Model.confirm('Copy', 'Are You Sure to Copy ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.COPY_MATERIALS,
                data: arr,
                target: this.material
              })
            }, () => {
            }, {
              large: true, // Boolean
              cancelButton: {
                show: true, // Boolean
                type: '', // String 请参考 Button
                text: 'Cancel' // String
              },
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'Confirm'
              }
            })
        } else {
          arr = this.$store.state.selectedMaterials
          if (arr.some(item => item.operations.indexOf('Cut') === -1)) {
            util.Notice.warning('Some Objects can not be cutted', '', 3000)
            return
          }
          if (arr.some(item => item.father === this.material || item === this.material)) {
            return
          }
          if (this.material.operations.indexOf('Paste') === -1) {
            util.Notice.warning('Can not move object to this folder', '', 3000)
            return
          }
          util.Model.confirm('Move', 'Are You Sure to Move ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.MOVE_MATERIALS,
                data: arr,
                target: this.material
              })
            }, () => {
            }, {
              large: true, // Boolean
              cancelButton: {
                show: true, // Boolean
                type: '', // String 请参考 Button
                text: 'Cancel' // String
              },
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'Confirm'
              }
            })
        }
      }
    },
    mouseup (event) {
      if (event.button !== 0 || this.$store.state.dragSymbol) {
        return
      }
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
          var children = this.$store.getters.displayMaterials
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
    activeInput: function (event) {
      this.material.renaming = true
    },
    dblclick: function (event) {
      if (this.material.father.guid === 0) { // 回收站
        this.$store.dispatch({
          type: TYPES.PROPERTIES,
          target: [this.material]
        })
      } else if (this.material.type === 'folder') {
        if (this.material.guid === -1) {
          this.$store.dispatch({
            type: TYPES.GET_FAVORITERESULT,
            source: this.material
          }).then(() => {
            this.$store.commit({
              type: TYPES.GET_NAVPATH,
              target: this.material,
              data: []
            })
          })
        } else if (this.material.guid === 0) {
          this.$store.dispatch({
            type: TYPES.GET_TRASHCAN_OBJECTS,
            source: this.material
          }).then(() => {
            this.$store.commit({
              type: TYPES.GET_NAVPATH,
              target: this.material,
              data: []
            })
          })
        } else {
          if (APPSETTING.USEROOTPATH) {
            util.locateFolder(this.$store, this.material.path.split('/'),
              {
                children: this.$store.getters.folderTree
              }, {
                isShowWaiting: true
              })
          } else {
            util.locateFolder(this.$store, this.material.path.split('/').slice(1),
              {
                children: this.$store.getters.folderTree
              }, {
                isShowWaiting: true
              })
          }
        }
      } else if (this.material.type === 'marker') {
        this.$store.dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            clipid: this.material.objectguid,
            sourceid: '32'
          }
        }).then(res => {
          var pathList
          if (APPSETTING.USEROOTPATH) {
            pathList = res.data.ext.entity.folderpath.split('/')
          } else {
            pathList = res.data.ext.entity.folderpath.split('/').slice(1)
          }
          util.locateFolder(this.$store, pathList,
            {
              children: this.$store.getters.folderTree
            }, {
              isShowWaiting: true
            })
        })
      } else {
        this.$store.dispatch({
          type: TYPES.PROPERTIES,
          target: [this.material]
        })
      }
    },
    mousemove (event) {
      if (this.material.previewicon) {
        var x1 = event.x
        var x2 = $(event.currentTarget).offset().left
        var picCount = 10
        var picWidth = event.currentTarget.querySelector('.preview_img').width
        var picHeight = event.currentTarget.querySelector('.preview_img').height / 10
        var iconWidth = this.$store.state.thumbnailStyle.width * this.$store.state.scaleTime - 2

        var offset = Math.floor((x1 - x2) / (iconWidth / picCount))
        this.left = x1 - x2
        this.top = -(picHeight * iconWidth / picWidth) * offset
      }
    },
    volidInput (event) {
      util.volidInput(event.target.value, 255, event.target)
    },
    upload (event) {
      this.$store.dispatch({
        type: TYPES.UPLOAD_FILES,
        data: {
          files: event.target.files
        }
      })
    },
    dragover (event) {
      if (this.material.type === 'folder') {
        this.material.dragOvering = true
        if (event.ctrlKey) {
          event.dataTransfer.effectAllowed = 'all'
        } else {
          event.dataTransfer.effectAllowed = 'all'
        }
      }
    },
    dragenter (event) {
      if (this.material.type === 'folder') {
        this.material.dragOvering = true
      }
    },
    dragleave (event) {
      if (this.material.type === 'folder') {
        this.material.dragOvering = false
      }
    },
    dragStart (event) {
      this.$app.emit(EVENT.MATERIAL_DRAGSTART, event, this.material)
    },
    dragEnd (event) {
      this.$store.state.previewDragSymbol = false
    },
    rename: util.throttle(50, function (event) {
      this.material.guid = this.material._guid || this.material.guid
      // 验证名字  未验证特殊字符
      event.target.value = util.volidInput(event.target.value, 255, event.target).trim()
      if (this.material.renaming) {
        if (this.material.type === 'folder' && getRepository(this.material.father.guid).some(item => item.name === event.target.value && item.guid !== this.material.guid && item.type === 'folder')) {
          util.Notice.warning('This name is already existing in current folder', '', 3000)
          this.material.renaming = false
        } else if (this.material.name === event.target.value) {
          this.material.renaming = false
          // do nothing
        } else {
          // event Arr push
          var symbol = Symbol('rename')
          this.$store.commit({
            type: TYPES.PUSH_EVENT,
            data: {
              type: TYPES.RENAME,
              oldValue: this.material.name,
              newValue: event.target.value,
              target: this.material
            },
            symbol: symbol
          })
          this.material.name = event.target.value
          this.material.renaming = false
          this.$store.dispatch({
            type: TYPES.RENAME,
            source: this.material,
            data: event.target.value
          }).then(res => {
            // success
            this.$store.commit({
              type: TYPES.DELETE_EVENT,
              symbol: symbol
            })
            // util.Notice.success('rename success', res.data.msg, 3000)
          }).catch(res => {
            this.$store.commit({
              type: TYPES.RECOVERY_EVENT,
              symbol: symbol
            })
            util.Notice.failed('Failed to rename', '', 3000)
          })
          this.material.path = this.material.folderpath + '/' + this.material.name
        }
      }
    }, true),
    contextMenu (event) {
      this.$app.emit(EVENT.MATERIAL_CONTEXTMENU, event, this.material)
    }
  },
  computed: {
    userInfo () {
      return this.$store.state.userInfo
    },
    isHighLight () {
      return this.$store.getters.isHighLight
    },
    showSearch () {
      return this.$store.state.showSearch
    },
    search () {
      return this.$store.state.condition
    },
    regExp () {
      return this.$store.getters.regExp
    },
    isPremiere () {
      return this.$store.state.system !== 'WEBCM'
    },
    thumbnailStyle () {
      return this.$store.getters.thumbnailStyle
    },
    material () {
      return this.data
    },
    progressData () {
      return {
        percent: this.material.percent,
        options: {
          color: '#2db7f5',
          size: 'small',
          state: 'loading',
          format: function (percent) {
            return percent + '%'
          }
        }
      }
    },
    editor () {
      return this.$store.state.editor
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.material {
  width: 150px;
  height: 130px;
  box-sizing: border-box;
  margin: 8px 7px;
  background: #393939;
  position: relative;
  border: 1px solid #393939;
}
.material .material_status {
  height: 25px;
  line-height: 25px;
  padding-left: 4px;
}
.status_item {
  width: 19px;
  height: 16px;
  display: inline-block;
  margin: 4px 1px 5px 0;
  background: url(../assets/images/ML_FLAG_big.png) no-repeat;
}

.list_status_item.wa {
  background-position: -56px 0;
}

.list_status_item.hq {
  background-position: 0 0;
}

.list_status_item.lq {
  background-position: -14px 0;
}

.list_status_item.db {
  background-position: -70px 0;
}

.list_status_item.p {
  background-position: -42px 0;
}

.list_status_item.i {
  background-position: -28px 0;
}

.list_status_item.wa1 {
  background-position: -56px -12px;
}

.list_status_item.hq1 {
  background-position: 0 -12px;
}

.list_status_item.lq1 {
  background-position: -14px -12px;
}

.list_status_item.db1 {
  background-position: -70px -12px;
}

.list_status_item.online {
  background-position: -84px 0;
}

.list_status_item.online1 {
  background-position: -84px -12px;
}

.list_status_item.p1 {
  background-position: -42px -12px;
}

.list_status_item.i1 {
  background-position: -28px -12px;
}

.status_item.wa {
  background-position: -76px 0;
}

.status_item.hq {
  background-position: 0 0;
}

.status_item.lq {
  background-position: -19px 0;
}

.status_item.db {
  background-position: -95px 0;
}

.status_item.p {
  background-position: -57px 0;
}

.status_item.i {
  background-position: -38px 0;
}

.status_item.online {
  background-position: -114px 0;
}

.status_item.online1 {
  background-position: -114px -16px;
}

.status_item.wa1 {
  background-position: -76px -16px;
}

.status_item.hq1 {
  background-position: 0 -16px;
}

.status_item.lq1 {
  background-position: -19px -16px;
}

.status_item.db1 {
  background-position: -95px -16px;
}

.status_item.p1 {
  background-position: -57px -16px;
}

.status_item.i1 {
  background-position: -38px -16px;
}

.preview_cell {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  width: 2px;
  background-color: #e95252;
  visibility: hidden;
  pointer-events: none;
}

.material_icon_container:hover .preview_cell {
  visibility: visible;
}

.material_icon_container:hover .preview_img {
  visibility: visible;
}

.list_material_icon_container:hover .preview_cell {
  visibility: visible;
}

.list_material_icon_container:hover .preview_img {
  visibility: visible;
}

.preview_img {
  position: absolute;
  pointer-events: none;
  left: 0px;
  visibility: hidden;
  width: 100%;
}
.material .material_icon_container {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #2e2e2e;
  position: absolute;
  left: 0;
  top: 25px;
  right: 0;
  bottom: 20px;
  overflow: hidden;
  z-index: 1;
}
.material .material_icon_container .material_icon {
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
}
.material .material_icon_container .drag_icon {
  vertical-align: middle;
  display: inline-block;
  background-size: contain !important;
}
.material_more_icon {
  width: 25px;
  height: 25px;
  position: absolute;
  right: 5px;
  bottom: 5px;
  background: url(../assets/images/more.png) center center no-repeat;
  border-radius: 4px;
  cursor: pointer;
  display: none;
}
.material .material_info {
  color: #cfd2d4;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  height: 20px;
  line-height: 20px;
  position: absolute;
  width: 100%;
  bottom: 0;
}
.material .material_info .material_name_span {
  margin: 0 3px;
  white-space: pre;
}
.material .material_icon_span {
  width: 100%;
  height: 100%;
}
.material_icon_span.folder {
  background: url(../assets/images/folder.png) no-repeat center center;
}
.material_icon_span.uploading {
  background: url(../assets/images/uploading.png) no-repeat center center;
}
.material_icon_span.audio {
  background: url(../assets/images/audio.png) no-repeat center center;
}
.material_icon_span.video {
  background: url(../assets/images/video.png) no-repeat center center;
}
.material_icon_span.h5pgm {
  background: url(../assets/images/h5pgm.png) no-repeat center center;
}
.material_icon_span.sequence {
  background: url(../assets/images/sequence.png) no-repeat center center;
}
.material_icon_span.image {
  background: url(../assets/images/image.png) no-repeat center center;
}
.material_icon_span.txtfile {
  background: url(../assets/images/txtfile.png) no-repeat center center;
}
.material_icon_span.word {
  background: url(../assets/images/word.png) no-repeat center center;
}
.material_icon_span.ppt {
  background: url(../assets/images/ppt.png) no-repeat center center;
}
.material_icon_span.excel {
  background: url(../assets/images/excel.png) no-repeat center center;
}
.material_icon_span.pdf {
  background: url(../assets/images/pdf.png) no-repeat center center;
}
.material_icon_span.project {
  background: url(../assets/images/project.png) no-repeat center center;
}
.material_icon_span.other {
  background: url(../assets/images/other.png) no-repeat center center;
}
.material_icon_span.rar {
  background: url(../assets/images/rar.png) no-repeat center center;
}
.material {
  width: 150px;
  height: 130px;
  box-sizing: border-box;
  margin: 8px 7px;
  background: #393939;
  position: relative;
  border: 1px solid #393939;
}

.material .rename_input {
  width: 100%;
}

.material.material_clipping {
  background-color: rgba(200, 89, 0, 5);
}

.material.material_selected {
  border: 1px #ab916a solid;
  background: #ab916a;
}

.material.material_dragOver {
  background-color: rgba(200, 89, 0, 5);
}

.material .material_cutting {
  opacity: 0.3;
}

.material:hover {
  border: 1px solid #ff9000;
  /*background: #62522f;*/
}

.material.material_clipping:hover {
  /*background-color: rgba(200, 89, 0, 5);*/
  border: 1px solid #ff9000;
}
.material_icon_container .my_clip_icon {
  background: url(../assets/images/myclip_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.material_icon_container .this_week_icon {
  background: url(../assets/images/week_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.material_icon_container .today_icon {
  background: url(../assets/images/today_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.material_icon_container .transhcan_icon {
  background: url(../assets/images/trashcan_icon.png) no-repeat center center !important;
  background-size: contain !important;
}

.material .node_icon {
  background: url(../assets/images/node_icon.png) no-repeat center center !important;
}
</style>

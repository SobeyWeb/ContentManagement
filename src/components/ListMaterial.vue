<template>
  <div class="list_material_content clearfix" :class="[material.type, material.clipping ? 'material_clipping' : '', 'list_material_bgcolor' + index%2, material.selected ? 'material_selected' : '', material.dragOvering ? 'material_dragOver' : '']" :style="{width: headerWidth+'px'}" :draggable="material.selected&&!material.renaming&&(material.operations.some(function(item){return ['Cut', 'Copy', 'Delete'].indexOf(item)>-1})||isPremiere)" @dblclick="dblclick" @dragstart.stop="dragStart" @dragend.stop="dragEnd" @mousedown.stop.capture="mousedown" @mouseup="mouseup" @contextmenu.stop.prevent="contextMenu" @drop.stop.prevent="drop" @dragover.stop.prevent="dragover" @dragenter.prevent="dragenter" @dragleave.prevent="dragleave" :data-id="material.guid">
    <div v-on:mousemove="mousemove" class="list_material_icon_container fl" :class="material.cutting ? 'material_cutting' : ''">
      <div class="material_status list_material_status">
        <div v-if="material.type =='video'">
          <span class="list_status_item hq" :class="{hq1:!material.HQ}"></span>
          <span class="list_status_item lq" :class="{lq1:!material.LQ}"></span>
          <span class="list_status_item i" :class="{i1:!material.I}" :title="material.Ititle" v-if="material.I &&!material.isAudio"></span>
          <span class="list_status_item p" :class="{p1:!material.P}" :title="material.Ptitle" v-else-if="!material.isAudio"></span>
          <span class="list_status_item wa" :class="{wa1:!material.WA}" v-if="!material.isAudio"></span>
          <span class="list_status_item db" :class="{db1:!material.DB}" v-if="!material.isAudio"></span>
          <span class="list_status_item online" :class="{online1:material.onlinstatus != 'Online'}" v-if="material.father.guid"></span>
        </div>
      </div>
      <div class="list_material_clipping" v-if="material.clipping"></div>

      <img draggable="false" class="list_material_icon_img drag_icon" :class="{Videodefault:material.type == 'video',fullscreen:(material.is16_9sd && material.type == 'video')}" @load="getImginfo($event,material)" v-if="material.iconfilename" :src="material.iconfilename" @error="imageLoadError">
      <span class="list_material_icon_span drag_icon" :class="[material.icon, material.bgtype]" v-else></span>
      <!--img draggable="false" v-if="material.type =='video'&&!material.isAudio" class="preview_img" :src="material.previewicon" :style="{top:top+'px'}">
          <div draggable="false" v-if="material.type =='video'&&!material.isAudio" class="preview_cell" :style="{left:left+'px'}"></div-->
      <div class="material_more_icon" @click="more"></div>
    </div>
    <!--div class="list_material_info fl"><span :title="material.name">{{material.name}}</span></div-->
    <div class="list_material_attr fl" :key="header.name" v-for="header in headers" :style="{width: header.width + 'px'}">
      <span class="list_material_name_span" v-if="!material.renaming||header.attr!='name'" :title="material[header.attr]" v-html="header.attr==='name'&&showSearch?material[header.attr].replace(regExp, search?'<mark>$&</mark>':'$&'):isHighLight &&material[[header.attr]+'_hl']&& material[header.attr] === material[[header.attr]+'_hl'].replace(/<[^>]+>/g, '') ? material[[header.attr]+'_hl'] : material[[header.attr]]"></span>
      <input class="rename_input" v-focus :val="material.name" maxlength="255" v-if="material.renaming&&header.attr=='name'" type="text" @keyup="volidInput" @keydown.enter.stop="rename" @blur.stop.prevent="rename" @dblclick.stop @contextmenu.stop @dragstart.stop.prevent @mousedown.stop @keydown.tab.prevent/>
    </div>
    <div class="material_progress_container" v-if="material.uploading">
      <rd-progress :progress="progressData"></rd-progress>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import APPSETTING from '../config/appSetting.js'
import { getRepository } from '../data/repository'
import $ from 'jquery'
export default {
  props: {
    data: Object,
    index: Number
  },
  data: function () {
    return {
      nostampUrl: require('../assets/images/nostamp.png'),
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
        if (this.material.operations.indexOf('Upload') === -1) {
          util.Notice.warning('Can not upload clip to this folder', '', 3000)
          return
        }
        if (event.dataTransfer.files.length > 0) {
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
      var children
      if (event.button !== 0 || this.dragSymbol) {
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
    mousemove (event) {
      var x1 = event.x
      var x2 = $(event.target).offset().left
      var offset = Math.floor((x1 - x2) / 15)
      this.left = x1 - x2
      this.top = -84.5 * offset
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
      this.$store.state.previewDragSymbol = true
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
      var dragEle = this.$el.querySelector('.drag_icon')
      event.dataTransfer.setDragImage(dragEle, dragEle.clientWidth / 2, dragEle.clientHeight / 2)
      if (event.ctrlKey) {
        event.dataTransfer.dropEffect = 'copy'
        event.dataTransfer.effectAllowed = 'copy'
      } else {
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.effectAllowed = 'move'
      }
      // for premiere
      if (this.$store.state.system) {
        event.dataTransfer.dropEffect = 'copy'
        event.dataTransfer.effectAllowed = 'copy'
        window.parent.postMessage({
          type: 'dragStart',
          data: this.$store.getters.selectedMaterialsInfo,
          auth: this.$store.state.userInfo
        }, '*')
        var isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')
        var i = 0
        var _this = this
        // if (false) { //插件采用以前的方式拖拽上bin
        //   this.$store.state.selectedMaterials.forEach((item, index) => {
        //     var port = (document.location.protocol == "https:") ? 9065 : 9064,
        //       url = document.location.protocol + '//localhost:' + port + '/getFcpClipXml',
        //       type,
        //       path = isWin ? 'C:\\\\\ProgramData\\Temp\\' + Guid.NewGuid().ToString("N") + '.xml' : '/Volumes/Temp/' + Guid.NewGuid().ToString("N") + '.xml'
        //     if (item.typeid === 64) { //edl
        //       type = 'pgmDragStart'
        //     } else if ([8192, 536870912, 2147483648].indexOf(item.subtype) > -1 && item.typeid === 32) { // txt project
        //       var extName = '.prproj'
        //       if (item.subtype === 8192) {
        //         type = 'txtDragStart'
        //         extName = '.txt'
        //       } else {
        //         type = 'projectDragStart'
        //         if (item.subtype == 2147483648) {
        //           extName = '.aep'
        //         }
        //       }
        //       path = isWin ? 'C:\\\\\ProgramData\\Temp\\' + Guid.NewGuid().ToString("N") + extName : '/Volumes/Temp/' + Guid.NewGuid().ToString("N") + extName
        //       url = document.location.protocol + '//localhost:' + port + '/getFilePath'
        //     } else {
        //       type = 'clipDragStart'
        //     }
        //     event.dataTransfer.setData("com.adobe.cep.dnd.file." + index, path);
        //     $.ajax({
        //       type: "post",
        //       url: url,
        //       data: {
        //         type: item.typeid,
        //         usertoken: _userToken,
        //         contentid: item.guid,
        //         path: path,
        //         system: isWin ? 'Windows' : 'Mac'
        //       },
        //       dataType: "json",
        //       async: true,
        //       success: function (data) {
        //         if (data.ext) {
        //           window.parent.postMessage({
        //             type: type,
        //             data: {
        //               name: item.name,
        //               guid: item.guid,
        //               type: item.type,
        //               path: item.path,
        //               subtype: item.subtype,
        //               typeid: item.typeid
        //             },
        //             ext: data.ext,
        //             auth: _this.$store.state.userInfo,
        //           }, '*')
        //         }
        //       },
        //     })
        //   })
        // } else {
        this.$store.state.selectedMaterials.forEach((item, index) => {
          var url,
            type
          if (item.typeid === 64) { // edl
            url = util.getUrl(APPSETTING.CMAPI + (isWin ? '/CMApi/api/entity/program/getjovexmlpath' : '/CMApi/api/entity/program/getjovexmlpathformac'), {
              userToken: _this.userInfo.usertoken,
              guid: item.guid
            })
            type = 'pgmDragStart'
          } else if ([8192, 536870912, 2147483648].indexOf(item.subtype) > -1 && item.typeid === 32) { // txt project
            url = util.getUrl(APPSETTING.CMAPI + (isWin ? '/CMApi/api/entity/program/getfilephysicalpath' : '/CMApi/api/entity/program/getfilephysicalpathformac'), {
              userToken: _this.userInfo.usertoken,
              guid: item.guid
            })
            if (item.subtype === 8192) {
              type = 'txtDragStart'
            } else {
              type = 'projectDragStart'
            }
          } else {
            url = util.getUrl(APPSETTING.CMAPI + (isWin ? '/CMApi/api/entity/program/getfcp7xmlpath' : '/CMApi/api/entity/program/getfcp7xmlpathformac'), {
              userToken: _this.userInfo.usertoken,
              guid: item.guid
            })
            type = 'clipDragStart'
          }
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
                window.parent.postMessage({
                  type: type,
                  data: {
                    name: item.name,
                    guid: item.guid,
                    type: item.type,
                    path: item.path,
                    subtype: item.subtype,
                    typeid: item.typeid
                  },
                  ext: res.ext,
                  auth: _this.$store.state.userInfo
                }, '*')
                if (item.typeid === 64 || type === 'clipDragStart') {
                  event.dataTransfer.setData('com.adobe.cep.dnd.file.' + i, isWin ? res.ext.xmlpath : util.convertPath4Mac(res.ext.xmlpath))
                  i++
                } else if (item.typeid === 32 && [8192, 536870912, 2147483648].indexOf(item.subtype) > -1) {
                  var clips = res.ext
                  clips && clips.forEach && clips.forEach(c => {
                    event.dataTransfer.setData('com.adobe.cep.dnd.file.' + i, c)
                    i++
                  })
                }
              }
            }
          })
        })
        //  }
      }
    },
    dragEnd (event) {
      this.$store.state.previewDragSymbol = false
    },
    volidInput (event) {
      util.volidInput(event.target.value, 255, event.target)
    },
    rename: util.throttle(50, function (event) {
      this.material.guid = this.material._guid || this.material.guid
      // 验证名字  未验证特殊字符
      event.target.value = util.volidInput(event.target.value, 255, event.target).trim()
      if (this.material.renaming) {
        if (this.material.type === 'folder' && getRepository(this.material.father.guid).some(item => item.name === event.target.value && item.guid !== this.material.guid && item.type === 'folder')) {
          util.Notice.warning(
            'Rename Folder',
            'has same name', 3000)
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
            // util.Notice.success('rename success', 'msg', 3000)
          }).catch(res => {
            this.$store.commit({
              type: TYPES.RECOVERY_EVENT,
              symbol: symbol
            })
            util.Notice.failed('Failed to rename obejct', '', 3000)
          })
          this.material.path = this.material.folderpath + '/' + this.material.name
        }
      }
    }, true),
    contextMenu (event) {
      if (!this.material.selected) {
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
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          event: event,
          status: true
        }
      })
    }
  },
  computed: {
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
      return this.$store.state.system
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
    dragSymbol () {
      return this.$store.state.dragSymbol
    },
    material () {
      return this.data
    },
    editor () {
      return this.$store.state.editor
    },
    headers () {
      return this.$store.state.headers.filter(item => item.checked)
    },
    headerWidth () {
      return this.headers.reduce((item1, item2) => {
        return {
          width: item1.width + item2.width
        }
      }).width + 92
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list_material_icon_container,
.list_material_info,
.list_material_attr {
  width: 200px;
  height: 51px;
  position: relative;
  line-height: 51px;
  text-align: center;
  text-overflow: ellipsis;
  box-shadow: -1px 0px 0 0px #1b1b1b;
  -webkit-box-shadow: -1px 0px 0 0px #1b1b1b;
  box-sizing: border-box;
  overflow: hidden;
}

.list_material_icon_container {
  height: 51px;
  line-height: 51px;
  text-align: center;
  background: #2e2e2e;
  width: 90px;
}
.list_material_icon_span.folder {
  background: url(../assets/images/folder.png) no-repeat center center;
}
.list_material_icon_span.uploading {
  background: url(../assets/images/uploading.png) no-repeat center center;
}
.list_material_icon_span.audio {
  background: url(../assets/images/audio.png) no-repeat center center;
}
.list_material_icon_span.video {
  background: url(../assets/images/video.png) no-repeat center center;
}
.list_material_icon_span.h5pgm {
  background: url(../assets/images/h5pgm.png) no-repeat center center;
}
.list_material_icon_span.sequence {
  background: url(../assets/images/sequence.png) no-repeat center center;
}
.list_material_icon_span.image {
  background: url(../assets/images/image.png) no-repeat center center;
}
.list_material_icon_span.txtfile {
  background: url(../assets/images/txtfile.png) no-repeat center center;
}
.list_material_icon_span.word {
  background: url(../assets/images/word.png) no-repeat center center;
}
.list_material_icon_span.ppt {
  background: url(../assets/images/ppt.png) no-repeat center center;
}
.list_material_icon_span.excel {
  background: url(../assets/images/excel.png) no-repeat center center;
}
.list_material_icon_span.pdf {
  background: url(../assets/images/pdf.png) no-repeat center center;
}
.list_material_icon_span.project {
  background: url(../assets/images/project.png) no-repeat center center;
}
.list_material_icon_span.other {
  background: url(../assets/images/other.png) no-repeat center center;
}
.list_material_icon_span.rar {
  background: url(../assets/images/rar.png) no-repeat center center;
}
.list_material_icon_container .node_icon {
  background: url(../assets/images/node_icon.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .my_clip_icon {
  background: url(../assets/images/myclip_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .this_week_icon {
  background: url(../assets/images/week_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .transhcan_icon {
  background: url(../assets/images/trashcan_icon.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .today_icon {
  background: url(../assets/images/today_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.material_progress_container {
  position: absolute;
  width: 100%;
}

.list_material_icon_container .list_material_icon_img {
  max-width: 90px;
  max-height: 51px;
  vertical-align: middle;
}

.list_material_icon_container .fullscreen {
  /*width: 116px;*/
  width: 100%;
}

.list_material_icon_container .imaxvideo {
  height: 100%;
}

.list_material_icon_span {
  width: 90px;
  height: 51px;
  vertical-align: middle;
  display: inline-block;
  background-size: contain !important;
}

.list_material_content {
  white-space: nowrap;
  border: 1px solid transparent;
  box-sizing: border-box;
  height: 51px;
  background: #262626;
  margin-bottom: 1px;
  position: relative;
}

.list_material_bgcolor0 {
  background: #2e2e2e;
}

.list_material_content:hover {
  border: 1px solid #f89b39;
}

.list_material_content:hover .material_more_icon {
  display: block;
}

.list_material_content.material_selected {
  background: #ab916a;
}

.list_material_content.material_dragOver {
  border: 1px solid rgba(149, 149, 149, 0.5);
}

.list_material_content .material_cutting {
  opacity: 0.5;
}
.list_material_icon_container .node_icon {
  background: url(../assets/images/node_icon.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .my_clip_icon {
  background: url(../assets/images/myclip_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .this_week_icon {
  background: url(../assets/images/week_big.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .transhcan_icon {
  background: url(../assets/images/trashcan_icon.png) no-repeat center center !important;
  background-size: contain !important;
}

.list_material_icon_container .today_icon {
  background: url(../assets/images/today_big.png) no-repeat center center !important;
  background-size: contain !important;
}
</style>

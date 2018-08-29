<template>
  <div :class="{plug_style: isPremiere}" @click.capture="hideMenu" @contextmenu="hideMenu" @mousedown="hideMenu" @selectstart.stop.prevent @mouseup="dragEnd" @mousewheel.ctrl="scaleThumb" @mousemove="resizing">
    <div class="fullScreen_container" v-show="fullscreenSymbol">
      <div class="auto_center"></div>
    </div>
    <input class="upload_input" type="file" @change="upload" multiple="multiple" />
    <input class="copy_input" type="text" />
    <advance-search ref="advanceSearch"></advance-search>
    <publish-to-sns ref="publishtoSNS"></publish-to-sns>
    <regiter-tooa-ctrl ref="registerToOA"></regiter-tooa-ctrl>
    <rd-modal></rd-modal>
    <rd-notification></rd-notification>
    <rd-loadingbar></rd-loadingbar>
    <rd-preview></rd-preview>
    <menu-ctrl ref="menu"></menu-ctrl>
    <!--left block-->
    <div class="left_container" :class="{transition:!resizeSymbol}" :style="{left:(folderBlockStatus?0:- leftTreeWidth)+'px', width: leftTreeWidth + 'px'}">
      <div class="resize_handle" @mousedown.stop.prevent.capture="resizeMousedown"></div>
      <div class="logo_box">
        <span>Content Management</span>
      </div>
      <!--div class="folder_box"-->
      <vue-nice-scrollbar class="folder_box" id="folder_box" :class="{focused: isFocusTree}" :speed="150">
        <div class='folder_base fl' style="position: relative;" @mousedown.capture="focusIndex = 0">
          <quick-link :data="node" v-for="node in linkNodes" :key="node.name"></quick-link>
          <folder-tree :data="node" v-for="node in folderTree" :key="node.guid"></folder-tree>
        </div>
      </vue-nice-scrollbar>
      <!--/div-->
      <user-space></user-space>
    </div>
    <div id="stage_wrapper" class="right_container" :class="{transition:!resizeSymbol}" :style="{left:(folderBlockStatus?leftTreeWidth:0)+'px'}">
      <div class="top_box">
        <span class="tree_icon mt15" :class="{tree_icon_disabled:!folderBlockStatus}" v-on:click="toggleFolderBlock" :title="'Toggle Folder Page'"></span>
        <div id="div_fullTextSearch">
          <fulltext-search></fulltext-search>
        </div>
        <input type="button" class="advance_search" v-on:click="openAdvanceSearch" :value="'Advance Search'" />
        <input type="button" class="task_monitor" :value="'Task Monitor'" v-on:click="taskMonitor" />
        <input type="button" class="task_monitor" :value="'Web Quick Editing'" v-on:click="gotoJove" v-show="!isPremiere" />
        <input type="button" v-if="false" class="task_monitor" value="Order List" v-on:click="oderList" @drop.prevent="add2OderList" @dragenter.prevent @dragover.prevent="dragover" @dragleave.prevent/>
        <div class="fr">
          <div class="hidden_bar">
            <span class="xx_icon fr" v-show="false" @click="localTaskStatus = !localTaskStatus">
              <transition name="fade">
                <div v-show="localTaskStatus" @click.stop class="local_task_container">
                  <div class="triangle_top local_task"></div>
                  <!--task-monitor-ctrl></task-monitor-ctrl-->
                  <!--local-task-ctrl></local-task-ctrl-->
                </div>
              </transition>
            </span>
            <span class="xx_icon fr" v-on:click="userOperationStatus = !userOperationStatus">
              <transition name="fade">
                <div v-show="userOperationStatus" style="display: none;">
                  <div class="triangle_top user_operation"></div>
                  <ul class="operation_box user_operation">
                    <li class="operation_item" v-on:mousedown.stop="logout">Logout</li>
                    <!--li class="operation_item">{{dict.help}}</li-->
                  </ul>
                </div>
              </transition>
            </span>
            <span class="username_show">{{userInfo.nickname}}</span>
            <!-- <span class="tree_icon mt15" :class="{tree_icon_disabled:!folderBlockStatus}" v-on:click="toggleFolderBlock" :title="dict.toggleFolder"></span> -->
          </div>
        </div>
      </div>
      <div id="resourceList" ref="resource" class="materials_container" :style="{right: previewSymbol? '640px':'0',bottom: workspaceSymbol?'300px':0}" @contextmenu.prevent.stop="contextMenu" @drop.prevent="onDrop" @dragenter.prevent @dragover.prevent="dragover" @dragleave.prevent @mousedown.capture="focusMaterialList">
        <div class="toolbar_box" @contextmenu.prevent.stop @drop.stop.prevent @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent @mousedown.stop @mouseup.prevent>
          <nav-path></nav-path>
          <div class="materials_count fr">
            <span class="text_nomarl">Items</span>
            <span class="text_strong">{{materialsCount}}</span>
            <div v-if="currentCtrl!=='marker-ctrl'" class="fr" style="display:inline-block;">
              <span class="list_icon" :class="{list_icon_active:listSymbol}" v-on:click="switchListThumb(true)" :title="'List Model'"></span>
              <span class="thumbnail_icon" :class="{thumbnail_icon_active:!listSymbol}" v-on:click="switchListThumb(false)" :title="'Thumbnail Mode'"></span>
              <span class="sortby_icon" v-show="!listSymbol" v-on:click="sortByStatus = !sortByStatus" :title="'Sort'">
                <transition name="fade">
                  <div class="menu_box" v-show="sortByStatus" style="display: none;">
                    <div class="triangle_top sort_by"></div>
                    <ul class="operation_box sort_by">
                      <li class="operation_item" v-on:click.stop="orderBy('title', true)">{{'Title' + ' ↑'}}</li>
                      <li class="operation_item" v-on:click.stop="orderBy('title', false)">{{'Title' + ' ↓'}}</li>
                      <li class="operation_item" v-on:click.stop="orderBy('createTime', true)">{{'Create Time' + ' ↑'}}</li>
                      <li class="operation_item" v-on:click.stop="orderBy('createTime', false)">{{'Create Time' + ' ↓'}}</li>
                      <li class="operation_item" v-on:click.stop="orderBy('type')">{{'Type'}}</li>
                    </ul>
                  </div>
                </transition>
              </span>
            </div>
            <div v-else-if="languageOption.options.length" class="fr" style="display:inline-block;margin: 0px 10px 0px 10px;height: 39px">
              <rd-select :select="languageOption" @change="changeAction"></rd-select>
            </div>
            <span class="refresh_icon" v-on:click="refreshMaterial" :title="'Refresh'"></span>
            <span class="search_panel_icon fr" v-on:click="isShowSearchReuslt=!isShowSearchReuslt" :class={search_panel_icon_active:isShowSearchReuslt} v-show="currentNode.bakCondition" title="Toggle Search Conditon Panel"></span>
            <!-- <span style="width:30px;height:20px;display:inline-block;outline: 1px solid red;float:right;cursor:pointer;" @click="openSearchResul"></span> -->
          </div>
        </div>
        <transition name="fade">
          <div class="condition_display_container clearfix animated2" v-if="currentNode.bakCondition&&isShowSearchReuslt" :class="{slideInDown:currentNode.bakCondition&&isShowSearchReuslt,slideOutUp:!(currentNode.bakCondition&&isShowSearchReuslt)}" @contextmenu.prevent.stop @drop.stop.prevent @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent @mousedown.stop @mouseup.prevent>
            <div class="display_condition_box" v-if="searchType===1">
              <div class="content_filter_container">
                <span class="display_keyword_span display_advance_span">Search Type</span>
                <input class="display_keyword_input boolean_input" readonly type="text" v-model="advanceHeader.name" :title="advanceHeader.name" />
              </div>
              <div class="content_filter_container">
                <span class="display_keyword_span display_advance_span">Search Condition</span>
                <input class="display_keyword_input boolean_input" readonly type="text" v-model="advanceCondition" style="width: calc(100% - 220px);" />
              </div>
            </div>
            <div class="display_condition_box clearfix" v-else>
              <div class="content_filter_container" v-if="searchType===2">
                <span class="display_keyword_span">Keywords</span>
                <input class="display_keyword_input boolean_input" type="text" v-model="currentNode.bakCondition.keywords" @keydown.enter="reSearch" />
              </div>
              <div class="content_filter_container clearfix">
                <div class="display_filter_text">Time</div>
                <div class="display_filter_items clearfix" :style="{left: condtionLeft, paddingRight:condtionLeft}">
                  <span class="check_span fl" :class="{checked_span: time.checked}" @click.stop="timeFilter(time)" v-for="time in currentNode.bakCondition.timeFilter" :key="time.name">{{time.name}}</span>
                </div>
              </div>
              <div class="content_filter_container clearfix">
                <div class="display_filter_text">Content</div>
                <div class="display_filter_items clearfix" :style="{left: condtionLeft, paddingRight:condtionLeft}">
                  <span class="check_span fl" :class="{checked_span: type.checked}" @click.stop="typeFilter(type)" v-for="type in currentNode.bakCondition.typeFilter" :key="type.name">{{type.name}}</span>
                </div>
              </div>
              <div class="display_boolean_item fl" v-for="c in currentNode.bakCondition.booleanCondition" :key="c.name" v-if="searchType===3">
                <span class="boolean_span">{{c.name}}</span>
                <input class="boolean_input" type="text" v-model="c.value" @keydown.enter="reSearch" />
              </div>
            </div>
            <div class="dispplay_btn_box">
              <span class="display_excute_btn display_btn" v-show="searchType!==1" title="Research" @click.prevent="reSearch"></span>
              <span class="display_modify_btn display_btn" v-show="searchType===1" title="Modify search condition" @click.prevent="modifySeachCondition"></span>
              <span class="display_save_btn display_btn" title="Save search template" @click.prevent="saveSeachCondition"></span>
            </div>
          </div>
        </transition>
        <div class="list_headers_box">
          <list-material-header v-show="listSymbol"></list-material-header>
        </div>
        <vue-nice-scrollbar class="scrollbar_container" :class="{focused: !isFocusTree, blur: loading}" :speed="150" @click="focusMaterialList">
          <div ref="materialBox" class="material_box clearfix" :class="{list_material_box:listSymbol, marker_material_box: currentCtrl=='marker-ctrl'}" :style="{marginLeft: thumbPadding + 'px', marginRight: thumbPadding + 'px'}" @click="focusMaterialList" @mousedown="dragStart">
            <div class="searchBox animated2" v-show="showSearch" :class="[showSearch?'zoomIn':'zoomOut']">
              <local-search :data="materials" :callback="searchCallback" @close="showSearch = false" />
              <span class="search_icon close fr" @click="showSearch = false"></span>
            </div>
            <div class="stand fl top_stand" :style="{height: stand.height + 'px', width:'100%', position: 'relative'}"></div>
            <component :is="currentCtrl" :data="m" :index="index" v-for="(m, index) in displayMaterials" :key="m.guid">
            </component>
            <div class="stand fl" :style="{height: stand.leftHeight + 'px', width:'100%', position: 'relative'}"></div>
            <div class="select_circle" :style="dragData" v-show="dragSymbol"></div>
            <div class="drag_bed" ref="dragBed" v-show="dragSymbol" @mousemove="dragging"></div>
          </div>
        </vue-nice-scrollbar>
        <loading-ctrl :name="'Loading...'" v-show="loading"></loading-ctrl>
        <div class="preview_switcher" :class="{arrow_left :previewSymbol}" @click="switchPreview" @dragenter.stop.prevent="openPreview" @dragover.stop.prevent @dragleave.stop.prevent @contextmenu.prevent.stop></div>
      </div>
      <div id="proppreviewDiv" :class="{dv_model_view: isDvModel}" :style="{right: previewSymbol? '0':'-640px'}" @mousedown.capture="focusePlayer">
        <player ref="player"></player>
        <div class="preview_drop_div" @drop="preview" @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent v-show="previewDragSymbol">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import { mapState, mapGetters } from 'vuex'
import KEYCODES from '../dicts/keycodes.js'
import KeyEvent from '../lib/KeyEvent.js'
import MATERIALTYPES from '../dicts/materialTypes.js'
import APPSETTING from '../config/appSetting.js'
import URLCONFIG from '../config/urlConfig.js'
import NODETYPES from '../dicts/guidMaps.js'
import ModalWindow from '../lib/ModalWindow.js'
import { defaultQuery, defaultFulltextSearchCondtion, defaultAdvanceSearchCondtion } from '../data/basicData.js'
import { SortLikeWin } from '../lib/sort.js'
import $ from 'jquery'

import AdvanceSearch from './AdvanceSearch/Index'
import FolderTree from './FolderTree'
import UserSpace from './UserSpace'
import QuickLink from './QuickLink'
import FulltextSearch from './FulltextSearch'
import NavPath from './NavPath'
import ListMaterialHeader from './ListMaterialHeader'
import LocalSearch from './LocalSearch'
import Player from './Player/Index'
import Material from './Material'
import ListMaterial from './ListMaterial'
import Marker from './Marker'
import Menu from './Menu'
import PublishToSNS from './PublishToSNS'
import registerToOA from './RegidterToOA/Index'

export default {
  name: 'AppIndex',
  components: {
    'advance-search': AdvanceSearch,
    'folder-tree': FolderTree,
    'quick-link': QuickLink,
    'user-space': UserSpace,
    'fulltext-search': FulltextSearch,
    'nav-path': NavPath,
    'list-material-header': ListMaterialHeader,
    'local-search': LocalSearch,
    'player': Player,
    'material': Material,
    'list-material': ListMaterial,
    'marker-ctrl': Marker,
    'menu-ctrl': Menu,
    'publish-to-sns': PublishToSNS,
    'regiter-tooa-ctrl': registerToOA
  },
  data () {
    return {
      tempIndex: 0,
      sortByStatus: false,
      userOperationStatus: false,
      previewSymbol: false,
      resizeSymbol: false,
      dragSymbol: false,
      folderBlockStatus: true,
      localTaskStatus: false,
      isShowSearchReuslt: true,
      workspaceSymbol: false,
      listSymbol: false,
      leftTreeWidth: 200,
      resizeX: 0,
      dragData: {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      },
      mousePosition: {
        x: 0,
        y: 0
      },
      languageOption: {
        value: {},
        options: []
      }
    }
  },
  computed: {
    ...mapState(['isDvModel', 'previewDragSymbol', 'bakCondition', 'userInfo', 'fullscreenSymbol', 'isAdvanceConfig', 'searchType', 'isMarker', 'linkNodes', 'player', 'showSearch', 'loading', 'thumbnailStyle', 'scaleTime', 'thumbPadding', 'signIndex', 'selectedMaterials', 'alwaysGet', 'trashcan']),
    ...mapGetters(['currentNode', 'selectedNode', 'searchResult', 'orderedSelectedMaterials', 'folderTree', 'isFocusTree', 'isFocusML', 'isFocusPlayer']),
    scaleTime: {
      get () {
        return this.$store.state.scaleTime
      },
      set (val) {
        this.$store.state.scaleTime = val
      }
    },
    focusIndex: {
      get () {
        return this.$store.state.focusIndex
      },
      set (val) {
        this.$store.state.focusIndex = val
      }
    },
    isPremiere () {
      return this.$store.state.system === 'PREMIEREPLUGIN'
    },
    searchNode: {
      get () {
        return this.$store.state.searchNode
      },
      set (val) {
        this.$store.state.searchNode = val
      }
    },
    currentCtrl () {
      if (this.isMarker) {
        return 'marker-ctrl'
      } else if (this.listSymbol) {
        return 'list-material'
      }
      return 'material'
    },
    materials () {
      return this.$store.getters.displayMaterials
    },
    stand () {
      return this.$store.getters.thumbDisplay
    },
    displayMaterials () {
      return this.materials.slice(this.stand.index, this.stand.index + this.stand.range)
    },
    materialsCount () {
      return this.materials.length
    }
  },
  watch: {
    isMarker (val) {
      if (val) {
        this.listSymbol = false
      }
    },
    displayMaterials (val) {
      this.$store.getters.currentNode.children = val // make it reactive
    }
  },
  methods: {
    dragging: util.throttle(50, function (event) {
      if (this.dragSymbol && event.target === this.$refs.dragBed) {
        if (this.listSymbol) {
          return
        }
        // var leftPadding = this.folderBlockStatus ? this.leftTreeWidth : 0 //右侧还未处理
        var x = Math.max(0, event.offsetX)
        var y = Math.max(0, event.offsetY)
        if (y > this.mousePosition.y) {
          this.$store.state.dragDirection = true
        } else {
          this.$store.state.dragDirection = false
        }
        var left,
          top,
          width,
          height
        left = Math.max(Math.min(this.mousePosition.x, x), 0)
        top = Math.max(Math.min(this.mousePosition.y, y), 0)
        width = Math.abs(Math.max(x, 0) - this.mousePosition.x)
        height = Math.abs(Math.max(y, 0) - this.mousePosition.y)
        this.dragData = {
          left: left + 'px',
          top: top + 'px',
          width: width + 'px',
          height: height + 'px'
        }
        var rect = (this.$refs.materialBox || document.querySelector('.material_box')).getBoundingClientRect()
        util.getCanSelectedItems(this.$store, {
          left: left,
          top: top,
          width: width,
          height: height
        }, rect.width, rect.height, event, this.mousePosition.scrollOffsetY, this.currentCtrl === 'marker-ctrl')
      }
    }),
    searchCallback (data) {
      if (data) {
        var index = this.materials.indexOf(data)
        this.$store.dispatch({
          type: TYPES.SELECT_MATERIAL,
          data: index
        })
      } else {
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
      }
    },
    dragStart (event) {
      if (event.which === 1) {
        this.mousePosition.x = event.offsetX
        this.mousePosition.y = event.offsetY
        this.mousePosition.scrollOffsetY = event.offsetY - event.y + 91 < 0 ? 0 : event.offsetY - event.y + 91
        this.dragSymbol = true
        if (!(event.ctrlKey || event.shiftKey)) {
          this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDITEMS
          })
          this.$store.commit({
            type: TYPES.SET_MENUSTATUS,
            data: {
              status: false
            }
          })
        }
      }
    },
    focusMaterialList (event) {
      this.focusIndex = 1
    },
    preview (event) {
      this.$store.dispatch({
        type: TYPES.PROPERTIES,
        target: this.$store.state.selectedMaterials
      })
    },
    switchPreview () {
      this.previewSymbol = !this.previewSymbol
      this.$nextTick(() => {
        this.$store.commit({
          type: TYPES.SET_THUMBPADDING
        })
      })
    },
    refreshMaterial () {
      this.$store.dispatch({
        type: TYPES.REFRESH_MATERIAL,
        source: this.$store.getters.currentNode
      }).then(() => {

      })
    },
    changeAction (select, value) {
      this.$store.state.lmLanguage = value.id
    },
    orderBy (type, symbol) {
      this.sortType = type
      if (symbol !== undefined) {
        this.sortSymbol = symbol
      } else {
        this.typeSymbol = !this.typeSymbol
      }
      this.$store.commit({
        type: TYPES.SET_SIGNMATERIAL,
        data: 0
      })
      this.setCookie()
    },
    switchListThumb (symbol) {
      if (this.materials.length > 0 && this.materials[0].type === 'marker') {
      } else {
        this.listSymbol = symbol
      }
    },
    onDrop (event) {
      var files = event.dataTransfer.files
      var arr = []
      // var fileTree = [];
      // var data = JSON.parse(event.dataTransfer.getData('test'))
      // var material = util.initData(data)
      // material.name = data.name
      // material.iconfilename = data.iconfilename
      // this.$store.getters.currentNode.children.push(material)
      // util.addFilesFromItems(event.dataTransfer.items, fileTree)
      // [].forEach.call(event.dataTransfer.items, i => util.scanFiles(i, fileTree))
      if (files && files.length) {
        this.$store.state.file = files[0]
        if (this.$store.getters.currentNode.operations.indexOf('Upload') === -1) {
          util.Notice.warning('can not upload in current folder', '', 3000)
          return
        }
        if (files.length > 300) {
          util.Notice.warning('The upload number exceeds the restriction of 300', '', 3000)
          return
        }
        if ([].every.call(files, item => this.blackList.indexOf(item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase()) > -1)) {
          util.Notice.warning('This format dose not support upload', '', 3000)
          return
        } else {
          var fiterFiles = [].filter.call(files, item => this.blackList.indexOf(item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase()) === -1)
          if (fiterFiles.length !== files.length) {
            util.Notice.warning('Some object(s) is failed to upload', '', 3000)
            files = fiterFiles
          }
        }
        this.$store.dispatch({
          type: TYPES.UPLOAD_FILES,
          data: {
            files: files
          }
        })
      } else {
        if (this.$store.getters.currentNode.operations.indexOf('Paste') === -1) {
          util.Notice.warning('can not paste in current folder', '', 3000)
          return
        }
        if (event.ctrlKey) {
          arr = this.$store.state.selectedMaterials
          util.Model.confirm('Copy', 'Are You Sure to Copy ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.COPY_MATERIALS,
                data: arr,
                target: this.$store.getters.currentNode
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
          if (arr.some(item => item.father === this.$store.getters.currentNode)) {
          } else {
            util.Model.confirm('Move', 'Are You Sure to Move ' + arr.length + ' Materials',
              () => {
                this.$store.dispatch({
                  type: TYPES.MOVE_MATERIALS,
                  data: arr,
                  target: this.$store.getters.currentNode
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
      }
    },
    dragover (event) {
      if (event.ctrlKey) {
        event.dataTransfer.effectAllowed = 'copy'
      } else {
        event.dataTransfer.effectAllowed = 'move'
      }
    },
    contextMenu (event) {
      this.$store.commit({
        type: TYPES.CLEAR_SELECTEEDITEMS
      })
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          event: event,
          status: true
        }
      })
    },
    logout () {
      var lo = () => {
        this.userOperationStatus = false
        this.$store.dispatch({
          type: TYPES.LOGOUT,
          data: {}
        }).then((re) => {
          window.location.href = '../../login.aspx'
        })
        this.$store.state.system && window.parent.postMessage({
          type: 'logout',
          data: null,
          auth: null
        }, '*')
      }
      if (Object.getOwnPropertySymbols(this.$store.state.eventArray).length > 0) {
        util.Model.confirm('Some Tasks Are Executing', 'Are You Sure to Logout', lo,
          () => {
          }, {
            large: true, // Boolean
            confirmButton: {
              show: true,
              type: 'primary',
              text: 'Confirm'
            },
            cancelButton: {
              show: true, // Boolean
              type: '', // String 请参考 Button
              text: 'Cancel' // String
            }
          })
      } else {
        lo()
      }
    },
    oderList () {
      if (APPSETTING.USEROOTPATH) {
        util.locateFolder(
          this.$store, this.$store.getters.orderList.path.split('/'), {
            children: this.$store.getters.folderTree
          }, {
            alwaysGet: this.$store.state.alwaysGet,
            isShowWaiting: true
          })
      } else {
        util.locateFolder(
          this.$store, this.$store.getters.orderList.path.split('/').slice(1), {
            children: this.$store.getters.folderTree
          }, {
            alwaysGet: this.$store.state.alwaysGet,
            isShowWaiting: true
          })
      }
    },
    gotoJove () {
      var url = util.getUrl(URLCONFIG.JOVE, {
        token: this.userInfo.usertoken,
        userCode: $.base64.encode(this.userInfo.usercode),
        FolderPath: $.base64.encode(this.$store.getters.currentNode.path),
        userid: $.base64.encode(this.userInfo.userid)
      })
      window.open(url, '_blank')
    },
    taskMonitor () {
      this.taskMonitorWindow.show()
    },
    openAdvanceSearch () {
      this.$store.state.advanceSearchWindow.show()
    },
    toggleFolderBlock () {
      this.folderBlockStatus = !this.folderBlockStatus
      this.$nextTick(() => {
        this.$store.commit({
          type: TYPES.SET_THUMBPADDING
        })
      })
    },
    upload (event) {
      var files = event.target.files
      if (files && files.length) {
        if (files.length > 300) {
          util.Notice.warning('The upload number exceeds the restriction of 300', '', 3000)
          event.target.value = ''
          return
        }
        if ([].every.call(files, item => this.blackList.indexOf(item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase()) > -1)) {
          util.Notice.warning('This format dose not support upload', '', 3000)
          event.target.value = ''
          return
        } else {
          var fiterFiles = [].filter.call(files, item => this.blackList.indexOf(item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase()) === -1)
          if (fiterFiles.length !== files.length) {
            util.Notice.warning('Some object(s) is failed to upload', '', 3000)
            files = fiterFiles
          }
        }
        this.$store.dispatch({
          type: TYPES.UPLOAD_FILES,
          data: {
            files: files
          }
        })
        event.target.value = ''
      }
    },
    resizeMousedown (event) {
      this.resizeSymbol = true
      this.resizeX = event.x
    },
    resizing: util.throttle(50, event => {
      if (this.resizeSymbol) {
        let width = this.leftTreeWidth + event.x - this.resizeX
        this.resizeX += Math.min(APPSETTING.MAXTREEWIDTH || 500, Math.max(APPSETTING.MINTREEWIDTH || 100, width)) - this.leftTreeWidth
        this.leftTreeWidth = Math.min(APPSETTING.MAXTREEWIDTH || 500, Math.max(APPSETTING.MINTREEWIDTH || 100, width))
        if (!this.leftTreeWidth) {
          this.folderBlockStatus = false
        } else {
          this.folderBlockStatus = true
        }
        this.$nextTick(() => {
          this.$store.commit({
            type: TYPES.SET_THUMBPADDING
          })
        })
      }
    }, true),
    scaleThumb () {
      event.preventDefault()
      if (this.currentCtrl === 'material-ctrl') {
        if (event.deltaY < 0) {
          this.scaleTime = Math.min(this.scaleTime + 0.05, 2.4)
        } else {
          this.scaleTime = Math.max(this.scaleTime - 0.05, 1)
        }
        util.setCookie('scale_time' + this.userInfo.usercode, this.scaleTime)
        this.$nextTick(() => {
          this.$store.commit({
            type: TYPES.SET_THUMBPADDING
          })
        })
      }
    },
    dragEnd () {
      this.dragSymbol = false
      this.resizeSymbol = false
      util.setCookie('leftWidth' + this.$store.state.userInfo.usercode, this.leftTreeWidth)
      this.mousePosition = {
        x: 0,
        y: 0
      }
      this.dragData = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      }
    },
    hideMenu () {
      this.userOperationStatus = this.sortByStatus = false
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          status: false
        }
      })
    },
    registerKeydown () {
      let keyEvents = []
      // f11
      keyEvents.push(new KeyEvent(KEYCODES.f11, {
        action: event => {
          event.preventDefault()
          util.enterFullscreen()
          this.player && this.player.calcWidth && this.player.calcWidth()
        }
      }))
      // ctrl + f
      keyEvents.push(new KeyEvent(KEYCODES.f, {
        ctrlKey: true,
        action: event => {
          event.preventDefault()
          this.showSearch = true
          this.$nextTick(() => {
            document.querySelector('.local_search_input').focus()
            document.querySelector('.local_search_input').select()
          })
        }
      }))
      // up
      keyEvents.push(new KeyEvent(KEYCODES.up, {
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.PREV_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            this.$store.dispatch({
              type: TYPES.SELECT_MATERIAL,
              data: this.signIndex - rowCount
            })
          }
        }
      }))
      // shift + up
      keyEvents.push(new KeyEvent(KEYCODES.up, {
        shiftKey: true,
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.PREV_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.commit({
              type: TYPES.CLEAR_SELECTEEDITEMS
            })
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex - rowCount
            })
          }
        }
      }))
      // ctrl + shift + up
      keyEvents.push(new KeyEvent(KEYCODES.up, {
        shiftKey: true,
        ctrlKey: true,
        action: event => {
          if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex - rowCount
            })
          }
        }
      }))
      // down
      keyEvents.push(new KeyEvent(KEYCODES.down, {
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.NEXT_ITEM,
              source: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            this.$store.dispatch({
              type: TYPES.SELECT_MATERIAL,
              data: this.signIndex + rowCount
            })
          }
        }
      }))
      // shift + down
      keyEvents.push(new KeyEvent(KEYCODES.down, {
        shiftKey: true,
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.NEXT_ITEM,
              source: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.commit({
              type: TYPES.CLEAR_SELECTEEDITEMS
            })
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex + rowCount
            })
          }
        }
      }))
      // ctrl + shift + down
      keyEvents.push(new KeyEvent(KEYCODES.down, {
        shiftKey: true,
        ctrlKey: true,
        action: event => {
          if (this.isMLEnable()) {
            let rowCount = this.getRowCount()
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex + rowCount
            })
          }
        }
      }))
      // right
      keyEvents.push(new KeyEvent(KEYCODES.right, {
        action: event => {
          if (this.isFocusTree) {
            this.$store.dispatch({
              type: TYPES.EXPAND_FOLDER,
              source: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            this.$store.dispatch({
              type: TYPES.SELECT_MATERIAL,
              data: this.signIndex + 1
            })
          }
        }
      }))
      // shift + right
      keyEvents.push(new KeyEvent(KEYCODES.right, {
        shiftKey: true,
        action: event => {
          if (this.isFocusTree) {
            this.$store.dispatch({
              type: TYPES.EXPAND_FOLDER,
              source: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.commit({
              type: TYPES.CLEAR_SELECTEEDITEMS
            })
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex + 1
            })
          }
        }
      }))
      // ctrl + shift + right
      keyEvents.push(new KeyEvent(KEYCODES.right, {
        shiftKey: true,
        ctrlKey: true,
        action: event => {
          if (this.isMLEnable()) {
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex + 1
            })
          }
        }
      }))
      // left
      keyEvents.push(new KeyEvent(KEYCODES.left, {
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.CLOSE_FOLDER,
              target: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            this.$store.dispatch({
              type: TYPES.SELECT_MATERIAL,
              data: this.signIndex - 1
            })
          }
        }
      }))
      // shift + left
      keyEvents.push(new KeyEvent(KEYCODES.left, {
        shiftKey: true,
        action: event => {
          if (this.isFocusTree) {
            this.$store.commit({
              type: TYPES.CLOSE_FOLDER,
              target: this.selectedNode
            })
          } else if (this.isMLEnable()) {
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.commit({
              type: TYPES.CLEAR_SELECTEEDITEMS
            })
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex - 1
            })
          }
        }
      }))
      // ctrl + shift + left
      keyEvents.push(new KeyEvent(KEYCODES.left, {
        shiftKey: true,
        ctrlKey: true,
        action: event => {
          if (this.isMLEnable()) {
            let selectedMaterials = this.orderedSelectedMaterials
            if (!selectedMaterials.length) {
              this.tempIndex = this.signIndex
            } else {
              this.tempIndex = this.materials.indexOf(selectedMaterials[0])
            }
            this.$store.dispatch({
              type: TYPES.MULTI_SELECTITEMS,
              data: this.tempIndex - 1
            })
          }
        }
      }))
      // enter
      keyEvents.push(new KeyEvent([KEYCODES.enter, KEYCODES.enter_num], {
        action: event => {
          if (this.isFocusTree) {
            this.$store.dispatch({
              type: TYPES.NODE_CLICK,
              data: {
                target: this.selectedNode
              }
            })
          } else if (this.isFocusPlayer) {
          } else if (this.isMLEnable()) {
            if (this.selectedMaterials.length && this.selectedMaterials[0].type === MATERIALTYPES.FOLDER) {
              this.$store.dispatch({
                type: TYPES.OPEN_FOLDER,
                target: this.selectedMaterials
              })
            } else {
              this.$store.dispatch({
                type: TYPES.PROPERTIES,
                target: this.selectedMaterials
              })
            }
          }
        }
      }))
      // backspace
      keyEvents.push(new KeyEvent(KEYCODES.backspace, {
        action: (event) => {
          let last = this.currentNode.father
          if (last && this.isMLEnable()) {
            if (APPSETTING.USEROOTPATH) {
              util.locateFolder(
                this.$store,
                last.path.split('/'),
                {
                  children: this.folderTree
                },
                {
                  alwaysGet: this.alwaysGet,
                  isShowWaiting: true
                }
              )
            } else {
              util.locateFolder(
                this.$store,
                last.path.split('/').slice(1),
                {
                  children: this.folderTree
                },
                {
                  alwaysGet: this.alwaysGet,
                  isShowWaiting: true
                }
              )
            }
          }
        }
      }))
      // ctrl + x
      keyEvents.push(new KeyEvent(KEYCODES.x, {
        ctrl: true,
        action: event => {
          this.$store.dispatch({
            type: TYPES.CUT
          })
        }
      }))
      // ctrl + v
      keyEvents.push(new KeyEvent(KEYCODES.v, {
        ctrlKey: true,
        action: event => {
          this.$store.dispatch({
            type: TYPES.PASTE
          })
        }
      }))
      // ctrl + a
      keyEvents.push(new KeyEvent(KEYCODES.a, {
        ctrlKey: true,
        action: event => {
          this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDITEMS
          })
          this.materials.forEach(item => {
            item.selected = true
            this.$store.commit({
              type: TYPES.ADD_SELECTEDITEM,
              data: item
            })
          })
        }
      }))
      // ctrl + c
      keyEvents.push(new KeyEvent(KEYCODES.c, {
        ctrl: true,
        action: event => {
          this.$store.dispatch({
            type: TYPES.COPY,
            target: this.selectedMaterials
          })
        }
      }))
      // f2
      keyEvents.push(new KeyEvent(KEYCODES.f2, {
        action: event => {
          this.$store.dispatch({
            type: TYPES.DISPATCH_RENAME,
            target: this.selectedMaterials
          })
        }
      }))
      // delete
      keyEvents.push(new KeyEvent(KEYCODES.delete, {
        ctrl: true,
        action: event => {
          this.$store.dispatch({
            type: TYPES.DELETE_MATERIALS,
            target: this.selectedMaterials
          })
        }
      }))
      // tab
      keyEvents.push(new KeyEvent(KEYCODES.tab, {
        action: event => {
          if (this.previewSymbol) {
            this.focusIndex = this.focusIndex++ % 3
          } else {
            this.focusIndex = (this.focusIndex++ % 2) // bug in focusIndex === 2
          }
          this.$store.commit({
            type: TYPES.SET_MENUSTATUS,
            data: {
              status: false
            }
          })
          this.isFocusTree && this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDITEMS
          })
          this.isFocusML && this.$store.dispatch({
            type: TYPES.SELECT_MATERIAL,
            data: this.signIndex
          })
        }
      }))
      // ctrl + 0
      keyEvents.push(new KeyEvent([KEYCODES.zero, KEYCODES.zero_num], {
        ctrl: true,
        action: event => {
          this.scaleTime = 1
          util.setCookie('scale_time' + this.userInfo.usercode, this.scaleTime)
          this.$nextTick(() => {
            this.$store.commit({
              type: TYPES.SET_THUMBPADDING
            })
          })
        }
      }))
      // register shortcut
      this.$keydown.on(/keydown-\d+/g, event => {
        let keycode = event.keycode
        let events = keyEvents.filter(item => item.keycodes.includes(keycode) && event.ctrlKey === item.ctrlKey && event.shiftKey === item.shiftKey && event.metaKey === item.metaKey)
        if (events.length) {
          events.forEach(item => item.action(event))
        } else if (this.isMLEnable()) {
          // quick find material
          if (keycode < 112 || keycode > 123) {
            let word = String.fromCharCode(keycode >= 96 && keycode <= 106 ? keycode - 48 : keycode)
            let queryArr = this.materials.filter(item => item.name.startsWith(word) || item.name.startsWith(word.toUpperCase()))
            if (queryArr.length) {
              let material
              let lastSelectedArr = queryArr.filter(item => item.selected)
              if (lastSelectedArr) { // get the last selected material
                let lastSelected = lastSelectedArr[lastSelectedArr.length - 1]
                let index = queryArr.lastIndexOf(lastSelected) < queryArr.length - 1 ? queryArr.lastIndexOf(lastSelected) + 1 : 0
                material = queryArr[index]
              } else {
                material = queryArr[0]
              }
              this.$store.commit({
                type: TYPES.CLEAR_SELECTEEDITEMS
              })
              material.selected = true
              this.$store.commit({
                type: TYPES.ADD_SELECTEDITEM,
                data: material
              })
              this.$store.commit({
                type: TYPES.SET_SIGNMATERIAL,
                data: this.materials.indexOf(material)
              })
            }
          }
        }
      })
    },
    registerKeyup (code, func) {
      this.$keydown.on('keyup-' + code, func)
    },
    isMLEnable () {
      return this.isFocusML && !this.loading
    },
    getRowCount () {
      let rect = (this.$refs.materialBox || document.querySelector('.material_box')).getBoundingClientRect()
      let itemWidth = this.thumbnailStyle.width * this.scaleTime + 2 * this.thumbPadding
      let rowCount = Math.round((rect.width - 2 * this.$store.state.thumbPadding) / itemWidth)
      if (this.listSymbol) {
        rowCount = 1
      } else if (this.currentCtrl === 'marker-ctrl') {
        rowCount = Math.floor((rect.width) / 462) // 462 为marker 的宽度
      }
      return rowCount
    },
    locateFolder (lastVisit) {
      return new Promise((resolve, reject) => {
        switch (lastVisit.guid) {
          case NODETYPES.SEARCH_RESULT:
            if (lastVisit.condition) {
              this.searchResult.condition = lastVisit.condition
              this.searchResult.bakCondition = JSON.parse(JSON.stringify(lastVisit.condition))
              this.searchNode = this.currentNode
              this.searchType = lastVisit.condition.type
              this.$store.dispatch({
                type: TYPES.GET_SEARCHRESULT,
                source: this.searchResult
              }).then(() => {
                this.$store.commit({
                  type: TYPES.GET_NAVPATH,
                  target: this.searchResult,
                  data: []
                })
                resolve()
              }).catch(err => reject(err))
            }
            break
          case NODETYPES.SEARCH_TEMPLATE:
            // get search templates
            this.$store.dispatch({
              type: TYPES.GET_SEARCHMODEL,
              source: this.searchResult
            }).then(() => {
              this.$store.commit({
                type: TYPES.TOGGLE_FOLDER,
                target: this.searchResult
              })
              var node = this.searchResult.searchModel.find(item => item.templateId === lastVisit.templateId)
              if (node) {
                // get search result
                this.$store.dispatch({
                  type: TYPES.GET_SEARCHRESULT,
                  source: node
                }).then(() => {
                  this.$store.commit({
                    type: TYPES.GET_NAVPATH,
                    target: node,
                    data: []
                  })
                  resolve()
                }).catch(err => reject(err))
              } else {
                this.$store.commit({
                  type: TYPES.GET_NAVPATH,
                  target: this.searchResult,
                  data: []
                })
                reject(new Error('search template doesn`t exist'))
              }
            }).catch(err => reject(err))
            break
          case NODETYPES.FAVORITE:
            //
            break
          case NODETYPES.TRASHCAN:
            this.$store.dispatch({
              type: TYPES.GET_MATERIALS,
              source: this.nodes[0]
            }).then(() => {
              this.$store.commit({
                type: TYPES.EXPAND_FOLDER,
                target: this.nodes[0],
                data: []
              })
              this.$store.dispatch({
                type: TYPES.GET_TRASHCAN_OBJECTS,
                source: this.trashcan
              }).then(() => {
                this.$store.commit({
                  type: TYPES.GET_NAVPATH,
                  target: this.trashcan,
                  data: []
                })
                resolve()
              })
            }).catch(err => reject(err))
            break
          default:
            if (APPSETTING.USEROOTPATH) {
              util.locateFolder(
                this.$store,
                lastVisit.path.split('/'),
                {
                  children: this.folderTree
                },
                {
                  alwaysGet: true,
                  isShowWaiting: true
                }
              ).then(() => {
                resolve()
              }).catch(err => reject(err))
            } else {
              util.locateFolder(
                this.$store,
                lastVisit.path.split('/').slice(1),
                {
                  children: this.folderTree
                },
                {
                  alwaysGet: true,
                  isShowWaiting: true
                }
              ).then(() => {
                resolve()
              }).catch(err => reject(err))
            }
        }
      })
    },
    initNativeEvents () {
      window.addEventListener('unload', this.setCookie)
      window.addEventListener('keydown', event => {
        if (document.querySelector('.h5')) {
          // use state
        } else {
          let keycode = event.keyCode
          let tag = event.target.tagName.toUpperCase()
          if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            this.$keydown.emit('keydown-' + keycode, [event])
          }
        }
      })
      window.addEventListener('keyup', event => {
        if (document.querySelector('.h5')) {
          // use state
        } else {
          let keycode = event.keyCode
          let tag = event.target.tagName.toUpperCase()
          if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            this.$keydown.emit('keyup-' + keycode, [event])
          }
        }
      })
    },
    initAppData () {
      this.$store.dispatch({
        type: TYPES.GET_USERTREE
      }).then(res => {
        let lastVisit = util.getCookie('last_visit' + this.userInfo.usercode)
        if (lastVisit) {
          lastVisit = JSON.parse(lastVisit)
          this.$store.commit({
            type: TYPES.SET_APPDATA,
            data: lastVisit
          })
          this.locateFolder(lastVisit).then(res => {
            if (lastVisit.selectedMaterial.length) {
              // check in material
              this.$nextTick(() => {
                var children = this.displayMaterials
                children.forEach(item => {
                  if (lastVisit.selectedMaterial.indexOf(item.guid) > -1) {
                    item.selected = true
                    this.store.commit({
                      type: TYPES.ADD_SELECTEDITEM,
                      data: item
                    })
                    this.$store.commit({
                      type: TYPES.SET_SIGNMATERIAL,
                      data: children.indexOf(item)
                    })
                  }
                })
              })
            }
          })
        } else {
          this.$store.dispatch({
            type: TYPES.GET_MATERIALS,
            source: this.nodes[0]
          }).then(() => {
            this.$store.commit({
              type: TYPES.EXPAND_FOLDER,
              target: this.nodes[0],
              data: []
            })
            this.$store.commit({
              type: TYPES.GET_NAVPATH,
              target: this.nodes[0],
              data: []
            })
          })
        }
      })
      // get s3 upload path
      this.$store.dispatch({
        type: TYPES.GET_S3PATH
      })
      // get nas upload path
      this.$store.dispatch({
        type: TYPES.GET_NASPATH
      })
      this.$store.commit({
        type: TYPES.SET_DVPADDING
      })
      let headerArr = JSON.parse(util.getCookie('item_headers' + this.userInfo.usercode))
      if (Array.isArray(headerArr)) {
        this.$store.commit({
          type: TYPES.SET_HEADERS,
          data: headerArr
        })
      }

      let scaleTime = util.getCookie('scale_time' + this.userInfo.usercode)
      if (scaleTime) {
        this.$store.state.scaleTime = Number(scaleTime) * 1
      }

      let leftWidth = util.getCookie('leftWidth' + this.userInfo.usercode)
      if (leftWidth || leftWidth === '0') {
        this.leftTreeWidth = parseInt(leftWidth)
      }
      this.$store.dispatch({
        type: TYPES.GET_DING
      }).then(res => {
        let dingRoot = this.linkNodes[0]
        let linkNodes = util.parseData(res.data.ext, dingRoot)
        linkNodes.forEach(item => {
          item.isDing = true
          item.operations = ['Open', 'Remove']
        })
        this.$store.commit({
          type: TYPES.SET_FOLDERS,
          target: dingRoot,
          data: linkNodes.sort(SortLikeWin)
        })
      })

      this.$store.dispatch({
        type: TYPES.GETSYSPARAM,
        target: {
          tool: 'DEFAULT',
          paramname: 'SNSPublishQuality'
        }
      }).then((res) => {
        if (res.paramvalue) {
          //  _this.$store.state.SNSPublishQuality = res.paramvalue;
        }
      }).catch((res) => {

      })

      this.$store.state.materialBox = document.querySelector('.scrollbar_container')
    },
    initModalWindow () {
      // this.taskMonitorWindow = new ModalWindow({
      //   content: this.$refs.taskmonitor || document.querySelector('.taskmonitorifm'),
      //   title: 'Task Monitor',
      //   onshow: this.resizeTaskMonitor
      // })
      this.taskMonitorUrl = URLCONFIG.TMWEB + 'TaskMonitor.html?UserCode=' + btoa(this.userInfo.usercode)
      // this.$store.state.saveClipWindow = new ModalWindow({
      //   content: this.$refs.saveClip.$el,
      //   title: 'Save As'
      // })
      // this.$store.state.exportWindow = new ModalWindow({
      //   content: this.$refs.export.$el,
      //   title: 'Export'
      // })
      this.$store.state.publishWindow = new ModalWindow({
        content: this.$refs.publishtoSNS.$el,
        title: 'Publish to SNS'
      })
      this.$store.state.RegisterWundow = new ModalWindow({
        content: this.$refs.registerToOA.$el,
        title: 'Register To'
      })
      this.$store.dispatch({
        type: TYPES.GET_SEARCH_QUERY
      }).then(res => {
        let temp = res.find(item => item.templateName === ('default' + this.$store.state.userInfo.usercode))
        if (temp) {
          this.$store.state.templateID = temp.templateId
          if (temp.condition.keywords) {
            this.$store.state.fulltextSearchCondition.keywords = temp.condition.keywords
          }
          if (temp.condition.timeFilter) {
            this.$store.state.fulltextSearchCondition.timeFilter = temp.condition.timeFilter
          }
          if (temp.condition.typeFilter) {
            this.$store.state.fulltextSearchCondition.typeFilter = temp.condition.typeFilter
          }
          if (temp.condition.booleanCondition) {
            this.$store.state.fulltextSearchCondition.booleanCondition = temp.condition.booleanCondition
          }
          temp.condition.headers.forEach(item => {
            util.packegeCustomSearchData(item.keyValues)
            util.packegeCustomSearchData(item.hideKeyValues)
          })
          this.$store.state.advanceSearchHeaders = temp.condition.headers
          res.remove(temp)
        }
        // 获取所有的自定义元数据字段，存在的更新  不存在的remove  新增的加到后面
        this.$store.dispatch({
          type: TYPES.GET_CUSTOM_SEARCH_CONDTION
        }).then(res => {
          let flag = false
          console.log(flag)
          this.$store.state.advanceSearchHeaders.forEach(item => {
            let kvs = item.keyValues
            let hkvs = item.hideKeyValues
            let query = defaultQuery[item.name]
            if (query) {
              let customKvs = util.packegeCustomSearchData(res.data.ext.filter(item => item.isAdvanceSearch && item.fieldvisable && item.tabvisable && query.some(i => i.value === item.entitytype)))
              if (item.name === 'Clip') {
                let ckvsGroup = customKvs.groupBy('id')
                let distinctArr = []
                ckvsGroup.forEach(item => {
                  if (item.length > 1) {
                    distinctArr.push(item.sort((i1, i2) => {
                      return query.indexOf(i1.entitytype) - query.indexOf(i2.entitytype) // 按 V A PIC DOC OTHER 排序
                    })[0])
                  } else {
                    distinctArr.push(item[0])
                  }
                })
                customKvs = distinctArr
              }
              let tempKvs = []
              let tempHkvs = []
              kvs.forEach((k, index) => {
                let same = customKvs.find(i => i.id === k.id) // 在显示的项中找相同的
                if (k.isCustom && !same) { // 如果该项是自定义字段且没有在获取的所有自定义字段里面，就remove
                  tempKvs.push(k)
                } else if (k.isCustom) { // 如果找到same 就在所有的自定义字段中remove掉这项避免重复
                  // if (k.name !== same.name || k.ctrl !== same.ctrl) {
                  flag = true
                  if (k.ctrl === same.ctrl) {
                    if (k.ctrl === 'rd-select') {
                      if (same.multiple) {
                        same.options.filter(item => k.value.some(i => i.value === item.value)).forEach(item => (item.selected = true))
                      } else {
                        same.options.forEach(item => ((item.value === k.value.value && (item.selected = true)) || (item.selected = false)))
                      }
                    } else {
                      same.value = k.value
                    }
                    if (same.isRange) {
                      same.from.value = k.from.value
                      same.to.value = k.to.value
                    }
                  }
                  this.$set(kvs, index, same)
                  //  }
                  customKvs.remove(same)
                }
              })
              hkvs.forEach((k, index) => {
                var same = customKvs.find(i => i.id === k.id)
                if (k.isCustom && !same) {
                  tempHkvs.push(k)
                } else if (k.isCustom) {
                  // if (k.name !== same.name || k.ctrl !== same.ctrl) {
                  flag = true
                  if (k.ctrl === same.ctrl) {
                    if (k.ctrl === 'rd-select') {
                      if (same.multiple) {
                        same.options.filter(item => k.value.some(i => i.value === item.value)).forEach(item => (item.selected = true))
                      } else {
                        same.options.forEach(item => ((item.value === k.value.value && (item.selected = true)) || (item.selected = false)))
                      }
                    } else {
                      same.value = k.value
                    }
                    if (same.isRange) {
                      same.from.value = k.from.value
                      same.to.value = k.to.value
                    }
                  }
                  this.$set(hkvs, index, same)
                  // }
                  customKvs.remove(same)
                }
              })
              kvs.remove(...tempKvs)
              hkvs.remove(...tempHkvs)
              hkvs.push(...customKvs)
            }
            // flag && this.$store.dispatch({
            //   type: types.MODIFY_SEARCH_QUERY,
            //   data: {
            //     templateID: this.$store.state.templateID,
            //     json: {
            //       templateName: 'default' + this.$store.state.userInfo.usercode,
            //       condition: this.$store.getters.currentSearchCondition
            //     }
            //   }
            // }) //有变化需要同步， 不同步好像也没问题。。。节约一次请求吧
          })
        })
        res.forEach(item => {
          item.condition.headers.forEach(item => {
            util.packegeCustomSearchData(item.keyValues)
            util.packegeCustomSearchData(item.hideKeyValues)
          })
          item.name = item.templateName
        })
        this.$store.commit({
          type: TYPES.GET_SEARCHMODEL,
          target: this.$store.getters.searchResult,
          data: res
        })
      })
      var headers = defaultAdvanceSearchCondtion

      headers.forEach(item => {
        util.packegeCustomSearchData(item.keyValues)
        util.packegeCustomSearchData(item.hideKeyValues)
      })
      this.$store.state.advanceSearchHeaders = headers
      this.$store.state.fulltextSearchCondition = defaultFulltextSearchCondtion
      this.$store.state.advanceSearchWindow = new ModalWindow({
        content: this.$refs.advanceSearch.$el,
        title: 'Advance Search',
        onhide: () => {
          if (this.$store.state.isModifyCondtion) {
            this.$store.state.isModifyCondtion = false // 暂时不处理被编辑了的高级搜索条件
            !this.$store.state.isSearched && this.$store.state.advanceSearchHeaders.forEach(h => {
              h.selected = h.bakSelected
              var kvs = h.keyValues.concat(h.hideKeyValues)
              kvs.forEach && kvs.forEach(k => {
                if (k.isRange) {
                  k.from.value = k.from.bakValue
                  k.to.value = k.to.bakValue
                } else if (k.ctrl === 'rd-select') {
                  k.options = k.bakOptions
                } else {
                  k.value = k.bakValue
                  if (k.username) {
                    k.username = ''
                    k.userdata.checked = false
                    k.userdata = null
                  }
                  if (k.bakUserdata) {
                    k.bakUserdata.checked = true
                    k.userdata = k.bakUserdata
                    k.username = k.bakUserdata.nickname || k.bakUserdata.loginname.replace(/.*\\(.*)/g, '$1')
                  }
                  if (k.checkedValue) {
                    k.checkedValue.forEach(item => (item.checked = false))
                    k.bakCheckedValue.forEach(item => (item.checked = true))
                    k.checkedValue = k.bakCheckedValue
                  }
                }
              })
            })
            this.$store.state.advanceSearchHeaders = this.$store.state.bakAdvanceSearchHeaders // huanyuan
          } else {
            if (this.$store.state.isSearched && this.$store.state.isRemember.checked) {

            } else {
              // restore
              this.$store.state.advanceSearchHeaders.forEach(h => {
                h.selected = h.bakSelected
                var kvs = h.keyValues.concat(h.hideKeyValues)
                kvs.forEach && kvs.forEach(k => {
                  if (k.isRange) {
                    k.from.value = k.from.bakValue
                    k.to.value = k.to.bakValue
                  } else if (k.ctrl === 'rd-select') {
                    k.options = k.bakOptions
                  } else {
                    k.value = k.bakValue
                    if (k.username) {
                      k.username = ''
                      k.userdata.checked = false
                      k.userdata = null
                    }
                    if (k.bakUserdata) {
                      k.bakUserdata.checked = true
                      k.userdata = k.bakUserdata
                      k.username = k.bakUserdata.nickname || k.bakUserdata.loginname.replace(/.*\\(.*)/g, '$1')
                    }
                    if (k.checkedValue) {
                      k.checkedValue.forEach(item => (item.checked = false))
                      k.bakCheckedValue.forEach(item => (item.checked = true))
                      k.checkedValue = k.bakCheckedValue
                    }
                  }
                })
              })
            }
          }
          this.$store.state.isSearched = false
        },
        onshow: () => {
          // bak data
          if (this.$store.state.isModifyCondtion) {
            this.isAdvanceConfig = false // 取消config模式
            var headers = this.currentNode.bakCondition.headers
            this.$store.dispatch({
              type: TYPES.GET_CUSTOM_SEARCH_CONDTION
            }).then(res => {
              headers.forEach(item => {
                var kvs = item.keyValues
                var hkvs = item.hideKeyValues
                var query = defaultQuery[item.name]
                if (query) {
                  var customKvs = util.packegeCustomSearchData(res.data.ext.filter(item => item.isAdvanceSearch && query.some(i => i.value === item.entitytype)))
                  if (item.name === 'Clip') {
                    var ckvsGroup = customKvs.groupBy('id')
                    var distinctArr = []
                    ckvsGroup.forEach(item => {
                      if (item.length > 1) {
                        distinctArr.push(item.sort((i1, i2) => {
                          return query.indexOf(i1.entitytype) - query.indexOf(i2.entitytype) // 按 V A PIC DOC OTHER 排序
                        })[0])
                      } else {
                        distinctArr.push(item[0])
                      }
                    })
                    customKvs = distinctArr
                  }
                  let tempKvs = []
                  let tempHkvs = []
                  kvs.forEach((k, index) => {
                    var same = customKvs.find(i => i.id === k.id) // 在显示的项中找相同的
                    if (k.isCustom && !same) { // 如果该项是自定义字段且没有在获取的所有自定义字段里面，就remove
                      tempKvs.push(k)
                    } else if (k.isCustom) { // 如果找到same 就在所有的自定义字段中remove掉这项避免重复
                      // if (k.name !== same.name || k.ctrl !== same.ctrl) {
                      if (k.ctrl === same.ctrl) {
                        if (k.ctrl === 'rd-select') {
                          if (same.multiple) {
                            same.options.filter(item => k.value.some(i => i.value === item.value)).forEach(item => (item.selected = true))
                          } else {
                            same.options.forEach(item => (item.value === k.value.value && (item.selected = true)) || (item.selected = false))
                          }
                        } else {
                          same.value = k.value
                        }
                        if (same.isRange) {
                          same.from.value = k.from.value
                          same.to.value = k.to.value
                        }
                      }
                      this.$set(kvs, index, same)
                      // }
                      customKvs.remove(same)
                    }
                  })
                  hkvs.forEach((k, index) => {
                    var same = customKvs.find(i => i.id === k.id)
                    if (k.isCustom && !same) {
                      tempHkvs.push(k)
                    } else if (k.isCustom) {
                      // if (k.name !== same.name || k.ctrl !== same.ctrl) {
                      if (k.ctrl === same.ctrl) {
                        if (k.ctrl === 'rd-select') {
                          if (same.multiple) {
                            same.options.filter(item => k.value.some(i => i.value === item.value)).forEach(item => (item.selected = true))
                          } else {
                            same.options.forEach(item => (item.value === k.value.value && (item.selected = true)) || (item.selected = false))
                          }
                        } else {
                          same.value = k.value
                        }
                        if (same.isRange) {
                          same.from.value = k.from.value
                          same.to.value = k.to.value
                        }
                      }
                      this.$set(hkvs, index, same)
                      // }
                      customKvs.remove(same)
                    }
                  })
                  kvs.remove(...tempKvs)
                  hkvs.remove(...tempHkvs)
                  hkvs.push(...customKvs)
                }
              })
              // 此处组织条件，丢掉没有的，引入新增的。
              headers.forEach(item => {
                util.packegeCustomSearchData(item.keyValues)
                util.packegeCustomSearchData(item.hideKeyValues)
              })
              this.$store.state.bakAdvanceSearchHeaders = this.$store.state.advanceSearchHeaders // 备份
              headers.forEach(h => {
                h.bakSelected = h.selected
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
              }) // 备份
            })
            this.$store.state.advanceSearchHeaders = headers
          } else {
            this.$store.state.advanceSearchHeaders.forEach(h => {
              h.bakSelected = h.selected
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
          }
        }
      })
    },
    setCookie () {
      let lastVisit = util.getCookie('last_visit' + this.userInfo.usercode)
      if (lastVisit) {
        lastVisit = JSON.parse(lastVisit)
      } else {
        lastVisit = {}
      }
      let state = this.$store.state
      let currentNode = this.$store.getters.currentNode
      state && state.selectedMaterials && util.setCookie('last_visit' + this.userInfo.usercode, JSON.stringify({
        path: currentNode.path,
        guid: currentNode.guid,
        condition: currentNode.condition,
        templateId: currentNode.templateId,
        listSymbol: state.listSymbol,
        listOrder: state.listOrder,
        sortType: state.sortType,
        typeSymbol: state.typeSymbol,
        sortSymbol: state.sortSymbol,
        selectedMaterial: state.selectedMaterials.map(item => item.guid)
      }))
    }
  },
  created () { },
  mounted () {
    this.initNativeEvents()
    this.initAppData()
    this.initModalWindow()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.left_container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 2;
  width: 200px;
  background: #222;
}
.left_container .logo_box {
  overflow: hidden;
  height: 49px;
  line-height: 50px;
  background-color: #1b1b1b;
  color: rgb(115, 115, 115);
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #000;
  font-size: 16px;
  font-family: Arial;
}
.left_container .folder_box {
  border-right: 1px solid #000;
  height: calc(100% - 100px);
  background: #222222;
  border-top: 1px #1b1b1b solid;
  font-size: 15px;
  line-height: 30px;
  /* padding: 10px 0; */
}
.right_container {
  position: absolute;
  left: 200px;
  background-color: #1b1b1b;
  top: 0;
  bottom: 0;
  right: 0;
}
.right_container .top_box {
  height: 49px;
  line-height: 50px;
  border-bottom: 1px #000 solid;
  background: #141414;
}
.tree_icon {
  background-image: url(../assets/images/tree_se.png);
  background-size: 100%;
  width: 30px;
  height: 30px;
  float: left;
  margin: 10px 5px 0 15px;
  cursor: pointer;
}
.top_box #div_fullTextSearch {
  width: 378px;
  height: 30px;
  top: 5px;
  position: relative;
  float: left;
  margin: 6px 5px 0 5px;
  border-radius: 5px;
  color: #999999;
  font-family: 'proximanova', 'pro_text', 'micorsoft yahei', 'sans-serif';
  font-weight: lighter;
}
.advance_search {
  background: #272727;
  height: 30px;
  font-size: 13px;
  color: #999;
  margin: 0px 5px;
  border-radius: 3px;
  padding: 0px 10px;
  border: 1px #272727 solid;
}
.task_monitor {
  background: #272727;
  height: 30px;
  font-size: 13px;
  color: #999;
  border-radius: 3px;
  padding: 0px 10px;
  border: 1px #272727 solid;
  margin: 0px 5px 0 0;
}
.advance_search:hover {
  border: 1px #ff9400 solid;
}
.task_monitor:hover {
  border: 1px #ff9400 solid;
}
.materials_container {
  position: absolute;
  bottom: 0;
  top: 50px;
  left: 0;
  transition: all 0.2s;
  transition-delay: 0.1s;
  right: 0;
  background: #1b1b1b;
  z-index: 1;
  display: flex;
  flex-direction: column;
}
.right_container .toolbar_box {
  height: 39px;
  line-height: 39px;
  background: #1f1f1f;
  border-bottom: 1px #000 solid;
  border-top: 1px #1a1a1a solid;
}
.materials_count {
  background: #1f1f1f;
  height: 39px;
  position: relative;
}
.text_nomarl {
  font-size: 15px;
  color: #5c5a5a;
  margin: 0px 15px 0px 0px;
  float: right;
}
.text_strong {
  font-size: 18px;
  font-weight: normal;
  color: #c0c0c0;
  margin: 0px 10px 0px 10px;
  float: right;
}
.list_icon {
  display: inline-block;
  border: none;
  outline: none;
  width: 39px;
  height: 39px;
  cursor: pointer;
  background: url(../assets/images/list_normal.jpg) no-repeat;
}
.thumbnail_icon {
  display: inline-block;
  border: none;
  outline: none;
  width: 39px;
  height: 39px;
  cursor: pointer;
  background: url(../assets/images/thumbnail_normal.jpg) no-repeat;
}
.thumbnail_icon_active {
  background: url(../assets/images/thumbnail_over.jpg) no-repeat;
}
.sortby_icon {
  display: inline-block;
  border: none;
  outline: none;
  width: 38px;
  height: 38px;
  cursor: pointer;
  background: url(../assets/images/sortby_normal.jpg) no-repeat;
}
.menu_box {
  position: relative;
  z-index: 3;
  font-size: 16px;
}
.triangle_top {
  border: 8px solid transparent;
  border-bottom: 8px solid #fff;
  position: absolute;
}
.triangle_top.sort_by {
  top: 30px;
  right: 12px;
}
.operation_box {
  position: absolute;
  top: 45px;
  background-color: #fff;
  z-index: 23333;
  cursor: pointer;
  border-radius: 4px;
  line-height: 27px;
  padding: 3px 0;
}
.operation_box.sort_by {
  width: 120px;
  right: -42px;
}
.operation_item {
  list-style: none;
  line-height: 27px;
  padding: 0 7px;
  color: #1b1b1b;
  font-weight: 600;
  text-align: center;
}
.list_icon_active {
  background: url(../assets/images/list_over.jpg) no-repeat;
}
.list_icon:hover {
  background: url(../assets/images/list_over.jpg) no-repeat;
}
.thumbnail_icon:hover {
  background: url(../assets/images/thumbnail_over.jpg) no-repeat;
}
.scrollbar_container {
  flex: 1;
  width: 100%;
}
.material_box {
  position: absolute;
  min-height: 100%;
  min-width: 100%;
}
.searchBox {
  position: fixed;
  top: 50px;
  z-index: 2;
  left: 50%;
  transform: translate(-50%);
  height: 38px;
  line-height: 40px;
  background: #333;
  width: 300px;
  padding: 0 5px;
  border: 1px dimgrey solid;
}
.select_circle {
  position: absolute;
  border: 1px dotted rgb(224, 224, 224);
  /*background: rgb(170, 204, 238);
  border: 1px solid rgb(0, 120, 215);*/
  z-index: 2;
  pointer-events: none;
  opacity: 0.5;
}

.drag_bed {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  opacity: 0.5;
  cursor: default;
  z-index: 1;
}
</style>

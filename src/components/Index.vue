<template>
  <div :class="{plug_style: isPremiere}" @click.capture="hideMenu" @contextmenu="hideMenu" @mousedown="hideMenu" @selectstart.stop.prevent @mouseup="dragEnd" @mousewheel.ctrl="scaleThumb" @mousemove="resizing">
  </div>
</template>

<script>
import util from '../lib/util.js'
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
export default {
  name: 'Index',
  data () {
    return {
      tempIndex: 0,
      sortByStatus: false,
      userOperationStatus: false,
      previewSymbol: false,
      resizeSymbol: false,
      dragSymbol: false,
      folderBlockStatus: true,
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
      }
    }
  },
  computed: {
    ...mapState(['userInfo', 'isAdvanceConfig', 'searchType', 'isMarker', 'linkNodes', 'player', 'showSearch', 'loading', 'thumbnailStyle', 'scaleTime', 'thumbPadding', 'signIndex', 'selectedMaterials', 'alwaysGet', 'focusIndex', 'trashcan']),
    ...mapGetters(['selectedNode', 'searchResult', 'orderedSelectedMaterials', 'folderTree', 'isFocusTree', 'isFocusML', 'isFocusPlayer']),
    scaleTime: {
      get () {
        return this.$store.state.scaleTime
      },
      set (val) {
        this.$store.state.scaleTime = val
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
        return 'list-material-ctrl'
      }
      return 'material-ctrl'
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
      this.store.getters.currentNode.children = val // make it reactive
    }
  },
  methods: {
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
          data: linkNodes.sort(util.sortLikeWin)
        })
      })

      this.$store.dispatch({
        type: TYPES.GETSYSPARAM,
        target: '{\'tool\':\'DEFAULT\',\'paramname\':\'SNSPublishQuality\'}'
      }).then((res) => {
        if (res.paramvalue) {
          //  _this.$store.state.SNSPublishQuality = res.paramvalue;
        }
      }).catch((res) => {

      })
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
</style>

<template>
  <div class="hello">
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
export default {
  name: 'Index',
  data () {
    return {
      tempIndex: 0,
      previewSymbol: false
    }
  },
  computed: {
    ...mapState(['userInfo', 'player', 'showSearch', 'loading', 'thumbnailStyle', 'scaleTime', 'thumbPadding', 'signIndex', 'selectedMaterials', 'alwaysGet', 'focusIndex']),
    ...mapGetters(['selectedNode', 'orderedSelectedMaterials', 'folderTree', 'isFocusTree', 'isFocusML', 'isFocusPlayer']),
    scaleTime: {
      get () {
        return this.$store.state.scaleTime
      },
      set (val) {
        this.$store.state.scaleTime = val
      }
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
    displayMaterials (val) {
      this.store.getters.currentNode.children = val // make it reactive
    }
  },
  methods: {
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
      this.$keydown.on('keydown-' + code, func)
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
        } else { }
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
  created () {
    this.initNativeEvents()
    this.initAppData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

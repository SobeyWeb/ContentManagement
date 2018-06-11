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
export default {
  name: 'Index',
  data () {
    return {
      tempIndex: 0
    }
  },
  computed: {
    ...mapState(['userInfo', 'player', 'showSearch', 'loading', 'thumbnailStyle', 'scaleTime', 'thumbPadding', 'signIndex']),
    ...mapGetters(['selectedNode', 'orderedSelectedMaterials']),
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
        ctrl: true,
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.PREV_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.PREV_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.NEXT_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.NEXT_ITEM,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.dispatch({
              type: TYPES.EXPAND_FOLDER,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.dispatch({
              type: TYPES.EXPAND_FOLDER,
              source: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.CLOSE_FOLDER,
              target: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree) {
            this.$store.commit({
              type: TYPES.CLOSE_FOLDER,
              target: this.selectedNode
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
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
          if (this.focusTree || this.focusPlayer) {
          } else if (!this.loading) {
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
      keyEvents.push(new KeyEvent(KEYCODES.enter, {
        action: event => {
          if (this.focusTree) {
            this.$store.dispatch({
              type: TYPES.NODE_CLICK,
              data: {
                target: this.selectedNode
              }
            })
          } else if (this.isFocusPlayer) {
          } else if (!this.loading) {
            this.$store.dispatch({
              type: TYPES.SELECT_MATERIAL,
              data: this.signIndex - 1
            })
          }
        }
      }))
    },
    registerKeyup (code, func) {
      this.$keydown.on('keydown-' + code, func)
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

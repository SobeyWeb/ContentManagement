<template>
  <div class="tab_header_container " :style="{width: headerWidth+'px', marginLeft:'-'+ marginLeft+'px'}" @contextmenu.prevent.stop @drop.stop.prevent @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent @mousedown.stop.prevent @mouseup.prevent>
    <div class="header_filter_container" v-show="filterSymbol" ref="filterContent">
      <div class="header_all_box">
        <input type="checkbox" id="checkAll" v-on:change="selectAll" :checked="selectedAllSymbol" />
        <label for="checkAll">All</label>
      </div>
      <div class="header_filter_content">
        <div class="header_filter_item" v-for="header in cheaders" :key="header.name">
          <input type="checkbox" :id="'check_'+header.attr" v-model="header.checked" />
          <label :for="'check_'+header.attr">{{header.name}}</label>
        </div>
      </div>
      <div class="mp-foot header_filter_foot">
        <button class="mp-btn cancel" v-on:click="closeFilter">Cancel</button>
        <button class="mp-btn ok" v-on:click="saveFilter">Confirm</button>
      </div>
    </div>
    <div class="list_header_item fl" :title="header.name" :ref="'tab'+index" drag :class="{list_header_item_dragging:header.dragging, list_header_item_checked:header.selected}" v-for="(header,index) in headers" :key="header.name" v-on:mousedown="dragstart($event, header)" :style="{width: header.width + 'px'}">
      <span class="drag_area fr" v-on:mousedown.stop="resize($event, header)" v-if="header.resizable"></span>
      <span>{{header.name}}</span>
    </div>
    <div class="list_header_item dragging_item" :title="dragName" v-show="dragging" :style="{left: x + 'px', width: dragItem.width + 'px'}">
      <span>{{dragName}}</span>
    </div>
  </div>
</template>

<script>
import ModalWindow from '../../lib/ModalWindow.js'
import * as util from '../../lib/util.js'
import TYPES from '../../dicts/mutationTypes.js'
import $ from 'jquery'
export default {
  data () {
    return {
      dragItem: {
        width: 200
      },
      dragName: '',
      index: -1,
      dragging: false,
      x: 0,
      offset: 0,
      mousemove: null,
      mouseup: null,
      stampWidth: 0,
      stampLeft: 0,
      titleWidth: 0,
      titleLeft: 0,
      targetWidth: 0,
      resizeX: 0,
      resizeMove: null,
      resizeUp: null,
      resizeItem: null,
      oldWidth: 0,
      filterSymbol: false,
      filterWindow: null,
      checkedHeaders: [],
      lastX: 0,
      checkedHeader: {},
      marginLeft: 0,
      leftIndex: 0
    }
  },
  props: {
    headers: {
      type: Array,
      required: true
    }
  },
  methods: {
    init () {
      this.leftIndex = 0
      this.marginLeft = 0 // 暂时置为0吧
    },
    selectHeader (index) {
      this.headers.forEach(h => h.selected = false)
      if (this.headers[index]) {
        this.checkedHeader = this.headers[index]
        this.checkedHeader.selected = true
        if (this.leftIndex + 6 < index || this.leftIndex > index) {
          this.leftIndex = Math.max(0, index - 6)
          this.marginLeft = 0
          for (let i = 0; i < this.leftIndex; i++) {
            this.marginLeft += this.headers[this.leftIndex].width
          }
        }
        this.$emit('headerClick', this.headers[index])
      }
    },
    leftMove () {
      this.leftIndex = Math.max(0, this.leftIndex - 1)
      this.marginLeft = Math.max(0, this.marginLeft - this.headers[this.leftIndex].width)
    },
    rightMove (max) {
      var total = this.marginLeft + this.headers[this.leftIndex].width
      if (total + max > this.headerWidth) {
        this.marginLeft = this.headerWidth - max
      } else {
        this.marginLeft = total
        this.leftIndex++
      }
    },
    selectAll () {
      if (this.checkedHeaders.every(item => item.checked)) {
        this.checkedHeaders.forEach(item => {
          if (item.attr !== 'name') {
            item.checked = false
          }
        })
      } else {
        this.checkedHeaders.forEach(item => item.checked = true)
      }
    },
    openFilterWindow () {
      this.filterSymbol = true
      this.checkedHeaders = JSON.parse(JSON.stringify(this.$store.state.headers))
      this.$nextTick(() => {
        if (!this.filterWindow) {
          this.filterWindow = new ModalWindow({
            content: this.$refs.filterContent,
            title: 'Column Filter'
          })
        }
        this.filterWindow.show()
      })
    },
    closeFilter () {
      this.filterWindow.hide()
    },
    saveFilter () {
      var indexArr = []
      this.checkedHeaders.forEach((item, index) => {
        if (item.checked) {
          indexArr.push(index)
        }
      })
      this.$store.commit({
        type: TYPES.SET_HEADERFILTER,
        data: indexArr
      })
      this.filterWindow.hide()
    },
    dragstart (event, header) {
      var ele = event.target.tagName === 'DIV' ? $(event.target) : $(event.target).parent()
      this.dragItem = header
      this.dragName = header.name
      header.dragging = true
      this.index = this.headers.indexOf(header)
      this.targetWidth = ele.width()
      var eventLeft = ele.offset().left
      this.stampLeft = $(this.$refs.tab0).offset().left
      // this.stampWidth = $(this.$refs.tab0).width()
      this.x = eventLeft - this.stampLeft // foldertree + stamp
      this.offset = (event.x - eventLeft) % ele.width()
      this.dragging = true
      this.lastX = event.x
      window.addEventListener('mousemove', this.mousemove)
      window.addEventListener('mouseup', this.mouseup)
    },
    resize (event, header) {
      this.resizeItem = header
      this.oldWidth = header.width
      this.resizeX = event.x
      window.addEventListener('mousemove', this.resizeMove)
      window.addEventListener('mouseup', this.resizeUp)
    }
  },
  created () {
    this.checkedHeader = this.headers[0] || {}
    this.checkedHeader.selected = true
    var _this = this
    this.mousemove = function (event) {
      var header
      var right = false
      var min = _this.stampWidth
      var x = Math.min(_this.headers.reduce(
        (item1, item2) => {
          return {
            width: item1.width + item2.width
          }
        }, {
          width: 0
        }).width + min, Math.max(event.x - _this.stampLeft, min + _this.titleWidth))
      // if (x - _this.offset > _this.x) {
      if (event.x > _this.lastX) {
        // →  30 为缓冲距离
        _this.x = Math.max(x - _this.offset, min + _this.titleWidth)
        header = util.getListHeader(_this.x - min - 30 + _this.targetWidth, _this.headers)
        right = true
      } else {
        _this.x = Math.max(x - _this.offset, min + _this.titleWidth)
        header = util.getListHeader(_this.x - min + 30, _this.headers)
        right = false
      }
      _this.lastX = event.x
      // var header = util.getListHeader(_this.x, _this.headers)

      if (header !== _this.dragItem) {
        var index = _this.headers.indexOf(header)
        if ((right && index < _this.index) || (!right && index > _this.index)) {
          return
        }

        if (index > _this.index) {
          index -= 1
          _this.index = index + 1
        } else {
          _this.index = index
        }
        // 待替换为event _this.$emit('swapHeader',{item,index})
        _this.headers.remove(_this.dragItem)
        _this.headers.splice(index, 0, _this.dragItem)
        /* _this.$store.commit({
          type: types.SWAP_HEADERITEMS,
          data: {
            item: _this.dragItem,
            index: index
          }
        }) */
      }
    }
    this.mouseup = function (event) {
      _this.dragging = false
      _this.dragItem.name = _this.dragName
      _this.dragItem.dragging = false
      _this.headers.forEach(h => h.selected = false)
      _this.checkedHeader.selected = false
      _this.checkedHeader = _this.dragItem
      _this.checkedHeader.selected = true
      _this.dragItem.callback && _this.dragItem.callback()
      _this.$emit('hswap', {
        curHeader: _this.dragItem,
        headers: _this.headers
      })
      window.removeEventListener('mousemove', _this.mousemove)
      window.removeEventListener('mouseup', _this.mouseup)
    }
    this.resizeMove = function (event) {
      var newX = event.x
      _this.resizeItem.width = Math.max(70, _this.oldWidth + newX - _this.resizeX)
    }
    this.resizeUp = function (event) {
      _this.resizeItem = null
      _this.$emit('hresize', {
        curHeader: _this.dragItem,
        headers: _this.headers
      })
      window.removeEventListener('mousemove', _this.resizeMove)
      window.removeEventListener('mouseup', _this.resizeUp)
    }
  },
  computed: {
    cheaders () {
      return this.checkedHeaders
    },
    selectedAllSymbol () {
      return this.cheaders.every(item => item.checked)
    },
    headerWidth () {
      return this.headers.reduce(
        (item1, item2) => {
          return {
            width: item1.width + item2.width
          }
        }, {
          width: 0
        }).width
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.list_header_item {
  line-height: 30px;
  height: 30px;
  display: inline-block;
  text-align: center;
  text-overflow: ellipsis;
  /*overflow: hidden;*/
  background: #464646;
  border-left: #101010 solid 1px;
  box-sizing: border-box;
  white-space: nowrap;
  width: 200px;
  position: relative;
  cursor: default;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab_header_container .list_header_item,
.advance_search_container .list_header_item {
  line-height: 38px;
  height: 38px;
}
.list_header_item_checked {
  background: #363636;
  box-shadow: 0 1px 4px #1b1b1b;
}
.dragging_item {
  position: absolute;
  z-index: 1;
  background: #363636;
  top: 0px;
  border-left: 1px solid #1b1b1b;
  box-shadow: 0 1px 8px #101010;
}
</style>

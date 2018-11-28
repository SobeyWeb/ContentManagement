<template>
  <div class="list_header_container" :style="{width: headerWidth+'px'}" @mousewheel.stop.prevent="moveScrollbar" @contextmenu.prevent.stop @drop.stop.prevent @dragenter.stop.prevent @dragover.stop.prevent @dragleave.stop.prevent @mousedown.stop.prevent @mouseup.prevent>
    <div class="header_filter_container" v-show="filterSymbol" ref="header_filter_container">
      <div class="header_all_box">
        <input type="checkbox" id="checkAll" v-on:change="selectAll" :checked="selectedAllSymbol" />
        <label for="checkAll">全部</label>
      </div>
      <div class="header_filter_content clearfix">
        <div class="header_filter_item">
          <input type="checkbox" disabled="disabled" checked="true" />
          <label>Stamp</label>
        </div>
        <div class="header_filter_item" v-for="header in cheaders" :key="header.name">
          <input type="checkbox" :id="'check_'+header.attr" :disabled="header.name === 'Title'" v-model="header.checked" />
          <label :for="'check_'+header.attr">{{header.name}}</label>
        </div>
      </div>
      <div class="mp-foot header_filter_foot">
        <button class="mp-btn cancel" v-on:click="closeFilter">Cancel</button>
        <button class="mp-btn ok" v-on:click="saveFilter">confirm</button>
      </div>
    </div>
    <div class="list_header_item fl list_header_stamp">
      <span class="list_header_filter fl" v-on:click="openFilterWindow" title="Column Filter"></span>
      <span>Stamp</span>
    </div>
    <!--div class="list_header_item fl list_header_title" :style="{width: titleWidth + 'px'}">
          <span class="list_sort_btn btn_up" v-on:mousedown.stop="sortBy({attr: 'name'}, true)"></span>
          <span class="list_sort_btn btn_down"  v-on:mousedown.stop="sortBy({attr: 'name'}, false)"></span>
          <span class="drag_area fr" v-on:mousedown.stop="resize($event)"></span>
          <span>Title</span>
        </div-->
    <div class="list_header_item fl" :class="{list_header_item_dragging:header.dragging,list_header_item_clicking:clicking}" :key="index" v-for="(header,index) in headers" v-on:mousedown="dragstart($event, header)" :style="{width: header.width + 'px'}">
      <span class="list_sort_btn btn_up" v-if="!listOrder.disabled&&listOrder.symbol&&(header.attr===listOrder.type||(['totalDuration', 'length', 'trimin', 'trimout'].indexOf(header.attr) > -1 && 'f' + header.attr === listOrder.type))"></span>
      <span class="list_sort_btn btn_down" v-if="!listOrder.disabled&&!listOrder.symbol&&(header.attr===listOrder.type||(['totalDuration', 'length', 'trimin', 'trimout'].indexOf(header.attr) > -1 && 'f' + header.attr === listOrder.type))"></span>
      <span class="drag_area fr" v-on:mousedown.stop="resize($event, header)"></span>
      <span v-if="['totalDuration', 'length', 'trimin', 'triminout'].indexOf(header.attr>-1)" @mousedown.stop="filterClick($event, header)" class="filter-icon">
        <i style="line-height:30px;" class="el-select__caret" :class="(!$store.state.operatingFilterData.visible||header.attr!==$store.state.operatingFilterData.header.attr)&&$store.state.filterHeaders.find(item=>item.attr===header.attr)&&$store.state.filterHeaders.find(item=>item.attr===header.attr).values.length?'el-icon-check':'el-icon-search'"></i>
      </span>
      <span>{{header.name}}</span>
    </div>
    <div class="list_header_item dragging_item" v-show="dragging" :style="{left: x + 'px', width: dragItem.width + 'px'}">
      <span>{{dragName}}</span>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import ModalWindow from '../lib/ModalWindow'
import TYPES from '../dicts/mutationTypes.js'
import $ from 'jquery'

export default {
  data: function () {
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
      titleWidth: 200,
      titleLeft: 0,
      targetWidth: 0,
      resizeX: 0,
      resizeMove: null,
      resizeUp: null,
      resizeItem: null,
      oldWidth: 0,
      filterSymbol: false,
      isClick: true,
      clicking: false,
      filterWindow: null,
      checkedHeaders: [],
      lastX: 0
    }
  },
  methods: {
    filterClick (event, header) {
      this.$store.state.operatingFilterData.header = this.$store.state.filterHeaders.find(item => item.attr === header.attr)
      this.$store.state.operatingFilterData.position = {
        x: event.x,
        y: event.y
      }
      this.$store.state.operatingFilterData.visible = !this.$store.state.operatingFilterData.visible
    },
    moveScrollbar (event) {
      if (event.deltaY < 0) {
        this.$parent.$refs.materialScollbar.normalizeHorizontal(this.$parent.$refs.materialScollbar.left - 100)
      } else {
        this.$parent.$refs.materialScollbar.normalizeHorizontal(this.$parent.$refs.materialScollbar.left + 100)
      }
    },
    swapHeader (right) {
      var header = util.getListHeader(this.x - this.stampWidth + 30, this.headers)
      if (header !== this.dragItem) {
        var index = this.$store.state.headers.indexOf(header)
        if ((right && index < this.index) || (!right && index > this.index)) {
          return
        }
        if (index > this.index) {
          index -= 1
          this.index = index + 1
        } else {
          this.index = index
        }
        // 待替换为mutation
        this.$store.commit({
          type: TYPES.SWAP_HEADERITEMS,
          data: {
            item: this.dragItem,
            index: index
          }
        })
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
            content: $('.header_filter_container')[0],
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
      window.addEventListener('mouseup', this.mouseup)
      this.clicking = true
      this.dragItem = header
      this.dragName = header.name
      header.dragging = true
      if (header.attr === 'name') {
        return false
      }
      this.isClick = true
      var ele = event.target.tagName === 'DIV' ? $(event.target) : $(event.target).parent()
      this.index = this.$store.state.headers.indexOf(header)
      this.stampLeft = $('.list_header_stamp').offset().left
      this.stampWidth = $('.list_header_stamp').width()
      this.titleWidth = this.headers[0].width
      this.targetWidth = ele.width()
      var eventLeft = ele.offset().left
      this.x = eventLeft - this.stampLeft // foldertree + stamp
      this.offset = (event.x - eventLeft) % ele.width()
      this.dragging = true
      this.lastX = event.x
      window.addEventListener('mousemove', this.mousemove)
    },
    sortBy (header) {
      var symbol = true
      if (header.attr === this.listOrder.type || (['totalDuration', 'length', 'trimin', 'trimout'].indexOf(header.attr) > -1 && 'f' + header.attr === this.listOrder.type)) {
        symbol = !this.listOrder.symbol
      }
      this.$store.commit({
        type: TYPES.SET_ORDERTYPE,
        data: {
          type: header.attr,
          symbol: symbol,
          disabled: false
        }
      })
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
    var _this = this
    this.scrollLeftMove = util.throttle(50, () => {
      this.$parent.$refs.materialScollbar.normalizeHorizontal(this.$parent.$refs.materialScollbar.left - 40)
      this.x = Math.max(this.x - 40, this.stampWidth + this.titleWidth)
      this.swapHeader(false)
    })
    this.scrollRightMove = util.throttle(50, () => {
      this.$parent.$refs.materialScollbar.normalizeHorizontal(this.$parent.$refs.materialScollbar.left + 40)
      this.x = Math.min(this.x + 40, this.headerWidth - this.offset)
      this.swapHeader(true)
    })
    var moveId = -1
    this.mousemove = function (event) {
      var header
      var right = false
      var min = _this.stampWidth
      if (Math.abs(_this.lastX - event.x) > 5) {
        _this.isClick = false
      }
      clearInterval(moveId)
      var x = Math.min(_this.headers.reduce((item1, item2) => {
        return {
          width: item1.width + item2.width
        }
      }).width + min, Math.max(event.x - $('.list_header_stamp').offset().left, min + _this.titleWidth))
      if (event.x > _this.lastX) {
        // →  30 为缓冲距离
        if (event.x > _this.$parent.$refs.proppreview.offsetLeft + _this.$parent.leftTreeWidth - 30) {
          let time = 640 / (event.x - _this.$parent.$refs.proppreview.offsetLeft - _this.$parent.leftTreeWidth)
          moveId = setInterval(_this.scrollRightMove, time)
          _this.scrollRightMove()
        }
        _this.x = Math.max(x - _this.offset, min + _this.titleWidth)
        header = util.getListHeader(_this.x - min - 30 + _this.targetWidth, _this.headers)
        right = true
      } else {
        if (_this.$parent.leftTreeWidth > event.x - 30) {
          let time = _this.$parent.leftTreeWidth / (_this.$parent.leftTreeWidth - event.x)
          moveId = setInterval(_this.scrollLeftMove, time)
          _this.scrollLeftMove()
        }
        _this.x = Math.max(x - _this.offset, min + _this.titleWidth)
        header = util.getListHeader(_this.x - min + 30, _this.headers)
        right = false
      }
      _this.lastX = event.x

      if (header !== _this.dragItem) {
        var index = _this.$store.state.headers.indexOf(header)
        if ((right && index < _this.index) || (!right && index > _this.index)) {
          return
        }
        if (index > _this.index) {
          index -= 1
          _this.index = index + 1
        } else {
          _this.index = index
        }
        // 待替换为mutation
        _this.$store.commit({
          type: TYPES.SWAP_HEADERITEMS,
          data: {
            item: _this.dragItem,
            index: index
          }
        })
      }
    }
    this.mouseup = function (event) {
      _this.clicking = false
      if (_this.isClick) {
        _this.sortBy(_this.dragItem)
      }
      clearInterval(moveId)
      _this.dragging = false
      _this.dragItem.name = _this.dragName
      _this.dragItem.dragging = false
      util.setCookie('item_headers' + _this.$store.state.userInfo.usercode, JSON.stringify(_this.$store.state.headers))
      window.removeEventListener('mousemove', _this.mousemove)
      window.removeEventListener('mouseup', _this.mouseup)
    }
    this.resizeMove = function (event) {
      var newX = event.x
      _this.resizeItem.width = Math.max(70, _this.oldWidth + newX - _this.resizeX)
    }
    this.resizeUp = function (event) {
      _this.resizeItem = null
      util.setCookie('item_headers' + _this.$store.state.userInfo.usercode, JSON.stringify(_this.$store.state.headers))
      window.removeEventListener('mousemove', _this.resizeMove)
      window.removeEventListener('mouseup', _this.resizeUp)
    }
  },
  computed: {
    listOrder () {
      return this.$store.state.listOrder
    },
    cheaders () {
      return this.checkedHeaders
    },
    selectedAllSymbol () {
      return this.cheaders.every(item => item.checked)
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
  cursor: pointer5p;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list_header_container {
  z-index: 1;
  background: #464646;
  height: 30px;
  overflow: hidden;
  border-right: 1px solid #464646;
}

.list_header_stamp {
  width: 90px;
  border-left: none;
  padding-left: 20px;
}

.list_header_item_dragging {
  /*background-color: #363636;*/
  color: #464646;
  /*隐藏文字，仿windows*/
}

.list_header_item_clicking:hover {
  background-color: #363636;
  border-left: 1px solid #1b1b1b;
  box-shadow: 0 1px 8px #101010;
  color: #fff;
  /*隐藏文字，仿windows*/
}

.list_header_item_checked {
  background: #363636;
  box-shadow: 0 1px 4px #1b1b1b;
}

.list_sort_btn {
  width: 0;
  height: 0;
  border: 5px solid transparent;
  cursor: pointer;
  position: absolute;
  left: 50%;
  margin-left: -5px;
}

.btn_up {
  border-bottom: 5px solid #ffffff;
  top: -3px;
}

.btn_down {
  border-top: 5px solid #ffffff;
  top: 2px;
}

.btn_up:hover {
  border-bottom: 5px solid #f89b39;
}

.btn_down:hover {
  border-top: 5px solid #f89b39;
}
.btn_down:hover {
  border-top: 5px solid #f89b39;
}

.drag_area {
  width: 6px;
  height: 30px;
  right: -3px;
  position: relative;
  z-index: 1;
  cursor: w-resize;
  display: inline-block;
}

.triangle_icon {
  display: inline-block;
  width: 12px;
  height: 25px;
  margin-right: 5px;
}
.list_header_filter {
  display: inline-block;
  width: 21px;
  height: 30px;
  left: 10px;
  position: absolute;
  cursor: pointer;
  background: url(../assets/images/sort_icon.png) no-repeat center center;
}
.filter-icon {
  position: absolute;
  right: 3px;
  top: 0;
  width: 20px;
  height: 30px;
}
</style>

<template>
  <div class="tab_container clearfix">
    <div class="list_header_item fl" :title="header.name" v-on:mouseup="mouseup($event, header)" :ref="'tab'+index" :class="{list_header_item_dragging:header.dragging, list_header_item_checked:header.checked}" v-for="(header,index) in headers" :key="header.name" v-on:mousedown.prevent="dragstart($event, header)" :style="{width: '100%', height: header.height + 'px'}">
      <span>{{header.name}}</span>
    </div>
    <div class="list_header_item dragging_item" :title="dragName" v-if="dragging" v-on:mouseup="mouseup($event, dragItem)" :style="{left: 0, top: y + 'px', width: '100%', height: dragItem.height + 'px'}">
      <span>{{dragName}}</span>
    </div>
  </div>
</template>

<script>
import * as util from '../../lib/util.js'
import $ from 'jquery'
export default {
  name: 'tab_ctrl',
  props: {
    headers: {
      type: Array,
      required: true
    },
    canDrag: Boolean
  },
  data () {
    return {
      dragItem: null,
      dragName: '',
      index: -1,
      targetHeight: 0,
      offsetY: 0,
      y: 0,
      lastY: 0,
      dragging: false,
      checkIndex: -1
    }
  },
  methods: {
    mouseup (event, header) {
      if (event.button !== 0) {
        return
      }
      if (!event.ctrlKey && !event.shiftKey) {
        this.headers.forEach(item => item.checked = false)
        header.checked = true
        this.checkIndex = this.headers.indexOf(header)
        // ctrl shilft都没按下  先清空选中的
      } else if (event.ctrlKey && !event.shiftKey) {
        // 按下ctrl  没按shilft   取消选中  选中未选中
        header.checked = !header.checked
        if (header.checked) {
          this.checkIndex = this.headers.indexOf(header)
        }
      } else if (event.ctrlKey && event.shiftKey) {
        let index = this.headers.indexOf(header)
        let start = Math.max(Math.min(this.checkIndex, index), 0)
        let end = Math.min(Math.max(this.checkIndex, index), this.headers.length - 1)
        for (let i = start; i <= end; i++) {
          let h = this.headers[i]
          h.checked = true
        }
      } else {
        // 只按下shilft
        this.headers.forEach(item => item.checked = false)
        let index = this.headers.indexOf(header)
        let start = Math.max(Math.min(this.checkIndex, index), 0)
        let end = Math.min(Math.max(this.checkIndex, index), this.headers.length - 1)
        for (let i = start; i <= end; i++) {
          let h = this.headers[i]
          h.checked = true
        }
      }
    },
    dragstart (event, header) {
      var ele = event.target.tagName === 'DIV' ? $(event.target) : $(event.target).parent()
      this.dragItem = header
      this.dragName = header.name
      header.dragging = true
      this.index = this.headers.indexOf(header)
      this.targetHeight = ele.height()
      var offset = ele.position()
      this.y = offset.top
      this.offsetY = (event.y - offset.top)
      this.dragging = true
      this.lastY = event.y
      window.addEventListener('mousemove', this.mousemove)
      window.addEventListener('mouseup', this.moveup)
    },
    mousemove (event) {
      var header
      var right = false
      var min = 0

      var y = Math.min(this.headers.reduce(
        (item1, item2) => {
          return {
            height: item1.height + item2.height
          }
        },
        {
          height: 0
        }).height + this.offsetY - this.dragItem.height, Math.max(event.y, 0))

      if (event.y > this.lastY) {
        // →  30 为缓冲距离
        this.y = Math.max(y - this.offsetY, min)
        header = util.getListHeader(this.y - min - 10 + this.targetHeight, this.headers, 'height')
        right = true
      } else {
        this.y = Math.max(y - this.offsetY, min)
        header = util.getListHeader(this.y - min + 10, this.headers, 'height')
        right = false
      }
      this.lastY = event.y
      if (header !== this.dragItem) {
        var index = this.headers.indexOf(header)
        if ((right && index < this.index) || (!right && index > this.index)) {
          return
        }
        if (index > this.index) {
          index -= 1
          this.index = index + 1
        } else {
          this.index = index
        }
        // 待替换为event _this.$emit('swapHeader',{item,index})
        this.headers.remove(this.dragItem)
        this.headers.splice(index, 0, this.dragItem)
      }
    },
    moveup () {
      this.dragging = false
      this.dragItem.name = this.dragName
      this.dragItem.dragging = false
      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.moveup)
    }
  },
  created () { }
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
</style>

<template>
  <div>
    <div :title="node.name" class="folder_container" :class="{folder_selected : node.checked}" v-on:dblclick="node.open=!node.open" :style="{paddingLeft:'12px'}" v-on:dragend.prevent="node.open=true" v-on:dragleave.prevent="node.open=true" v-on:dragover.prevent="node.open=true">
      <span class="triangle_icon" :class="node.open ? 'triangle_icon_down' : 'triangle_icon_right'" v-on:click.stop="node.open=!node.open"></span>
      <span :class="node.icon" class="folder_icon quicklink_icon"> </span>
      <span class="folder_name">{{node.name}}</span>
    </div>
    <div v-show="node.open">
      <div :data="n" :callback="callback" v-for="n in node.folders" :key="n.guid||n.name">
        <div :title="n.name" class="folder_container" :class="{folder_checked : n.selecting, folder_selected : n.checked, folder_hover : n.dragOvering}" v-on:click="click(n)" :style="{paddingLeft:12 * 2 + 'px'}" v-on:drop.prevent.stop="drop($event, n)" v-on:dragend.prevent="dragLeave($event, n)" v-on:dragleave.prevent="dragLeave($event, n)" v-on:dragover.prevent="dragOver($event, n)" @contextmenu.stop.prevent="contextMenu($event, n)">
          <span class="quick_icon" :class="{quick_icon_disabled: n.disabled}"> </span>
          <span class="folder_name">{{n.name}}</span>
          <span class="link_icon unding_icon" title="remove link" @click.stop.prevent="removelink(n)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import APPSETTING from '../config/appSetting.js'
export default {
  props: {
    data: Object,
    callback: Function
  },
  name: 'tree-ctrl3',
  methods: {
    removelink (node) {
      this.$store.dispatch({
        type: TYPES.DISPATCH_DELETE_DING,
        target: [node]
      })
    },
    checkData (data) {
      if (this.$store.getters.currentNode) {
        this.$store.getters.currentNode.selected = false
        this.$store.getters.currentNode.checked = false
      }
      this.lastSeletedNode.checked = false
      data.checked = true
      this.lastSeletedNode = data
    },
    click: function (data) {
      if (APPSETTING.USEROOTPATH) {
        util.locateFolder(
          this.$store, data.path.split('/'),
          {
            children: this.$store.getters.folderTree
          }, {
            linkNode: data,
            isShowWaiting: true,
            isSilent: true
          }).then(res => { })
      } else {
        return util.locateFolder(
          this.$store, data.path.split('/').slice(1),
          {
            children: this.$store.getters.folderTree
          },
          {
            linkNode: data,
            isShowWaiting: true,
            isSilent: true
          }).then(res => { })
      }
    },
    contextMenu: function (event, data) {
      this.$store.commit({
        type: TYPES.CLEAR_SELECTEEDITEMS
      })
      data.selecting = true
      this.$store.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: data
      })
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          event: event,
          status: true
        }
      })
    },
    dragOver: function (event, node) {
      // sethover effect
      node.dragOvering = true
      this.$store.state.dragOverCount++
      event.dataTransfer.effectAllowed = 'move'
      // event.dataTransfer.setDragImage(event.target, 0, 0);
    },
    dragLeave: function (event, node) {
      // clear hover effct
      node.dragOvering = false
    },
    drop: function (event, node) {
      node.dragOvering = false
      var arr = this.$store.state.selectedMaterials
      var proms
      if (APPSETTING.USEROOTPATH) {
        proms = util.locateFolder(
          this.$store, node.path.split('/'),
          {
            children: this.$store.getters.folderTree
          }, {
            linkNode: node,
            isShowWaiting: true,
            isSilent: true
          })
      } else {
        proms = util.locateFolder(
          this.$store, node.path.split('/').slice(1),
          {
            children: this.$store.getters.folderTree
          }, {
            linkNode: node,
            isShowWaiting: true,
            isSilent: true
          })
      }
      proms.then((res) => {
        if (event.dataTransfer.files.length > 0) {
          if (res.operations.indexOf('Upload') === -1) {
            util.Notice.warning('Can not upload clip to this folder', '', 3000)
            return
          }
          var files = event.dataTransfer.files
          this.$store.dispatch({
            type: TYPES.GET_MATERIALS,
            source: res
          }).then(res => {
            this.$store.dispatch({
              type: TYPES.UPLOAD_FILES,
              data: {
                files: files
              },
              source: res
            })
          })
        } else {
          if (event.ctrlKey) {
            if (res.operations.indexOf('Paste') === -1) {
              util.Notice.warning('Can not copy object to this folder', '', 3000)
              return
            }
            if (arr.some(item => item.operations.indexOf('Copy') === -1)) {
              util.Notice.warning('Some Objects can not be copied', '', 3000)
              return
            }
            util.Model.confirm('Copy', 'Are You Sure to Copy ' + arr.length + ' Materials',
              () => {
                this.$store.dispatch({
                  type: TYPES.COPY_MATERIALS,
                  data: arr,
                  target: res
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
            if (arr.some(item => item.operations.indexOf('Cut') === -1)) {
              util.Notice.warning('Some Objects can not be cutted', '', 3000)
              return
            }
            if (arr.some(item => item.father === res || item === res)) {
              return
            }
            if (res.operations.indexOf('Paste') === -1) {
              util.Notice.warning('Can not move object to this folder', '', 3000)
              return
            }
            util.Model.confirm('Move', 'Are You Sure to Move ' + arr.length + ' Materials',
              () => {
                this.$store.dispatch({
                  type: TYPES.MOVE_MATERIALS,
                  data: arr,
                  target: res
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
      }).catch(() => util.Notice.failed('This quick link is disabled', '', 3000))
    }
  },
  computed: {
    node () {
      return this.data
    },
    lastSeletedNode: {
      get () {
        return this.$store.state.lastSeletedNode
      },
      set (val) {
        this.$store.state.lastSeletedNode = val
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.folder_container .quick_icon {
  background: url(../assets/images/link_icon.png) no-repeat center center;
  height: 25px;
  width: 21px;
  float: left;
}

.folder_container .quick_icon_disabled {
  background: url(../assets/images/link_icon_disabled.png) no-repeat center
    center;
}
.folder_container .folder_name {
  display: inline-block;
  padding-left: 6px;
  white-space: pre;
}
.folder_container {
  min-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  background-color: #222;
  cursor: default;
  font-weight: normal;
  height: 30px;
  line-height: 30px;
  font-size: 15px;
  color: #cfd2d4;
  border: 1px solid #222;
}
.folder_container .unding_icon {
  background: url(../assets/images/unding.png) #393939 no-repeat center center;
}

.folder_container:hover .link_icon {
  display: inline-block;
}

.folder_selected {
  background: rgba(248, 155, 57, 0.3);
  color: #fff;
}

.folder_checked {
  background: #393939;
}
.folder_container span {
  cursor: pointer;
}
.folder_container .link_icon {
  display: none;
  width: 30px;
  height: 30px;
  position: absolute;
  right: 0;
}
.folder_container:hover {
  background-color: #393939;
  color: #fff;
}
</style>

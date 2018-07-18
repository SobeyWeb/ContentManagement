<template>
  <div class="fl" style="min-width: 100%">
    <div :title="node.name" class="folder_container" :class="{folder_checked : node.selecting, folder_selected : node.checked, folder_hover : dragOvering}" v-on:click="click" @touchstart="click" v-on:dblclick="dblclick" :style="{paddingLeft:12 * node.floor + 'px',width: '200px'}" @drop.prevent.stop="drop" @dragend.prevent="dragLeave" @dragleave.prevent="dragLeave" @dragover.prevent="dragOver" @contextmenu.stop.prevent="contextMenu">
      <span class="triangle_icon" :class="node.open ? 'triangle_icon_down' : 'triangle_icon_right'" v-on:click.stop="nodeToggle(node)" @touchstart.stop.prevent="nodeToggle(node)" :style="{opacity:[0,2,3].indexOf(node.guid)>-1?0:1}"></span>
      <span :class="node.icon" class="folder_icon"> </span>
      <span class="folder_name">{{node.name}}</span>
      <span class="link_icon ding_icon" title="link" @click.stop.prevent="addLink" v-if="node.operations.some(function(i){return i==='Add to Quick Link'})"></span>
    </div>
    <div v-show="node.open" v-if="[-1,0,2].indexOf(node.guid)<0">
      <folder-tree :data="n" v-for="n in sortFunc((node.searchModel||node.folders).slice(), 'title', true)" :key="n.guid">
      </folder-tree>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
export default {
  props: {
    data: Object
  },
  name: 'folder-tree',
  data: function () {
    return {
      intervalId: -1,
      dragOvering: false
    }
  },
  methods: {
    addLink () {
      if (this.$store.state.linkNodes[0].folders.some(item => item.guid === this.node.guid)) {
      } else {
        this.$store.dispatch({
          type: TYPES.DISPATCH_SET_DING,
          target: [this.node]
        })
      }
    },
    click: function () {
      if (this.node.guid === 1) {
        this.$store.dispatch({
          type: TYPES.REFRESH_MATERIAL,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      } else if (this.node.guid === 2) {
        this.$store.dispatch({
          type: TYPES.GET_SEARCHRESULT,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      } else if (this.node.guid === -1) {
        this.$store.dispatch({
          type: TYPES.GET_FAVORITERESULT,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      } else if (this.node.guid === 3) {
        this.$store.dispatch({
          type: TYPES.GET_ORDER_LIST,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      } else if (this.node.guid === 0) {
        this.$store.dispatch({
          type: TYPES.GET_TRASHCAN_OBJECTS,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      } else {
        // normal folder
        this.$store.dispatch({
          type: TYPES.GET_MATERIALS,
          source: this.node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: this.node,
            data: []
          })
        })
      }
    },
    dblclick: function (node) {
      if (this.node.guid === 1) {
        this.$store.dispatch({
          type: TYPES.TOGGLE_FOLDER,
          source: this.node
        })
      } else if (this.node.guid.length > 1) {
        this.$store.commit({
          type: TYPES.TOGGLE_FOLDER,
          target: this.node
        })
      }
    },
    nodeToggle: function (node) {
      this.$store.dispatch({
        type: TYPES.TOGGLE_FOLDER,
        source: this.node
      })
    },
    dragOver: function (event) {
      // sethover effect
      this.dragOvering = true
      this.$store.state.dragOverCount++ // for auto scroll
      event.dataTransfer.effectAllowed = 'move'
      // event.dataTransfer.setDragImage(event.target, 0, 0);
      if (!this.node.openned && this.intervalId === -1) {
        this.intervalId = setTimeout(() => {
          this.$store.dispatch({
            type: TYPES.EXPAND_FOLDER,
            source: this.node
          })
        }, 1000)
      }
    },
    dragLeave: function (event) {
      // clear hover effct
      clearTimeout(this.intervalId)
      this.intervalId = -1
      this.dragOvering = false
    },
    drop: function (event) {
      clearTimeout(this.intervalId)
      this.intervalId = -1
      this.dragOvering = false
      if (event.dataTransfer.files.length > 0) {
        if (this.node.operations.indexOf('Upload') === -1) {
          util.Notice.warning('Can not upload clip to this folder', '', 3000)
          return
        }
        var files = event.dataTransfer.files
        this.$store.dispatch({
          type: TYPES.GET_MATERIALS,
          source: this.node
        }).then(res => {
          this.$store.dispatch({
            type: TYPES.UPLOAD_FILES,
            data: {
              files: files
            },
            source: this.node
          })
        })
      } else if (this.node.guid === 0) { // 回收站
        var arr = this.$store.state.selectedMaterials.slice()
        if (arr.some(item => item.father === this.node)) {
          // util.Notice.warning('Warning', 'selected materials has in trashcan', 3000)
        } else if (arr.every(item => item.operations.indexOf('Delete') > -1)) {
          util.Model.confirm('Delete', 'Are you sure to delete ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.RECYCLE,
                target: arr
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
        } else if (arr.every(item => item.operations.indexOf('Delete') === -1)) {
          util.Notice.warning('Selected materials can not be deleted', '', 3000)
        } else {
          arr = arr.filter(item => item.operations.indexOf('Delete') > -1)
          util.Model.confirm('Delete', 'Some materials can not be deleted, are you sure to delete other ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.RECYCLE,
                target: arr
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
      } else {
        if (event.ctrlKey) {
          if (this.node.operations.indexOf('Paste') === -1) {
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
                target: this.node
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
          if (arr.some(item => item.father === this.node || item === this.node)) {
            return
          }
          if (this.node.operations.indexOf('Paste') === -1) {
            util.Notice.warning('Can not move object to this folder', '', 3000)
            return
          }
          util.Model.confirm('Move', 'Are You Sure to Move ' + arr.length + ' Materials',
            () => {
              this.$store.dispatch({
                type: TYPES.MOVE_MATERIALS,
                data: arr,
                target: this.node
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
    contextMenu (event) {
      this.$store.commit({
        type: TYPES.CLEAR_SELECTEEDITEMS
      })
      this.node.selecting = true
      this.$store.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: this.node
      })
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
    node () {
      // Special folder transfer
      return this.data
    },
    selectedNode () {
      return this.$store.state.currentNode
    },
    sortFunc () {
      return util.sortBy
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.folder_container span {
  cursor: pointer;
}
.folder_container .folder_icon {
  background: url(../assets/images/normal_folder.png) no-repeat center center;
  height: 25px;
  width: 21px;
  float: left;
}
.triangle_icon_down {
  background: url(../assets/images/arrow_down.png) no-repeat center center;
}
.triangle_icon_right {
  background: url(../assets/images/arrow_right.png) no-repeat center center;
}
.folder_container .today_icon {
  background: url(../assets/images/today.png) no-repeat center center;
}
.folder_container .this_week_icon {
  background: url(../assets/images/thisweek.png) no-repeat center center;
}
.folder_container .my_clip_icon {
  background: url(../assets/images/myclip.png) no-repeat center center;
}
.folder_container .node_icon {
  background: url(../assets/images/node_icon_selected.png) no-repeat center
    center;
}
.folder_container .transhcan_icon {
  background: url(../assets/images/trash_icon.png) no-repeat center center;
}
.folder_container .searchresult_icon {
  background: url(../assets/images/CM_search.png) no-repeat center center;
}
.folder_container .searchresult_template_icon {
  background: url(../assets/images/CM_search_template.png) no-repeat center
    center;
}
.folder_container .network_icon {
  background: url(../assets/images/network.png) no-repeat center center;
}
.folder_container span {
  cursor: pointer;
}
.triangle_icon {
  width: 12px;
  height: 25px;
  margin-right: 5px;
  float: left;
}
</style>

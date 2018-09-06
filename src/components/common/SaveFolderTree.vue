<template>
  <div class="fl tree_base">
    <div :title="node.name" class="folder_container" :class="{folder_selected : node.checked}" v-on:click="click" v-on:dblclick.prevent="dblclick" :style="{paddingLeft:12 * node.floor + 'px',width: '200px'}">
      <span class="triangle_icon" :class="node.open ? 'triangle_icon_down' : 'triangle_icon_right'" v-on:click.stop="nodeToggle(node)"></span>
      <span :class="node.icon" class="folder_icon"> </span>
      <span class="folder_name">{{node.name}}</span>
    </div>
    <div v-show="node.open">
      <save-folder-tree :data="n" :callback="callback" v-for="n in node.folders.filter(function(item){return [256, 292, 293, 294].indexOf(item.subtype)===-1&&item.path!=snspath}).sort(sortFunc)" :key="n.guid"></save-folder-tree>
    </div>
  </div>
</template>

<script>
import TYPES from '../../dicts/mutationTypes'
import appSetting from '../../config/appSetting'
export default {
  props: {
    data: Object,
    callback: Function
  },
  name: 'save-folder-tree',
  methods: {
    click: function () {
      if (this.node.floor > 1) {
        this.callback(this.node)
        this.lastSeletedNode.checked = false
        this.node.checked = true
        this.lastSeletedNode = this.node
      }
    },
    dblclick: function (node) {
      this.$store.dispatch({
        type: TYPES.GET_FOLDERS,
        source: this.node
      }).then(() => {
        this.$store.dispatch({
          type: TYPES.TOGGLE_FOLDER,
          source: this.node
        })
      })
    },
    nodeToggle: function (node) {
      this.$store.dispatch({
        type: TYPES.TOGGLE_FOLDER,
        source: this.node
      })
    }
  },
  computed: {
    snspath () {
      return appSetting.PreSNSPublishPath
    },
    lastSeletedNode: {
      get () {
        return this.$store.state.lastSeletedNode
      },
      set (val) {
        this.$store.state.lastSeletedNode = val
      }
    },
    node () {
      return this.data
    },
    selectedNode () {
      return this.$store.state.currentNode
    },
    sortFunc () {
      return window.SortLikeWin
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tree_base {
  min-width: 100%;
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
.folder_container span {
  cursor: pointer;
}
.folder_container .folder_icon {
  background: url(../../assets/images/normal_folder.png) no-repeat center center;
  height: 25px;
  width: 21px;
  float: left;
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
.folder_container:hover {
  background-color: #393939;
  color: #fff;
}
.folder_selected {
  background: rgba(248, 155, 57, 0.3);
  color: #fff;
}

.folder_checked {
  background: #393939;
}
.folder_container .folder_name {
  display: inline-block;
  padding-left: 6px;
  white-space: pre;
}
.folder_container .network_icon {
  background: url(../../assets/images/network.png) no-repeat center center;
}
.folder_selected .triangle_icon_down {
  background: url(../../assets/images/arrow_down2.png) no-repeat center center;
}

.folder_selected .triangle_icon_right {
  background: url(../../assets/images/arrow_right2.png) no-repeat center center;
}

.triangle_icon_down {
  background: url(../../assets/images/arrow_down.png) no-repeat center center;
}

.triangle_icon_right {
  background: url(../../assets/images/arrow_right.png) no-repeat center center;
}
</style>

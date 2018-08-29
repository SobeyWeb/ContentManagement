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
</style>

<template>
  <div class="fl tree_base">
    <div :title="node.name" class="folder_container" :class="{folder_selected : node.checked}" v-on:dblclick="node.open=!node.open" :style="{paddingLeft:'12px'}">
      <span class="triangle_icon" :class="node.open ? 'triangle_icon_down' : 'triangle_icon_right'" v-on:click.stop="node.open=!node.open"></span>
      <span :class="node.icon" class="folder_icon quicklink_icon"> </span>
      <span class="folder_name">{{node.name}}</span>
    </div>
    <div v-show="node.open">
      <div :data="n" :callback="callback" v-for="n in node.folders.filter(function(item){return item.path!=snspath&&!item.path.startsWith(oapath)})" :key="n.guid||n.name">
        <div :title="n.name" class="folder_container" :class="{folder_checked : n.selecting, folder_selected : n.checked}" v-on:click="click(n)" :style="{paddingLeft:12 * 2 + 'px'}">
          <span class="quick_icon" :class="{quick_icon_disabled: n.disabled}"> </span>
          <span class="folder_name">{{n.name}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import appSetting from '../../config/appSetting'
export default {
  props: {
    data: Object,
    callback: Function
  },
  name: 'save-quick-link',
  methods: {
    click (data) {
      this.callback(data)
      this.lastSeletedNode.checked = false
      data.checked = true
      this.lastSeletedNode = data
    }
  },
  computed: {
    snspath () {
      return appSetting.PreSNSPublishPath
    },
    oapath () {
      var path = this.$store.state.oaFolder[0].path
      if (path.endsWith('/')) {
        path = path.slice(0, -1)
      }
      return path
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tree_base {
  min-width: 100%;
}
.folder_container .quick_icon {
  background: url(../../assets/images/link_icon.png) no-repeat center center;
  height: 25px;
  width: 21px;
  float: left;
}

.folder_container .quick_icon_disabled {
  background: url(../../assets/images/link_icon_disabled.png) no-repeat center
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

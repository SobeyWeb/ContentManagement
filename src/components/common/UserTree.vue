<template>
  <div v-on:mousedown.stop.prevent>
    <div :title="data.deptname" v-if="data.deptname" class="folder_container dept_container" :class="{folder_selected : data.checked}" v-on:dblclick.stop="data.open =!data.open" @click.stop.prevent="folderClick(data)" :style="{paddingLeft:12 * data.floor + 'px'}">
      <span class="triangle_icon" :class="data.open ? 'triangle_icon_down' : 'triangle_icon_right'" v-on:click.stop="data.open =!data.open"></span>
      <span :class="data.icon" class="folder_icon dept_icon"> </span>
      <span class="folder_name">{{data.deptname}}</span>
    </div>
    <div v-show="data.open">
      <user-tree-ctrl :callback="callback" :data="i" v-for="i in data.childdept" :multiplable="multiplable" v-show="!search||deepSearch(i,search)" :search="search" :key="i.deptid" :default-value="defaultValue"></user-tree-ctrl>
      <div v-show="!search||(n.nickname||n.loginname.replace(/.*\\(.*)/g, '$1')).toLowerCase().indexOf(search.toLowerCase())>-1" v-for="n in data.userlist" :key="n.id||n.id" :title="n.nickname||n.loginname.replace(/.*\\(.*)/g, '$1')" class="folder_container" :class="{folder_selected : n.checked}" v-on:click.stop="click(n)" :style="{paddingLeft:12 * n.floor + 'px'}">
        <span class="user_icon" :class="n.icon"> </span>
        <span class="folder_name user_name" v-html="(n.nickname||n.loginname.replace(/.*\\(.*)/g, '$1')).replace(new RegExp(search.replace(/[\\\|\&\^\*\+\?\$\[\]\(\)\{\}]/g, '\\$&'), 'i'), search?'<mark>$&</mark>':search)"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    callback: Function,
    multiplable: Boolean,
    search: String,
    defaultValue: Array
  },
  name: 'user-tree-ctrl',
  methods: {
    folderClick (data) {
      if (data.icon === 'team') {
        if (this.multiplable) {
          data.checked = !data.checked
        } else {
          // this.lastSeletedNode.checked = false
          data.checked = true
          // this.lastSeletedNode = data
        }
        this.callback(data)
      }
    },
    click (data) {
      if (this.multiplable) {
        data.checked = !data.checked
      } else {
        // this.lastSeletedNode.checked = false
        data.checked = true
        // this.lastSeletedNode = data
      }
      this.callback(data)
    },
    deepSearch (dept, key) {
      if (dept.userlist && dept.userlist.some(item => (item.nickname || item.loginname.replace(/.*\\(.*)/g, '$1')).toLowerCase().indexOf(key.toLowerCase()) > -1)) {
        return true
      }
      if (dept.childdept && dept.childdept.some(item => this.deepSearch(item, key))) {
        return true
      }
      return false
    }
  },
  computed: {
    lastSeletedNode: {
      get () {
        return this.$store.state.lastSeletedNode
      },
      set (val) {
        this.$store.state.lastSeletedNode = val
      }
    }
  },
  watch: {
    'search': function (value) {
      if (value) {
        this.data.open = true
      } else {
        this.data.open = false
      }
    },
    defaultValue (v) {
      v && v.forEach(item => {
        this.data.userlist && this.data.userlist.forEach(i => {
          if (i.id === item.id) {
            i.checked = true
            this.callback(i)
          }
        })
        this.data.childdept && this.data.childdept.forEach(i => {
          if (i.icon === 'team' && i.id === item.id) {
            i.checked = true
            this.callback(i)
          }
        })
      })
    }
  },
  mounted () { },
  created () {
    this.defaultValue && this.defaultValue.forEach(item => {
      this.data.userlist && this.data.userlist.forEach(i => {
        if (i.id === item.id) {
          i.checked = true
          this.callback(i)
        }
      })
    })
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

.user_icon {
  background: url(../../assets/images/user.png) no-repeat;
  width: 21px;
  height: 21px;
  display: inline-block;
  vertical-align: middle;
}

.folder_container .user_name {
  padding-left: 0px;
}

.folder_container:hover {
  background-color: #393939;
  color: #fff;
}
.folder_container.folder_hover {
  border: 1px solid rgba(149, 149, 149, 0.5);
  color: #000;
}

.folder_container span {
  cursor: pointer;
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
.triangle_icon {
  width: 12px;
  height: 25px;
  margin-right: 5px;
  float: left;
}

.folder_container .dept_icon {
  background: url(../../assets/images/group_user.png) no-repeat center center;
  height: 25px;
  width: 21px;
  float: left;
}
.folder_container .folder {
  margin-top: 5px;
  background: url(../../assets/images/normal_folder.png) no-repeat center;
  width: 18px;
  height: 17px;
  float: left;
}
.folder_container .folder_name {
  display: inline-block;
  padding-left: 6px;
  white-space: pre;
}
</style>

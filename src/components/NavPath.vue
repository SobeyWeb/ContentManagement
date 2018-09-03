<template>
  <div class="history_container">
    <span class="backup_icon" v-on:click="backUp"></span>
    <ul class="history_item_container">
      <li class="history_item" v-on:click="click(path)" v-for="path in navPath" :key="path.path">
        <a :title="path.name">{{path.name}}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import appSetting from '../config/appSetting.js'

export default {
  computed: {
    navPath () {
      return this.$store.state.navPath
    }
  },
  methods: {
    click: function (node) {
      if (node.guid === 1) {
        this.$store.commit({
          type: TYPES.GET_NAVPATH,
          target: node,
          data: []
        })
      } else if (node.guid === 2) {
        this.$store.dispatch({
          type: TYPES.GET_SEARCHRESULT,
          source: node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: node,
            data: []
          })
        })
      } else if (node.guid === -1) {
        this.$store.dispatch({
          type: TYPES.GET_FAVORITERESULT,
          source: node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: node,
            data: []
          })
        })
      } else {
        // normal folder
        this.$store.dispatch({
          type: TYPES.GET_MATERIALS,
          source: node
        }).then(() => {
          this.$store.commit({
            type: TYPES.GET_NAVPATH,
            target: node,
            data: []
          })
        })
      }
    },
    backUp: function () {
      var last = this.navPath[Math.max(0, this.navPath.length - 2)]
      if (appSetting.USEROOTPATH) {
        util.locateFolder(this.$store, last.path.split('/'),
          {
            children: this.$store.getters.folderTree
          }, {
            alwaysGet: this.$store.state.alwaysGet,
            isShowWaiting: true
          })
      } else {
        util.locateFolder(this.$store, last.path.split('/').slice(1),
          {
            children: this.$store.getters.folderTree
          }, {
            alwaysGet: this.$store.state.alwaysGet,
            isShowWaiting: true
          })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.history_container {
  color: #636363;
  height: 40px;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  font-size: 13px;
}
.backup_icon {
  background-image: url(../assets/images/arrow_left.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 9px 13px;
  width: 27px;
  height: 27px;
  margin-left: 12px;
  margin-top: 5px;
}
.history_item,
.history_item_container,
.history_container,
.backup_icon {
  display: inline-block;
}
.history_item_container {
  position: absolute;
  overflow: hidden;
  max-width: 100%;
}
.history_item {
  font-size: 14px;
  color: #c0c0c0;
  height: 27px;
  line-height: 27px;
}
.history_item a {
  display: inline-block;
  padding: 0px 5px;
}
.history_item_container > li + li:before {
  /* content: url(/images/arrow1_right.png); */
  content: '/';
  padding: 10px 5px;
  color: #c0c0c0;
}
.history_item a:hover {
  color: #c0c0c0;
  background: #444;
  border-radius: 3px;
}
</style>

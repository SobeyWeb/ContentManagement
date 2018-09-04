<template id="regiterOaFolder">
  <div id="registerFolderDiv" class="rigisterDiv">
    <span class="folderParthText">Folder</span>
    <input type="text" class="registerFolderParth" v-model="registerViewPath" readonly="readonly">
    <ul id="registerSelectPathDiv">
      <vue-nice-scrollbar class="folder_box" :speed="150" style="height: 100%;">
        <div id="registerSelectPath" class="treeview">
          <save-folder-tree :key="node.path" :data="node" v-for="node in nodes" :callback="callback"></save-folder-tree>
        </div>
      </vue-nice-scrollbar>
    </ul>
  </div>
</template>

<script>
import * as util from '../../lib/util.js'
import SaveFolderTree from '../common/SaveFolderTree.vue'
export default {
  name: 'regiterOaFolder',
  props: {
  },
  methods: {
    callback (data) {
      let path = [data].concat(util.getAllFather(data)).filter(item => item.subtype === 64).map(item => item.name).reverse().join('/')
      this.$store.state.registerdata.registerViewPath = data.path.slice(data.path.indexOf('OA Material')).replace(/\//g, ' / ')
      this.$store.state.registerdata.registerPath = path
      this.$store.state.registerdata.oaFolderMosid = data.mosid
      function getMosid (data) {
        if (data.father.mosid) {
          this.$store.state.registerdata.oaFolderMosid = data.father.mosid
        } else {
          getMosid(data.father)
        }
      }
      if (!this.$store.state.registerdata.oaFolderMosid) {
        getMosid(data)
      }
    }
  },
  computed: {
    nodes () {
      return this.$store.state.oaFolder
    },
    registerViewPath () {
      return this.$store.state.registerdata.registerViewPath
    }
  },
  components: {
    'save-folder-tree': SaveFolderTree
  }
}
</script>

<style>
</style>

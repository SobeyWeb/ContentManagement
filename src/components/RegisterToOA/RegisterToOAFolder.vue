<template id="regiterOaFolder">
  <div id="registerFolderDiv" class="rigisterDiv">
    <span class="folderParthText">Folder</span>
    <input type="text" class="registerFolderParth" v-model="data.registerViewPath" readonly="readonly">
    <ul id="registerSelectPathDiv">
      <vue-nice-scrollbar class="folder_box" :speed="150" style="height: 100%;">
        <div id="registerSelectPath" class="treeview">
          <tree-ctrl2 :key="node.path" :data="node" v-for="node in nodes" :callback="callback"></tree-ctrl2>
        </div>
      </vue-nice-scrollbar>
    </ul>
  </div>
</template>

<script>
import * as util from '../../lib/util.js'
export default {
  name: 'regiterOaFolder',
  props: {
    data: Object
  },
  methods: {
    callback (data) {
      let path = [data].concat(util.getAllFather(data)).filter(item => item.subtype === 64).map(item => item.name).reverse().join('/')
      this.data.registerViewPath = data.path.slice(data.path.indexOf('OA Material')).replace(/\//g, ' / ')
      this.data.registerPath = path
      this.data.oaFolderMosid = data.mosid
      function getMosid (data) {
        if (data.father.mosid) {
          this.data.oaFolderMosid = data.father.mosid
        } else {
          getMosid(data.father)
        }
      }
      if (!this.data.oaFolderMosid) {
        getMosid(data)
      }
    }
  },
  computed: {
    nodes () {
      return this.$store.state.oaFolder
    }
  },
  components: {}
}
</script>

<style scoped>
</style>

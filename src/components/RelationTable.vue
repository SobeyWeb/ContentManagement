<template>
  <div class="relation_container">
    <div class="relation_top">Current Material: {{source.name}}</div>
    <el-table fit stripe border size="mini" empty-text="No relations" ref="relationsTable" :data="data" @row-click="expandRelation" @row-dblclick="locateMaterial" @expand-change="expandRelation">
      <el-table-column align="center" type="expand">
        <template slot-scope="scope">
          <relation-table v-if="scope.row.relations" :data="scope.row.relations" :source="scope.row">
          </relation-table>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip align="center" type="index"></el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="Title" prop="name"></el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="ID" prop="guid">
      </el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="Path" prop="folderpath">
        <template slot-scope="scope">
          {{scope.row.folderpath.replace('global_sobey_defaultclass/MaterialList/', 'Network/')}}
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="In" prop="trimin"></el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="Out" prop="trimout"></el-table-column>
      <el-table-column show-overflow-tooltip align="center" label="Last Update Time" prop="modificationDate"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
import APPSETTING from '../config/appSetting.js'
export default {
  name: 'RelationTable',
  props: {
    dept: String,
    data: Array,
    source: Object
  },
  data () {
    return {
    }
  },
  methods: {
    expandRelation (row) {
      // this.$refs.relationsTable.toggleRowExpansion(row)
      !row.relations.length && this.$store.dispatch(TYPES.GET_GENERATION, {
        dept: this.dept,
        source: row
      }).then(res => {
        row.relations = util.getRelations(res.data.ext.map(item => item.entityinfo))
      })
    },
    locateMaterial: function (material) {
      this.$store.state.relationsWindow.hide()
      var pathList
      if (APPSETTING.USEROOTPATH) {
        pathList = material.folderpath.split('/')
      } else {
        pathList = material.folderpath.split('/').slice(1)
      }
      util.locateFolder(this.$store, pathList, {
        children: this.$store.getters.folderTree
      }, {
          materialGuids: [material.guid],
          isPreview: true,
          isShowWaiting: true
        })
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.relation_top {
  line-height: 30px;
  background: #ab916a;
  color: #fff;
  padding: 0 5px;
}
</style>

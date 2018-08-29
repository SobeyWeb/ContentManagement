<template>
  <div class="export_container" @selectstart.stop.prevent>
    <div class="table_header">
      <div class="fl header_item exportSite">
        Export Site
      </div>
      <div class="fl header_item filePath">
        File Path
      </div>
      <div class="fl header_item onlyAudio">
        Export Content
      </div>
      <div class="fl header_item template">
        Template
      </div>
    </div>
    <div class="table_content">
      <vue-nice-scrollbar style="height:250px;" v-if="siteList.length" :speed="150">
        <div>
          <div class="content_item" v-for="i in siteList" :key="i.TEMPLATEID">
            <div class="fl conent_colunm exportSite">
              <label :title="i.SITENAME">
                <input type="checkbox" v-model="i.checked" :disabled="(i.ISAUDIOONLY == '0' && onlyAudio)" />{{i.SITENAME}}</label>
            </div>
            <div class="fl conent_colunm filePath" :title="i.HOTFOLDER">
              {{i.HOTFOLDER}}
            </div>
            <div class="fl conent_colunm onlyAudio" :title="i.ISAUDIOONLY=='0'?'NO':'YES'">
              {{i.ISAUDIOONLY=='0'?'Video and Audio':i.ISAUDIOONLY=='1'?'Only Audio':'Only Metadata'}}
            </div>
            <div class="fl conent_colunm template" :title="i.TEMPLATEID">
              {{i.TEMPLATEID}}
            </div>
          </div>
        </div>
      </vue-nice-scrollbar>
    </div>
    <div class="input_area">
      <div class="rename_area">
        <span class="item">Rename</span>
        <input type="text" class="rename_input" @blur.stop.prevent="rename" :value="exportInfo.isUseDefault?'':exportInfo.taskName" @keyup="volidInput" :disabled="exportInfo.isUseDefault" />
        <label>
          <input type="checkbox" v-model="exportInfo.isUseDefault" />Use system setting</label>
      </div>
      <div class="comments_area">
        <span class="comment_span">Comments</span>
        <textarea class="comment_textarea" v-model="exportInfo.comments" @keyup="volidCommnets"></textarea>
      </div>
    </div>
    <div class="mp-foot header_filter_foot">
      <button class="mp-btn cancel" @click="close">Cancel</button>
      <button class="mp-btn ok" :disabled="!exportInfo.taskName&&!exportInfo.isUseDefault" @click="confirm">Confirm</button>
    </div>
  </div>
</template>

<script>
import { volidInput, Notice } from '../lib/util'
import TYPES from '../dicts/mutationTypes'
export default {
  name: 'export_ctrl',
  methods: {
    volidInput (event) {
      this.exportInfo.taskName = volidInput(event.target.value, 255, event.target, false, 'Task Name')
    },
    volidCommnets (event) {
      this.exportInfo.comments = volidInput(event.target.value, 1000, event.target, true, 'Comments')
    },
    rename (event) {
      this.exportInfo.taskName = event.target.value
    },
    close () {
      this.ele.hide()
    },
    confirm () {
      this.data.forEach(item => {
        this.siteList.filter(item => item.checked).forEach(i => {
          if ((i.ISAUDIOONLY === '0') && item.isAudio) { // audio 不导出到视频站点
          } else {
            this.$store.dispatch({
              type: TYPES.SAVE_TASK,
              data: {
                clipname: item.name,
                siteid: i.SITEID,
                clipguid: item.guid,
                comment: this.exportInfo.comments,
                taskname: this.exportInfo.isUseDefault ? '' : this.exportInfo.taskName,
                hotfolder: i.HOTFOLDER,
                logicpath: i.LOGICPATH,
                trimin: this.exportInfo.TRIMIN,
                trimout: this.exportInfo.TRIMOUT,
                channel: (item.isAudio || i.ISAUDIOONLY === 1) ? item.CHANNEL4AUDIO : item.CHANNEL,
                taskcondition: `<COMMONGWDATA><CONDITION><INPOINT>${this.exportInfo.TRIMIN}</INPOINT><OUTPOINT>${this.exportInfo.TRIMOUT}</OUTPOINT><CLIPCHANNEL>${(item.isAudio || i.ISAUDIOONLY === 1) ? item.CHANNEL4AUDIO : item.CHANNEL}</CLIPCHANNEL><EXPAND/></CONDITION></COMMONGWDATA>`
              }
            }).then(res => {
              Notice.success(item.name + ' export success', '', 1000)
            }).catch(res => {
              Notice.warning(item.name + ' failed to export', '', 1000)
            })
          }
        })
      })
      this.ele.hide()
    }
  },
  computed: {
    exportInfo () {
      return this.$store.state.exportInfo
    },
    siteList () {
      return this.$store.state.siteList
    },
    onlyAudio () {
      return this.$store.state.exportMaterials.every(item => item.isAudio)
    },
    ele () {
      return this.$store.state.exportWindow
    },
    data () {
      return this.$store.state.exportMaterials
    }
  },
  mounted () { }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.export_container {
  width: 700px;
  height: 440px;
  background: #222;
  padding: 0 10px;
}

.export_container .table_header {
  height: 30px;
  font-size: 13px;
}

.export_container .header_item {
  line-height: 30px;
}

.export_container .table_content {
  height: 250px;
}

.export_container .content_item {
  overflow: hidden;
  margin: 5px 0;
}

.export_container .conent_colunm {
  margin-right: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.export_container .item {
  margin-right: 5px;
  vertical-align: middle;
  cursor: default;
}

.export_container .rename_input {
  background-color: #1b1b1b;
  padding: 0.3125rem;
  border: 1px transparent solid;
  color: #cfd2d4;
}

.export_container .comment_span {
  display: block;
  cursor: default;
  margin: 5px 0px;
}

.export_container .comment_textarea {
  height: 50px;
  width: 100%;
  color: #cfd2d4;
  padding: 6px;
  margin-bottom: 5px;
  border: 1px solid #101010;
  background-color: #000;
  border-radius: 2px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  resize: none;
  font-family: inherit;
}

.export_container .exportSite {
  width: 250px;
}

.export_container .filePath {
  width: 270px;
}

.export_container .onlyAudio {
  width: 100px;
}

.export_container .template {
  width: 60px;
}
</style>

<template>
  <div>
    <div class="player-top">
      <div class="title_container fl">
        <span class="dv_icon" :class="{dv_in_icon: isDvModel}" v-show="(curMaterial.father&&curMaterial.father.guid||isPremiere)&&!fullscreenSymbol" title="Detail View" @click="isDvModel=!isDvModel"></span>
        <span :title="curMaterial.name" class="player_name_span" @click="findClip(curMaterial)">{{curMaterial.name}}</span>
      </div>
    </div>
    <div class="document_container" @mousewheel.stop.prevent="mousewheel" :style="{height:computedHeight+'px'}">
      <span class="player_icon prev_item" title="Previous" @click="prev" v-show="options.source.length>1&&curIndex"></span>
      <span class="player_icon next_item" title="Next" @click="next" v-show="options.source.length>1&&curIndex<options.source.length-1"></span>
      <iframe @contextmenu.stop.prevent @mousewheel.stop v-show="s.index===curIndex" v-for="s in options.source" :key="s.index" :src="previewUrl+encodeURIComponent(s.src)" :style="{height:computedHeight+'px',width:'100%'}"></iframe>
    </div>
    <div class="player-bottom">
      <div class="controls_container fl">
      </div>
      <div class="index_total_container">
        <span>{{curIndex+1}}</span>
        <span>/</span>
        <span>{{options.source.length}}</span>
      </div>
      <div class="controls_container fr">
        <span class="player_icon"></span>
        <span class="player_icon fullscreen_icon fr" @click="enterFullscreen" v-if="!fullscreenSymbol"></span>
        <span class="player_icon exitFullscreen_icon fr" @click="exitFullscreen" v-else></span>
      </div>
    </div>
  </div>
</template>

<script>
import appSetting from '../../../config/appSetting'
import * as util from '../../../lib/util'
import urlConfig from '../../../config/urlConfig'
export default {
  template: '#document_ctrl',
  name: 'document_ctrl',
  props: {
    options: {
      type: Object,
      required: true
    },
    height: Number
  },
  data () {
    return {
      curIndex: 0,
      alwaysNew: true,
      computedHeight: 360,
      editing: false
    }
  },
  components: {
  },
  watch: {
    curSource () {
      this.alwaysNew = false
      this.$nextTick(() => {
        this.alwaysNew = true
      })
    },
    fullscreenSymbol: function (value) {
      this.calcHeight()
    }
  },
  mounted () {
    document.addEventListener('webkitfullscreenchange', this.calcHeight)
  },
  computed: {
    previewUrl () {
      return urlConfig.PROXY + '/static/web/viewer.html?file='
    },
    isPremiere () {
      return this.$store.state.system !== 'WEBCM'
    },
    isDvModel: {
      get () {
        this.calcHeight()
        return this.$store.state.detailviewSymbol
      },
      set (val) {
        this.$store.state.detailviewSymbol = val
      }
    },
    curMaterial () {
      return this.options.materials.find(item => item.guid === this.curSource.guid) || this.options.materials[0] || {}
    },
    curSource: {
      get () {
        return this.options.source[this.curIndex] || {}
      },
      set () { }
    },
    length () {
      return this.options.source.length
    },
    fullscreenSymbol () {
      return this.$store.state.fullscreenSymbol
    }
  },
  methods: {
    findClip (material) {
      var pathList = material.father.guid ? material.folderpath : material.father.path
      if (appSetting.USEROOTPATH) {
        pathList = pathList.split('/')
      } else {
        pathList = pathList.split('/').slice(1)
      }
      util.locateFolder(this.$store, pathList,
        {
          children: this.$store.getters.folderTree
        }, {
          materialGuids: [material.guid],
          isPreview: false,
          isShowWaiting: true
        })
    },
    mousewheel () {
      if (event.deltaY < 0) {
        this.prev()
      } else {
        this.next()
      }
    },
    dispose () { },
    changeEditing (status) {
      this.editing = status
    },
    calcHeight () {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.fullscreenSymbol) {
            this.computedHeight = document.body.clientHeight - 85
          } else {
            this.computedHeight = this.isDvModel ? document.body.clientHeight - 85 : 360
          }
        }, 0)
      })
    },
    enterFullscreen () {
      document.querySelector('.auto_center').appendChild(this.$el)
      this.$store.state.fullscreenSymbol = true
    },
    exitFullscreen () {
      document.querySelector('.player_box').appendChild(this.$el)
      this.$store.state.fullscreenSymbol = false
    },
    changeIndex (index) {
      this.curIndex = index
    },
    prev () {
      if (this.curIndex) {
        this.curIndex = Math.max(0, --this.curIndex)
        this.$emit('change', this.curIndex)
      }
    },
    next () {
      if (this.options.source.length && this.curIndex < this.options.source.length - 1) {
        this.curIndex = Math.min(this.options.source.length - 1, ++this.curIndex)
        this.$emit('change', this.curIndex)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

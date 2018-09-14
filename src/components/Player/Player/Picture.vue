<template>
  <div>
    <div class="player-top">
      <div class="title_container fl">
        <span class="dv_icon" :class="{dv_in_icon: isDvModel}" v-show="(curMaterial.father&&curMaterial.father.guid||isPremiere)&&!fullscreenSymbol" title="Detail View" @click="isDvModel=!isDvModel"></span>
        <span :title="curMaterial.name" class="player_name_span" @click="findClip(curMaterial)">{{curMaterial.name}}</span>
      </div>
    </div>
    <div class="picture_container" :style="{height:computedHeight+'px'}" @mousewheel.stop.prevent="mousewheel" @contextmenu.stop.prevent>
      <span class="player_icon prev_item" title="Previous" @click="prev" v-show="options.source.length>1&&curIndex"></span>
      <span class="player_icon next_item" title="Next" @click="next" v-show="options.source.length>1&&curIndex<options.source.length-1"></span>
      <img class="picture-item" v-show="s.index===curIndex" v-for="s in options.source" :key="s.src" :src="s.src" v-preview="s.src" draggable="false" onerror="this.src=\'./images/cannotpreview.png\'" />
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
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
import appSetting from '../../../config/appSetting'
import * as util from '../../../lib/util'

export default {
  name: 'picture_ctrl',
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
      editing: false
    }
  },
  components: {
  },
  computed: {
    isPremiere () {
      return this.$store.state.system !== 'WEBCM'
    },
    isDvModel: {
      get () {
        return this.$store.state.detailviewSymbol
      },
      set (val) {
        this.$store.state.detailviewSymbol = val
      }
    },
    computedHeight () {
      return this.isDvModel ? document.body.clientHeight - 85 : 360
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
